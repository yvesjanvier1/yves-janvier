
import DOMPurify from 'dompurify';
import { z } from 'zod';

// HTML Sanitization
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
    ALLOWED_URI_REGEXP: /^https?:\/\/|^\/|^#/i
  });
};

// Input Validation Schemas
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters'),
  email: z.string()
    .email('Invalid email address')
    .max(320, 'Email is too long'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
});

export const blogPostSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content is too long'),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  cover_image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(10, 'Too many tags')
});

// Enhanced rate limiting with persistent tracking
import { supabase } from '@/integrations/supabase/client';

// Legacy in-memory rate limiting (fallback only)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Persistent rate limiting using Supabase
export const checkRateLimitPersistent = async (
  identifier: string, 
  maxRequests: number = 5, 
  windowMinutes: number = 5
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit_persistent', {
      p_identifier: identifier,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fall back to in-memory rate limiting
      return checkRateLimit(identifier, maxRequests, windowMinutes * 60000);
    }

    return data === true;
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fall back to in-memory rate limiting
    return checkRateLimit(identifier, maxRequests, windowMinutes * 60000);
  }
};

export const checkRateLimit = (identifier: string, maxRequests: number = 5, windowMs: number = 300000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// CSRF Token generation
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

// Enhanced error sanitization
export const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    // In production, don't expose sensitive error details
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      // Log the full error for debugging but return sanitized message
      console.error('Internal error:', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      return 'An error occurred. Please try again later.';
    }
    return error.message;
  }
  return 'An unknown error occurred';
};

// Secure logging utility
export const secureLog = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(message, {
      error: error?.message || error,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  },
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, data);
    }
  }
};

// Content Security Policy configuration
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://qfnqmdmsapovxdjwdhsx.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://qfnqmdmsapovxdjwdhsx.supabase.co wss://qfnqmdmsapovxdjwdhsx.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

// Honeypot field validation
export const validateHoneypot = (honeypotValue: string): boolean => {
  return honeypotValue === '';
};

// Session timeout management
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const isSessionExpired = (lastActivity: number): boolean => {
  return Date.now() - lastActivity > SESSION_TIMEOUT;
};

// Input sanitization for XSS prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};
