import React, { useState, useEffect } from 'react';
import { Calculator, ArrowLeft, Save, RefreshCw, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const HomeEMICalculator = ({ onNavigateBack }) => {
    // Input States
    const [principal, setPrincipal] = useState(1000000);
    const [interestRate, setInterestRate] = useState(1); // Default 1% per month
    const [tenureMonths, setTenureMonths] = useState(240); // Default 240 months (20 years)

    // Prepayment States
    const [prepaymentAmount, setPrepaymentAmount] = useState(0);
    const [prepaymentMonth, setPrepaymentMonth] = useState(12); // Pay after 1 year by default

    // Result States
    const [results, setResults] = useState(null);

    const calculateLoan = () => {
        const P = Number(principal);
        const R = Number(interestRate) / 100; // Monthly Interest Rate (Input is % per month)
        const N = Number(tenureMonths); // Total Months

        if (P <= 0 || R <= 0 || N <= 0) return;

        // 1. Standard EMI Calculation
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        const totalAmount = emi * N;
        const totalInterest = totalAmount - P;

        // 2. Prepayment Calculation (Tenure Reduction)
        let balance = P;
        let monthsElapsed = 0;
        let totalInterestPaidNew = 0;

        // Only run simulation if prepayment is entered, otherwise values are same as original
        if (Number(prepaymentAmount) > 0) {
            while (balance > 0 && monthsElapsed < 1000) { // Safety break
                // Interest for this month
                const interestForMonth = balance * R;
                totalInterestPaidNew += interestForMonth;

                // Principal part of EMI
                let principalForMonth = emi - interestForMonth;

                // Check if we can pay full EMI
                if (balance < emi) {
                    principalForMonth = balance;
                }

                // Apply Prepayment if applicable
                if (monthsElapsed + 1 === Number(prepaymentMonth)) {
                    balance -= Number(prepaymentAmount);
                    if (balance < 0) balance = 0;
                }

                balance -= principalForMonth;
                monthsElapsed++;

                if (balance <= 0.1) break;
            }
        } else {
            monthsElapsed = N;
            totalInterestPaidNew = totalInterest;
        }

        const newTenureMonths = monthsElapsed;
        const interestSaved = Math.max(0, totalInterest - totalInterestPaidNew);
        const timeSavedMonths = Math.max(0, N - newTenureMonths);

        setResults({
            emi,
            original: {
                totalInterest,
                totalAmount,
                tenureMonths: N
            },
            new: {
                totalInterest: totalInterestPaidNew,
                totalAmount: P + totalInterestPaidNew,
                tenureMonths: newTenureMonths
            },
            savings: {
                interest: interestSaved,
                timeMonths: timeSavedMonths
            }
        });
    };

    useEffect(() => {
        calculateLoan();
    }, [principal, interestRate, tenureMonths, prepaymentAmount, prepaymentMonth]);

    const formatMonthsToYears = (months) => {
        const y = Math.floor(months / 12);
        const m = months % 12;
        if (y > 0 && m > 0) return `${y}y ${m}m`;
        if (y > 0) return `${y} Years`;
        return `${m} Months`;
    };

    const chartData = results ? [
        {
            name: 'Original',
            Principal: Number(principal),
            Interest: Math.round(results.original.totalInterest),
        },
        {
            name: 'With Prepayment',
            Principal: Number(principal),
            Interest: Math.round(results.new.totalInterest),
        }
    ] : [];

    return (
        <div className="pb-20 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
                <button onClick={onNavigateBack} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calculator size={20} className="text-purple-600" />
                    EMI & Prepayment Calculator
                </h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Inputs Section */}
                <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Loan Details</h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Loan Amount (₹)</label>
                            <input
                                type="number"
                                value={principal}
                                onChange={(e) => setPrincipal(e.target.value)}
                                className="w-full p-2 border rounded-lg font-semibold text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1">Interest Rate (% per month)</label>
                                <input
                                    type="number"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    className="w-full p-2 border rounded-lg font-semibold text-gray-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1">Tenure (Months)</label>
                                <input
                                    type="number"
                                    value={tenureMonths}
                                    onChange={(e) => setTenureMonths(e.target.value)}
                                    className="w-full p-2 border rounded-lg font-semibold text-gray-700 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prepayment Section */}
                <div className="bg-white p-5 rounded-xl shadow-sm space-y-4 border-l-4 border-green-500">
                    <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                        <Save size={18} className="text-green-600" />
                        Prepayment Simulator
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">One-time Prepayment Amount (₹)</label>
                            <input
                                type="number"
                                value={prepaymentAmount}
                                onChange={(e) => setPrepaymentAmount(e.target.value)}
                                className="w-full p-2 border rounded-lg font-semibold text-green-700 bg-green-50 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g. 50000"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Pay after month number</label>
                            <input
                                type="number"
                                value={prepaymentMonth}
                                onChange={(e) => setPrepaymentMonth(e.target.value)}
                                className="w-full p-2 border rounded-lg font-semibold text-gray-700 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                (e.g. 12 means paying after 1 year)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {results && (
                    <div className="space-y-4">
                        {/* EMI Card */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 rounded-xl text-white shadow-lg">
                            <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">Monthly EMI</p>
                            <h2 className="text-3xl font-bold mt-1">{formatCurrency(results.emi)}</h2>
                        </div>

                        {/* Savings Summary */}
                        {Number(prepaymentAmount) > 0 && (
                            <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm">
                                <h3 className="text-green-800 font-bold text-lg mb-3 flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    Savings Analysis
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-green-600 font-medium uppercase">Interest Saved</p>
                                        <p className="text-xl font-bold text-green-700">{formatCurrency(results.savings.interest)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-600 font-medium uppercase">Time Saved</p>
                                        <p className="text-xl font-bold text-green-700">{formatMonthsToYears(results.savings.timeMonths)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-green-200">
                                    <p className="text-sm text-green-800">
                                        Loan will close in <span className="font-bold">{formatMonthsToYears(results.new.tenureMonths)}</span> instead of {formatMonthsToYears(results.original.tenureMonths)}.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Comparison Chart */}
                        <div className="bg-white p-4 rounded-xl shadow-sm h-64">
                            <h3 className="text-sm font-semibold text-gray-600 mb-4">Total Payment Comparison</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis hide />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="Principal" stackId="a" fill="#8884d8" />
                                    <Bar dataKey="Interest" stackId="a" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Detailed Stats */}
                        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Original Total Interest</span>
                                <span className="font-medium">{formatCurrency(results.original.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">New Total Interest</span>
                                <span className="font-medium text-green-600">{formatCurrency(results.new.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Total Amount Payable</span>
                                <span className="font-medium">{formatCurrency(results.new.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper icon component since TrendingUp is used but not imported in the snippet above
// Wait, I imported Save, ArrowLeft, RefreshCw, Calculator. I missed TrendingUp.
// Let me fix imports in the actual file write.

export default HomeEMICalculator;
