const db = require('./db');

const migrateDatabase = async () => {
    try {
        console.log('Starting database migration...');

        // Add mobile and area columns to employees table
        console.log('Adding mobile and area columns to employees table...');
        await db.query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS mobile TEXT,
            ADD COLUMN IF NOT EXISTS area TEXT;
        `);
        console.log('✓ Employees table updated');

        // Add custom_salary column to attendance table
        console.log('Adding custom_salary column to attendance table...');
        await db.query(`
            ALTER TABLE attendance 
            ADD COLUMN IF NOT EXISTS custom_salary NUMERIC;
        `);
        console.log('✓ Attendance table updated');

        console.log('\n✅ Database migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during migration:', err);
        process.exit(1);
    }
};

migrateDatabase();
