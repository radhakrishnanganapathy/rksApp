import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { CheckCircle, XCircle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const LastBuy = ({ onNavigateBack }) => {
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

    const getDaysAgo = (dateStr) => {
        return Math.floor((today - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    };

    const getCardStyle = (daysAgo) => {
        if (daysAgo <= 4) {
            return 'bg-green-50 border-l-4 border-green-500 hover:bg-green-100';
        } else {
            return 'bg-red-50 border-l-4 border-red-500 hover:bg-red-100';
        }
    };

    const getDotColor = (daysAgo) => {
        return daysAgo <= 4 ? 'bg-green-500' : 'bg-red-500';
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Customer Last Purchases</h2>
            </div>

            {/* Legend */}
            <div className="bg-white p-3 rounded-lg shadow-sm flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Bought within 4 days</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">No purchase for 4+ days</span>
                </div>
            </div>

            <div className="grid gap-3">
                {customers.map(c => {
                    const purchase = lastPurchases[c.id];
                    if (!purchase) return null;

                    const daysAgo = getDaysAgo(purchase.date);
                    const isExpanded = expandedCustomerId === c.id;

                    return (
                        <div
                            key={c.id}
                            className={`${getCardStyle(daysAgo)} p-4 rounded-lg shadow-sm transition-all duration-200`}
                        >
                            <button
                                onClick={() => setExpandedCustomerId(isExpanded ? null : c.id)}
                                className="w-full flex items-center text-left"
                            >
                                {/* Status Dot */}
                                <span className={`h-3 w-3 rounded-full mr-3 flex-shrink-0 ${getDotColor(daysAgo)}`}></span>

                                {/* Customer Name */}
                                <span className="font-semibold text-gray-800 flex-1">{c.name}</span>

                                {/* Date and Days Info */}
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="text-right">
                                        <p className="text-gray-700 font-medium">
                                            {new Date(purchase.date).toLocaleDateString()}
                                        </p>
                                        <p className={`text-xs ${daysAgo <= 4 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                                        </p>
                                    </div>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-gray-300">
                                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">Items Purchased</h4>
                                    <div className="space-y-1">
                                        {purchase.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm bg-white bg-opacity-50 p-2 rounded">
                                                <span className="font-medium text-gray-700">{item.name}</span>
                                                <span className="text-gray-600">{item.qty} kg</span>
                                            </div>
                                        ))}
                                    </div>
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
