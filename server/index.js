const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    const { id, date, customerId, discount, total, paymentStatus, amountReceived, items } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO sales (id, date, customer_id, discount, total, payment_status, amount_received, items) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, date, customerId, discount, total, paymentStatus, amountReceived, JSON.stringify(items)]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sales/:id', async (req, res) => {
    const { id } = req.params;
    const { paymentStatus, amountReceived } = req.body;
    try {
        let query = 'UPDATE sales SET ';
        const params = [];
        let paramCount = 1;

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

        query = query.slice(0, -2); // Remove trailing comma
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
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
    const { status, paymentStatus, amountReceived } = req.body;
    try {
        let query = 'UPDATE orders SET ';
        const params = [];
        let paramCount = 1;

        if (status !== undefined) {
            query += `status = $${paramCount}, `;
            params.push(status);
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

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
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
    const { id, date, description, amount, category, qty } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO expenses (id, date, description, amount, category, qty) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, date, description, amount, category, qty]
        );
        res.json(result.rows[0]);
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
    const { id, date, item, qty } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO production (id, date, item, qty) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, date, item, qty]
        );
        res.json(result.rows[0]);
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
        res.json(result.rows[0]);
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
    const { id, name, salaryType, dailySalary } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO employees (id, name, salary_type, daily_salary) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, salaryType, dailySalary]
        );
        res.json(result.rows[0]);
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
    const { id, date, employeeId, status } = req.body;
    try {
        // Check if exists
        const existing = await db.query('SELECT * FROM attendance WHERE employee_id = $1 AND date = $2', [employeeId, date]);

        let result;
        if (existing.rows.length > 0) {
            result = await db.query(
                'UPDATE attendance SET status = $1 WHERE employee_id = $2 AND date = $3 RETURNING *',
                [status, employeeId, date]
            );
        } else {
            result = await db.query(
                'INSERT INTO attendance (id, date, employee_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
                [id, date, employeeId, status]
            );
        }
        res.json(result.rows[0]);
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
