import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Save, List, PlusCircle, Factory, Trash2, Edit } from 'lucide-react';
import { filterByMonthYear } from '../utils';

const Production = () => {
    const { items, production, addProduction, updateProduction, deleteProduction } = useData();
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'list'
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [item, setItem] = useState('');
    const [qty, setQty] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Filter states for list view
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleSubmit = () => {
        if (!item || !qty) return;

        if (editingId) {
            updateProduction(editingId, { date, item, qty });
            alert('Production Updated!');
            setEditingId(null);
        } else {
            addProduction({ date, item, qty });
            alert('Production Added!');
        }

        setItem('');
        setQty('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const handleEdit = (prod) => {
        setEditingId(prod.id);
        setDate(prod.date);
        setItem(prod.item);
        setQty(prod.qty);
        setActiveTab('add');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this production record?')) {
            deleteProduction(id);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setItem('');
        setQty('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    // Filtered production for list view
    const filteredProduction = useMemo(() =>
        filterByMonthYear(production, selectedMonth, selectedYear),
        [production, selectedMonth, selectedYear]
    );

    // Calculate total production
    const totalProduction = filteredProduction.reduce((sum, prod) => sum + Number(prod.qty), 0);

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Factory size={24} />
                Production
            </h2>

            {/* View Mode Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 ${activeTab === 'add' ? 'bg-white shadow text-purple-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('add')}
                >
                    <PlusCircle size={16} /> {editingId ? 'Edit Production' : 'Add Production'}
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 ${activeTab === 'list' ? 'bg-white shadow text-purple-600' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab('list')}
                >
                    <List size={16} /> Production List
                </button>
            </div>

            {/* Add/Edit Production Tab */}
            {activeTab === 'add' && (
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700">
                        {editingId ? 'Edit Production Record' : 'Add Production Record'}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Item</label>
                        <select
                            value={item}
                            onChange={(e) => setItem(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Select Item</option>
                            {items.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity Produced (kg)</label>
                        <input
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="Enter quantity in kg"
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-purple-600 text-white py-2 rounded flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> {editingId ? 'Update Production' : 'Save Production'}
                    </button>
                    {editingId && (
                        <button
                            onClick={cancelEdit}
                            className="w-full bg-gray-200 text-gray-700 py-2 rounded"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            )}

            {/* Production List Tab */}
            {activeTab === 'list' && (
                <>
                    {/* Filter Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Total Card */}
                    <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-100">
                        <div className="text-xs font-semibold uppercase text-purple-700 mb-1">Total Production</div>
                        <p className="text-2xl font-bold text-gray-800">{totalProduction.toFixed(2)} kg</p>
                        <p className="text-xs text-gray-600 mt-1">{filteredProduction.length} records</p>
                    </div>

                    {/* Production List */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">Production Records</h3>
                        </div>
                        <div className="divide-y max-h-96 overflow-y-auto">
                            {filteredProduction.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No production records found for this period
                                </div>
                            ) : (
                                filteredProduction.map((prod) => (
                                    <div key={prod.id} className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{prod.item}</p>
                                                <p className="text-xs text-gray-500">{prod.date}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-bold text-purple-600">{Number(prod.qty).toFixed(2)} kg</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(prod)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Edit Production"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(prod.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete Production"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Production;
