"""
MT5 Connector - Handles connection to MetaTrader 5
"""

import logging
import os
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class MT5Connector:
    """Manages connection to MetaTrader 5"""
    
    def __init__(self):
        self.connected = False
        self.account_info = None
        self.broker_name = os.getenv('MT5_BROKER', 'Default Broker')
        self.login = os.getenv('MT5_LOGIN', '')
        self.password = os.getenv('MT5_PASSWORD', '')
        self.server = os.getenv('MT5_SERVER', '')
        
        # Try to import MetaTrader5
        try:
            import MetaTrader5 as mt5
            self.mt5 = mt5
        except ImportError:
            logger.warning("MetaTrader5 not installed. Using mock mode.")
            self.mt5 = None
    
    def connect(self) -> bool:
        """Connect to MT5"""
        try:
            if self.mt5 is None:
                logger.info("🔌 Using mock MT5 connection (for development)")
                self.connected = True
                self.account_info = self._get_mock_account_info()
                return True
            
            # Initialize MT5
            if not self.mt5.initialize():
                logger.error(f"MT5 initialization failed: {self.mt5.last_error()}")
                return False
            
            # Login
            if self.login and self.password and self.server:
                authorized = self.mt5.login(
                    login=int(self.login),
                    password=self.password,
                    server=self.server
                )
                if not authorized:
                    logger.error(f"MT5 login failed: {self.mt5.last_error()}")
                    return False
            
            self.connected = True
            self.account_info = self.get_account_info()
            logger.info(f"✅ Connected to MT5: {self.broker_name}")
            return True
            
        except Exception as e:
            logger.error(f"Connection error: {str(e)}")
            return False
    
    def disconnect(self) -> bool:
        """Disconnect from MT5"""
        try:
            if self.mt5 and self.connected:
                self.mt5.shutdown()
                self.connected = False
                logger.info("✅ Disconnected from MT5")
            return True
        except Exception as e:
            logger.error(f"Disconnection error: {str(e)}")
            return False
    
    def get_account_info(self) -> Optional[Dict[str, Any]]:
        """Get account information"""
        try:
            if not self.connected:
                return None
            
            if self.mt5 is None:
                return self._get_mock_account_info()
            
            account_info = self.mt5.account_info()
            if account_info is None:
                logger.error("Failed to get account info")
                return None
            
            return {
                'login': account_info.login,
                'name': account_info.name,
                'server': account_info.server,
                'currency': account_info.currency,
                'balance': account_info.balance,
                'credit': account_info.credit,
                'equity': account_info.equity,
                'margin': account_info.margin,
                'free_margin': account_info.free_margin,
                'margin_level': account_info.margin_level,
                'leverage': account_info.leverage,
                'profit': account_info.profit,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting account info: {str(e)}")
            return None
    
    def get_symbol_info(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get symbol information"""
        try:
            if not self.connected:
                return None
            
            if self.mt5 is None:
                return self._get_mock_symbol_info(symbol)
            
            symbol_info = self.mt5.symbol_info(symbol)
            if symbol_info is None:
                logger.warning(f"Symbol not found: {symbol}")
                return None
            
            return {
                'symbol': symbol_info.name,
                'bid': symbol_info.bid,
                'ask': symbol_info.ask,
                'point': symbol_info.point,
                'digits': symbol_info.digits,
                'spread': symbol_info.spread,
                'volume': symbol_info.volume,
                'time': symbol_info.time
            }
            
        except Exception as e:
            logger.error(f"Error getting symbol info: {str(e)}")
            return None
    
    def get_rates(self, symbol: str, timeframe: int, count: int = 100) -> Optional[list]:
        """Get OHLC rates"""
        try:
            if not self.connected:
                return None
            
            if self.mt5 is None:
                return self._get_mock_rates(symbol, count)
            
            rates = self.mt5.copy_rates_from_pos(symbol, timeframe, 0, count)
            if rates is None:
                logger.warning(f"Failed to get rates for {symbol}")
                return None
            
            return [
                {
                    'time': int(rate[0]),
                    'open': float(rate[1]),
                    'high': float(rate[2]),
                    'low': float(rate[3]),
                    'close': float(rate[4]),
                    'volume': int(rate[5])
                }
                for rate in rates
            ]
            
        except Exception as e:
            logger.error(f"Error getting rates: {str(e)}")
            return None
    
    def send_order(self, symbol: str, order_type: str, volume: float, 
                   price: float, sl: float, tp: float, comment: str = "") -> Optional[int]:
        """Send order to MT5"""
        try:
            if not self.connected:
                logger.error("Not connected to MT5")
                return None
            
            if self.mt5 is None:
                # Mock order
                return 12345
            
            # Prepare order
            order_type_enum = self.mt5.ORDER_TYPE_BUY if order_type == 'BUY' else self.mt5.ORDER_TYPE_SELL
            
            request = {
                "action": self.mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": volume,
                "type": order_type_enum,
                "price": price,
                "sl": sl,
                "tp": tp,
                "comment": comment,
                "type_time": self.mt5.ORDER_TIME_GTC,
                "type_filling": self.mt5.ORDER_FILLING_IOC
            }
            
            result = self.mt5.order_send(request)
            if result.retcode != self.mt5.TRADE_RETCODE_DONE:
                logger.error(f"Order failed: {result.comment}")
                return None
            
            logger.info(f"Order sent: {result.order}")
            return result.order
            
        except Exception as e:
            logger.error(f"Error sending order: {str(e)}")
            return None
    
    def close_order(self, ticket: int, symbol: str, volume: float, price: float) -> bool:
        """Close an order"""
        try:
            if not self.connected:
                return False
            
            if self.mt5 is None:
                # Mock close
                return True
            
            request = {
                "action": self.mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": volume,
                "type": self.mt5.ORDER_TYPE_SELL,
                "position": ticket,
                "price": price,
                "type_time": self.mt5.ORDER_TIME_GTC,
                "type_filling": self.mt5.ORDER_FILLING_IOC
            }
            
            result = self.mt5.order_send(request)
            return result.retcode == self.mt5.TRADE_RETCODE_DONE
            
        except Exception as e:
            logger.error(f"Error closing order: {str(e)}")
            return False
    
    def get_positions(self) -> Optional[list]:
        """Get open positions"""
        try:
            if not self.connected:
                return None
            
            if self.mt5 is None:
                return []
            
            positions = self.mt5.positions_get()
            if positions is None:
                return []
            
            return [
                {
                    'ticket': pos.ticket,
                    'symbol': pos.symbol,
                    'type': 'BUY' if pos.type == 0 else 'SELL',
                    'volume': pos.volume,
                    'open_price': pos.price_open,
                    'current_price': pos.price_current,
                    'profit': pos.profit,
                    'sl': pos.sl,
                    'tp': pos.tp
                }
                for pos in positions
            ]
            
        except Exception as e:
            logger.error(f"Error getting positions: {str(e)}")
            return None
    
    # Mock methods for development
    def _get_mock_account_info(self) -> Dict[str, Any]:
        """Get mock account info for development"""
        return {
            'login': 12345678,
            'name': 'Demo Account',
            'server': 'Demo Server',
            'currency': 'USD',
            'balance': 10000.0,
            'credit': 0.0,
            'equity': 10000.0,
            'margin': 0.0,
            'free_margin': 10000.0,
            'margin_level': 0.0,
            'leverage': 100,
            'profit': 0.0,
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_mock_symbol_info(self, symbol: str) -> Dict[str, Any]:
        """Get mock symbol info for development"""
        return {
            'symbol': symbol,
            'bid': 1.0850,
            'ask': 1.0852,
            'point': 0.0001,
            'digits': 4,
            'spread': 2,
            'volume': 1000000,
            'time': int(datetime.now().timestamp())
        }
    
    def _get_mock_rates(self, symbol: str, count: int) -> list:
        """Get mock rates for development"""
        import random
        from datetime import timedelta
        
        rates = []
        current_price = 1.0850
        current_time = datetime.now()
        
        for i in range(count):
            change = random.uniform(-0.001, 0.001)
            current_price += change
            
            rates.append({
                'time': int((current_time - timedelta(minutes=i)).timestamp()),
                'open': current_price - change,
                'high': current_price + abs(change) * 0.5,
                'low': current_price - abs(change) * 0.5,
                'close': current_price,
                'volume': random.randint(1000, 10000)
            })
        
        return list(reversed(rates))
