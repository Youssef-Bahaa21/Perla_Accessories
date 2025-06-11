import { Router } from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    getProductImages,
    deleteProductImage,
} from '../controllers/product.controller';

import { saveImages } from '../middlewares/upload.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

/* ---------- Public Catalogue ---------- */
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:productId/images', getProductImages);

/* ---------- Admin-Protected CRUD ---------- */
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

/* ---------- Image Upload/Delete (Admin Only) ---------- */
router.post(
    '/:productId/images',
    authenticate,
    isAdmin,
    saveImages('images', 5),
    uploadProductImages
);

router.delete(
    '/:productId/images/:imageId',
    authenticate,
    isAdmin,
    deleteProductImage
);

export default router;
