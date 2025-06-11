import { pool } from '../config/db';

export interface CreateReviewDTO {
    product_id: number;
    user_id: number;
    rating: number;
    comment?: string;
}

export interface UpdateReviewDTO {
    rating?: number;
    comment?: string;
}

export class ReviewService {
    async findAll() {
        const [rows] = await pool.query(`
      SELECT id, product_id, user_id, rating, comment, created_at
      FROM review;
    `);
        return rows;
    }

    async findOne(id: number) {
        const [rows] = await pool.query(
            `SELECT id, product_id, user_id, rating, comment, created_at
       FROM review WHERE id = ?;`,
            [id]
        );
        return (rows as any[])[0] || null;
    }

    async create(dto: CreateReviewDTO) {
        const [result]: any = await pool.query(
            `INSERT INTO review (product_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?);`,
            [dto.product_id, dto.user_id, dto.rating, dto.comment || null]
        );
        return { id: result.insertId, ...dto, created_at: new Date() };
    }

    async update(id: number, dto: UpdateReviewDTO) {
        const fields: string[] = [];
        const params: any[] = [];

        if (dto.rating !== undefined) {
            fields.push('rating = ?');
            params.push(dto.rating);
        }
        if (dto.comment !== undefined) {
            fields.push('comment = ?');
            params.push(dto.comment);
        }
        if (!fields.length) return;

        params.push(id);
        await pool.query(
            `UPDATE review SET ${fields.join(', ')} WHERE id = ?;`,
            params
        );
    }

    async remove(id: number) {
        await pool.query(`DELETE FROM review WHERE id = ?;`, [id]);
    }
}
