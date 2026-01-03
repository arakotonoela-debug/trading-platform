// Trading Constants
export const TRADING_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD',
  'USDCAD', 'USDCHF', 'EURJPY', 'GBPJPY', 'AUDJPY',
  'GOLD', 'OIL', 'SP500', 'DAX', 'FTSE'
];

export const TIMEFRAMES = {
  M1: 1,
  M5: 5,
  M15: 15,
  M30: 30,
  H1: 60,
  H4: 240,
  D1: 1440
};

export const STRATEGY_TYPES = {
  TREND_FOLLOWING: 'TREND_FOLLOWING',
  MEAN_REVERSION: 'MEAN_REVERSION',
  SCALPING: 'SCALPING'
};

export const TRADE_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL'
};

export const TRADE_STATUS = {
  PENDING: 'pending',
  OPEN: 'open',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

export const ACCOUNT_STATUS = {
  EVALUATION: 'evaluation',
  VERIFIED: 'verified',
  TRADING: 'trading',
  FAILED: 'failed',
  PAUSED: 'paused'
};

// Prop Firm Constants
export const PROP_FIRMS = {
  DNA_FUNDED: {
    name: 'DNA Funded',
    fees: { min: 99, max: 199 },
    profitSplit: 80,
    maxDrawdown: 10,
    dailyLossLimit: 5,
    duration: 30
  },
  BRIGHT_FUNDED: {
    name: 'BrightFunded',
    fees: 149,
    profitSplit: 70,
    maxDrawdown: 10,
    dailyLossLimit: 5
  },
  TOP_TIER_TRADER: {
    name: 'Top Tier Trader',
    fees: 99,
    profitSplit: 80,
    maxDrawdown: 10,
    dailyLossLimit: 5
  }
};

// Risk Management Constants
export const RISK_DEFAULTS = {
  MAX_POSITION_SIZE_PERCENT: 2,
  RISK_REWARD_RATIO: 1.5,
  MAX_DAILY_LOSS_PERCENT: 5,
  MAX_DRAWDOWN_PERCENT: 10,
  MAX_TRADES_PER_DAY: 20,
  MAX_CONCURRENT_POSITIONS: 5
};

// Indicator Parameters
export const INDICATOR_PARAMS = {
  MA_SHORT: 20,
  MA_LONG: 50,
  EMA_FAST: 12,
  EMA_SLOW: 26,
  RSI_PERIOD: 14,
  RSI_OVERBOUGHT: 70,
  RSI_OVERSOLD: 30,
  BB_PERIOD: 20,
  BB_STD_DEV: 2,
  MACD_FAST: 12,
  MACD_SLOW: 26,
  MACD_SIGNAL: 9,
  ATR_PERIOD: 14
};

// Strategy Parameters
export const STRATEGY_PARAMS = {
  TREND_FOLLOWING: {
    ma_short: 20,
    ma_long: 50,
    min_confidence: 0.6,
    take_profit_pips: 50,
    stop_loss_pips: 30
  },
  MEAN_REVERSION: {
    bb_period: 20,
    bb_std_dev: 2,
    min_confidence: 0.65,
    take_profit_pips: 30,
    stop_loss_pips: 40
  },
  SCALPING: {
    rsi_period: 14,
    rsi_overbought: 70,
    rsi_oversold: 30,
    min_confidence: 0.7,
    take_profit_pips: 5,
    stop_loss_pips: 10
  }
};

// Alert Types
export const ALERT_TYPES = {
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success'
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  MIN_WIN_RATE: 0.45,
  MIN_PROFIT_FACTOR: 1.5,
  MAX_DRAWDOWN: 10,
  MIN_SHARPE_RATIO: 1.0
};

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Opération réussie',
  ERROR: 'Une erreur s\'est produite',
  INVALID_INPUT: 'Données invalides',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès refusé',
  NOT_FOUND: 'Non trouvé',
  CONFLICT: 'Conflit',
  INTERNAL_ERROR: 'Erreur interne du serveur'
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50
};

// Monitoring Intervals (in milliseconds)
export const MONITORING_INTERVALS = {
  MARKET_DATA: 5000,
  PERFORMANCE_UPDATE: 10000,
  RISK_CHECK: 5000,
  ALERTS_CHECK: 10000,
  CLEANUP: 300000
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  MARKET_DATA: 5,
  USER_DATA: 300,
  ACCOUNT_DATA: 60,
  PERFORMANCE_DATA: 300
};
