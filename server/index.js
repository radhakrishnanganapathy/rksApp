const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database tables on startup
const initializeTables = async () => {
    try {
        console.log('Checking database tables...');

        // Log connection details for debugging
        const dbInfo = await db.query('SELECT current_database(), current_user, inet_server_addr()');
        console.log('🔌 Connected to Database:', dbInfo.rows[0]);

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
                items JSONB NOT NULL,
                buy_type TEXT DEFAULT 'regular'
            );
        `);

        // Migration: Add buy_type column if it doesn't exist and backfill data
        try {
            await db.query(`
                ALTER TABLE sales 
                ADD COLUMN IF NOT EXISTS buy_type TEXT DEFAULT 'regular';
            `);
            await db.query(`
                UPDATE sales SET buy_type = 'regular' WHERE buy_type IS NULL;
            `);
            console.log("Migration: Checked/Added buy_type column and backfilled data");
        } catch (err) {
            console.error("Migration Error:", err);
        }

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
                category TEXT NOT NULL DEFAULT 'Other',
                material_name TEXT,
                unit TEXT,
                quantity NUMERIC,
                amount NUMERIC NOT NULL,
                notes TEXT
            );
        `);

        // Production Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS production (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL,
                item TEXT NOT NULL,
                qty NUMERIC NOT NULL,
                unit TEXT NOT NULL DEFAULT 'kg',
                batch_number TEXT,
                packed_qty NUMERIC DEFAULT 0
            );
        `);

        // Migrations for Production Table
        try {
            await db.query(`ALTER TABLE production ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'kg';`);
            await db.query(`ALTER TABLE production ADD COLUMN IF NOT EXISTS batch_number TEXT;`);
            await db.query(`ALTER TABLE production ADD COLUMN IF NOT EXISTS packed_qty NUMERIC DEFAULT 0;`);
        } catch (e) {
            console.log('Migration note: production columns might already exist');
        }

        // Stocks Table (Combined for products and raw materials)
        await db.query(`
            CREATE TABLE IF NOT EXISTS stocks (
                type TEXT NOT NULL,
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

        // Raw Material Usage Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS raw_material_usage (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL,
                material_name TEXT NOT NULL,
                quantity_used NUMERIC NOT NULL,
                unit TEXT NOT NULL,
                notes TEXT,
                cost NUMERIC DEFAULT 0
            );
        `);

        // Self-healing: Check if cost column exists and add it if missing
        try {
            const checkColumn = await db.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'raw_material_usage' AND column_name = 'cost'
            `);

            if (checkColumn.rows.length === 0) {
                console.log('⚠️ Cost column missing in raw_material_usage. Adding it now...');
                await db.query('ALTER TABLE raw_material_usage ADD COLUMN cost NUMERIC DEFAULT 0');
                console.log('✅ Cost column added successfully.');
            } else {
                console.log('✅ Cost column exists in raw_material_usage.');
            }
        } catch (err) {
            console.error('Error checking/adding cost column:', err.message);
        }


        // Migration: Add mobile, area columns to employees and custom_salary to attendance
        try {
            console.log('Checking employee module columns...');
            await db.query(`
                ALTER TABLE employees 
                ADD COLUMN IF NOT EXISTS mobile TEXT,
                ADD COLUMN IF NOT EXISTS area TEXT;
            `);
            await db.query(`
                ALTER TABLE attendance 
                ADD COLUMN IF NOT EXISTS custom_salary NUMERIC;
            `);
            console.log('✅ Employee module columns checked/added.');
        } catch (err) {
            console.error('Error checking employee columns:', err.message);
        }

        console.log('Database tables initialized successfully!');
    } catch (err) {
        console.error('Error initializing database tables:', err);
        process.exit(1);
    }
};

// --- Customers ---
app.get('/api/customers', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const { id, name, mobile, place } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO customers (id, name, mobile, place) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, mobile, place]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Sales ---
app.get('/api/sales', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sales ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sales', async (req, res) => {
    const { id, date, customerId, discount, total, paymentStatus, amountReceived, items, buyType } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO sales (id, date, customer_id, discount, total, payment_status, amount_received, items, buy_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [id, date, customerId, discount, total, paymentStatus, amountReceived, JSON.stringify(items), buyType || 'regular']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sales/:id', async (req, res) => {
    const { id } = req.params;
    const { date, customerId, discount, total, paymentStatus, amountReceived, items } = req.body;
    try {
        let query = 'UPDATE sales SET ';
        const params = [];
        let paramCount = 1;

        if (date !== undefined) {
            query += `date = $${paramCount}, `;
            params.push(date);
            paramCount++;
        }
        if (customerId !== undefined) {
            query += `customer_id = $${paramCount}, `;
            params.push(customerId);
            paramCount++;
        }
        if (discount !== undefined) {
            query += `discount = $${paramCount}, `;
            params.push(discount);
            paramCount++;
        }
        if (total !== undefined) {
            query += `total = $${paramCount}, `;
            params.push(total);
            paramCount++;
        }
        if (paymentStatus !== undefined) {
            query += `payment_status = $${paramCount}, `;
            params.push(paymentStatus);
            paramCount++;
        }
        if (amountReceived !== undefined) {
            query += `amount_received = $${paramCount}, `;
            params.push(amountReceived);
            paramCount++;
        }
        if (items !== undefined) {
            query += `items = $${paramCount}, `;
            params.push(JSON.stringify(items));
            paramCount++;
        }

        query = query.slice(0, -2); // Remove trailing comma
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sales/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM sales WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json({ message: 'Sale deleted successfully', sale: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Orders ---
app.get('/api/orders', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM orders ORDER BY booking_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { id, bookingDate, dueDate, customerId, status, discount, total, paymentStatus, amountReceived, items } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO orders (id, booking_date, due_date, customer_id, status, discount, total, payment_status, amount_received, items) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [id, bookingDate, dueDate, customerId, status, discount, total, paymentStatus, amountReceived, JSON.stringify(items)]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { bookingDate, dueDate, customerId, status, discount, total, paymentStatus, amountReceived, items } = req.body;
    try {
        let query = 'UPDATE orders SET ';
        const params = [];
        let paramCount = 1;

        if (bookingDate !== undefined) {
            query += `booking_date = $${paramCount}, `;
            params.push(bookingDate);
            paramCount++;
        }
        if (dueDate !== undefined) {
            query += `due_date = $${paramCount}, `;
            params.push(dueDate);
            paramCount++;
        }
        if (customerId !== undefined) {
            query += `customer_id = $${paramCount}, `;
            params.push(customerId);
            paramCount++;
        }
        if (status !== undefined) {
            query += `status = $${paramCount}, `;
            params.push(status);
            paramCount++;
        }
        if (discount !== undefined) {
            query += `discount = $${paramCount}, `;
            params.push(discount);
            paramCount++;
        }
        if (total !== undefined) {
            query += `total = $${paramCount}, `;
            params.push(total);
            paramCount++;
        }
        if (paymentStatus !== undefined) {
            query += `payment_status = $${paramCount}, `;
            params.push(paymentStatus);
            paramCount++;
        }
        if (amountReceived !== undefined) {
            query += `amount_received = $${paramCount}, `;
            params.push(amountReceived);
            paramCount++;
        }
        if (items !== undefined) {
            query += `items = $${paramCount}, `;
            params.push(JSON.stringify(items));
            paramCount++;
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully', order: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Expenses ---
app.get('/api/expenses', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM expenses ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', async (req, res) => {
    const { id, date, category, materialName, unit, quantity, amount, notes } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO expenses (id, date, category, material_name, unit, quantity, amount, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, date, category || 'Other', materialName, unit, quantity, amount, notes]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { date, category, materialName, unit, quantity, amount, notes } = req.body;
    try {
        let query = 'UPDATE expenses SET ';
        const params = [];
        let paramCount = 1;

        if (date !== undefined) {
            query += `date = $${paramCount}, `;
            params.push(date);
            paramCount++;
        }
        if (category !== undefined) {
            query += `category = $${paramCount}, `;
            params.push(category);
            paramCount++;
        }
        if (materialName !== undefined) {
            query += `material_name = $${paramCount}, `;
            params.push(materialName);
            paramCount++;
        }
        if (unit !== undefined) {
            query += `unit = $${paramCount}, `;
            params.push(unit);
            paramCount++;
        }
        if (quantity !== undefined) {
            query += `quantity = $${paramCount}, `;
            params.push(quantity);
            paramCount++;
        }
        if (amount !== undefined) {
            query += `amount = $${paramCount}, `;
            params.push(amount);
            paramCount++;
        }
        if (notes !== undefined) {
            query += `notes = $${paramCount}, `;
            params.push(notes);
            paramCount++;
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully', expense: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Production ---
app.get('/api/production', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM production ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/production', async (req, res) => {
    const { id, date, item, qty, unit, batchNumber, packedQty } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO production (id, date, item, qty, unit, batch_number, packed_qty) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, date, item, qty, unit, batchNumber, packedQty || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/production/:id', async (req, res) => {
    const { id } = req.params;
    const { date, item, qty, unit, batchNumber, packedQty } = req.body;
    try {
        let query = 'UPDATE production SET ';
        const params = [];
        let paramCount = 1;

        if (date !== undefined) {
            query += `date = $${paramCount}, `;
            params.push(date);
            paramCount++;
        }
        if (item !== undefined) {
            query += `item = $${paramCount}, `;
            params.push(item);
            paramCount++;
        }
        if (qty !== undefined) {
            query += `qty = $${paramCount}, `;
            params.push(qty);
            paramCount++;
        }
        if (unit !== undefined) {
            query += `unit = $${paramCount}, `;
            params.push(unit);
            paramCount++;
        }
        if (batchNumber !== undefined) {
            query += `batch_number = $${paramCount}, `;
            params.push(batchNumber);
            paramCount++;
        }
        if (packedQty !== undefined) {
            query += `packed_qty = $${paramCount}, `;
            params.push(packedQty);
            paramCount++;
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/production/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM production WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Production record not found' });
        }
        res.json({ message: 'Production record deleted successfully', production: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Stocks ---
app.get('/api/stocks', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM stocks');
        // Transform to match frontend structure: { products: [], rawMaterials: [] }
        const products = result.rows.filter(r => r.type === 'product');
        const rawMaterials = result.rows.filter(r => r.type === 'raw_material');
        res.json({ products, rawMaterials });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/stocks', async (req, res) => {
    const { type, name, qty, unit } = req.body; // type: 'product' or 'raw_material'
    console.log(`[POST /api/stocks] Request received:`, { type, name, qty, unit });
    try {
        // Upsert stock
        const result = await db.query(
            `INSERT INTO stocks (type, name, qty, unit) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (type, name) 
             DO UPDATE SET qty = stocks.qty + $3 
             RETURNING *`,
            [type, name, qty, unit || 'kg']
        );
        console.log(`[POST /api/stocks] Success:`, result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`[POST /api/stocks] Error:`, err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/stocks/:type/:name', async (req, res) => {
    const { type, name } = req.params;
    const { qty, unit } = req.body;
    try {
        let query = 'UPDATE stocks SET ';
        const params = [];
        let paramCount = 1;

        if (qty !== undefined) {
            query += `qty = $${paramCount}, `;
            params.push(qty);
            paramCount++;
        }
        if (unit !== undefined) {
            query += `unit = $${paramCount}, `;
            params.push(unit);
            paramCount++;
        }

        query = query.slice(0, -2);
        query += ` WHERE type = $${paramCount} AND name = $${paramCount + 1} RETURNING *`;
        params.push(type, name);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/stocks/:type/:name', async (req, res) => {
    const { type, name } = req.params;
    try {
        const result = await db.query('DELETE FROM stocks WHERE type = $1 AND name = $2 RETURNING *', [type, name]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stock item not found' });
        }
        res.json({ message: 'Stock item deleted successfully', stock: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Employees ---
app.get('/api/employees', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM employees ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/employees', async (req, res) => {
    const { id, name, salaryType, dailySalary, mobile, area } = req.body;
    console.log('[POST /api/employees] Request:', { id, name, salaryType, dailySalary, mobile, area });
    try {
        const result = await db.query(
            'INSERT INTO employees (id, name, salary_type, daily_salary, mobile, area) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, name, salaryType, dailySalary, mobile, area]
        );
        console.log('[POST /api/employees] Success:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[POST /api/employees] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { name, salaryType, dailySalary, active, mobile, area } = req.body;
    console.log('[PUT /api/employees/:id] Request:', { id, name, salaryType, dailySalary, active, mobile, area });
    try {
        let query = 'UPDATE employees SET ';
        const params = [];
        let paramCount = 1;

        // Only update fields that have meaningful values
        if (name !== undefined && name !== null && name !== '') {
            query += `name = $${paramCount}, `;
            params.push(name);
            paramCount++;
        }
        if (salaryType !== undefined && salaryType !== null) {
            query += `salary_type = $${paramCount}, `;
            params.push(salaryType);
            paramCount++;
        }
        if (dailySalary !== undefined && dailySalary !== null) {
            query += `daily_salary = $${paramCount}, `;
            params.push(dailySalary);
            paramCount++;
        }
        if (mobile !== undefined && mobile !== null) {
            query += `mobile = $${paramCount}, `;
            params.push(mobile);
            paramCount++;
        }
        if (area !== undefined && area !== null) {
            query += `area = $${paramCount}, `;
            params.push(area);
            paramCount++;
        }
        if (active !== undefined && active !== null) {
            query += `active = $${paramCount}, `;
            params.push(active);
            paramCount++;
        }

        if (paramCount === 1) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        console.log('[PUT /api/employees/:id] Query:', query, 'Params:', params);
        const result = await db.query(query, params);
        console.log('[PUT /api/employees/:id] Success:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[PUT /api/employees/:id] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully', employee: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Attendance ---
app.get('/api/attendance', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM attendance ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance', async (req, res) => {
    const { id, date, employeeId, status, customSalary } = req.body;
    console.log('[POST /api/attendance] Request:', { id, date, employeeId, status, customSalary });
    try {
        // Check if exists
        const existing = await db.query('SELECT * FROM attendance WHERE employee_id = $1 AND date = $2', [employeeId, date]);
        console.log('[POST /api/attendance] Existing records:', existing.rows.length);

        let result;
        if (existing.rows.length > 0) {
            console.log('[POST /api/attendance] Updating existing attendance');
            result = await db.query(
                'UPDATE attendance SET status = $1, custom_salary = $2 WHERE employee_id = $3 AND date = $4 RETURNING *',
                [status, customSalary || null, employeeId, date]
            );
        } else {
            console.log('[POST /api/attendance] Inserting new attendance');
            result = await db.query(
                'INSERT INTO attendance (id, date, employee_id, status, custom_salary) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [id, date, employeeId, status, customSalary || null]
            );
        }
        console.log('[POST /api/attendance] Success:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[POST /api/attendance] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/attendance/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM attendance WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }
        res.json({ message: 'Attendance record deleted successfully', attendance: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Raw Material Purchases ---
app.get('/api/raw-material-purchases', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM raw_material_purchases ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/raw-material-purchases', async (req, res) => {
    const { id, date, materialName, qty, cost } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO raw_material_purchases (id, date, material_name, qty, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, date, materialName, qty, cost]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/raw-material-purchases/:id', async (req, res) => {
    const { id } = req.params;
    const { date, materialName, qty, cost } = req.body;
    try {
        let query = 'UPDATE raw_material_purchases SET ';
        const params = [];
        let paramCount = 1;

        if (date !== undefined) {
            query += `date = $${paramCount}, `;
            params.push(date);
            paramCount++;
        }
        if (materialName !== undefined) {
            query += `material_name = $${paramCount}, `;
            params.push(materialName);
            paramCount++;
        }
        if (qty !== undefined) {
            query += `qty = $${paramCount}, `;
            params.push(qty);
            paramCount++;
        }
        if (cost !== undefined) {
            query += `cost = $${paramCount}, `;
            params.push(cost);
            paramCount++;
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/raw-material-purchases/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM raw_material_purchases WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Raw material purchase not found' });
        }
        res.json({ message: 'Raw material purchase deleted successfully', purchase: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Raw Material Usage ---
app.get('/api/raw-material-usage', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM raw_material_usage ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/raw-material-usage', async (req, res) => {
    const { id, date, materialName, quantityUsed, unit, notes, cost } = req.body;
    console.log('=== RAW MATERIAL USAGE POST ===');
    console.log('Received data:', { id, date, materialName, quantityUsed, unit, notes, cost });
    try {
        const result = await db.query(
            'INSERT INTO raw_material_usage (id, date, material_name, quantity_used, unit, notes, cost) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, date, materialName, quantityUsed, unit, notes, cost || 0]
        );
        console.log('Successfully inserted usage:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('ERROR in raw-material-usage POST:', err.message);
        console.error('Full error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/raw-material-usage/:id', async (req, res) => {
    const { id } = req.params;
    const { date, materialName, quantityUsed, unit, notes, cost } = req.body;
    try {
        let query = 'UPDATE raw_material_usage SET ';
        const params = [];
        let paramCount = 1;

        if (date !== undefined) {
            query += `date = $${paramCount}, `;
            params.push(date);
            paramCount++;
        }
        if (materialName !== undefined) {
            query += `material_name = $${paramCount}, `;
            params.push(materialName);
            paramCount++;
        }
        if (quantityUsed !== undefined) {
            query += `quantity_used = $${paramCount}, `;
            params.push(quantityUsed);
            paramCount++;
        }
        if (unit !== undefined) {
            query += `unit = $${paramCount}, `;
            params.push(unit);
            paramCount++;
        }
        if (notes !== undefined) {
            query += `notes = $${paramCount}, `;
            params.push(notes);
            paramCount++;
        }
        if (cost !== undefined) {
            query += `cost = $${paramCount}, `;
            params.push(cost);
            paramCount++;
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/raw-material-usage/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM raw_material_usage WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Raw material usage not found' });
        }
        res.json({ message: 'Raw material usage deleted successfully', usage: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Customers ---
app.get('/api/customers', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const { id, name, mobile, place } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO customers (id, name, mobile, place) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, mobile, place]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, mobile, place } = req.body;
    try {
        let query = 'UPDATE customers SET ';
        const params = [];
        let paramCount = 1;

        if (name !== undefined) {
            query += `name = $${paramCount}, `;
            params.push(name);
            paramCount++;
        }
        if (mobile !== undefined) {
            query += `mobile = $${paramCount}, `;
            params.push(mobile);
            paramCount++;
        }
        if (place !== undefined) {
            query += `place = $${paramCount}, `;
            params.push(place);
            paramCount++;
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully', customer: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server after initializing database
initializeTables().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Keep process alive
    setInterval(() => { }, 10000);
});

