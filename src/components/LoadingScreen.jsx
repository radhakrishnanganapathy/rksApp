import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Timer } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    const { summaryStats, countdowns } = useData();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [countdownIndex, setCountdownIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [isCountdownExiting, setIsCountdownExiting] = useState(false);

    const activeCountdowns = (countdowns || [])
        .map(cd => {
            const diff = new Date(cd.toDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            return { ...cd, daysLeft: days };
        })
        .filter(cd => cd.daysLeft >= 0)
        .sort((a, b) => a.daysLeft - b.daysLeft);

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

    useEffect(() => {
        if (activeCountdowns.length <= 1) return;

        const interval = setInterval(() => {
            setIsCountdownExiting(true);
            setTimeout(() => {
                setCountdownIndex((prev) => (prev + 1) % activeCountdowns.length);
                setIsCountdownExiting(false);
            }, 600);
        }, 4000);

        return () => clearInterval(interval);
    }, [activeCountdowns.length]);

    const currentStat = stats[currentIndex] || stats[0];
    const currentCountdown = activeCountdowns[countdownIndex];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex flex-col items-center justify-center z-50 text-center">
            <div className="w-full px-6">
                <div className="h-24 mb-6 flex flex-col items-center justify-center">
                    {currentCountdown && (
                        <div key={currentCountdown.id} className={`transition-all duration-500 ${isCountdownExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Timer size={14} className="text-white/60" />
                                <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold">
                                    {currentCountdown.title}
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-white text-4xl font-black">
                                    {currentCountdown.daysLeft}
                                </span>
                                <span className="text-white/80 text-sm font-medium uppercase tracking-widest mt-2">
                                    Days Left
                                </span>
                            </div>
                        </div>
                    )}
                </div>

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
