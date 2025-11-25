import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { DollarSign, Save, CheckCircle } from 'lucide-react';

const BalanceAmount = () => {
    const { sales, orders, customers, updateSaleAmountReceived, updateOrderAmountReceived } = useData();

    const [amountInputs, setAmountInputs] = useState({});

    // Get all unpaid sales and orders
    const unpaidSales = useMemo(() =>
        sales.filter(sale => sale.paymentStatus === 'not_paid'),
        [sales]
    );

    const unpaidOrders = useMemo(() =>
        orders.filter(order => order.paymentStatus === 'not_paid'),
        [orders]
    );

    // Group by customer and calculate total balance per customer
    const customerBalances = useMemo(() => {
        const grouped = {};

        // Process sales
        unpaidSales.forEach(sale => {
            if (!grouped[sale.customerId]) {
                grouped[sale.customerId] = {
                    customerId: sale.customerId,
                    totalBalance: 0,
                    items: []
                };
            }
            const balance = sale.total - (sale.amountReceived || 0);
            grouped[sale.customerId].totalBalance += balance;
            grouped[sale.customerId].items.push({ ...sale, type: 'sale', balance });
        });

        // Process orders
        unpaidOrders.forEach(order => {
            if (!grouped[order.customerId]) {
                grouped[order.customerId] = {
                    customerId: order.customerId,
                    totalBalance: 0,
                    items: []
                };
            }
            const balance = order.total - (order.amountReceived || 0);
            grouped[order.customerId].totalBalance += balance;
            grouped[order.customerId].items.push({ ...order, type: 'order', balance });
        });

        return Object.values(grouped);
    }, [unpaidSales, unpaidOrders]);

    // Calculate total balance across all customers
    const totalBalance = customerBalances.reduce((sum, customer) => sum + customer.totalBalance, 0);

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown';
    };

    const handleAmountChange = (customerId, value) => {
        setAmountInputs({
            ...amountInputs,
            [customerId]: value
        });
    };

    const handleSave = (customerData) => {
        const amountReceived = Number(amountInputs[customerData.customerId] || 0);

        if (amountReceived <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        let remainingAmount = amountReceived;

        // Distribute the amount across unpaid items for this customer
        customerData.items.forEach(item => {
            if (remainingAmount <= 0) return;

            const itemBalance = item.balance;
            const amountToApply = Math.min(remainingAmount, itemBalance);
            const newTotalReceived = (item.amountReceived || 0) + amountToApply;

            if (item.type === 'sale') {
                updateSaleAmountReceived(item.id, newTotalReceived);
            } else {
                updateOrderAmountReceived(item.id, newTotalReceived);
            }

            remainingAmount -= amountToApply;
        });

        // Clear input
        const newInputs = { ...amountInputs };
        delete newInputs[customerData.customerId];
        setAmountInputs(newInputs);

        alert('Amount saved and distributed!');
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign size={24} />
                Balance Amount
            </h2>

            {/* Total Balance Card */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl shadow-sm border border-red-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase text-red-700 mb-1">Total Balance Remaining</p>
                        <p className="text-3xl font-bold text-gray-800">₹{totalBalance.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 mt-1">{customerBalances.length} customers with unpaid bills</p>
                    </div>
                    <DollarSign size={48} className="text-red-300" />
                </div>
            </div>

            {/* Customer Balance List */}
            <div className="space-y-3">
                {customerBalances.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                        <CheckCircle size={48} className="mx-auto text-green-300 mb-2" />
                        <p className="text-gray-500">All bills are paid!</p>
                    </div>
                ) : (
                    customerBalances.map((customerData) => {
                        return (
                            <div key={customerData.customerId} className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="space-y-3">
                                    {/* Customer Name */}
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-800 text-lg">{getCustomerName(customerData.customerId)}</p>
                                        <span className="text-xs text-gray-500">{customerData.items.length} unpaid bill(s)</span>
                                    </div>

                                    {/* Balance Amount */}
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                        <p className="text-xs text-red-700 font-semibold mb-1">Total Balance Amount</p>
                                        <p className="text-2xl font-bold text-red-600">₹{customerData.totalBalance.toFixed(2)}</p>
                                    </div>

                                    {/* Amount Received Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount Received</label>
                                        <input
                                            type="number"
                                            value={amountInputs[customerData.customerId] || ''}
                                            onChange={(e) => handleAmountChange(customerData.customerId, e.target.value)}
                                            className="w-full border rounded-lg p-3 text-right text-lg"
                                            placeholder="₹ 0.00"
                                            min="0"
                                            max={customerData.totalBalance}
                                        />
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        onClick={() => handleSave(customerData)}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        <Save size={18} />
                                        Save Amount
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BalanceAmount;
