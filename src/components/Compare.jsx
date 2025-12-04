import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { filterByMonthYear, formatCurrency } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GitCompare, ArrowLeft } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const Compare = ({ onNavigateBack }) => {
    const { sales, customers } = useData();

    // Comparison mode: 'month' or 'date'
    const [comparisonMode, setComparisonMode] = useState('month');

    // Period 1 selection
    const [month1, setMonth1] = useState(new Date().getMonth());
    const [year1, setYear1] = useState(new Date().getFullYear());
    const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);

    // Period 2 selection
    const [month2, setMonth2] = useState(new Date().getMonth() - 1 >= 0 ? new Date().getMonth() - 1 : 11);
    const [year2, setYear2] = useState(new Date().getMonth() - 1 >= 0 ? new Date().getFullYear() : new Date().getFullYear() - 1);
    const [date2, setDate2] = useState(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]);

    // View type
    const [viewType, setViewType] = useState('rs'); // 'kg' or 'rs'

    // Customer chart type
    const [customerChartType, setCustomerChartType] = useState('bar'); // 'bar' or 'pie'

    // Helper function to filter by specific date
    const filterByDate = (data, targetDate) => {
        return data.filter(item => {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            return itemDate === targetDate;
        });
    };

    // Filter sales for each period based on mode
    const period1Sales = useMemo(() => {
        if (comparisonMode === 'month') {
            return filterByMonthYear(sales, month1, year1);
        } else {
            return filterByDate(sales, date1);
        }
    }, [sales, comparisonMode, month1, year1, date1]);

    const period2Sales = useMemo(() => {
        if (comparisonMode === 'month') {
            return filterByMonthYear(sales, month2, year2);
        } else {
            return filterByDate(sales, date2);
        }
    }, [sales, comparisonMode, month2, year2, date2]);

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

    // Calculate customer-wise data
    const customerData = useMemo(() => {
        const data = {};

        [...period1Sales, ...period2Sales].forEach(sale => {
            const customer = customers.find(c => c.id === sale.customerId);
            const customerName = customer ? customer.name : 'Unknown';

            if (!data[customerName]) {
                data[customerName] = 0;
            }
            data[customerName] += Number(sale.total);
        });

        return Object.keys(data).map(name => ({
            name,
            value: data[name]
        })).sort((a, b) => b.value - a.value);
    }, [period1Sales, period2Sales, customers]);

    // Calculate totals
    const period1Total = useMemo(() => {
        if (viewType === 'kg') {
            return comparisonData.reduce((sum, item) => sum + item.period1, 0);
        }
        return period1Sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    }, [comparisonData, period1Sales, viewType]);

    const period2Total = useMemo(() => {
        if (viewType === 'kg') {
            return comparisonData.reduce((sum, item) => sum + item.period2, 0);
        }
        return period2Sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    }, [comparisonData, period2Sales, viewType]);

    const getPeriodLabel = (mode, month, year, date) => {
        if (mode === 'month') {
            if (month === 'all') {
                return `Year ${year}`;
            }
            return `${new Date(0, month).toLocaleString('default', { month: 'long' })} ${year}`;
        } else {
            return new Date(date).toLocaleDateString();
        }
    };

    const renderCustomerChart = () => {
        if (customerData.length === 0) {
            return <p className="text-sm text-gray-500 italic text-center py-8">No customer data available</p>;
        }

        if (customerChartType === 'pie') {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={customerData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {customerData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            );
        }

        // Bar Chart
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                    <YAxis label={{ value: 'Total Purchase (₹)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Total Purchase">
                        {customerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <GitCompare size={24} />
                    Compare Sales
                </h2>
            </div>

            {/* Comparison Mode Selector */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-600 mb-2">Comparison Mode</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setComparisonMode('month')}
                        className={`flex-1 py-2 rounded ${comparisonMode === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Month/Year
                    </button>
                    <button
                        onClick={() => setComparisonMode('date')}
                        className={`flex-1 py-2 rounded ${comparisonMode === 'date' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Date Range
                    </button>
                </div>
            </div>

            {/* Period Selectors */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-700">Select Periods to Compare</h3>

                {comparisonMode === 'month' ? (
                    <>
                        {/* Period 1 - Month */}
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

                        {/* Period 2 - Month */}
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
                    </>
                ) : (
                    <>
                        {/* Period 1 - Single Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Date 1</label>
                            <input
                                type="date"
                                value={date1}
                                onChange={(e) => setDate1(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        {/* Period 2 - Single Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Date 2</label>
                            <input
                                type="date"
                                value={date2}
                                onChange={(e) => setDate2(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </>
                )}

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
                        {getPeriodLabel(comparisonMode, month1, year1, date1)}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                        {viewType === 'kg' ? `${period1Total.toFixed(2)} kg` : formatCurrency(period1Total)}
                    </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                        {getPeriodLabel(comparisonMode, month2, year2, date2)}
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
                        <Bar dataKey="period1" fill="#3b82f6" name={getPeriodLabel(comparisonMode, month1, year1, date1)} />
                        <Bar dataKey="period2" fill="#10b981" name={getPeriodLabel(comparisonMode, month2, year2, date2)} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Customer Total Buy Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Customer Total Purchase</h3>
                    <select
                        value={customerChartType}
                        onChange={(e) => setCustomerChartType(e.target.value)}
                        className="border rounded px-3 py-1 text-sm bg-white"
                    >
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                    </select>
                </div>
                {renderCustomerChart()}
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
