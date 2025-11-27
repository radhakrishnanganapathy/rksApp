# API Testing Guide for RKS Business App (Postman)

## 📍 Base URL
All endpoints are relative to the **backend API URL** defined in your environment file:

```text
VITE_API_URL=https://rksapp.onrender.com/api
```

So the full base URL for Postman requests is:

```
https://rksapp.onrender.com/api
```

> **Tip:** If you change the URL in `.env.production` or `.env`, update the collection accordingly.

---
## 🧭 Endpoints Overview
| Resource | Method | Path | Description |
|----------|--------|------|-------------|
| **Sales** | GET | `/sales` | List all sales |
| | POST | `/sales` | Create a new sale |
| **Orders** | GET | `/orders` | List all orders |
| | POST | `/orders` | Create a new order |
| **Production** | GET | `/production` | List all production entries |
| | POST | `/production` | Create a new production record |
| **Expenses** | GET | `/expenses` | List all expenses |
| | POST | `/expenses` | Create a new expense |
| **Stocks** | GET | `/stocks` | Get combined stock view (`{products:[], rawMaterials:[]}`) |
| | POST | `/stocks` | Upsert a stock entry (product or raw material) |
| **Customers** | GET | `/customers` | List all customers |
| | POST | `/customers` | Create a new customer |
| **Employees** | GET | `/employees` | List all employees |
| | POST | `/employees` | Create a new employee |
| **Attendance** | GET | `/attendance` | List all attendance records |
| | POST | `/attendance` | Mark attendance for an employee |
| **Raw‑Material Purchases** | GET | `/raw-material-purchases` | List all raw‑material purchases |
| | POST | `/raw-material-purchases` | Add a new raw‑material purchase |

---
## 📦 Sample Request Bodies
Below are ready‑to‑paste JSON payloads for each **POST** endpoint. Adjust the values (especially `id` and dates) as needed.

### 1️⃣ Create a Sale (`POST /sales`)
```json
{
  "id": 1700000000000,
  "date": "2025-11-26",
  "customerId": 1,
  "items": [
    { "name": "Sample product", "qty": 2, "price": 150 }
  ],
  "discount": 0,
  "total": 300,
  "paymentStatus": "paid",
  "amountReceived": 300
}
```

### 2️⃣ Create an Order (`POST /orders`)
```json
{
  "id": 1700000000001,
  "bookingDate": "2025-11-26",
  "dueDate": "2025-12-03",
  "customerId": 1,
  "status": "waiting",
  "items": [
    { "name": "Sample product", "qty": 5, "price": 120 }
  ],
  "discount": 0,
  "total": 600,
  "paymentStatus": "paid",
  "amountReceived": 0
}
```

### 3️⃣ Create a Production Record (`POST /production`)
```json
{
  "id": 1700000000002,
  "date": "2025-11-26",
  "item": "Finished Widget",
  "qty": 50
}
```

### 4️⃣ Create an Expense (`POST /expenses`)
```json
{
  "id": 1700000000003,
  "date": "2025-11-26",
  "description": "Electricity bill",
  "amount": 2500,
  "category": "Utilities",
  "qty": "1"
}
```

### 5️⃣ Upsert a Stock (`POST /stocks`)
> **Note:** `type` must be either `product` or `raw_material`.
```json
{
  "type": "product",
  "name": "Sample product",
  "qty": 100,
  "unit": "kg"
}
```

### 6️⃣ Create a Customer (`POST /customers`)
```json
{
  "id": 1700000000004,
  "name": "Acme Corp",
  "mobile": "9876543210",
  "place": "Bangalore"
}
```

### 7️⃣ Create an Employee (`POST /employees`)
```json
{
  "id": 1700000000005,
  "name": "Ramesh Kumar",
  "salaryType": "daily",
  "dailySalary": 500,
  "active": true
}
```

### 8️⃣ Mark Attendance (`POST /attendance`)
```json
{
  "id": 1700000000006,
  "employeeId": 1700000000005,
  "date": "2025-11-26",
  "status": "present"
}
```

### 9️⃣ Add a Raw‑Material Purchase (`POST /raw-material-purchases`)
```json
{
  "id": 1700000000007,
  "date": "2025-11-26",
  "materialName": "Steel rods",
  "qty": 200,
  "cost": 15000
}
```

---
## ✅ Expected Responses
- **GET** requests return an array of objects (`200 OK`).
- **POST** requests return the newly created object (`200 OK`).
- Errors (e.g., validation, missing fields) return `500` with `{ "error": "<message>" }`.

---
## 📂 Importing into Postman
1. Open Postman.
2. Click **Import → Raw Text**.
3. Paste the JSON from the **Postman collection file** (generated in the repo as `rks_api.postman_collection.json`).
4. The collection will appear with all endpoints pre‑filled, including the sample bodies above.
5. Edit the **Environment** variable `baseUrl` to match your `.env.production` value if you prefer using an environment.

---
## 🛠️ Quick Generation of the Collection (optional)
A ready‑to‑use Postman collection JSON is already committed in the repo at:
```
/home/redblox009/Projects/Radhakrishnan/rks/rks_api.postman_collection.json
```
You can import that file directly.

---
## 📌 Checklist
- [ ] Verify `VITE_API_URL` in `.env.production` matches the URL you will use in Postman.
- [ ] Import the collection into Postman.
- [ ] Run a **GET** on each endpoint to confirm connectivity.
- [ ] Use the sample bodies above for **POST** requests.
- [ ] Adjust IDs/dates as needed to avoid collisions.

Happy testing! 🚀
