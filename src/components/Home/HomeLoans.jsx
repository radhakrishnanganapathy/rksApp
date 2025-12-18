import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Plus, Trash2, Save, ArrowLeft, Edit2, X, ChevronRight, History, Wallet } from 'lucide-react';

const HomeLoans = ({ onNavigateBack }) => {
    const { homeLoans, addHomeLoan, updateHomeLoan, deleteHomeLoan, homeLoanTransactions, addHomeLoanTransaction, deleteHomeLoanTransaction } = useData();

    const [view, setView] = useState('list'); // 'list', 'add', 'detail'
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Form State for New Loan
    const [name, setName] = useState('');
    const [loanType, setLoanType] = useState('emi'); // 'emi', 'interest', 'gold'
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // New Fields
    const [accountNumber, setAccountNumber] = useState('');
    const [emiAmount, setEmiAmount] = useState('');
    const [dueDate, setDueDate] = useState(''); // Day of month
    const [closingDate, setClosingDate] = useState('');
    const [tenureMonths, setTenureMonths] = useState('');
    const [endDate, setEndDate] = useState('');

    // Form State for Payment
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [payAmount, setPayAmount] = useState('');
    const [payInterest, setPayInterest] = useState('');
    const [payPrincipal, setPayPrincipal] = useState(''); // Explicit Principal Repay
    const [payDesc, setPayDesc] = useState('');

    // Auto-calculate End Date
    useEffect(() => {
        if (startDate && tenureMonths) {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + Number(tenureMonths));
            setEndDate(d.toISOString().split('T')[0]);
        }
    }, [startDate, tenureMonths]);

    const resetForm = () => {
        setName('');
        setLoanType('emi');
        setPrincipal('');
        setRate('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setAccountNumber('');
        setEmiAmount('');
        setDueDate('');
        setClosingDate('');
        setTenureMonths('');
        setEndDate('');
        setEditingId(null);
    };

    const handleSubmitLoan = async () => {
        if (!name || !principal || !rate) return alert('Please fill all fields');

        const data = {
            name,
            loan_type: loanType,
            principal_amount: Number(principal),
            current_balance: editingId ? selectedLoan.current_balance : Number(principal), // Keep balance if editing, else init
            interest_rate: Number(rate),
            start_date: startDate,
            status: 'active',
            account_number: accountNumber,
            emi_amount: emiAmount ? Number(emiAmount) : 0,
            due_date: dueDate ? Number(dueDate) : null,
            closing_date: closingDate || null,
            tenure_months: tenureMonths ? Number(tenureMonths) : null,
            end_date: endDate || null
        };

        if (editingId) {
            await updateHomeLoan(editingId, { ...selectedLoan, ...data });
        } else {
            await addHomeLoan(data);
        }

        resetForm();
        setView('list');
    };

    const handleEditLoan = (loan) => {
        setEditingId(loan.id);
        setName(loan.name);
        setLoanType(loan.loan_type);
        setPrincipal(loan.principal_amount);
        setRate(loan.interest_rate);
        setStartDate(loan.start_date.split('T')[0]);
        setAccountNumber(loan.account_number || '');
        setEmiAmount(loan.emi_amount || '');
        setDueDate(loan.due_date || '');
        setClosingDate(loan.closing_date ? loan.closing_date.split('T')[0] : '');
        setTenureMonths(loan.tenure_months || '');
        setEndDate(loan.end_date ? loan.end_date.split('T')[0] : '');

        setSelectedLoan(loan); // Keep reference
        setView('add');
    };

    const handleDeleteLoan = async (id) => {
        if (window.confirm('Are you sure? This will delete all transaction history too.')) {
            await deleteHomeLoan(id);
            if (selectedLoan?.id === id) setView('list');
        }
    };

    // Calculate Interest Helper
    const calculateMonthlyInterest = (balance, rate) => {
        // Rate is in "paisa" (1 paisa = 1%)
        return (balance * rate) / 100;
    };

    const handleAddInterest = async () => {
        if (!payInterest) return alert('Please enter interest amount to add');

        const interestAmount = Number(payInterest);

        const txData = {
            loan_id: selectedLoan.id,
            date: payDate,
            amount: interestAmount,
            type: 'interest_charge',
            description: payDesc || 'Interest Added',
            interest_component: 0
        };

        await addHomeLoanTransaction(txData);

        // Increase Balance
        const newBalance = Number(selectedLoan.current_balance) + interestAmount;
        await updateHomeLoan(selectedLoan.id, {
            ...selectedLoan,
            current_balance: newBalance
        });
        setSelectedLoan(prev => ({ ...prev, current_balance: newBalance }));

        setPayInterest('');
        setPayDesc('');
        alert('Interest Added to Balance');
    };

    const handleAddPayment = async () => {
        if (!payAmount) return alert('Please enter amount');

        let interestPart = 0;
        let principalPart = 0;

        if (payPrincipal && payInterest) {
            principalPart = Number(payPrincipal);
            interestPart = Number(payInterest);
        } else if (payPrincipal) {
            principalPart = Number(payPrincipal);
            interestPart = Number(payAmount) - principalPart;
        } else if (payInterest) {
            interestPart = Number(payInterest);
            principalPart = Number(payAmount) - interestPart;
        } else {
            const calculatedInterest = calculateMonthlyInterest(selectedLoan.current_balance, selectedLoan.interest_rate);
            if (Number(payAmount) >= calculatedInterest) {
                interestPart = calculatedInterest;
                principalPart = Number(payAmount) - calculatedInterest;
            } else {
                interestPart = Number(payAmount);
                principalPart = 0;
            }
        }

        const txData = {
            loan_id: selectedLoan.id,
            date: payDate,
            amount: Number(payAmount),
            type: 'payment',
            description: payDesc || 'Payment',
            interest_component: interestPart
        };

        await addHomeLoanTransaction(txData);

        // Reduce Balance by PRINCIPAL Repay Amount ONLY
        const newBalance = Number(selectedLoan.current_balance) - principalPart;

        await updateHomeLoan(selectedLoan.id, {
            ...selectedLoan,
            current_balance: newBalance
        });
        setSelectedLoan(prev => ({ ...prev, current_balance: newBalance }));

        setPayAmount('');
        setPayInterest('');
        setPayPrincipal('');
        setPayDesc('');
        alert(`Payment Recorded. Balance Reduced by ${formatCurrency(principalPart)}`);
    };

    const handleMarkPaidThisMonth = async (loan) => {
        if (!window.confirm(`Mark ${loan.name} as PAID for this month? Amount: ${formatCurrency(loan.emi_amount)}`)) return;

        const interestPart = (Number(loan.current_balance) * Number(loan.interest_rate)) / 100;
        const principalPart = Number(loan.emi_amount) - interestPart;

        const txData = {
            loan_id: loan.id,
            date: new Date().toISOString().split('T')[0],
            amount: Number(loan.emi_amount),
            type: 'emi_payment',
            description: `EMI Payment - ${new Date().toLocaleString('default', { month: 'short' })}`,
            interest_component: interestPart
        };

        await addHomeLoanTransaction(txData);

        // Update Balance
        const newBalance = Number(loan.current_balance) - Number(loan.emi_amount); // Reduce by total EMI amount
        await updateHomeLoan(loan.id, {
            ...loan,
            current_balance: newBalance
        });
    };

    const activeLoans = homeLoans.filter(l => l.status === 'active');

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => view === 'list' ? onNavigateBack() : setView('list')} className="p-1 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">
                        {view === 'list' ? 'Loans & EMI' : view === 'add' ? (editingId ? 'Edit Loan' : 'Add New Loan') : selectedLoan?.name}
                    </h2>
                </div>
                {view === 'list' && (
                    <button
                        onClick={() => { resetForm(); setView('add'); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Loan
                    </button>
                )}
                {view === 'detail' && (
                    <button
                        onClick={() => handleEditLoan(selectedLoan)}
                        className="text-blue-600 p-2 rounded-full hover:bg-blue-50"
                    >
                        <Edit2 size={20} />
                    </button>
                )}
            </div>

            {/* View: List */}
            {view === 'list' && (
                <div className="space-y-4">
                    {activeLoans.map(loan => {
                        const monthlyInterest = calculateMonthlyInterest(loan.current_balance, loan.interest_rate);

                        // Calculate Totals
                        // Interest Paid = Sum of interest_component in transactions
                        const interestPaid = homeLoanTransactions
                            .filter(t => t.loan_id === loan.id && (t.type === 'payment' || t.type === 'emi_payment'))
                            .reduce((sum, t) => sum + Number(t.interest_component || 0), 0);

                        // Principal Paid = Total Paid - Interest Paid
                        const totalPaid = homeLoanTransactions
                            .filter(t => t.loan_id === loan.id && (t.type === 'payment' || t.type === 'emi_payment'))
                            .reduce((sum, t) => sum + Number(t.amount), 0);

                        const principalPaid = totalPaid - interestPaid;

                        // Check if paid this month
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        const isPaidThisMonth = homeLoanTransactions.some(t =>
                            t.loan_id === loan.id &&
                            (t.type === 'emi_payment' || t.type === 'payment') &&
                            new Date(t.date).getMonth() === currentMonth &&
                            new Date(t.date).getFullYear() === currentYear
                        );

                        return (
                            <div
                                key={loan.id}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-start mb-2" onClick={() => { setSelectedLoan(loan); setView('detail'); }}>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{loan.name}</h3>
                                        <p className="text-xs text-gray-500">{loan.account_number}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${loan.loan_type === 'emi' ? 'bg-purple-100 text-purple-700' :
                                            loan.loan_type === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {loan.loan_type === 'emi' ? 'Bank EMI' : loan.loan_type === 'gold' ? 'Gold Loan' : 'Interest Only'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Balance</p>
                                        <p className="font-bold text-red-600 text-lg">{formatCurrency(loan.current_balance)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-50" onClick={() => { setSelectedLoan(loan); setView('detail'); }}>
                                    <div>
                                        <p className="text-xs text-gray-500">Monthly EMI</p>
                                        <p className="font-medium">{formatCurrency(loan.emi_amount)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Interest Paid</p>
                                        <p className="font-medium text-orange-600">{formatCurrency(interestPaid)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Principal Paid</p>
                                        <p className="font-medium text-green-600">{formatCurrency(principalPaid)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Monthly Int.</p>
                                        <p className="font-medium">{formatCurrency(monthlyInterest)}</p>
                                    </div>
                                </div>

                                {/* EMI Status Checkbox */}
                                {loan.loan_type === 'emi' && (
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Paid This Month?</span>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isPaidThisMonth}
                                                onChange={() => !isPaidThisMonth && handleMarkPaidThisMonth(loan)}
                                                disabled={isPaidThisMonth}
                                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                            />
                                            <span className={`ml-2 text-sm ${isPaidThisMonth ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                                {isPaidThisMonth ? 'Paid' : 'Not Paid'}
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {activeLoans.length === 0 && (
                        <p className="text-center text-gray-500 mt-10">No active loans found.</p>
                    )}
                </div>
            )}

            {/* View: Add/Edit Loan */}
            {view === 'add' && (
                <div className="bg-white p-5 rounded-lg shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Loan Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. HDFC Personal Loan" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Account Number (Optional)</label>
                        <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full border rounded p-2" placeholder="Loan Account #" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Loan Type</label>
                        <select value={loanType} onChange={e => setLoanType(e.target.value)} className="w-full border rounded p-2">
                            <option value="emi">Bank Loan (EMI)</option>
                            <option value="interest">Individual (Interest Only)</option>
                            <option value="gold">Gold Loan</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Principal Amount</label>
                            <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full border rounded p-2" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Interest Rate (Paisa)</label>
                            <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 1.5" />
                        </div>
                    </div>

                    {loanType === 'emi' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">EMI Amount</label>
                                    <input type="number" value={emiAmount} onChange={e => setEmiAmount(e.target.value)} className="w-full border rounded p-2" placeholder="Monthly EMI" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Due Date (Day)</label>
                                    <input type="number" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 5" min="1" max="31" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Tenure (Months)</label>
                                    <input type="number" value={tenureMonths} onChange={e => setTenureMonths(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 60" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded p-2 bg-gray-50" readOnly />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Closing Date (Optional)</label>
                            <input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                    </div>

                    <button onClick={handleSubmitLoan} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4">
                        {editingId ? 'Update Loan' : 'Save Loan'}
                    </button>
                    {editingId && (
                        <button onClick={() => { resetForm(); setView('detail'); }} className="w-full text-gray-500 py-3 text-sm font-medium">
                            Cancel
                        </button>
                    )}
                </div>
            )}

            {/* View: Detail */}
            {view === 'detail' && selectedLoan && (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 rounded-xl shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider">Outstanding Balance</p>
                                <h2 className="text-3xl font-bold mt-1">{formatCurrency(selectedLoan.current_balance)}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-xs uppercase tracking-wider">Interest Paid</p>
                                <p className="text-2xl font-bold mt-1 text-yellow-400">
                                    {(() => {
                                        const interestPaid = homeLoanTransactions
                                            .filter(t => t.loan_id == selectedLoan.id && (t.type === 'payment' || t.type === 'emi_payment'))
                                            .reduce((sum, t) => sum + Number(t.interest_component || 0), 0);
                                        return formatCurrency(interestPaid);
                                    })()}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <p className="text-gray-400 text-xs">Principal Amount</p>
                                <p className="font-medium">{formatCurrency(selectedLoan.principal_amount)}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-gray-400 text-xs">Due</p>
                                <p className="font-medium text-yellow-200">
                                    {formatCurrency(calculateMonthlyInterest(selectedLoan.current_balance, selectedLoan.interest_rate))}
                                </p>
                            </div>

                            {selectedLoan.loan_type === 'emi' && (
                                <>
                                    <div className="flex flex-col">
                                        <p className="text-gray-400 text-xs">EMI Amount</p>
                                        <p className="font-medium">{formatCurrency(selectedLoan.emi_amount)}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-gray-400 text-xs">Due Date</p>
                                        <p className="font-medium">{selectedLoan.due_date ? `${selectedLoan.due_date}th of month` : 'N/A'}</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-gray-400 text-xs">Tenure (Paid/Total)</p>
                                        <p className="font-medium">
                                            {(() => {
                                                const paidMonths = homeLoanTransactions.filter(t => t.loan_id == selectedLoan.id && (t.type === 'payment' || t.type === 'emi_payment')).length;
                                                return `${paidMonths} Paid / ${selectedLoan.tenure_months || '-'} Total`;
                                            })()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-gray-400 text-xs">End Date</p>
                                        <p className="font-medium">{selectedLoan.end_date ? new Date(selectedLoan.end_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Add Payment Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Wallet size={18} className="text-green-600" /> Record Payment
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="border rounded p-2 text-sm" />
                                <input
                                    type="number"
                                    value={payAmount}
                                    onChange={e => {
                                        setPayAmount(e.target.value);
                                        // Auto-calculate interest if not set or if user wants auto-calc
                                        const amt = Number(e.target.value);
                                        const estInt = calculateMonthlyInterest(selectedLoan.current_balance, selectedLoan.interest_rate);

                                        // Logic: Always suggest split, user can edit
                                        if (amt > 0) {
                                            if (amt >= estInt) {
                                                setPayInterest(estInt.toFixed(2));
                                                setPayPrincipal((amt - estInt).toFixed(2));
                                            } else {
                                                setPayInterest(amt.toFixed(2));
                                                setPayPrincipal(0);
                                            }
                                        } else {
                                            setPayInterest('');
                                            setPayPrincipal('');
                                        }
                                    }}
                                    className="border rounded p-2 text-sm"
                                    placeholder="Total Paid"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Principal Repay (Opt)</label>
                                    <input
                                        type="number"
                                        value={payPrincipal}
                                        onChange={e => setPayPrincipal(e.target.value)}
                                        className="border rounded p-2 text-sm w-full"
                                        placeholder="Principal Part"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Interest Pay (Opt)</label>
                                    <input
                                        type="number"
                                        value={payInterest}
                                        onChange={e => setPayInterest(e.target.value)}
                                        className="border rounded p-2 text-sm w-full"
                                        placeholder="Interest Part"
                                    />
                                </div>
                            </div>
                            <input
                                type="text"
                                value={payDesc}
                                onChange={e => setPayDesc(e.target.value)}
                                className="border rounded p-2 text-sm w-full"
                                placeholder="Note (Optional)"
                            />
                            <button onClick={handleAddPayment} className="w-full bg-green-600 text-white py-3 rounded font-medium text-sm">
                                Record Payment
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                Balance will reduce by: <span className="font-bold text-gray-700">{formatCurrency(Number(payPrincipal) || 0)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Transactions History */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2">
                            <History size={16} /> Transaction History
                        </div>
                        <div className="divide-y">
                            {homeLoanTransactions
                                .filter(t => t.loan_id == selectedLoan.id)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map(tx => (
                                    <div key={tx.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{new Date(tx.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">{tx.description}</p>
                                            {tx.interest_component > 0 && <p className="text-[10px] text-orange-500">Int: {formatCurrency(tx.interest_component)}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.type === 'interest_charge' ? 'text-red-600' : 'text-green-600'}`}>
                                                {tx.type === 'interest_charge' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </p>
                                            <button
                                                onClick={() => deleteHomeLoanTransaction(tx.id)}
                                                className="text-xs text-red-400 hover:text-red-600 mt-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                            {homeLoanTransactions.filter(t => t.loan_id == selectedLoan.id).length === 0 && (
                                <p className="p-4 text-center text-gray-500 text-sm">No transactions yet.</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => handleDeleteLoan(selectedLoan.id)}
                        className="w-full text-red-500 py-3 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50"
                    >
                        Delete Loan
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomeLoans;
