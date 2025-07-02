
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

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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

// CSRF Token generation (basic implementation)
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

// Error sanitization
export const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    // Don't expose sensitive error details in production
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred. Please try again later.';
    }
    return error.message;
  }
  return 'An unknown error occurred';
};
