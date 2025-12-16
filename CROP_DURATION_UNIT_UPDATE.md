# Crop Duration Unit Feature Update

## Summary
Added a duration unit selector to the Crops module, allowing users to specify crop duration in **Days**, **Months**, or **Years** instead of only days.

## Changes Made

### Frontend (`Crops.jsx`)

#### 1. **Form State Update**
- Added `durationUnit` field to form state with default value of `'days'`
- Options: `'days'`, `'months'`, `'years'`

#### 2. **Form UI Enhancement**
- Replaced single "Time Duration (days)" input with a combined layout:
  - **Number input**: For duration value (e.g., 4)
  - **Dropdown select**: For unit selection (Days/Months/Years)
- Both fields are side-by-side with responsive flex layout

#### 3. **Display Updates**
- Updated active crops display to show: `{timeDuration} {durationUnit}`
  - Example: "4 months" instead of "4 days"
- Updated completed crops display with same format
- Fallback to "days" if durationUnit is not set (backward compatibility)

#### 4. **Data Handling**
- `handleSubmit`: Includes `durationUnit` in crop data submission
- `handleEdit`: Loads `durationUnit` when editing (defaults to 'days' if not present)
- `resetForm`: Resets `durationUnit` to 'days'

### Backend (`server/index.js`)

#### 1. **Database Schema Update**
- Added `duration_unit TEXT DEFAULT 'days'` column to `farm_crops` table
- Migration script to add column if it doesn't exist (for existing databases)

#### 2. **API Endpoints Updated**

**GET `/api/farm/crops`**
- Returns `durationUnit` field in response
- Defaults to 'days' if not set

**POST `/api/farm/crops`**
- Accepts `durationUnit` in request body
- Stores in database with default 'days'

**PUT `/api/farm/crops/:id`**
- Accepts `durationUnit` in update request
- Updates database field

## User Experience

### Before
- User enters: "120" (assumed to be days)
- Display shows: "120 days"

### After
- User enters: "4" and selects "Months" from dropdown
- Display shows: "4 months"

OR

- User enters: "2" and selects "Years"
- Display shows: "2 years"

## Technical Details

### Form Layout
```jsx
<div className="flex gap-2">
  <input 
    type="number" 
    placeholder="e.g., 4"
    className="flex-1 ..."
  />
  <select className="...">
    <option value="days">Days</option>
    <option value="months">Months</option>
    <option value="years">Years</option>
  </select>
</div>
```

### Database Column
```sql
duration_unit TEXT DEFAULT 'days'
```

### API Response Example
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
  "cropStatus": "active"
}
```

## Backward Compatibility
- Existing crops without `durationUnit` will display as "X days"
- Default value ensures no breaking changes
- Migration script handles existing databases gracefully

## Testing Checklist
- [x] Add new crop with days
- [x] Add new crop with months
- [x] Add new crop with years
- [x] Edit existing crop and change unit
- [x] Display shows correct unit
- [x] Backend stores and retrieves correctly
- [x] Migration runs without errors

## Files Modified
1. `/src/components/Crops.jsx` - Frontend component
2. `/server/index.js` - Backend API and database schema

## Benefits
1. **More Flexible**: Users can think in natural time units
2. **Better UX**: No mental conversion needed (e.g., "4 months" vs "120 days")
3. **Clearer Display**: More intuitive crop duration representation
4. **Backward Compatible**: Existing data continues to work

## Future Enhancements
- Could add automatic date calculation based on duration and unit
- Could add validation to ensure estimated end date matches duration
- Could add duration conversion utilities
