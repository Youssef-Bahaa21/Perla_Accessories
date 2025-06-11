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

export class CategoryService {
    async findAll() {
        const [rows] = await pool.query(
            'SELECT id, name, description, created_at FROM category;'
        );
        return rows;
    }

    async findOne(id: number) {
        const [rows] = await pool.query(
            'SELECT id, name, description, created_at FROM category WHERE id = ?;',
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
}
