export const ITEMS = [
    "கை முறுக்கு",
    "தேன்குழல்",
    "எல் அடை",
    "கம்பு அடை",
    "கொத்துமுறுக்கு",
    "அதிரசம்",
    "புடலங்காய் உருண்டை",
    "சோமாஸ்"
];

// Initial Mock Data
export const initialData = {
    customers: [
        { id: 1, name: 'Pakkam', shopName: 'Pakkam Store', phone: '9876543210', area: 'Pakkam' },
        { id: 2, name: 'Dept Rpm', shopName: '', phone: '9876543211', area: 'RPM' },
        { id: 3, name: 'Madugarai', shopName: 'Madurai Shop', phone: '9876543212', area: 'Madugarai' },
        { id: 4, name: 'Majith', shopName: '', phone: '9876543213', area: 'Local' },
        { id: 5, name: 'PS plalayam', shopName: 'PS Store', phone: '9876543214', area: 'Palayam' },
        { id: 6, name: 'Valavanur', shopName: '', phone: '9876543215', area: 'Valavanur' },
        { id: 7, name: 'Villiyanur', shopName: 'Villi Store', phone: '9876543216', area: 'Villiyanur' },
        { id: 8, name: 'Local', shopName: '', phone: '9876543217', area: 'Local' },
        { id: 9, name: 'Sendhura', shopName: 'Sendhura Mart', phone: '9876543218', area: 'Sendhura' },
    ],
    employees: [
        { id: 1, name: 'Kumar', salaryPerDay: 500, active: true },
        { id: 2, name: 'Ravi', salaryPerDay: 600, active: true },
        { id: 3, name: 'Lakshmi', salaryPerDay: 450, active: true },
    ],
    attendance: [
        { id: 1, employeeId: 1, date: '2025-11-24', status: 'present' },
        { id: 2, employeeId: 2, date: '2025-11-24', status: 'present' },
        { id: 3, employeeId: 3, date: '2025-11-24', status: 'absent' },
        { id: 4, employeeId: 1, date: '2025-11-25', status: 'present' },
        { id: 5, employeeId: 2, date: '2025-11-25', status: 'present' },
        { id: 6, employeeId: 3, date: '2025-11-25', status: 'present' },
    ],
    sales: [
        { id: 1, date: '2025-10-25', customerId: 1, items: [{ name: 'கை முறுக்கு', qty: 10, price: 100 }], total: 1000 },
        { id: 2, date: '2025-10-26', customerId: 8, items: [{ name: 'அதிரசம்', qty: 5, price: 50 }], total: 250 },
        { id: 3, date: '2025-11-01', customerId: 4, items: [{ name: 'சோமாஸ்', qty: 20, price: 20 }], total: 400 },
        { id: 4, date: '2025-11-20', customerId: 1, items: [{ name: 'கை முறுக்கு', qty: 15, price: 100 }], total: 1500 },
    ],
    production: [
        { id: 1, date: '2025-10-24', item: 'கை முறுக்கு', qty: 50 },
        { id: 2, date: '2025-10-25', item: 'அதிரசம்', qty: 30 },
        { id: 3, date: '2025-11-20', item: 'கை முறுக்கு', qty: 60 },
    ],
    expenses: [
        { id: 1, date: '2025-10-20', category: 'Raw Material', amount: 5000, description: 'Flour' },
        { id: 2, date: '2025-10-22', category: 'Salary', amount: 2000, description: 'Helper' },
        { id: 3, date: '2025-11-20', category: 'Raw Material', amount: 3000, description: 'Oil' },
    ],
    stocks: {
        products: ITEMS.map(item => ({ name: item, qty: 100 })),
        rawMaterials: [
            { name: 'Rice Flour', qty: 50, unit: 'kg' },
            { name: 'Oil', qty: 20, unit: 'L' },
            { name: 'Jaggery', qty: 30, unit: 'kg' }
        ]
    }
};
