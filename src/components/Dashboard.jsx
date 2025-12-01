import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { filterByMonthYear, formatCurrency, getCurrentMonthYear } from '../utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    Filter, TrendingUp, TrendingDown, DollarSign, Package,
    AlertCircle, Factory, Scale, IndianRupee, Users, Wallet, Activity
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
    const { sales, production, expenses, stocks, orders, attendance, employees, rawMaterialUsage, customers } = useData();
    const { month: currentMonth, year: currentYear } = getCurrentMonthYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [chartType, setChartType] = useState('bar');
    const [customerChartType, setCustomerChartType] = useState('bar'); // 'bar' or 'pie'

    // Filter Data - Only show regular sales (not order-converted)
    const filteredSales = useMemo(() => {
        const regularSales = sales.filter(sale => !sale.buyType || sale.buyType === 'regular');
        return filterByMonthYear(regularSales, selectedMonth, selectedYear);
    }, [sales, selectedMonth, selectedYear]);

    // Filter delivered orders for the same period
    const filteredDeliveredOrders = useMemo(() => {
        const deliveredOrders = orders.filter(order => order.status === 'delivered');
        // Use bookingDate as it's more likely to be in the current month for recent orders
        return filterByMonthYear(deliveredOrders, selectedMonth, selectedYear, 'bookingDate');
    }, [orders, selectedMonth, selectedYear]);

    const filteredProduction = useMemo(() => filterByMonthYear(production, selectedMonth, selectedYear), [production, selectedMonth, selectedYear]);
    const filteredExpenses = useMemo(() => filterByMonthYear(expenses, selectedMonth, selectedYear), [expenses, selectedMonth, selectedYear]);

    // Helper for safe number conversion
    const safeNum = (val) => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
    };

    // Calculate Totals - Include both sales AND delivered orders
    const totalSales = safeNum(filteredSales.reduce((sum, item) => sum + safeNum(item.total), 0)) +
        safeNum(filteredDeliveredOrders.reduce((sum, item) => sum + safeNum(item.total), 0));

    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + safeNum(item.amount), 0);
    const totalProductionQty = filteredProduction.reduce((sum, item) => sum + safeNum(item.qty), 0);
    const totalPackedQty = filteredProduction.reduce((sum, item) => sum + safeNum(item.packedQty), 0);

    // Calculate total sales in kg - Include both sales AND delivered orders
    const totalSalesKg = safeNum(filteredSales.reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, item) => itemSum + safeNum(item.qty), 0);
    }, 0)) + safeNum(filteredDeliveredOrders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + safeNum(item.qty), 0);
    }, 0));

    // Calculate total stocks in kg
    const totalStocksKg = stocks.products.reduce((sum, product) => sum + safeNum(product.qty), 0);

    // Calculate total unpaid amount (regular sales + unpaid orders)
    const totalUnpaid = useMemo(() => {
        const unpaidSales = sales.filter(sale => sale.paymentStatus === 'not_paid' && (!sale.buyType || sale.buyType === 'regular'));
        const unpaidOrders = orders.filter(order => order.paymentStatus === 'not_paid');
        return [...unpaidSales, ...unpaidOrders].reduce((sum, item) => sum + safeNum(item.total), 0);
    }, [sales, orders]);

    // Profit Calculation (Simplified: Sales - Expenses)
    const profit = safeNum(totalSales) - safeNum(totalExpenses);

    // --- New Metrics Calculation ---

    // 1. Calculate Total Salary based on Attendance
    const filteredAttendance = useMemo(() => filterByMonthYear(attendance, selectedMonth, selectedYear), [attendance, selectedMonth, selectedYear]);

    const totalSalary = useMemo(() => {
        return filteredAttendance.reduce((sum, record) => {
            if (record.status === 'present') {
                const employee = employees.find(e => e.id === record.employeeId);
                return sum + (employee ? safeNum(employee.dailySalary) : 0);
            }
            return sum;
        }, 0);
    }, [filteredAttendance, employees]);

    // 2. Calculate Total Usage Cost
    const filteredUsageCost = useMemo(() => filterByMonthYear(rawMaterialUsage, selectedMonth, selectedYear), [rawMaterialUsage, selectedMonth, selectedYear]);
    const totalUsageCost = filteredUsageCost.reduce((sum, u) => sum + safeNum(u.cost || 0), 0);

    // 3. Calculate Operational Expenses (Expenses excluding Raw Material purchases)
    const operationalExpenses = filteredExpenses
        .filter(e => e.category !== 'Raw Material')
        .reduce((sum, e) => sum + safeNum(e.amount), 0);

    // Metric 1: Overall Expense = Total Expenses (Purchases + Ops) + Salary
    const overallExpense = safeNum(totalExpenses) + safeNum(totalSalary);

    // Metric 2: Usage Based Expense = Raw Material Usage Cost + Operational Expenses + Salary
    const usageBasedExpense = safeNum(totalUsageCost) + safeNum(operationalExpenses) + safeNum(totalSalary);

    // Chart Data Preparation
    // 1. Total quantity (kg) sold per item – used for Pie & Bar charts (includes delivered orders)
    const salesKgByItem = useMemo(() => {
        const data = {};
        // Add sales
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                data[item.name] = (data[item.name] || 0) + safeNum(item.qty);
            });
        });
        // Add delivered orders
        filteredDeliveredOrders.forEach(order => {
            order.items.forEach(item => {
                data[item.name] = (data[item.name] || 0) + safeNum(item.qty);
            });
        });
        return Object.keys(data).map(name => ({ name, value: data[name] }));
    }, [filteredSales, filteredDeliveredOrders]);

    // 2. Sales data for Line chart – Daily or Monthly based on filter (includes delivered orders)
    const dailySales = useMemo(() => {
        const data = {};

        if (selectedMonth === 'all') {
            // Whole Year selected: Aggregate by month
            filteredSales.forEach(sale => {
                const date = new Date(sale.date);
                const monthName = date.toLocaleString('default', { month: 'short' });
                const total = sale.items.reduce((sum, it) => sum + safeNum(it.qty) * safeNum(it.price), 0);
                data[monthName] = (data[monthName] || 0) + total;
            });
            filteredDeliveredOrders.forEach(order => {
                const date = new Date(order.bookingDate);
                const monthName = date.toLocaleString('default', { month: 'short' });
                const total = order.items.reduce((sum, it) => sum + safeNum(it.qty) * safeNum(it.price), 0);
                data[monthName] = (data[monthName] || 0) + total;
            });

            // Return months in order (Jan to Dec)
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return monthOrder
                .filter(month => data[month] !== undefined)
                .map(month => ({ name: month, value: data[month] }));
        } else {
            // Specific month selected: Aggregate by day
            filteredSales.forEach(sale => {
                const day = new Date(sale.date).toLocaleDateString();
                const total = sale.items.reduce((sum, it) => sum + safeNum(it.qty) * safeNum(it.price), 0);
                data[day] = (data[day] || 0) + total;
            });
            filteredDeliveredOrders.forEach(order => {
                const day = new Date(order.bookingDate).toLocaleDateString();
                const total = order.items.reduce((sum, it) => sum + safeNum(it.qty) * safeNum(it.price), 0);
                data[day] = (data[day] || 0) + total;
            });

            // Sort by date
            const sorted = Object.keys(data)
                .sort((a, b) => new Date(a) - new Date(b))
                .map(date => ({ name: date, value: data[date] }));
            return sorted;
        }
    }, [filteredSales, filteredDeliveredOrders, selectedMonth]);

    const productionByItem = useMemo(() => {
        const data = {};
        filteredProduction.forEach(prod => {
            data[prod.item] = (data[prod.item] || 0) + Number(prod.qty);
        });
        return Object.keys(data).map(name => ({ name, value: data[name] }));
    }, [filteredProduction]);

    // Calculate customer-wise total purchases
    const customerData = useMemo(() => {
        const data = {};

        // Aggregate sales by customer
        [...filteredSales, ...filteredDeliveredOrders].forEach(sale => {
            const customer = customers.find(c => c.id === sale.customerId);
            const customerName = customer ? customer.name : 'Unknown';

            if (!data[customerName]) {
                data[customerName] = 0;
            }
            data[customerName] += safeNum(sale.total);
        });

        return Object.keys(data)
            .map(name => ({
                name,
                value: data[name]
            }))
            .sort((a, b) => b.value - a.value) // Sort by highest to lowest
            .slice(0, 10); // Show top 10 customers
    }, [filteredSales, filteredDeliveredOrders, customers]);


    // Render Item Charts (Pie or Bar)
    const renderItemChart = (type) => {
        if (salesKgByItem.length === 0) {
            return <p className="text-sm text-gray-500 italic text-center py-8">No sales data available</p>;
        }

        if (type === 'pie') {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={salesKgByItem}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value} kg`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {salesKgByItem.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} kg`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            );
        }

        // Bar Chart
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesKgByItem}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value} kg`} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Sales (kg)">
                        {salesKgByItem.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    // Render Line Chart for Daily Sales
    const renderLineChart = () => {
        if (dailySales.length === 0) {
            return <p className="text-sm text-gray-500 italic text-center py-8">No sales data available</p>;
        }

        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 10 }}
                    />
                    <YAxis label={{ value: 'Sales Amount (₹)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Daily Sales"
                        dot={{ fill: '#8884d8', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    // Render Customer Chart (Pie or Bar)
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
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border rounded-lg p-2 text-sm bg-gray-50"
                    >
                        <option value="all">Whole Year</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="border rounded-lg p-2 text-sm bg-gray-50"
                    >
                        <option value={currentYear}>{currentYear}</option>
                        <option value={currentYear - 1}>{currentYear - 1}</option>
                    </select>
                </div>
            </div>

            {/* Metrics Grid - Rearranged */}
            <div className="grid grid-cols-2 gap-4">
                {/* Row 1: Profit & Not Received */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-green-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Profit</p>
                    </div>
                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Not Received</p>
                    </div>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(totalUnpaid)}</p>
                </div>

                {/* Row 2: Raw Production & Kg After Pack */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Factory className="text-blue-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Raw Production</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{totalProductionQty} kg</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="text-purple-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Kg After Pack</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{totalPackedQty} kg</p>
                </div>

                {/* Row 3: Sales in Kg & Sales in Rs */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Scale className="text-indigo-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Sales (Kg)</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{totalSalesKg} kg</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="text-green-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Sales (₹)</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</p>
                </div>

                {/* Row 4: Total Salary Given & Total Stocks */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="text-orange-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Total Salary</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSalary)}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="text-teal-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Total Stocks</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{totalStocksKg.toFixed(1)} kg</p>
                </div>

                {/* Row 5: Overall Expenses & Usage Based Expenses */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="text-red-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Overall Exp.</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(overallExpense)}</p>
                    <p className="text-xs text-gray-500 mt-1">Includes Purchases + Ops + Salary</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="text-blue-600" size={20} />
                        <p className="text-sm font-medium text-gray-600">Usage Based Exp.</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(usageBasedExpense)}</p>
                    <p className="text-xs text-gray-500 mt-1">Material Usage + Ops + Salary</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Total Item Sales in Kg</h3>
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="border rounded px-3 py-1 text-sm bg-white"
                    >
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                    </select>
                </div>
                {renderItemChart(chartType)}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">
                        {selectedMonth === 'all' ? 'Monthly Sales' : 'Daily Sales'}
                    </h3>
                </div>
                {renderLineChart()}
            </div>

            {/* Customer Total Purchase Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
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

            {/* Stock Summary (Mini) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Low Stock Alert</h3>
                <div className="space-y-2">
                    {stocks.products.filter(p => p.qty < 10).map(p => (
                        <div key={p.name} className="flex justify-between items-center text-sm p-2 bg-red-50 rounded text-red-700">
                            <span>{p.name}</span>
                            <span className="font-bold">{p.qty} left</span>
                        </div>
                    ))}
                    {stocks.products.filter(p => p.qty >= 10).length === stocks.products.length && (
                        <p className="text-sm text-gray-500 italic">All stock levels are good.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
