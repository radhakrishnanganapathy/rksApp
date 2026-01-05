import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import './LoadingScreen.css';

const LoadingScreen = () => {
    const { summaryStats } = useData();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const stats = [
        { label: 'Production', value: `${(summaryStats?.totalProduction || 0).toFixed(1)} kg` },
        { label: 'Sales', value: `${(summaryStats?.totalSalesKg || 0).toFixed(1)} kg` },
        { label: 'Earned', value: `₹ ${(summaryStats?.totalEarned || 0).toLocaleString('en-IN')}` }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsExiting(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % stats.length);
                setIsExiting(false);
            }, 600);
        }, 2500);

        return () => clearInterval(interval);
    }, [stats.length]);

    const currentStat = stats[currentIndex] || stats[0];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex flex-col items-center justify-center z-50 text-center">
            <div className="w-full px-6">
                <h1 className="text-5xl font-bold text-white mb-12 tracking-wider">RKS</h1>

                <div className="stat-loop-container mx-auto">
                    <div key={currentIndex} className={`stat-item ${isExiting ? 'animate-stat-exit' : 'animate-stat-enter'}`}>
                        <p className="text-white/70 text-sm uppercase tracking-widest mb-2 font-medium">
                            {currentStat.label}
                        </p>
                        <p className="text-white text-5xl font-bold tracking-tight">
                            {currentStat.value}
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex gap-2 justify-center">
                    {stats.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
