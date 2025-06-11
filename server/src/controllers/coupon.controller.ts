// server/src/controllers/coupon.controller.ts
import { RequestHandler } from 'express';
import { CouponService } from '../services/coupon.service';
import { CreateCouponDTO, UpdateCouponDTO } from '../services/types';

const svc = new CouponService();

// GET /coupons - List all coupons
export const listCoupons: RequestHandler = async (_req, res, next) => {
    try {
        const coupons = await svc.findAll();
        res.json(coupons);
    } catch (err) {
        next(err);
    }
};

// GET /coupons/:id - Get one coupon
export const getCoupon: RequestHandler = async (req, res, next) => {
    try {
        const coupon = await svc.findById(+req.params.id);
        if (!coupon) {
            res.status(404).json({ error: 'Coupon not found' });
            return;
        }
        res.json(coupon);
    } catch (err) {
        next(err);
    }
};

// POST /coupons - Create new coupon
export const createCoupon: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateCouponDTO = req.body;
        const newCoupon = await svc.create(dto);
        res.status(201).json(newCoupon);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'Failed to create coupon' });
    }
};

// PUT /coupons/:id - Update coupon
export const updateCoupon: RequestHandler = async (req, res, next) => {
    try {
        const dto: UpdateCouponDTO = req.body;
        await svc.update(+req.params.id, dto);
        res.json({ message: 'Coupon updated' });
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'Failed to update coupon' });
    }
};

// DELETE /coupons/:id - Delete coupon
export const deleteCoupon: RequestHandler = async (req, res, next) => {
    try {
        await svc.remove(+req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (err) {
        next(err);
    }
};

// POST /coupons/validate - Validate coupon against user & order total
export const validateCoupon: RequestHandler = async (req, res, next) => {
    try {
        const { code, userId = null, cartTotal = 0, email = null } = req.body;
        const result = await svc.validate(code, userId, cartTotal, email);

        if (!result.valid) {
            res.status(400).json({ error: result.message });
            return;
        }

        res.json({ code, discount: result.discount });
    } catch (err) {
        next(err);
    }
};
