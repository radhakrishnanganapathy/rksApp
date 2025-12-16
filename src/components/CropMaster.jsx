import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useData } from '../context/DataContext';

const CropMaster = ({ onNavigateBack }) => {
    const { cropTypes, addCropType, updateCropType, deleteCropType } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        duration: '',
        durationUnit: 'months',
        cultivationPattern: 'single',
        measurementUnit: 'kg',
        harvestType: 'single',
        description: ''
    });

    const categories = [
        'Grain Crops',
        'Cash Crops',
        'Vegetables',
        'Flowers',
        'Fruits',
        'Pulses',
        'Oilseeds',
        'Spices',
        'Other'
    ];

    const cultivationPatterns = [
        { value: 'single', label: 'Single Cultivation' },
        { value: 'daily', label: 'Daily Harvest' },
        { value: 'monthly', label: 'Monthly Harvest' },
        { value: 'frequently', label: 'Frequent Harvest' },
        { value: 'yearly', label: 'Yearly Harvest' }
    ];

    const measurementUnits = [
        'kg',
        'ton',
        'quintal',
        'count',
        'bunch',
        'dozen',
        'piece'
    ];

    const harvestTypes = [
        { value: 'single', label: 'Single Harvest' },
        { value: 'multiple', label: 'Multiple Harvest' },
        { value: 'continuous', label: 'Continuous Harvest' }
    ];

    const durationUnits = [
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
        { value: 'years', label: 'Years' }
    ];

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            duration: '',
            durationUnit: 'months',
            cultivationPattern: 'single',
            measurementUnit: 'kg',
            harvestType: 'single',
            description: ''
        });
        setEditingCrop(null);
        setShowForm(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCrop) {
            // Update existing crop type
            updateCropType(editingCrop.id, formData);
            alert('Crop type updated successfully!');
        } else {
            // Add new crop type
            addCropType(formData);
            alert('Crop type added successfully!');
        }

        resetForm();
    };

    const handleEdit = (crop) => {
        setEditingCrop(crop);
        setFormData({
            name: crop.name,
            category: crop.category,
            duration: crop.duration,
            durationUnit: crop.durationUnit,
            cultivationPattern: crop.cultivationPattern,
            measurementUnit: crop.measurementUnit,
            harvestType: crop.harvestType,
            description: crop.description || ''
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this crop type?')) {
            deleteCropType(id);
            alert('Crop type deleted successfully!');
        }
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
                    <h2 className="text-2xl font-bold text-gray-800">Crop Master List</h2>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Crop Type
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">About Crop Master List</h3>
                <p className="text-sm text-blue-800">
                    Define different crop types with their characteristics like duration, cultivation pattern,
                    and measurement units. This master list will be used when creating crops and tracking income.
                </p>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingCrop ? 'Edit' : 'Add'} Crop Type
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Crop Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Type Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Paddy, Sugarcane, Banana, Tomato"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Duration */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., 3, 12, 18"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration Unit *
                                    </label>
                                    <select
                                        required
                                        value={formData.durationUnit}
                                        onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        {durationUnits.map(unit => (
                                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Cultivation Pattern */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cultivation Pattern *
                                </label>
                                <select
                                    required
                                    value={formData.cultivationPattern}
                                    onChange={(e) => setFormData({ ...formData, cultivationPattern: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {cultivationPatterns.map(pattern => (
                                        <option key={pattern.value} value={pattern.value}>{pattern.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Harvest Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Harvest Type *
                                </label>
                                <select
                                    required
                                    value={formData.harvestType}
                                    onChange={(e) => setFormData({ ...formData, harvestType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {harvestTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Measurement Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Measurement Unit *
                                </label>
                                <select
                                    required
                                    value={formData.measurementUnit}
                                    onChange={(e) => setFormData({ ...formData, measurementUnit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {measurementUnits.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Additional notes about this crop type..."
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
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={16} />
                                    {editingCrop ? 'Update' : 'Add'} Crop Type
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Crop Types List */}
            {cropTypes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">No crop types defined yet.</p>
                    <p className="text-sm mt-1">Add your first crop type to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {cropTypes.map((crop) => (
                        <div key={crop.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{crop.name}</h3>
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-1">
                                        {crop.category}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(crop)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(crop.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium">{crop.duration} {crop.durationUnit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cultivation:</span>
                                    <span className="font-medium capitalize">
                                        {cultivationPatterns.find(p => p.value === crop.cultivationPattern)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Harvest Type:</span>
                                    <span className="font-medium capitalize">
                                        {harvestTypes.find(h => h.value === crop.harvestType)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Measurement:</span>
                                    <span className="font-medium">{crop.measurementUnit}</span>
                                </div>
                                {crop.description && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-gray-600 text-xs italic">{crop.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CropMaster;
