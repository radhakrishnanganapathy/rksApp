import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Save, UserPlus, Check, X, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { formatCurrency, filterByMonthYear } from '../utils';

const Employees = ({ onNavigateBack }) => {
    const { employees, attendance, addEmployee, markAttendance } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [dailySalary, setDailySalary] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('attendance'); // 'attendance' or 'summary'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingEmployeeId, setPendingEmployeeId] = useState(null);

    const handleAddEmployee = () => {
        if (!name || !dailySalary) return;
        addEmployee({ name, dailySalary: Number(dailySalary), salaryType: 'daily' });
        setName('');
        setDailySalary('');
        setShowAddModal(false);
    };

    const getAttendanceForDate = (employeeId, date) => {
        const record = attendance.find(a => String(a.employeeId) === String(employeeId) && a.date === date);
        return record?.status || null;
    };

    const handleAttendanceToggle = (employeeId, currentStatus) => {
        // If no status (Mark button) or Absent, mark as Present immediately
        if (!currentStatus || currentStatus === 'absent') {
            markAttendance(employeeId, selectedDate, 'present');
        } else if (currentStatus === 'present') {
            // If Present, show confirmation dialog before marking absent
            setPendingEmployeeId(employeeId);
            setShowConfirmDialog(true);
        }
    };

    const confirmMarkAbsent = () => {
        if (pendingEmployeeId) {
            markAttendance(pendingEmployeeId, selectedDate, 'absent');
        }
        setShowConfirmDialog(false);
        setPendingEmployeeId(null);
    };

    const cancelMarkAbsent = () => {
        setShowConfirmDialog(false);
        setPendingEmployeeId(null);
    };

    // Calculate summary statistics
    const monthlySummary = useMemo(() => {
        const filteredAttendance = attendance.filter(a => {
            const date = new Date(a.date);
            return date.getMonth() === parseInt(selectedMonth) && date.getFullYear() === parseInt(selectedYear);
        });

        const summary = employees.filter(e => e.active).map(emp => {
            const empAttendance = filteredAttendance.filter(a => String(a.employeeId) === String(emp.id));
            const presentDays = empAttendance.filter(a => a.status === 'present').length;
            const totalSalary = presentDays * emp.dailySalary;

            return {
                ...emp,
                presentDays,
                totalSalary
            };
        });

        const totalSalaryGiven = summary.reduce((sum, emp) => sum + emp.totalSalary, 0);

        return { employeeSummary: summary, totalSalaryGiven };
    }, [employees, attendance, selectedMonth, selectedYear]);

    // Get daily attendance list
    const dailyAttendanceList = useMemo(() => {
        const dateAttendance = attendance.filter(a => {
            // Extract just the date part from the ISO timestamp (YYYY-MM-DD)
            const attendanceDate = a.date ? a.date.split('T')[0] : null;
            return attendanceDate === selectedDate;
        });
        return employees.filter(e => e.active !== false).map(emp => {
            const record = dateAttendance.find(a => String(a.employeeId) === String(emp.id));
            return {
                ...emp,
                status: record?.status || null
            };
        });
    }, [employees, attendance, selectedDate]);

    const presentCount = dailyAttendanceList.filter(e => e.status === 'present').length;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Employees</h2>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
                >
                    <UserPlus size={16} /> Add
                </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md ${viewMode === 'attendance' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
                    onClick={() => setViewMode('attendance')}
                >
                    Daily Attendance
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md ${viewMode === 'summary' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
                    onClick={() => setViewMode('summary')}
                >
                    Monthly Summary
                </button>
            </div>

            {viewMode === 'attendance' ? (
                <>
                    {/* Date Selector for Attendance */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <label className="block text-sm font-medium mb-1">Attendance Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                        <div className="mt-2 text-sm text-gray-600">
                            <Calendar size={14} className="inline mr-1" />
                            Present: <span className="font-bold text-green-600">{presentCount}</span> / {dailyAttendanceList.length}
                        </div>
                    </div>

                    {/* Employee List with Attendance */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="divide-y">
                            {dailyAttendanceList.map((emp) => (
                                <div key={emp.id} className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800">{emp.name}</p>
                                            <p className="text-sm text-gray-500">{formatCurrency(emp.dailySalary)}/day</p>
                                        </div>
                                        <button
                                            onClick={() => handleAttendanceToggle(emp.id, emp.status)}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${emp.status === 'present'
                                                ? 'bg-green-100 text-green-700'
                                                : emp.status === 'absent'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {emp.status === 'present' ? (
                                                <><Check size={16} /> Present</>
                                            ) : emp.status === 'absent' ? (
                                                <><X size={16} /> Absent</>
                                            ) : (
                                                'Mark'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Month/Year Filter */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Total Salary Card */}
                    <div className="bg-primary-50 p-4 rounded-xl shadow-sm border border-primary-100">
                        <div className="flex items-center gap-2 text-primary-700 mb-1">
                            <DollarSign size={16} />
                            <span className="text-xs font-semibold uppercase">Total Salary Given</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(monthlySummary.totalSalaryGiven)}</p>
                    </div>

                    {/* Employee Summary */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">Employee Summary</h3>
                        </div>
                        <div className="divide-y">
                            {monthlySummary.employeeSummary.map((emp) => (
                                <div key={emp.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-800">{emp.name}</p>
                                            <p className="text-sm text-gray-500">{formatCurrency(emp.dailySalary)}/day</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-600">{formatCurrency(emp.totalSalary)}</p>
                                            <p className="text-xs text-gray-500">{emp.presentDays} days</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add Employee</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Salary per Day</label>
                                <input
                                    type="number"
                                    value={dailySalary}
                                    onChange={(e) => setDailySalary(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 border rounded text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddEmployee}
                                    className="flex-1 py-2 bg-primary-600 text-white rounded flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Mark Absent Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Confirm Absence</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to mark this employee as absent?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={cancelMarkAbsent}
                                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmMarkAbsent}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                                <X size={16} /> Confirm Absent
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
