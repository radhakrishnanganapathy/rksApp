import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';

const FarmExpenseCategories = ({ onNavigateBack }) => {
    const {
        farmExpenseCategories,
        addFarmExpenseCategory,
        updateFarmExpenseCategory,
        deleteFarmExpenseCategory,
        addFarmExpenseSubcategory,
        updateFarmExpenseSubcategory,
        deleteFarmExpenseSubcategory
    } = useData();

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [categoryName, setCategoryName] = useState('');
    const [subcategoryName, setSubcategoryName] = useState('');

    const categories = farmExpenseCategories || [];

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (editingCategory) {
            await updateFarmExpenseCategory(editingCategory.id, { name: categoryName });
        } else {
            await addFarmExpenseCategory({ name: categoryName });
        }
        setCategoryName('');
        setEditingCategory(null);
        setShowCategoryForm(false);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setShowCategoryForm(true);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure? This will delete all subcategories under this category.')) {
            await deleteFarmExpenseCategory(id);
        }
    };

    const handleAddSubcategory = async (e) => {
        e.preventDefault();
        if (editingSubcategory) {
            await updateFarmExpenseSubcategory(editingSubcategory.id, {
                name: subcategoryName,
                categoryId: selectedCategoryId
            });
        } else {
            await addFarmExpenseSubcategory({
                name: subcategoryName,
                categoryId: selectedCategoryId
            });
        }
        setSubcategoryName('');
        setEditingSubcategory(null);
        setShowSubcategoryForm(false);
        setSelectedCategoryId(null);
    };

    const handleEditSubcategory = (subcategory, categoryId) => {
        setEditingSubcategory(subcategory);
        setSubcategoryName(subcategory.name);
        setSelectedCategoryId(categoryId);
        setShowSubcategoryForm(true);
    };

    const handleDeleteSubcategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this subcategory?')) {
            await deleteFarmExpenseSubcategory(id);
        }
    };

    const openSubcategoryForm = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setShowSubcategoryForm(true);
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
                    <h2 className="text-2xl font-bold text-gray-800">Expense Categories</h2>
                </div>
                <button
                    onClick={() => setShowCategoryForm(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* Category Form Modal */}
            {showCategoryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Tillage, Seeds, Workers"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryForm(false);
                                        setEditingCategory(null);
                                        setCategoryName('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {editingCategory ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Subcategory Form Modal */}
            {showSubcategoryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                        </h3>
                        <form onSubmit={handleAddSubcategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Category *
                                </label>
                                <select
                                    required
                                    value={selectedCategoryId || ''}
                                    onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={subcategoryName}
                                    onChange={(e) => setSubcategoryName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Cow, Tractor"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSubcategoryForm(false);
                                        setEditingSubcategory(null);
                                        setSubcategoryName('');
                                        setSelectedCategoryId(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {editingSubcategory ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories List */}
            {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No categories yet. Add your first category to get started!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {categories.map((category) => {
                        const isExpanded = expandedCategories[category.id];
                        const subcategories = category.subcategories || [];

                        return (
                            <div key={category.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-4 bg-gray-50">
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="flex items-center gap-2 flex-1 text-left"
                                    >
                                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        <span className="font-semibold text-gray-800">{category.name}</span>
                                        <span className="text-sm text-gray-500">({subcategories.length})</span>
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openSubcategoryForm(category.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Add Subcategory"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEditCategory(category)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-4 pt-2">
                                        {subcategories.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No subcategories</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {subcategories.map((subcat) => (
                                                    <div
                                                        key={subcat.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                    >
                                                        <span className="text-gray-700">{subcat.name}</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditSubcategory(subcat, category.id)}
                                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubcategory(subcat.id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FarmExpenseCategories;
