import express, { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError, DashboardData, PerformanceMetrics } from '../types';
import { logger } from '../utils/logger';
import { TRADE_STATUS } from '../utils/constants';

const router: Router = express.Router();

// Mock data references (in real app, would be from database)
const accounts: Map<string, any> = new Map();
const trades: Map<string, any> = new Map();
const strategies: Map<string, any> = new Map();

/**
 * GET /api/dashboard/:accountId
 * Get complete dashboard data for an account
 */
router.get('/:accountId', authenticate, asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  // Get account
  const account = accounts.get(accountId);
  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  // Get trades for account
  const accountTrades = Array.from(trades.values())
    .filter(t => t.accountId === accountId);

  const closedTrades = accountTrades.filter(t => t.status === TRADE_STATUS.CLOSED);
  const openTrades = accountTrades.filter(t => t.status === TRADE_STATUS.OPEN);

  // Calculate performance metrics
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => t.profit && t.profit > 0).length;
  const losingTrades = closedTrades.filter(t => t.profit && t.profit < 0).length;
  const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalReturn = (totalProfit / account.balance) * 100;

  const avgWin = winningTrades > 0
    ? closedTrades
        .filter(t => t.profit && t.profit > 0)
        .reduce((sum, t) => sum + (t.profit || 0), 0) / winningTrades
    : 0;

  const avgLoss = losingTrades > 0
    ? Math.abs(closedTrades
        .filter(t => t.profit && t.profit < 0)
        .reduce((sum, t) => sum + (t.profit || 0), 0) / losingTrades)
    : 0;

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peakEquity = account.balance;
  let currentEquity = account.balance;

  for (const trade of closedTrades) {
    currentEquity += trade.profit || 0;
    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
    }
    const drawdown = ((peakEquity - currentEquity) / peakEquity) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // Calculate Sharpe Ratio (simplified)
  const returns = closedTrades.map(t => (t.profitPercent || 0) / 100);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b) / returns.length : 0;
  const variance = returns.length > 0
    ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  const performance: PerformanceMetrics = {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
    profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
    sharpeRatio: isFinite(sharpeRatio) ? sharpeRatio : 0,
    sortinoRatio: 0, // Simplified
    maxDrawdown,
    totalProfit,
    totalReturn,
    averageWin: avgWin,
    averageLoss: avgLoss
  };

  // Get strategies
  const accountStrategies = Array.from(strategies.values())
    .filter(s => s.accountId === accountId);

  // Get recent trades
  const recentTrades = accountTrades
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  const dashboardData: DashboardData = {
    account,
    performance,
    recentTrades,
    openPositions: openTrades,
    strategies: accountStrategies,
    alerts: []
  };

  res.json({
    success: true,
    data: dashboardData
  });
}));

/**
 * GET /api/dashboard/stats/overview
 * Get overview statistics
 */
router.get('/stats/overview', authenticate, asyncHandler(async (req, res) => {
  // Get all user accounts
  const userAccounts = Array.from(accounts.values())
    .filter(a => a.userId === req.user!.id);

  const totalAccounts = userAccounts.length;
  const activeAccounts = userAccounts.filter(a => a.status === 'trading').length;
  const totalBalance = userAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = userAccounts.reduce((sum, a) => sum + a.equity, 0);

  // Get all trades
  const allTrades = Array.from(trades.values())
    .filter(t => userAccounts.some(a => a.id === t.accountId));

  const closedTrades = allTrades.filter(t => t.status === TRADE_STATUS.CLOSED);
  const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalReturn = totalBalance > 0 ? (totalProfit / totalBalance) * 100 : 0;

  const overview = {
    totalAccounts,
    activeAccounts,
    totalBalance,
    totalEquity,
    totalProfit,
    totalReturn,
    totalTrades: closedTrades.length,
    winRate: closedTrades.length > 0
      ? (closedTrades.filter(t => t.profit && t.profit > 0).length / closedTrades.length) * 100
      : 0
  };

  res.json({
    success: true,
    data: overview
  });
}));

/**
 * GET /api/dashboard/performance-chart/:accountId
 * Get performance chart data
 */
router.get('/performance-chart/:accountId', authenticate, asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  const account = accounts.get(accountId);
  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  // Get trades for account
  const accountTrades = Array.from(trades.values())
    .filter(t => t.accountId === accountId && t.status === TRADE_STATUS.CLOSED)
    .sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());

  // Build equity curve
  let currentEquity = account.balance;
  const equityCurve = [
    {
      date: new Date(account.createdAt).toLocaleDateString(),
      equity: currentEquity,
      profit: 0
    }
  ];

  for (const trade of accountTrades) {
    currentEquity += trade.profit || 0;
    equityCurve.push({
      date: new Date(trade.exitTime).toLocaleDateString(),
      equity: currentEquity,
      profit: trade.profit || 0
    });
  }

  res.json({
    success: true,
    data: equityCurve
  });
}));

/**
 * GET /api/dashboard/alerts/:accountId
 * Get alerts for an account
 */
router.get('/alerts/:accountId', authenticate, asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  const account = accounts.get(accountId);
  if (!account) {
    throw new AppError(404, 'Compte non trouvé', 'ACCOUNT_NOT_FOUND');
  }

  // Generate alerts based on account state
  const alerts = [];

  if (account.status === 'failed') {
    alerts.push({
      id: '1',
      accountId,
      type: 'error',
      title: 'Compte échoué',
      message: 'Le compte n\'a pas atteint les critères de validation',
      read: false,
      createdAt: new Date()
    });
  }

  if (account.equity < account.balance * 0.5) {
    alerts.push({
      id: '2',
      accountId,
      type: 'warning',
      title: 'Drawdown élevé',
      message: `Le drawdown a atteint ${((1 - account.equity / account.balance) * 100).toFixed(2)}%`,
      read: false,
      createdAt: new Date()
    });
  }

  res.json({
    success: true,
    data: alerts,
    total: alerts.length
  });
}));

export default router;
