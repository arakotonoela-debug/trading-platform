import express, { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError, Strategy } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { STRATEGY_TYPES, STRATEGY_PARAMS } from '../utils/constants';

const router: Router = express.Router();

// Mock database for MVP
const strategies: Map<string, Strategy> = new Map();

/**
 * POST /api/strategies
 * Create a new strategy configuration
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { accountId, type, enabled, parameters } = req.body;

  if (!accountId || !type) {
    throw new AppError(400, 'Champs requis manquants', 'MISSING_FIELDS');
  }

  if (!Object.values(STRATEGY_TYPES).includes(type)) {
    throw new AppError(400, 'Type de stratégie invalide', 'INVALID_STRATEGY_TYPE');
  }

  // Use default parameters if not provided
  const defaultParams = STRATEGY_PARAMS[type as keyof typeof STRATEGY_PARAMS] || {};
  const finalParameters = { ...defaultParams, ...parameters };

  const strategy: Strategy = {
    id: uuidv4(),
    accountId,
    type: type as any,
    enabled: enabled !== false,
    parameters: finalParameters,
    performance: {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  strategies.set(strategy.id, strategy);

  logger.info({
    action: 'STRATEGY_CREATED',
    userId: req.user!.id,
    strategyId: strategy.id,
    type
  });

  res.status(201).json({
    success: true,
    data: strategy,
    message: 'Stratégie créée'
  });
}));

/**
 * GET /api/strategies
 * Get strategies for an account
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { accountId } = req.query;

  let accountStrategies = Array.from(strategies.values());

  if (accountId) {
    accountStrategies = accountStrategies.filter(s => s.accountId === accountId);
  }

  res.json({
    success: true,
    data: accountStrategies,
    total: accountStrategies.length
  });
}));

/**
 * GET /api/strategies/:id
 * Get strategy details
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const strategy = strategies.get(req.params.id);

  if (!strategy) {
    throw new AppError(404, 'Stratégie non trouvée', 'STRATEGY_NOT_FOUND');
  }

  res.json({
    success: true,
    data: strategy
  });
}));

/**
 * PUT /api/strategies/:id
 * Update strategy
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const strategy = strategies.get(req.params.id);

  if (!strategy) {
    throw new AppError(404, 'Stratégie non trouvée', 'STRATEGY_NOT_FOUND');
  }

  const { enabled, parameters } = req.body;

  if (enabled !== undefined) {
    strategy.enabled = enabled;
  }

  if (parameters) {
    strategy.parameters = { ...strategy.parameters, ...parameters };
  }

  strategy.updatedAt = new Date();
  strategies.set(strategy.id, strategy);

  logger.info({
    action: 'STRATEGY_UPDATED',
    userId: req.user!.id,
    strategyId: strategy.id
  });

  res.json({
    success: true,
    data: strategy,
    message: 'Stratégie mise à jour'
  });
}));

/**
 * POST /api/strategies/:id/enable
 * Enable strategy
 */
router.post('/:id/enable', authenticate, asyncHandler(async (req, res) => {
  const strategy = strategies.get(req.params.id);

  if (!strategy) {
    throw new AppError(404, 'Stratégie non trouvée', 'STRATEGY_NOT_FOUND');
  }

  strategy.enabled = true;
  strategy.updatedAt = new Date();
  strategies.set(strategy.id, strategy);

  logger.info({
    action: 'STRATEGY_ENABLED',
    userId: req.user!.id,
    strategyId: strategy.id
  });

  res.json({
    success: true,
    data: strategy,
    message: 'Stratégie activée'
  });
}));

/**
 * POST /api/strategies/:id/disable
 * Disable strategy
 */
router.post('/:id/disable', authenticate, asyncHandler(async (req, res) => {
  const strategy = strategies.get(req.params.id);

  if (!strategy) {
    throw new AppError(404, 'Stratégie non trouvée', 'STRATEGY_NOT_FOUND');
  }

  strategy.enabled = false;
  strategy.updatedAt = new Date();
  strategies.set(strategy.id, strategy);

  logger.info({
    action: 'STRATEGY_DISABLED',
    userId: req.user!.id,
    strategyId: strategy.id
  });

  res.json({
    success: true,
    data: strategy,
    message: 'Stratégie désactivée'
  });
}));

/**
 * DELETE /api/strategies/:id
 * Delete strategy
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const strategy = strategies.get(req.params.id);

  if (!strategy) {
    throw new AppError(404, 'Stratégie non trouvée', 'STRATEGY_NOT_FOUND');
  }

  strategies.delete(req.params.id);

  logger.info({
    action: 'STRATEGY_DELETED',
    userId: req.user!.id,
    strategyId: req.params.id
  });

  res.json({
    success: true,
    message: 'Stratégie supprimée'
  });
}));

/**
 * GET /api/strategies/templates
 * Get strategy templates
 */
router.get('/templates/list', asyncHandler(async (req, res) => {
  const templates = [
    {
      type: 'TREND_FOLLOWING',
      name: 'Trend Following',
      description: 'Suit les tendances du marché avec moyennes mobiles',
      parameters: STRATEGY_PARAMS.TREND_FOLLOWING
    },
    {
      type: 'MEAN_REVERSION',
      name: 'Mean Reversion',
      description: 'Revient à la moyenne avec bandes de Bollinger',
      parameters: STRATEGY_PARAMS.MEAN_REVERSION
    },
    {
      type: 'SCALPING',
      name: 'Scalping',
      description: 'Positions courtes avec RSI',
      parameters: STRATEGY_PARAMS.SCALPING
    }
  ];

  res.json({
    success: true,
    data: templates
  });
}));

export default router;
