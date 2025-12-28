const db = require('./db');

const testSalary = async () => {
    try {
        console.log('--- Starting Employee Salary Debug ---');

        // 1. Create Employee
        const empId = Date.now();
        console.log('Creating employee with daily_salary: 500');
        await db.query(
            'INSERT INTO employees (id, name, salary_type, daily_salary) VALUES ($1, $2, $3, $4)',
            [empId, 'Test Employee', 'daily', 500]
        );

        // 2. Fetch Employee
        const res = await db.query('SELECT * FROM employees WHERE id = $1', [empId]);
        const emp = res.rows[0];
        console.log('Fetched Employee:', emp);

        if (Number(emp.daily_salary) === 500) {
            console.log('✅ SUCCESS: Daily salary saved correctly.');
        } else {
            console.log(`❌ FAILURE: Daily salary mismatch. Expected 500, got ${emp.daily_salary}`);
        }

        // 3. Update Employee
        console.log('Updating daily_salary to 750');
        await db.query(
            'UPDATE employees SET daily_salary = $1 WHERE id = $2',
            [750, empId]
        );

        // 4. Fetch again
        const res2 = await db.query('SELECT * FROM employees WHERE id = $1', [empId]);
        const emp2 = res2.rows[0];
        console.log('Fetched Updated Employee:', emp2);

        if (Number(emp2.daily_salary) === 750) {
            console.log('✅ SUCCESS: Daily salary updated correctly.');
        } else {
            console.log(`❌ FAILURE: Update mismatch. Expected 750, got ${emp2.daily_salary}`);
        }

        // Cleanup
        await db.query('DELETE FROM employees WHERE id = $1', [empId]);
        console.log('Cleanup complete.');

    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        process.exit();
    }
};

testSalary();
