// server/src/services/category.service.ts
import { pool } from '../config/db';

export interface CreateCategoryDTO {
    name: string;
    description?: string;
}

export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
}

export interface CloudinaryImageData {
    public_id: string;
    secure_url: string;
}

export class CategoryService {
    async findAll() {
        const [rows] = await pool.query(
            'SELECT id, name, description, created_at, image, public_id FROM category;'
        );
        return rows;
    }

    async findOne(id: number) {
        const [rows] = await pool.query(
            'SELECT id, name, description, created_at, image, public_id FROM category WHERE id = ?;',
            [id]
        );
        return (rows as any[])[0] || null;
    }

    async create(dto: CreateCategoryDTO) {
        const [result]: any = await pool.query(
            'INSERT INTO category (name, description) VALUES (?, ?);',
            [dto.name, dto.description || null]
        );
        return { id: result.insertId, ...dto, created_at: new Date() };
    }

    async update(id: number, dto: UpdateCategoryDTO) {
        const fields: string[] = [];
        const params: any[] = [];

        if (dto.name) {
            fields.push('name = ?');
            params.push(dto.name);
        }
        if (dto.description !== undefined) {
            fields.push('description = ?');
            params.push(dto.description);
        }
        if (!fields.length) return;

        params.push(id);
        const sql = `UPDATE category SET ${fields.join(', ')} WHERE id = ?;`;
        await pool.query(sql, params);
    }

    async remove(id: number) {
        // First check if category has products
        const [products]: any = await pool.query(
            'SELECT COUNT(*) as count FROM product WHERE category_id = ?;',
            [id]
        );

        if (products[0].count > 0) {
            throw new Error(`Cannot delete category. It contains ${products[0].count} product(s). Please move or delete the products first.`);
        }

        await pool.query('DELETE FROM category WHERE id = ?;', [id]);
    }

    // Upload Cloudinary image for a category
    async uploadCategoryImage(categoryId: number, imageData: CloudinaryImageData) {
        // First check if the category exists
        const category = await this.findOne(categoryId);
        if (!category) {
            return { success: false, message: 'Category not found' };
        }

        // If category already has an image with public_id, we should delete it from Cloudinary
        // This would typically be handled in the controller

        // Update the category with the new image
        const [result]: any = await pool.query(
            'UPDATE category SET image = ?, public_id = ? WHERE id = ?',
            [imageData.secure_url, imageData.public_id, categoryId]
        );

        return {
            success: result.affectedRows > 0,
            category: await this.findOne(categoryId)
        };
    }

    // Delete category image
    async deleteCategoryImage(categoryId: number) {
        // First get the category to check if it has an image
        const category = await this.findOne(categoryId);
        if (!category || !category.image) {
            return { success: false, message: 'Category or image not found' };
        }

        // Update the category to remove the image reference
        const [result]: any = await pool.query(
            'UPDATE category SET image = NULL, public_id = NULL WHERE id = ?',
            [categoryId]
        );

        return {
            success: result.affectedRows > 0,
            category: await this.findOne(categoryId),
            public_id: category.public_id
        };
    }
}
