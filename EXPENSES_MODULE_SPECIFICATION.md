# Expenses & Raw Material Tracking Module – Full Specification

## Overview

Complete expense tracking and raw material stock management system with automatic stock updates based on usage.

---

## Tabs / Modules Structure

### 1. **Expenses Tab**

**Purpose:** Record all daily expenses. Only "Raw Material" category affects physical stock.

**Fields:**
- `date` – Date of expense
- `category` – Dropdown: `Raw Material` | `Maintenance` | `Equipment`
- `materialName` / `itemName` – Required for Raw Material, optional for others
- `unit` – For Raw Material: `kg` | `lt` | `count` | `₹` (direct cost)
- `quantity` – Quantity purchased/used (for Raw Material with physical units)
- `amount` – Total cost in ₹
- `notes` – Optional description

**Operations:**
- ✅ **Add Expense** – Create new expense record
- ✅ **Edit Expense** – Modify existing record  
- ✅ **Delete Expense** – Remove a record

**Logic:**
- Only `Raw Material` expenses with physical units (`kg`, `lt`, `count`) affect **Stock Tab**
- When `Raw Material` is added → increase stock automatically
- `Maintenance` / `Equipment` are for accounting only (no stock impact)

---

### 2. **Raw Material Stock Tab**

**Purpose:** Maintain current stock levels of raw materials.

**Fields:**
- `materialName` – Name of raw material
- `unit` – `kg` | `lt` | `count`
- `openingStock` – Initial stock at start of period
- `stockAdded` – Total additions from Expenses (auto-calculated)
- `totalUsed` – Total usage from Usage Tab (auto-calculated)
- `currentStock` – **Formula:** `openingStock + stockAdded - totalUsed`

**Operations:**
- ✅ **Add Material** – Create new raw material entry
- ✅ **Edit Material** – Modify stock, unit, or name
- ✅ **Delete Material** – Remove material from stock

**Logic:**
- Only items with **physical units** (`kg`, `lt`, `count`) appear here
- Items purchased with direct `₹` (no quantity) are expense-only
- Stock auto-updates when:
  - Raw material expense added → `stockAdded` ↑
  - Usage recorded → `totalUsed` ↑
  - `currentStock` recalculates automatically

---

### 3. **Raw Material Usage Tab**

**Purpose:** Track daily usage of raw materials and decrease stock automatically.

**Fields:**
- `date` – Date of usage
- `materialName` – Dropdown (from Stock Tab materials)
- `quantityUsed` – Amount used
- `unit` – Must match unit in Stock Tab
- `notes` – Optional

**Operations:**
- ✅ **Add Usage** – Record usage for a material
- ✅ **Edit Usage** – Modify if wrong entry
- ✅ **Delete Usage** – Remove usage record

**Logic:**
- Decreases `currentStock` in **Stock Tab** automatically
- Only tracks materials categorized as `Raw Material`
- Unit validation: must match Stock Tab unit

---

### 4. **Expenses List Tab**

**Purpose:** Consolidated view of all expenses with filtering.

**Fields (Display):**
- `date`
- `category`
- `materialName` / `itemName`
- `quantity` / `amount`
- `notes`

**Operations:**
- 🔍 **View / Filter** – By date, category, or material name
- ✅ **Edit Expense** – Opens Expenses Tab with pre-filled data
- ✅ **Delete Expense** – Remove expense record

**Filters:**
- Date range
- Category (`All` | `Raw Material` | `Maintenance` | `Equipment`)
- Search by material/item name

---

### 5. **Daily Report / Dashboard** (Optional Enhancement)

**Purpose:** Quick summary of expenses and stock status.

**Display:**
- Date
- Total Expenses (all categories) – ₹
- Total Raw Material Expenses – ₹
- Raw Material Used (per material with quantity)
- Stock in Hand (current stock per material)

**Logic:**
- Only `Raw Material` affects stock summaries
- `Maintenance` / `Equipment` shown in total expenses only

---

## CRUD Operations Summary

| Module | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| **Expenses** | ✅ | ✅ | ✅ | ✅ |
| **Raw Material Stock** | ✅ | ✅ | ✅ | ✅ |
| **Raw Material Usage** | ✅ | ✅ | ✅ | ✅ |
| **Expenses List** | - | ✅ | ✅ | ✅ |

---

## Data Flow & Relationships

```
┌─────────────────┐
│  Expenses Tab   │
│  (Category:     │
│  Raw Material)  │
└────────┬────────┘
         │
         │ Purchase/Add
         ▼
┌─────────────────────┐
│ Raw Material Stock  │
│ stockAdded ↑        │
│ currentStock ↑      │
└─────────────────────┘
         ▲
         │ Usage
         │
┌─────────────────┐
│  Usage Tab      │
│  totalUsed ↑    │
│  currentStock ↓ │
└─────────────────┘
```

---

## Special Logic & Validations

### 1. **Stock Calculation**
```javascript
currentStock = openingStock + stockAdded - totalUsed
```

### 2. **Category Impact**
- `Raw Material` with **physical unit** → affects stock
- `Raw Material` with **₹ only** → expense record only
- `Maintenance` / `Equipment` → expense record only

### 3. **Unit Consistency**
- Must enforce same unit between Stock and Usage
- Alert if user tries to use different unit

### 4. **Auto-Update Logic**
- **Add Raw Material Expense** → `stockAdded` ↑, `currentStock` ↑
- **Delete Raw Material Expense** → `stockAdded` ↓, `currentStock` ↓
- **Add Usage** → `totalUsed` ↑, `currentStock` ↓
- **Delete Usage** → `totalUsed` ↓, `currentStock` ↑

### 5. **Low Stock Alert** (Optional)
```javascript
if (currentStock < minimumThreshold) {
    showAlert(`Low stock for ${materialName}!`);
}
```

---

## Backend API Requirements

### Expenses Endpoints
- `POST /api/expenses` – Create expense
- `GET /api/expenses` – Get all expenses
- `PUT /api/expenses/:id` – Update expense
- `DELETE /api/expenses/:id` – Delete expense

### Raw Material Stock Endpoints
- `POST /api/stocks/raw-materials` – Add material
- `GET /api/stocks/raw-materials` – Get all materials
- `PUT /api/stocks/raw-materials/:id` – Update material
- `DELETE /api/stocks/raw-materials/:id` – Delete material

### Usage Endpoints
- `POST /api/raw-material-usage` – Record usage
- `GET /api/raw-material-usage` – Get all usage records
- `PUT /api/raw-material-usage/:id` – Update usage
- `DELETE /api/raw-material-usage/:id` – Delete usage

---

## Database Schema (Reference)

### Expenses Table
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Raw Material', 'Maintenance', 'Equipment'
    material_name VARCHAR(100),
    unit VARCHAR(20), -- 'kg', 'lt', 'count', '₹'
    quantity DECIMAL(10, 2),
    amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Raw Material Stock Table
```sql
CREATE TABLE raw_material_stock (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL,
    opening_stock DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Raw Material Usage Table
```sql
CREATE TABLE raw_material_usage (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    material_name VARCHAR(100) NOT NULL,
    quantity_used DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Notes

1. **Phase 1:** Basic CRUD for Expenses, Stock, Usage
2. **Phase 2:** Auto-calculation logic for stock updates
3. **Phase 3:** Filtering and reporting in Expenses List
4. **Phase 4:** Dashboard/Daily Report (optional)

---

## Testing Checklist

- [ ] Add Raw Material expense with quantity → Stock increases
- [ ] Add Maintenance expense → No stock change
- [ ] Record usage → Stock decreases
- [ ] Edit usage quantity → Stock recalculates
- [ ] Delete expense → Stock recalculates
- [ ] Delete usage → Stock recalculates
- [ ] Filter expenses by category
- [ ] Filter expenses by date range
- [ ] Validate unit consistency between Stock and Usage
- [ ] Low stock alert (if implemented)

---

**Status:** Specification Complete - Ready for Implementation
