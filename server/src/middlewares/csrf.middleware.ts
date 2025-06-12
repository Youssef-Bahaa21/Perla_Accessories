import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import express from 'express';

const csrfProtection = csrf({
    cookie: {
        httpOnly: false, // Allow Angular to read the token
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
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
csrfMiddleware.use(csrfProtection);

// Enhanced error handling for CSRF errors
csrfMiddleware.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'CSRF token validation failed. Please refresh the page and try again.',
            code: 'CSRF_INVALID'
        });
    } else {
        next(err);
    }
});

// Provide a route to get CSRF token
csrfMiddleware.get('/csrf-token', (req, res) => {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, {
        httpOnly: false, // Allow Angular to read it
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
    res.json({
        message: 'CSRF token set in cookie',
        token: token // Also return in response for debugging
    });
});

export default csrfMiddleware;
