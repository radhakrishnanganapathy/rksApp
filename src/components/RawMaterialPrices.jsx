import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Edit2, Trash2, Search, ArrowLeft, Save, X } from 'lucide-react';
import { formatCurrency } from '../utils';

const RawMaterialPrices = ({ onNavigateBack }) => {
    const { rawMaterialPrices, addRawMaterialPrice, updateRawMaterialPrice, deleteRawMaterialPrice } = useData();

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('kg');
    const [pricePerUnit, setPricePerUnit] = useState('');

    const resetForm = () => {
        setName('');
        setUnit('kg');
        setPricePerUnit('');
        setEditingItem(null);
        setShowModal(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setName(item.name);
        setUnit(item.unit);
        setPricePerUnit(item.pricePerUnit);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this price item?')) {
            try {
                await deleteRawMaterialPrice(id);
            } catch (error) {
                alert('Failed to delete item');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !pricePerUnit) {
            alert('Please fill all required fields');
            return;
        }

        const data = {
            name,
            unit,
            pricePerUnit: Number(pricePerUnit)
        };

        try {
            if (editingItem) {
                await updateRawMaterialPrice(editingItem.id, data);
            } else {
                await addRawMaterialPrice({ ...data, id: Date.now() });
            }
            resetForm();
        } catch (error) {
            alert('Failed to save item');
        }
    };

    const filteredItems = rawMaterialPrices.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onNavigateBack} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Raw Material Prices</h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Price</span>
                </button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-20">
                <div className="grid gap-3">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium uppercase">
                                        {item.unit}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        {formatCurrency(item.pricePerUnit)} / {item.unit}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No price items found. Add one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl transform transition-all">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingItem ? 'Edit Price' : 'Add New Price'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Sugar"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="lt">lt</option>
                                        <option value="count">count</option>
                                        <option value="rs">rs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price / Unit</label>
                                    <input
                                        type="number"
                                        value={pricePerUnit}
                                        onChange={(e) => setPricePerUnit(e.target.value)}
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="0.00"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                                >
                                    <Save size={20} />
                                    {editingItem ? 'Update Price' : 'Save Price'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RawMaterialPrices;
