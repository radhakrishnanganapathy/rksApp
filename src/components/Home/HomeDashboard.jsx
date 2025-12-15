import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Wallet, TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react';

const HomeDashboard = () => {
    const { homeIncome, homeExpenses, homeLoans = [], sales = [], expenses = [], farmIncome = [], farmExpenses = [] } = useData();

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    // Loan Calculations (Lifetime - not filtered by month)
    const activeLoans = homeLoans.filter(l => l.status === 'active');
    const totalLoanPending = activeLoans.reduce((sum, l) => sum + Number(l.current_balance), 0);
    const totalPrincipal = activeLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);

    const loanTypes = [
        { type: 'emi', label: 'EMI', color: 'bg-purple-600', bg: 'bg-gray-200' },
        { type: 'gold', label: 'Gold', color: 'bg-yellow-500', bg: 'bg-gray-200' },
        { type: 'interest', label: 'Interest', color: 'bg-blue-600', bg: 'bg-gray-200' }
    ];

    const loanStats = loanTypes.map(t => {
        const loans = activeLoans.filter(l => l.loan_type === t.type);
        const principal = loans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
        const pending = loans.reduce((sum, l) => sum + Number(l.current_balance), 0);
        const paid = principal - pending;
        const widthPercent = totalPrincipal > 0 ? (principal / totalPrincipal) * 100 : 0;
        const paidPercent = principal > 0 ? (paid / principal) * 100 : 0;

        return { ...t, principal, pending, paid, widthPercent, paidPercent };
    });

    // Monthly Overall Summary Calculations
    const getMonthlyTotal = (data, amountField = 'amount') => {
        return data
            .filter(item => {
                const d = new Date(item.date);
                return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
            })
            .reduce((sum, item) => sum + Number(item[amountField] || 0), 0);
    };

    const monthlyStats = {
        home: {
            exp: getMonthlyTotal(homeExpenses),
            inc: getMonthlyTotal(homeIncome)
        },
        snacks: {
            exp: getMonthlyTotal(expenses),
            inc: getMonthlyTotal(sales, 'total') // Sales uses 'total'
        },
        farm: {
            exp: getMonthlyTotal(farmExpenses),
            inc: getMonthlyTotal(farmIncome)
        }
    };

    // Calculate Total Monthly Balance (All Income - All Expenses)
    const totalMonthlyIncome = monthlyStats.home.inc + monthlyStats.snacks.inc + monthlyStats.farm.inc;
    const totalMonthlyExpenses = monthlyStats.home.exp + monthlyStats.snacks.exp + monthlyStats.farm.exp;
    const monthlyBalance = totalMonthlyIncome - totalMonthlyExpenses;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Wallet size={24} className="text-purple-600" />
                    Home Finance
                </h2>
            </div>

            {/* Overall Monthly Summary (Box Style) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-semibold text-gray-700 text-sm">Overview</h3>

                    {/* Month/Year Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-gray-700"
                        >
                            <Calendar size={14} />
                            {months[selectedMonth]} {selectedYear}
                            <ChevronDown size={14} />
                        </button>

                        {showDatePicker && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-3 z-50 w-48">
                                <div className="space-y-2">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="w-full text-sm border rounded p-1"
                                    >
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <div className="grid grid-cols-2 gap-1">
                                        {months.map((m, idx) => (
                                            <button
                                                key={m}
                                                onClick={() => { setSelectedMonth(idx); setShowDatePicker(false); }}
                                                className={`text-xs p-1 rounded ${selectedMonth === idx ? 'bg-purple-100 text-purple-700 font-bold' : 'hover:bg-gray-50'}`}
                                            >
                                                {m.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Balance Card (Moved Top) */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                    <p className="text-purple-100 text-sm font-medium mb-1">Net Balance ({months[selectedMonth]})</p>
                    <h3 className="text-3xl font-bold">{formatCurrency(monthlyBalance)}</h3>
                    <div className="mt-4 flex gap-2 text-xs bg-white/10 p-2 rounded-lg backdrop-blur-sm inline-block">
                        <span>{monthlyBalance >= 0 ? 'Net Positive' : 'Net Negative'}</span>
                    </div>
                </div>

                {/* Home Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                                <TrendingUp size={16} className="text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Home Inc</span>
                        </div>
                        <p className="text-lg font-bold text-green-700 relative z-10">{formatCurrency(monthlyStats.home.inc)}</p>
                        <TrendingUp className="absolute -bottom-4 -right-4 text-green-100" size={64} />
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                                <TrendingDown size={16} className="text-red-600" />
                            </div>
                            <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Home Exp</span>
                        </div>
                        <p className="text-lg font-bold text-red-700 relative z-10">{formatCurrency(monthlyStats.home.exp)}</p>
                        <TrendingDown className="absolute -bottom-4 -right-4 text-red-100" size={64} />
                    </div>
                </div>

                {/* HomeSnacks Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                                <TrendingUp size={16} className="text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Snacks Inc</span>
                        </div>
                        <p className="text-lg font-bold text-green-700 relative z-10">{formatCurrency(monthlyStats.snacks.inc)}</p>
                        <TrendingUp className="absolute -bottom-4 -right-4 text-green-100" size={64} />
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                                <TrendingDown size={16} className="text-red-600" />
                            </div>
                            <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Snacks Exp</span>
                        </div>
                        <p className="text-lg font-bold text-red-700 relative z-10">{formatCurrency(monthlyStats.snacks.exp)}</p>
                        <TrendingDown className="absolute -bottom-4 -right-4 text-red-100" size={64} />
                    </div>
                </div>

                {/* Farm Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                                <TrendingUp size={16} className="text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Farm Inc</span>
                        </div>
                        <p className="text-lg font-bold text-green-700 relative z-10">{formatCurrency(monthlyStats.farm.inc)}</p>
                        <TrendingUp className="absolute -bottom-4 -right-4 text-green-100" size={64} />
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                                <TrendingDown size={16} className="text-red-600" />
                            </div>
                            <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Farm Exp</span>
                        </div>
                        <p className="text-lg font-bold text-red-700 relative z-10">{formatCurrency(monthlyStats.farm.exp)}</p>
                        <TrendingDown className="absolute -bottom-4 -right-4 text-red-100" size={64} />
                    </div>
                </div>
            </div>

            {/* Loan Portfolio Section */}
            {activeLoans.length > 0 && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total Loan Pending</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalLoanPending)}</h3>
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            {activeLoans.length} Active Loans
                        </div>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="h-4 w-full flex rounded-full overflow-hidden bg-gray-100">
                        {loanStats.map((stat, idx) => (
                            stat.widthPercent > 0 && (
                                <div
                                    key={stat.type}
                                    style={{ width: `${stat.widthPercent}%` }}
                                    className={`h-full ${stat.bg} relative border-r border-white last:border-0`}
                                >
                                    <div
                                        style={{ width: `${stat.paidPercent}%` }}
                                        className={`h-full ${stat.color} transition-all duration-500`}
                                    />
                                </div>
                            )
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 mt-3 flex-wrap">
                        {loanStats.map(stat => (
                            stat.widthPercent > 0 && (
                                <div key={stat.type} className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                                    <span className="text-xs text-gray-600 font-medium">{stat.label}</span>
                                    <span className="text-xs text-gray-400">({Math.round(stat.paidPercent)}% Paid)</span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity Preview */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                    {[...homeIncome.map(i => ({ ...i, type: 'income' })), ...homeExpenses.map(e => ({ ...e, type: 'expense' }))]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 5)
                        .map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-800">{item.description || item.category}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                </span>
                            </div>
                        ))}
                    {homeIncome.length === 0 && homeExpenses.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-2">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeDashboard;
