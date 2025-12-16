import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

const FarmIncome = ({ onNavigateBack }) => {
    const { farmCrops, farmIncome, addFarmIncome, updateFarmIncome, deleteFarmIncome } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        cropId: '',
        amountType: 'received', // 'advance' or 'received'
        amount: '',
        notes: ''
    });

    // Get only active crops
    const activeCrops = farmCrops?.filter(c => c.cropStatus === 'active') || [];

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            cropId: '',
            amountType: 'received',
            amount: '',
            notes: ''
        });
        setEditingIncome(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const incomeData = {
            ...formData,
            amount: parseFloat(formData.amount),
            cropId: parseInt(formData.cropId)
        };

        try {
            if (editingIncome) {
                await updateFarmIncome(editingIncome.id, incomeData);
            } else {
                await addFarmIncome(incomeData);
            }
            resetForm();
        } catch (error) {
            console.error('Error saving income:', error);
            alert('Failed to save income. Please try again.');
        }
    };

    const handleEdit = (income) => {
        setEditingIncome(income);
        setFormData({
            date: income.date,
            cropId: income.cropId.toString(),
            amountType: income.amountType,
            amount: income.amount.toString(),
            notes: income.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this income record?')) {
            await deleteFarmIncome(id);
        }
    };

    // Group income by date
    const groupedIncome = (farmIncome || []).reduce((acc, income) => {
        const date = income.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(income);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedIncome).sort((a, b) => new Date(b) - new Date(a));

    // Calculate totals
    const totalAdvance = farmIncome?.filter(i => i.amountType === 'advance').reduce((sum, i) => sum + i.amount, 0) || 0;
    const totalReceived = farmIncome?.filter(i => i.amountType === 'received').reduce((sum, i) => sum + i.amount, 0) || 0;
    const totalIncome = totalAdvance + totalReceived;

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
                    <h2 className="text-2xl font-bold text-gray-800">Farm Income</h2>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Income
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-4">
                    <p className="text-xs text-green-700 font-semibold mb-1">Total Income</p>
                    <p className="text-xl font-bold text-green-900">₹{totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-4">
                    <p className="text-xs text-blue-700 font-semibold mb-1">Advance</p>
                    <p className="text-xl font-bold text-blue-900">₹{totalAdvance.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400 rounded-lg p-4">
                    <p className="text-xs text-purple-700 font-semibold mb-1">Received</p>
                    <p className="text-xl font-bold text-purple-900">₹{totalReceived.toFixed(2)}</p>
                </div>
            </div>

            {/* Info Card */}
            {activeCrops.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ No active crops available
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                        Please add crops in the Cultivation section first.
                    </p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingIncome ? 'Edit Income' : 'Add Income'}
                        </h3>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* Active Crop */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Active Crop *
                                </label>
                                {activeCrops.length > 0 ? (
                                    <select
                                        required
                                        value={formData.cropId}
                                        onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Select Active Crop</option>
                                        {activeCrops.map(crop => (
                                            <option key={crop.id} value={crop.id}>
                                                {crop.cropName} {crop.batchNumber ? `(${crop.batchNumber})` : ''} - {crop.acresUsed} acres
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                                        No active crops available
                                    </div>
                                )}
                            </div>

                            {/* Amount Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount Type *
                                </label>
                                <select
                                    required
                                    value={formData.amountType}
                                    onChange={(e) => setFormData({ ...formData, amountType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="received">Received</option>
                                    <option value="advance">Advance</option>
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., 50000"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            {/* Buttons */}
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
                                    disabled={activeCrops.length === 0}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Save size={16} />
                                    {editingIncome ? 'Update' : 'Save'} Income
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Income List */}
            {sortedDates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No income records yet.</p>
                    <p className="text-sm mt-1">Add your first income record to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-gray-500" />
                                <h3 className="font-semibold text-gray-700">
                                    {new Date(date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {groupedIncome[date].map(income => {
                                    const crop = farmCrops?.find(c => c.id === income.cropId);
                                    return (
                                        <div key={income.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">{crop?.cropName || 'Unknown Crop'}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${income.amountType === 'advance'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            {income.amountType === 'advance' ? 'Advance' : 'Received'}
                                                        </span>
                                                        <span className="text-lg font-bold text-green-600">
                                                            ₹{income.amount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {income.notes && (
                                                        <p className="text-sm text-gray-600 mt-2">{income.notes}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(income)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(income.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FarmIncome;
