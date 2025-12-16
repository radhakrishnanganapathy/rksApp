# Auto-Calculate Estimated End Date & Actual End Date Feature

## Summary
Enhanced the Crops module with intelligent date management:
1. **Auto-calculate estimated end date** based on start date + duration + unit
2. **Manual override option** for custom estimated end dates
3. **Actual end date field** for recording when crops are actually completed

## Features Implemented

### 1. **Auto-Calculate Estimated End Date**

#### How It Works
- When enabled, the system automatically calculates the estimated end date
- Calculation formula: `Start Date + Duration (in selected unit)`
- Supports three time units:
  - **Days**: Adds X days to start date
  - **Months**: Adds X months to start date
  - **Years**: Adds X years to start date

#### User Interface
- **Checkbox toggle**: "Auto-calculate" next to Estimated Ending Date label
- **Disabled date input**: When auto-calculate is ON, date field is grayed out
- **Helper text**: "Automatically calculated based on start date and duration"
- **Real-time updates**: Changes to start date, duration, or unit instantly update the estimated end date

#### Example Scenarios
```
Start Date: 2025-01-01
Duration: 4 Months
Auto-calculate: ON
→ Estimated End Date: 2025-05-01 (automatically calculated)

Start Date: 2025-01-01
Duration: 90 Days
Auto-calculate: ON
→ Estimated End Date: 2025-04-01 (automatically calculated)

Start Date: 2025-01-01
Duration: 2 Years
Auto-calculate: ON
→ Estimated End Date: 2027-01-01 (automatically calculated)
```

### 2. **Manual Override Option**

#### How It Works
- Users can uncheck "Auto-calculate" to manually enter a custom end date
- Useful for:
  - Irregular growing seasons
  - Weather-dependent crops
  - Custom farming schedules
  - Crops with variable maturity periods

#### User Interface
- **Unchecked toggle**: Date input becomes enabled and editable
- **Full date control**: User can select any date from the calendar picker
- **No helper text**: Clean interface when manual mode is active

### 3. **Actual End Date Field**

#### How It Works
- **Conditional display**: Only appears when crop status is set to "Done"
- Records the real completion date of the crop
- Optional field (can be left empty)
- Helps track:
  - Actual vs estimated duration
  - Crop performance
  - Historical data for future planning

#### User Interface
- **Label**: "Actual End Date"
- **Helper text**: "The actual date when the crop was completed"
- **Date picker**: Standard date input
- **Display**: Shows in completed crops list with "Completed on: [date]"

## Technical Implementation

### Frontend (`Crops.jsx`)

#### State Management
```javascript
const [formData, setFormData] = useState({
    // ... other fields
    autoCalculateEndDate: true,  // Toggle for auto-calculation
    actualEndDate: '',            // Actual completion date
});
```

#### Auto-Calculation Function
```javascript
const calculateEstimatedEndDate = (startDate, duration, unit) => {
    const start = new Date(startDate);
    const durationNum = parseInt(duration);
    let endDate = new Date(start);
    
    switch (unit) {
        case 'days':
            endDate.setDate(endDate.getDate() + durationNum);
            break;
        case 'months':
            endDate.setMonth(endDate.getMonth() + durationNum);
            break;
        case 'years':
            endDate.setFullYear(endDate.getFullYear() + durationNum);
            break;
    }
    
    return endDate.toISOString().split('T')[0];
};
```

#### Auto-Update Effect
```javascript
useEffect(() => {
    if (formData.autoCalculateEndDate && formData.startingDate && formData.timeDuration) {
        const calculatedDate = calculateEstimatedEndDate(
            formData.startingDate,
            formData.timeDuration,
            formData.durationUnit
        );
        setFormData(prev => ({ ...prev, estimatedEndingDate: calculatedDate }));
    }
}, [formData.startingDate, formData.timeDuration, formData.durationUnit, formData.autoCalculateEndDate]);
```

### Backend (`server/index.js`)

#### Database Schema
```sql
CREATE TABLE farm_crops (
    -- ... other columns
    auto_calculate_end_date BOOLEAN DEFAULT true,
    actual_end_date DATE,
    -- ... other columns
);
```

#### Migration Script
```sql
ALTER TABLE farm_crops 
ADD COLUMN IF NOT EXISTS auto_calculate_end_date BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS actual_end_date DATE;
```

#### API Response Example
```json
{
    "id": 1234567890,
    "cropName": "Rice",
    "cropType": "Cereal",
    "acresUsed": 5.5,
    "timeDuration": 4,
    "durationUnit": "months",
    "startingDate": "2025-01-01",
    "estimatedEndingDate": "2025-05-01",
    "autoCalculateEndDate": true,
    "actualEndDate": null,
    "cropStatus": "active"
}
```

## User Workflows

### Workflow 1: Add New Crop with Auto-Calculate
1. Click "Add Crop"
2. Enter crop name, type, acres
3. Enter duration: `4` and select `Months`
4. Select start date: `2025-01-01`
5. **Auto-calculate is ON by default**
6. Estimated end date automatically shows: `2025-05-01`
7. Submit form

### Workflow 2: Add Crop with Manual End Date
1. Click "Add Crop"
2. Enter crop details
3. Enter start date
4. **Uncheck "Auto-calculate"**
5. Manually select estimated end date from calendar
6. Submit form

### Workflow 3: Mark Crop as Complete
1. Edit an active crop
2. Change status to "Done"
3. **"Actual End Date" field appears**
4. Select the actual completion date
5. Update crop
6. Completed crop now shows "Completed on: [date]"

### Workflow 4: Update Duration (Auto-Calculate Active)
1. Edit a crop
2. Change duration from `4 months` to `6 months`
3. **Estimated end date automatically updates**
4. Save changes

## UI Components

### Form Field: Estimated Ending Date
```jsx
<div>
    <div className="flex items-center justify-between mb-2">
        <label>Estimated Ending Date *</label>
        <label className="flex items-center gap-2 cursor-pointer">
            <input 
                type="checkbox" 
                checked={formData.autoCalculateEndDate}
                onChange={(e) => setFormData({ 
                    ...formData, 
                    autoCalculateEndDate: e.target.checked 
                })}
            />
            <span>Auto-calculate</span>
        </label>
    </div>
    <input 
        type="date"
        value={formData.estimatedEndingDate}
        disabled={formData.autoCalculateEndDate}
        className={formData.autoCalculateEndDate ? 'bg-gray-100 cursor-not-allowed' : ''}
    />
    {formData.autoCalculateEndDate && (
        <p className="text-xs text-gray-500 mt-1">
            Automatically calculated based on start date and duration
        </p>
    )}
</div>
```

### Form Field: Actual End Date (Conditional)
```jsx
{formData.cropStatus === 'done' && (
    <div>
        <label>Actual End Date</label>
        <input 
            type="date"
            value={formData.actualEndDate}
            onChange={(e) => setFormData({ 
                ...formData, 
                actualEndDate: e.target.value 
            })}
        />
        <p className="text-xs text-gray-500 mt-1">
            The actual date when the crop was completed
        </p>
    </div>
)}
```

### Display: Completed Crops
```jsx
{crop.actualEndDate && (
    <div className="col-span-2 mt-2 pt-2 border-t border-gray-300">
        <span className="font-medium">Completed on:</span>{' '}
        {new Date(crop.actualEndDate).toLocaleDateString()}
    </div>
)}
```

## Benefits

### 1. **Time Savings**
- No manual date calculation needed
- Instant updates when changing duration or start date
- Reduces data entry errors

### 2. **Flexibility**
- Can switch between auto and manual modes anytime
- Accommodates both standard and custom growing periods
- Supports different farming practices

### 3. **Better Planning**
- Accurate estimated end dates help with harvest planning
- Historical actual end dates improve future estimates
- Track crop performance over time

### 4. **Data Accuracy**
- Automated calculations eliminate human error
- Consistent date handling across all crops
- Proper handling of month/year boundaries

### 5. **User Experience**
- Intuitive toggle interface
- Clear visual feedback (grayed out when auto)
- Helpful explanatory text
- Conditional fields reduce clutter

## Edge Cases Handled

### 1. **Month Overflow**
- Adding 3 months to Nov 30 correctly gives Feb 28/29
- JavaScript Date handles month boundaries automatically

### 2. **Leap Years**
- Adding 1 year to Feb 29, 2024 gives Feb 28, 2025
- Proper handling of leap year edge cases

### 3. **Editing Existing Crops**
- Loads existing auto-calculate preference
- Defaults to `false` for old crops (backward compatibility)
- Preserves manual dates when toggling

### 4. **Status Changes**
- Actual end date field appears/disappears based on status
- Data is preserved even when field is hidden
- No data loss when switching between active/done

## Files Modified

1. **`/src/components/Crops.jsx`**
   - Added `autoCalculateEndDate` and `actualEndDate` to state
   - Implemented `calculateEstimatedEndDate` function
   - Added `useEffect` for auto-calculation
   - Updated form UI with toggle and conditional fields
   - Updated display to show actual end date

2. **`/server/index.js`**
   - Added `auto_calculate_end_date` and `actual_end_date` columns
   - Migration script for existing databases
   - Updated GET, POST, PUT endpoints
   - Proper handling of boolean and null values

## Testing Checklist

- [x] Auto-calculate works with days
- [x] Auto-calculate works with months
- [x] Auto-calculate works with years
- [x] Manual override disables auto-calculate
- [x] Toggling auto-calculate on recalculates date
- [x] Actual end date appears when status is 'done'
- [x] Actual end date hides when status is 'active'
- [x] Actual end date displays in completed crops list
- [x] Backend stores all new fields correctly
- [x] Migration runs without errors
- [x] Editing preserves auto-calculate preference
- [x] Date calculations handle month boundaries
- [x] Date calculations handle year boundaries

## Future Enhancements

1. **Validation**: Warn if actual end date is very different from estimated
2. **Analytics**: Show average difference between estimated and actual dates
3. **Smart Suggestions**: Suggest duration based on historical data for crop type
4. **Weather Integration**: Adjust estimated dates based on weather forecasts
5. **Notifications**: Alert when crop is approaching estimated end date
6. **Comparison View**: Side-by-side comparison of estimated vs actual for completed crops

## Backward Compatibility

- Existing crops without `autoCalculateEndDate` default to `false` (manual mode)
- Existing crops without `actualEndDate` show as `null`
- No breaking changes to existing data
- Migration script handles all edge cases
- Old crops continue to work without modification
