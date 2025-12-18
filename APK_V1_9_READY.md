# RKS Mobile App - Version 1.9 Release Notes

**Build Date:** December 18, 2025
**APK File:** `rks_v1_9.apk`
**Size:** ~3.9 MB

---

## 🎉 What's New in v1.9

### 1. 🏠 Home Loans & Payments (MAJOR UPDATE)
**Fixed Payment Logic & Transaction History**

- **✅ Correct Balance Reduction:**
  - Paying "Principal" now correctly reduces the outstanding balance.
  - Paying "Interest" is tracked separately and does NOT reduce the principal balance.
  - **Auto-Calculation:** Entering a total amount automatically suggests the split between Principal and Interest based on the loan rate.

- **✅ Transaction History Fixed:**
  - Transactions now appear **immediately** after recording a payment.
  - Fixed a bug where history was hidden due to ID mismatch.

- **✅ Improved Loan Card:**
  - **Tenure Display:** Now shows "X Paid / Y Total" (e.g., "3 Paid / 60 Total").
  - **Interest Paid:** Accurately shows total interest paid over the loan lifetime.
  - **UI Alignment:** Better layout for readability.

- **✅ "Add Interest" Button Removed:**
  - Removed the confusing "Add Interest" button as per request.

---

## 📱 Installation

1. Download `rks_v1_9.apk` from the project root.
2. Transfer to your Android device.
3. Install the APK (Update existing app).
4. **Test:** Go to "Home Loans" -> "Record Payment" and verify the new logic.

---

**Built with ❤️ by Antigravity AI**
