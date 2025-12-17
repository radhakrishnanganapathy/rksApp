import React, { useState, useRef } from 'react';
import BottomNav from './BottomNav';
import { MoreVertical, Download, Upload, Database } from 'lucide-react';

const Layout = ({ children, activeTab, setActiveTab, businessMode, setBusinessMode }) => {
    const [showMenu, setShowMenu] = useState(false);
    const fileInputRef = useRef(null);
    const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');

    const handleExport = () => {
        window.location.href = `${API_URL}/api/backup/export`;
        setShowMenu(false);
    };

    const handleDump = () => {
        window.location.href = `${API_URL}/api/backup/dump`;
        setShowMenu(false);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
        setShowMenu(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                const res = await fetch(`${API_URL}/api/backup/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonData)
                });
                const result = await res.json();
                alert(result.message || 'Import successful');
                window.location.reload(); // Reload to show new data
            } catch (err) {
                console.error('Import Error:', err);
                alert('Import failed: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 for bottom nav space */}
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-lg overflow-hidden relative">
                {/* Top Bar with Tabs */}
                <div className="bg-primary-600 text-white sticky top-0 z-40">
                    <div className="p-4 pb-0 flex justify-between items-center">
                        <h1 className="text-lg font-bold">RKS Business</h1>

                        {/* Backup/Restore Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 rounded-full hover:bg-primary-500 transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-gray-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                        <button onClick={handleExport} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors">
                                            <Download size={16} className="text-blue-500" />
                                            <div>
                                                <span className="block font-medium text-gray-800">Export Data</span>
                                                <span className="block text-xs text-gray-400">Download JSON backup</span>
                                            </div>
                                        </button>
                                        <button onClick={handleImportClick} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors border-t border-gray-50">
                                            <Upload size={16} className="text-green-500" />
                                            <div>
                                                <span className="block font-medium text-gray-800">Import Data</span>
                                                <span className="block text-xs text-gray-400">Restore from JSON</span>
                                            </div>
                                        </button>
                                        <button onClick={handleDump} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors border-t border-gray-50">
                                            <Database size={16} className="text-purple-500" />
                                            <div>
                                                <span className="block font-medium text-gray-800">Dump Database</span>
                                                <span className="block text-xs text-gray-400">Full SQL Backup (Create+Insert)</span>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".json"
                    />

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
                        <button
                            onClick={() => setBusinessMode('home')}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${businessMode === 'home'
                                ? 'bg-white text-primary-600 border-b-2 border-white'
                                : 'text-primary-100 hover:text-white hover:bg-primary-500'
                                }`}
                        >
                            Home
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
