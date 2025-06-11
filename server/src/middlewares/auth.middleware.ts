import { RequestHandler } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * Verify the JWT carried in the `token` cookie.
 *   – if valid ➜ attaches `req.user` and continues
 *   – if missing / bad ➜ responds 401
 */
export const authenticate: RequestHandler = (req, res, next) => {
    const token = req.cookies.token;               // ← cookie, not Authorization header
    if (!token) {
        res.sendStatus(401);
        return;
    }

    try {
        const payload = authService.verifyToken(token);
        // expose the user payload to downstream handlers
        // eslint‑disable‑next‑line @typescript-eslint/no-explicit-any
        (req as any).user = payload;
        next();
    } catch {
        res.sendStatus(401);
    }
};

/**
 * Optional authentication middleware for guest checkout.
 *   – if valid token ➜ attaches `req.user` and continues
 *   – if missing / bad ➜ continues without user (guest checkout)
 */
export const optionalAuthenticate: RequestHandler = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        // No token - continue as guest
        next();
        return;
    }

    try {
        const payload = authService.verifyToken(token);
        // eslint‑disable‑next‑line @typescript-eslint/no-explicit-any
        (req as any).user = payload;
        next();
    } catch {
        // Invalid token - continue as guest
        next();
    }
};
