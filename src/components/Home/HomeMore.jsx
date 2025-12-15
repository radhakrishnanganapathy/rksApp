import React from 'react';
import { TrendingUp, TrendingDown, LayoutDashboard, Wallet } from 'lucide-react';

const HomeMore = ({ onNavigate }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'income', label: 'Income', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { id: 'expenses', label: 'Expenses', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
        { id: 'expense-master', label: 'Expense List', icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'loans', label: 'Loans & EMI', icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="p-4 pb-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Home Menu</h2>
            <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <div className={`p-3 rounded-full ${item.bg}`}>
                            <item.icon size={24} className={item.color} />
                        </div>
                        <span className="font-medium text-gray-700">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HomeMore;
