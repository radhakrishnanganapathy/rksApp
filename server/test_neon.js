const { Pool } = require('pg');
// No dotenv here, we will pass it via command line or use the one we just saw
const pool = new Pool({
    user: 'neondb_owner',
    password: 'npg_FJud9hyriaD7',
    host: 'ep-orange-butterfly-adizf0ab-pooler.c-2.us-east-1.aws.neon.tech',
    database: 'rks',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        console.log('Connecting to Neon DB...');
        const res = await pool.query('SELECT current_database()');
        console.log('Connected to:', res.rows[0]);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
