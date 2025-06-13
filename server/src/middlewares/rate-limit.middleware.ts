import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * Check if user is admin to bypass rate limits
 */
async function isAdminUser(req: Request): Promise<boolean> {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) return false;

        const user = await authService.verifyToken(token);
        return user?.role === 'admin';
    } catch {
        return false;
    }
}

/**
 * Create rate limiter with admin bypass
 */
function createRateLimiter(options: any) {
    const limiter = rateLimit(options);

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is admin
            const isAdmin = await isAdminUser(req);
            if (isAdmin) {
                console.log('🔓 Rate limit bypassed for admin user');
                return next();
            }

            // Apply rate limit for non-admin users
            return limiter(req, res, next);
        } catch (error) {
            console.error('Rate limit check error:', error);
            // If error checking admin status, apply rate limit anyway
            return limiter(req, res, next);
        }
    };
}

// 🔐 Password Reset Rate Limiter - Max 3 per hour per IP
export const passwordResetLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        error: 'Too many password reset attempts. Maximum 3 per hour allowed.',
        retryAfter: '1 hour',
        type: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Use IP + email if available for more specific limiting
        const email = req.body?.email || '';
        return `password_reset:${req.ip}:${email}`;
    }
});

// 👥 Account Creation Rate Limiter - Max 2 per day per IP
export const accountCreationLimiter = createRateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 2,
    message: {
        error: 'Too many account creation attempts. Maximum 2 per day allowed.',
        retryAfter: '24 hours',
        type: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => `account_creation:${req.ip}`
});

// 📁 File Upload Rate Limiter - Max 10MB per hour per IP
let uploadTracker: Map<string, { size: number; resetTime: number }> = new Map();

export const fileUploadLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if user is admin
        const isAdmin = await isAdminUser(req);
        if (isAdmin) {
            console.log('🔓 File upload limit bypassed for admin user');
            return next();
        }

        const ip = req.ip;
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const maxSizePerHour = 10 * 1024 * 1024; // 10MB

        // Get current file size
        let currentFileSize = 0;
        if (req.file) {
            currentFileSize = req.file.size;
        } else if (req.files) {
            if (Array.isArray(req.files)) {
                currentFileSize = req.files.reduce((total, file) => total + file.size, 0);
            } else {
                currentFileSize = Object.values(req.files).flat().reduce((total: number, file: any) => total + file.size, 0);
            }
        }

        // Get or create tracker for this IP
        let tracker = uploadTracker.get(ip);
        if (!tracker || now > tracker.resetTime) {
            tracker = { size: 0, resetTime: now + oneHour };
        }

        // Check if adding this upload would exceed the limit
        if (tracker.size + currentFileSize > maxSizePerHour) {
            const remainingTime = Math.ceil((tracker.resetTime - now) / 60000); // minutes
            return res.status(429).json({
                error: 'File upload size limit exceeded. Maximum 10MB per hour allowed.',
                retryAfter: `${remainingTime} minutes`,
                type: 'UPLOAD_LIMIT_EXCEEDED',
                currentUsage: tracker.size,
                limit: maxSizePerHour
            });
        }

        // Update tracker
        tracker.size += currentFileSize;
        uploadTracker.set(ip, tracker);

        // Clean up old entries periodically
        if (Math.random() < 0.01) { // 1% chance
            for (const [key, value] of uploadTracker.entries()) {
                if (now > value.resetTime) {
                    uploadTracker.delete(key);
                }
            }
        }

        next();
    } catch (error) {
        console.error('File upload rate limit error:', error);
        next(error);
    }
};

// 🔑 Login Rate Limiter - More lenient for testing
export const loginLimiter = createRateLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes (reduced from 15)
    max: 10, // increased from 5 for more attempts
    message: {
        error: 'Too many login attempts. Please try again in 2 minutes.',
        retryAfter: '2 minutes',
        type: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request) => {
        // Combine IP and email for more specific rate limiting
        const email = req.body?.email || '';
        return `login:${req.ip}:${email}`;
    }
});

// 🔄 Token Refresh Rate Limiter
export const refreshTokenLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        error: 'Too many token refresh attempts. Please try again shortly.',
        retryAfter: '1 minute',
        type: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// 📊 API Rate Limiters - Different limits for authenticated vs unauthenticated users
export const createApiLimiter = (authMax: number, unauthMax: number, windowMs: number = 15 * 60 * 1000) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is admin first
            const isAdmin = await isAdminUser(req);
            if (isAdmin) {
                console.log('🔓 API rate limit bypassed for admin user');
                return next();
            }

            // Check if user is authenticated
            const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
            const isAuthenticated = !!token;

            const maxRequests = isAuthenticated ? authMax : unauthMax;
            const keyPrefix = isAuthenticated ? 'api_auth' : 'api_unauth';

            const limiter = rateLimit({
                windowMs,
                max: maxRequests,
                message: {
                    error: `Too many API requests. ${isAuthenticated ? 'Authenticated' : 'Unauthenticated'} users are limited to ${maxRequests} requests per ${Math.floor(windowMs / 60000)} minutes.`,
                    retryAfter: `${Math.floor(windowMs / 60000)} minutes`,
                    type: 'RATE_LIMIT_EXCEEDED',
                    authenticated: isAuthenticated
                },
                standardHeaders: true,
                legacyHeaders: false,
                keyGenerator: (req: Request) => `${keyPrefix}:${req.ip}`
            });

            return limiter(req, res, next);
        } catch (error) {
            console.error('API rate limit check error:', error);
            // If error, apply stricter limit
            const fallbackLimiter = rateLimit({
                windowMs,
                max: unauthMax,
                message: {
                    error: 'Too many API requests. Please try again later.',
                    retryAfter: `${Math.floor(windowMs / 60000)} minutes`,
                    type: 'RATE_LIMIT_EXCEEDED'
                }
            });
            return fallbackLimiter(req, res, next);
        }
    };
};

// 🛒 E-commerce specific rate limiters
export const productApiLimiter = createApiLimiter(200, 50); // Higher limits for product browsing
export const orderApiLimiter = createApiLimiter(30, 5);     // Lower limits for order operations
export const reviewApiLimiter = createApiLimiter(20, 5);    // Moderate limits for reviews
export const generalApiLimiter = createApiLimiter(100, 20); // General API endpoints

// 🔍 Search Rate Limiter
export const searchLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        error: 'Too many search requests. Please slow down.',
        retryAfter: '1 minute',
        type: 'RATE_LIMIT_EXCEEDED'
    },
    keyGenerator: (req: Request) => `search:${req.ip}`
});

// 📧 Email/Contact Rate Limiter
export const emailLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        error: 'Too many email requests. Maximum 5 per hour allowed.',
        retryAfter: '1 hour',
        type: 'RATE_LIMIT_EXCEEDED'
    },
    keyGenerator: (req: Request) => `email:${req.ip}`
});

// 🛡️ Brute force protection for critical endpoints
export const criticalEndpointLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        error: 'Too many requests to critical endpoint. Please try again later.',
        retryAfter: '1 hour',
        type: 'RATE_LIMIT_EXCEEDED'
    },
    keyGenerator: (req: Request) => `critical:${req.ip}:${req.path}`
});

// Clean up upload tracker periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of uploadTracker.entries()) {
        if (now > value.resetTime) {
            uploadTracker.delete(key);
        }
    }
}, 60 * 60 * 1000); // Clean up every hour 