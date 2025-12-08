// Quick diagnostic to check API connection
// Open browser console and paste this

const API_URL = 'https://rksapp.onrender.com/api';

async function checkAPI() {
    console.log('🔍 Checking API connection...');

    try {
        // Test sales endpoint
        const salesRes = await fetch(`${API_URL}/sales`);
        console.log('Sales endpoint status:', salesRes.status);

        if (salesRes.ok) {
            const sales = await salesRes.json();
            console.log('✅ Sales data loaded:', sales.length, 'records');
            console.log('Sample:', sales[0]);
        } else {
            console.error('❌ Sales endpoint failed:', salesRes.statusText);
        }

        // Test customers endpoint
        const customersRes = await fetch(`${API_URL}/customers`);
        console.log('Customers endpoint status:', customersRes.status);

        if (customersRes.ok) {
            const customers = await customersRes.json();
            console.log('✅ Customers data loaded:', customers.length, 'records');
        }

        // Test farm endpoints
        const cropsRes = await fetch(`${API_URL}/farm/crops`);
        console.log('Farm crops endpoint status:', cropsRes.status);

        if (cropsRes.ok) {
            const crops = await cropsRes.json();
            console.log('✅ Farm crops loaded:', crops.length, 'records');
        }

    } catch (error) {
        console.error('❌ API Error:', error);
    }
}

checkAPI();
