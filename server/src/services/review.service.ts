import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

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
        try {
            const [rows] = await pool.query<RowDataPacket[]>(`
                SELECT id, product_id, user_id, rating, comment, created_at
                FROM review
                ORDER BY created_at DESC;
            `);
            return rows;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw new Error('Failed to fetch reviews');
        }
    }

    async findOne(id: number) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('Invalid review ID');
            }

            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT id, product_id, user_id, rating, comment, created_at
                 FROM review WHERE id = ?;`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching review:', error);
            throw new Error('Failed to fetch review');
        }
    }

    async create(dto: CreateReviewDTO) {
        try {
            // Validate input
            if (!dto.product_id || !dto.user_id || !dto.rating) {
                throw new Error('Missing required fields: product_id, user_id, rating');
            }

            if (dto.rating < 1 || dto.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            const [result]: any = await pool.query(
                `INSERT INTO review (product_id, user_id, rating, comment)
                 VALUES (?, ?, ?, ?);`,
                [dto.product_id, dto.user_id, dto.rating, dto.comment || null]
            );
            return { id: result.insertId, ...dto, created_at: new Date() };
        } catch (error) {
            console.error('Error creating review:', error);
            throw new Error('Failed to create review');
        }
    }

    async update(id: number, dto: UpdateReviewDTO) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('Invalid review ID');
            }

            const fields: string[] = [];
            const params: any[] = [];

            if (dto.rating !== undefined) {
                if (dto.rating < 1 || dto.rating > 5) {
                    throw new Error('Rating must be between 1 and 5');
                }
                fields.push('rating = ?');
                params.push(dto.rating);
            }
            if (dto.comment !== undefined) {
                fields.push('comment = ?');
                params.push(dto.comment);
            }

            if (!fields.length) {
                throw new Error('No fields to update');
            }

            params.push(id);
            await pool.query(
                `UPDATE review SET ${fields.join(', ')} WHERE id = ?;`,
                params
            );
        } catch (error) {
            console.error('Error updating review:', error);
            throw new Error('Failed to update review');
        }
    }

    async remove(id: number) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('Invalid review ID');
            }

            await pool.query(`DELETE FROM review WHERE id = ?;`, [id]);
        } catch (error) {
            console.error('Error deleting review:', error);
            throw new Error('Failed to delete review');
        }
    }
}
