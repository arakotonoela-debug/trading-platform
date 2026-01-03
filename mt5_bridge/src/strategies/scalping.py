"""
Scalping Strategy
Short-term positions using RSI
"""

import logging
from typing import Optional, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class ScalpingStrategy:
    """Scalping Strategy using RSI (Relative Strength Index)"""
    
    def __init__(self, params: Dict[str, Any] = None):
        """
        Initialize strategy with parameters
        
        Args:
            params: Strategy parameters
                - rsi_period: RSI period (default: 14)
                - rsi_overbought: Overbought threshold (default: 70)
                - rsi_oversold: Oversold threshold (default: 30)
                - min_confidence: Minimum confidence threshold (default: 0.7)
                - take_profit_pips: Take profit distance in pips (default: 5)
                - stop_loss_pips: Stop loss distance in pips (default: 10)
        """
        self.params = params or {}
        self.rsi_period = self.params.get('rsi_period', 14)
        self.rsi_overbought = self.params.get('rsi_overbought', 70)
        self.rsi_oversold = self.params.get('rsi_oversold', 30)
        self.min_confidence = self.params.get('min_confidence', 0.7)
        self.take_profit_pips = self.params.get('take_profit_pips', 5)
        self.stop_loss_pips = self.params.get('stop_loss_pips', 10)
    
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
            if len(rates) < self.rsi_period + 10:
                logger.warning(f"Not enough data for {symbol}")
                return None
            
            # Extract close prices
            closes = np.array([rate['close'] for rate in rates])
            
            # Calculate RSI
            rsi = self._calculate_rsi(closes, self.rsi_period)
            
            if rsi is None or len(rsi) == 0:
                return None
            
            # Get current values
            current_price = closes[-1]
            current_rsi = rsi[-1]
            
            # Get previous RSI for trend detection
            prev_rsi = rsi[-2] if len(rsi) > 1 else current_rsi
            
            signal = None
            confidence = 0.0
            
            # Oversold - potential buy
            if current_rsi < self.rsi_oversold:
                signal = 'BUY'
                # Confidence increases as RSI gets lower
                confidence = min(0.95, 0.7 + (self.rsi_oversold - current_rsi) / 100)
            
            # Overbought - potential sell
            elif current_rsi > self.rsi_overbought:
                signal = 'SELL'
                confidence = min(0.95, 0.7 + (current_rsi - self.rsi_overbought) / 100)
            
            # RSI crosses oversold level upward - buy signal
            elif prev_rsi <= self.rsi_oversold and current_rsi > self.rsi_oversold:
                signal = 'BUY'
                confidence = 0.85
            
            # RSI crosses overbought level downward - sell signal
            elif prev_rsi >= self.rsi_overbought and current_rsi < self.rsi_overbought:
                signal = 'SELL'
                confidence = 0.85
            
            if signal and confidence >= self.min_confidence:
                return {
                    'strategy': 'SCALPING',
                    'symbol': symbol,
                    'action': signal,
                    'confidence': confidence,
                    'entry_price': current_price,
                    'take_profit': current_price + (self.take_profit_pips * 0.0001 if signal == 'BUY' else -self.take_profit_pips * 0.0001),
                    'stop_loss': current_price - (self.stop_loss_pips * 0.0001 if signal == 'BUY' else -self.stop_loss_pips * 0.0001),
                    'indicators': {
                        'rsi': current_rsi,
                        'rsi_overbought': self.rsi_overbought,
                        'rsi_oversold': self.rsi_oversold
                    }
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error in scalping analysis: {str(e)}")
            return None
    
    @staticmethod
    def _calculate_rsi(data: np.ndarray, period: int) -> Optional[np.ndarray]:
        """Calculate Relative Strength Index (RSI)"""
        try:
            if len(data) < period + 1:
                return None
            
            # Calculate price changes
            deltas = np.diff(data)
            
            # Separate gains and losses
            gains = np.where(deltas > 0, deltas, 0)
            losses = np.where(deltas < 0, -deltas, 0)
            
            # Calculate average gains and losses
            avg_gains = np.zeros_like(data)
            avg_losses = np.zeros_like(data)
            
            # First average
            avg_gains[period] = np.mean(gains[:period])
            avg_losses[period] = np.mean(losses[:period])
            
            # Subsequent averages (smoothed)
            for i in range(period + 1, len(data)):
                avg_gains[i] = (avg_gains[i - 1] * (period - 1) + gains[i - 1]) / period
                avg_losses[i] = (avg_losses[i - 1] * (period - 1) + losses[i - 1]) / period
            
            # Calculate RS and RSI
            rs = np.zeros_like(data)
            rsi = np.zeros_like(data)
            
            for i in range(period, len(data)):
                if avg_losses[i] != 0:
                    rs[i] = avg_gains[i] / avg_losses[i]
                    rsi[i] = 100 - (100 / (1 + rs[i]))
                else:
                    rsi[i] = 100 if avg_gains[i] > 0 else 0
            
            # Pad with NaN
            rsi[:period] = np.nan
            
            return rsi
            
        except Exception as e:
            logger.error(f"Error calculating RSI: {str(e)}")
            return None
