import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Plus, Trash2, Edit2, ArrowLeft, TrendingUp, Calendar, PiggyBank, History, Wallet } from 'lucide-react';

const HomeSavings = ({ onNavigateBack }) => {
    const {
        homeSavings, addHomeSaving, updateHomeSaving, deleteHomeSaving,
        homeSavingsTransactions, addHomeSavingTransaction, deleteHomeSavingTransaction
    } = useData();

    const [view, setView] = useState('list'); // 'list', 'add', 'detail'
    const [selectedSaving, setSelectedSaving] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Form State for Saving
    const [name, setName] = useState('');
    const [type, setType] = useState('fd');
    const [amount, setAmount] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [duration, setDuration] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [description, setDescription] = useState('');

    // Form State for Transaction
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [txAmount, setTxAmount] = useState('');
    const [txType, setTxType] = useState('deposit'); // 'deposit', 'withdrawal'
    const [txDesc, setTxDesc] = useState('');

    const savingTypes = [
        { id: 'gold', label: 'Gold' },
        { id: 'fd', label: 'Fixed Deposit (FD)' },
        { id: 'rd', label: 'Recurring Deposit (RD)' },
        { id: 'own', label: 'Own Savings' },
        { id: 'stock', label: 'Stocks' },
        { id: 'sip', label: 'SIP' },
        { id: 'mutual_fund', label: 'Mutual Fund' },
        { id: 'insurance', label: 'Insurance' },
        { id: 'pf', label: 'Provident Fund (PF)' },
        { id: 'outstanding', label: 'Outstanding Amount' }
    ];

    const resetForm = () => {
        setName('');
        setType('fd');
        setAmount('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setDuration('');
        setInterestRate('');
        setDescription('');
        setEditingId(null);
    };

    const handleSubmit = async () => {
        if (!name || !amount) return alert('Please fill Name and Amount');

        const data = {
            name,
            type,
            amount: Number(amount), // Initial Amount
            start_date: startDate,
            end_date: endDate || null,
            duration,
            interest_rate: interestRate ? Number(interestRate) : null,
            description
        };

        if (editingId) {
            await updateHomeSaving(editingId, data);
        } else {
            await addHomeSaving(data);
        }

        resetForm();
        setView('list');
    };

    const handleEdit = (saving) => {
        setEditingId(saving.id);
        setName(saving.name);
        setType(saving.type);
        setAmount(saving.amount);
        setStartDate(saving.start_date ? saving.start_date.split('T')[0] : '');
        setEndDate(saving.end_date ? saving.end_date.split('T')[0] : '');
        setDuration(saving.duration || '');
        setInterestRate(saving.interest_rate || '');
        setDescription(saving.description || '');
        setView('add');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this saving?')) {
            await deleteHomeSaving(id);
            if (selectedSaving?.id === id) setView('list');
        }
    };

    const handleAddTransaction = async () => {
        if (!txAmount) return alert('Please enter amount');

        const data = {
            saving_id: selectedSaving.id,
            date: txDate,
            amount: Number(txAmount),
            type: txType,
            description: txDesc || (txType === 'deposit' ? 'Deposit' : 'Withdrawal')
        };

        await addHomeSavingTransaction(data);

        // Update local selectedSaving balance for immediate UI feedback
        const newBalance = txType === 'deposit'
            ? Number(selectedSaving.amount) + Number(txAmount)
            : Number(selectedSaving.amount) - Number(txAmount);

        setSelectedSaving(prev => ({ ...prev, amount: newBalance }));

        setTxAmount('');
        setTxDesc('');
        alert('Transaction Recorded');
    };

    const totalSavings = homeSavings.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => view === 'list' ? onNavigateBack() : setView('list')} className="p-1 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">
                        {view === 'list' ? 'Savings & Investments' : view === 'add' ? (editingId ? 'Edit Saving' : 'Add New Saving') : selectedSaving?.name}
                    </h2>
                </div>
                {view === 'list' && (
                    <button
                        onClick={() => { resetForm(); setView('add'); }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Saving
                    </button>
                )}
                {view === 'detail' && (
                    <button
                        onClick={() => handleEdit(selectedSaving)}
                        className="text-blue-600 p-2 rounded-full hover:bg-blue-50"
                    >
                        <Edit2 size={20} />
                    </button>
                )}
            </div>

            {/* View: List */}
            {view === 'list' && (
                <div className="space-y-4">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-5 rounded-xl shadow-lg mb-6">
                        <p className="text-green-100 text-sm font-medium">Total Portfolio Value</p>
                        <h2 className="text-3xl font-bold mt-1">{formatCurrency(totalSavings)}</h2>
                    </div>

                    <div className="grid gap-4">
                        {homeSavings.map(saving => (
                            <div
                                key={saving.id}
                                onClick={() => { setSelectedSaving(saving); setView('detail'); }}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative cursor-pointer hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${saving.type === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                                                saving.type === 'stock' || saving.type === 'mutual_fund' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-green-100 text-green-600'
                                            }`}>
                                            {saving.type === 'gold' ? <TrendingUp size={20} /> :
                                                saving.type === 'stock' ? <TrendingUp size={20} /> :
                                                    <PiggyBank size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{saving.name}</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                {savingTypes.find(t => t.id === saving.type)?.label || saving.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-gray-800">{formatCurrency(saving.amount)}</p>
                                        {saving.interest_rate && (
                                            <p className="text-xs text-green-600 font-medium">{saving.interest_rate}% Return</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {homeSavings.length === 0 && (
                            <p className="text-center text-gray-500 mt-10">No savings records found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* View: Add/Edit */}
            {view === 'add' && (
                <div className="bg-white p-5 rounded-lg shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Saving Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. HDFC FD" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded p-2">
                            {savingTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Current Value / Initial Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded p-2" placeholder="0.00" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">End Date (Optional)</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Duration</label>
                            <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 5 Years" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Interest / Return %</label>
                            <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 7.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Description / Notes</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded p-2" rows="3" placeholder="Additional details..." />
                    </div>

                    <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold mt-4">
                        {editingId ? 'Update Saving' : 'Save Saving'}
                    </button>
                    <button onClick={() => { resetForm(); setView('list'); }} className="w-full text-gray-500 py-3 text-sm font-medium">
                        Cancel
                    </button>
                </div>
            )}

            {/* View: Detail */}
            {view === 'detail' && selectedSaving && (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white p-5 rounded-xl shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-teal-200 text-xs uppercase tracking-wider">Current Value</p>
                                <h2 className="text-3xl font-bold mt-1">{formatCurrency(selectedSaving.amount)}</h2>
                            </div>
                            <div className="text-right">
                                <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                                    {savingTypes.find(t => t.id === selectedSaving.type)?.label}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-teal-200 text-xs">Start Date</p>
                                <p className="font-medium">{new Date(selectedSaving.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-teal-200 text-xs">Interest Rate</p>
                                <p className="font-medium">{selectedSaving.interest_rate ? `${selectedSaving.interest_rate}%` : 'N/A'}</p>
                            </div>
                            {selectedSaving.end_date && (
                                <div>
                                    <p className="text-teal-200 text-xs">Maturity Date</p>
                                    <p className="font-medium">{new Date(selectedSaving.end_date).toLocaleDateString()}</p>
                                </div>
                            )}
                            {selectedSaving.duration && (
                                <div>
                                    <p className="text-teal-200 text-xs">Duration</p>
                                    <p className="font-medium">{selectedSaving.duration}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Transaction */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Wallet size={18} className="text-green-600" /> Add Transaction
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => setTxType('deposit')}
                                    className={`flex-1 py-1.5 text-sm rounded-md font-medium ${txType === 'deposit' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                                >
                                    Deposit (+)
                                </button>
                                <button
                                    onClick={() => setTxType('withdrawal')}
                                    className={`flex-1 py-1.5 text-sm rounded-md font-medium ${txType === 'withdrawal' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                                >
                                    Withdrawal (-)
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="border rounded p-2 text-sm" />
                                <input
                                    type="number"
                                    value={txAmount}
                                    onChange={e => setTxAmount(e.target.value)}
                                    className="border rounded p-2 text-sm"
                                    placeholder="Amount"
                                />
                            </div>
                            <input
                                type="text"
                                value={txDesc}
                                onChange={e => setTxDesc(e.target.value)}
                                className="border rounded p-2 text-sm w-full"
                                placeholder="Description (Optional)"
                            />
                            <button onClick={handleAddTransaction} className={`w-full text-white py-2 rounded font-medium text-sm ${txType === 'deposit' ? 'bg-green-600' : 'bg-red-600'}`}>
                                {txType === 'deposit' ? 'Add Deposit' : 'Record Withdrawal'}
                            </button>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2">
                            <History size={16} /> Transaction History
                        </div>
                        <div className="divide-y">
                            {homeSavingsTransactions
                                .filter(t => t.saving_id === selectedSaving.id)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map(tx => (
                                    <div key={tx.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{new Date(tx.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">{tx.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                                                {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this transaction?')) {
                                                        deleteHomeSavingTransaction(tx.id);
                                                        // Update local state for immediate feedback
                                                        const change = tx.type === 'deposit' ? -Number(tx.amount) : Number(tx.amount);
                                                        setSelectedSaving(prev => ({ ...prev, amount: Number(prev.amount) + change }));
                                                    }
                                                }}
                                                className="text-xs text-red-400 hover:text-red-600 mt-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                            {homeSavingsTransactions.filter(t => t.saving_id === selectedSaving.id).length === 0 && (
                                <p className="p-4 text-center text-gray-500 text-sm">No transactions yet.</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => handleDelete(selectedSaving.id)}
                        className="w-full text-red-500 py-3 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50"
                    >
                        Delete Saving Scheme
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomeSavings;
