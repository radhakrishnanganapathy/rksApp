import React from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';

const FarmIncome = ({ onNavigateBack }) => {
    return (
        <div className="pb-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onNavigateBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Farm Income</h2>
            </div>

            {/* Placeholder Content */}
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
                <div className="bg-green-50 rounded-full p-6 mb-6">
                    <TrendingUp size={48} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Income Tracking</h3>
                <p className="text-gray-600">
                    Track your farm income and revenue streams
                </p>
                <p className="text-gray-500 text-sm mt-2">
                    Coming soon...
                </p>
            </div>
        </div>
    );
};

export default FarmIncome;
