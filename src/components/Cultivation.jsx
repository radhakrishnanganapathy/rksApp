import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';

const Cultivation = ({ onNavigateBack }) => {
    const { farmCrops, addFarmCrop, updateFarmCrop, deleteFarmCrop, cropTypes } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);

    const [formData, setFormData] = useState({
        cropName: '',
        cropType: '',
        batchNumber: '', // Auto-generated batch number
        acresUsed: '',
        totalQuantity: '', // Total quantity cultivated
        quantityUnit: 'kg', // Unit for quantity
        timeDuration: '',
        durationUnit: 'days', // days, months, years
        startingDate: '',
        estimatedEndingDate: '',
        autoCalculateEndDate: true, // Toggle for auto-calculation
        actualEndDate: '', // Actual completion date
        cropStatus: 'active'
    });

    // Generate batch number for cultivation
    const generateBatchNumber = (cropName) => {
        if (!cropName) return '';

        const year = new Date().getFullYear();
        const cropPrefix = cropName.toUpperCase().replace(/\s+/g, '-');

        // Find existing batches for this crop in current year
        const existingBatches = farmCrops?.filter(crop => {
            const batchYear = crop.batchNumber?.split('-')[1];
            const batchCrop = crop.batchNumber?.split('-')[0];
            return batchCrop === cropPrefix && batchYear === year.toString();
        }) || [];

        const sequenceNumber = (existingBatches.length + 1).toString().padStart(2, '0');
        return `${cropPrefix}-${year}-${sequenceNumber}`;
    };

    // Handle crop type selection
    const handleCropTypeSelection = (cropTypeName) => {
        const selectedCropType = cropTypes.find(ct => ct.name === cropTypeName);
        if (selectedCropType) {
            const batchNum = generateBatchNumber(selectedCropType.name);
            setFormData(prev => ({
                ...prev,
                cropName: selectedCropType.name,
                cropType: selectedCropType.category,
                batchNumber: batchNum,
                timeDuration: selectedCropType.duration.toString(),
                durationUnit: selectedCropType.durationUnit
            }));
        } else if (cropTypeName && cropTypeName !== 'Other') {
            // If custom crop name entered
            const batchNum = generateBatchNumber(cropTypeName);
            setFormData(prev => ({
                ...prev,
                cropName: cropTypeName,
                batchNumber: batchNum,
                cropType: '',
                timeDuration: '',
                durationUnit: 'months'
            }));
        } else {
            // If "Other" selected, clear batch number until name is entered
            setFormData(prev => ({
                ...prev,
                cropName: cropTypeName,
                batchNumber: '',
                cropType: '',
                timeDuration: '',
                durationUnit: 'months'
            }));
        }
    };

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
            batchNumber: '',
            acresUsed: '',
            totalQuantity: '',
            quantityUnit: 'kg',
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
            totalQuantity: formData.totalQuantity ? parseFloat(formData.totalQuantity) : null,
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
            batchNumber: crop.batchNumber || generateBatchNumber(crop.cropName),
            acresUsed: crop.acresUsed.toString(),
            totalQuantity: crop.totalQuantity ? crop.totalQuantity.toString() : '',
            quantityUnit: crop.quantityUnit || 'kg',
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
                    <h2 className="text-2xl font-bold text-gray-800">Cultivation</h2>
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
                            {/* Warning if no crop types defined */}
                            {cropTypes.length === 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-yellow-800 font-medium mb-2">
                                        ⚠️ No crop types defined in Crop Master List
                                    </p>
                                    <p className="text-xs text-yellow-700 mb-2">
                                        Please add crop types in the Crop Master List first for better management.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            // Navigate to crop master - you'll need to pass this function from parent
                                            window.location.hash = '#crop-master';
                                        }}
                                        className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                                    >
                                        Go to Crop Master List
                                    </button>
                                </div>
                            )}

                            {/* Crop Name - Dropdown from Crop Master or Manual Entry */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Name *
                                </label>
                                {cropTypes.length > 0 ? (
                                    <>
                                        <select
                                            required
                                            value={formData.cropName}
                                            onChange={(e) => handleCropTypeSelection(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Select Crop Type</option>
                                            {cropTypes.map(ct => (
                                                <option key={ct.id} value={ct.name}>{ct.name}</option>
                                            ))}
                                            <option value="Other">Other (Custom)</option>
                                        </select>
                                        {formData.cropName === 'Other' && (
                                            <input
                                                type="text"
                                                required
                                                value={formData.cropName === 'Other' ? '' : formData.cropName}
                                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mt-2"
                                                placeholder="Enter custom crop name"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        required
                                        value={formData.cropName}
                                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., Paddy, Wheat, Sugarcane"
                                    />
                                )}
                            </div>

                            {/* Crop Type/Category - Auto-populated but editable */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Category *
                                    {cropTypes.length > 0 && (
                                        <span className="text-xs text-gray-500 ml-2">(Auto-filled, editable)</span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cropType}
                                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Grain Crops, Vegetables, Fruits"
                                />
                            </div>

                            {/* Batch Number - Auto-generated, read-only */}
                            {formData.batchNumber && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Batch Number
                                        <span className="text-xs text-gray-500 ml-2">(Auto-generated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.batchNumber}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono"
                                    />
                                </div>
                            )}

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

                            {/* Total Quantity Cultivated */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Quantity Cultivated (Optional)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.totalQuantity}
                                        onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., 1000"
                                    />
                                    <select
                                        value={formData.quantityUnit}
                                        onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="ton">ton</option>
                                        <option value="quintal">quintal</option>
                                        <option value="count">count</option>
                                        <option value="bunch">bunch</option>
                                        <option value="dozen">dozen</option>
                                        <option value="piece">piece</option>
                                    </select>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Expected total harvest quantity for this cultivation
                                </p>
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
                                    className={`w - full px - 3 py - 2 border border - gray - 300 rounded - lg focus: ring - 2 focus: ring - green - 500 focus: border - transparent ${formData.autoCalculateEndDate ? 'bg-gray-100 cursor-not-allowed' : ''
                                        } `}
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
                                        {crop.batchNumber && (
                                            <p className="text-xs text-gray-500 font-mono mb-1">Batch: {crop.batchNumber}</p>
                                        )}
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
                                    {crop.totalQuantity && (
                                        <div className="col-span-2 text-gray-600 bg-green-50 p-2 rounded">
                                            <span className="font-medium">Total Quantity:</span> {crop.totalQuantity} {crop.quantityUnit}
                                        </div>
                                    )}
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

export default Cultivation;
