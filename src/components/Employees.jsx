import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Save, UserPlus, Check, X, Calendar, DollarSign, ArrowLeft, Phone, MapPin, Edit2, Eye, Users, Trash2 } from 'lucide-react';
import { formatCurrency, filterByMonthYear } from '../utils';

const Employees = ({ onNavigateBack }) => {
    const { employees, attendance, addEmployee, updateEmployee, deleteEmployee, markAttendance } = useData();

    // Tab state
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'summary', 'manage'

    // Add/Edit Employee Modal
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [empName, setEmpName] = useState('');
    const [empMobile, setEmpMobile] = useState('');
    const [empArea, setEmpArea] = useState('');
    const [empDailySalary, setEmpDailySalary] = useState('');

    // Employee detail view
    const [viewingEmployee, setViewingEmployee] = useState(null);

    // Attendance states
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingEmployeeId, setPendingEmployeeId] = useState(null);

    // Custom salary entry
    const [customSalaryMode, setCustomSalaryMode] = useState({}); // { employeeId: true/false }
    const [customSalaryAmount, setCustomSalaryAmount] = useState({}); // { employeeId: amount }

    // Holiday feature
    const [isHoliday, setIsHoliday] = useState(false);
    const [showHolidayConfirm, setShowHolidayConfirm] = useState(false);

    // Summary view toggle
    const [summaryView, setSummaryView] = useState('monthly'); // 'daily' or 'monthly'
    const [expandedDates, setExpandedDates] = useState([]); // Array of expanded date strings

    const handleAddEmployee = () => {
        if (!empName) {
            alert('Employee Name is required!');
            return;
        }

        if (editingEmployee) {
            // Build update object with only fields that have values
            const updateData = {
                name: empName
            };

            if (empMobile) updateData.mobile = empMobile;
            if (empArea) updateData.area = empArea;
            if (empDailySalary) updateData.dailySalary = Number(empDailySalary);

            updateEmployee(editingEmployee.id, updateData);
            alert('Employee updated successfully!');
        } else {
            addEmployee({
                name: empName,
                mobile: empMobile || null,
                area: empArea || null,
                dailySalary: Number(empDailySalary) || 0,
                salaryType: 'daily'
            });
            alert('Employee added successfully!');
        }

        resetEmployeeForm();
    };

    const resetEmployeeForm = () => {
        setEmpName('');
        setEmpMobile('');
        setEmpArea('');
        setEmpDailySalary('');
        setShowEmployeeModal(false);
        setEditingEmployee(null);
    };

    const handleEditEmployee = (emp) => {
        setEditingEmployee(emp);
        setEmpName(emp.name);
        setEmpMobile(emp.mobile || '');
        setEmpArea(emp.area || '');
        setEmpDailySalary(emp.dailySalary || '');
        setShowEmployeeModal(true);
    };

    const handleDeleteEmployee = async (emp) => {
        if (window.confirm(`Are you sure you want to delete ${emp.name}?`)) {
            try {
                await deleteEmployee(emp.id);
                alert('Employee deleted successfully!');
            } catch (error) {
                console.error('Error deleting employee:', error);
                alert(`Failed to delete employee: ${error.message}`);
            }
        }
    };

    const getAttendanceForDate = (employeeId, date) => {
        const record = attendance.find(a => String(a.employeeId) === String(employeeId) && a.date === date);
        return record?.status || null;
    };

    const handleAttendanceToggle = (employeeId, currentStatus, employee) => {
        console.log('handleAttendanceToggle called:', { employeeId, currentStatus, selectedDate });

        // Check if custom salary mode is enabled for this employee
        const isCustom = customSalaryMode[employeeId];
        const customAmount = customSalaryAmount[employeeId];

        // If no status (Mark button), Absent, or Holiday, mark as Present
        if (!currentStatus || currentStatus === 'absent' || currentStatus === 'holiday') {
            console.log('Marking as present...');
            if (isCustom && customAmount) {
                // Mark present with custom salary
                console.log('With custom salary:', customAmount);
                markAttendance(employeeId, selectedDate, 'present', Number(customAmount));
            } else {
                // Mark present with regular salary
                console.log('With regular salary');
                markAttendance(employeeId, selectedDate, 'present');
            }
        } else if (currentStatus === 'present') {
            // If Present, show confirmation dialog before marking absent
            console.log('Showing absent confirmation dialog');
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

    const toggleCustomSalary = (employeeId, employee) => {
        setCustomSalaryMode(prev => ({
            ...prev,
            [employeeId]: !prev[employeeId]
        }));
        // Set default to regular salary
        if (!customSalaryAmount[employeeId]) {
            setCustomSalaryAmount(prev => ({
                ...prev,
                [employeeId]: employee.dailySalary
            }));
        }
    };

    // Holiday handlers
    const handleHolidayCheckbox = (checked) => {
        if (checked) {
            setShowHolidayConfirm(true);
        } else {
            setIsHoliday(false);
        }
    };


    const confirmHoliday = async () => {
        try {
            const activeEmployees = employees.filter(e => e.active !== false);
            let successCount = 0;
            let failCount = 0;

            // Process sequentially to avoid race conditions and state overwrites
            for (const emp of activeEmployees) {
                try {
                    await markAttendance(emp.id, selectedDate, 'holiday');
                    successCount++;
                } catch (err) {
                    console.error(`Failed to mark holiday for employee ${emp.id}:`, err);
                    failCount++;
                }
            }

            setShowHolidayConfirm(false);

            if (failCount === 0) {
                setIsHoliday(true);
                alert(`All ${successCount} employees marked as holiday!`);
            } else if (successCount > 0) {
                setIsHoliday(true);
                alert(`${successCount} employees marked as holiday. ${failCount} failed.`);
            } else {
                setIsHoliday(false);
                alert('Failed to mark holiday. Please check your connection and try again.');
            }
        } catch (error) {
            console.error('Error marking holiday:', error);
            setShowHolidayConfirm(false);
            setIsHoliday(false);
            alert('Failed to mark holiday. Please try again.');
        }
    };


    const cancelHoliday = () => {
        setShowHolidayConfirm(false);
        setIsHoliday(false);
    };

    // Toggle expanded date in daily summary
    const toggleDateExpansion = (dateStr) => {
        setExpandedDates(prev =>
            prev.includes(dateStr)
                ? prev.filter(d => d !== dateStr)
                : [...prev, dateStr]
        );
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
            // Sum up custom salaries if any, otherwise use daily salary * present days
            const totalSalary = empAttendance
                .filter(a => a.status === 'present')
                .reduce((sum, a) => sum + (a.customSalary || emp.dailySalary), 0);

            return {
                ...emp,
                presentDays,
                totalSalary
            };
        });

        const totalSalaryGiven = summary.reduce((sum, emp) => sum + emp.totalSalary, 0);

        return { employeeSummary: summary, totalSalaryGiven };
    }, [employees, attendance, selectedMonth, selectedYear]);

    // Daily Summary - Group by date
    const dailySummary = useMemo(() => {
        const filteredAttendance = attendance.filter(a => {
            const date = new Date(a.date);
            return date.getMonth() === parseInt(selectedMonth) && date.getFullYear() === parseInt(selectedYear);
        });

        // Group by date
        const dateGroups = {};
        filteredAttendance.forEach(att => {
            // Use local date for grouping
            const attDate = new Date(att.date);
            const year = attDate.getFullYear();
            const month = String(attDate.getMonth() + 1).padStart(2, '0');
            const day = String(attDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            if (!dateGroups[dateStr]) {
                dateGroups[dateStr] = [];
            }
            if (att.status === 'present') {
                const emp = employees.find(e => String(e.id) === String(att.employeeId));
                if (emp) {
                    dateGroups[dateStr].push({
                        name: emp.name,
                        salary: att.customSalary || emp.dailySalary
                    });
                }
            }
        });

        // Convert to array and calculate totals
        const summary = Object.keys(dateGroups).map(dateStr => {
            const workers = dateGroups[dateStr];
            const totalSalary = workers.reduce((sum, w) => sum + Number(w.salary), 0);
            return {
                date: dateStr,
                totalWorkers: workers.length,
                totalSalary,
                workers
            };
        });

        // Sort by date ascending
        return summary.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [employees, attendance, selectedMonth, selectedYear]);

    // Get daily attendance list
    const dailyAttendanceList = useMemo(() => {
        const dateAttendance = attendance.filter(a => {
            if (!a.date) return false;
            // Parse both dates and compare year-month-day
            const attDate = new Date(a.date);
            const selDate = new Date(selectedDate + 'T00:00:00');

            // Compare using local date components
            const match = attDate.getFullYear() === selDate.getFullYear() &&
                attDate.getMonth() === selDate.getMonth() &&
                attDate.getDate() === selDate.getDate();

            return match;
        });
        console.log('Daily attendance for', selectedDate, ':', dateAttendance.length, 'records');
        const result = employees.filter(e => e.active !== false).map(emp => {
            const record = dateAttendance.find(a => String(a.employeeId) === String(emp.id));
            return {
                ...emp,
                status: record?.status || null,
                customSalary: record?.customSalary || null
            };
        });
        console.log('Daily attendance list:', result.map(e => ({ name: e.name, status: e.status })));
        return result;
    }, [employees, attendance, selectedDate]);


    const presentCount = dailyAttendanceList.filter(e => e.status === 'present').length;

    // Sync holiday checkbox with database state
    useEffect(() => {
        const activeEmployees = employees.filter(e => e.active !== false);
        if (activeEmployees.length === 0) {
            setIsHoliday(false);
            return;
        }

        // Check if ALL active employees have 'holiday' status for selected date
        const dateAttendance = attendance.filter(a => {
            if (!a.date) return false;
            const attDate = new Date(a.date);
            const selDate = new Date(selectedDate + 'T00:00:00');
            return attDate.getFullYear() === selDate.getFullYear() &&
                attDate.getMonth() === selDate.getMonth() &&
                attDate.getDate() === selDate.getDate();
        });

        const allHoliday = activeEmployees.every(emp => {
            const record = dateAttendance.find(a => String(a.employeeId) === String(emp.id));
            return record?.status === 'holiday';
        });

        setIsHoliday(allHoliday);
    }, [selectedDate, attendance, employees]);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Employees</h2>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-lg text-sm">
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'attendance' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('attendance')}
                >
                    Daily Attendance
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'summary' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('summary')}
                >
                    Summary
                </button>
                <button
                    className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('manage')}
                >
                    <Users size={16} className="inline mr-1" />
                    Manage
                </button>
            </div>

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
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
                        <div className="mt-3 pt-3 border-t">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isHoliday}
                                    onChange={(e) => handleHolidayCheckbox(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Mark as Holiday</span>
                            </label>
                        </div>
                    </div>

                    {/* Employee List with Attendance */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="divide-y">
                            {dailyAttendanceList.map((emp) => (
                                <div key={emp.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{emp.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {customSalaryMode[emp.id]
                                                    ? `Custom: ${formatCurrency(customSalaryAmount[emp.id] || emp.dailySalary)}/day`
                                                    : `${formatCurrency(emp.dailySalary)}/day`
                                                }
                                            </p>
                                            {emp.mobile && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone size={10} /> {emp.mobile}
                                                </p>
                                            )}
                                            {emp.area && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin size={10} /> {emp.area}
                                                </p>
                                            )}
                                            {emp.status === 'present' && emp.customSalary && (
                                                <p className="text-xs text-purple-600">
                                                    ✨ Custom salary: {formatCurrency(emp.customSalary)}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAttendanceToggle(emp.id, emp.status, emp)}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${emp.status === 'present'
                                                ? 'bg-green-100 text-green-700'
                                                : emp.status === 'absent'
                                                    ? 'bg-red-100 text-red-700'
                                                    : emp.status === 'holiday'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {emp.status === 'present' ? (
                                                <><Check size={16} /> Present</>
                                            ) : emp.status === 'absent' ? (
                                                <><X size={16} /> Absent</>
                                            ) : emp.status === 'holiday' ? (
                                                <><Calendar size={16} /> Holiday</>
                                            ) : (
                                                'Mark'
                                            )}
                                        </button>
                                    </div>

                                    {/* Custom Salary Option */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customSalaryMode[emp.id] || false}
                                                onChange={() => toggleCustomSalary(emp.id, emp)}
                                                className="rounded"
                                            />
                                            <span className="text-gray-600">Custom salary (overtime/half-day)</span>
                                        </label>
                                    </div>

                                    {customSalaryMode[emp.id] && (
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                type="number"
                                                value={customSalaryAmount[emp.id] || ''}
                                                onChange={(e) => setCustomSalaryAmount(prev => ({
                                                    ...prev,
                                                    [emp.id]: e.target.value
                                                }))}
                                                className="flex-1 border rounded p-2 text-sm"
                                                placeholder="Enter custom amount"
                                            />
                                            <button
                                                onClick={() => {
                                                    const amount = customSalaryAmount[emp.id];
                                                    if (amount && !emp.status) {
                                                        handleAttendanceToggle(emp.id, emp.status, emp);
                                                    } else if (amount && emp.status === 'present') {
                                                        // Update existing attendance with new custom salary
                                                        markAttendance(emp.id, selectedDate, 'present', Number(amount));
                                                        alert('Custom salary updated!');
                                                    } else {
                                                        alert('Please enter a valid amount');
                                                    }
                                                }}
                                                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
                <>
                    {/* Summary View Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-lg text-sm">
                        <button
                            className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors ${summaryView === 'daily' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
                            onClick={() => setSummaryView('daily')}
                        >
                            Daily Summary
                        </button>
                        <button
                            className={`flex-1 py-2 px-2 font-medium rounded-md transition-colors ${summaryView === 'monthly' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
                            onClick={() => setSummaryView('monthly')}
                        >
                            Monthly Summary
                        </button>
                    </div>

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


                    {/* Daily Summary View */}
                    {summaryView === 'daily' && (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-3 bg-gray-50 border-b">
                                <h3 className="font-semibold text-gray-700">Daily Summary</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2 text-right">Total Workers</th>
                                            <th className="px-4 py-2 text-right">Salary Provided</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {dailySummary.length === 0 ? (
                                            <tr><td colSpan="3" className="p-4 text-center text-gray-500">No attendance data</td></tr>
                                        ) : (
                                            dailySummary.map((day) => {
                                                const date = new Date(day.date);
                                                const dayNum = String(date.getDate()).padStart(2, '0');
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const formattedDate = `${dayNum}/${month}`;
                                                const isExpanded = expandedDates.includes(day.date);

                                                return (
                                                    <React.Fragment key={day.date}>
                                                        <tr
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => toggleDateExpansion(day.date)}
                                                        >
                                                            <td className="px-4 py-3 font-medium text-gray-800">{formattedDate}</td>
                                                            <td className="px-4 py-3 text-right text-gray-600">{day.totalWorkers}</td>
                                                            <td className="px-4 py-3 text-right font-semibold text-primary-600">
                                                                {formatCurrency(day.totalSalary)}
                                                            </td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr>
                                                                <td colSpan="3" className="px-4 py-3 bg-gray-50">
                                                                    <div className="text-xs font-semibold text-gray-600 mb-2">Present Employees:</div>
                                                                    <div className="space-y-1">
                                                                        {day.workers.map((worker, idx) => (
                                                                            <div key={idx} className="flex justify-between text-sm">
                                                                                <span className="text-gray-700">• {worker.name}</span>
                                                                                <span className="text-gray-600">{formatCurrency(worker.salary)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Monthly Summary View */}
                    {summaryView === 'monthly' && (
                        <>
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
                </>
            )}

            {/* Manage Employees Tab */}
            {activeTab === 'manage' && (
                <>
                    <button
                        onClick={() => setShowEmployeeModal(true)}
                        className="w-full bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium"
                    >
                        <UserPlus size={20} /> Add New Employee
                    </button>

                    {/* Employee List */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">Employee List</h3>
                        </div>
                        <div className="divide-y">
                            {employees.filter(e => e.active !== false).map((emp) => (
                                <div key={emp.id} className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{emp.name}</p>
                                            <p className="text-sm text-gray-600">{formatCurrency(emp.dailySalary)}/day</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setViewingEmployee(emp)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEditEmployee(emp)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                title="Edit Employee"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(emp)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Delete Employee"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Add/Edit Employee Modal */}
            {showEmployeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">
                            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={empName}
                                    onChange={(e) => setEmpName(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Employee Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mobile No (Optional)</label>
                                <input
                                    type="tel"
                                    value={empMobile}
                                    onChange={(e) => setEmpMobile(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Area (Optional)</label>
                                <input
                                    type="text"
                                    value={empArea}
                                    onChange={(e) => setEmpArea(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Area/Location"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Salary per Day *</label>
                                <input
                                    type="number"
                                    value={empDailySalary}
                                    onChange={(e) => setEmpDailySalary(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Daily Salary Amount"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={resetEmployeeForm}
                                    className="flex-1 py-2 border rounded text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddEmployee}
                                    className="flex-1 py-2 bg-primary-600 text-white rounded flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> {editingEmployee ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Detail View Modal */}
            {viewingEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Employee Details</h3>
                            <button
                                onClick={() => setViewingEmployee(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Name</p>
                                <p className="font-semibold text-gray-800">{viewingEmployee.name}</p>
                            </div>
                            {viewingEmployee.mobile && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                        <Phone size={12} /> Mobile No
                                    </p>
                                    <p className="text-gray-800">{viewingEmployee.mobile}</p>
                                </div>
                            )}
                            {viewingEmployee.area && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                        <MapPin size={12} /> Area
                                    </p>
                                    <p className="text-gray-800">{viewingEmployee.area}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                    <DollarSign size={12} /> Daily Salary
                                </p>
                                <p className="font-bold text-primary-600 text-lg">
                                    {formatCurrency(viewingEmployee.dailySalary)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewingEmployee(null)}
                            className="w-full mt-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                        >
                            Close
                        </button>
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

            {/* Holiday Confirmation Dialog */}
            {showHolidayConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Mark as Holiday</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to mark today as a holiday for all employees?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={cancelHoliday}
                                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmHoliday}
                                className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                            >
                                <Calendar size={16} /> Confirm Holiday
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
