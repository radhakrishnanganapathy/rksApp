import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils';
import { Wallet, TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

    // Calculate Category-wise Expenses for Pie Chart
    const [selectedCategoryForChart, setSelectedCategoryForChart] = useState(null);

    const filteredExpenses = homeExpenses.filter(item => {
        const d = new Date(item.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const chartDataMap = filteredExpenses.reduce((acc, item) => {
        if (selectedCategoryForChart) {
            // If a category is selected, group by description (sub-category)
            if (item.category === selectedCategoryForChart) {
                const subCat = item.description || 'Unspecified';
                acc[subCat] = (acc[subCat] || 0) + Number(item.amount);
            }
        } else {
            // Otherwise group by main category
            const cat = item.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + Number(item.amount);
        }
        return acc;
    }, {});

    const pieData = Object.keys(chartDataMap).map(key => ({
        name: key,
        value: chartDataMap[key]
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

    const onPieClick = (data) => {
        if (!selectedCategoryForChart) {
            setSelectedCategoryForChart(data.name);
        }
    };

    // List View Logic
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategoryExpand = (cat) => {
        setExpandedCategories(prev => ({
            ...prev,
            [cat]: !prev[cat]
        }));
    };

    const expenseHierarchy = filteredExpenses.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized';
        const subCat = item.description || 'Unspecified';
        const amount = Number(item.amount);

        if (!acc[cat]) {
            acc[cat] = { total: 0, items: {} };
        }
        acc[cat].total += amount;
        acc[cat].items[subCat] = (acc[cat].items[subCat] || 0) + amount;
        return acc;
    }, {});

    const totalExpensesForMonth = Object.values(expenseHierarchy).reduce((sum, cat) => sum + cat.total, 0);

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

            {/* Category-wise Expense Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">
                        {selectedCategoryForChart ? `${selectedCategoryForChart} Breakdown` : 'Expense Breakdown'}
                    </h3>
                    {selectedCategoryForChart && (
                        <button
                            onClick={() => setSelectedCategoryForChart(null)}
                            className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-gray-600"
                        >
                            Back to Categories
                        </button>
                    )}
                </div>

                {pieData.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onClick={onPieClick}
                                    className="cursor-pointer"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        {!selectedCategoryForChart && (
                            <p className="text-center text-xs text-gray-400 mt-2">Click on a section to view details</p>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 text-sm py-10">
                        {selectedCategoryForChart
                            ? `No expenses found for ${selectedCategoryForChart}`
                            : 'No expense data for this month'}
                    </p>
                )}
            </div>

            {/* Detailed Expense List with Percentages */}
            {totalExpensesForMonth > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="font-semibold text-gray-700 mb-4">Expense Details</h3>
                    <div className="space-y-3">
                        {Object.entries(expenseHierarchy)
                            .sort(([, a], [, b]) => b.total - a.total)
                            .map(([catName, data]) => {
                                const isExpanded = expandedCategories[catName];
                                const percentageVal = (data.total / totalExpensesForMonth) * 100;
                                const percentage = percentageVal.toFixed(1);

                                // Calculate color: Green (low) -> Yellow (mid) -> Red (high)
                                // 0% -> 120 (Green), 50% -> 60 (Yellow), 100% -> 0 (Red)
                                const hue = Math.max(0, Math.min(120, 120 - (percentageVal * 1.2)));
                                const barColor = `hsl(${hue}, 85%, 45%)`;

                                return (
                                    <div key={catName} className="border border-gray-100 rounded-lg overflow-hidden">
                                        <div
                                            onClick={() => toggleCategoryExpand(catName)}
                                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">{catName}</p>
                                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: barColor
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800 text-sm">{formatCurrency(data.total)}</p>
                                                <p className="text-xs text-gray-500">{percentage}%</p>
                                            </div>
                                        </div>

                                        {/* Expanded Sub-categories */}
                                        {isExpanded && (
                                            <div className="bg-white p-3 border-t border-gray-100 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                {Object.entries(data.items)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .map(([itemName, amount]) => {
                                                        const subPercentage = ((amount / data.total) * 100).toFixed(1);
                                                        return (
                                                            <div key={itemName} className="flex justify-between items-center text-sm pl-7">
                                                                <span className="text-gray-600">{itemName}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-gray-800 font-medium">{formatCurrency(amount)}</span>
                                                                    <span className="text-xs text-gray-400 w-10 text-right">({subPercentage}%)</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeDashboard;
