import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

const FarmDashboard = () => {
    const { farmCrops, farmExpenses, farmIncome } = useData();

    // Get active crops only
    const activeCrops = farmCrops?.filter(crop => crop.cropStatus === 'active') || [];

    // Calculate total investment (expenses) for active crops
    const getTotalInvestment = () => {
        return farmExpenses
            ?.filter(expense => {
                const crop = activeCrops.find(c => c.id === expense.cropId);
                return crop !== undefined;
            })
            .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;
    };

    // Calculate total income for active crops
    const getTotalIncome = () => {
        return farmIncome
            ?.filter(income => {
                const crop = activeCrops.find(c => c.id === income.cropId);
                return crop !== undefined;
            })
            .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0) || 0;
    };

    // Calculate investment for a specific crop
    const getCropInvestment = (cropId) => {
        return farmExpenses
            ?.filter(expense => expense.cropId === cropId)
            .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;
    };

    // Calculate income for a specific crop
    const getCropIncome = (cropId) => {
        return farmIncome
            ?.filter(income => income.cropId === cropId)
            .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0) || 0;
    };

    // Calculate profit for a specific crop
    const getCropProfit = (cropId) => {
        return getCropIncome(cropId) - getCropInvestment(cropId);
    };

    const totalInvestment = getTotalInvestment();
    const totalIncome = getTotalIncome();
    const totalProfit = totalIncome - totalInvestment;

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="pb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Farm Dashboard</h2>

            {/* Overall Summary Cards - 3 Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {/* Total Investment */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <DollarSign size={18} className="text-white" />
                        </div>
                        <h3 className="text-xs font-semibold text-blue-800">Investment</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(totalInvestment)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Total Expenses</p>
                </div>

                {/* Total Income */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400 rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                        <h3 className="text-xs font-semibold text-purple-800">Income</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(totalIncome)}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">Total Revenue</p>
                </div>

                {/* Total Profit */}
                <div className={`border-2 rounded-xl p-4 shadow-md ${totalProfit >= 0
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-400'
                    : 'bg-gradient-to-br from-red-50 to-red-100 border-red-400'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                            {totalProfit >= 0 ? (
                                <TrendingUp size={18} className="text-white" />
                            ) : (
                                <TrendingDown size={18} className="text-white" />
                            )}
                        </div>
                        <h3 className={`text-xs font-semibold ${totalProfit >= 0 ? 'text-green-800' : 'text-red-800'
                            }`}>
                            Profit
                        </h3>
                    </div>
                    <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-900' : 'text-red-900'
                        }`}>
                        {formatCurrency(totalProfit)}
                    </p>
                    <p className={`text-xs mt-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {totalProfit >= 0 ? 'Net Gain' : 'Net Loss'}
                    </p>
                </div>
            </div>

            {/* Active Crops Section */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Crops</h3>

                {activeCrops.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No active crops. Add crops to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeCrops.map(crop => {
                            const investment = getCropInvestment(crop.id);
                            const income = getCropIncome(crop.id);
                            const profit = getCropProfit(crop.id);

                            return (
                                <div
                                    key={crop.id}
                                    className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                                >
                                    {/* Crop Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-lg font-bold text-green-600">
                                            {crop.cropName}
                                        </h4>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Calendar size={14} />
                                            <span>
                                                Due: {new Date(crop.estimatedEndingDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Crop Details */}
                                    <div className="text-sm text-gray-600 mb-3">
                                        <span className="font-medium">{crop.cropType}</span>
                                        {' • '}
                                        <span>{crop.acresUsed} acres</span>
                                        {' • '}
                                        <span>Started: {new Date(crop.startingDate).toLocaleDateString()}</span>
                                    </div>

                                    {/* Investment, Income & Profit - 3 Columns */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Investment */}
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-3">
                                            <p className="text-xs text-blue-700 font-semibold mb-1">Investment</p>
                                            <p className="text-base font-bold text-blue-900">
                                                {formatCurrency(investment)}
                                            </p>
                                        </div>

                                        {/* Income */}
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-3">
                                            <p className="text-xs text-purple-700 font-semibold mb-1">Income</p>
                                            <p className="text-base font-bold text-purple-900">
                                                {formatCurrency(income)}
                                            </p>
                                        </div>

                                        {/* Profit */}
                                        <div className={`border rounded-lg p-3 ${profit >= 0
                                                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                                                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                                            }`}>
                                            <p className={`text-xs font-semibold mb-1 ${profit >= 0 ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                Profit
                                            </p>
                                            <p className={`text-base font-bold ${profit >= 0 ? 'text-green-900' : 'text-red-900'
                                                }`}>
                                                {formatCurrency(profit)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmDashboard;
