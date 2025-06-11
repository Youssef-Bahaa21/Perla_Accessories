import { Router } from 'express';
import { getCouponUsage } from '../controllers/coupon-usage.controller';
import {
    listCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/coupon.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

router.get('/', authenticate, isAdmin, listCoupons);
router.get('/:id', authenticate, isAdmin, getCoupon);
router.post('/', authenticate, isAdmin, createCoupon);
router.put('/:id', authenticate, isAdmin, updateCoupon);
router.delete('/:id', authenticate, isAdmin, deleteCoupon);
router.get('/:id/usage', authenticate, isAdmin, getCouponUsage);

// Public access for validation
router.post('/validate', validateCoupon);

export default router;
