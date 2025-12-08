import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Menu, TrendingDown, TrendingUp } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, businessMode }) => {
    // HomeSnacks navigation items
    const homeSnacksItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
        { id: 'sales', icon: ShoppingCart, label: 'Billing' },
        { id: 'stock', icon: Package, label: 'Stock' },
        { id: 'more', icon: Menu, label: 'More' },
    ];

    // Farm navigation items
    const farmItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
        { id: 'expenses', icon: TrendingDown, label: 'Expenses' },
        { id: 'income', icon: TrendingUp, label: 'Income' },
        { id: 'more', icon: Menu, label: 'More' },
    ];

    const navItems = businessMode === 'farm' ? farmItems : homeSnacksItems;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-50">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center justify-center w-full space-y-1 ${isActive ? 'text-primary-600' : 'text-gray-500'
                            }`}
                    >
                        <Icon size={24} />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;
