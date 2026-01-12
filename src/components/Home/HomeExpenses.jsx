
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Plus, Trash2, Save, ArrowLeft, Edit2, X, Filter } from 'lucide-react';

const HomeExpenses = ({ onNavigateBack }) => {
    const { homeExpenses, addHomeExpense, updateHomeExpense, deleteHomeExpense, homeExpenseItems } = useData();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Filter states
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    // Group items by category for the dropdown (filter only expenses)
    const groupedItems = homeExpenseItems
        .filter(item => !item.type || item.type === 'expense')
        .reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

    const sortedCategories = Object.keys(groupedItems).sort();

    const handleCategorySelect = (e) => {
        const selectedCat = e.target.value;
        setCategory(selectedCat);
        if (!editingId) setDescription('');
    };

    const handleSubCategorySelect = (e) => {
        const selectedName = e.target.value;
        setDescription(selectedName);
    };

    const handleSubmit = async () => {
        if (!amount) return alert('Amount is required');
        if (!category) return alert('Category is required');

        const data = {
            date,
            description,
            amount: Number(amount),
            category
        };

        if (editingId) {
            await updateHomeExpense(editingId, data);
            setEditingId(null);
        } else {
            await addHomeExpense(data);
        }

        setDescription('');
        setAmount('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setDate(item.date.split('T')[0]);
        setDescription(item.description || '');
        setAmount(item.amount);
        setCategory(item.category || '');
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            await deleteHomeExpense(id);
        }
    };

    // Filtering logic
    const filteredExpenses = homeExpenses.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === filterMonth && itemDate.getFullYear() === filterYear;
    });

    const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalMonthExpense = sortedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Home Expenses</h2>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Expense
                    </button>
                )}
            </div>

            {/* Filter Section */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                <Filter size={18} className="text-gray-400" />
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(Number(e.target.value))}
                        className="w-full border rounded p-1.5 text-sm bg-gray-50"
                    >
                        {months.map((m, i) => (
                            <option key={m} value={i}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        className="w-full border rounded p-1.5 text-sm bg-gray-50"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 border border-red-100">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setDescription('');
                                setAmount('');
                                setCategory('');
                                setShowForm(false);
                            }}
                            className="text-xs text-gray-500 flex items-center gap-1"
                        >
                            <X size={14} /> Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border rounded p-2"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Select Category</label>
                                <select
                                    value={category}
                                    onChange={handleCategorySelect}
                                    className="w-full border rounded p-2 bg-gray-50 text-sm"
                                >
                                    <option value="">-- Select Category --</option>
                                    {sortedCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="Others-Manual">Add New Category</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Select Item</label>
                                <select
                                    value={description}
                                    onChange={handleSubCategorySelect}
                                    className={`w-full border rounded p-2 bg-gray-50 text-sm ${!category ? 'opacity-50' : ''}`}
                                    disabled={!category || category === 'Others-Manual'}
                                >
                                    <option value="">-- Select Item --</option>
                                    {category && groupedItems[category] && groupedItems[category].map(item => (
                                        <option key={item.id} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Category</label>
                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Amount</label>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Description / Note</label>
                            <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                        {editingId ? <Save size={20} /> : <Plus size={20} />}
                        {editingId ? 'Update Expense' : 'Add Expense'}
                    </button>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Expense History</h3>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Monthly Total</p>
                        <p className="font-bold text-red-600">{formatCurrency(totalMonthExpense)}</p>
                    </div>
                </div>
                <div className="divide-y">
                    {sortedExpenses.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <p className="text-sm italic">No records found for {months[filterMonth]} {filterYear}</p>
                        </div>
                    ) : (
                        sortedExpenses.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-800">{item.category}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()} • {item.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-red-600">{formatCurrency(item.amount)}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(item)} className="text-blue-500 p-1 hover:bg-blue-50 rounded">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeExpenses;
