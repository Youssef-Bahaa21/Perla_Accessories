// src/middlewares/security.ts

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import express from 'express';

const security = express.Router();

// Helmet: secure headers with strong CSP
security.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "unpkg.com", "ajax.googleapis.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.jsdelivr.net"],
            fontSrc: ["'self'", "fonts.gstatic.com", "cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "blob:", "*.cloudinary.com", "res.cloudinary.com"],
            connectSrc: ["'self'", ...(process.env.FRONTEND_ORIGIN?.split(',') || ["http://localhost:4200"])],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "*.cloudinary.com"],
        },
    },
}));

// Other important headers
security.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
security.use(helmet.permittedCrossDomainPolicies());
security.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
}));

// Add X-Content-Type-Options
security.use(helmet.noSniff());

// Add X-Frame-Options
security.use(helmet.frameguard({ action: 'deny' }));

// Prevent HTTP Parameter Pollution
security.use(hpp());

// General rate limiter: all API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 200,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
security.use(limiter);

// 🔒 Login-specific limiter
export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Reduced for production
    message: 'Too many login attempts. Please try again after 10 minutes.',
    skipSuccessfulRequests: true,
});

// 🔐 Register-specific limiter
export const registerLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Reduced for production
    message: 'Too many account creation attempts. Please try again later.',
});

// 🧑‍💻 Auth/me endpoint limiter - More permissive but still protected
export const authMeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many authentication status checks. Please try again shortly.',
});

// 🔄 Auth refresh endpoint limiter
export const refreshLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 refresh attempts per minute
    message: 'Too many token refresh attempts. Please try again shortly.',
});

// 📧 Email rate limiter for password reset
export const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 emails per hour per IP
    message: 'Too many password reset emails. Please try again later.',
});

export default security;
