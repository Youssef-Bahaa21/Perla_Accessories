import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import express from 'express';

const csrfProtection = csrf({
    cookie: {
        httpOnly: false, // Allow Angular to read the token
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    },
    value: (req) => {
        // Check for token in multiple locations
        return req.body._token ||
            req.query._token ||
            req.headers['x-csrf-token'] ||
            req.headers['x-xsrf-token']; // Angular sends this header
    }
});

const csrfMiddleware = express.Router();

// cookie-parser is required for csurf to work with cookies
csrfMiddleware.use(cookieParser());

// Apply csrfProtection only after parsing cookies
csrfMiddleware.use(csrfProtection);

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
