import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Package } from 'lucide-react';

const Stock = () => {
    const { stocks, items, addStock } = useData();
    const [showAddModal, setShowAddModal] = useState(false);

    // Add Stock Form State
    const [selectedItem, setSelectedItem] = useState('');
    const [qty, setQty] = useState('');

    const handleAddStock = () => {
        if (!selectedItem || !qty) return;
        addStock('products', selectedItem, qty);
        setShowAddModal(false);
        setSelectedItem('');
        setQty('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Product Inventory</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
                >
                    <Plus size={16} /> Add Stock
                </button>
            </div>

            {/* Stock List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y">
                    {stocks.products.map((item, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                    <Package size={20} />
                                </div>
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <span className={`font-bold ${item.qty < 20 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {item.qty}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">kg</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Stock Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add Product Stock</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <select
                                    value={selectedItem}
                                    onChange={(e) => setSelectedItem(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="">Select Product</option>
                                    {items.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity (kg)</label>
                                <input
                                    type="number"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Enter quantity in kg"
                                />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 border rounded text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddStock}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded"
                                >
                                    Add Stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stock;
