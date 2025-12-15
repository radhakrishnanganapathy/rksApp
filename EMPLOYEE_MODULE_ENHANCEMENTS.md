# Employee Module Enhancements

## Overview
This document outlines the enhancements needed for the Employees module.

## Changes Required

### 1. Holiday Checkbox Feature (Attendance Tab)
**Location:** Attendance tab, near the date selector

**Functionality:**
- Add a checkbox labeled "Holiday"
- When checked, show an alert/confirmation dialog: "Are you sure you want to mark today as a holiday for all employees?"
- If user clicks "OK", mark all active employees' attendance status as "holiday" for the selected date
- If user clicks "Cancel", uncheck the checkbox

**Implementation:**
```javascript
// Add state
const [isHoliday, setIsHoliday] = useState(false);
const [showHolidayConfirm, setShowHolidayConfirm] = useState(false);

// Handler
const handleHolidayCheckbox = (checked) => {
    if (checked) {
        setShowHolidayConfirm(true);
    } else {
        setIsHoliday(false);
    }
};

const confirmHoliday = async () => {
    // Mark all employees as holiday for selected date
    for (const emp of employees.filter(e => e.active)) {
        await markAttendance(emp.id, selectedDate, 'holiday');
    }
    setIsHoliday(true);
    setShowHolidayConfirm(false);
    alert('All employees marked as holiday!');
};
```

**UI Addition:**
```jsx
<div className="mt-2">
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
```

### 2. Rename "Monthly Summary" to "Summary"
**Change:** Tab label from "Monthly Summary" to "Summary"

### 3. Add Summary Sub-Filters
**Location:** Inside Summary tab, add toggle between "Daily Summary" and "Monthly Summary"

**UI:**
```jsx
<div className="flex p-1 bg-gray-100 rounded-lg text-sm mb-4">
    <button
        className={`flex-1 py-2 px-2 font-medium rounded-md ${summaryView === 'daily' ? 'bg-white shadow' : ''}`}
        onClick={() => setSummaryView('daily')}
    >
        Daily Summary
    </button>
    <button
        className={`flex-1 py-2 px-2 font-medium rounded-md ${summaryView === 'monthly' ? 'bg-white shadow' : ''}`}
        onClick={() => setSummaryView('monthly')}
    >
        Monthly Summary
    </button>
</div>
```

### 4. Daily Summary View
**Display Format:**
- Date column: DD/MM format (e.g., 15/12)
- Total Workers: Count of present employees
- Salary Provided: Sum of salaries for that day

**Table Structure:**
```
Date    | Total Workers | Salary Provided
--------|---------------|----------------
15/12   | 8             | ₹2,400
16/12   | 7             | ₹2,100
```

**Expandable Rows:**
- When user clicks on a row, expand it below
- Show list of employees who were present on that date
- Display: Employee name, Salary for that day

**Expanded View:**
```
Date    | Total Workers | Salary Provided
--------|---------------|----------------
15/12   | 8             | ₹2,400
  └─ Employee Details:
     • Ravi - ₹300
     • Kumar - ₹300
     • Siva - ₹300
     ...
```

### 5. Monthly Summary View
**Keep existing structure:**
- Month/Year filter
- Total Salary Given card
- Employee-wise summary with present days and total salary

## Implementation Steps

1. **Add new state variables:**
   - `isHoliday` - boolean for holiday checkbox
   - `showHolidayConfirm` - boolean for confirmation dialog
   - `summaryView` - 'daily' or 'monthly'
   - `expandedDates` - array of expanded date rows

2. **Create dailySummary calculation:**
   - Group attendance by date
   - Calculate workers and salary for each date
   - Sort by date ascending

3. **Update UI:**
   - Add holiday checkbox in attendance tab
   - Rename tab to "Summary"
   - Add sub-filter toggle
   - Implement daily summary table with expand/collapse

4. **Add confirmation dialogs:**
   - Holiday confirmation
   - Keep existing absent confirmation

## Files to Modify
- `/src/components/Employees.jsx` - Main component file

## Backend Requirements
- Attendance API should support "holiday" status
- No database schema changes needed (status is already a text field)
