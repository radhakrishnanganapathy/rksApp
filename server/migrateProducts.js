const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function migrateProducts() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting Products Table Migration...\n');

        // Step 1: Create products table
        console.log('Step 1: Creating products table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                category VARCHAR(100),
                unit VARCHAR(20) DEFAULT 'kg',
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Products table created successfully!\n');

        // Step 2: Check if products already exist
        const existingProducts = await client.query('SELECT COUNT(*) FROM products');
        const count = parseInt(existingProducts.rows[0].count);

        if (count > 0) {
            console.log(`⚠️  Products table already has ${count} products. Skipping pre-population.\n`);
        } else {
            // Step 3: Pre-populate with existing product list
            console.log('Step 2: Pre-populating products from existing list...');

            const products = [
                "கை முறுக்கு",
                "தேன்குழல்",
                "எல் அடை",
                "கம்பு அடை",
                "கொத்துமுறுக்கு",
                "அதிரசம்",
                "புடலங்காய் உருண்டை",
                "சோமாஸ்"
            ];

            for (const product of products) {
                await client.query(
                    'INSERT INTO products (name, active) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                    [product, true]
                );
                console.log(`  ✓ Added: ${product}`);
            }
            console.log(`✅ Pre-populated ${products.length} products!\n`);
        }

        // Step 4: Verify migration
        console.log('Step 3: Verifying migration...');
        const result = await client.query('SELECT id, name, active FROM products ORDER BY id');
        console.log(`✅ Total products in database: ${result.rows.length}\n`);

        console.log('📋 Current Products:');
        result.rows.forEach(row => {
            console.log(`  ${row.id}. ${row.name} ${row.active ? '✓' : '✗'}`);
        });

        console.log('\n🎉 Products migration completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('  1. Update frontend to fetch products from API');
        console.log('  2. Create Products CRUD module');
        console.log('  3. Test all existing features with dynamic products\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
migrateProducts()
    .then(() => {
        console.log('✅ Migration script completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Migration script failed:', err);
        process.exit(1);
    });
