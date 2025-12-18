import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Sparkles, TrendingDown, Lightbulb, AlertCircle } from 'lucide-react';

const HomeAISuggestions = () => {
    const { homeExpenses, homeIncome } = useData();
    const [suggestions, setSuggestions] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyzeFinances();
    }, [homeExpenses, homeIncome]);

    const analyzeFinances = () => {
        setLoading(true);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter current month data
        const currentMonthExpenses = homeExpenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const currentMonthIncome = homeIncome.filter(i => {
            const d = new Date(i.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalEarned = currentMonthIncome.reduce((sum, i) => sum + Number(i.amount), 0);

        // Category Analysis
        const categoryTotals = {};
        currentMonthExpenses.forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

        // Generate Insights
        const newSuggestions = [];

        // 1. Spending vs Income Health
        if (totalEarned > 0) {
            const spentPercentage = (totalSpent / totalEarned) * 100;
            if (spentPercentage > 80) {
                newSuggestions.push({
                    type: 'warning',
                    icon: <AlertCircle size={20} className="text-red-500" />,
                    title: 'High Spending Alert',
                    message: `You've spent ${spentPercentage.toFixed(0)}% of your income this month. Consider slowing down on non-essential purchases.`
                });
            } else if (spentPercentage < 50) {
                newSuggestions.push({
                    type: 'success',
                    icon: <Sparkles size={20} className="text-green-500" />,
                    title: 'Great Savings Rate!',
                    message: `You've only spent ${spentPercentage.toFixed(0)}% of your income. You're on track to save significantly this month!`
                });
            }
        }

        // 2. Top Category Insight
        if (topCategory) {
            const [catName, catAmount] = topCategory;
            const percentageOfTotal = totalSpent > 0 ? (catAmount / totalSpent) * 100 : 0;

            let tip = '';
            const lowerCat = catName.toLowerCase();
            if (lowerCat.includes('food') || lowerCat.includes('restaurant')) {
                tip = 'Try meal prepping or cooking dinner at home this week to cut costs.';
            } else if (lowerCat.includes('travel') || lowerCat.includes('transport')) {
                tip = 'Look for carpooling options or monthly passes if you commute often.';
            } else if (lowerCat.includes('shopping') || lowerCat.includes('cloth')) {
                tip = 'Wait 24 hours before making non-essential purchases to avoid impulse buying.';
            } else if (lowerCat.includes('entertainment')) {
                tip = 'Look for free local events or have a movie night at home.';
            } else {
                tip = `Review your ${catName} expenses to see if there are any subscriptions or recurring costs you can cancel.`;
            }

            newSuggestions.push({
                type: 'insight',
                icon: <TrendingDown size={20} className="text-blue-500" />,
                title: `Top Expense: ${catName}`,
                message: `You spent ₹${catAmount.toLocaleString()} (${percentageOfTotal.toFixed(0)}% of total) on ${catName}. ${tip}`
            });
        }

        // 3. General "AI" Tip (Randomized)
        const generalTips = [
            "Automate your savings: Set up a recurring transfer to your savings account right after payday.",
            "The 50/30/20 Rule: Aim for 50% needs, 30% wants, and 20% savings.",
            "Track small expenses: Daily coffees or snacks add up quickly over a month.",
            "Review subscriptions: Cancel streaming services or memberships you haven't used in the last month.",
            "Emergency Fund: Aim to save 3-6 months of expenses for unexpected events."
        ];
        const randomTip = generalTips[Math.floor(Math.random() * generalTips.length)];

        newSuggestions.push({
            type: 'tip',
            icon: <Lightbulb size={20} className="text-yellow-500" />,
            title: 'Smart Saving Tip',
            message: randomTip
        });

        setAnalysis({ totalSpent, totalEarned, topCategory });
        setSuggestions(newSuggestions);
        setLoading(false);
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Analyzing finances...</div>;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-100 p-2 rounded-full">
                    <Sparkles size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-800">AI Savings Assistant</h3>
            </div>

            <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                            {suggestion.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">{suggestion.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{suggestion.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {analysis && analysis.totalSpent === 0 && (
                <p className="text-center text-xs text-gray-500 mt-2">
                    Add more expense data to get personalized insights.
                </p>
            )}
        </div>
    );
};

export default HomeAISuggestions;
