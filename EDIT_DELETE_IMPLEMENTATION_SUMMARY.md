# Edit & Delete Functionality Implementation Summary

## ✅ Completed Modules

### 1. **Billing/Sales** ✓
- Delete button with confirmation
- Edit button that pre-fills form
- Updates work correctly with camelCase/snake_case mapping

### 2. **Stock** ✓
- Delete button for each stock item
- Edit modal for updating quantity
- Confirmation dialog before delete

### 3. **Production** ✓
- Delete button for each production record
- Edit mode that switches to "Add" tab with pre-filled data
- Cancel edit option

## 🔧 Pending Modules

### 4. **Expenses Module**
Needs edit/delete for 3 tabs:
- **Expenses List Tab**: General expenses
- **Usage Tab**: Item usage records
- **Raw Material Tab**: Raw material purchases

**Required Changes:**
```javascript
// Add to useData imports
const { expenses, deleteExpense, updateExpense, 
        deleteRawMaterialPurchase, updateRawMaterialPurchase } = useData();

// Add state for editing
const [editingExpenseId, setEditingExpenseId] = useState(null);

// Add edit/delete buttons to each list item
<div className="flex gap-1">
    <button onClick={() => handleEdit(expense)} 
            className="p-2 text-blue-600 hover:bg-blue-50 rounded">
        <Edit size={18} />
    </button>
    <button onClick={() => handleDelete(expense.id)} 
            className="p-2 text-red-600 hover:bg-red-50 rounded">
        <Trash2 size={18} />
    </button>
</div>
```

### 5. **Customers Module**
**Required Changes:**
```javascript
const { customers, deleteCustomer, updateCustomer } = useData();

// Add edit modal similar to Stock module
// Add delete confirmation
```

### 6. **Orders Module**
**Required Changes:**
```javascript
const { orders, deleteOrder, updateOrder } = useData();

// Add edit/delete buttons to order list
// Implement edit modal or switch to form tab
```

### 7. **Balance Amount Module**
This module shows unpaid sales and orders with payment tracking.

**Required Changes:**
```javascript
// The actual delete/edit should be done on the Sales and Orders modules
// But we can add quick actions here:

// For updating payment status (already exists)
// Add delete forwarding to respective modules
```

## 🎯 Implementation Pattern

All modules should follow this pattern:

1. **Import necessary functions from DataContext**:
   ```javascript
   const { data, deleteData, updateData } = useData();
   ```

2. **Add editing state**:
   ```javascript
   const [editingId, setEditingId] = useState(null);
   ```

3. **Add handler functions**:
   ```javascript
   const handleEdit = (item) => {
       setEditingId(item.id);
       // Pre-fill form fields
       setActiveTab('add'); // Switch to form tab
   };

   const handleDelete = (id) => {
       if (window.confirm('Are you sure?')) {
           deleteData(id);
       }
   };

   const cancelEdit = () => {
       setEditingId(null);
       // Clear form fields
   };
   ```

4. **Add UI buttons** to each list item:
   ```javascript
   <div className="flex gap-1">
       <button onClick={() => handleEdit(item)} 
               className="p-2 text-blue-600 hover:bg-blue-50 rounded"
               title="Edit">
           <Edit size={18} />
       </button>
       <button onClick={() => handleDelete(item.id)} 
               className="p-2 text-red-600 hover:bg-red-50 rounded"
               title="Delete">
           <Trash2 size={18} />
       </button>
   </div>
   ```

5. **Update form submission** to handle both add and edit:
   ```javascript
   const handleSubmit = () => {
       if (editingId) {
           updateData(editingId, formData);
           setEditingId(null);
       } else {
           addData(formData);
       }
   };
   ```

## 📝 Notes

- All delete operations use `window.confirm()` for user confirmation
- All edit operations pre-fill the form and switch to the appropriate tab
- Background backend calls handle the actual data persistence
- The `DataContext` already has all necessary update/delete functions implemented
- ID comparison uses string conversion to handle backend string IDs vs frontend number IDs

## 🔄 Next Steps

Would you like me to:
1. Implement edit/delete for all remaining modules now?
2. Focus on specific modules first?
3. Create a separate component for reusable edit/delete buttons?
