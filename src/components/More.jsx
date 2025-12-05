import React from 'react';
import { Factory, Wallet, Users, UserCircle, BarChart3, PieChart, ShoppingCart, GitCompare, ClipboardList, DollarSign, Tags, Database, Package } from 'lucide-react';

const More = ({ onNavigate }) => {
    const menuItems = [
        { id: 'production', label: 'Production', icon: Factory, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'expenses', label: 'Expenses', icon: Wallet, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'employees', label: 'Employees', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'customers', label: 'Customers', icon: UserCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'products', label: 'Products', icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
        { id: 'stats', label: 'Statistics', icon: PieChart, color: 'text-primary-600', bg: 'bg-primary-50' },
        { id: 'analysis', label: 'Analysis', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'lastbuy', label: 'Last Buy', icon: ShoppingCart, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { id: 'compare', label: 'Compare', icon: GitCompare, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'orders', label: 'Orders', icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'balance', label: 'Balance Amount', icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 'raw-material-prices', label: 'Price List', icon: Tags, color: 'text-teal-600', bg: 'bg-teal-50' },
        { id: 'data-management', label: 'Import / Export', icon: Database, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">More Options</h2>
            <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-3 hover:shadow-md transition-shadow"
                        >
                            <div className={`p-3 rounded-full ${item.bg} ${item.color}`}>
                                <Icon size={24} />
                            </div>
                            <span className="font-medium text-gray-700">{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default More;
