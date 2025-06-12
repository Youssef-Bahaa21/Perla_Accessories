import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import express from 'express';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

const csrfProtection = csrf({
    cookie: {
        httpOnly: false, // Allow Angular to read the token
        sameSite: 'lax', // Use 'lax' for better compatibility
        secure: isProduction, // Secure cookies only in production
        path: '/',
        maxAge: 3600000, // 1 hour
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // Only protect state-changing methods
    value: (req) => {
        // Check for token in multiple locations (case-insensitive)
        return req.body._token ||
            req.query._token ||
            req.headers['x-csrf-token'] ||
            req.headers['x-xsrf-token'] || // Angular default header
            req.headers['csrf-token']; // Additional fallback
    }
});

const csrfMiddleware = express.Router();

// cookie-parser is required for csurf to work with cookies
csrfMiddleware.use(cookieParser());

// Apply csrfProtection only after parsing cookies
csrfMiddleware.use((req, res, next) => {
    // Add error handling wrapper
    csrfProtection(req, res, (err) => {
        if (err) {
            console.error('CSRF Error:', err.message);
            if (err.code === 'EBADCSRFTOKEN') {
                return res.status(403).json({
                    error: 'Invalid CSRF token',
                    message: 'CSRF token validation failed. Please refresh the page and try again.',
                    code: 'CSRF_INVALID'
                });
            }
            return res.status(500).json({
                error: 'CSRF middleware error',
                message: err.message,
                code: 'CSRF_ERROR'
            });
        }
        next();
    });
});

// Provide a route to get CSRF token
csrfMiddleware.get('/csrf-token', (req, res) => {
    try {
        const token = req.csrfToken();

        // Set cookie with compatible settings
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false, // Allow Angular to read it
            sameSite: 'lax', // Use 'lax' for better compatibility
            secure: isProduction, // Secure in production
            path: '/',
            maxAge: 3600000, // 1 hour
        });

        res.json({
            message: 'CSRF token set successfully',
            token: token,
            environment: process.env.NODE_ENV || 'development',
            secure: isProduction,
            sameSite: 'lax'
        });
    } catch (error) {
        console.error('Error generating CSRF token:', error);
        res.status(500).json({
            error: 'Failed to generate CSRF token',
            message: error.message
        });
    }
});

export default csrfMiddleware;
