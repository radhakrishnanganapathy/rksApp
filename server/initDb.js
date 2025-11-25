const db = require('./db');

const createTables = async () => {
    try {
        console.log('Initializing database...');

        // Customers Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id BIGINT PRIMARY KEY,
                name TEXT NOT NULL,
                mobile TEXT,
                place TEXT
            );
        `);

        // Sales Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL,
                customer_id BIGINT REFERENCES customers(id),
                discount NUMERIC DEFAULT 0,
                total NUMERIC NOT NULL,
                payment_status TEXT DEFAULT 'paid',
                amount_received NUMERIC DEFAULT 0,
                items JSONB NOT NULL
            );
        `);

        // Orders Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id BIGINT PRIMARY KEY,
                booking_date DATE NOT NULL,
                due_date DATE NOT NULL,
                customer_id BIGINT REFERENCES customers(id),
                status TEXT DEFAULT 'waiting',
                discount NUMERIC DEFAULT 0,
                total NUMERIC NOT NULL,
                payment_status TEXT DEFAULT 'paid',
                amount_received NUMERIC DEFAULT 0,
                items JSONB NOT NULL
            );
        `);

        // Expenses Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL,
                description TEXT NOT NULL,
                amount NUMERIC NOT NULL,
                category TEXT,
                qty TEXT
            );
        `);

        // Production Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS production (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL,
                item TEXT NOT NULL,
                qty NUMERIC NOT NULL
            );
        `);

        // Stocks Table (Combined for products and raw materials)
        await db.query(`
            CREATE TABLE IF NOT EXISTS stocks (
                type TEXT NOT NULL, -- 'product' or 'raw_material'
                name TEXT NOT NULL,
                qty NUMERIC DEFAULT 0,
                unit TEXT DEFAULT 'kg',
                PRIMARY KEY (type, name)
            );
        `);

        // Employees Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id BIGINT PRIMARY KEY,
                name TEXT NOT NULL,
                salary_type TEXT,
                daily_salary NUMERIC,
                active BOOLEAN DEFAULT TRUE
            );
        `);

        // Attendance Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL,
                employee_id BIGINT REFERENCES employees(id),
                status TEXT NOT NULL
            );
        `);

        // Raw Material Purchases Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS raw_material_purchases (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL,
                material_name TEXT NOT NULL,
                qty NUMERIC NOT NULL,
                cost NUMERIC NOT NULL
            );
        `);

        console.log('All tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
};

createTables();
