import React, { useState, useEffect } from 'react';
import { Sprout, Settings, Clock, List, Scissors, Server } from 'lucide-react';

const FarmMore = ({ onNavigate }) => {
    const [dbUsage, setDbUsage] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

    useEffect(() => {
        fetch(`${API_URL}/db-usage`)
            .then(res => res.json())
            .then(data => setDbUsage(data))
            .catch(err => console.error('Error fetching DB usage:', err));
    }, []);

    const menuItems = [
        {
            id: 'cultivation',
            title: 'Cultivation',
            description: 'Manage your crops',
            icon: Sprout,
            color: 'bg-green-500',
        },
        {
            id: 'harvesting',
            title: 'Harvesting',
            description: 'Record harvest data',
            icon: Scissors,
            color: 'bg-amber-500',
        },
        {
            id: 'crop-master',
            title: 'Crop Master List',
            description: 'Define crop types & characteristics',
            icon: List,
            color: 'bg-teal-500',
        },
        {
            id: 'timeline',
            title: 'Timeline',
            description: 'Track crop cultivation tasks',
            icon: Clock,
            color: 'bg-orange-500',
        },
        {
            id: 'farm-categories',
            title: 'Expense Categories',
            description: 'Manage categories & subcategories',
            icon: Settings,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div className="pb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Farm Settings</h2>

            <div className="grid gap-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-left"
                        >
                            <div className={`${item.color} p-3 rounded-lg text-white`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* DB Usage Stats */}
            {dbUsage && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Server size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Database Storage</h3>
                            <p className="text-xs text-gray-500">Render Free Tier Limit</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{dbUsage.sizeMB} MB Used</span>
                            <span className="text-gray-500">of {dbUsage.limitMB} MB</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${Number(dbUsage.percentage) > 90 ? 'bg-red-500' : Number(dbUsage.percentage) > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(dbUsage.percentage, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-right text-gray-500">{dbUsage.percentage}% Used</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmMore;
