import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency, filterByMonthYear } from '../utils';
import { Trash2, Edit, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

const BillingList = ({ onEdit }) => {
    const { sales, customers, deleteSale } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Filters
    const [filterType, setFilterType] = useState('month'); // 'month' or 'date'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCustomer, setSelectedCustomer] = useState('all');

    const getCustomerName = (id) => {
        const customer = customers.find(c => c.id === id);
        return customer ? customer.name : 'Unknown Customer';
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            deleteSale(id);
        }
    };

    // 1. Filter by Month/Year or Date
    const salesByDate = useMemo(() => {
        if (filterType === 'date') {
            return sales.filter(sale => {
                const saleDate = new Date(sale.date).toISOString().split('T')[0];
                return saleDate === selectedDate;
            });
        }
        return filterByMonthYear(sales, selectedMonth, selectedYear);
    }, [sales, selectedMonth, selectedYear, selectedDate, filterType]);

    // 2. Filter by Customer Dropdown
    const salesByCustomer = useMemo(() => {
        if (selectedCustomer === 'all') return salesByDate;
        return salesByDate.filter(s => String(s.customerId) === String(selectedCustomer));
    }, [salesByDate, selectedCustomer]);

    // 3. Prepare View Data
    const viewData = useMemo(() => {
        // Mode 1: Customer Summary (Whole Year)
        if (selectedMonth === 'all') {
            const summary = {};
            salesByCustomer.forEach(sale => {
                const custId = sale.customerId;
                if (!summary[custId]) {
                    summary[custId] = {
                        type: 'summary',
                        id: custId, // Use customerId as key
                        name: getCustomerName(custId),
                        totalSales: 0,
                        items: {}
                    };
                }
                summary[custId].totalSales += Number(sale.total);

                // Aggregate Items
                sale.items.forEach(item => {
                    if (!summary[custId].items[item.name]) {
                        summary[custId].items[item.name] = { name: item.name, qty: 0, total: 0 };
                    }
                    summary[custId].items[item.name].qty += Number(item.qty);
                    summary[custId].items[item.name].total += Number(item.total || (item.qty * item.price));
                });
            });

            // Convert to array and filter by search term
            return Object.values(summary)
                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => b.totalSales - a.totalSales);
        }

        // Mode 2: Individual Sales (Specific Month)
        return salesByCustomer
            .filter(sale => {
                const name = getCustomerName(sale.customerId).toLowerCase();
                return name.includes(searchTerm.toLowerCase());
            })
            .map(sale => ({ ...sale, type: 'sale', name: getCustomerName(sale.customerId) }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

    }, [salesByCustomer, selectedMonth, searchTerm, customers]);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white p-3 rounded-lg shadow-sm space-y-3">
                {/* Filter Type Toggle */}
                <div className="flex gap-2 border-b pb-2">
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

                {/* Date Filters */}
                {filterType === 'month' ? (
                    <div className="flex gap-2">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border rounded p-2 text-sm flex-1"
                        >
                            <option value="all">Whole Year</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border rounded p-2 text-sm flex-1"
                        >
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                ) : (
                    <div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                        />
                    </div>
                )}
                <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                >
                    <option value="all">All Customers</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search in list..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {viewData.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No records found</div>
                ) : (
                    viewData.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            {/* Header */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                onClick={() => toggleExpand(item.id)}
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                    {item.type === 'sale' ? (
                                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                    ) : (
                                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Yearly Summary</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-primary-600">{formatCurrency(item.type === 'summary' ? item.totalSales : item.total)}</span>
                                    {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === item.id && (
                                <div className="p-4 border-t bg-white">
                                    {item.type === 'summary' ? (
                                        // Summary View (Aggregated Items)
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase border-b pb-2 mb-2">
                                                <span>Product</span>
                                                <div className="flex gap-4">
                                                    <span className="w-16 text-right">Total Kg</span>
                                                    <span className="w-20 text-right">Total ₹</span>
                                                </div>
                                            </div>
                                            {Object.values(item.items).map((prod, idx) => (
                                                <div key={idx} className="flex justify-between text-sm py-1">
                                                    <span className="font-medium text-gray-700">{prod.name}</span>
                                                    <div className="flex gap-4">
                                                        <span className="w-16 text-right text-gray-600">{prod.qty.toFixed(2)}</span>
                                                        <span className="w-20 text-right font-medium text-gray-800">{formatCurrency(prod.total)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Individual Sale View
                                        <>
                                            <div className="space-y-2 mb-4">
                                                {item.items.map((prod, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span>{prod.name}</span>
                                                        <div className="flex gap-4">
                                                            <span className="text-gray-600">{prod.qty} kg</span>
                                                            <span className="font-medium">{formatCurrency(prod.total || (prod.qty * prod.price))}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t text-sm text-gray-600">
                                                <span>Payment: <span className={`font-medium ${item.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{item.paymentStatus}</span></span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Edit Sale"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete Sale"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BillingList;
