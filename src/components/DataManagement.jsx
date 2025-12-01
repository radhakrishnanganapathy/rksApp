import React, { useState } from 'react';
import { ArrowLeft, Download, Upload, Database, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const TABLES = [
    { id: 'sales', label: 'Sales' },
    { id: 'production', label: 'Production' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'employees', label: 'Employees' },
    { id: 'customers', label: 'Customers' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'orders', label: 'Orders' },
    { id: 'raw_material_usage', label: 'Raw Material Usage' },
    { id: 'raw_material_purchases', label: 'Raw Material Purchases' },
    { id: 'raw_material_prices', label: 'Raw Material Prices' }
];

const DataManagement = ({ onNavigateBack }) => {
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // --- CSV Helper Functions ---
    const convertToCSV = (objArray) => {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        if (array.length === 0) return '';

        const header = Object.keys(array[0]).join(',');
        const rows = array.map(obj => Object.values(obj).map(val => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(','));

        return [header, ...rows].join('\n');
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];

        // Remove \r from lines if present
        const cleanLines = lines.map(l => l.replace(/\r$/, ''));
        const headers = cleanLines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        return cleanLines.slice(1).map(line => {
            if (!line.trim()) return null;

            // Regex to match CSV fields including quoted strings with commas
            const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
            const matches = [];
            let match;
            while ((match = regex.exec(line)) !== null) {
                // The first match is the delimiter + value, we want the captured group 1
                // However, the regex above is a bit tricky for global matching in loop
                // Let's use a simpler approach: split by comma but respect quotes
                matches.push(match[1]);
                if (match.index === regex.lastIndex) regex.lastIndex++; // Avoid infinite loop
            }

            // Fallback to simple split if regex fails or for simplicity in this context
            // A simple split is often "good enough" if data doesn't contain commas
            // But let's try a robust split:
            const values = [];
            let inQuote = false;
            let val = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    values.push(val);
                    val = '';
                } else {
                    val += char;
                }
            }
            values.push(val); // Push last value

            const row = {};
            headers.forEach((header, index) => {
                let v = values[index] || '';
                // Clean quotes
                if (v.startsWith('"') && v.endsWith('"')) {
                    v = v.substring(1, v.length - 1).replace(/""/g, '"');
                }
                row[header] = v;
            });
            return row;
        }).filter(r => r !== null);
    };

    // --- Actions ---
    const handleExport = async (tableId, tableName) => {
        setLoading(true);
        setStatus({ type: 'info', message: `Exporting ${tableName}...` });
        try {
            // Fetch raw data from backend to match DB schema
            // We assume the GET endpoints return snake_case keys which match DB columns
            // We need to map tableId to endpoint. 
            // Most endpoints match tableId, but some differ (e.g. raw_material_usage -> raw-material-usage)
            const endpoint = tableId.replace(/_/g, '-');

            const res = await fetch(`${API_URL}/${endpoint}`);
            if (!res.ok) throw new Error('Failed to fetch data');

            const data = await res.json();
            if (data.length === 0) {
                setStatus({ type: 'warning', message: `No data found in ${tableName}` });
                setLoading(false);
                return;
            }

            const csv = convertToCSV(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tableId}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

            setStatus({ type: 'success', message: `Exported ${tableName} successfully!` });
        } catch (error) {
            console.error('Export error:', error);
            setStatus({ type: 'error', message: `Failed to export ${tableName}` });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = (e, tableId, tableName) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setStatus({ type: 'info', message: `Reading ${file.name}...` });

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csvText = event.target.result;
                const data = parseCSV(csvText);

                if (data.length === 0) {
                    throw new Error('No valid data found in CSV');
                }

                setStatus({ type: 'info', message: `Importing ${data.length} records into ${tableName}...` });

                const res = await fetch(`${API_URL}/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: tableId, data })
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Import failed');

                setStatus({ type: 'success', message: `Imported ${tableName}: ${result.message}` });
            } catch (error) {
                console.error('Import error:', error);
                setStatus({ type: 'error', message: `Import failed: ${error.message}` });
            } finally {
                setLoading(false);
                // Reset file input
                e.target.value = null;
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={onNavigateBack} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Database size={24} className="text-blue-600" />
                    Data Management
                </h1>
            </div>

            {/* Status Bar */}
            {status.message && (
                <div className={`p-4 m-4 rounded-lg flex items-center gap-2 ${status.type === 'error' ? 'bg-red-50 text-red-700' :
                        status.type === 'success' ? 'bg-green-50 text-green-700' :
                            status.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-blue-50 text-blue-700'
                    }`}>
                    {status.type === 'error' ? <AlertCircle size={20} /> :
                        status.type === 'success' ? <CheckCircle size={20} /> :
                            loading ? <Loader size={20} className="animate-spin" /> :
                                <FileText size={20} />}
                    <span className="font-medium">{status.message}</span>
                </div>
            )}

            {/* Table List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-4">
                    {TABLES.map((table) => (
                        <div key={table.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                    <Database size={20} />
                                </div>
                                <span className="font-semibold text-gray-800">{table.label}</span>
                            </div>

                            <div className="flex gap-2">
                                {/* Export Button */}
                                <button
                                    onClick={() => handleExport(table.id, table.label)}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                >
                                    <Download size={18} />
                                    <span>Export CSV</span>
                                </button>

                                {/* Import Button (File Input Wrapper) */}
                                <label className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <Upload size={18} />
                                    <span>Import CSV</span>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={(e) => handleImport(e, table.id, table.label)}
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                    <h3 className="font-bold flex items-center gap-2 mb-2">
                        <AlertCircle size={16} /> Important Notes:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                        <li><strong>Export:</strong> Downloads all data as a CSV file.</li>
                        <li><strong>Import:</strong> Uploads a CSV file. Data will be added to the database.</li>
                        <li><strong>Duplicates:</strong> If a record with the same ID already exists, it will be <strong>skipped</strong> (not updated).</li>
                        <li><strong>Format:</strong> Ensure the CSV columns match the Export format exactly.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
