import { Router } from 'express';
import { register, login, logout, refresh, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { loginLimiter, registerLimiter, authMeLimiter, refreshLimiter, emailLimiter } from '../middlewares/security';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refreshLimiter, refresh);


router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Modified /me endpoint to handle unauthenticated users gracefully
router.get('/me', authMeLimiter, (req, res) => {
    const token = req.cookies.token;

    console.log('👤 /me request:', {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
        cookies: Object.keys(req.cookies),
        origin: req.get('Origin')
    });

    if (!token) {
        console.log('👤 No token provided, returning null user');
        // Return null user with 200 status instead of 401
        res.status(200).json(null);
        return;
    }

    try {
        const payload = authService.verifyToken(token);
        console.log('👤 Token verified successfully for user:', payload.id);
        res.json(payload);
    } catch (err) {
        console.log('👤 Token verification failed:', err instanceof Error ? err.message : 'Unknown error');
        // Return null user with 200 status instead of 401
        res.status(200).json(null);
    }
});

export default router;
