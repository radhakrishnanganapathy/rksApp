import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency, getYearRange } from '../utils';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, ArrowLeft } from 'lucide-react';

const Stats = ({ onNavigateBack }) => {
    const { sales, production, expenses, attendance, employees, customers, stocks, rawMaterialPrices, previousMonthItemStock, previousMonthRawMaterialStock, rawMaterialUsage, products } = useData();
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterType, setFilterType] = useState('month'); // 'month' or 'date'
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [viewType, setViewType] = useState('item-sales'); // 'item-sales', 'customer-sales', 'customer-breakdown', 'item-production-stock', 'raw-material-analysis', 'product-sales-stats'
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(''); // For product sales stats filter
    const [selectedProductCustomer, setSelectedProductCustomer] = useState(''); // For product sales stats customer filter

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
            attendance: filterByDate(attendance),
            rawMaterialUsage: filterByDate(rawMaterialUsage)
        };
    }, [sales, production, expenses, attendance, rawMaterialUsage, selectedMonth, selectedYear, selectedDate, filterType]);

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

    // Item Production vs Sales vs Stock
    const itemProductionStockStats = useMemo(() => {
        const itemData = {};

        // Get production data
        filteredData.production.forEach(prod => {
            if (!itemData[prod.item]) {
                itemData[prod.item] = { production: 0, sales: 0, stock: 0, previousStock: 0 };
            }
            itemData[prod.item].production += Number(prod.qty);
        });

        // Get sales data
        filteredData.sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!itemData[item.name]) {
                    itemData[item.name] = { production: 0, sales: 0, stock: 0, previousStock: 0 };
                }
                itemData[item.name].sales += Number(item.qty);
            });
        });

        // Get previous month stock data
        // We look for stock records for the CURRENT selected month/year, which represents the opening stock (from previous month)
        previousMonthItemStock.forEach(stock => {
            // Check if this stock record belongs to the selected month/year
            if (stock.month === parseInt(selectedMonth) && stock.year === parseInt(selectedYear)) {
                // Find the product name using the ID (assuming stock has itemId)
                // We need to match the item name used in production/sales
                // This might be tricky if IDs are used in stock but names in production/sales
                // Let's try to find the product by ID first
                const product = products.find(p => String(p.id) === String(stock.itemId));
                if (product) {
                    const itemName = product.name;
                    if (!itemData[itemName]) {
                        itemData[itemName] = { production: 0, sales: 0, stock: 0, previousStock: 0 };
                    }
                    itemData[itemName].previousStock += Number(stock.stock);
                }
            }
        });

        // Calculate stock as (production + previousStock) - sales
        Object.keys(itemData).forEach(name => {
            itemData[name].stock = (itemData[name].production + itemData[name].previousStock) - itemData[name].sales;
        });

        return Object.keys(itemData).map(name => ({
            name,
            ...itemData[name]
        })).sort((a, b) => b.production - a.production);
    }, [filteredData, previousMonthItemStock, selectedMonth, selectedYear, products]);

    // Raw Material Analysis
    const rawMaterialStats = useMemo(() => {
        const currentMonth = filterType === 'date'
            ? new Date(selectedDate).getMonth() + 1
            : (selectedMonth === '' ? new Date().getMonth() + 1 : parseInt(selectedMonth) + 1);
        const currentYear = filterType === 'date'
            ? new Date(selectedDate).getFullYear()
            : parseInt(selectedYear);

        return rawMaterialPrices.map(material => {
            // Get purchases this month (from expenses with category 'Raw Material')
            const purchases = filteredData.expenses
                .filter(exp => exp.category === 'Raw Material' && exp.materialName === material.name)
                .reduce((sum, exp) => sum + Number(exp.quantity || 0), 0);

            // Get previous month stock
            const prevStock = previousMonthRawMaterialStock?.find(
                s => s.materialName === material.name &&
                    s.month === currentMonth &&
                    s.year === currentYear
            );
            const previousStock = prevStock ? Number(prevStock.quantity) : 0;

            // Get usage from raw material usage table
            const usage = filteredData.rawMaterialUsage
                .filter(u => u.materialName === material.name)
                .reduce((sum, u) => sum + Number(u.quantityUsed || 0), 0);

            // Calculate current stock: (previous stock + purchases) - usage
            const currentStock = (previousStock + purchases) - usage;

            return {
                name: material.name,
                unit: material.unit,
                purchases,
                previousStock,
                usage,
                currentStock
            };
        }).filter(item =>
            selectedMaterials.length === 0 || selectedMaterials.includes(item.name)
        );
    }, [rawMaterialPrices, filteredData.expenses, filteredData.rawMaterialUsage, previousMonthRawMaterialStock, selectedMaterials, filterType, selectedDate, selectedMonth, selectedYear]);

    // Product Sales Stats - Detailed sales records
    const productSalesStats = useMemo(() => {
        const salesRecords = [];

        filteredData.sales.forEach(sale => {
            const customer = customers.find(c => c.id === sale.customerId);
            const customerName = customer ? customer.name : 'Unknown';

            sale.items.forEach(item => {
                // Filter by selected product and customer if selected
                const productMatch = selectedProduct === '' || item.name === selectedProduct;
                const customerMatch = selectedProductCustomer === '' || customerName === selectedProductCustomer;

                if (productMatch && customerMatch) {
                    salesRecords.push({
                        productName: item.name,
                        saleDate: sale.date,
                        customer: customerName,
                        quantity: Number(item.qty)
                    });
                }
            });
        });

        // Sort by date ascending
        const sortedRecords = salesRecords.sort((a, b) => new Date(a.saleDate) - new Date(b.saleDate));

        // Calculate total quantity
        const totalQuantity = sortedRecords.reduce((sum, record) => sum + record.quantity, 0);

        return { records: sortedRecords, totalQuantity };
    }, [filteredData.sales, customers, selectedProduct, selectedProductCustomer]);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Statistics</h2>
            </div>

            {/* View Type Selector */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select View</label>
                <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    className="w-full border rounded p-2"
                >
                    <option value="item-sales">Item-wise Sales & Earnings</option>
                    <option value="customer-sales">Customer-wise Sales & Earnings</option>
                    <option value="customer-breakdown">Customer Purchase Breakdown</option>
                    <option value="item-production-stock">Item: Production, Sales & Stock</option>
                    <option value="raw-material-analysis">Raw Material Analysis</option>
                    <option value="product-sales-stats">Product Sales Stats</option>
                </select>
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
                                {getYearRange().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
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



            {/* Conditional Content Based on View Type */}
            {viewType === 'item-sales' && (
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
                                            <td className="px-4 py-2 text-right text-gray-600">{Number(item.kg).toFixed(2)} kg</td>
                                            <td className="px-4 py-2 text-right font-bold text-primary-600">{formatCurrency(item.earn)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewType === 'customer-sales' && (
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
                                            <td className="px-4 py-2 text-right text-gray-600">{Number(customer.kg).toFixed(2)} kg</td>
                                            <td className="px-4 py-2 text-right font-bold text-blue-600">{formatCurrency(customer.earn)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewType === 'customer-breakdown' && (
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
                                                    <td className="px-4 py-2 text-right text-gray-600">{Number(item.qty).toFixed(2)} kg</td>
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
            )}

            {viewType === 'item-production-stock' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 bg-purple-50 border-b border-purple-100">
                        <h3 className="font-semibold text-gray-700">Item: Production, Sales & Stock (kg)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2 text-right">Prev Stock</th>
                                    <th className="px-4 py-2 text-right">Production</th>
                                    <th className="px-4 py-2 text-right">Sales</th>
                                    <th className="px-4 py-2 text-right">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {itemProductionStockStats.length === 0 ? (
                                    <tr><td colSpan="5" className="p-4 text-center text-gray-500">No data available</td></tr>
                                ) : (
                                    itemProductionStockStats.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 font-medium text-gray-800">{item.name}</td>
                                            <td className="px-4 py-2 text-right text-gray-600">{Number(item.previousStock).toFixed(2)} kg</td>
                                            <td className="px-4 py-2 text-right text-green-600">{Number(item.production).toFixed(2)} kg</td>
                                            <td className="px-4 py-2 text-right text-blue-600">{Number(item.sales).toFixed(2)} kg</td>
                                            <td className="px-4 py-2 text-right font-bold text-purple-600">{Number(item.stock).toFixed(2)} kg</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewType === 'raw-material-analysis' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 bg-orange-50 border-b border-orange-100">
                        <h3 className="font-semibold text-gray-700">Raw Material Analysis</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Material Selection Dropdown with Tags */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Filter Materials (Optional)</label>
                            <select
                                value=""
                                onChange={(e) => {
                                    const materialName = e.target.value;
                                    if (materialName && !selectedMaterials.includes(materialName)) {
                                        setSelectedMaterials([...selectedMaterials, materialName]);
                                    }
                                }}
                                className="w-full border rounded p-2"
                            >
                                <option value="">Select material to add...</option>
                                {rawMaterialPrices.map((material) => (
                                    <option
                                        key={material.id}
                                        value={material.name}
                                        disabled={selectedMaterials.includes(material.name)}
                                    >
                                        {material.name}
                                    </option>
                                ))}
                            </select>

                            {/* Selected Materials as Tags */}
                            {selectedMaterials.length > 0 && (
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMaterials.map((materialName) => (
                                            <div
                                                key={materialName}
                                                className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                                            >
                                                <span>{materialName}</span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedMaterials(selectedMaterials.filter(m => m !== materialName));
                                                    }}
                                                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                                                    title="Remove"
                                                >
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSelectedMaterials([])}
                                        className="text-xs text-blue-600 hover:underline mt-2"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Material Stats Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">Material</th>
                                        <th className="px-4 py-2 text-right">Previous Stock</th>
                                        <th className="px-4 py-2 text-right">Purchased</th>
                                        <th className="px-4 py-2 text-right">Usage</th>
                                        <th className="px-4 py-2 text-right">Current Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {rawMaterialStats.length === 0 ? (
                                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">No materials to display</td></tr>
                                    ) : (
                                        rawMaterialStats.map((material, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 font-medium text-gray-800">{material.name}</td>
                                                <td className="px-4 py-2 text-right text-gray-600">{Number(material.previousStock).toFixed(2)} {material.unit}</td>
                                                <td className="px-4 py-2 text-right text-green-600">{Number(material.purchases).toFixed(2)} {material.unit}</td>
                                                <td className="px-4 py-2 text-right text-red-600">{Number(material.usage).toFixed(2)} {material.unit}</td>
                                                <td className="px-4 py-2 text-right font-bold text-orange-600">{Number(material.currentStock).toFixed(2)} {material.unit}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {viewType === 'product-sales-stats' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 bg-indigo-50 border-b border-indigo-100">
                        <h3 className="font-semibold text-gray-700">Product Sales Stats</h3>
                    </div>

                    {/* Filters */}
                    <div className="p-4 border-b space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-2">Filter by Product (Optional)</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full border rounded p-2"
                            >
                                <option value="">All Products</option>
                                {products.filter(p => p.active).map((product) => (
                                    <option key={product.id} value={product.name}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Filter by Customer (Optional)</label>
                            <select
                                value={selectedProductCustomer}
                                onChange={(e) => setSelectedProductCustomer(e.target.value)}
                                className="w-full border rounded p-2"
                            >
                                <option value="">All Customers</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.name}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Product Name</th>
                                    <th className="px-4 py-2">Sale Date</th>
                                    <th className="px-4 py-2">Customer</th>
                                    <th className="px-4 py-2 text-right">Quantity (kg)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {productSalesStats.records.length === 0 ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-gray-500">No sales data</td></tr>
                                ) : (
                                    <>
                                        {productSalesStats.records.map((record, idx) => {
                                            const date = new Date(record.saleDate);
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const formattedDate = `${day}/${month}`;

                                            return (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium text-gray-800">{record.productName}</td>
                                                    <td className="px-4 py-2 text-gray-600">{formattedDate}</td>
                                                    <td className="px-4 py-2 text-gray-600">{record.customer}</td>
                                                    <td className="px-4 py-2 text-right font-semibold text-indigo-600">
                                                        {Number(record.quantity).toFixed(2)} kg
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {/* Total Row */}
                                        <tr className="bg-indigo-50 font-bold">
                                            <td colSpan="3" className="px-4 py-3 text-right text-gray-800">Total Quantity:</td>
                                            <td className="px-4 py-3 text-right text-indigo-700 text-lg">
                                                {Number(productSalesStats.totalQuantity).toFixed(2)} kg
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stats;
