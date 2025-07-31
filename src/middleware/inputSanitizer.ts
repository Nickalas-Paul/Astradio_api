import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Input sanitization utilities
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:text\/html/gi, '') // Remove data URLs
    .replace(/vbscript:/gi, '') // Remove VBScript
    .trim()
    .slice(0, 1000); // Limit length
};

// Sanitize birth data
export const sanitizeBirthData = (data: any) => {
  return {
    date: sanitizeString(data.date || ''),
    time: sanitizeString(data.time || ''),
    location: sanitizeString(data.location || ''),
    latitude: typeof data.latitude === 'number' ? 
      Math.max(-90, Math.min(90, data.latitude)) : 0,
    longitude: typeof data.longitude === 'number' ? 
      Math.max(-180, Math.min(180, data.longitude)) : 0,
    timezone: typeof data.timezone === 'number' ? 
      Math.max(-12, Math.min(14, data.timezone)) : 0
  };
};

// Sanitize AI prompt inputs
export const sanitizePrompt = (prompt: string): string => {
  return sanitizeString(prompt)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/eval\(/gi, '')
    .replace(/Function\(/gi, '')
    .slice(0, 500); // Limit prompt length
};

// Enhanced validation schemas
export const enhancedBirthDataSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && 
             parsed.getFullYear() >= 1900 && 
             parsed.getFullYear() <= 2100;
    }, 'Date must be between 1900 and 2100'),
  time: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  location: z.string().max(200, 'Location too long'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14).optional().default(0)
});

export const enhancedChartGenerationSchema = z.object({
  birth_data: enhancedBirthDataSchema,
  mode: z.enum(['moments', 'overlay', 'sandbox']).optional().default('moments'),
  options: z.object({
    duration: z.number().min(10).max(300).optional().default(60),
    genre: z.string().max(50).optional(),
    mood: z.string().max(50).optional()
  }).optional()
});

export const enhancedAudioGenerationSchema = z.object({
  chart_data: z.object({
    metadata: z.object({
      birth_datetime: z.string()
    }).passthrough(),
    planets: z.record(z.any())
  }),
  mode: z.enum(['moments', 'overlay', 'sandbox', 'melodic', 'daily_preview']).optional().default('moments'),
  duration: z.number().min(10).max(300).optional().default(60),
  configuration: z.any().optional()
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }
  
  // Sanitize body parameters
  if (req.body) {
    if (typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      });
    }
  }
  
  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    });
  }
  
  next();
};

// Enhanced validation middleware
export const validateEnhancedInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = {
        ...req.body,
        ...req.query,
        ...req.params
      };
      
      const validatedData = schema.parse(dataToValidate);
      
      // Replace request data with validated data
      req.body = { ...req.body, ...validatedData };
      req.query = { ...req.query, ...validatedData };
      req.params = { ...req.params, ...validatedData };
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
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

// Prevent SQL injection patterns
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(union|select)\b.*\b(from|where)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\b(exec|execute|sp_|xp_)\b)/i
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  // Check query parameters
  if (req.query && Object.values(req.query).some(checkValue)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }
  
  // Check body parameters
  if (req.body && Object.values(req.body).some(checkValue)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }
  
  // Check URL parameters
  if (req.params && Object.values(req.params).some(checkValue)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }
  
  next();
};

// Prevent XSS patterns
export const preventXSS = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  // Check all input sources
  const allInputs = { ...req.query, ...req.body, ...req.params };
  
  if (Object.values(allInputs).some(checkValue)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }
  
  next();
};

// Log suspicious activities
export const logSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<script\b/gi,
    /eval\(/gi,
    /Function\(/gi
  ];
  
  const checkSuspicious = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const allInputs = { ...req.query, ...req.body, ...req.params };
  
  if (Object.values(allInputs).some(checkSuspicious)) {
    console.warn('🚨 Suspicious activity detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}; 