import cors from 'cors';

/**
 * Reads FRONTEND_ORIGIN from .env (comma‑separated list) and
 * enables credentials so browsers can send the cookie.
 *
 * Example .env:
 *   FRONTEND_ORIGIN=https://perla-accessories.vercel.app,http://localhost:4200
 */
const allowed = (process.env.FRONTEND_ORIGIN ||
    'http://localhost:4200,https://perla-accessories.vercel.app').split(',');

// Add specific Vercel domains - we can't use regex patterns with credentials mode
const specificOrigins = [
    'http://localhost:4200',
    'https://perla-accessories.vercel.app',
    'https://perla-accessories-git-master-youssefbahaa21.vercel.app',
    'https://perla-accessories.vercel.app'
];

// Combine environment origins with defaults (deduplicated)
const allOrigins = [...new Set([...allowed, ...specificOrigins])];

export default cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        // When using withCreds (credentials: true), origin can't be wildcard
        // or regex - it must be the specific origin
        if (allOrigins.includes(origin)) {
            callback(null, true);  // true, not the origin
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,      // <‑‑ send & receive cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token'],
    exposedHeaders: ['Set-Cookie']
});
