import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import dotenv from 'dotenv';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

dotenv.config(); import { sendResetEmail } from '../utils/mailer'; // make sure this is imported


/* ----------  SECRET CONFIG  ---------- */
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET || JWT_SECRET.length < 10) {
    throw new Error('Missing JWT_SECRET – check your .env file');
}
/* ------------------------------------- */

export interface RegisterDTO {
    email: string;
    password: string;
}
export interface LoginDTO {
    email: string;
    password: string;
}

export class AuthService {
    private sign(payload: object, expires: StringValue | number = '1h'): string {
        const options: SignOptions = { expiresIn: expires };
        return jwt.sign(payload, JWT_SECRET, options) as string;
    }

    async register(dto: RegisterDTO) {
        const hashed = await bcrypt.hash(dto.password, 10);

        const [result]: any = await pool.query(
            'INSERT INTO `user` (email, password) VALUES (?, ?);',
            [dto.email, hashed],
        );

        const user = { id: result.insertId, email: dto.email, role: 'customer' };

        await pool.query(
            'UPDATE `order` SET user_id = ? WHERE user_id IS NULL AND shipping_email = ?',
            [user.id, user.email],
        );

        const token = this.sign(user);
        return { user, token };
    }

    async login(email: string, password: string) {
        const [rows]: any = await pool.query(
            'SELECT id, email, role, `password` FROM `user` WHERE email = ?',
            [email],
        );
        const user = rows[0];
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid password');

        await pool.query(
            'UPDATE `order` SET user_id = ? WHERE user_id IS NULL AND shipping_email = ?',
            [user.id, user.email],
        );

        const token = this.sign(user);
        return { user, token };
    }

    verifyToken(token: string) {
        return jwt.verify(token, JWT_SECRET) as {
            id: number;
            email: string;
            role: string;
        };
    }

    generateToken(user: { id: number; email: string; role: string }) {
        return this.sign(user);
    }

    async generateRefreshToken(userId: number): Promise<string> {
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt],
        );
        return token;
    }

    async refreshAccessToken(refreshToken: string): Promise<string | null> {
        const [tokens]: any = await pool.query(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW() AND is_revoked = 0',
            [refreshToken],
        );
        if (!tokens.length) return null;

        const userId = tokens[0].user_id;
        const [users]: any = await pool.query(
            'SELECT id, email, role FROM user WHERE id = ?',
            [userId],
        );
        if (!users.length) return null;

        return this.sign(users[0]);
    }

    async revokeRefreshToken(token: string): Promise<void> {
        await pool.query(
            'UPDATE refresh_tokens SET is_revoked = 1 WHERE token = ?',
            [token],
        );
    }

    // ✅ FORGOT PASSWORD

    async forgotPassword(email: string): Promise<string | null> {
        const [users]: any = await pool.query(
            'SELECT id FROM user WHERE email = ?',
            [email]
        );
        if (!users.length) return null;

        const userId = users[0].id;
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await pool.query(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );

        return token;
    }

    // ✅ RESET PASSWORD
    async resetPassword(token: string, password: string): Promise<void> {
        const [resets]: any = await pool.query(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
            [token]
        );
        if (!resets.length) throw new Error('Invalid or expired reset token');

        const userId = resets[0].user_id;
        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            'UPDATE user SET password = ? WHERE id = ?',
            [hashed, userId]
        );

        await pool.query(
            'DELETE FROM password_resets WHERE token = ?',
            [token]
        );
    }
}
