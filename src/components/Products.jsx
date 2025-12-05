import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Edit2, Trash2, ArrowLeft, Package, Search } from 'lucide-react';

const Products = ({ onNavigateBack }) => {
    const { products, addProduct, updateProduct, deleteProduct } = useData();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('kg');

    const resetForm = () => {
        setName('');
        setCategory('');
        setUnit('kg');
        setEditingProduct(null);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setCategory(product.category || '');
        setUnit(product.unit || 'kg');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Product name is required!');
            return;
        }

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, {
                    name: name.trim(),
                    category: category.trim() || null,
                    unit: unit
                });
                alert('Product updated successfully!');
            } else {
                await addProduct({
                    id: Date.now(),
                    name: name.trim(),
                    category: category.trim() || null,
                    unit: unit,
                    active: true
                });
                alert('Product added successfully!');
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            if (error.message.includes('already exists')) {
                alert('A product with this name already exists!');
            } else {
                alert('Failed to save product. Please try again.');
            }
        }
    };

    const handleDelete = async (product) => {
        if (window.confirm(`Are you sure you want to deactivate "${product.name}"?\n\nNote: This will hide it from dropdowns but preserve historical data.`)) {
            try {
                await deleteProduct(product.id);
                alert('Product deactivated successfully!');
            } catch (error) {
                alert('Failed to deactivate product. Please try again.');
            }
        }
    };

    const handleActivate = async (product) => {
        try {
            await updateProduct(product.id, { active: true });
            alert('Product activated successfully!');
        } catch (error) {
            alert('Failed to activate product. Please try again.');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeProducts = filteredProducts.filter(p => p.active);
    const inactiveProducts = filteredProducts.filter(p => !p.active);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Products</h2>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Active Products */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-green-50 border-b border-green-100">
                    <h3 className="font-semibold text-gray-700">Active Products ({activeProducts.length})</h3>
                </div>
                <div className="divide-y">
                    {activeProducts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Package size={48} className="mx-auto mb-2 text-gray-300" />
                            <p>No active products found</p>
                        </div>
                    ) : (
                        activeProducts.map((product) => (
                            <div key={product.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        {product.category && (
                                            <p className="text-xs text-gray-500">{product.category}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {product.unit}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit Product"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            title="Deactivate Product"
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

            {/* Inactive Products */}
            {inactiveProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 bg-gray-100 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-600">Inactive Products ({inactiveProducts.length})</h3>
                    </div>
                    <div className="divide-y">
                        {inactiveProducts.map((product) => (
                            <div key={product.id} className="p-4 flex justify-between items-center bg-gray-50 opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-200 p-2 rounded-full text-gray-500">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-600 line-through">{product.name}</p>
                                        {product.category && (
                                            <p className="text-xs text-gray-400">{product.category}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleActivate(product)}
                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Activate
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Enter product name"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Category (Optional)</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="e.g., Snacks, Sweets"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Unit</label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="L">L</option>
                                    <option value="ml">ml</option>
                                    <option value="pcs">pcs</option>
                                    <option value="box">box</option>
                                </select>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 py-2 border rounded text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingProduct ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
