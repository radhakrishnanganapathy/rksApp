import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Plus, Trash2, Edit2, ArrowLeft, TrendingUp, Calendar, PiggyBank, History, Wallet, Coins } from 'lucide-react';

const HomeSavings = ({ onNavigateBack }) => {
    const {
        homeSavings, addHomeSaving, updateHomeSaving, deleteHomeSaving,
        homeSavingsTransactions, addHomeSavingTransaction, deleteHomeSavingTransaction
    } = useData();

    const [view, setView] = useState('list'); // 'list', 'add', 'detail'
    const [selectedSavingId, setSelectedSavingId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const selectedSaving = homeSavings.find(s => s.id === selectedSavingId);

    // Form State for Saving
    const [name, setName] = useState('');
    const [type, setType] = useState('gold_scheme');
    const [amount, setAmount] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [duration, setDuration] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [description, setDescription] = useState('');

    // New Fields for Gold/Stocks
    const [targetAmount, setTargetAmount] = useState('');
    const [grams, setGrams] = useState(''); // Also used as 'Units' for Stocks
    const [rate, setRate] = useState(''); // Also used as 'Avg Price' for Stocks
    const [symbol, setSymbol] = useState(''); // For Stocks/MF

    // PF Specific State
    const [isWorking, setIsWorking] = useState(true);

    // Form State for Transaction
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [txAmount, setTxAmount] = useState('');
    const [txType, setTxType] = useState('deposit'); // 'deposit', 'withdrawal'
    const [txDesc, setTxDesc] = useState('');

    // Investment Specific Transaction State
    const [txGrams, setTxGrams] = useState(''); // Also used as 'Units'
    const [txRate, setTxRate] = useState(''); // Rate per gram or Price per unit

    // PF Specific Transaction State
    const [employeeShare, setEmployeeShare] = useState('');
    const [employerShare, setEmployerShare] = useState('');

    // Investment Analysis State (Gold & Stocks)
    const [currentMarketRate, setCurrentMarketRate] = useState(0);
    const [isFetchingRate, setIsFetchingRate] = useState(false);

    const fetchMarketRate = async () => {
        if (!selectedSaving) return;

        setIsFetchingRate(true);
        try {
            if (selectedSaving.type.includes('gold')) {
                const response = await fetch('https://data-asg.goldprice.org/dbXRates/INR');
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    const xauPrice = data.items[0].xauPrice;
                    const pricePerGram24k = xauPrice / 31.1035;
                    const pricePerGram22k = pricePerGram24k * 0.916;
                    setCurrentMarketRate(Math.round(pricePerGram22k));
                }
            } else {
                // Placeholder for Stock API - for now just keep manual or 0
                // If we had an API, we'd use selectedSaving.symbol
                console.log("Fetching stock price for", selectedSaving.symbol);
            }
        } catch (error) {
            console.error("Failed to fetch rate:", error);
        } finally {
            setIsFetchingRate(false);
        }
    };

    useEffect(() => {
        if (selectedSaving && (selectedSaving.type.includes('gold') || ['stock', 'mutual_fund', 'sip'].includes(selectedSaving.type))) {
            if (currentMarketRate === 0) fetchMarketRate();
        }
    }, [selectedSavingId]);

    const savingTypes = [
        { id: 'gold_scheme', label: 'Gold Scheme (Monthly)' },
        { id: 'gold_purchase', label: 'Gold Single Buy' },
        { id: 'stock', label: 'Stock / Equity' },
        { id: 'mutual_fund', label: 'Mutual Fund' },
        { id: 'sip', label: 'SIP' },
        { id: 'fd', label: 'Fixed Deposit (FD)' },
        { id: 'rd', label: 'Recurring Deposit (RD)' },
        { id: 'own', label: 'Own Savings' },
        { id: 'insurance', label: 'Insurance' },
        { id: 'pf', label: 'EPF / Provident Fund' },
        { id: 'outstanding', label: 'Outstanding Amount' }
    ];

    const resetForm = () => {
        setName('');
        setType('gold_scheme');
        setAmount('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setDuration('');
        setInterestRate('');
        setDescription('');
        setTargetAmount('');
        setGrams('');
        setRate('');
        setSymbol('');
        setIsWorking(true);
        setEditingId(null);
    };

    const handleSubmit = async () => {
        if (!name) return alert('Please fill Name');

        const isInvestment = ['gold_purchase', 'stock', 'mutual_fund'].includes(type);

        // Validation based on type
        if (isInvestment && (!amount || !grams || !rate)) {
            return alert(`Please fill Amount, ${type.includes('gold') ? 'Grams' : 'Units'} and Rate`);
        }
        if (!isInvestment && type !== 'gold_scheme' && type !== 'sip' && type !== 'pf' && !amount) {
            return alert('Please fill Amount');
        }

        const data = {
            name,
            type,
            amount: (type === 'gold_scheme' || type === 'sip' || type === 'pf') ? 0 : Number(amount),
            start_date: startDate,
            end_date: (type === 'pf' && isWorking) ? null : (endDate || null),
            duration,
            interest_rate: interestRate ? Number(interestRate) : (type === 'pf' ? 8.25 : null),
            description,
            target_amount: targetAmount ? Number(targetAmount) : null,
            grams: grams ? Number(grams) : null,
            rate: rate ? Number(rate) : null,
            symbol: symbol || null
        };

        let newSavingId;
        if (editingId) {
            await updateHomeSaving(editingId, data);
            newSavingId = editingId;
        } else {
            const result = await addHomeSaving(data);
            newSavingId = result?.id; // Assuming addHomeSaving returns the created object
        }

        // If PF and has Opening Balance (amount > 0) and it's a NEW saving
        if (type === 'pf' && !editingId && Number(amount) > 0 && newSavingId) {
            const txData = {
                saving_id: newSavingId,
                date: startDate,
                amount: Number(amount),
                type: 'deposit',
                description: 'Opening Balance',
                employee_share: Number(amount), // Assuming 100% employee share for opening balance or split? Let's just put total in amount.
                employer_share: 0
            };
            await addHomeSavingTransaction(txData);
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
        setTargetAmount(saving.target_amount || '');
        setGrams(saving.grams || '');
        setRate(saving.rate || '');
        setSymbol(saving.symbol || '');
        setIsWorking(!saving.end_date);
        setView('add');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this saving?')) {
            await deleteHomeSaving(id);
            if (selectedSavingId === id) {
                setView('list');
                setSelectedSavingId(null);
            }
        }
    };

    // Auto-calculate Units/Grams or Amount for Investment Form
    useEffect(() => {
        const isInvestment = ['gold_purchase', 'stock', 'mutual_fund'].includes(type);
        if (isInvestment && rate && grams) {
            setAmount((Number(grams) * Number(rate)).toFixed(2));
        }
    }, [grams, rate, type]);

    // Auto-calculate Units/Grams for Transaction
    useEffect(() => {
        const isInvestment = selectedSaving && (selectedSaving.type.includes('gold') || ['stock', 'mutual_fund', 'sip'].includes(selectedSaving.type));
        if (isInvestment && txRate && txAmount) {
            setTxGrams((Number(txAmount) / Number(txRate)).toFixed(3));
        }
    }, [txAmount, txRate, selectedSaving?.type]);

    // Auto-calculate Total Amount for PF Transaction
    useEffect(() => {
        if (selectedSaving?.type === 'pf' && employeeShare && employerShare) {
            setTxAmount((Number(employeeShare) + Number(employerShare)).toFixed(2));
        }
    }, [employeeShare, employerShare, selectedSaving?.type]);

    const handleAddTransaction = async () => {
        if (!txAmount) return alert('Please enter amount');

        const isInvestment = selectedSaving.type.includes('gold') || ['stock', 'mutual_fund', 'sip'].includes(selectedSaving.type);
        const isPF = selectedSaving.type === 'pf';

        const data = {
            saving_id: selectedSaving.id,
            date: txDate,
            amount: Number(txAmount),
            type: txType,
            description: txDesc || (txType === 'deposit' ? 'Deposit' : 'Withdrawal'),
            grams: isInvestment && txGrams ? Number(txGrams) : null,
            rate: isInvestment && txRate ? Number(txRate) : null,
            employee_share: isPF && employeeShare ? Number(employeeShare) : null,
            employer_share: isPF && employerShare ? Number(employerShare) : null
        };

        await addHomeSavingTransaction(data);
        // No need to manually update selectedSaving, context refresh will handle it.

        setTxAmount('');
        setTxDesc('');
        setTxGrams('');
        setTxRate('');
        setEmployeeShare('');
        setEmployerShare('');
        alert('Transaction Recorded');
    };

    const totalSavings = homeSavings.reduce((sum, item) => sum + Number(item.amount), 0);

    // Investment Specific Calculations (Gold, Stocks, MF)
    const getInvestmentStats = () => {
        const isInvestment = selectedSaving && (selectedSaving.type.includes('gold') || ['stock', 'mutual_fund', 'sip'].includes(selectedSaving.type));
        if (!isInvestment) return null;

        const txs = homeSavingsTransactions.filter(t => t.saving_id === selectedSaving.id);

        let totalUnits = txs.reduce((sum, t) => {
            if (t.type === 'deposit') return sum + Number(t.grams || 0);
            if (t.type === 'withdrawal') return sum - Number(t.grams || 0);
            return sum;
        }, 0);

        // Add initial units for Single Buy / Stock Purchase
        if (selectedSaving.grams) {
            totalUnits += Number(selectedSaving.grams);
        }

        const totalInvested = Number(selectedSaving.amount);
        const currentValue = totalUnits * Number(currentMarketRate);
        const totalReturn = currentValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

        return { totalUnits, totalInvested, currentValue, totalReturn, returnPercentage };
    };

    // PF Specific Calculations
    const getPFStats = () => {
        if (selectedSaving?.type !== 'pf') return null;

        const txs = homeSavingsTransactions.filter(t => t.saving_id === selectedSaving.id).sort((a, b) => new Date(a.date) - new Date(b.date));

        // 1. Calculate Actual Stats (Realized)
        const totalContribution = txs.reduce((sum, t) => {
            if (t.type === 'deposit' && !t.description?.toLowerCase().includes('interest')) return sum + Number(t.amount);
            return sum;
        }, 0);

        const currentBalance = Number(selectedSaving.amount);
        const realizedInterest = currentBalance - totalContribution;

        // 2. Calculate Estimated Accrued Interest (Not yet credited)
        let estInterest = 0;
        let runningBalance = 0;
        const rate = (selectedSaving.interest_rate || 8.25) / 100;
        const monthlyRate = rate / 12;

        if (txs.length > 0) {
            const startDate = new Date(selectedSaving.start_date);
            const now = new Date();
            let currentDate = new Date(startDate);

            // Map transactions to months for easier lookup
            const txMap = {};
            txs.forEach(t => {
                const d = new Date(t.date);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                txMap[key] = (txMap[key] || 0) + (t.type === 'deposit' ? Number(t.amount) : -Number(t.amount));
            });

            while (currentDate < now) {
                const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

                // Add transactions for this month to balance (assuming end of month calculation)
                if (txMap[key]) {
                    runningBalance += txMap[key];
                }

                // Calculate interest for this month on the balance
                // EPF calculates interest on the opening balance of the month usually, but for simplicity we use running balance
                const monthlyInt = runningBalance * monthlyRate;
                estInterest += monthlyInt;

                // Move to next month
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }

        return { totalContribution, currentBalance, realizedInterest, estInterest };
    };

    const handleCreditInterest = async (amount) => {
        if (!amount || amount <= 0) return;
        if (!window.confirm(`Credit estimated interest of ₹${formatCurrency(amount)} to balance?`)) return;

        const data = {
            saving_id: selectedSaving.id,
            date: new Date().toISOString().split('T')[0],
            amount: Number(amount).toFixed(2),
            type: 'deposit',
            description: 'Interest Credit (Auto)',
            employee_share: 0,
            employer_share: 0
        };

        await addHomeSavingTransaction(data);
        alert('Interest Credited Successfully!');
    };

    const investmentStats = getInvestmentStats();
    const pfStats = getPFStats();
    const isInvestmentType = selectedSaving && (selectedSaving.type.includes('gold') || ['stock', 'mutual_fund', 'sip'].includes(selectedSaving.type));

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
                        {homeSavings.map(saving => {
                            const isGold = saving.type.includes('gold');
                            const isStock = ['stock', 'mutual_fund', 'sip'].includes(saving.type);
                            const isPF = saving.type === 'pf';

                            return (
                                <div
                                    key={saving.id}
                                    onClick={() => { setSelectedSavingId(saving.id); setView('detail'); }}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isGold ? 'bg-yellow-100 text-yellow-600' :
                                                isStock ? 'bg-blue-100 text-blue-600' :
                                                    isPF ? 'bg-purple-100 text-purple-600' :
                                                        'bg-green-100 text-green-600'
                                                }`}>
                                                {isGold ? <Coins size={20} /> :
                                                    isStock ? <TrendingUp size={20} /> :
                                                        isPF ? <Wallet size={20} /> :
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
                            )
                        })}
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
                        <label className="block text-sm text-gray-600 mb-1">{type === 'pf' ? 'Company Name' : 'Name'}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded p-2" placeholder={type === 'pf' ? "e.g. TCS, Infosys" : "e.g. Reliance, HDFC MF"} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded p-2">
                            {savingTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Conditional Fields based on Type */}

                    {/* Gold Scheme Fields */}
                    {type === 'gold_scheme' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Duration (Months)</label>
                                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 11" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Target Amount (Optional)</label>
                                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 100000" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Investment Fields (Gold Buy, Stock, MF) */}
                    {['gold_purchase', 'stock', 'mutual_fund'].includes(type) && (
                        <>
                            {type !== 'gold_purchase' && (
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Symbol / Script Name</label>
                                    <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. RELIANCE" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Buying Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">{type.includes('gold') ? 'Rate (per gram)' : 'Avg Price'}</label>
                                    <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 1500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">{type.includes('gold') ? 'Total Grams' : 'Total Units'}</label>
                                    <input type="number" value={grams} onChange={e => setGrams(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 10" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Total Amount</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded p-2" placeholder="Auto-calculated" readOnly={true} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* SIP Fields */}
                    {type === 'sip' && (
                        <>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Fund Name / Symbol</label>
                                <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. SBI Bluechip" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Target Amount (Optional)</label>
                                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* PF Fields */}
                    {type === 'pf' && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="isWorking"
                                    checked={isWorking}
                                    onChange={(e) => setIsWorking(e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded"
                                />
                                <label htmlFor="isWorking" className="text-sm text-gray-700">Currently Working Here?</label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                                {!isWorking && (
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">End Date</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded p-2" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Opening Balance (Optional)</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 50000" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Interest Rate (%)</label>
                                <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="w-full border rounded p-2" placeholder="8.25" />
                            </div>
                        </>
                    )}

                    {/* Standard Fields for other types */}
                    {!['gold_scheme', 'gold_purchase', 'stock', 'mutual_fund', 'sip', 'pf'].includes(type) && (
                        <>
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
                        </>
                    )}

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
                    <div className={`bg-gradient-to-br ${isInvestmentType ? (selectedSaving.type.includes('gold') ? 'from-yellow-500 to-yellow-700' : 'from-blue-600 to-blue-800') : selectedSaving.type === 'pf' ? 'from-purple-700 to-purple-900' : 'from-teal-700 to-teal-900'} text-white p-5 rounded-xl shadow-lg`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`${isInvestmentType ? 'text-white/80' : 'text-teal-200'} text-xs uppercase tracking-wider`}>
                                    {['gold_purchase', 'stock', 'mutual_fund'].includes(selectedSaving.type) ? 'Initial Investment' : selectedSaving.type === 'pf' ? 'Total Saving (Balance)' : 'Total Invested'}
                                </p>
                                <h2 className="text-3xl font-bold mt-1">{formatCurrency(selectedSaving.amount)}</h2>
                            </div>
                            <div className="text-right">
                                <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                                    {savingTypes.find(t => t.id === selectedSaving.type)?.label || selectedSaving.type}
                                </span>
                                {selectedSaving.symbol && <p className="text-xs mt-1 font-bold">{selectedSaving.symbol}</p>}
                            </div>
                        </div>

                        {/* Investment Specific Stats */}
                        {isInvestmentType && investmentStats && (
                            <div className="mt-6 pt-4 border-t border-white/20">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <p className="text-white/80 text-xs mb-1">{selectedSaving.type.includes('gold') ? 'Total Gold' : 'Total Units'}</p>
                                        <p className="text-xl font-bold text-white">
                                            {investmentStats.totalUnits.toFixed(3)} {selectedSaving.type.includes('gold') ? 'g' : ''}
                                        </p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <p className="text-white/80 text-xs mb-1">Current Value</p>
                                        <p className="text-xl font-bold text-white">{formatCurrency(investmentStats.currentValue)}</p>
                                    </div>
                                </div>

                                {/* Rate & Return Row */}
                                <div className="bg-black/20 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-white/80">
                                                {selectedSaving.type.includes('gold') ? "Today's Rate (22k)" : "Current Market Price"}
                                            </span>
                                            <button
                                                onClick={fetchMarketRate}
                                                className={`text-white/80 hover:text-white ${isFetchingRate ? 'animate-spin' : ''}`}
                                                title="Refresh Rate"
                                            >
                                                <History size={12} />
                                            </button>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold">₹</span>
                                            <input
                                                type="number"
                                                value={currentMarketRate}
                                                onChange={(e) => setCurrentMarketRate(e.target.value)}
                                                className="w-24 bg-transparent border-none p-0 text-lg font-bold text-white placeholder-white/50 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-white/80 mb-1">Total Return</p>
                                        <p className={`font-bold text-lg ${investmentStats.totalReturn >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                            {investmentStats.totalReturn >= 0 ? '+' : ''}{formatCurrency(investmentStats.totalReturn)}
                                        </p>
                                        <p className={`text-xs ${investmentStats.totalReturn >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                            ({investmentStats.returnPercentage.toFixed(2)}%)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PF Specific Stats */}
                        {selectedSaving.type === 'pf' && pfStats && (
                            <div className="mt-6 pt-4 border-t border-white/20">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <p className="text-white/80 text-xs mb-1">Total Contribution</p>
                                        <p className="text-xl font-bold text-white">{formatCurrency(pfStats.totalContribution)}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <p className="text-white/80 text-xs mb-1">Interest Earned (Realized)</p>
                                        <p className="text-xl font-bold text-green-300">+{formatCurrency(pfStats.realizedInterest)}</p>
                                    </div>
                                </div>

                                {/* Estimated Interest Section */}
                                <div className="bg-black/20 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-white/80 mb-1">Est. Accrued Interest</p>
                                        <p className="text-lg font-bold text-yellow-300">{formatCurrency(pfStats.estInterest)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCreditInterest(pfStats.estInterest)}
                                        className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-2 rounded-lg font-medium"
                                    >
                                        Credit Interest
                                    </button>
                                </div>

                                <div className="text-center mt-2">
                                    <p className="text-xs text-white/60">Interest Rate: {selectedSaving.interest_rate}%</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-white/60 text-xs">Start Date</p>
                                <p className="font-medium">{new Date(selectedSaving.start_date).toLocaleDateString()}</p>
                            </div>
                            {selectedSaving.end_date && (
                                <div>
                                    <p className="text-white/60 text-xs">End Date</p>
                                    <p className="font-medium">{new Date(selectedSaving.end_date).toLocaleDateString()}</p>
                                </div>
                            )}
                            {selectedSaving.duration && (
                                <div>
                                    <p className="text-white/60 text-xs">Duration</p>
                                    <p className="font-medium">{selectedSaving.duration} {selectedSaving.type === 'gold_scheme' ? 'Months' : ''}</p>
                                </div>
                            )}
                            {selectedSaving.target_amount && (
                                <div>
                                    <p className="text-white/60 text-xs">Target Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedSaving.target_amount)}</p>
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

                            {/* Gold Specific Inputs */}
                            {selectedSaving.type.includes('gold') && (
                                <div className="grid grid-cols-2 gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Gold Rate / Gram</label>
                                        <input
                                            type="number"
                                            value={txRate}
                                            onChange={e => setTxRate(e.target.value)}
                                            className="border rounded p-2 text-sm w-full"
                                            placeholder="e.g. 6500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Grams Bought</label>
                                        <input
                                            type="number"
                                            value={txGrams}
                                            onChange={e => setTxGrams(e.target.value)}
                                            className="border rounded p-2 text-sm w-full"
                                            placeholder="e.g. 1.5"
                                        />
                                    </div>
                                </div>
                            )}

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
                                            {selectedSaving.type.includes('gold') && tx.grams && (
                                                <p className="text-xs text-yellow-600 font-medium mt-0.5">
                                                    {tx.grams}g @ {formatCurrency(tx.rate || 0)}/g
                                                </p>
                                            )}
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
