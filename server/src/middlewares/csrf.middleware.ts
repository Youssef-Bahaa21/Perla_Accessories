import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import express from 'express';

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    },
});

const csrfMiddleware = express.Router();

// cookie-parser is required for csurf to work with cookies
csrfMiddleware.use(cookieParser());

// Apply csrfProtection only after parsing cookies
csrfMiddleware.use(csrfProtection);

// Provide a route to get CSRF token
csrfMiddleware.get('/csrf-token', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
    res.json({ message: 'CSRF token set in cookie' });
});


export default csrfMiddleware;
