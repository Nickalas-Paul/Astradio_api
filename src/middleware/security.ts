import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Rate limiting configuration
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limits for different endpoints
export const chartGenerationLimit = createRateLimit(15 * 60 * 1000, 20); // 20 requests per 15 minutes
export const audioGenerationLimit = createRateLimit(15 * 60 * 1000, 10); // 10 requests per 15 minutes
export const authLimit = createRateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes
export const exportLimit = createRateLimit(60 * 60 * 1000, 5); // 5 exports per hour

// Slow down configuration
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  validate: { delayMs: false } // Disable validation warning
});

// Enhanced helmet configuration
export const enhancedHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.astradio.com", "https://astradio.vercel.app", "https://astradio.io", "https://www.astradio.io"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// Input validation schemas using Zod
export const birthDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().optional().default(0)
});

export const chartGenerationSchema = z.object({
  birth_data: birthDataSchema,
  mode: z.enum(['moments', 'overlay', 'sandbox']).optional().default('moments')
});

export const audioGenerationSchema = z.object({
  chart_data: z.object({
    metadata: z.object({
      birth_datetime: z.string()
    }).passthrough(),
    planets: z.record(z.any())
  }),
  mode: z.enum(['moments', 'overlay', 'sandbox', 'melodic', 'daily_preview']).optional().default('moments'),
  duration: z.number().optional().default(60),
  configuration: z.any().optional()
});

export const authSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().optional()
});

export const sessionSchema = z.object({
  title: z.string().max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  chart_data: z.any(),
  audio_config: z.any().optional(),
  narration: z.any().optional(),
  is_public: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
  remix_of_session_id: z.string().optional()
});

// Input validation middleware
export const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Validation error'
      });
    }
  };
};

// Request size limiter
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request too large',
      details: 'Maximum request size is 10MB'
    });
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!allowedIPs.includes(clientIP || '')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    next();
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // Log suspicious requests
    if (res.statusCode >= 400) {
      console.warn('⚠️ Suspicious request:', logData);
    } else {
      console.log('📝 Request:', logData);
    }
  });
  
  next();
};

// Error handling middleware
export const errorHandler = (err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error('🚨 Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

// CORS configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://astradio.vercel.app',
      'https://astradio-staging.vercel.app',
      'https://astradio.io',
      'https://www.astradio.io'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}; 