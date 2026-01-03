import express, { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError, Trade, TradeStatus } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { TRADE_STATUS, TRADING_SYMBOLS, STRATEGY_TYPES } from '../utils/constants';

const router: Router = express.Router();

// Mock database for MVP
const trades: Map<string, Trade> = new Map();
const accounts: Map<string, any> = new Map(); // Reference to accounts

/**
 * POST /api/trades
 * Create a new trade
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    accountId,
    symbol,
    type,
    entryPrice,
    volume,
    stopLoss,
    takeProfit,
    strategy,
    confidence
  } = req.body;

  // Validation
  if (!accountId || !symbol || !type || !entryPrice || !volume || !stopLoss || !takeProfit) {
    throw new AppError(400, 'Champs requis manquants', 'MISSING_FIELDS');
  }

  if (!TRADING_SYMBOLS.includes(symbol)) {
    throw new AppError(400, 'Symbole invalide', 'INVALID_SYMBOL');
  }

  if (!['BUY', 'SELL'].includes(type)) {
    throw new AppError(400, 'Type de trade invalide', 'INVALID_TRADE_TYPE');
  }

  if (!Object.values(STRATEGY_TYPES).includes(strategy)) {
    throw new AppError(400, 'Stratégie invalide', 'INVALID_STRATEGY');
  }

  // Calculate risk/reward ratio
  const riskReward = Math.abs(takeProfit - entryPrice) / Math.abs(entryPrice - stopLoss);

  const trade: Trade = {
    id: uuidv4(),
    accountId,
    symbol,
    type: type as any,
    status: TRADE_STATUS.PENDING as TradeStatus,
    entryPrice,
    entryTime: new Date(),
    volume,
    stopLoss,
    takeProfit,
    strategy: strategy as any,
    confidence: confidence || 0.5,
    riskReward,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  trades.set(trade.id, trade);

  logger.info({
    action: 'TRADE_CREATED',
    userId: req.user!.id,
    tradeId: trade.id,
    symbol,
    type
  });

  res.status(201).json({
    success: true,
    data: trade,
    message: 'Trade créé'
  });
}));

/**
 * GET /api/trades
 * Get trades for an account
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { accountId, status } = req.query;

  let userTrades = Array.from(trades.values())
    .filter(trade => !accountId || trade.accountId === accountId);

  if (status) {
    userTrades = userTrades.filter(trade => trade.status === status);
  }

  // Sort by creation date (newest first)
  userTrades.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json({
    success: true,
    data: userTrades,
    total: userTrades.length
  });
}));

/**
 * GET /api/trades/:id
 * Get trade details
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const trade = trades.get(req.params.id);

  if (!trade) {
    throw new AppError(404, 'Trade non trouvé', 'TRADE_NOT_FOUND');
  }

  res.json({
    success: true,
    data: trade
  });
}));

/**
 * PUT /api/trades/:id
 * Update trade (e.g., close it)
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const trade = trades.get(req.params.id);

  if (!trade) {
    throw new AppError(404, 'Trade non trouvé', 'TRADE_NOT_FOUND');
  }

  const { status, exitPrice, exitTime } = req.body;

  if (status && Object.values(TRADE_STATUS).includes(status)) {
    trade.status = status as TradeStatus;
  }

  if (exitPrice) {
    trade.exitPrice = exitPrice;
    trade.profit = (exitPrice - trade.entryPrice) * trade.volume;
    trade.profitPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
  }

  if (exitTime) {
    trade.exitTime = new Date(exitTime);
  }

  trade.updatedAt = new Date();
  trades.set(trade.id, trade);

  logger.info({
    action: 'TRADE_UPDATED',
    userId: req.user!.id,
    tradeId: trade.id,
    status
  });

  res.json({
    success: true,
    data: trade,
    message: 'Trade mis à jour'
  });
}));

/**
 * POST /api/trades/:id/close
 * Close a trade
 */
router.post('/:id/close', authenticate, asyncHandler(async (req, res) => {
  const trade = trades.get(req.params.id);

  if (!trade) {
    throw new AppError(404, 'Trade non trouvé', 'TRADE_NOT_FOUND');
  }

  if (trade.status === TRADE_STATUS.CLOSED) {
    throw new AppError(400, 'Le trade est déjà fermé', 'TRADE_ALREADY_CLOSED');
  }

  const { exitPrice } = req.body;

  if (!exitPrice) {
    throw new AppError(400, 'Prix de sortie requis', 'MISSING_EXIT_PRICE');
  }

  trade.exitPrice = exitPrice;
  trade.exitTime = new Date();
  trade.status = TRADE_STATUS.CLOSED as TradeStatus;
  trade.profit = (exitPrice - trade.entryPrice) * trade.volume;
  trade.profitPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
  trade.updatedAt = new Date();

  trades.set(trade.id, trade);

  logger.info({
    action: 'TRADE_CLOSED',
    userId: req.user!.id,
    tradeId: trade.id,
    profit: trade.profit
  });

  res.json({
    success: true,
    data: trade,
    message: 'Trade fermé'
  });
}));

/**
 * GET /api/trades/stats/:accountId
 * Get trade statistics for an account
 */
router.get('/stats/:accountId', authenticate, asyncHandler(async (req, res) => {
  const accountTrades = Array.from(trades.values())
    .filter(trade => trade.accountId === req.params.accountId && trade.status === TRADE_STATUS.CLOSED);

  const totalTrades = accountTrades.length;
  const winningTrades = accountTrades.filter(t => t.profit && t.profit > 0).length;
  const losingTrades = accountTrades.filter(t => t.profit && t.profit < 0).length;
  const totalProfit = accountTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const avgWin = winningTrades > 0
    ? accountTrades
        .filter(t => t.profit && t.profit > 0)
        .reduce((sum, t) => sum + (t.profit || 0), 0) / winningTrades
    : 0;
  const avgLoss = losingTrades > 0
    ? Math.abs(accountTrades
        .filter(t => t.profit && t.profit < 0)
        .reduce((sum, t) => sum + (t.profit || 0), 0) / losingTrades)
    : 0;

  const stats = {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
    totalProfit,
    averageWin: avgWin,
    averageLoss: avgLoss,
    profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0
  };

  res.json({
    success: true,
    data: stats
  });
}));

export default router;
