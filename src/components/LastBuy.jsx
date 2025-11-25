import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { CheckCircle, XCircle } from 'lucide-react';

const LastBuy = () => {
    const { customers, sales } = useData();
    const [expandedCustomerId, setExpandedCustomerId] = useState(null);

    // Compute last purchase per customer
    const lastPurchases = useMemo(() => {
        const map = {};
        sales.forEach(sale => {
            const custId = sale.customerId;
            const saleDate = new Date(sale.date);
            if (!map[custId] || saleDate > new Date(map[custId].date)) {
                map[custId] = { date: sale.date, items: sale.items };
            }
        });
        return map;
    }, [sales]);

    const today = new Date();

    const getRowStyle = (dateStr) => {
        const diffDays = Math.floor((today - new Date(dateStr)) / (1000 * 60 * 60 * 24));
        return diffDays <= 4 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200';
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800">Customer Last Purchases</h2>
            <div className="grid gap-3">
                {customers.map(c => {
                    const purchase = lastPurchases[c.id];
                    if (!purchase) return null;
                    const rowClass = getRowStyle(purchase.date);
                    const diffDays = Math.floor((today - new Date(purchase.date)) / (1000 * 60 * 60 * 24));
                    return (
                        <div key={c.id} className={`${rowClass} p-4 rounded-lg shadow-sm`}>
                            <button
                                onClick={() => setExpandedCustomerId(expandedCustomerId === c.id ? null : c.id)}
                                className="w-full flex items-center text-left"
                            >
                                <span className={`h-2 w-2 rounded-full mr-2 ${diffDays <= 4 ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                <span className="font-medium text-gray-800 flex-1">{c.name}</span>
                                <span className="text-sm text-gray-600">{new Date(purchase.date).toLocaleDateString()}</span>
                            </button>
                            {expandedCustomerId === c.id && (
                                <div className="mt-3 border-t pt-3">
                                    <h4 className="font-semibold text-gray-700 mb-2">Items Bought</h4>
                                    <ul className="space-y-1">
                                        {purchase.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span>{item.name}</span>
                                                <span>{item.qty} kg</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LastBuy;
