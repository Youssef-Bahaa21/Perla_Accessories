const mysql = require('mysql2/promise');

async function testDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'perla_db'
    });

    try {
        console.log('Connected to database successfully!');

        // Test simple query
        const [rows] = await connection.query('SELECT 1 + 1 as result');
        console.log('Basic query test:', rows[0].result === 2 ? 'PASS' : 'FAIL');

        // Test product table
        const [products] = await connection.query('SELECT COUNT(*) as count FROM product');
        console.log(`Products table has ${products[0].count} records`);

        // Test product_images table
        const [images] = await connection.query('SELECT COUNT(*) as count FROM product_images');
        console.log(`Product_images table has ${images[0].count} records`);

        // Test public_id column
        try {
            await connection.query('SELECT public_id FROM product_images LIMIT 1');
            console.log('public_id column exists: PASS');
        } catch (error) {
            console.error('public_id column does not exist. Please run the ALTER TABLE command.');
            console.error('ALTER TABLE product_images ADD COLUMN public_id VARCHAR(255) NULL AFTER image;');
        }

    } catch (error) {
        console.error('Error running tests:', error);
    } finally {
        await connection.end();
    }
}

testDatabase().catch(console.error); 