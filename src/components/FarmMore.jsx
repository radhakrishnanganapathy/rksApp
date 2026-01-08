import React, { useState, useEffect } from 'react';
import { Sprout, Settings, Clock, List, Scissors, Server, Bell } from 'lucide-react';

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
            color: 'bg-green-600',
        },
        {
            id: 'harvesting',
            title: 'Harvesting',
            description: 'Record harvest data',
            icon: Scissors,
            color: 'bg-green-500',
        },
        {
            id: 'crop-master',
            title: 'Crop Master List',
            description: 'Define crop types & characteristics',
            icon: List,
            color: 'bg-emerald-600',
        },
        {
            id: 'timeline',
            title: 'Timeline',
            description: 'Track crop cultivation tasks',
            icon: Clock,
            color: 'bg-teal-600',
        },
        {
            id: 'farm-categories',
            title: 'Expense Categories',
            description: 'Manage categories & subcategories',
            icon: Settings,
            color: 'bg-lime-600',
        },
        {
            id: 'reminder-settings',
            title: 'Reminders',
            description: 'Set daily data reminders',
            icon: Bell,
            color: 'bg-green-400',
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


        </div>
    );
};

export default FarmMore;
