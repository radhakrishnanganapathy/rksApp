import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Package, Trash2, Edit } from 'lucide-react';

const Stock = () => {
    const { stocks, products, addStock, updateStock, deleteStock } = useData();

    // Filter active products for dropdown
    const activeProducts = products.filter(p => p.active);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);

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

    const handleEditStock = (stock) => {
        setEditingStock(stock);
        setSelectedItem(stock.name);
        setQty(stock.qty);
        setShowAddModal(true);
    };

    const handleUpdateStock = () => {
        if (!selectedItem || !qty) return;
        updateStock('product', editingStock.name, { qty: Number(qty), name: selectedItem });
        setShowAddModal(false);
        setEditingStock(null);
        setSelectedItem('');
        setQty('');
    };

    const handleDeleteStock = (stock) => {
        if (window.confirm(`Are you sure you want to delete ${stock.name} from stock?`)) {
            deleteStock('product', stock.name);
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingStock(null);
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
                    {stocks.products
                        .slice()
                        .sort((a, b) => b.qty - a.qty) // Sort by quantity descending
                        .map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                        <Package size={20} />
                                    </div>
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className={`font-bold ${item.qty < 20 ? 'text-red-600' : 'text-gray-800'}`}>
                                            {item.qty}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">kg</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditStock(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit Stock"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStock(item)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete Stock"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Add/Edit Stock Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">
                            {editingStock ? 'Edit Product Stock' : 'Add Product Stock'}
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <select
                                    value={selectedItem}
                                    onChange={(e) => setSelectedItem(e.target.value)}
                                    className="w-full border rounded p-2"
                                    disabled={!!editingStock}
                                >
                                    <option value="">Select Product</option>
                                    {activeProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
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
                                    onClick={closeModal}
                                    className="flex-1 py-2 border rounded text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingStock ? handleUpdateStock : handleAddStock}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded"
                                >
                                    {editingStock ? 'Update Stock' : 'Add Stock'}
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
