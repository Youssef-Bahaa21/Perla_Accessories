// server/src/routes/categories.ts
import { Router } from 'express';
import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
    deleteCategoryImage
} from '../controllers/category.controller';
import { saveImages } from '../middlewares/upload.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin-only routes
router.post('/', authenticate, isAdmin, createCategory);
router.put('/:id', authenticate, isAdmin, updateCategory);
router.delete('/:id', authenticate, isAdmin, deleteCategory);

// Image upload routes
router.post('/:id/image', authenticate, isAdmin, saveImages('image', 1), uploadCategoryImage);
router.delete('/:id/image', authenticate, isAdmin, deleteCategoryImage);

export default router;
