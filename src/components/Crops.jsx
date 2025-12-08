import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';

const Crops = ({ onNavigateBack }) => {
    const { farmCrops, addFarmCrop, updateFarmCrop, deleteFarmCrop } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);
    const [formData, setFormData] = useState({
        cropName: '',
        cropType: '',
        acresUsed: '',
        timeDuration: '',
        durationUnit: 'days', // days, months, years
        startingDate: '',
        estimatedEndingDate: '',
        autoCalculateEndDate: true, // Toggle for auto-calculation
        actualEndDate: '', // Actual completion date
        cropStatus: 'active'
    });

    // Calculate estimated end date based on start date and duration
    const calculateEstimatedEndDate = (startDate, duration, unit) => {
        if (!startDate || !duration) return '';

        const start = new Date(startDate);
        const durationNum = parseInt(duration);

        if (isNaN(durationNum)) return '';

        let endDate = new Date(start);

        switch (unit) {
            case 'days':
                endDate.setDate(endDate.getDate() + durationNum);
                break;
            case 'months':
                endDate.setMonth(endDate.getMonth() + durationNum);
                break;
            case 'years':
                endDate.setFullYear(endDate.getFullYear() + durationNum);
                break;
            default:
                endDate.setDate(endDate.getDate() + durationNum);
        }

        return endDate.toISOString().split('T')[0];
    };

    // Auto-calculate estimated end date when relevant fields change
    useEffect(() => {
        if (formData.autoCalculateEndDate && formData.startingDate && formData.timeDuration) {
            const calculatedDate = calculateEstimatedEndDate(
                formData.startingDate,
                formData.timeDuration,
                formData.durationUnit
            );
            if (calculatedDate && calculatedDate !== formData.estimatedEndingDate) {
                setFormData(prev => ({ ...prev, estimatedEndingDate: calculatedDate }));
            }
        }
    }, [formData.startingDate, formData.timeDuration, formData.durationUnit, formData.autoCalculateEndDate]);

    const resetForm = () => {
        setFormData({
            cropName: '',
            cropType: '',
            acresUsed: '',
            timeDuration: '',
            durationUnit: 'days',
            startingDate: '',
            estimatedEndingDate: '',
            autoCalculateEndDate: true,
            actualEndDate: '',
            cropStatus: 'active'
        });
        setEditingCrop(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cropData = {
            ...formData,
            acresUsed: parseFloat(formData.acresUsed),
            timeDuration: parseInt(formData.timeDuration),
            durationUnit: formData.durationUnit // Explicitly include durationUnit
        };

        if (editingCrop) {
            await updateFarmCrop(editingCrop.id, cropData);
        } else {
            await addFarmCrop(cropData);
        }

        resetForm();
    };

    const handleEdit = (crop) => {
        setEditingCrop(crop);
        setFormData({
            cropName: crop.cropName,
            cropType: crop.cropType,
            acresUsed: crop.acresUsed.toString(),
            timeDuration: crop.timeDuration.toString(),
            durationUnit: crop.durationUnit || 'days',
            startingDate: crop.startingDate,
            estimatedEndingDate: crop.estimatedEndingDate,
            autoCalculateEndDate: crop.autoCalculateEndDate !== undefined ? crop.autoCalculateEndDate : false,
            actualEndDate: crop.actualEndDate || '',
            cropStatus: crop.cropStatus
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this crop?')) {
            await deleteFarmCrop(id);
        }
    };

    const activeCrops = farmCrops?.filter(c => c.cropStatus === 'active') || [];
    const completedCrops = farmCrops?.filter(c => c.cropStatus === 'done') || [];

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
                    <h2 className="text-2xl font-bold text-gray-800">Crops</h2>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Crop
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cropName}
                                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Rice, Wheat, Corn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Type *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cropType}
                                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Cereal, Vegetable, Fruit"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Acres Used *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.acresUsed}
                                    onChange={(e) => setFormData({ ...formData, acresUsed: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., 5.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Duration *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        required
                                        value={formData.timeDuration}
                                        onChange={(e) => setFormData({ ...formData, timeDuration: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., 4"
                                    />
                                    <select
                                        value={formData.durationUnit}
                                        onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                    >
                                        <option value="days">Days</option>
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Starting Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startingDate}
                                    onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Estimated Ending Date *
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.autoCalculateEndDate}
                                            onChange={(e) => setFormData({ ...formData, autoCalculateEndDate: e.target.checked })}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span>Auto-calculate</span>
                                    </label>
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={formData.estimatedEndingDate}
                                    onChange={(e) => setFormData({ ...formData, estimatedEndingDate: e.target.value })}
                                    disabled={formData.autoCalculateEndDate}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${formData.autoCalculateEndDate ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                />
                                {formData.autoCalculateEndDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Automatically calculated based on start date and duration
                                    </p>
                                )}
                            </div>

                            {/* Actual End Date - Only show when status is 'done' */}
                            {formData.cropStatus === 'done' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Actual End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.actualEndDate}
                                        onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        The actual date when the crop was completed
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Status *
                                </label>
                                <select
                                    value={formData.cropStatus}
                                    onChange={(e) => setFormData({ ...formData, cropStatus: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="done">Done</option>
                                </select>
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
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    {editingCrop ? 'Update' : 'Add'} Crop
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Active Crops */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Crops ({activeCrops.length})</h3>
                {activeCrops.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No active crops. Add your first crop to get started!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeCrops.map((crop) => (
                            <div key={crop.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-lg text-gray-800">{crop.cropName}</h4>
                                        <p className="text-sm text-gray-600">{crop.cropType}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(crop)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(crop.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin size={16} />
                                        <span>{crop.acresUsed} acres</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar size={16} />
                                        <span>{crop.timeDuration} {crop.durationUnit || 'days'}</span>
                                    </div>
                                    <div className="col-span-2 text-gray-600">
                                        <span className="font-medium">Start:</span> {new Date(crop.startingDate).toLocaleDateString()}
                                    </div>
                                    <div className="col-span-2 text-gray-600">
                                        <span className="font-medium">Est. End:</span> {new Date(crop.estimatedEndingDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Crops */}
            {completedCrops.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Completed Crops ({completedCrops.length})</h3>
                    <div className="space-y-3">
                        {completedCrops.map((crop) => (
                            <div key={crop.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-75">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-lg text-gray-700">{crop.cropName}</h4>
                                        <p className="text-sm text-gray-600">{crop.cropType}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Completed
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                    <div>{crop.acresUsed} acres</div>
                                    <div>{crop.timeDuration} {crop.durationUnit || 'days'}</div>
                                    {crop.actualEndDate && (
                                        <div className="col-span-2 mt-2 pt-2 border-t border-gray-300">
                                            <span className="font-medium text-gray-700">Completed on:</span>{' '}
                                            {new Date(crop.actualEndDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Crops;
