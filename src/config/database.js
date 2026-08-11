const mysql = require('mysql2/promise');
require('dotenv').config();

const poolOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'inventory_db',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Enable SSL for TiDB Cloud / Render
if (process.env.DB_SSL !== 'false') {
    poolOptions.ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    };
}

const pool = mysql.createPool(poolOptions);

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();

        console.log('✅ Database connected successfully');

        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};