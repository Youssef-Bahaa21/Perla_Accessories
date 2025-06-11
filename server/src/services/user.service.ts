import { pool } from '../config/db';

export class UserService {
    async findAll() {
        const [rows] = await pool.query('SELECT id, email, role FROM `user`;');
        return rows;
    }

    async findOne(id: number) {
        const [rows] = await pool.query('SELECT id, email, role FROM `user` WHERE id = ?;', [id]);
        return (rows as any[])[0] || null;
    }

    async create(email: string, password: string) {
        const [result]: any = await pool.query(
            'INSERT INTO `user` (email, password) VALUES (?, ?);',
            [email, password]
        );
        return { id: result.insertId, email, role: 'customer' };
    }

    async update(id: number, data: { email?: string; password?: string; role?: string }) {
        const fields = [];
        const params: any[] = [];
        if (data.email) { fields.push('email = ?'); params.push(data.email); }
        if (data.password) { fields.push('password = ?'); params.push(data.password); }
        if (data.role) { fields.push('role = ?'); params.push(data.role); }
        if (!fields.length) return;
        params.push(id);
        await pool.query(`UPDATE \`user\` SET ${fields.join(', ')} WHERE id = ?;`, params);
    }

    async remove(id: number) {
        await pool.query('DELETE FROM `user` WHERE id = ?;', [id]);
    }
}