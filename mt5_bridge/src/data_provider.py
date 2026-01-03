"""
Data Provider - Fetches and manages market data
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class DataProvider:
    """Provides market data from MT5"""
    
    def __init__(self, mt5_connector):
        """
        Initialize data provider
        
        Args:
            mt5_connector: MT5 connector instance
        """
        self.mt5 = mt5_connector
        self.cache = {}
        self.cache_ttl = 5  # 5 seconds
    
    def get_ohlc(self, symbol: str, timeframe: int, count: int = 100) -> Optional[List[Dict[str, Any]]]:
        """
        Get OHLC data
        
        Args:
            symbol: Trading symbol
            timeframe: Timeframe in minutes (1, 5, 15, 30, 60, 240, 1440)
            count: Number of candles to fetch
            
        Returns:
            List of OHLC candles or None
        """
        try:
            cache_key = f"{symbol}_{timeframe}"
            
            # Check cache
            if cache_key in self.cache:
                cached_data, cached_time = self.cache[cache_key]
                if (datetime.now() - cached_time).seconds < self.cache_ttl:
                    return cached_data
            
            # Fetch from MT5
            rates = self.mt5.get_rates(symbol, timeframe, count)
            
            if rates is None:
                logger.warning(f"Failed to get rates for {symbol}")
                return None
            
            # Cache the data
            self.cache[cache_key] = (rates, datetime.now())
            
            return rates
            
        except Exception as e:
            logger.error(f"Error getting OHLC data: {str(e)}")
            return None
    
    def get_tick_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get current tick data
        
        Args:
            symbol: Trading symbol
            
        Returns:
            Tick data or None
        """
        try:
            symbol_info = self.mt5.get_symbol_info(symbol)
            
            if symbol_info is None:
                logger.warning(f"Failed to get symbol info for {symbol}")
                return None
            
            return {
                'symbol': symbol,
                'bid': symbol_info['bid'],
                'ask': symbol_info['ask'],
                'spread': symbol_info['spread'],
                'time': symbol_info['time']
            }
            
        except Exception as e:
            logger.error(f"Error getting tick data: {str(e)}")
            return None
    
    def get_multiple_symbols(self, symbols: List[str], timeframe: int) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get OHLC data for multiple symbols
        
        Args:
            symbols: List of trading symbols
            timeframe: Timeframe in minutes
            
        Returns:
            Dictionary of symbol -> OHLC data
        """
        data = {}
        
        for symbol in symbols:
            rates = self.get_ohlc(symbol, timeframe)
            if rates:
                data[symbol] = rates
        
        return data
    
    def get_account_info(self) -> Optional[Dict[str, Any]]:
        """Get account information"""
        try:
            return self.mt5.get_account_info()
        except Exception as e:
            logger.error(f"Error getting account info: {str(e)}")
            return None
    
    def get_positions(self) -> Optional[List[Dict[str, Any]]]:
        """Get open positions"""
        try:
            return self.mt5.get_positions()
        except Exception as e:
            logger.error(f"Error getting positions: {str(e)}")
            return None
    
    def clear_cache(self):
        """Clear data cache"""
        self.cache.clear()
        logger.info("Data cache cleared")
    
    def get_market_status(self) -> Dict[str, Any]:
        """Get market status"""
        try:
            account_info = self.get_account_info()
            
            if not account_info:
                return {'status': 'disconnected'}
            
            return {
                'status': 'connected',
                'server': account_info.get('server', 'Unknown'),
                'balance': account_info.get('balance', 0),
                'equity': account_info.get('equity', 0),
                'free_margin': account_info.get('free_margin', 0),
                'margin_level': account_info.get('margin_level', 0),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting market status: {str(e)}")
            return {'status': 'error', 'message': str(e)}
