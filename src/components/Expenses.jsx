import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Save, Wallet, Package, TrendingDown, List, Trash2, Edit, X } from 'lucide-react';
import { formatCurrency, filterByMonthYear } from '../utils';

const Expenses = () => {
    const {
        expenses, addExpense, updateExpense, deleteExpense,
        stocks,
        rawMaterialUsage, addRawMaterialUsage, updateRawMaterialUsage, deleteRawMaterialUsage
    } = useData();

    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'rawstock' | 'usage' | 'list'

    // --- Tab 1: Daily Expenses ---
    const [expId, setExpId] = useState(null); // For editing
    const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
    const [expCategory, setExpCategory] = useState('Raw Material');
    const [expMaterialName, setExpMaterialName] = useState('');
    const [expUnit, setExpUnit] = useState('kg');
    const [expQuantity, setExpQuantity] = useState('');
    const [expAmount, setExpAmount] = useState('');
    const [expNotes, setExpNotes] = useState('');

    // --- Tab 3: Raw Material Usage ---
    const [usageId, setUsageId] = useState(null); // For editing
    const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);
    const [usageMaterialName, setUsageMaterialName] = useState('');
    const [usageQuantity, setUsageQuantity] = useState('');
    const [usageUnit, setUsageUnit] = useState('kg');
    const [usageNotes, setUsageNotes] = useState('');

    // --- Filters ---
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [filterCategory, setFilterCategory] = useState('All');

    // --- Helper Functions ---
    const resetExpForm = () => {
        setExpId(null);
        setExpDate(new Date().toISOString().split('T')[0]);
        setExpCategory('Raw Material');
        setExpMaterialName('');
        setExpUnit('kg');
        setExpQuantity('');
        setExpAmount('');
        setExpNotes('');
    };

    const resetUsageForm = () => {
        setUsageId(null);
        setUsageDate(new Date().toISOString().split('T')[0]);
        setUsageMaterialName('');
        setUsageQuantity('');
        setUsageUnit('kg');
        setUsageNotes('');
    };

    // --- Handlers ---
    const handleSaveExpense = async () => {
        if (!expAmount) return alert('Amount is required');
        if (expCategory === 'Raw Material' && !expMaterialName) return alert('Material Name is required for Raw Material');

        const expenseData = {
            date: expDate,
            category: expCategory,
            materialName: expCategory === 'Raw Material' ? expMaterialName : null,
            unit: expCategory === 'Raw Material' ? expUnit : null,
            quantity: expCategory === 'Raw Material' && expUnit !== '₹' ? Number(expQuantity) : null,
            amount: Number(expAmount),
            notes: expNotes
        };

        if (expId) {
            await updateExpense(expId, expenseData);
            alert('Expense Updated!');
        } else {
            await addExpense(expenseData);
            alert('Expense Added!');
        }
        resetExpForm();
    };

    const handleEditExpense = (expense) => {
        setExpId(expense.id);
        setExpDate(expense.date);
        setExpCategory(expense.category);
        setExpMaterialName(expense.materialName || '');
        setExpUnit(expense.unit || 'kg');
        setExpQuantity(expense.quantity || '');
        setExpAmount(expense.amount);
        setExpNotes(expense.notes || '');
        setActiveTab('expenses');
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense? Stock will be reverted.')) {
            await deleteExpense(id);
        }
    };

    const handleSaveUsage = async () => {
        if (!usageMaterialName || !usageQuantity) return alert('Material and Quantity are required');

        const usageData = {
            date: usageDate,
            materialName: usageMaterialName,
            quantityUsed: Number(usageQuantity),
            unit: usageUnit,
            notes: usageNotes
        };

        if (usageId) {
            await updateRawMaterialUsage(usageId, usageData);
            alert('Usage Updated!');
        } else {
            await addRawMaterialUsage(usageData);
            alert('Usage Recorded!');
        }
        resetUsageForm();
    };

    const handleEditUsage = (usage) => {
        setUsageId(usage.id);
        setUsageDate(usage.date);
        setUsageMaterialName(usage.materialName);
        setUsageQuantity(usage.quantityUsed);
        setUsageUnit(usage.unit);
        setUsageNotes(usage.notes || '');
        setActiveTab('usage');
    };

    const handleDeleteUsage = async (id) => {
        if (window.confirm('Are you sure you want to delete this usage? Stock will be reverted.')) {
            await deleteRawMaterialUsage(id);
        }
    };

    // --- Derived Data ---
    const filteredExpenses = useMemo(() => {
        let data = filterByMonthYear(expenses, selectedMonth, selectedYear);
        if (filterCategory !== 'All') {
            data = data.filter(e => e.category === filterCategory);
        }
        return data;
    }, [expenses, selectedMonth, selectedYear, filterCategory]);

    const filteredUsage = useMemo(() =>
        filterByMonthYear(rawMaterialUsage, selectedMonth, selectedYear),
        [rawMaterialUsage, selectedMonth, selectedYear]
    );

    // Stock Calculations
    const stockData = useMemo(() => {
        return stocks.rawMaterials.map(item => {
            // Calculate Added (from expenses)
            const added = expenses
                .filter(e => e.category === 'Raw Material' && e.materialName === item.name && e.unit === item.unit)
                .reduce((sum, e) => sum + Number(e.quantity || 0), 0);

            // Calculate Used (from usage)
            const used = rawMaterialUsage
                .filter(u => u.materialName === item.name && u.unit === item.unit)
                .reduce((sum, u) => sum + Number(u.quantityUsed || 0), 0);

            // Current is from DB (item.qty)
            // Opening = Current - Added + Used (Approximation for display if we assume DB is current)
            // Note: This logic assumes 'expenses' and 'usage' contain ALL history. 
            // If they are paginated or filtered, this calculation is only valid for the loaded data.
            // Since we load all data, this should be fine.
            const opening = Number(item.qty) - added + used;

            return {
                ...item,
                opening,
                added,
                used,
                current: Number(item.qty)
            };
        });
    }, [stocks.rawMaterials, expenses, rawMaterialUsage]);

    const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={24} />
                Expenses & Raw Materials
            </h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('expenses')}
                >
                    Expenses
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'rawstock' ? 'bg-white shadow text-amber-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('rawstock')}
                >
                    Raw Material Stock
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'usage' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('usage')}
                >
                    Raw Material Usage
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('list')}
                >
                    Expenses List
                </button>
            </div>

            {/* --- Tab 1: Expenses Form --- */}
            {activeTab === 'expenses' && (
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">{expId ? 'Edit Expense' : 'Add Daily Expense'}</h3>
                        {expId && <button onClick={resetExpForm} className="text-xs text-gray-500 flex items-center gap-1"><X size={14} /> Cancel</button>}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="w-full border rounded p-2">
                                <option value="Raw Material">Raw Material</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Salary">Salary</option>
                                <option value="Rent">Rent</option>
                                <option value="Transport">Transport</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {expCategory === 'Raw Material' && (
                            <div className="bg-amber-50 p-3 rounded border border-amber-100 space-y-3">
                                <h4 className="text-sm font-medium text-amber-800 flex items-center gap-1"><Package size={14} /> Raw Material Details</h4>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Material Name</label>
                                    <input
                                        type="text"
                                        value={expMaterialName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setExpMaterialName(val);
                                            const item = stocks.rawMaterials.find(s => s.name === val);
                                            if (item) setExpUnit(item.unit);
                                        }}
                                        className="w-full border rounded p-2 text-sm"
                                        placeholder="e.g. Sugar"
                                        list="material-suggestions"
                                    />
                                    <datalist id="material-suggestions">
                                        {stocks.rawMaterials.map((s, i) => <option key={i} value={s.name} />)}
                                    </datalist>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Unit</label>
                                        <select value={expUnit} onChange={(e) => setExpUnit(e.target.value)} className="w-full border rounded p-2 text-sm">
                                            <option value="kg">kg</option>
                                            <option value="lt">lt</option>
                                            <option value="count">count</option>
                                            <option value="₹">Direct Amount (₹)</option>
                                        </select>
                                    </div>
                                    {expUnit !== '₹' && (
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                value={expQuantity}
                                                onChange={(e) => setExpQuantity(e.target.value)}
                                                className="w-full border rounded p-2 text-sm"
                                                placeholder="Qty"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                            <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="w-full border rounded p-2" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                            <input type="text" value={expNotes} onChange={(e) => setExpNotes(e.target.value)} className="w-full border rounded p-2" placeholder="Description..." />
                        </div>
                    </div>

                    <button onClick={handleSaveExpense} className="w-full bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Save size={20} /> {expId ? 'Update Expense' : 'Save Expense'}
                    </button>
                </div>
            )}

            {/* --- Tab 2: Raw Material Stock --- */}
            {activeTab === 'rawstock' && (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Package size={20} /> Stock Overview</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2">Material</th>
                                        <th className="px-3 py-2 text-right">Opening</th>
                                        <th className="px-3 py-2 text-right text-green-600">Added</th>
                                        <th className="px-3 py-2 text-right text-red-600">Used</th>
                                        <th className="px-3 py-2 text-right font-bold">Current</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {stockData.length === 0 ? (
                                        <tr><td colSpan="5" className="px-3 py-4 text-center text-gray-500">No raw materials found</td></tr>
                                    ) : (
                                        stockData.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2 font-medium">
                                                    {item.name} <span className="text-xs text-gray-400">({item.unit})</span>
                                                </td>
                                                <td className="px-3 py-2 text-right text-gray-600">{item.opening.toFixed(1)}</td>
                                                <td className="px-3 py-2 text-right text-green-600">+{item.added.toFixed(1)}</td>
                                                <td className="px-3 py-2 text-right text-red-600">-{item.used.toFixed(1)}</td>
                                                <td className="px-3 py-2 text-right font-bold">{item.current.toFixed(1)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            <p><strong>Note:</strong> Current Stock = Opening + Added - Used.</p>
                            <p>To add stock, create a "Raw Material" expense.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Tab 3: Raw Material Usage --- */}
            {activeTab === 'usage' && (
                <div className="space-y-4">
                    {/* Usage Form */}
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">{usageId ? 'Edit Usage' : 'Record Daily Usage'}</h3>
                            {usageId && <button onClick={resetUsageForm} className="text-xs text-gray-500 flex items-center gap-1"><X size={14} /> Cancel</button>}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <input type="date" value={usageDate} onChange={(e) => setUsageDate(e.target.value)} className="w-full border rounded p-2" />

                            <div>
                                <label className="block text-xs font-medium mb-1">Material</label>
                                <select
                                    value={usageMaterialName}
                                    onChange={(e) => {
                                        setUsageMaterialName(e.target.value);
                                        const item = stocks.rawMaterials.find(s => s.name === e.target.value);
                                        if (item) setUsageUnit(item.unit);
                                    }}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="">Select Material</option>
                                    {stocks.rawMaterials.map((s, i) => <option key={i} value={s.name}>{s.name} ({s.unit})</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium mb-1">Quantity Used</label>
                                    <input type="number" value={usageQuantity} onChange={(e) => setUsageQuantity(e.target.value)} className="w-full border rounded p-2" placeholder="Qty" />
                                </div>
                                <div className="w-20">
                                    <label className="block text-xs font-medium mb-1">Unit</label>
                                    <input type="text" value={usageUnit} readOnly className="w-full border rounded p-2 bg-gray-100 text-gray-500" />
                                </div>
                            </div>

                            <input type="text" value={usageNotes} onChange={(e) => setUsageNotes(e.target.value)} className="w-full border rounded p-2" placeholder="Notes (optional)" />
                        </div>
                        <button onClick={handleSaveUsage} className="w-full bg-purple-600 text-white py-2 rounded font-medium flex items-center justify-center gap-2">
                            <TrendingDown size={18} /> {usageId ? 'Update Usage' : 'Record Usage'}
                        </button>
                    </div>

                    {/* Usage List */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b font-semibold text-gray-700">Usage History</div>
                        <div className="divide-y max-h-80 overflow-y-auto">
                            {filteredUsage.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No usage records found</div>
                            ) : (
                                filteredUsage.map(u => (
                                    <div key={u.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-gray-800">{u.materialName}</div>
                                            <div className="text-xs text-gray-500">{u.date} • {u.quantityUsed} {u.unit}</div>
                                            {u.notes && <div className="text-xs text-gray-400 italic">{u.notes}</div>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditUsage(u)} className="text-blue-600 p-1"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteUsage(u.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- Tab 4: Expenses List --- */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                        <div className="flex gap-2">
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="flex-1 border rounded p-2 text-sm">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-24 border rounded p-2 text-sm">
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border rounded p-2 text-sm">
                            <option value="All">All Categories</option>
                            <option value="Raw Material">Raw Material</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Salary">Salary</option>
                            <option value="Rent">Rent</option>
                            <option value="Transport">Transport</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex justify-between items-center">
                        <div>
                            <div className="text-xs text-red-600 font-bold uppercase">Total Expenses</div>
                            <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalExpensesAmount)}</div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            {filteredExpenses.length} records
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="divide-y">
                            {filteredExpenses.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No expenses found</div>
                            ) : (
                                filteredExpenses.map(expense => (
                                    <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 text-xs rounded font-medium ${expense.category === 'Raw Material' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {expense.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{expense.date}</span>
                                                </div>
                                                <div className="font-medium text-gray-800">
                                                    {expense.category === 'Raw Material' ? (
                                                        <span>{expense.materialName} <span className="text-gray-500 text-xs">({expense.quantity} {expense.unit})</span></span>
                                                    ) : (
                                                        expense.notes || 'No description'
                                                    )}
                                                </div>
                                                {expense.category === 'Raw Material' && expense.notes && (
                                                    <div className="text-xs text-gray-400 mt-1">{expense.notes}</div>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <span className="font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditExpense(expense)} className="text-blue-600 p-1 bg-blue-50 rounded"><Edit size={14} /></button>
                                                    <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 p-1 bg-red-50 rounded"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
