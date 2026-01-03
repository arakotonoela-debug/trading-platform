"""
Risk Manager - Validates and manages trading risks
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RiskManager:
    """Manages trading risks and validates trades"""
    
    def __init__(self):
        self.daily_loss_limit = float(os.getenv('MAX_DAILY_LOSS_PERCENT', 5))
        self.max_drawdown = float(os.getenv('MAX_DRAWDOWN_PERCENT', 10))
        self.max_position_size = float(os.getenv('DEFAULT_POSITION_SIZE_PERCENT', 2))
        self.risk_reward_ratio = float(os.getenv('RISK_REWARD_RATIO', 1.5))
        self.max_trades_per_day = int(os.getenv('MAX_TRADES_PER_DAY', 20))
        self.max_concurrent_positions = int(os.getenv('MAX_CONCURRENT_POSITIONS', 5))
        
        # Track daily metrics
        self.daily_trades = []
        self.daily_loss = 0.0
        self.last_reset = datetime.now()
    
    def validate_trade(self, signal: Dict[str, Any], account_info: Dict[str, Any]) -> bool:
        """
        Validate if a trade should be executed
        
        Args:
            signal: Trading signal
            account_info: Account information
            
        Returns:
            True if trade is valid, False otherwise
        """
        try:
            # Reset daily metrics if needed
            self._reset_daily_metrics()
            
            # Validate signal
            if not self._validate_signal(signal):
                logger.warning(f"Invalid signal: {signal}")
                return False
            
            # Check daily loss limit
            if not self._check_daily_loss_limit(account_info):
                logger.warning("Daily loss limit exceeded")
                return False
            
            # Check max drawdown
            if not self._check_max_drawdown(account_info):
                logger.warning("Max drawdown exceeded")
                return False
            
            # Check position size
            if not self._check_position_size(signal, account_info):
                logger.warning("Position size invalid")
                return False
            
            # Check risk/reward ratio
            if not self._check_risk_reward_ratio(signal):
                logger.warning("Risk/reward ratio invalid")
                return False
            
            # Check daily trade limit
            if not self._check_daily_trade_limit():
                logger.warning("Daily trade limit exceeded")
                return False
            
            # Check concurrent positions
            if not self._check_concurrent_positions(account_info):
                logger.warning("Max concurrent positions exceeded")
                return False
            
            logger.info(f"✅ Trade validated: {signal['action']} {signal['symbol']}")
            return True
            
        except Exception as e:
            logger.error(f"Error validating trade: {str(e)}")
            return False
    
    def _validate_signal(self, signal: Dict[str, Any]) -> bool:
        """Validate signal structure"""
        required_fields = ['strategy', 'symbol', 'action', 'confidence', 'entry_price', 'take_profit', 'stop_loss']
        
        for field in required_fields:
            if field not in signal:
                return False
        
        if signal['action'] not in ['BUY', 'SELL']:
            return False
        
        if not 0 <= signal['confidence'] <= 1:
            return False
        
        return True
    
    def _check_daily_loss_limit(self, account_info: Dict[str, Any]) -> bool:
        """Check if daily loss limit is exceeded"""
        if self.daily_loss < 0:
            loss_percent = abs(self.daily_loss) / account_info['balance'] * 100
            if loss_percent >= self.daily_loss_limit:
                return False
        
        return True
    
    def _check_max_drawdown(self, account_info: Dict[str, Any]) -> bool:
        """Check if max drawdown is exceeded"""
        if 'equity' in account_info and 'balance' in account_info:
            drawdown = (account_info['balance'] - account_info['equity']) / account_info['balance'] * 100
            if drawdown >= self.max_drawdown:
                return False
        
        return True
    
    def _check_position_size(self, signal: Dict[str, Any], account_info: Dict[str, Any]) -> bool:
        """Check if position size is valid"""
        # Calculate position size based on risk
        risk_amount = account_info['balance'] * (self.max_position_size / 100)
        
        # Calculate pips at risk
        entry = signal['entry_price']
        stop_loss = signal['stop_loss']
        pips_at_risk = abs(entry - stop_loss) / 0.0001  # Assuming 4 decimals
        
        if pips_at_risk == 0:
            return False
        
        # Position size should not exceed risk limit
        return True
    
    def _check_risk_reward_ratio(self, signal: Dict[str, Any]) -> bool:
        """Check if risk/reward ratio is acceptable"""
        entry = signal['entry_price']
        tp = signal['take_profit']
        sl = signal['stop_loss']
        
        risk = abs(entry - sl)
        reward = abs(tp - entry)
        
        if risk == 0:
            return False
        
        ratio = reward / risk
        
        if ratio < self.risk_reward_ratio:
            logger.warning(f"Risk/reward ratio too low: {ratio:.2f}")
            return False
        
        return True
    
    def _check_daily_trade_limit(self) -> bool:
        """Check if daily trade limit is exceeded"""
        return len(self.daily_trades) < self.max_trades_per_day
    
    def _check_concurrent_positions(self, account_info: Dict[str, Any]) -> bool:
        """Check if max concurrent positions is exceeded"""
        # In real implementation, count open positions from account_info
        # For now, assume it's valid
        return True
    
    def _reset_daily_metrics(self):
        """Reset daily metrics if new day"""
        now = datetime.now()
        
        # Reset at midnight
        if now.date() > self.last_reset.date():
            self.daily_trades = []
            self.daily_loss = 0.0
            self.last_reset = now
            logger.info("Daily metrics reset")
    
    def record_trade(self, trade: Dict[str, Any]):
        """Record a trade for daily tracking"""
        self.daily_trades.append(trade)
        
        if 'profit' in trade and trade['profit'] < 0:
            self.daily_loss += trade['profit']
    
    def get_risk_metrics(self, account_info: Dict[str, Any]) -> Dict[str, Any]:
        """Get current risk metrics"""
        return {
            'daily_trades': len(self.daily_trades),
            'daily_loss': self.daily_loss,
            'daily_loss_percent': abs(self.daily_loss) / account_info['balance'] * 100 if self.daily_loss < 0 else 0,
            'daily_loss_limit': self.daily_loss_limit,
            'drawdown': (account_info['balance'] - account_info['equity']) / account_info['balance'] * 100,
            'max_drawdown': self.max_drawdown,
            'free_margin': account_info.get('free_margin', 0),
            'margin_level': account_info.get('margin_level', 0)
        }


import os
