"""
Mean Reversion Strategy
Reverts to mean using Bollinger Bands
"""

import logging
from typing import Optional, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class MeanReversionStrategy:
    """Mean Reversion Strategy using Bollinger Bands"""
    
    def __init__(self, params: Dict[str, Any] = None):
        """
        Initialize strategy with parameters
        
        Args:
            params: Strategy parameters
                - bb_period: Bollinger Bands period (default: 20)
                - bb_std_dev: Standard deviations (default: 2)
                - min_confidence: Minimum confidence threshold (default: 0.65)
                - take_profit_pips: Take profit distance in pips
                - stop_loss_pips: Stop loss distance in pips
        """
        self.params = params or {}
        self.bb_period = self.params.get('bb_period', 20)
        self.bb_std_dev = self.params.get('bb_std_dev', 2)
        self.min_confidence = self.params.get('min_confidence', 0.65)
        self.take_profit_pips = self.params.get('take_profit_pips', 30)
        self.stop_loss_pips = self.params.get('stop_loss_pips', 40)
    
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
            if len(rates) < self.bb_period + 10:
                logger.warning(f"Not enough data for {symbol}")
                return None
            
            # Extract close prices
            closes = np.array([rate['close'] for rate in rates])
            
            # Calculate Bollinger Bands
            bb_data = self._calculate_bollinger_bands(closes, self.bb_period, self.bb_std_dev)
            
            if bb_data is None:
                return None
            
            middle, upper, lower = bb_data
            
            # Get current values
            current_price = closes[-1]
            current_middle = middle[-1]
            current_upper = upper[-1]
            current_lower = lower[-1]
            
            # Calculate deviation from middle
            deviation = (current_price - current_middle) / (current_upper - current_lower)
            
            signal = None
            confidence = 0.0
            
            # Price touches lower band - potential buy
            if current_price <= current_lower:
                signal = 'BUY'
                # Confidence increases as price gets closer to lower band
                confidence = min(0.9, 0.65 + abs(deviation) * 0.5)
            
            # Price touches upper band - potential sell
            elif current_price >= current_upper:
                signal = 'SELL'
                confidence = min(0.9, 0.65 + abs(deviation) * 0.5)
            
            # Price is outside bands - strong reversal signal
            elif current_price < current_lower:
                signal = 'BUY'
                confidence = min(0.95, 0.75 + abs(deviation) * 0.3)
            
            elif current_price > current_upper:
                signal = 'SELL'
                confidence = min(0.95, 0.75 + abs(deviation) * 0.3)
            
            if signal and confidence >= self.min_confidence:
                return {
                    'strategy': 'MEAN_REVERSION',
                    'symbol': symbol,
                    'action': signal,
                    'confidence': confidence,
                    'entry_price': current_price,
                    'take_profit': current_middle,  # Target is middle band
                    'stop_loss': current_price + (self.stop_loss_pips * 0.0001 if signal == 'BUY' else -self.stop_loss_pips * 0.0001),
                    'indicators': {
                        'upper_band': current_upper,
                        'middle_band': current_middle,
                        'lower_band': current_lower,
                        'deviation': deviation
                    }
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error in mean reversion analysis: {str(e)}")
            return None
    
    @staticmethod
    def _calculate_bollinger_bands(data: np.ndarray, period: int, std_dev: float):
        """Calculate Bollinger Bands"""
        try:
            if len(data) < period:
                return None
            
            # Calculate SMA (middle band)
            middle = np.convolve(data, np.ones(period) / period, mode='valid')
            
            # Calculate standard deviation
            std = np.array([np.std(data[i:i+period]) for i in range(len(data) - period + 1)])
            
            # Calculate bands
            upper = middle + (std * std_dev)
            lower = middle - (std * std_dev)
            
            # Pad with None values
            padding = len(data) - len(middle)
            middle = np.concatenate([np.full(padding, np.nan), middle])
            upper = np.concatenate([np.full(padding, np.nan), upper])
            lower = np.concatenate([np.full(padding, np.nan), lower])
            
            return middle, upper, lower
            
        except Exception as e:
            logger.error(f"Error calculating Bollinger Bands: {str(e)}")
            return None
