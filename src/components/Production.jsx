import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Save, Package, Trash2, Edit2, ArrowLeft, X } from 'lucide-react';
import { filterByMonthYear } from '../utils';

const Production = ({ onNavigateBack }) => {
    const { production, addProduction, updateProduction, deleteProduction, stocks } = useData();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [item, setItem] = useState('');
    const [qty, setQty] = useState('');
    const [unit, setUnit] = useState('kg');
    const [batchNumber, setBatchNumber] = useState('');
    const [packedQty, setPackedQty] = useState(''); // New state for packed quantity
    const [id, setId] = useState(null);

    const [activeTab, setActiveTab] = useState('list'); // 'add' | 'list'

    // --- Filters ---
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const resetForm = () => {
        setId(null);
        setDate(new Date().toISOString().split('T')[0]);
        setItem('');
        setQty('');
        setUnit('kg');
        setBatchNumber('');
        setPackedQty('');
    };

    const handleSave = async () => {
        if (!item || !qty) return alert('Item and Quantity are required');

        const productionData = {
            date,
            item,
            qty: Number(qty),
            unit,
            batchNumber,
            packedQty: packedQty ? Number(packedQty) : 0
        };

        try {
            if (id) {
                await updateProduction(productionData);
                alert('Production Updated!');
            } else {
                await addProduction(productionData);
                alert('Production Added!');
            }
            resetForm();
            setActiveTab('list'); // Switch to list view after save
        } catch (error) {
            console.error("Failed to save production:", error);
            alert("Failed to save production. Please try again.");
        }
    };

    const handleEdit = (prod) => {
        setId(prod.id);
        setDate(prod.date);
        setItem(prod.item);
        setQty(prod.qty);
        setUnit(prod.unit);
        setBatchNumber(prod.batchNumber || '');
        setPackedQty(prod.packedQty || '');
        setActiveTab('add'); // Switch to add tab for editing
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record? Stock will be reverted.')) {
            await deleteProduction(id);
        }
    };

    const filteredProduction = useMemo(() => filterByMonthYear(production, selectedMonth, selectedYear), [production, selectedMonth, selectedYear]);

    const totalProduction = filteredProduction.reduce((sum, p) => sum + Number(p.qty), 0);
    const totalPacked = filteredProduction.reduce((sum, p) => sum + Number(p.packedQty || 0), 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package size={24} />
                    Production Management
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg text-sm">
                <button
                    className={`flex-1 py-2 px-4 font-medium rounded-md transition-colors ${activeTab === 'add' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('add')}
                >
                    {id ? 'Edit Production' : 'Record Production'}
                </button>
                <button
                    className={`flex-1 py-2 px-4 font-medium rounded-md transition-colors ${activeTab === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('list')}
                >
                    Production List
                </button>
            </div>

            {/* Form Tab */}
            {activeTab === 'add' && (
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">{id ? 'Edit Production' : 'Record Production'}</h3>
                        {id && <button onClick={() => { resetForm(); setActiveTab('list'); }} className="text-xs text-gray-500 flex items-center gap-1"><X size={14} /> Cancel</button>}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Item</label>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="e.g. Paneer"
                                list="product-suggestions"
                            />
                            <datalist id="product-suggestions">
                                {stocks.products.map((p, i) => <option key={i} value={p.name} />)}
                            </datalist>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Raw Quantity</label>
                                <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border rounded p-2" placeholder="Qty" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Unit</label>
                                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border rounded p-2">
                                    <option value="kg">kg</option>
                                    <option value="lt">lt</option>
                                    <option value="count">count</option>
                                    <option value="box">box</option>
                                </select>
                            </div>
                        </div>

                        {/* New Packed Quantity Field */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Packed Quantity (kg)</label>
                                <input
                                    type="number"
                                    value={packedQty}
                                    onChange={(e) => setPackedQty(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="After packing"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Batch Number</label>
                                <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full border rounded p-2" placeholder="Optional" />
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Save size={20} /> {id ? 'Update Production' : 'Save Record'}
                    </button>
                </div>
            )}

            {/* List Tab */}
            {activeTab === 'list' && (
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Production History</h3>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Total Raw / Packed</p>
                            <p className="font-bold text-blue-600">
                                {totalProduction.toFixed(1)} / <span className="text-green-600">{totalPacked.toFixed(1)}</span> kg
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border rounded p-1 text-sm flex-1">
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border rounded p-1 text-sm flex-1">
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Item</th>
                                    <th className="px-3 py-2 text-right">Raw Qty</th>
                                    <th className="px-3 py-2 text-right">Packed (kg)</th>
                                    <th className="px-3 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredProduction.length === 0 ? (
                                    <tr><td colSpan="5" className="px-3 py-4 text-center text-gray-500">No records found</td></tr>
                                ) : (
                                    filteredProduction.map((prod) => (
                                        <tr key={prod.id}>
                                            <td className="px-3 py-2">{new Date(prod.date).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 font-medium">
                                                {prod.item}
                                                {prod.batchNumber && <span className="block text-[10px] text-gray-400">Batch: {prod.batchNumber}</span>}
                                            </td>
                                            <td className="px-3 py-2 text-right">{prod.qty} {prod.unit}</td>
                                            <td className="px-3 py-2 text-right font-medium text-green-600">{prod.packedQty ? Number(prod.packedQty).toFixed(2) : '-'}</td>
                                            <td className="px-3 py-2 text-center flex justify-center gap-2">
                                                <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:text-blue-800"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(prod.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Production;
