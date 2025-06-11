import { RequestHandler } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import validateBody from '../middlewares/validate';
import { sendResetEmail } from '../utils/mailer';

const svc = new AuthService();

const accessOpts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
};

const refreshOpts = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
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
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        res.sendStatus(401);
        return;
    }

    const newAccess = await svc.refreshAccessToken(refreshToken);
    if (!newAccess) {
        res.sendStatus(403);
        return;
    }

    res.cookie('token', newAccess, accessOpts).json({ message: 'Token refreshed' });
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

    res.clearCookie('token', accessOpts);
    res.clearCookie('refresh_token', refreshOpts);
    res.sendStatus(204);
};
