"""
MT5 Bridge - Main Entry Point
Connects to MetaTrader 5 and provides API for automated trading
"""

import os
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/mt5_bridge.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Import modules
from mt5_connector import MT5Connector
from data_provider import DataProvider
from execution_engine import ExecutionEngine
from risk_manager import RiskManager


class MT5Bridge:
    """Main MT5 Bridge class"""
    
    def __init__(self):
        self.mt5 = None
        self.data_provider = None
        self.execution_engine = None
        self.risk_manager = None
        self.is_running = False
        
    def initialize(self):
        """Initialize all components"""
        try:
            logger.info("🚀 Initializing MT5 Bridge...")
            
            # Initialize MT5 Connector
            self.mt5 = MT5Connector()
            if not self.mt5.connect():
                raise Exception("Failed to connect to MT5")
            logger.info("✅ MT5 connected")
            
            # Initialize Data Provider
            self.data_provider = DataProvider(self.mt5)
            logger.info("✅ Data provider initialized")
            
            # Initialize Execution Engine
            self.execution_engine = ExecutionEngine(self.mt5)
            logger.info("✅ Execution engine initialized")
            
            # Initialize Risk Manager
            self.risk_manager = RiskManager()
            logger.info("✅ Risk manager initialized")
            
            self.is_running = True
            logger.info("🎉 MT5 Bridge initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Initialization failed: {str(e)}")
            raise
    
    def get_market_data(self, symbol, timeframe):
        """Get market data for a symbol"""
        try:
            if not self.data_provider:
                raise Exception("Data provider not initialized")
            
            return self.data_provider.get_ohlc(symbol, timeframe)
            
        except Exception as e:
            logger.error(f"Error getting market data: {str(e)}")
            return None
    
    def execute_trade(self, trade_signal):
        """Execute a trade based on signal"""
        try:
            if not self.execution_engine:
                raise Exception("Execution engine not initialized")
            
            # Validate with risk manager
            if not self.risk_manager.validate_trade(trade_signal):
                logger.warning(f"Trade rejected by risk manager: {trade_signal}")
                return None
            
            # Execute trade
            result = self.execution_engine.execute(trade_signal)
            logger.info(f"Trade executed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error executing trade: {str(e)}")
            return None
    
    def close_trade(self, ticket):
        """Close a trade"""
        try:
            if not self.execution_engine:
                raise Exception("Execution engine not initialized")
            
            result = self.execution_engine.close(ticket)
            logger.info(f"Trade closed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error closing trade: {str(e)}")
            return None
    
    def get_account_info(self):
        """Get account information"""
        try:
            if not self.mt5:
                raise Exception("MT5 not connected")
            
            return self.mt5.get_account_info()
            
        except Exception as e:
            logger.error(f"Error getting account info: {str(e)}")
            return None
    
    def shutdown(self):
        """Shutdown the bridge"""
        try:
            logger.info("⛔ Shutting down MT5 Bridge...")
            
            if self.mt5:
                self.mt5.disconnect()
            
            self.is_running = False
            logger.info("✅ MT5 Bridge shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {str(e)}")


def main():
    """Main entry point"""
    bridge = MT5Bridge()
    
    try:
        # Initialize
        bridge.initialize()
        
        # Keep running
        logger.info("MT5 Bridge is running. Press Ctrl+C to stop.")
        
        while bridge.is_running:
            try:
                # Process market data
                # Generate signals
                # Execute trades
                pass
            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"Error in main loop: {str(e)}")
    
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)
    
    finally:
        bridge.shutdown()


if __name__ == '__main__':
    main()
