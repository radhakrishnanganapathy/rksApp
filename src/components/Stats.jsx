import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, ArrowLeft } from 'lucide-react';

const Stats = ({ onNavigateBack }) => {
    const { sales, production, expenses, attendance, employees, customers } = useData();
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterType, setFilterType] = useState('month'); // 'month' or 'date'
    const [selectedCustomer, setSelectedCustomer] = useState('');

    // Filter data based on month/year
    const filteredData = useMemo(() => {
        const filterByDate = (data, dateField = 'date') => {
            return data.filter(item => {
                const date = new Date(item[dateField]);

                if (filterType === 'date') {
                    return date.toISOString().split('T')[0] === selectedDate;
                }

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
    }, [sales, production, expenses, attendance, selectedMonth, selectedYear, selectedDate, filterType]);

    // Calculate main statistics
    const stats = useMemo(() => {
        // Total Production (kg)
        const totalProductionKg = filteredData.production.reduce((sum, p) => sum + Number(p.qty), 0);

        // Total Sales (kg and amount)
        const totalSalesKg = filteredData.sales.reduce((sum, sale) =>
            sum + sale.items.reduce((s, item) => s + Number(item.qty), 0), 0
        );
        const totalSalesAmount = filteredData.sales.reduce((sum, sale) => sum + Number(sale.total), 0);

        // Total Expenses
        const totalExpenses = filteredData.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

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
                itemData[item.name].kg += Number(item.qty);
                itemData[item.name].earn += Number(item.qty) * Number(item.price);
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
                customerData[customerName] = { sales: 0, earn: 0, kg: 0, customerId: sale.customerId };
            }
            customerData[customerName].sales += 1;
            customerData[customerName].earn += Number(sale.total);

            // Calculate total kg for this sale
            const saleKg = sale.items.reduce((sum, item) => sum + Number(item.qty), 0);
            customerData[customerName].kg += saleKg;
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
            .filter(sale => String(sale.customerId) === String(selectedCustomer))
            .forEach(sale => {
                sale.items.forEach(item => {
                    if (!itemData[item.name]) {
                        itemData[item.name] = { qty: 0, earn: 0 };
                    }
                    itemData[item.name].qty += Number(item.qty);
                    itemData[item.name].earn += Number(item.qty) * Number(item.price);
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
                <div className="flex gap-2 border-b pb-2 mb-2">
                    <button
                        className={`flex-1 py-1 text-sm font-medium rounded ${filterType === 'month' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setFilterType('month')}
                    >
                        Month View
                    </button>
                    <button
                        className={`flex-1 py-1 text-sm font-medium rounded ${filterType === 'date' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setFilterType('date')}
                    >
                        Date View
                    </button>
                </div>

                {filterType === 'month' ? (
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
                ) : (
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    {filterType === 'date'
                        ? `Showing stats for ${new Date(selectedDate).toLocaleDateString()}`
                        : (selectedMonth === '' ? `Showing stats for entire year ${selectedYear}` : `Showing stats for ${new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`)
                    }
                </p>
            </div>



            {/* Item-wise Sales */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-primary-50 border-b border-primary-100">
                    <h3 className="font-semibold text-gray-700">Item-wise Sales & Earnings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 text-right">Sales (kg)</th>
                                <th className="px-4 py-2 text-right">Sales (Rs)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {itemWiseStats.length === 0 ? (
                                <tr><td colSpan="3" className="p-4 text-center text-gray-500">No sales data</td></tr>
                            ) : (
                                itemWiseStats.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 font-medium text-gray-800">{item.name}</td>
                                        <td className="px-4 py-2 text-right text-gray-600">{item.kg} kg</td>
                                        <td className="px-4 py-2 text-right font-bold text-primary-600">{formatCurrency(item.earn)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer-wise Sales */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                    <h3 className="font-semibold text-gray-700">Customer-wise Sales & Earnings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Customer</th>
                                <th className="px-4 py-2 text-right">Sales (kg)</th>
                                <th className="px-4 py-2 text-right">Sales (Rs)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {customerWiseStats.length === 0 ? (
                                <tr><td colSpan="3" className="p-4 text-center text-gray-500">No sales data</td></tr>
                            ) : (
                                customerWiseStats.map((customer, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 font-medium text-gray-800">{customer.name}</td>
                                        <td className="px-4 py-2 text-right text-gray-600">{customer.kg} kg</td>
                                        <td className="px-4 py-2 text-right font-bold text-blue-600">{formatCurrency(customer.earn)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">Item</th>
                                        <th className="px-4 py-2 text-right">Sales (kg)</th>
                                        <th className="px-4 py-2 text-right">Sales (Rs)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {customerItemBreakdown.length === 0 ? (
                                        <tr><td colSpan="3" className="p-4 text-center text-gray-500">No purchases by this customer</td></tr>
                                    ) : (
                                        customerItemBreakdown.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 font-medium text-gray-800">{item.name}</td>
                                                <td className="px-4 py-2 text-right text-gray-600">{item.qty} kg</td>
                                                <td className="px-4 py-2 text-right font-bold text-green-600">{formatCurrency(item.earn)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stats;
