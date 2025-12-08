import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

// Farm Expenses Component with Category-Specific Fields
const FarmExpenses = ({ onNavigateBack }) => {
    const { farmExpenses, farmCrops, farmExpenseCategories, addFarmExpense, updateFarmExpense, deleteFarmExpense, refreshData } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        cropId: '',
        categoryId: '',
        subcategoryId: '',
        unit: '',
        quantity: '',
        maleCount: '',
        femaleCount: '',
        amount: '',
        notes: ''
    });

    const activeCrops = farmCrops?.filter(c => c.cropStatus === 'active') || [];
    const categories = farmExpenseCategories || [];

    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    const subcategories = selectedCategory?.subcategories || [];
    const categoryName = selectedCategory?.name?.toLowerCase() || '';

    // Get unit options based on category and subcategory
    const getUnitOptions = () => {
        switch (categoryName) {
            case 'fertilizer':
                return ['kg', 'liter'];
            case 'seeds or plant':
                return ['kg', 'count'];
            case 'tillage':
                return ['hours', 'acres'];
            case 'farming':
                const selectedSubcat = subcategories.find(s => s.id === formData.subcategoryId);
                if (selectedSubcat?.name?.toLowerCase() === 'machine') {
                    return ['hours', 'acres'];
                }
                return [];
            default:
                return [];
        }
    };

    // Check if category requires workers selection
    const requiresWorkers = () => {
        if (categoryName === 'workers') return true;
        if (categoryName === 'farming') {
            const selectedSubcat = subcategories.find(s => s.id === formData.subcategoryId);
            return selectedSubcat?.name?.toLowerCase() === 'workers';
        }
        return false;
    };

    // Check if category requires unit/quantity
    const requiresUnitQuantity = () => {
        return ['fertilizer', 'seeds or plant', 'tillage'].includes(categoryName) ||
            (categoryName === 'farming' && subcategories.find(s => s.id === parseInt(formData.subcategoryId))?.name?.toLowerCase() === 'machine');
    };

    // Check if only notes required
    const onlyNotesRequired = () => {
        return categoryName === 'maintenance work';
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            cropId: '',
            categoryId: '',
            subcategoryId: '',
            unit: '',
            quantity: '',
            maleCount: '',
            femaleCount: '',
            amount: '',
            notes: ''
        });
        setEditingExpense(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const expenseData = {
                date: formData.date,
                cropId: formData.cropId,
                categoryId: formData.categoryId,
                subcategoryId: formData.subcategoryId || null,
                unit: formData.unit || null,
                quantity: formData.quantity ? parseFloat(formData.quantity) : null,
                maleCount: formData.maleCount ? parseInt(formData.maleCount) : null,
                femaleCount: formData.femaleCount ? parseInt(formData.femaleCount) : null,
                amount: parseFloat(formData.amount),
                notes: formData.notes || null
            };

            if (editingExpense) {
                await updateFarmExpense(editingExpense.id, expenseData);
            } else {
                await addFarmExpense(expenseData);
            }

            await refreshData();
            resetForm();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Failed to save expense. Please try again.');
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);

        // Format date for input field (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
            if (!dateString) return new Date().toISOString().split('T')[0];
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        setFormData({
            date: formatDateForInput(expense.date),
            cropId: expense.cropId,
            categoryId: expense.categoryId,
            subcategoryId: expense.subcategoryId || '',
            unit: expense.unit || '',
            quantity: expense.quantity || '',
            maleCount: expense.maleCount || '',
            femaleCount: expense.femaleCount || '',
            amount: expense.amount,
            notes: expense.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await deleteFarmExpense(id);
                await refreshData();
            } catch (error) {
                console.error('Error deleting expense:', error);
                alert('Failed to delete expense. Please try again.');
            }
        }
    };

    const handleCategoryChange = (categoryId) => {
        const units = getUnitOptions();
        setFormData({
            ...formData,
            categoryId,
            subcategoryId: '',
            unit: '',
            quantity: '',
            maleCount: '',
            femaleCount: '',
            notes: ''
        });
    };

    const handleSubcategoryChange = (subcategoryId) => {
        setFormData({
            ...formData,
            subcategoryId,
            unit: '',
            quantity: '',
            maleCount: '',
            femaleCount: ''
        });
    };

    // Group expenses by date
    const groupedExpenses = (farmExpenses || []).reduce((acc, expense) => {
        const date = expense.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(expense);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onNavigateBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Farm Expenses</h2>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Expense
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editingExpense ? 'Edit' : 'Add'} Farm Expense</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            {/* Crop */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop *
                                </label>
                                <select
                                    required
                                    value={formData.cropId}
                                    onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="">Select Crop</option>
                                    {activeCrops.map((crop) => (
                                        <option key={crop.id} value={crop.id}>
                                            {crop.cropName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategory */}
                            {subcategories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {categoryName === 'fertilizer' && 'Fertilizer Name *'}
                                        {categoryName === 'seeds or plant' && 'Seed/Plant Name *'}
                                        {categoryName === 'tillage' && 'Tillage Type *'}
                                        {categoryName === 'farming' && 'Farming Method *'}
                                        {!['fertilizer', 'seeds or plant', 'tillage', 'farming'].includes(categoryName) && 'Subcategory'}
                                    </label>
                                    <select
                                        required={['fertilizer', 'seeds or plant', 'tillage', 'farming'].includes(categoryName)}
                                        value={formData.subcategoryId}
                                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="">Select {categoryName === 'fertilizer' ? 'Fertilizer' : categoryName === 'seeds or plant' ? 'Seed/Plant' : 'Type'}</option>
                                        {subcategories.map((subcat) => (
                                            <option key={subcat.id} value={subcat.id}>
                                                {subcat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Unit & Quantity - For Fertilizer, Seeds, Tillage, Farming(Machine) */}
                            {requiresUnitQuantity() && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit *
                                        </label>
                                        <select
                                            required
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        >
                                            <option value="">Select Unit</option>
                                            {getUnitOptions().map((unit) => (
                                                <option key={unit} value={unit}>
                                                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Enter quantity"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Workers Count - For Workers category or Farming(Workers) */}
                            {requiresWorkers() && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Male Count
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.maleCount}
                                                onChange={(e) => setFormData({ ...formData, maleCount: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                placeholder="Male"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Female Count
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.femaleCount}
                                                onChange={(e) => setFormData({ ...formData, femaleCount: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                placeholder="Female"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 -mt-2">
                                        Enter at least one count (male or female)
                                    </p>
                                </>
                            )}

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes {onlyNotesRequired() && '*'}
                                </label>
                                <textarea
                                    required={onlyNotesRequired()}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows="3"
                                    placeholder={onlyNotesRequired() ? "Enter maintenance work details..." : "Additional notes (optional)"}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    {editingExpense ? 'Update' : 'Add'} Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expenses List */}
            {sortedDates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <DollarSign size={48} className="mx-auto mb-3 text-gray-400" />
                    <p>No farm expenses recorded yet.</p>
                    <p className="text-sm mt-1">Add your first expense to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedDates.map((date) => {
                        const dayExpenses = groupedExpenses[date];
                        const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

                        return (
                            <div key={date} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-gray-600" />
                                        <span className="font-semibold text-gray-800">
                                            {new Date(date).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <span className="font-bold text-red-600">₹{dayTotal.toFixed(2)}</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {dayExpenses.map((expense) => (
                                        <div key={expense.id} className="px-4 py-3 hover:bg-gray-50">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{expense.cropName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {expense.categoryName}
                                                        {expense.subcategoryName && ` - ${expense.subcategoryName}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-gray-800">₹{expense.amount.toFixed(2)}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(expense)}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit expense"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete expense"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 space-y-1">
                                                {expense.quantity && expense.unit && (
                                                    <p>{expense.quantity} {expense.unit}</p>
                                                )}
                                                {(expense.maleCount || expense.femaleCount) && (
                                                    <p>
                                                        Workers:
                                                        {expense.maleCount > 0 && ` Male: ${expense.maleCount}`}
                                                        {expense.femaleCount > 0 && ` Female: ${expense.femaleCount}`}
                                                    </p>
                                                )}
                                                {expense.notes && (
                                                    <p className="italic">Note: {expense.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FarmExpenses;
