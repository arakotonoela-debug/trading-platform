import express, { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError, Account, AccountStatus } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { PROP_FIRMS, ACCOUNT_STATUS } from '../utils/constants';

const router: Router = express.Router();

// Mock database for MVP
const accounts: Map<string, Account> = new Map();

/**
 * POST /api/accounts
 * Create a new trading account
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name, propFirm, balance } = req.body;

  if (!name || !propFirm || !balance) {
    throw new AppError(400, 'Champs requis manquants', 'MISSING_FIELDS');
  }

  if (!Object.keys(PROP_FIRMS).includes(propFirm)) {
    throw new AppError(400, 'Prop firm invalide', 'INVALID_PROP_FIRM');
  }

  if (balance < 1000) {
    throw new AppError(400, 'Le solde minimum est 1000€', 'INVALID_BALANCE');
  }

  const account: Account = {
    id: uuidv4(),
    userId: req.user!.id,
    name,
    balance,
    equity: balance,
    margin: 0,
    freeMargin: balance,
    status: ACCOUNT_STATUS.EVALUATION as AccountStatus,
    propFirm: propFirm as any,
    maxDrawdown: PROP_FIRMS[propFirm as keyof typeof PROP_FIRMS].maxDrawdown,
    dailyLossLimit: PROP_FIRMS[propFirm as keyof typeof PROP_FIRMS].dailyLossLimit,
    profitSplit: PROP_FIRMS[propFirm as keyof typeof PROP_FIRMS].profitSplit,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  accounts.set(account.id, account);

  logger.info({
    action: 'ACCOUNT_CREATED',
    userId: req.user!.id,
    accountId: account.id,
    propFirm
  });

  res.status(201).json({
    success: true,
    data: account,
    message: 'Compte créé avec succès'
  });
}));

/**
 * GET /api/accounts
 * Get all accounts for the current user
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const userAccounts = Array.from(accounts.values())
    .filter(acc => acc.userId === req.user!.id);

  res.json({
    success: true,
    data: userAccounts,
    total: userAccounts.length
  });
}));

/**
 * GET /api/accounts/:id
 * Get account details
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const account = accounts.get(req.params.id);

  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  if (account.userId !== req.user!.id) {
    throw new AppError(403, 'Accès refusé', 'FORBIDDEN');
  }

  res.json({
    success: true,
    data: account
  });
}));

/**
 * PUT /api/accounts/:id
 * Update account
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const account = accounts.get(req.params.id);

  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  if (account.userId !== req.user!.id) {
    throw new AppError(403, 'Accès refusé', 'FORBIDDEN');
  }

  const { name, status } = req.body;

  if (name) {
    account.name = name;
  }

  if (status && Object.values(ACCOUNT_STATUS).includes(status)) {
    account.status = status as AccountStatus;
  }

  account.updatedAt = new Date();
  accounts.set(account.id, account);

  logger.info({
    action: 'ACCOUNT_UPDATED',
    userId: req.user!.id,
    accountId: account.id
  });

  res.json({
    success: true,
    data: account,
    message: 'Compte mis à jour'
  });
}));

/**
 * DELETE /api/accounts/:id
 * Delete account
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const account = accounts.get(req.params.id);

  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  if (account.userId !== req.user!.id) {
    throw new AppError(403, 'Accès refusé', 'FORBIDDEN');
  }

  accounts.delete(req.params.id);

  logger.info({
    action: 'ACCOUNT_DELETED',
    userId: req.user!.id,
    accountId: account.id
  });

  res.json({
    success: true,
    message: 'Compte supprimé'
  });
}));

/**
 * POST /api/accounts/:id/verify
 * Verify account (mark as verified)
 */
router.post('/:id/verify', authenticate, asyncHandler(async (req, res) => {
  const account = accounts.get(req.params.id);

  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  if (account.userId !== req.user!.id) {
    throw new AppError(403, 'Accès refusé', 'FORBIDDEN');
  }

  account.status = ACCOUNT_STATUS.VERIFIED as AccountStatus;
  account.updatedAt = new Date();
  accounts.set(account.id, account);

  logger.info({
    action: 'ACCOUNT_VERIFIED',
    userId: req.user!.id,
    accountId: account.id
  });

  res.json({
    success: true,
    data: account,
    message: 'Compte vérifié'
  });
}));

/**
 * POST /api/accounts/:id/start-trading
 * Start trading on account
 */
router.post('/:id/start-trading', authenticate, asyncHandler(async (req, res) => {
  const account = accounts.get(req.params.id);

  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  if (account.userId !== req.user!.id) {
    throw new AppError(403, 'Accès refusé', 'FORBIDDEN');
  }

  if (account.status !== ACCOUNT_STATUS.VERIFIED) {
    throw new AppError(400, 'Le compte doit être vérifié', 'ACCOUNT_NOT_VERIFIED');
  }

  account.status = ACCOUNT_STATUS.TRADING as AccountStatus;
  account.updatedAt = new Date();
  accounts.set(account.id, account);

  logger.info({
    action: 'TRADING_STARTED',
    userId: req.user!.id,
    accountId: account.id
  });

  res.json({
    success: true,
    data: account,
    message: 'Trading démarré'
  });
}));

export default router;
