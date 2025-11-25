import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { filterByMonthYear, formatCurrency } from '../utils';
import { Filter, TrendingUp } from 'lucide-react';

const Analysis = () => {
    const { sales, production, customers } = useData();
    const [filterType, setFilterType] = useState('customer_purchases');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    const filteredData = useMemo(() => {
        switch (filterType) {
            case 'customer_purchases': {
                // All purchases by a specific customer
                if (!selectedCustomer) return [];
                return sales.filter(s => s.customerId === Number(selectedCustomer));
            }
            case 'customer_purchases_month': {
                // Customer purchases for specific month/year
                if (!selectedCustomer) return [];
                const filtered = filterByMonthYear(sales, selectedMonth, selectedYear);
                return filtered.filter(s => s.customerId === Number(selectedCustomer));
            }
            case 'product_sales': {
                // All sales of a specific product
                if (!selectedProduct) return [];
                return sales.filter(s => s.items.some(item => item.name === selectedProduct));
            }
            case 'product_sales_month': {
                // Product sales for specific month/year
                if (!selectedProduct) return [];
                const filtered = filterByMonthYear(sales, selectedMonth, selectedYear);
                return filtered.filter(s => s.items.some(item => item.name === selectedProduct));
            }
            case 'total_sales_month': {
                // Total sales for month/year
                return filterByMonthYear(sales, selectedMonth, selectedYear);
            }
            case 'production_by_item_month': {
                // Production of specific item for month/year
                if (!selectedProduct) return [];
                const filtered = filterByMonthYear(production, selectedMonth, selectedYear);
                return filtered.filter(p => p.item === selectedProduct);
            }
            case 'production_all_month': {
                // All production for month/year
                return filterByMonthYear(production, selectedMonth, selectedYear);
            }
            default:
                return [];
        }
    }, [filterType, selectedMonth, selectedYear, selectedCustomer, selectedProduct, sales, production]);

    const summary = useMemo(() => {
        if (filterType.includes('sales') || filterType.includes('customer')) {
            const totalSales = filteredData.reduce((sum, sale) => sum + sale.total, 0);
            const totalQty = filteredData.reduce((sum, sale) =>
                sum + sale.items.reduce((s, i) => s + i.qty, 0), 0
            );
            return { totalSales, totalQty, count: filteredData.length };
        } else if (filterType.includes('production')) {
            const totalQty = filteredData.reduce((sum, prod) => sum + Number(prod.qty), 0);
            return { totalQty, count: filteredData.length };
        }
        return {};
    }, [filteredData, filterType]);

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown';
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800">Analysis & Reports</h2>

            {/* Filter Type Selection */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    <Filter size={16} className="inline mr-1" />
                    Filter Type
                </label>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full border rounded p-2"
                >
                    <optgroup label="Customer Analysis">
                        <option value="customer_purchases">Customer Purchases (All Time)</option>
                        <option value="customer_purchases_month">Customer Purchases (Specific Month)</option>
                    </optgroup>
                    <optgroup label="Product Analysis">
                        <option value="product_sales">Product Sales (All Time)</option>
                        <option value="product_sales_month">Product Sales (Specific Month)</option>
                    </optgroup>
                    <optgroup label="Sales Analysis">
                        <option value="total_sales_month">Total Sales (Month/Year)</option>
                    </optgroup>
                    <optgroup label="Production Analysis">
                        <option value="production_by_item_month">Production by Item (Month/Year)</option>
                        <option value="production_all_month">All Production (Month/Year)</option>
                    </optgroup>
                </select>
            </div>

            {/* Dynamic Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                {(filterType.includes('customer')) && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Customer</label>
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Choose Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {(filterType.includes('product') || filterType.includes('production_by_item')) && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Product</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Choose Product</option>
                            {['கை முறுக்கு', 'தேன்குழல்', 'எல் அடை', 'கம்பு அடை', 'கொத்துமுறுக்கு', 'அதிரசம்', 'புடலங்காய் உருண்டை', 'சோமாஸ்'].map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                )}

                {filterType.includes('month') && (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full border rounded p-2"
                            >
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
                )}
            </div>

            {/* Summary Cards */}
            {Object.keys(summary).length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    {summary.totalSales !== undefined && (
                        <div className="bg-primary-50 p-4 rounded-xl shadow-sm border border-primary-100">
                            <div className="flex items-center gap-2 text-primary-700 mb-1">
                                <TrendingUp size={16} />
                                <span className="text-xs font-semibold uppercase">Total Sales</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800">{formatCurrency(summary.totalSales)}</p>
                        </div>
                    )}
                    {summary.totalQty !== undefined && (
                        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
                            <div className="text-xs font-semibold uppercase text-blue-700 mb-1">Total Quantity</div>
                            <p className="text-xl font-bold text-gray-800">{summary.totalQty} units</p>
                        </div>
                    )}
                    {summary.count !== undefined && (
                        <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                            <div className="text-xs font-semibold uppercase text-green-700 mb-1">Records</div>
                            <p className="text-xl font-bold text-gray-800">{summary.count}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-primary-50 border-b border-primary-100">
                    <h3 className="font-semibold text-gray-700">Results ({filteredData.length})</h3>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                    {filteredData.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No data found. Please select filters above.
                        </div>
                    ) : filterType.includes('sales') || filterType.includes('customer') ? (
                        filteredData.map((sale) => (
                            <div key={sale.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-800">{getCustomerName(sale.customerId)}</p>
                                        <p className="text-xs text-gray-500">{sale.date}</p>
                                    </div>
                                    <p className="font-bold text-primary-600">{formatCurrency(sale.total)}</p>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {sale.items.map((item, idx) => (
                                        <span key={idx}>{item.name} ({item.qty}){idx < sale.items.length - 1 ? ', ' : ''}</span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredData.map((prod) => (
                            <div key={prod.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{prod.item}</p>
                                    <p className="text-xs text-gray-500">{prod.date}</p>
                                </div>
                                <p className="font-bold text-gray-800">{prod.qty} units</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analysis;
