
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Plus, Trash2, Save, ArrowLeft, Edit2, X } from 'lucide-react';

const HomeExpenses = ({ onNavigateBack }) => {
    const { homeExpenses, addHomeExpense, updateHomeExpense, deleteHomeExpense, homeExpenseItems } = useData();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Group items by category for the dropdown (filter only expenses)
    const groupedItems = homeExpenseItems
        .filter(item => !item.type || item.type === 'expense')
        .reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

    const sortedCategories = Object.keys(groupedItems).sort();

    const handleItemSelect = (e) => {
        const value = e.target.value;
        if (!value) return;

        const [selectedCat, selectedName] = value.split(':::');
        setCategory(selectedCat);
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

        // Reset form
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

    const sortedExpenses = [...homeExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

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

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
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

                        {/* Expense Item Selection */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Select Expense Item</label>
                            <select
                                onChange={handleItemSelect}
                                className="w-full border rounded p-2 bg-gray-50"
                                defaultValue=""
                            >
                                <option value="">-- Select Item --</option>
                                {sortedCategories.map(cat => (
                                    <optgroup key={cat} label={cat}>
                                        {groupedItems[cat].map(item => (
                                            <option key={item.id} value={`${item.category}:::${item.name}`}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
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
                <div className="p-3 bg-red-50 border-b border-red-100">
                    <h3 className="font-semibold text-gray-700">Expense History</h3>
                </div>
                <div className="divide-y">
                    {sortedExpenses.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">No expense records found</p>
                    ) : (
                        sortedExpenses.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center">
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
