import { Request } from 'express';

// Extended Express Request with user info
declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        email: string;
        role: 'user' | 'admin';
      };
    }
  }
}

// User Types
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Account Types
export type AccountStatus = 'evaluation' | 'verified' | 'trading' | 'failed' | 'paused';

export interface Account {
  id: string;
  userId: string;
  name: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  status: AccountStatus;
  propFirm: 'DNA_FUNDED' | 'BRIGHT_FUNDED' | 'TOP_TIER_TRADER';
  maxDrawdown: number;
  dailyLossLimit: number;
  profitSplit: number;
  createdAt: Date;
  updatedAt: Date;
  lastTradeAt?: Date;
}

// Trade Types
export type TradeType = 'BUY' | 'SELL';
export type TradeStatus = 'pending' | 'open' | 'closed' | 'cancelled';

export interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  entryPrice: number;
  entryTime: Date;
  exitPrice?: number;
  exitTime?: Date;
  volume: number;
  stopLoss: number;
  takeProfit: number;
  profit?: number;
  profitPercent?: number;
  strategy: 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'SCALPING';
  confidence: number;
  riskReward: number;
  createdAt: Date;
  updatedAt: Date;
}

// Strategy Types
export type StrategyType = 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'SCALPING';

export interface Strategy {
  id: string;
  accountId: string;
  type: StrategyType;
  enabled: boolean;
  parameters: {
    [key: string]: any;
  };
  performance: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

// Indicator Types
export interface IndicatorValue {
  value: number;
  timestamp: Date;
}

export interface MovingAverages {
  ma20: number;
  ma50: number;
  ema12: number;
  ema26: number;
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
}

export interface RSIValue {
  value: number;
  overbought: boolean;
  oversold: boolean;
}

export interface MACDValue {
  macd: number;
  signal: number;
  histogram: number;
}

// Signal Types
export interface TradingSignal {
  strategy: StrategyType;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  timestamp: Date;
  indicators: {
    [key: string]: any;
  };
}

// Risk Management Types
export interface RiskMetrics {
  dailyLoss: number;
  dailyLossPercent: number;
  maxDrawdown: number;
  currentDrawdown: number;
  positionSize: number;
  leverage: number;
  riskPerTrade: number;
}

export interface RiskValidation {
  isValid: boolean;
  violations: string[];
  reason?: string;
}

// Performance Types
export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  totalProfit: number;
  totalReturn: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
}

// Dashboard Types
export interface DashboardData {
  account: Account;
  performance: PerformanceMetrics;
  recentTrades: Trade[];
  openPositions: Trade[];
  strategies: Strategy[];
  alerts: Alert[];
}

// Alert Types
export interface Alert {
  id: string;
  accountId: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Error Types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'trade' | 'alert' | 'performance' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
