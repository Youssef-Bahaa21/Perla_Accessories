// server/src/controllers/category.controller.ts
import { RequestHandler } from 'express';
import { CategoryService, CreateCategoryDTO, UpdateCategoryDTO } from '../services/category.service';

const svc = new CategoryService();

export const getCategories: RequestHandler = async (_req, res, next) => {
    try {
        res.json(await svc.findAll());
    } catch (err) {
        next(err);
    }
};

export const getCategory: RequestHandler = async (req, res, next) => {
    try {
        const cat = await svc.findOne(+req.params.id);
        if (!cat) {
            res.sendStatus(404);
            return;
        }
        res.json(cat);
    } catch (err) {
        next(err);
    }
};

export const createCategory: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateCategoryDTO = req.body;
        const newCat = await svc.create(dto);
        res.status(201).json(newCat);
    } catch (err) {
        next(err);
    }
};

export const updateCategory: RequestHandler = async (req, res, next) => {
    try {
        const dto: UpdateCategoryDTO = req.body;
        await svc.update(+req.params.id, dto);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};

export const deleteCategory: RequestHandler = async (req, res, next) => {
    try {
        await svc.remove(+req.params.id);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};

export const uploadCategoryImage: RequestHandler = async (req, res, next) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files?.length) {
            res.status(400).json({ message: 'No image uploaded' });
            return;
        }

        // We only need one image for a category
        const file = files[0];

        // Check if the category exists
        const categoryId = +req.params.id;
        const category = await svc.findOne(categoryId);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        // If category already has an image with public_id, delete it from Cloudinary
        if (category.public_id) {
            try {
                const { cloudinary } = await import('../config/cloudinary');
                await cloudinary.uploader.destroy(category.public_id);
            } catch (cloudinaryErr) {
                console.error('Error deleting previous image from Cloudinary:', cloudinaryErr);
                // Continue execution, as we'll update the DB record anyway
            }
        }

        // Prepare image data for DB
        const imageData = {
            public_id: file.filename || file.path?.split('/').pop() || '',
            secure_url: file.path || ''
        };

        // Update the category with the new image
        const result = await svc.uploadCategoryImage(categoryId, imageData);

        if (!result.success) {
            res.status(500).json({ message: 'Failed to update category image' });
            return;
        }

        res.status(200).json({
            success: true,
            category: result.category
        });
    } catch (err) {
        console.error('Upload error:', err);
        next(err);
    }
};

export const deleteCategoryImage: RequestHandler = async (req, res, next) => {
    try {
        const categoryId = +req.params.id;

        // Delete the image from the database and get the public_id
        const result = await svc.deleteCategoryImage(categoryId);

        if (!result.success) {
            res.status(404).json({ message: result.message || 'Image not found' });
            return;
        }

        // Delete from Cloudinary if public_id exists
        if (result.public_id) {
            try {
                const { cloudinary } = await import('../config/cloudinary');
                await cloudinary.uploader.destroy(result.public_id);
            } catch (cloudinaryErr) {
                console.error('Error deleting from Cloudinary:', cloudinaryErr);
                // Continue execution, as the DB record is already updated
            }
        }

        res.status(200).json({
            message: 'Image deleted successfully',
            category: result.category
        });
    } catch (err) {
        next(err);
    }
};
