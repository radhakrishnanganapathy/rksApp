import React, { useState, useEffect } from 'react';
import { Server } from 'lucide-react';

const DbUsageCard = () => {
    const [dbUsage, setDbUsage] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

    useEffect(() => {
        fetch(`${API_URL}/db-usage`)
            .then(res => res.json())
            .then(data => setDbUsage(data))
            .catch(err => console.error('Error fetching DB usage:', err));
    }, []);

    if (!dbUsage) return null;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-6 mb-20">
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
    );
};

export default DbUsageCard;
