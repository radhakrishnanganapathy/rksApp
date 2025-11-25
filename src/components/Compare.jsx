import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { filterByMonthYear, formatCurrency } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GitCompare } from 'lucide-react';

const Compare = () => {
    const { sales } = useData();

    // Period 1 selection
    const [month1, setMonth1] = useState(new Date().getMonth());
    const [year1, setYear1] = useState(new Date().getFullYear());

    // Period 2 selection
    const [month2, setMonth2] = useState(new Date().getMonth() - 1 >= 0 ? new Date().getMonth() - 1 : 11);
    const [year2, setYear2] = useState(new Date().getMonth() - 1 >= 0 ? new Date().getFullYear() : new Date().getFullYear() - 1);

    // View type
    const [viewType, setViewType] = useState('rs'); // 'kg' or 'rs'

    // Filter sales for each period
    const period1Sales = useMemo(() => filterByMonthYear(sales, month1, year1), [sales, month1, year1]);
    const period2Sales = useMemo(() => filterByMonthYear(sales, month2, year2), [sales, month2, year2]);

    // Calculate comparison data
    const comparisonData = useMemo(() => {
        const data1 = {};
        const data2 = {};

        // Aggregate Period 1
        period1Sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!data1[item.name]) {
                    data1[item.name] = { kg: 0, rs: 0 };
                }
                data1[item.name].kg += Number(item.qty);
                data1[item.name].rs += Number(item.qty) * Number(item.price);
            });
        });

        // Aggregate Period 2
        period2Sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!data2[item.name]) {
                    data2[item.name] = { kg: 0, rs: 0 };
                }
                data2[item.name].kg += Number(item.qty);
                data2[item.name].rs += Number(item.qty) * Number(item.price);
            });
        });

        // Combine all products
        const allProducts = new Set([...Object.keys(data1), ...Object.keys(data2)]);

        return Array.from(allProducts).map(product => ({
            name: product,
            period1: viewType === 'kg' ? (data1[product]?.kg || 0) : (data1[product]?.rs || 0),
            period2: viewType === 'kg' ? (data2[product]?.kg || 0) : (data2[product]?.rs || 0)
        }));
    }, [period1Sales, period2Sales, viewType]);

    // Calculate totals
    const period1Total = useMemo(() => {
        if (viewType === 'kg') {
            return comparisonData.reduce((sum, item) => sum + item.period1, 0);
        }
        return period1Sales.reduce((sum, sale) => sum + sale.total, 0);
    }, [comparisonData, period1Sales, viewType]);

    const period2Total = useMemo(() => {
        if (viewType === 'kg') {
            return comparisonData.reduce((sum, item) => sum + item.period2, 0);
        }
        return period2Sales.reduce((sum, sale) => sum + sale.total, 0);
    }, [comparisonData, period2Sales, viewType]);

    const getPeriodLabel = (month, year) => {
        if (month === 'all') {
            return `Year ${year}`;
        }
        return `${new Date(0, month).toLocaleString('default', { month: 'long' })} ${year}`;
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <GitCompare size={24} />
                Compare Sales
            </h2>

            {/* Period Selectors */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-700">Select Periods to Compare</h3>

                {/* Period 1 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Period 1</label>
                    <div className="flex gap-2">
                        <select
                            value={month1}
                            onChange={(e) => setMonth1(e.target.value)}
                            className="flex-1 border rounded p-2"
                        >
                            <option value="all">Whole Year</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={year1}
                            onChange={(e) => setYear1(e.target.value)}
                            className="flex-1 border rounded p-2"
                        >
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>

                {/* Period 2 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Period 2</label>
                    <div className="flex gap-2">
                        <select
                            value={month2}
                            onChange={(e) => setMonth2(e.target.value)}
                            className="flex-1 border rounded p-2"
                        >
                            <option value="all">Whole Year</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={year2}
                            onChange={(e) => setYear2(e.target.value)}
                            className="flex-1 border rounded p-2"
                        >
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>

                {/* View Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">View Type</label>
                    <select
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="rs">In ₹ (Revenue)</option>
                        <option value="kg">In Kg (Quantity)</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                        {getPeriodLabel(month1, year1)}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                        {viewType === 'kg' ? `${period1Total.toFixed(2)} kg` : formatCurrency(period1Total)}
                    </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                        {getPeriodLabel(month2, year2)}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                        {viewType === 'kg' ? `${period2Total.toFixed(2)} kg` : formatCurrency(period2Total)}
                    </p>
                </div>
            </div>

            {/* Comparison Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-4">Comparison Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                        <YAxis label={{ value: viewType === 'kg' ? 'Quantity (kg)' : 'Revenue (₹)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => viewType === 'kg' ? `${value} kg` : formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="period1" fill="#3b82f6" name={getPeriodLabel(month1, year1)} />
                        <Bar dataKey="period2" fill="#10b981" name={getPeriodLabel(month2, year2)} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Product-wise List */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3">Product-wise Breakdown</h3>
                <div className="space-y-2">
                    {comparisonData.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex gap-4 text-sm">
                                <span className="text-blue-600">
                                    {viewType === 'kg' ? `${item.period1.toFixed(2)} kg` : formatCurrency(item.period1)}
                                </span>
                                <span className="text-green-600">
                                    {viewType === 'kg' ? `${item.period2.toFixed(2)} kg` : formatCurrency(item.period2)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {comparisonData.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-4">No data available for comparison</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Compare;
