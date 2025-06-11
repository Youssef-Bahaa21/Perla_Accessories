import { Router } from 'express';
import {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder
} from '../controllers/order.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Admin-only
router.get('/', authenticate, getOrders);
router.put('/:id', authenticate, updateOrder);
router.delete('/:id', authenticate, deleteOrder);

// Customer access (supports guest checkout)
router.get('/:id', optionalAuthenticate, getOrder);
router.post('/', optionalAuthenticate, createOrder);

export default router;
