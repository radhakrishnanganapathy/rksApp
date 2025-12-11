import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

const Harvesting = ({ onNavigateBack }) => {
    const { farmCrops } = useData();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        cropId: '',
        harvestingUnit: 'kg',
        quantity: '',
        notes: ''
    });

    // Get only active crops for harvesting
    const activeCrops = farmCrops?.filter(c => c.cropStatus === 'active') || [];

    const harvestingUnits = ['kg', 'ton', 'quintal', 'count', 'bunch'];

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            cropId: '',
            harvestingUnit: 'kg',
            quantity: '',
            notes: ''
        });
        setShowForm(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // TODO: Add harvesting record to database
        console.log('Harvesting data:', formData);
        alert('Harvesting record saved successfully!');

        resetForm();
    };

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
                    <h2 className="text-2xl font-bold text-gray-800">Harvesting</h2>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Harvest
                </button>
            </div>

            {/* Info Card */}
            {activeCrops.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ No active crops available for harvesting
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
                        <h3 className="text-xl font-bold mb-4">Add Harvest Record</h3>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            {/* Active Crop Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Active Crop *
                                </label>
                                {activeCrops.length > 0 ? (
                                    <select
                                        required
                                        value={formData.cropId}
                                        onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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

                            {/* Harvesting Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Harvesting Unit *
                                </label>
                                <select
                                    required
                                    value={formData.harvestingUnit}
                                    onChange={(e) => setFormData({ ...formData, harvestingUnit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    {harvestingUnits.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="e.g., 100"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Additional notes about this harvest..."
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
                                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Save size={16} />
                                    Save Harvest
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Harvesting Records List - Placeholder */}
            <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No harvesting records yet.</p>
                <p className="text-sm mt-1">Add your first harvest record to get started!</p>
            </div>
        </div>
    );
};

export default Harvesting;
