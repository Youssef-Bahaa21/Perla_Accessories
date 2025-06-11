import { RequestHandler } from 'express';
import { saveImages } from '../middlewares/upload.middleware';
import {
    ProductService,
    CreateProductDTO,
    UpdateProductDTO,
} from '../services/product.service';

const svc = new ProductService();

/* -------------------------------------------------
 * GET /api/products?page=1&limit=20
 *   – returns { data, page, limit, total }
 * ------------------------------------------------- */
export const getProducts: RequestHandler = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));

        const result = await svc.findPage(page, limit);

        // Format the response to match frontend expectations
        const formattedResult = {
            ...result,
            data: result.data.map((product: any) => ({
                ...product,
                images: product.images.map((img: any) => ({
                    id: img.id,
                    url: img.image, // Map 'image' to 'url' for frontend
                    public_id: img.public_id
                }))
            }))
        };

        res.json(formattedResult);
    } catch (err) { next(err); }
};

/* -------------------------------------------------
 * GET /api/products/:id
 *   – returns a single product with all details
 * ------------------------------------------------- */
export const getProduct: RequestHandler = async (req, res, next) => {
    try {
        const product = await svc.findById(+req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Format product to match frontend expectations
        const formattedProduct = {
            ...product,
            images: product.images.map((img: any) => ({
                id: img.id,
                url: img.image, // Map 'image' to 'url' for frontend
                public_id: img.public_id
            }))
        };

        res.json(formattedProduct);
    } catch (err) { next(err); }
};

/* -------------------------------------------------
 * POST /api/products - Create a new product
 * ------------------------------------------------- */
export const createProduct: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateProductDTO = req.body;
        const product = await svc.create(dto);
        res.status(201).json(product);
    } catch (err) { next(err); }
};

/* -------------------------------------------------
 * PUT /api/products/:id - Update a product
 * ------------------------------------------------- */
export const updateProduct: RequestHandler = async (req, res, next) => {
    try {
        const dto: UpdateProductDTO = req.body;
        const updated = await svc.update(+req.params.id, dto);
        if (!updated) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) { next(err); }
};

/* -------------------------------------------------
 * DELETE /api/products/:id - Delete a product
 * ------------------------------------------------- */
export const deleteProduct: RequestHandler = async (req, res, next) => {
    try {
        const productId = +req.params.id;

        // Get the product images first
        const images = await svc.getProductImages(productId);

        // Delete the product
        const deleted = await svc.delete(productId);
        if (!deleted) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // No need to delete files from disk as they're on Cloudinary now

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) { next(err); }
};

/* ------------------------------------------------- */
export const getProductImages: RequestHandler = async (req, res, next) => {
    try {
        const images = await svc.getProductImages(+req.params.productId);

        // Format images to match frontend expectations
        const formattedImages = images.map(img => ({
            id: img.id,
            url: img.image,
            public_id: img.public_id
        }));

        res.json(formattedImages);
    } catch (err) { next(err); }
};

/* ------------------------------------------------- */
export const deleteProductImage: RequestHandler = async (req, res, next) => {
    try {
        const productId = +req.params.productId;
        const imageId = +req.params.imageId;

        // Get the image first to get the public_id for Cloudinary deletion
        const image = await svc.getProductImageById(imageId);
        if (!image) {
            res.status(404).json({ message: 'Image not found' });
            return;
        }

        // Delete from database
        const deleted = await svc.deleteProductImage(productId, imageId);
        if (!deleted) {
            res.status(404).json({ message: 'Image not found' });
            return;
        }

        // Extract the public_id from the URL or stored public_id field
        if (image.public_id) {
            try {
                // If you stored the public_id directly
                const { cloudinary } = await import('../config/cloudinary');
                await cloudinary.uploader.destroy(image.public_id);
            } catch (cloudinaryErr) {
                console.error('Error deleting from Cloudinary:', cloudinaryErr);
                // Continue execution, as the DB record is already deleted
            }
        }

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (err) { next(err); }
};

/* ------------------------------------------------- */
export const uploadProductImages: RequestHandler = async (req, res, next) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files?.length) {
            res.status(400).json({ message: 'No images uploaded' });
            return;
        }

        console.log('Cloudinary files:', files);

        // Cloudinary adds path and filename properties differently than local storage
        const imageData = files.map(file => {
            // Log the file object to see its structure
            console.log('File object:', JSON.stringify(file, null, 2));

            return {
                public_id: file.filename || file.path?.split('/').pop() || '',
                secure_url: file.path || ''
            };
        });

        console.log('Image data for DB:', JSON.stringify(imageData, null, 2));

        // Store the Cloudinary URLs in the database
        const result = await svc.uploadCloudinaryImages(
            +req.params.productId,
            imageData
        );

        // Format images to match frontend expectations
        const formattedImages = result.images.map((img: any) => ({
            id: img.id,
            url: img.image,
            public_id: img.public_id
        }));

        res.status(201).json({ success: true, images: formattedImages });
    } catch (err) {
        console.error('Upload error:', err);
        next(err);
    }
};