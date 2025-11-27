import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { Trash2, Edit, ChevronDown, ChevronUp, Search } from 'lucide-react';

const BillingList = ({ onEdit }) => {
    const { sales, customers, deleteSale } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSaleId, setExpandedSaleId] = useState(null);

    const getCustomerName = (id) => {
        const customer = customers.find(c => c.id === id);
        return customer ? customer.name : 'Unknown Customer';
    };

    const filteredSales = sales.filter(sale => {
        const customerName = getCustomerName(sale.customerId).toLowerCase();
        return customerName.includes(searchTerm.toLowerCase());
    });

    const toggleExpand = (id) => {
        setExpandedSaleId(expandedSaleId === id ? null : id);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            deleteSale(id);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Sales List */}
            <div className="space-y-3">
                {filteredSales.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No sales found</div>
                ) : (
                    filteredSales.map(sale => (
                        <div key={sale.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer bg-gray-50"
                                onClick={() => toggleExpand(sale.id)}
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-800">{getCustomerName(sale.customerId)}</h3>
                                    <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-primary-600">{formatCurrency(sale.total)}</span>
                                    {expandedSaleId === sale.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedSaleId === sale.id && (
                                <div className="p-4 border-t">
                                    <div className="space-y-2 mb-4">
                                        {sale.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>{item.name}</span>
                                                <div className="flex gap-4">
                                                    <span className="text-gray-600">{item.qty} kg</span>
                                                    <span className="font-medium">{formatCurrency(item.total || (item.qty * item.price))}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t text-sm text-gray-600">
                                        <span>Payment: <span className={`font-medium ${sale.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{sale.paymentStatus}</span></span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(sale); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit Sale"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(sale.id); }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Delete Sale"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
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
