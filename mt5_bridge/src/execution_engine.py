"""
Execution Engine - Executes trades on MT5
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class ExecutionEngine:
    """Executes trading orders"""
    
    def __init__(self, mt5_connector):
        """
        Initialize execution engine
        
        Args:
            mt5_connector: MT5 connector instance
        """
        self.mt5 = mt5_connector
        self.executed_trades = {}
        self.trade_counter = 0
    
    def execute(self, signal: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Execute a trading signal
        
        Args:
            signal: Trading signal with entry, SL, TP
            
        Returns:
            Trade execution result or None
        """
        try:
            logger.info(f"📊 Executing {signal['action']} signal for {signal['symbol']}")
            
            # Send order to MT5
            ticket = self.mt5.send_order(
                symbol=signal['symbol'],
                order_type=signal['action'],
                volume=self._calculate_volume(signal),
                price=signal['entry_price'],
                sl=signal['stop_loss'],
                tp=signal['take_profit'],
                comment=f"{signal['strategy']} - Confidence: {signal['confidence']:.2%}"
            )
            
            if ticket is None:
                logger.error(f"❌ Order execution failed for {signal['symbol']}")
                return None
            
            # Record trade
            trade_record = {
                'ticket': ticket,
                'symbol': signal['symbol'],
                'action': signal['action'],
                'strategy': signal['strategy'],
                'entry_price': signal['entry_price'],
                'stop_loss': signal['stop_loss'],
                'take_profit': signal['take_profit'],
                'confidence': signal['confidence'],
                'executed_at': datetime.now().isoformat(),
                'status': 'open'
            }
            
            self.executed_trades[ticket] = trade_record
            self.trade_counter += 1
            
            logger.info(f"✅ Trade executed: Ticket {ticket}, {signal['action']} {signal['symbol']}")
            
            return trade_record
            
        except Exception as e:
            logger.error(f"Error executing trade: {str(e)}")
            return None
    
    def close(self, ticket: int, exit_price: float, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Close a trade
        
        Args:
            ticket: Trade ticket number
            exit_price: Exit price
            symbol: Trading symbol
            
        Returns:
            Trade close result or None
        """
        try:
            if ticket not in self.executed_trades:
                logger.warning(f"Trade ticket not found: {ticket}")
                return None
            
            trade_record = self.executed_trades[ticket]
            
            # Get volume from trade record
            # In real implementation, would get from MT5
            volume = 0.1  # Default volume
            
            # Close order on MT5
            result = self.mt5.close_order(
                ticket=ticket,
                symbol=symbol,
                volume=volume,
                price=exit_price
            )
            
            if not result:
                logger.error(f"Failed to close trade: {ticket}")
                return None
            
            # Calculate profit
            entry_price = trade_record['entry_price']
            if trade_record['action'] == 'BUY':
                profit = (exit_price - entry_price) * volume
            else:
                profit = (entry_price - exit_price) * volume
            
            # Update trade record
            trade_record['exit_price'] = exit_price
            trade_record['profit'] = profit
            trade_record['profit_percent'] = (profit / (entry_price * volume)) * 100
            trade_record['closed_at'] = datetime.now().isoformat()
            trade_record['status'] = 'closed'
            
            logger.info(f"✅ Trade closed: Ticket {ticket}, Profit: {profit:.2f}")
            
            return trade_record
            
        except Exception as e:
            logger.error(f"Error closing trade: {str(e)}")
            return None
    
    def _calculate_volume(self, signal: Dict[str, Any]) -> float:
        """
        Calculate trade volume based on risk
        
        Args:
            signal: Trading signal
            
        Returns:
            Volume to trade
        """
        try:
            # Get account info
            account_info = self.mt5.get_account_info()
            if not account_info:
                return 0.1  # Default
            
            # Risk 2% of account per trade
            risk_amount = account_info['balance'] * 0.02
            
            # Calculate pips at risk
            entry = signal['entry_price']
            stop_loss = signal['stop_loss']
            pips_at_risk = abs(entry - stop_loss) / 0.0001  # Assuming 4 decimals
            
            if pips_at_risk == 0:
                return 0.1
            
            # Volume = Risk Amount / (Pips at Risk * Pip Value)
            # Assuming standard lot size
            volume = risk_amount / (pips_at_risk * 10)
            
            # Round to nearest 0.01
            volume = round(volume, 2)
            
            # Ensure minimum volume
            volume = max(0.01, min(volume, 10.0))
            
            return volume
            
        except Exception as e:
            logger.error(f"Error calculating volume: {str(e)}")
            return 0.1
    
    def get_open_trades(self) -> list:
        """Get all open trades"""
        return [
            trade for trade in self.executed_trades.values()
            if trade['status'] == 'open'
        ]
    
    def get_closed_trades(self) -> list:
        """Get all closed trades"""
        return [
            trade for trade in self.executed_trades.values()
            if trade['status'] == 'closed'
        ]
    
    def get_trade_statistics(self) -> Dict[str, Any]:
        """Get trade statistics"""
        closed_trades = self.get_closed_trades()
        
        if not closed_trades:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0,
                'total_profit': 0,
                'average_win': 0,
                'average_loss': 0,
                'profit_factor': 0
            }
        
        winning_trades = [t for t in closed_trades if t['profit'] > 0]
        losing_trades = [t for t in closed_trades if t['profit'] < 0]
        
        total_profit = sum(t['profit'] for t in closed_trades)
        total_wins = sum(t['profit'] for t in winning_trades) if winning_trades else 0
        total_losses = abs(sum(t['profit'] for t in losing_trades)) if losing_trades else 0
        
        return {
            'total_trades': len(closed_trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': (len(winning_trades) / len(closed_trades) * 100) if closed_trades else 0,
            'total_profit': total_profit,
            'average_win': (total_wins / len(winning_trades)) if winning_trades else 0,
            'average_loss': (total_losses / len(losing_trades)) if losing_trades else 0,
            'profit_factor': (total_wins / total_losses) if total_losses > 0 else 0
        }
