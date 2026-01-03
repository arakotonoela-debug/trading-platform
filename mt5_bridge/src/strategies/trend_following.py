"""
Trend Following Strategy
Follows market trends using moving averages
"""

import logging
from typing import Optional, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class TrendFollowingStrategy:
    """Trend Following Strategy using Moving Averages"""
    
    def __init__(self, params: Dict[str, Any] = None):
        """
        Initialize strategy with parameters
        
        Args:
            params: Strategy parameters
                - ma_short: Short MA period (default: 20)
                - ma_long: Long MA period (default: 50)
                - min_confidence: Minimum confidence threshold (default: 0.6)
                - take_profit_pips: Take profit distance in pips
                - stop_loss_pips: Stop loss distance in pips
        """
        self.params = params or {}
        self.ma_short = self.params.get('ma_short', 20)
        self.ma_long = self.params.get('ma_long', 50)
        self.min_confidence = self.params.get('min_confidence', 0.6)
        self.take_profit_pips = self.params.get('take_profit_pips', 50)
        self.stop_loss_pips = self.params.get('stop_loss_pips', 30)
    
    def analyze(self, rates: list, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Analyze market data and generate signal
        
        Args:
            rates: OHLC data (list of dicts with open, high, low, close)
            symbol: Trading symbol
            
        Returns:
            Signal dict or None if no signal
        """
        try:
            if len(rates) < self.ma_long + 10:
                logger.warning(f"Not enough data for {symbol}")
                return None
            
            # Extract close prices
            closes = np.array([rate['close'] for rate in rates])
            
            # Calculate moving averages
            ma_short = self._calculate_sma(closes, self.ma_short)
            ma_long = self._calculate_sma(closes, self.ma_long)
            
            if ma_short is None or ma_long is None:
                return None
            
            # Get current values
            current_price = closes[-1]
            ma_short_current = ma_short[-1]
            ma_long_current = ma_long[-1]
            
            # Get previous values for trend detection
            ma_short_prev = ma_short[-2] if len(ma_short) > 1 else ma_short[-1]
            ma_long_prev = ma_long[-2] if len(ma_long) > 1 else ma_long[-1]
            
            # Detect trend
            signal = None
            confidence = 0.0
            
            # Bullish signal: MA short crosses above MA long
            if ma_short_prev <= ma_long_prev and ma_short_current > ma_long_current:
                signal = 'BUY'
                # Confidence based on distance between MAs
                distance = (ma_short_current - ma_long_current) / ma_long_current
                confidence = min(0.9, 0.6 + distance * 10)
            
            # Bearish signal: MA short crosses below MA long
            elif ma_short_prev >= ma_long_prev and ma_short_current < ma_long_current:
                signal = 'SELL'
                distance = (ma_long_current - ma_short_current) / ma_long_current
                confidence = min(0.9, 0.6 + distance * 10)
            
            # Trend continuation signals
            elif ma_short_current > ma_long_current and current_price > ma_short_current:
                signal = 'BUY'
                distance = (current_price - ma_short_current) / ma_short_current
                confidence = min(0.8, 0.5 + distance * 5)
            
            elif ma_short_current < ma_long_current and current_price < ma_short_current:
                signal = 'SELL'
                distance = (ma_short_current - current_price) / ma_short_current
                confidence = min(0.8, 0.5 + distance * 5)
            
            if signal and confidence >= self.min_confidence:
                return {
                    'strategy': 'TREND_FOLLOWING',
                    'symbol': symbol,
                    'action': signal,
                    'confidence': confidence,
                    'entry_price': current_price,
                    'take_profit': current_price + (self.take_profit_pips * 0.0001 if signal == 'BUY' else -self.take_profit_pips * 0.0001),
                    'stop_loss': current_price - (self.stop_loss_pips * 0.0001 if signal == 'BUY' else -self.stop_loss_pips * 0.0001),
                    'indicators': {
                        'ma_short': ma_short_current,
                        'ma_long': ma_long_current,
                        'current_price': current_price
                    }
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error in trend following analysis: {str(e)}")
            return None
    
    @staticmethod
    def _calculate_sma(data: np.ndarray, period: int) -> Optional[np.ndarray]:
        """Calculate Simple Moving Average"""
        try:
            if len(data) < period:
                return None
            
            sma = np.convolve(data, np.ones(period) / period, mode='valid')
            # Pad with None values to match original length
            padding = len(data) - len(sma)
            return np.concatenate([np.full(padding, np.nan), sma])
        except Exception as e:
            logger.error(f"Error calculating SMA: {str(e)}")
            return None
    
    @staticmethod
    def _calculate_ema(data: np.ndarray, period: int) -> Optional[np.ndarray]:
        """Calculate Exponential Moving Average"""
        try:
            if len(data) < period:
                return None
            
            ema = np.zeros_like(data)
            multiplier = 2 / (period + 1)
            
            # First EMA is SMA
            ema[period - 1] = np.mean(data[:period])
            
            # Calculate EMA
            for i in range(period, len(data)):
                ema[i] = (data[i] * multiplier) + (ema[i - 1] * (1 - multiplier))
            
            # Pad with NaN
            ema[:period - 1] = np.nan
            
            return ema
        except Exception as e:
            logger.error(f"Error calculating EMA: {str(e)}")
            return None
