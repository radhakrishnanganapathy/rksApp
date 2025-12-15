import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const PreviousMonthStock = ({ onNavigateBack }) => {
    const { products, rawMaterialPrices } = useData();
    const activeProducts = products.filter(p => p.active);

    const [stockType, setStockType] = useState('items'); // 'items' or 'raw-materials'
    const [itemStocks, setItemStocks] = useState([]);
    const [rawMaterialStocks, setRawMaterialStocks] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const currentDate = new Date();
    const [formData, setFormData] = useState({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        itemName: '',
        materialName: '',
        quantity: '',
        unit: 'kg'
    });

    // Fetch data on mount and when stock type changes
    useEffect(() => {
        fetchData();
    }, [stockType]);

    const fetchData = async () => {
        try {
            if (stockType === 'items') {
                const response = await fetch('http://localhost:5000/api/previous-month-stock/items');
                const data = await response.json();
                setItemStocks(data);
            } else {
                const response = await fetch('http://localhost:5000/api/previous-month-stock/raw-materials');
                const data = await response.json();
                setRawMaterialStocks(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data');
        }
    };

    const handleSubmit = async () => {
        if (stockType === 'items' && !formData.itemName) {
            alert('Please select an item');
            return;
        }
        if (stockType === 'raw-materials' && !formData.materialName) {
            alert('Please select a raw material');
            return;
        }
        if (!formData.quantity || Number(formData.quantity) <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        try {
            const endpoint = stockType === 'items'
                ? 'http://localhost:5000/api/previous-month-stock/items'
                : 'http://localhost:5000/api/previous-month-stock/raw-materials';

            const payload = {
                id: editingId || Date.now(),
                month: Number(formData.month),
                year: Number(formData.year),
                [stockType === 'items' ? 'itemName' : 'materialName']:
                    stockType === 'items' ? formData.itemName : formData.materialName,
                quantity: Number(formData.quantity),
                unit: formData.unit
            };

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${endpoint}/${editingId}` : endpoint;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(editingId ? 'Stock updated successfully!' : 'Stock added successfully!');
                resetForm();
                fetchData();
            } else {
                alert('Failed to save stock');
            }
        } catch (error) {
            console.error('Error saving stock:', error);
            alert('Failed to save stock');
        }
    };

    const handleEdit = (stock) => {
        setEditingId(stock.id);
        setFormData({
            month: stock.month,
            year: stock.year,
            itemName: stock.itemName || '',
            materialName: stock.materialName || '',
            quantity: stock.quantity,
            unit: stock.unit
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;

        try {
            const endpoint = stockType === 'items'
                ? `http://localhost:5000/api/previous-month-stock/items/${id}`
                : `http://localhost:5000/api/previous-month-stock/raw-materials/${id}`;

            const response = await fetch(endpoint, { method: 'DELETE' });

            if (response.ok) {
                alert('Stock deleted successfully!');
                fetchData();
            } else {
                alert('Failed to delete stock');
            }
        } catch (error) {
            console.error('Error deleting stock:', error);
            alert('Failed to delete stock');
        }
    };

    const resetForm = () => {
        const currentDate = new Date();
        setFormData({
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            itemName: '',
            materialName: '',
            quantity: '',
            unit: 'kg'
        });
        setEditingId(null);
        setShowAddModal(false);
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    const currentData = stockType === 'items' ? itemStocks : rawMaterialStocks;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Previous Month Stock</h2>
            </div>

            {/* Stock Type Selector */}
            <div className="bg-white p-3 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Type</label>
                <select
                    value={stockType}
                    onChange={(e) => setStockType(e.target.value)}
                    className="w-full border rounded p-2"
                >
                    <option value="items">Stock of Items</option>
                    <option value="raw-materials">Stock of Raw Materials</option>
                </select>
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
            >
                <Plus size={20} />
                Add {stockType === 'items' ? 'Item' : 'Raw Material'} Stock
            </button>

            {/* Stock List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                    <h3 className="font-semibold text-gray-700">
                        {stockType === 'items' ? 'Item Stock Records' : 'Raw Material Stock Records'} ({currentData.length})
                    </h3>
                </div>
                <div className="divide-y">
                    {currentData.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No records found. Add your first stock entry!
                        </div>
                    ) : (
                        currentData.map((stock) => (
                            <div key={stock.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">
                                            {stock.itemName || stock.materialName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {getMonthName(stock.month)} {stock.year}
                                        </p>
                                        <p className="text-lg font-bold text-primary-600 mt-1">
                                            {Number(stock.quantity).toFixed(2)} {stock.unit}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(stock)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(stock.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                {editingId ? 'Edit' : 'Add'} {stockType === 'items' ? 'Item' : 'Raw Material'} Stock
                            </h3>
                            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Month & Year */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Month</label>
                                    <select
                                        value={formData.month}
                                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                        className="w-full border rounded p-2"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {getMonthName(i + 1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Year</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="2023">2023</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                            </div>

                            {/* Item/Material Name */}
                            {stockType === 'items' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Item Name *</label>
                                    <select
                                        value={formData.itemName}
                                        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Select Item</option>
                                        {activeProducts.map((product) => (
                                            <option key={product.id} value={product.name}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Raw Material Name *</label>
                                    <select
                                        value={formData.materialName}
                                        onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Select Raw Material</option>
                                        {rawMaterialPrices.map((material) => (
                                            <option key={material.id} value={material.name}>
                                                {material.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full border rounded p-2"
                                    placeholder="Enter quantity"
                                />
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Unit</label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="L">L</option>
                                    <option value="ml">ml</option>
                                    <option value="units">units</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 py-2 border rounded text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviousMonthStock;
