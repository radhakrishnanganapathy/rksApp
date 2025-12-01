const db = require('./db');

const testStockAdd = async () => {
    try {
        console.log('Testing stock addition...');

        const testItem = {
            type: 'raw_material',
            name: 'Test_Material_' + Date.now(),
            qty: 10,
            unit: 'kg'
        };

        console.log('Attempting to add:', testItem);

        const result = await db.query(
            `INSERT INTO stocks (type, name, qty, unit) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (type, name) 
             DO UPDATE SET qty = stocks.qty + $3 
             RETURNING *`,
            [testItem.type, testItem.name, testItem.qty, testItem.unit]
        );

        console.log('Success! Result:', result.rows[0]);

        // Clean up
        await db.query('DELETE FROM stocks WHERE name = $1', [testItem.name]);
        console.log('Cleaned up test item.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error adding stock:', err);
        process.exit(1);
    }
};

testStockAdd();
