import { Router } from 'express';
import {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
} from '../controllers/review.controller';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

router.get('/', getReviews);
router.get('/:id', getReview);
router.post('/', createReview);
router.put('/:id', isAdmin, updateReview);
router.delete('/:id', isAdmin, deleteReview);

export default router;
