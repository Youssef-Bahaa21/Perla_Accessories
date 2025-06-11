import cors from 'cors';

/**
 * Reads FRONTEND_ORIGIN from .env (comma‑separated list) and
 * enables credentials so browsers can send the cookie.
 *
 * Example .env:
 *   FRONTEND_ORIGIN=https://perla-shop.com,http://localhost:4200
 */
const allowed = (process.env.FRONTEND_ORIGIN ||
    'http://localhost:4200').split(',');

export default cors({
    origin: allowed,
    credentials: true,      // <‑‑ send & receive cookies
});
