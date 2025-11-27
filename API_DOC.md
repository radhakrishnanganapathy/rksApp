# RKS Business API Documentation

## 📍 Base URL
All API endpoints are relative to the backend URL defined in your environment files:

```
VITE_API_URL=https://rksapp.onrender.com/api
```

**Full base URL for requests:**
```
https://rksapp.onrender.com/api
```

> **Tip:** If you change the URL in `.env` or `.env.production`, update the Postman environment variable `baseUrl` accordingly.

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
| **Raw‑Material Purchases** | GET | `/raw-material-purchases` | List all purchases |
| | POST | `/raw-material-purchases` | Add a new raw‑material purchase |

---
## 📦 Sample Request Bodies (POST)
> Replace `{{timestamp}}` with a unique integer (e.g., `Date.now()`) to avoid ID collisions.

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
```json
{
  "type": "product",   // or "raw_material"
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
| Method | Success Code | Body |
|--------|--------------|------|
| GET | 200 OK | JSON array of objects |
| POST | 200 OK | The newly created object |
| Errors (e.g., validation) | 500 | `{ "error": "<message>" }` |

---
## 📥 Importing the Collection into Postman
1. Open **Postman** → click **Import → Raw Text**.
2. Paste the JSON from the file `rks_api.postman_collection.json` (generated in the repo).
3. The collection **“RKS Business API”** will appear with all endpoints pre‑filled.
4. Create a **Postman Environment** named `RKS` and add a variable:
   - **Key:** `baseUrl`
   - **Value:** `https://rksapp.onrender.com/api` (or whatever you have in `.env.production`).
5. Select the environment when running requests.

The collection file is located at:
```
/home/redblox009/Projects/Radhakrishnan/rks/rks_api.postman_collection.json
```
You can also open the human‑readable guide you received at:
```
/home/redblox009/Projects/Radhakrishnan/rks/API_POSTMAN_DOC.md
```

---
## ✅ Quick Checklist
- Verify `VITE_API_URL` in `.env.production` matches the URL you’ll use in Postman.
- Import the Postman collection (`rks_api.postman_collection.json`).
- Set the `baseUrl` environment variable.
- Run a **GET** on each endpoint to confirm connectivity.
- Use the sample bodies above for **POST** requests, adjusting IDs/dates as needed.

---
## 🛠️ Bonus: Ready‑to‑Run Bash Script (Optional)
If you prefer a quick CLI sanity‑check, you can run the script `test_api.sh` (generated earlier) which hits every endpoint and prints formatted output.
```bash
chmod +x test_api.sh
source .env.production   # loads VITE_API_URL into the shell
./test_api.sh
```

You’re all set! 🎉 Use this documentation to fully exercise every API route, validate responses, and debug any issues. If anything else comes up—CORS, auth, or new endpoints—just let me know. Happy testing!
