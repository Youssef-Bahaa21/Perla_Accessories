import { RequestHandler } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import validateBody from '../middlewares/validate';
import { sendResetEmail } from '../utils/mailer';

const svc = new AuthService();

const accessOpts = {
    httpOnly: true,
    sameSite: 'none' as const, // Changed to 'none' for cross-origin
    secure: true, // Always true for production (Railway/Vercel)
    maxAge: 15 * 60 * 1000,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser handle domain
};

const refreshOpts = {
    httpOnly: true,
    sameSite: 'none' as const, // Changed to 'none' for cross-origin
    secure: true, // Always true for production (Railway/Vercel)
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser handle domain
};

const registerHandler: RequestHandler = async (req, res, next) => {
    try {
        const dto = req.body as RegisterDto;
        const { user, token } = await svc.register(dto);

        // Don't set cookies or auto-login
        res.status(201).json({
            message: 'Registration successful. Please login to continue.',
            user
        });
    } catch (e) {
        next(e);
    }
};
export const register = [validateBody(RegisterDto), registerHandler];

const loginHandler: RequestHandler = async (req, res, next) => {
    try {
        const dto = req.body as RegisterDto;
        const { user, token } = await svc.login(dto.email, dto.password);
        const refresh = await svc.generateRefreshToken(user.id);

        res
            .cookie('token', token, accessOpts)
            .cookie('refresh_token', refresh, refreshOpts)
            .json({ message: 'Login successful', user });
    } catch (e) {
        next(e);
    }
};
export const login = [validateBody(RegisterDto), loginHandler];

export const refresh: RequestHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        console.log('🔄 Refresh token request:', {
            hasRefreshToken: !!refreshToken,
            refreshTokenPreview: refreshToken ? refreshToken.substring(0, 10) + '...' : 'none',
            cookies: Object.keys(req.cookies),
            cookieHeader: req.get('Cookie')?.substring(0, 100),
            origin: req.get('Origin'),
            userAgent: req.get('User-Agent')?.substring(0, 50)
        });

        if (!refreshToken) {
            console.log('❌ No refresh token provided, all cookies:', req.cookies);
            res.status(401).json({ error: 'No refresh token provided' });
            return;
        }

        const newAccess = await svc.refreshAccessToken(refreshToken);
        if (!newAccess) {
            console.log('❌ Invalid or expired refresh token:', refreshToken.substring(0, 10) + '...');
            res.status(403).json({ error: 'Invalid or expired refresh token' });
            return;
        }

        console.log('✅ Token refresh successful, setting new access token');
        res.cookie('token', newAccess, accessOpts).json({ message: 'Token refreshed' });
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        res.status(500).json({ error: 'Token refresh failed' });
    }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
    const { email } = req.body;
    try {
        const token = await svc.forgotPassword(email);

        // Only send email if a token was generated (user exists)
        if (token) {
            await sendResetEmail(email, token);
        }

        // Always return the same message to prevent user enumeration
        res.json({ message: 'If this email exists, a reset link was sent.' });
    } catch (e) {
        next(e);
    }
};


export const resetPassword: RequestHandler = async (req, res, next) => {
    const { token, password } = req.body;
    try {
        await svc.resetPassword(token, password);
        res.json({ message: 'Password updated successfully' });
    } catch (e) {
        next(e);
    }
};

export const logout: RequestHandler = async (req, res) => {
    const token = req.cookies.refresh_token;
    if (token) await svc.revokeRefreshToken(token);

    // Clear cookies with same options used to set them
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'none' as const,
        secure: true,
        path: '/',
    });
    res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'none' as const,
        secure: true,
        path: '/',
    });
    res.sendStatus(204);
};
