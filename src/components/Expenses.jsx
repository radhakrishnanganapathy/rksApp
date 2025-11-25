import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Save, Wallet, Package, TrendingDown } from 'lucide-react';
import { formatCurrency, filterByMonthYear } from '../utils';

const Expenses = () => {
    const { expenses, addExpense, rawMaterialPurchases, addRawMaterialPurchase, stocks } = useData();

    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'rawstock' | 'usage' | 'list'

    // Tab 1: Daily Expenses
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('Salary');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    // Tab 2: Raw Material Stocks
    const [rawMaterialName, setRawMaterialName] = useState('');
    const [rawQty, setRawQty] = useState('');
    const [pricePerKg, setPricePerKg] = useState('');
    const [stockCheckDate, setStockCheckDate] = useState(new Date().toISOString().split('T')[0]);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Tab 1: Add Daily Expense
    const handleAddExpense = () => {
        if (!amount) return;
        addExpense({
            date,
            category,
            amount: Number(amount),
            description
        });
        setAmount('');
        setDescription('');
        alert('Expense Added!');
    };

    // Tab 2: Add Raw Material Purchase
    const handleAddRawMaterial = () => {
        if (!rawMaterialName || !rawQty || !pricePerKg) return;

        const totalAmount = Number(rawQty) * Number(pricePerKg);

        addRawMaterialPurchase({
            date: stockCheckDate,
            name: rawMaterialName,
            qty: Number(rawQty),
            pricePerKg: Number(pricePerKg),
            totalAmount
        });

        setRawMaterialName('');
        setRawQty('');
        setPricePerKg('');
        alert('Raw Material Purchase Added!');
    };

    // Filtered data
    const filteredExpenses = useMemo(() =>
        filterByMonthYear(expenses, selectedMonth, selectedYear),
        [expenses, selectedMonth, selectedYear]
    );

    const filteredRawPurchases = useMemo(() =>
        filterByMonthYear(rawMaterialPurchases, selectedMonth, selectedYear),
        [rawMaterialPurchases, selectedMonth, selectedYear]
    );

    // Tab 3: Calculate Raw Material Usage
    const rawMaterialUsage = useMemo(() => {
        const usage = {};

        // Calculate for each raw material
        stocks.rawMaterials.forEach(material => {
            const purchases = filteredRawPurchases.filter(p => p.name === material.name);
            const totalPurchased = purchases.reduce((sum, p) => sum + p.qty, 0);
            const currentStock = material.qty;

            // Usage = Purchases - Current Stock (simplified calculation)
            const used = totalPurchased > currentStock ? totalPurchased - currentStock : 0;

            if (used > 0 && purchases.length > 0) {
                // Calculate average price from purchases
                const avgPrice = purchases.reduce((sum, p) => sum + p.pricePerKg, 0) / purchases.length;

                usage[material.name] = {
                    qty: used,
                    pricePerKg: avgPrice,
                    totalAmount: used * avgPrice
                };
            }
        });

        return Object.keys(usage).map(name => ({
            name,
            ...usage[name]
        }));
    }, [stocks.rawMaterials, filteredRawPurchases]);

    const totalDailyExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRawMaterialUsage = rawMaterialUsage.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalExpenses = totalDailyExpenses + totalRawMaterialUsage;

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={24} />
                Expenses
            </h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg text-xs">
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors ${activeTab === 'expenses' ? 'bg-white shadow text-red-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('expenses')}
                >
                    Daily Expenses
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors ${activeTab === 'rawstock' ? 'bg-white shadow text-amber-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('rawstock')}
                >
                    Raw Material
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors ${activeTab === 'usage' ? 'bg-white shadow text-purple-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('usage')}
                >
                    Usage
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors ${activeTab === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('list')}
                >
                    Expense List
                </button>
            </div>

            {/* Tab 1: Daily Expenses */}
            {activeTab === 'expenses' && (
                <>
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-700">Add Daily Expense</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expense Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border rounded p-2"
                            >
                                <option value="Salary">Salary</option>
                                <option value="Rent">Rent</option>
                                <option value="Transport">Transport</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="e.g., Monthly salary payment"
                            />
                        </div>
                        <button
                            onClick={handleAddExpense}
                            className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Save Expense
                        </button>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Total Card */}
                    <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
                        <div className="text-xs font-semibold uppercase text-red-700 mb-1">Daily Expenses</div>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalDailyExpenses)}</p>
                        <p className="text-xs text-gray-600 mt-1">{filteredExpenses.length} transactions</p>
                    </div>

                    {/* Expense List */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">Expense Records</h3>
                        </div>
                        <div className="divide-y max-h-96 overflow-y-auto">
                            {filteredExpenses.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No expenses found for this period
                                </div>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <div key={expense.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                                                        {expense.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{expense.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-800">{expense.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Tab 2: Raw Material Stocks */}
            {activeTab === 'rawstock' && (
                <>
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-700">Add Raw Material Purchase</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock Checking Date</label>
                            <input
                                type="date"
                                value={stockCheckDate}
                                onChange={(e) => setStockCheckDate(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Material Name</label>
                            <input
                                type="text"
                                value={rawMaterialName}
                                onChange={(e) => setRawMaterialName(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="e.g., Rice Flour"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity (kg)</label>
                                <input
                                    type="number"
                                    value={rawQty}
                                    onChange={(e) => setRawQty(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="e.g., 50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price per kg (₹)</label>
                                <input
                                    type="number"
                                    value={pricePerKg}
                                    onChange={(e) => setPricePerKg(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="e.g., 40"
                                />
                            </div>
                        </div>
                        {rawQty && pricePerKg && (
                            <div className="bg-amber-50 p-3 rounded border border-amber-200">
                                <p className="text-sm text-amber-800">
                                    Total Amount: <span className="font-bold">{formatCurrency(Number(rawQty) * Number(pricePerKg))}</span>
                                </p>
                            </div>
                        )}
                        <button
                            onClick={handleAddRawMaterial}
                            className="w-full bg-amber-600 text-white py-2 rounded flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Add Purchase
                        </button>
                    </div>

                    {/* Current Raw Material Stocks */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">Current Stock Levels</h3>
                        </div>
                        <div className="divide-y">
                            {stocks.rawMaterials.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No raw materials in stock
                                </div>
                            ) : (
                                stocks.rawMaterials.map((material, idx) => (
                                    <div key={idx} className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-50 p-2 rounded-full text-amber-600">
                                                <Package size={20} />
                                            </div>
                                            <span className="font-medium">{material.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-800">{material.qty}</span>
                                            <span className="text-xs text-gray-500 ml-1">kg</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Tab 3: Raw Material Usage */}
            {activeTab === 'usage' && (
                <>
                    {/* Filter Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Total Usage Card */}
                    <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-100">
                        <div className="text-xs font-semibold uppercase text-purple-700 mb-1">Raw Material Usage</div>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalRawMaterialUsage)}</p>
                        <p className="text-xs text-gray-600 mt-1">{rawMaterialUsage.length} materials used</p>
                    </div>

                    {/* Total Expenses Summary */}
                    <div className="bg-gradient-to-r from-red-50 to-purple-50 p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-gray-600 mb-1">Total Expenses (This Month)</div>
                                <p className="text-3xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Daily: {formatCurrency(totalDailyExpenses)} + Raw Material: {formatCurrency(totalRawMaterialUsage)}
                                </p>
                            </div>
                            <TrendingDown size={40} className="text-red-400" />
                        </div>
                    </div>

                    {/* Usage List */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">Material Usage Breakdown</h3>
                        </div>
                        <div className="divide-y">
                            {rawMaterialUsage.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No raw material usage calculated for this period
                                </div>
                            ) : (
                                rawMaterialUsage.map((item, idx) => (
                                    <div key={idx} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {item.qty.toFixed(2)} kg × {formatCurrency(item.pricePerKg)}/kg
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600">{formatCurrency(item.totalAmount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Tab 4: Daily Expenses List */}
            {activeTab === 'list' && (
                <>
                    {/* Filter Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Total Card */}
                    <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
                        <div className="text-xs font-semibold uppercase text-red-700 mb-1">Daily Expenses</div>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalDailyExpenses)}</p>
                        <p className="text-xs text-gray-600 mt-1">{filteredExpenses.length} transactions</p>
                    </div>

                    {/* Expense List */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">Expense Records</h3>
                        </div>
                        <div className="divide-y max-h-96 overflow-y-auto">
                            {filteredExpenses.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No expenses found for this period
                                </div>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <div key={expense.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                                                        {expense.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{expense.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-800">{expense.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Expenses;
