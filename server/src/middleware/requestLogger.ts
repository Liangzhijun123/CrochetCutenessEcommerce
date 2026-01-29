import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.url} - ${req.ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
    
    console.log(`📤 ${statusColor} ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    // Call original end method
    return originalEnd(chunk, encoding, cb);
  };
  
  next();
}