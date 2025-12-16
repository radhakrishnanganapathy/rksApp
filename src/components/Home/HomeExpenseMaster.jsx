import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Trash2, Save, ArrowLeft, Edit2, X } from 'lucide-react';

const HomeExpenseMaster = ({ onNavigateBack }) => {
    const { homeExpenseItems, addHomeExpenseItem, updateHomeExpenseItem, deleteHomeExpenseItem } = useData();

    const [activeType, setActiveType] = useState('expense'); // 'income' or 'expense'
    const [category, setCategory] = useState('');
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Pre-defined categories
    const expenseCategories = [
        'Loans & EMIs', 'Utilities & Bills', 'Transportation', 'Maintenance',
        'Food (Home)', 'Food (Outside)', 'Groceries', 'Shopping & Lifestyle',
        'Health & Medical', 'Emergency', 'Others'
    ];

    const incomeCategories = [
        'Salary', 'Business', 'Rent', 'Interest', 'Gift', 'Others'
    ];

    const defaultCategories = activeType === 'expense' ? expenseCategories : incomeCategories;

    const handleSubmit = async () => {
        if (!category.trim() || !name.trim()) return alert('Category and Name are required');

        const data = {
            category: category.trim(),
            name: name.trim(),
            type: activeType
        };

        if (editingId) {
            await updateHomeExpenseItem(editingId, data);
            setEditingId(null);
        } else {
            await addHomeExpenseItem(data);
        }

        // Reset form partially
        setName('');
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setCategory(item.category);
        setName(item.name);
        setActiveType(item.type || 'expense');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteHomeExpenseItem(id);
        }
    };

    // Filter and Group items
    const filteredItems = homeExpenseItems.filter(item => (item.type || 'expense') === activeType);

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const sortedCategories = Object.keys(groupedItems).sort();

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Inc/Exp List Master</h2>
            </div>

            {/* Type Toggle */}
            <div className="flex bg-gray-200 p-1 rounded-lg">
                <button
                    onClick={() => { setActiveType('income'); setCategory(''); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeType === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
                >
                    Income Items
                </button>
                <button
                    onClick={() => { setActiveType('expense'); setCategory(''); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeType === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-600'}`}
                >
                    Expense Items
                </button>
            </div>

            {/* Add/Edit Form */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">{editingId ? 'Edit Item' : `Add ${activeType === 'income' ? 'Income' : 'Expense'} Item`}</h3>
                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setCategory('');
                                setName('');
                            }}
                            className="text-xs text-gray-500 flex items-center gap-1"
                        >
                            <X size={14} /> Cancel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Category</label>
                        <input
                            list="categories"
                            type="text"
                            placeholder="Select or Type Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                        <datalist id="categories">
                            {defaultCategories.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Item Name</label>
                        <input
                            type="text"
                            placeholder={activeType === 'income' ? "e.g., Monthly Salary" : "e.g., Petrol - TVS XL"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className={`w-full text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${activeType === 'income' ? 'bg-green-600' : 'bg-red-600'}`}
                >
                    {editingId ? <Save size={20} /> : <Plus size={20} />}
                    {editingId ? 'Update Item' : 'Add Item'}
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {sortedCategories.map(cat => (
                    <div key={cat} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-100 border-b border-gray-200 font-bold text-gray-700 flex justify-between">
                            <span>{cat}</span>
                            <span className="text-xs font-normal px-2 py-1 rounded bg-gray-200 text-gray-600 uppercase">{activeType}</span>
                        </div>
                        <div className="divide-y">
                            {groupedItems[cat].map(item => (
                                <div key={item.id} className="p-3 flex justify-between items-center">
                                    <span className="text-gray-800">{item.name}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(item)} className="text-blue-500 p-1 hover:bg-blue-50 rounded">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {sortedCategories.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No {activeType} items found. Add some above!</p>
                )}
            </div>
        </div>
    );
};

export default HomeExpenseMaster;
