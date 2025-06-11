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

// Add common Vercel patterns and your specific domain
const defaultOrigins = [
    'http://localhost:4200',
    'https://perla-accessories.vercel.app',
    'https://perla-accessories-*.vercel.app', // Vercel preview URLs
    /\.vercel\.app$/ // Any vercel app domain
];

// Combine environment origins with defaults
const allOrigins = [...new Set([...allowed, ...defaultOrigins])];

export default cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        const isAllowed = allOrigins.some(allowedOrigin => {
            if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return allowedOrigin === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,      // <‑‑ send & receive cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-TOKEN'],
    exposedHeaders: ['Set-Cookie']
});
