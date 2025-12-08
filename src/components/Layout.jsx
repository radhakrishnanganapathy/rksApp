import React from 'react';
import BottomNav from './BottomNav';

const Layout = ({ children, activeTab, setActiveTab, businessMode, setBusinessMode }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 for bottom nav space */}
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-lg overflow-hidden relative">
                {/* Top Bar with Tabs */}
                <div className="bg-primary-600 text-white sticky top-0 z-40">
                    <div className="p-4 pb-0">
                        <h1 className="text-lg font-bold">RKS Business</h1>
                    </div>

                    {/* Business Mode Tabs */}
                    <div className="flex border-b border-primary-500">
                        <button
                            onClick={() => setBusinessMode('homesnacks')}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${businessMode === 'homesnacks'
                                    ? 'bg-white text-primary-600 border-b-2 border-white'
                                    : 'text-primary-100 hover:text-white hover:bg-primary-500'
                                }`}
                        >
                            HomeSnacks
                        </button>
                        <button
                            onClick={() => setBusinessMode('farm')}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${businessMode === 'farm'
                                    ? 'bg-white text-primary-600 border-b-2 border-white'
                                    : 'text-primary-100 hover:text-white hover:bg-primary-500'
                                }`}
                        >
                            Farm
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {children}
                </div>

                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} businessMode={businessMode} />
            </main>
        </div>
    );
};

export default Layout;
