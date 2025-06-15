import { Router } from 'express';
import {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
} from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

router.get('/', getReviews);
router.get('/:id', getReview);
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, isAdmin, updateReview);
router.delete('/:id', authenticate, isAdmin, deleteReview);

export default router;
