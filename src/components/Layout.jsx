import React from 'react';
import BottomNav from './BottomNav';

const Layout = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 for bottom nav space */}
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-lg overflow-hidden relative">
                {/* Top Bar - Optional */}
                <div className="bg-primary-600 text-white p-4 sticky top-0 z-40">
                    <h1 className="text-lg font-bold">RKS Business</h1>
                </div>

                <div className="p-4">
                    {children}
                </div>

                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </main>
        </div>
    );
};

export default Layout;
