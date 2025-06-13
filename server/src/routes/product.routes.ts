import { Router } from 'express';
import * as controller from '../controllers/product.controller';
import { saveProductImages } from '../middlewares/upload.middleware';

const router = Router();

// Get products with pagination
router.get('/', controller.getProducts);

// Get a single product
router.get('/:id', controller.getProduct);

// Create a product
router.post('/', controller.createProduct);

// Update a product
router.put('/:id', controller.updateProduct);

// Delete a product
router.delete('/:id', controller.deleteProduct);

// Upload images for a product
router.post('/:productId/images', saveProductImages('images', 5), controller.uploadProductImages);

// Get images for a product
router.get('/:productId/images', controller.getProductImages);

// Delete an image
router.delete('/:productId/images/:imageId', controller.deleteProductImage);

export default router; 