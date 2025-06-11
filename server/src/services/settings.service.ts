// server/src/services/settings.service.ts
import { pool } from '../config/db';

export interface ShippingCity {
    id: number;
    city_name: string;
    shipping_fee: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export class SettingsService {
    async get(key: string): Promise<string | null> {
        const [rows]: any = await pool.query(
            `SELECT value FROM settings WHERE \`key\` = ? LIMIT 1`, [key]
        );
        return rows.length ? rows[0].value : null;
    }

    async set(key: string, value: string): Promise<void> {
        await pool.query(
            `INSERT INTO settings (\`key\`, value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
            [key, value]
        );
    }

    // ✅ Shipping Cities Methods
    async getAllShippingCities(): Promise<ShippingCity[]> {
        const [rows]: any = await pool.query(
            `SELECT * FROM shipping_cities ORDER BY city_name ASC`
        );
        return rows;
    }

    async getActiveShippingCities(): Promise<ShippingCity[]> {
        const [rows]: any = await pool.query(
            `SELECT * FROM shipping_cities WHERE is_active = 1 ORDER BY city_name ASC`
        );
        return rows;
    }

    async getShippingCityById(id: number): Promise<ShippingCity | null> {
        const [rows]: any = await pool.query(
            `SELECT * FROM shipping_cities WHERE id = ? LIMIT 1`, [id]
        );
        return rows.length ? rows[0] : null;
    }

    async getShippingCityByName(cityName: string): Promise<ShippingCity | null> {
        const [rows]: any = await pool.query(
            `SELECT * FROM shipping_cities WHERE city_name = ? LIMIT 1`, [cityName]
        );
        return rows.length ? rows[0] : null;
    }

    async createShippingCity(cityName: string, shippingFee: number): Promise<ShippingCity> {
        const [result]: any = await pool.query(
            `INSERT INTO shipping_cities (city_name, shipping_fee) VALUES (?, ?)`,
            [cityName, shippingFee]
        );

        const [newCity]: any = await pool.query(
            `SELECT * FROM shipping_cities WHERE id = ?`, [result.insertId]
        );
        return newCity[0];
    }

    async updateShippingCity(id: number, cityName: string, shippingFee: number, isActive: boolean = true): Promise<void> {
        await pool.query(
            `UPDATE shipping_cities SET city_name = ?, shipping_fee = ?, is_active = ? WHERE id = ?`,
            [cityName, shippingFee, isActive, id]
        );
    }

    async deleteShippingCity(id: number): Promise<void> {
        await pool.query(`DELETE FROM shipping_cities WHERE id = ?`, [id]);
    }

    async toggleShippingCityStatus(id: number): Promise<void> {
        await pool.query(
            `UPDATE shipping_cities SET is_active = NOT is_active WHERE id = ?`, [id]
        );
    }
}
