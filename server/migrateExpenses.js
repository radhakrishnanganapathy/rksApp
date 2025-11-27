const db = require('./db');

/**
 * Migration script to update expenses table schema
 * Adds new columns: material_name, unit, quantity, notes
 * Removes old columns: description, qty
 */
const migrateExpensesTable = async () => {
    try {
        console.log('Starting expenses table migration...');

        // Check if new columns already exist
        const checkColumns = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'expenses'
        `);

        const existingColumns = checkColumns.rows.map(row => row.column_name);
        console.log('Existing columns:', existingColumns);

        // Add new columns if they don't exist
        if (!existingColumns.includes('material_name')) {
            await db.query('ALTER TABLE expenses ADD COLUMN material_name TEXT');
            console.log('Added column: material_name');
        }

        if (!existingColumns.includes('unit')) {
            await db.query('ALTER TABLE expenses ADD COLUMN unit TEXT');
            console.log('Added column: unit');
        }

        if (!existingColumns.includes('quantity')) {
            await db.query('ALTER TABLE expenses ADD COLUMN quantity NUMERIC');
            console.log('Added column: quantity');
        }

        if (!existingColumns.includes('notes')) {
            await db.query('ALTER TABLE expenses ADD COLUMN notes TEXT');
            console.log('Added column: notes');
        }

        if (!existingColumns.includes('category')) {
            await db.query('ALTER TABLE expenses ADD COLUMN category TEXT');
            console.log('Added column: category');
        }

        // Drop old columns if they exist
        if (existingColumns.includes('description')) {
            await db.query('ALTER TABLE expenses DROP COLUMN IF EXISTS description');
            console.log('Dropped column: description');
        }

        if (existingColumns.includes('qty')) {
            await db.query('ALTER TABLE expenses DROP COLUMN IF EXISTS qty');
            console.log('Dropped column: qty');
        }

        // Make 'amount' NOT NULL if it isn't already
        await db.query('ALTER TABLE expenses ALTER COLUMN amount SET NOT NULL');
        console.log('Set amount column to NOT NULL');

        console.log('✅ Expenses table migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error migrating expenses table:', err);
        process.exit(1);
    }
};

migrateExpensesTable();
