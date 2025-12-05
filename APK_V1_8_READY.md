# RKS Mobile App - Version 1.8 Release Notes

**Build Date:** December 5, 2025  
**APK File:** `rks_v1_8.apk`  
**Size:** 3.1 MB

---

## 🎉 What's New in v1.8

### 1. ✅ Fixed Profit Calculation (CRITICAL FIX)
**Changed from Purchase-Based to Usage-Based Accounting**

- **Before:** Profit = Sales - (All Expenses + Salary)
  - This incorrectly counted ALL raw material purchases as expenses
  - Result: Showed -₹881 (incorrect)

- **After:** Profit = Sales - (Raw Material Usage + Other Expenses + Salary)
  - Only counts raw materials actually USED in production
  - Result: Shows ₹1,808 (accurate!)

**Why this matters:** This is proper accounting practice and gives you the TRUE profit of your business.

---

### 2. 🆕 Raw Material Stock Value Metric
**New Dashboard Metric Added**

- **Location:** Dashboard Row 6 (next to Raw Profit)
- **What it shows:** Total monetary value of raw materials in stock
- **Calculation:** Stock Quantity × Price from Price List Module
- **Example:** 
  - Rice Flour: 50 kg × ₹60/kg = ₹3,000
  - Oil: 20 L × ₹150/L = ₹3,000
  - Total RM Stock Value = ₹6,000

**Benefit:** Track the value of your raw material inventory at a glance.

---

### 3. 🔄 Enhanced Last Buy Module
**Better Customer Tracking**

- ✅ **Shows ALL customers** (not just those who have purchased)
- ✅ **"Not Yet Buy" status** in yellow for customers with no purchase history
- ✅ **Sorted by days ago** - Customers who haven't bought in longest time appear first
- ✅ **Updated legend** with yellow indicator

**Benefits:**
- Easily identify customers who need follow-up
- Track new customers who haven't made their first purchase
- Prioritize customer outreach

---

### 4. 📊 Stock List Sorted by Quantity
**Better Inventory Overview**

- ✅ Stock items now sorted in **descending order** by quantity
- ✅ Items with highest stock appear first

**Benefit:** Quickly see which products have the most inventory.

---

### 5. 📅 Date Filter in Sales List
**More Flexible Sales Filtering**

- ✅ **Toggle between Month View and Date View**
- ✅ **Month View:** Filter by month/year or whole year
- ✅ **Date View:** Filter sales by specific date
- ✅ **Consistent UI** with Dashboard filtering

**Benefit:** Find sales from a specific day quickly.

---

## 📋 Summary of Changes

| Feature | Status | Impact |
|---------|--------|--------|
| Profit Calculation Fix | ✅ Fixed | HIGH - Shows accurate profit |
| RM Stock Value | ✅ Added | MEDIUM - Better inventory tracking |
| Last Buy Enhancement | ✅ Enhanced | MEDIUM - Better customer management |
| Stock Sorting | ✅ Added | LOW - Improved UX |
| Sales Date Filter | ✅ Added | MEDIUM - Better sales analysis |

---

## 🔧 Technical Details

- **Frontend Build:** Vite 4.5.14
- **Bundle Size:** 761.66 KB (minified)
- **Capacitor Version:** 5.7.8
- **Android Target:** API Level 33+

---

## 📱 Installation

1. Download `rks_v1_8.apk` from the project root
2. Transfer to your Android device
3. Enable "Install from Unknown Sources" if prompted
4. Install the APK
5. Open the app and verify the new features

---

## ✅ Testing Checklist

- [ ] Dashboard shows correct profit (usage-based)
- [ ] RM Stock Value metric displays correctly
- [ ] Last Buy shows all customers with "Not Yet Buy" status
- [ ] Stock list is sorted by quantity (highest first)
- [ ] Sales List has Month/Date view toggle
- [ ] All existing features work correctly

---

## 🚀 Next Version (v1.9)

**Planned Features:**
- Dynamic Product Management Module
- Add/Edit/Deactivate products without code changes
- Product categorization
- Historical data preservation

---

## 📞 Support

If you encounter any issues, please check:
1. Backend server is running at `https://rksapp.onrender.com`
2. Internet connection is stable
3. App has necessary permissions

---

**Built with ❤️ by Antigravity AI**
