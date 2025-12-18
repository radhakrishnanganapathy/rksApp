import React, { useState, useEffect } from 'react';
import { Server, Download } from 'lucide-react';

const DbUsageCard = () => {
    const [dbUsage, setDbUsage] = useState(null);
    const [isDumping, setIsDumping] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

    useEffect(() => {
        fetch(`${API_URL}/db-usage`)
            .then(res => res.json())
            .then(data => setDbUsage(data))
            .catch(err => console.error('Error fetching DB usage:', err));
    }, []);

    const handleDumpDb = async () => {
        if (window.confirm('Are you sure you want to dump the database? This will download a SQL file with all table schemas and data.')) {
            setIsDumping(true);
            try {
                const response = await fetch(`${API_URL}/db-dump`, {
                    method: 'POST',
                });

                if (response.ok) {
                    // Create a blob from the response
                    const blob = await response.blob();
                    // Create a link element
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;

                    // Get filename from header or default
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = 'backup.sql';
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                        if (filenameMatch && filenameMatch.length === 2)
                            filename = filenameMatch[1];
                    } else {
                        // Fallback filename generation
                        const date = new Date();
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        filename = `${year}${month}${day}.sql`;
                    }

                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();

                    // Cleanup
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    alert('Database dump started!');
                } else {
                    const data = await response.json();
                    alert(`Failed to dump database: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error dumping database:', error);
                alert('An error occurred while dumping the database.');
            } finally {
                setIsDumping(false);
            }
        }
    };

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
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">{dbUsage.percentage}% Used</p>
                    <button
                        onClick={handleDumpDb}
                        disabled={isDumping}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                        <Download size={14} />
                        {isDumping ? 'Dumping...' : 'Dump DB'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DbUsageCard;
