import { pool } from '../config/db';
import { CreateCouponDTO, UpdateCouponDTO, ValidateCouponResult } from './types';

export class CouponService {
    async findAll() {
        const [rows] = await pool.query(`SELECT * FROM coupon ORDER BY created_at DESC`);
        return rows;
    }

    async findById(id: number) {
        const [rows] = await pool.query(`SELECT * FROM coupon WHERE id = ?`, [id]);
        return rows[0] || null;
    }

    async findByCode(code: string) {
        const [rows] = await pool.query(
            `SELECT * FROM coupon WHERE LOWER(code) = ? LIMIT 1`,
            [code.toLowerCase().trim()]
        );
        return rows[0] || null;
    }

    async countGlobalUses(couponId: number): Promise<number> {
        const [rows]: any = await pool.query(
            `SELECT COUNT(*) AS cnt FROM coupon_usage WHERE coupon_id = ?`,
            [couponId]
        );
        const { cnt } = rows[0];
        return cnt;
    }

    async countUserUses(couponId: number, userId: number | null, email: string | null): Promise<number> {
        if (userId) {
            const [rows]: any = await pool.query(
                `SELECT COUNT(*) AS cnt FROM coupon_usage WHERE coupon_id = ? AND user_id = ?`,
                [couponId, userId]
            );
            const { cnt } = rows[0];
            return cnt;
        } else if (email) {
            const [rows]: any = await pool.query(
                `SELECT COUNT(*) AS cnt FROM coupon_usage WHERE coupon_id = ? AND email = ?`,
                [couponId, email]
            );
            const { cnt } = rows[0];
            return cnt;
        }
        return 0;
    }

    async autoDisableIfExpiredOrUsedOut(coupon: any) {
        let shouldDisable = false;

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            shouldDisable = true;
        }

        if (coupon.usage_limit) {
            const usage = await this.countGlobalUses(coupon.id);
            if (usage >= coupon.usage_limit) {
                shouldDisable = true;
            }
        }

        if (shouldDisable && coupon.is_active) {
            await pool.query(`UPDATE coupon SET is_active = 0 WHERE id = ?`, [coupon.id]);
        }
    }

    async validate(
        code: string,
        userId: number | null,
        cartTotal: number,
        email: string | null
    ): Promise<ValidateCouponResult> {
        // ✅ Allow both logged-in and guest users, but require user identification
        if (!userId && !email) {
            return { valid: false, message: 'User identification required for coupons' };
        }

        const coupon = await this.findByCode(code);
        if (!coupon) return { valid: false, message: 'Invalid code' };

        await this.autoDisableIfExpiredOrUsedOut(coupon);

        if (!coupon.is_active) {
            return { valid: false, message: 'Coupon is disabled or expired' };
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return { valid: false, message: 'Coupon expired' };
        }

        if (cartTotal < coupon.min_order_amt) {
            return { valid: false, message: `Minimum order is EGP ${coupon.min_order_amt}` };
        }

        const globalUses = await this.countGlobalUses(coupon.id);
        if (coupon.usage_limit && globalUses >= coupon.usage_limit) {
            return { valid: false, message: 'Coupon usage limit reached' };
        }

        const userUses = await this.countUserUses(coupon.id, userId, email);
        if (userUses >= coupon.per_user_limit) {
            return { valid: false, message: 'You’ve already used this coupon' };
        }

        const discount = coupon.type === 'fixed'
            ? coupon.value
            : Math.floor(cartTotal * (coupon.value / 100));

        return { valid: true, discount, coupon };
    }

    async create(dto: CreateCouponDTO) {
        const [res]: any = await pool.query(
            `INSERT INTO coupon (code, type, value, min_order_amt, expires_at, usage_limit, per_user_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dto.code.trim().toLowerCase(),
                dto.type,
                dto.value,
                dto.min_order_amt || 0,
                dto.expires_at || null,
                dto.usage_limit || null,
                dto.per_user_limit || 1,
                dto.is_active ?? 1,
            ]
        );
        return { id: res.insertId, ...dto };
    }

    async update(id: number, dto: UpdateCouponDTO) {
        const fields: string[] = [];
        const params: any[] = [];

        for (const key in dto) {
            fields.push(`${key} = ?`);
            params.push((dto as any)[key]);
        }

        if (!fields.length) return;

        params.push(id);
        await pool.query(`UPDATE coupon SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    async remove(id: number) {
        await pool.query(`DELETE FROM coupon WHERE id = ?`, [id]);
    }
}
