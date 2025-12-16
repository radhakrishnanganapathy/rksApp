const pg = require('pg');
require('dotenv').config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    ssl: (process.env.PGSSL === 'true' || process.env.NODE_ENV === 'production') ? { rejectUnauthorized: false } : false
});

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS home_savings_transactions (
                id BIGINT PRIMARY KEY,
                saving_id BIGINT REFERENCES home_savings(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                amount NUMERIC NOT NULL,
                type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'interest'
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ home_savings_transactions table created successfully.');
    } catch (err) {
        console.error('❌ Error creating table:', err);
    } finally {
        await pool.end();
    }
};

createTable();
