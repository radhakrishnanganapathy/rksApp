import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, ArrowLeft } from 'lucide-react';

const Stats = ({ onNavigateBack }) => {
    const { sales, production, expenses, attendance, employees, customers } = useData();
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedCustomer, setSelectedCustomer] = useState('');

    // Filter data based on month/year
    const filteredData = useMemo(() => {
        const filterByDate = (data, dateField = 'date') => {
            return data.filter(item => {
                const date = new Date(item[dateField]);
                const yearMatch = date.getFullYear() === parseInt(selectedYear);
                if (selectedMonth === '') {
                    return yearMatch; // Whole year
                }
                return yearMatch && date.getMonth() === parseInt(selectedMonth);
            });
        };

        return {
            sales: filterByDate(sales),
            production: filterByDate(production),
            expenses: filterByDate(expenses),
            attendance: filterByDate(attendance)
        };
    }, [sales, production, expenses, attendance, selectedMonth, selectedYear]);

    // Calculate main statistics
    const stats = useMemo(() => {
        // Total Production (kg)
        const totalProductionKg = filteredData.production.reduce((sum, p) => sum + Number(p.qty), 0);

        // Total Sales (kg and amount)
        const totalSalesKg = filteredData.sales.reduce((sum, sale) =>
            sum + sale.items.reduce((s, item) => s + item.qty, 0), 0
        );
        const totalSalesAmount = filteredData.sales.reduce((sum, sale) => sum + sale.total, 0);

        // Total Expenses
        const totalExpenses = filteredData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Total Salary Given
        const totalSalary = filteredData.attendance
            .filter(a => a.status === 'present')
            .reduce((sum, a) => {
                const emp = employees.find(e => e.id === a.employeeId);
                return sum + (emp ? emp.salaryPerDay : 0);
            }, 0);

        // Total Earn (Sales Amount)
        const totalEarn = totalSalesAmount;

        // Profit/Loss
        const profitLoss = totalEarn - totalExpenses - totalSalary;

        return {
            totalProductionKg,
            totalSalesKg,
            totalSalesAmount,
            totalExpenses,
            totalSalary,
            totalEarn,
            profitLoss
        };
    }, [filteredData, employees]);

    // Item-wise sales and earnings
    const itemWiseStats = useMemo(() => {
        const itemData = {};
        filteredData.sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!itemData[item.name]) {
                    itemData[item.name] = { kg: 0, earn: 0 };
                }
                itemData[item.name].kg += item.qty;
                itemData[item.name].earn += item.qty * item.price;
            });
        });
        return Object.keys(itemData).map(name => ({
            name,
            ...itemData[name]
        })).sort((a, b) => b.earn - a.earn);
    }, [filteredData.sales]);

    // Customer-wise sales and earnings
    const customerWiseStats = useMemo(() => {
        const customerData = {};
        filteredData.sales.forEach(sale => {
            const customer = customers.find(c => c.id === sale.customerId);
            const customerName = customer ? customer.name : 'Unknown';

            if (!customerData[customerName]) {
                customerData[customerName] = { sales: 0, earn: 0, customerId: sale.customerId };
            }
            customerData[customerName].sales += 1;
            customerData[customerName].earn += sale.total;
        });
        return Object.keys(customerData).map(name => ({
            name,
            ...customerData[name]
        })).sort((a, b) => b.earn - a.earn);
    }, [filteredData.sales, customers]);

    // Specific customer item-wise breakdown
    const customerItemBreakdown = useMemo(() => {
        if (!selectedCustomer) return [];

        const itemData = {};
        filteredData.sales
            .filter(sale => sale.customerId === Number(selectedCustomer))
            .forEach(sale => {
                sale.items.forEach(item => {
                    if (!itemData[item.name]) {
                        itemData[item.name] = { qty: 0, earn: 0 };
                    }
                    itemData[item.name].qty += item.qty;
                    itemData[item.name].earn += item.qty * item.price;
                });
            });

        return Object.keys(itemData).map(name => ({
            name,
            ...itemData[name]
        })).sort((a, b) => b.earn - a.earn);
    }, [filteredData.sales, selectedCustomer]);

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown';
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Statistics</h2>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">Month (Optional)</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Whole Year</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>
                <p className="text-xs text-gray-500">
                    {selectedMonth === '' ? `Showing stats for entire year ${selectedYear}` : `Showing stats for ${new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`}
                </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Package size={16} />
                        <span className="text-xs font-semibold uppercase">Production</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{stats.totalProductionKg} kg</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                        <ShoppingCart size={16} />
                        <span className="text-xs font-semibold uppercase">Sales</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{stats.totalSalesKg} kg</p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                        <TrendingDown size={16} />
                        <span className="text-xs font-semibold uppercase">Expenses</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalExpenses)}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <Users size={16} />
                        <span className="text-xs font-semibold uppercase">Salary</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalSalary)}</p>
                </div>

                <div className="bg-primary-50 p-4 rounded-xl shadow-sm border border-primary-100">
                    <div className="flex items-center gap-2 text-primary-700 mb-1">
                        <DollarSign size={16} />
                        <span className="text-xs font-semibold uppercase">Total Earn</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalEarn)}</p>
                </div>

                <div className={`p-4 rounded-xl shadow-sm border ${stats.profitLoss >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp size={16} />
                        <span className="text-xs font-semibold uppercase">Profit/Loss</span>
                    </div>
                    <p className={`text-xl font-bold ${stats.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(Math.abs(stats.profitLoss))}
                        {stats.profitLoss < 0 && ' Loss'}
                    </p>
                </div>
            </div>

            {/* Item-wise Sales */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-primary-50 border-b border-primary-100">
                    <h3 className="font-semibold text-gray-700">Item-wise Sales & Earnings</h3>
                </div>
                <div className="divide-y max-h-64 overflow-y-auto">
                    {itemWiseStats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No sales data</div>
                    ) : (
                        itemWiseStats.map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.kg} kg sold</p>
                                </div>
                                <p className="font-bold text-primary-600">{formatCurrency(item.earn)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Customer-wise Sales */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                    <h3 className="font-semibold text-gray-700">Customer-wise Sales & Earnings</h3>
                </div>
                <div className="divide-y max-h-64 overflow-y-auto">
                    {customerWiseStats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No sales data</div>
                    ) : (
                        customerWiseStats.map((customer, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{customer.name}</p>
                                    <p className="text-xs text-gray-500">{customer.sales} orders</p>
                                </div>
                                <p className="font-bold text-blue-600">{formatCurrency(customer.earn)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Customer Item Breakdown */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-green-50 border-b border-green-100">
                    <h3 className="font-semibold text-gray-700">Customer Purchase Breakdown</h3>
                </div>
                <div className="p-4">
                    <label className="block text-sm font-medium mb-2">Select Customer</label>
                    <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                    >
                        <option value="">Choose Customer</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {selectedCustomer && (
                        <div className="divide-y border-t">
                            {customerItemBreakdown.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No purchases by this customer</div>
                            ) : (
                                customerItemBreakdown.map((item, idx) => (
                                    <div key={idx} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.qty} kg</p>
                                        </div>
                                        <p className="font-bold text-green-600">{formatCurrency(item.earn)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stats;
