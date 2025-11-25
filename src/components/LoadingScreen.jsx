import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex flex-col items-center justify-center z-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-6 tracking-wider">RKS</h1>
                <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" />
            </div>
        </div>
    );
};

export default LoadingScreen;
