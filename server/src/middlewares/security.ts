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

// Import enhanced rate limiters
import {
    loginLimiter,
    accountCreationLimiter as registerLimiter,
    refreshTokenLimiter as refreshLimiter,
    passwordResetLimiter as emailLimiter,
    generalApiLimiter as authMeLimiter
} from './rate-limit.middleware';

// Re-export for backward compatibility
export { loginLimiter, registerLimiter, refreshLimiter, emailLimiter, authMeLimiter };

export default security;
