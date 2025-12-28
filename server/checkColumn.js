const db = require('./db');

const checkColumn = async () => {
    try {
        console.log('--- Checking Database Schema ---');

        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'employees' 
            AND column_name = 'daily_salary';
        `);

        if (res.rows.length > 0) {
            console.log('✅ Column "daily_salary" EXISTS in employees table.');
            console.log('Details:', res.rows[0]);
        } else {
            console.log('❌ Column "daily_salary" does NOT EXIST in employees table.');
        }

        const res2 = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'employees' 
            AND column_name = 'salary_type';
        `);

        if (res2.rows.length > 0) {
            console.log('✅ Column "salary_type" EXISTS in employees table.');
        } else {
            console.log('❌ Column "salary_type" does NOT EXIST in employees table.');
        }

    } catch (err) {
        console.error('Error checking schema:', err.message);
    } finally {
        // Force exit after a small delay to ensure logs are flushed
        setTimeout(() => process.exit(0), 1000);
    }
};

checkColumn();
