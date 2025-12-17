import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Plus, Trash2, Save, ArrowLeft, Edit2, X } from 'lucide-react';

const HomeIncome = ({ onNavigateBack }) => {
    const { homeIncome, addHomeIncome, updateHomeIncome, deleteHomeIncome, homeExpenseItems } = useData();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [selectedDropdownCategory, setSelectedDropdownCategory] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Group items by category for the dropdown (filter only income)
    const groupedItems = homeExpenseItems
        .filter(item => item.type === 'income')
        .reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

    const sortedCategories = Object.keys(groupedItems).sort();

    const handleCategoryDropdownChange = (e) => {
        const cat = e.target.value;
        setSelectedDropdownCategory(cat);
        setCategory(cat);
        setDescription(''); // Reset sub-category selection
    };

    const handleSubCategoryDropdownChange = (e) => {
        const value = e.target.value;
        if (!value) return;

        const [selectedCat, selectedName] = value.split(':::');
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
            await updateHomeIncome(editingId, data);
            setEditingId(null);
        } else {
            await addHomeIncome(data);
        }

        // Reset form
        setDescription('');
        setAmount('');
        setCategory('');
        setSelectedDropdownCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setDate(item.date.split('T')[0]);
        setDescription(item.description || '');
        setAmount(item.amount);
        setCategory(item.category || '');
        setSelectedDropdownCategory(item.category || '');
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this income record?')) {
            await deleteHomeIncome(id);
        }
    };

    const sortedIncome = [...homeIncome].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Home Income</h2>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Income
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Income' : 'Add Income'}</h3>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setDescription('');
                                setAmount('');
                                setCategory('');
                                setSelectedDropdownCategory('');
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

                        {/* Category Selection */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Select Category</label>
                            <select
                                onChange={handleCategoryDropdownChange}
                                className="w-full border rounded p-2 bg-gray-50"
                                value={selectedDropdownCategory}
                            >
                                <option value="">-- Select Category --</option>
                                {sortedCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sub-Category Selection */}
                        {selectedDropdownCategory && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Select Item (Sub-Category)</label>
                                <select
                                    onChange={handleSubCategoryDropdownChange}
                                    className="w-full border rounded p-2 bg-gray-50"
                                    defaultValue=""
                                >
                                    <option value="">-- Select Item --</option>
                                    {groupedItems[selectedDropdownCategory]?.map(item => (
                                        <option key={item.id} value={`${item.category}:::${item.name}`}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

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
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                        {editingId ? <Save size={20} /> : <Plus size={20} />}
                        {editingId ? 'Update Income' : 'Add Income'}
                    </button>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-green-50 border-b border-green-100">
                    <h3 className="font-semibold text-gray-700">Income History</h3>
                </div>
                <div className="divide-y">
                    {sortedIncome.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">No income records found</p>
                    ) : (
                        sortedIncome.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{item.category}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()} • {item.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-green-600">{formatCurrency(item.amount)}</span>
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

export default HomeIncome;
