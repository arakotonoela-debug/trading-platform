import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import tradeRoutes from './routes/trades';
import strategyRoutes from './routes/strategies';
import dashboardRoutes from './routes/dashboard';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';

// Import services
import { initializeTradingEngine } from './services/tradingEngine';
import { initializeMonitoring } from './services/monitoringService';

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging Middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Request ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Initialize Services
async function initializeServices() {
  try {
    console.log('🚀 Initialisation des services...');
    
    // Initialize Trading Engine
    if (process.env.TRADING_ENABLED === 'true') {
      await initializeTradingEngine();
      console.log('✅ Moteur de trading initialisé');
    }
    
    // Initialize Monitoring
    await initializeMonitoring();
    console.log('✅ Monitoring initialisé');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Start Server
async function startServer() {
  try {
    // Initialize services
    await initializeServices();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  🤖 PLATEFORME DE TRADING AUTOMATIQUE                      ║
║  Trading Platform v1.0                                     ║
╠════════════════════════════════════════════════════════════╣
║  ✅ Serveur démarré avec succès                            ║
║  📍 URL: http://${HOST}:${PORT}                            ║
║  🌍 Environment: ${process.env.NODE_ENV}                   ║
║  🔐 CORS Origin: ${process.env.CORS_ORIGIN}               ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM reçu, arrêt gracieux...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT reçu, arrêt gracieux...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
