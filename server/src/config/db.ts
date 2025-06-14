// server/src/config/db.ts
import * as dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';

dotenv.config();

export const pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'perla_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Health check function
export async function checkDatabaseHealth() {
    try {
        console.log('🔍 Checking database connection...');

        // Test basic connection
        await pool.query('SELECT 1');
        console.log('✅ Database connection successful');

        // Check if review table exists
        const [tables] = await pool.query(
            `SELECT TABLE_NAME FROM information_schema.TABLES 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
            [process.env.DB_DATABASE || 'perla_db', 'review']
        );

        if (Array.isArray(tables) && tables.length > 0) {
            console.log('✅ Review table exists');

            // Check table structure
            const [columns] = await pool.query(`DESCRIBE review`);
            console.log('📋 Review table columns:', columns);

            // Check row count
            const [count] = await pool.query(`SELECT COUNT(*) as count FROM review`);
            console.log(`📊 Review table has ${(count as any)[0].count} rows`);

        } else {
            console.warn('⚠️ Review table does not exist');
            console.log('💡 You may need to run database migrations or import the SQL file');
        }

        return true;
    } catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
}

// Run health check on import
checkDatabaseHealth().catch(console.error);