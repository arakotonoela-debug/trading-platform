import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.id || 'unknown';

  // Log incoming request
  logger.info({
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Intercept response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });

    return originalSend.call(this, data);
  };

  next();
};

// Audit logger for sensitive operations
export const auditLog = (action: string, userId: string, details: any) => {
  logger.info({
    type: 'AUDIT',
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};
