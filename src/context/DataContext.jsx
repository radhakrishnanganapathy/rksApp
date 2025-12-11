import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData, ITEMS } from '../data/mockDb';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

    const [sales, setSales] = useState([]);
    const [production, setProduction] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [stocks, setStocks] = useState({ products: [], rawMaterials: [] });
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [orders, setOrders] = useState([]);
    const [rawMaterialPurchases, setRawMaterialPurchases] = useState([]);
    const [rawMaterialUsage, setRawMaterialUsage] = useState([]);
    const [rawMaterialPrices, setRawMaterialPrices] = useState([]);
    const [products, setProducts] = useState([]);
    const [items] = useState(ITEMS); // Keep for backward compatibility
    const [loading, setLoading] = useState(true);

    // Farm Module State
    const [farmCrops, setFarmCrops] = useState([]);
    const [farmExpenses, setFarmExpenses] = useState([]);
    const [farmIncome, setFarmIncome] = useState([]);
    const [farmExpenseCategories, setFarmExpenseCategories] = useState([]);
    const [farmTimeline, setFarmTimeline] = useState([]);
    const [cropTypes, setCropTypes] = useState([]); // Crop Master List

    // --- Data Mappers (Backend snake_case -> Frontend camelCase) ---
    const mapSale = (s) => ({
        ...s,
        customerId: s.customer_id,
        paymentStatus: s.payment_status,
        amountReceived: s.amount_received
    });

    const mapOrder = (o) => ({
        ...o,
        bookingDate: o.booking_date,
        dueDate: o.due_date,
        customerId: o.customer_id,
        paymentStatus: o.payment_status,
        amountReceived: o.amount_received
    });

    const mapEmployee = (e) => ({
        ...e,
        salaryType: e.salary_type,
        dailySalary: e.daily_salary ? Number(e.daily_salary) : 0
    });

    const mapAttendance = (a) => ({
        ...a,
        employeeId: a.employee_id,
        customSalary: a.custom_salary ? Number(a.custom_salary) : null
    });

    const mapProduction = (p) => ({
        ...p,
        batchNumber: p.batch_number,
        packedQty: p.packed_qty ? Number(p.packed_qty) : 0
    });

    const mapExpense = (e) => ({
        ...e,
        materialName: e.material_name,
        amount: Number(e.amount),
        quantity: e.quantity ? Number(e.quantity) : null
    });

    const mapUsage = (u) => ({
        ...u,
        materialName: u.material_name,
        quantityUsed: u.quantity_used,
        cost: Number(u.cost || 0)
    });

    const mapPurchase = (p) => ({
        ...p,
        materialName: p.material_name
    });

    const mapRawMaterialPrice = (p) => ({
        ...p,
        pricePerUnit: Number(p.price_per_unit)
    });

    const refreshData = async () => {
        setLoading(true);
        try {
            // Core HomeSnacks endpoints (required)
            const coreEndpoints = [
                'sales', 'production', 'expenses', 'stocks',
                'customers', 'employees', 'attendance', 'orders',
                'raw-material-purchases', 'raw-material-usage', 'raw-material-prices',
                'products'
            ];

            // Farm endpoints (optional - may not exist on backend yet)
            const farmEndpoints = [
                'farm/crops', 'farm/expenses', 'farm/income', 'farm/expense-categories', 'farm/timeline'
            ];

            // Fetch core data
            const coreResponses = await Promise.all(
                coreEndpoints.map(endpoint => fetch(`${API_URL}/${endpoint}`))
            );

            // Check for errors in core endpoints
            for (let i = 0; i < coreResponses.length; i++) {
                if (!coreResponses[i].ok) {
                    throw new Error(`Failed to fetch ${coreEndpoints[i]}: ${coreResponses[i].statusText}`);
                }
            }

            const coreData = await Promise.all(coreResponses.map(res => res.json()));

            // Set core data
            setSales(coreData[0]?.map(mapSale) || []);
            setProduction(coreData[1]?.map(mapProduction) || []);
            setExpenses(coreData[2]?.map(mapExpense) || []);
            setStocks(coreData[3] || { products: [], rawMaterials: [] });
            setCustomers(coreData[4] || []);
            setEmployees(coreData[5]?.map(mapEmployee) || []);
            setAttendance(coreData[6]?.map(mapAttendance) || []);
            setOrders(coreData[7]?.map(mapOrder) || []);
            setRawMaterialPurchases(coreData[8]?.map(mapPurchase) || []);
            setRawMaterialUsage(coreData[9]?.map(mapUsage) || []);
            setRawMaterialPrices(coreData[10]?.map(mapRawMaterialPrice) || []);
            setProducts(coreData[11] || []);

            // Try to fetch farm data (gracefully handle if endpoints don't exist)
            try {
                const farmResponses = await Promise.all(
                    farmEndpoints.map(endpoint =>
                        fetch(`${API_URL}/${endpoint}`).catch(() => ({ ok: false }))
                    )
                );

                const farmData = await Promise.all(
                    farmResponses.map((res, i) =>
                        res.ok ? res.json().catch(() => []) : []
                    )
                );

                setFarmCrops(farmData[0] || []);
                setFarmExpenses(farmData[1] || []);
                setFarmIncome(farmData[2] || []);
                setFarmExpenseCategories(farmData[3] || []);
                setFarmTimeline(farmData[4] || []);
            } catch (farmError) {
                console.log('Farm endpoints not available yet:', farmError.message);
                // Set empty farm data
                setFarmCrops([]);
                setFarmExpenses([]);
                setFarmIncome([]);
                setFarmExpenseCategories([]);
                setFarmTimeline([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Initial Data
    useEffect(() => {
        refreshData();
    }, []);

    const addSale = async (sale) => {
        const newSale = { ...sale, id: Date.now(), paymentStatus: sale.paymentStatus || 'paid', amountReceived: 0 };
        try {
            const res = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSale)
            });
            const savedSale = await res.json();
            setSales([mapSale(savedSale), ...sales]);

            // Update stocks for each item
            for (const item of sale.items) {
                await fetch(`${API_URL}/stocks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'product', name: item.name, qty: -item.qty })
                });
            }

            // Refetch stocks to be sure
            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());

        } catch (err) {
            console.error("Error adding sale:", err);
        }
    };

    const addProduction = async (prod) => {
        const newProd = { ...prod, id: Date.now() };
        try {
            const res = await fetch(`${API_URL}/production`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProd)
            });
            const savedProd = await res.json();
            setProduction([mapProduction(savedProd), ...production]);

            // Update stock
            await fetch(`${API_URL}/stocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'product', name: prod.item, qty: prod.qty })
            });

            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error adding production:", err);
        }
    };

    const addExpense = async (expense) => {
        const newExpense = { ...expense, id: Date.now() };
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Failed to add expense: ${res.status} ${res.statusText}`);
            }
            const savedExpense = await res.json();
            const mappedExpense = mapExpense(savedExpense);
            setExpenses(prev => [mappedExpense, ...prev]);

            // Update Stock if Raw Material
            if (mappedExpense.category === 'Raw Material' && mappedExpense.unit !== '₹' && mappedExpense.quantity) {
                await addStock('raw_material', mappedExpense.materialName, mappedExpense.quantity, mappedExpense.unit);
            }
        } catch (err) {
            console.error("Error adding expense:", err);
            throw err;
        }
    };

    const updateExpense = async (id, updatedData) => {
        try {
            const oldExpense = expenses.find(e => e.id === id);
            const res = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const savedExpense = await res.json();
            const mappedExpense = mapExpense(savedExpense);

            setExpenses(prev => prev.map(item => item.id === id ? mappedExpense : item));

            // Handle Stock Updates
            // 1. Revert old expense effect
            if (oldExpense && oldExpense.category === 'Raw Material' && oldExpense.unit !== '₹' && oldExpense.quantity) {
                await addStock('raw_material', oldExpense.materialName, -Number(oldExpense.quantity), oldExpense.unit);
            }
            // 2. Apply new expense effect
            if (mappedExpense.category === 'Raw Material' && mappedExpense.unit !== '₹' && mappedExpense.quantity) {
                await addStock('raw_material', mappedExpense.materialName, Number(mappedExpense.quantity), mappedExpense.unit);
            }

        } catch (err) {
            console.error("Error updating expense:", err);
            throw err;
        }
    };

    const deleteExpense = async (id) => {
        try {
            const oldExpense = expenses.find(e => e.id === id);
            await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
            setExpenses(prev => prev.filter(item => item.id !== id));

            // Revert Stock
            if (oldExpense && oldExpense.category === 'Raw Material' && oldExpense.unit !== '₹' && oldExpense.quantity) {
                await addStock('raw_material', oldExpense.materialName, -Number(oldExpense.quantity), oldExpense.unit);
            }
        } catch (err) {
            console.error("Error deleting expense:", err);
            throw err;
        }
    };

    // Raw Material Usage Functions
    const addRawMaterialUsage = async (usage) => {
        const newUsage = { ...usage, id: Date.now() };
        try {
            console.log('Adding raw material usage:', newUsage);
            const res = await fetch(`${API_URL}/raw-material-usage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUsage)
            });

            if (!res.ok) {
                console.error('Failed to add usage, status:', res.status);
                const errorText = await res.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to add usage: ${res.status}`);
            }

            const savedUsage = await res.json();
            console.log('Saved usage:', savedUsage);
            const mappedUsage = mapUsage(savedUsage);
            console.log('Mapped usage:', mappedUsage);
            setRawMaterialUsage(prev => [mappedUsage, ...prev]);

            // Decrease Stock
            console.log('Decreasing stock:', {
                type: 'raw_material',
                material: mappedUsage.materialName,
                quantity: -Number(mappedUsage.quantityUsed),
                unit: mappedUsage.unit
            });
            await addStock('raw_material', mappedUsage.materialName, -Number(mappedUsage.quantityUsed), mappedUsage.unit);
            console.log('Stock decrease completed');
        } catch (err) {
            console.error("Error adding usage:", err);
            alert('Error adding usage: ' + err.message);
        }
    };

    const updateRawMaterialUsage = async (id, updatedData) => {
        try {
            const oldUsage = rawMaterialUsage.find(u => u.id === id);
            const res = await fetch(`${API_URL}/raw-material-usage/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const savedUsage = await res.json();
            const mappedUsage = mapUsage(savedUsage);

            setRawMaterialUsage(prev => prev.map(item => item.id === id ? mappedUsage : item));

            // Revert old usage (add back)
            if (oldUsage) {
                await addStock('raw_material', oldUsage.materialName, Number(oldUsage.quantityUsed), oldUsage.unit);
            }
            // Apply new usage (subtract)
            await addStock('raw_material', mappedUsage.materialName, -Number(mappedUsage.quantityUsed), mappedUsage.unit);

        } catch (err) {
            console.error("Error updating usage:", err);
        }
    };

    const deleteRawMaterialUsage = async (id) => {
        try {
            const oldUsage = rawMaterialUsage.find(u => u.id === id);
            await fetch(`${API_URL}/raw-material-usage/${id}`, { method: 'DELETE' });
            setRawMaterialUsage(prev => prev.filter(item => item.id !== id));

            // Revert usage (add back to stock)
            if (oldUsage) {
                await addStock('raw_material', oldUsage.materialName, Number(oldUsage.quantityUsed), oldUsage.unit);
            }
        } catch (err) {
            console.error("Error deleting usage:", err);
        }
    };

    const addStock = async (type, item, qty, unit) => {
        try {
            const res = await fetch(`${API_URL}/stocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: type === 'products' ? 'product' : 'raw_material',
                    name: item,
                    qty: Number(qty),
                    unit: unit || 'kg'
                })
            });
            if (!res.ok) throw new Error(`Failed to add stock: ${res.statusText}`);

            const stocksRes = await fetch(`${API_URL}/stocks`);
            if (!stocksRes.ok) throw new Error('Failed to fetch updated stocks');
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error adding stock:", err);
            throw err; // Re-throw to let component know
        }
    };

    const addCustomer = async (customer) => {
        const newCustomer = { ...customer, id: Date.now() };
        try {
            const res = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer)
            });
            const savedCustomer = await res.json();
            setCustomers([...customers, savedCustomer]);
        } catch (err) {
            console.error("Error adding customer:", err);
        }
    };

    const addEmployee = async (employee) => {
        const newEmployee = { ...employee, id: Date.now() };
        try {
            const res = await fetch(`${API_URL}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployee)
            });
            const savedEmployee = await res.json();
            setEmployees([...employees, mapEmployee(savedEmployee)]);
        } catch (err) {
            console.error("Error adding employee:", err);
        }
    };

    const markAttendance = async (employeeId, date, status, customSalary = null) => {
        try {
            console.log('Marking attendance:', { employeeId, date, status, customSalary });
            const res = await fetch(`${API_URL}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Date.now(), employeeId, date, status, customSalary })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Failed to mark attendance:', errorText);
                throw new Error(`Failed to mark attendance: ${res.statusText}`);
            }

            // Refetch attendance
            const attendanceRes = await fetch(`${API_URL}/attendance`);
            if (!attendanceRes.ok) {
                throw new Error('Failed to fetch attendance');
            }
            const attendanceData = await attendanceRes.json();
            setAttendance(attendanceData.map(mapAttendance));
            console.log('Attendance marked successfully');
        } catch (err) {
            console.error("Error marking attendance:", err);
            alert(`Error marking attendance: ${err.message}`);
        }
    };

    const addOrder = async (order) => {
        const newOrder = { ...order, id: Date.now(), paymentStatus: order.paymentStatus || 'paid', amountReceived: 0 };
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });
            const savedOrder = await res.json();
            setOrders([mapOrder(savedOrder), ...orders]);
        } catch (err) {
            console.error("Error adding order:", err);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const updatedOrder = await res.json();
            setOrders(orders.map(o => o.id === orderId ? mapOrder(updatedOrder) : o));
        } catch (err) {
            console.error("Error updating order status:", err);
        }
    };

    const convertOrderToSale = async (orderId, paymentStatus = null) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const sale = {
            date: order.dueDate,
            customerId: order.customerId,
            items: order.items,
            discount: order.discount,
            total: order.total,
            paymentStatus: paymentStatus || order.paymentStatus,
            amountReceived: order.amountReceived || 0,
            buyType: 'order'
        };

        await addSale(sale);
    };

    const clearOrder = async (orderId, paymentStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Convert to sale with specified payment status
        const sale = {
            date: order.dueDate,
            customerId: order.customerId,
            items: order.items,
            discount: order.discount,
            total: order.total,
            paymentStatus: paymentStatus,
            amountReceived: paymentStatus === 'paid' ? order.total : 0,
            buyType: 'order'
        };

        await addSale(sale);

        // Delete the order
        await deleteOrder(orderId);
    };

    const addRawMaterialPurchase = async (purchase) => {
        const newPurchase = { ...purchase, id: Date.now() };
        try {
            const res = await fetch(`${API_URL}/raw-material-purchases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPurchase)
            });
            const savedPurchase = await res.json();
            setRawMaterialPurchases([mapPurchase(savedPurchase), ...rawMaterialPurchases]);

            // Update stock
            await fetch(`${API_URL}/stocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'raw_material', name: purchase.name, qty: purchase.qty })
            });

            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error adding raw material purchase:", err);
        }
    };

    const markSaleAsPaid = async (saleId) => {
        try {
            const res = await fetch(`${API_URL}/sales/${saleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: 'paid' })
            });
            const updatedSale = await res.json();
            setSales(sales.map(s => s.id === saleId ? mapSale(updatedSale) : s));
        } catch (err) {
            console.error("Error marking sale as paid:", err);
        }
    };

    const markOrderAsPaid = async (orderId) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: 'paid' })
            });
            const updatedOrder = await res.json();
            setOrders(orders.map(o => o.id === orderId ? mapOrder(updatedOrder) : o));
        } catch (err) {
            console.error("Error marking order as paid:", err);
        }
    };

    const updateSaleAmountReceived = async (saleId, amount) => {
        try {
            const res = await fetch(`${API_URL}/sales/${saleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amountReceived: amount })
            });
            const updatedSale = await res.json();
            setSales(sales.map(s => s.id === saleId ? mapSale(updatedSale) : s));
        } catch (err) {
            console.error("Error updating sale amount:", err);
        }
    };

    const updateOrderAmountReceived = async (orderId, amount) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amountReceived: amount })
            });
            const updatedOrder = await res.json();
            setOrders(orders.map(o => o.id === orderId ? mapOrder(updatedOrder) : o));
        } catch (err) {
            console.error("Error updating order amount:", err);
        }
    };

    // Generic Helper Functions
    const deleteItem = async (endpoint, id, stateSetter, currentState) => {
        try {
            const res = await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                // Convert both to strings for comparison since backend returns string IDs
                stateSetter(currentState.filter(item => String(item.id) !== String(id)));
            }
        } catch (err) {
            console.error(`Error deleting from ${endpoint}:`, err);
        }
    };

    const updateItem = async (endpoint, id, data, stateSetter, currentState, mapper) => {
        try {
            const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updatedItem = await res.json();
            const mappedItem = mapper ? mapper(updatedItem) : updatedItem;
            stateSetter(currentState.map(item => item.id === id ? mappedItem : item));
        } catch (err) {
            console.error(`Error updating ${endpoint}:`, err);
        }
    };

    const addItem = async (endpoint, data, stateSetter, currentState, mapper) => {
        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const newItem = await res.json();
            const mappedItem = mapper ? mapper(newItem) : newItem;
            stateSetter([mappedItem, ...currentState]); // Assuming new items are added to the beginning
        } catch (err) {
            console.error(`Error adding to ${endpoint}:`, err);
            throw err;
        }
    };

    // Specific Delete/Update Functions
    const deleteSale = async (id) => {
        try {
            const saleToDelete = sales.find(s => s.id === id);
            if (saleToDelete) {
                // Revert stock (Add back)
                for (const item of saleToDelete.items) {
                    await fetch(`${API_URL}/stocks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'product', name: item.name, qty: Number(item.qty) })
                    });
                }
            }
            await deleteItem('sales', id, setSales, sales);

            // Refetch stocks
            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error deleting sale:", err);
        }
    };

    const updateSale = async (id, updatedData) => {
        try {
            const oldSale = sales.find(s => s.id === id);

            // 1. Revert old stock (Add back)
            if (oldSale) {
                for (const item of oldSale.items) {
                    await fetch(`${API_URL}/stocks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'product', name: item.name, qty: Number(item.qty) })
                    });
                }
            }

            // 2. Update Sale
            await updateItem('sales', id, updatedData, setSales, sales, mapSale);

            // 3. Apply new stock (Deduct)
            for (const item of updatedData.items) {
                await fetch(`${API_URL}/stocks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'product', name: item.name, qty: -Number(item.qty) })
                });
            }

            // 4. Refetch stocks
            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error updating sale:", err);
        }
    };

    const deleteOrder = (id) => deleteItem('orders', id, setOrders, orders);
    const updateOrder = (id, data) => updateItem('orders', id, data, setOrders, orders, mapOrder);

    const deleteProduction = async (id) => {
        try {
            const prodToDelete = production.find(p => p.id === id);
            if (prodToDelete) {
                // Revert stock (Decrease, because production added stock)
                // Use packedQty if available, otherwise raw qty? 
                // Usually production adds 'item' stock. 
                // Let's assume 'item' is the product name and 'packedQty' is the final yield if present, else 'qty'.
                // Ideally, we should use the same logic as addProduction.
                // In addProduction: type: 'product', name: prod.item, qty: prod.qty
                // Wait, addProduction uses prod.qty. Let's stick to that for consistency unless the user specified otherwise.
                // Actually, looking at addProduction implementation above (lines 167-172), it uses prod.qty.

                await fetch(`${API_URL}/stocks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'product', name: prodToDelete.item, qty: -Number(prodToDelete.qty) })
                });
            }
            await deleteItem('production', id, setProduction, production);

            // Refetch stocks
            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error deleting production:", err);
        }
    };

    const updateProduction = async (id, updatedData) => {
        try {
            const oldProd = production.find(p => p.id === id);

            // 1. Revert old stock (Decrease)
            if (oldProd) {
                await fetch(`${API_URL}/stocks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'product', name: oldProd.item, qty: -Number(oldProd.qty) })
                });
            }

            // 2. Update Production
            await updateItem('production', id, updatedData, setProduction, production, mapProduction);

            // 3. Apply new stock (Increase)
            await fetch(`${API_URL}/stocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'product', name: updatedData.item, qty: Number(updatedData.qty) })
            });

            // 4. Refetch stocks
            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error updating production:", err);
        }
    };



    const deleteStock = async (type, name) => {
        try {
            const res = await fetch(`${API_URL}/stocks/${type}/${encodeURIComponent(name)}`, { method: 'DELETE' });
            if (res.ok) {
                // Refetch stocks to simplify state update for composite key
                const stocksRes = await fetch(`${API_URL}/stocks`);
                setStocks(await stocksRes.json());
            }
        } catch (err) {
            console.error("Error deleting stock:", err);
        }
    };

    const updateStock = async (type, name, data) => {
        try {
            await fetch(`${API_URL}/stocks/${type}/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error updating stock:", err);
        }
    };

    const deleteEmployee = async (id) => {
        try {
            const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Failed to delete employee:', errorText);
                throw new Error(`Failed to delete employee: ${res.statusText}`);
            }
            // Refetch all employees to ensure consistency
            const employeesRes = await fetch(`${API_URL}/employees`);
            if (!employeesRes.ok) {
                throw new Error('Failed to fetch employees');
            }
            const employeesData = await employeesRes.json();
            setEmployees(employeesData.map(mapEmployee));
            console.log('Employee deleted and list refreshed');
        } catch (err) {
            console.error('Error deleting employee:', err);
            throw err;
        }
    };
    const updateEmployee = (id, data) => updateItem('employees', id, data, setEmployees, employees, mapEmployee);

    const deleteCustomer = (id) => deleteItem('customers', id, setCustomers, customers);
    const updateCustomer = (id, data) => updateItem('customers', id, data, setCustomers, customers);

    const deleteAttendance = (id) => deleteItem('attendance', id, setAttendance, attendance);

    const deleteRawMaterialPurchase = (id) => deleteItem('raw-material-purchases', id, setRawMaterialPurchases, rawMaterialPurchases);
    const updateRawMaterialPurchase = (id, data) => updateItem('raw-material-purchases', id, data, setRawMaterialPurchases, rawMaterialPurchases, mapPurchase);
    const addRawMaterialPrice = (data) => addItem('raw-material-prices', data, setRawMaterialPrices, rawMaterialPrices, mapRawMaterialPrice);
    const updateRawMaterialPrice = (id, data) => updateItem('raw-material-prices', id, data, setRawMaterialPrices, rawMaterialPrices, mapRawMaterialPrice);
    const deleteRawMaterialPrice = (id) => deleteItem('raw-material-prices', id, setRawMaterialPrices, rawMaterialPrices);

    // Products CRUD
    const addProduct = async (data) => {
        try {
            await addItem('products', data, setProducts, products);
        } catch (err) {
            console.error('Error adding product:', err);
            throw err;
        }
    };

    const updateProduct = async (id, data) => {
        try {
            await updateItem('products', id, data, setProducts, products);
        } catch (err) {
            console.error('Error updating product:', err);
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        try {
            // Soft delete - just deactivate
            await updateProduct(id, { active: false });
        } catch (err) {
            console.error('Error deleting product:', err);
            throw err;
        }
    };

    // ========== FARM MODULE FUNCTIONS ==========

    // Farm Crops CRUD
    const addFarmCrop = async (data) => {
        try {
            const newCrop = { ...data, id: Date.now() };
            await addItem('farm/crops', newCrop, setFarmCrops, farmCrops);
        } catch (err) {
            console.error('Error adding farm crop:', err);
            throw err;
        }
    };

    const updateFarmCrop = async (id, data) => {
        try {
            await updateItem('farm/crops', id, data, setFarmCrops, farmCrops);
        } catch (err) {
            console.error('Error updating farm crop:', err);
            throw err;
        }
    };

    const deleteFarmCrop = async (id) => {
        try {
            await deleteItem('farm/crops', id, setFarmCrops, farmCrops);
        } catch (err) {
            console.error('Error deleting farm crop:', err);
            throw err;
        }
    };

    // Farm Expenses CRUD
    const addFarmExpense = async (data) => {
        try {
            const newExpense = { ...data, id: Date.now() };
            const res = await fetch(`${API_URL}/farm/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            const savedExpense = await res.json();
            setFarmExpenses([savedExpense, ...farmExpenses]);
        } catch (err) {
            console.error('Error adding farm expense:', err);
            throw err;
        }
    };

    const updateFarmExpense = async (id, data) => {
        try {
            await updateItem('farm/expenses', id, data, setFarmExpenses, farmExpenses);
        } catch (err) {
            console.error('Error updating farm expense:', err);
            throw err;
        }
    };

    const deleteFarmExpense = async (id) => {
        try {
            await deleteItem('farm/expenses', id, setFarmExpenses, farmExpenses);
        } catch (err) {
            console.error('Error deleting farm expense:', err);
            throw err;
        }
    };

    // Farm Income CRUD
    const addFarmIncome = async (data) => {
        try {
            const newIncome = { ...data, id: Date.now() };
            await addItem('farm/income', newIncome, setFarmIncome, farmIncome);
        } catch (err) {
            console.error('Error adding farm income:', err);
            throw err;
        }
    };

    const updateFarmIncome = async (id, data) => {
        try {
            await updateItem('farm/income', id, data, setFarmIncome, farmIncome);
        } catch (err) {
            console.error('Error updating farm income:', err);
            throw err;
        }
    };

    const deleteFarmIncome = async (id) => {
        try {
            await deleteItem('farm/income', id, setFarmIncome, farmIncome);
        } catch (err) {
            console.error('Error deleting farm income:', err);
            throw err;
        }
    };

    // Farm Expense Categories CRUD
    const addFarmExpenseCategory = async (data) => {
        try {
            const newCategory = { ...data, id: Date.now(), subcategories: [] };
            const res = await fetch(`${API_URL}/farm/expense-categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });
            const savedCategory = await res.json();
            setFarmExpenseCategories([...farmExpenseCategories, savedCategory]);
        } catch (err) {
            console.error('Error adding farm expense category:', err);
            throw err;
        }
    };

    const updateFarmExpenseCategory = async (id, data) => {
        try {
            await updateItem('farm/expense-categories', id, data, setFarmExpenseCategories, farmExpenseCategories);
        } catch (err) {
            console.error('Error updating farm expense category:', err);
            throw err;
        }
    };

    const deleteFarmExpenseCategory = async (id) => {
        try {
            await deleteItem('farm/expense-categories', id, setFarmExpenseCategories, farmExpenseCategories);
        } catch (err) {
            console.error('Error deleting farm expense category:', err);
            throw err;
        }
    };

    // Farm Expense Subcategories CRUD
    const addFarmExpenseSubcategory = async (data) => {
        try {
            const newSubcategory = { ...data, id: Date.now() };
            const res = await fetch(`${API_URL}/farm/expense-subcategories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubcategory)
            });
            const savedSubcategory = await res.json();

            // Update the categories state to include the new subcategory
            const categoriesRes = await fetch(`${API_URL}/farm/expense-categories`);
            setFarmExpenseCategories(await categoriesRes.json());
        } catch (err) {
            console.error('Error adding farm expense subcategory:', err);
            throw err;
        }
    };

    const updateFarmExpenseSubcategory = async (id, data) => {
        try {
            const res = await fetch(`${API_URL}/farm/expense-subcategories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // Refresh categories to get updated subcategories
            const categoriesRes = await fetch(`${API_URL}/farm/expense-categories`);
            setFarmExpenseCategories(await categoriesRes.json());
        } catch (err) {
            console.error('Error updating farm expense subcategory:', err);
            throw err;
        }
    };

    const deleteFarmExpenseSubcategory = async (id) => {
        try {
            await fetch(`${API_URL}/farm/expense-subcategories/${id}`, { method: 'DELETE' });

            // Refresh categories to get updated subcategories
            const categoriesRes = await fetch(`${API_URL}/farm/expense-categories`);
            setFarmExpenseCategories(await categoriesRes.json());
        } catch (err) {
            console.error('Error deleting farm expense subcategory:', err);
            throw err;
        }
    };

    // --- Farm Timeline Functions ---
    const addFarmTimeline = async (data) => {
        try {
            const newTask = { ...data, id: Date.now() };
            await addItem('farm/timeline', newTask, setFarmTimeline, farmTimeline);
        } catch (err) {
            console.error('Error adding farm timeline task:', err);
            throw err;
        }
    };

    const updateFarmTimeline = async (id, data) => {
        try {
            await updateItem('farm/timeline', id, data, setFarmTimeline, farmTimeline);
        } catch (err) {
            console.error('Error updating farm timeline task:', err);
            throw err;
        }
    };

    const deleteFarmTimeline = async (id) => {
        try {
            await deleteItem('farm/timeline', id, setFarmTimeline, farmTimeline);
        } catch (err) {
            console.error('Error deleting farm timeline task:', err);
            throw err;
        }
    };

    // --- Crop Types (Master List) Functions ---
    const addCropType = (cropType) => {
        const newCropType = { ...cropType, id: Date.now() };
        setCropTypes([newCropType, ...cropTypes]);
        return newCropType;
    };

    const updateCropType = (id, updatedData) => {
        setCropTypes(cropTypes.map(ct => ct.id === id ? { ...updatedData, id } : ct));
    };

    const deleteCropType = (id) => {
        setCropTypes(cropTypes.filter(ct => ct.id !== id));
    };


    return (
        <DataContext.Provider value={{
            sales, addSale, markSaleAsPaid, updateSaleAmountReceived, deleteSale, updateSale,
            production, addProduction, deleteProduction, updateProduction,
            expenses, addExpense, deleteExpense, updateExpense,
            stocks, addStock, deleteStock, updateStock,
            customers, addCustomer, deleteCustomer, updateCustomer,
            employees, addEmployee, deleteEmployee, updateEmployee,
            attendance, markAttendance, deleteAttendance,
            orders, addOrder, updateOrderStatus, convertOrderToSale, clearOrder, markOrderAsPaid, updateOrderAmountReceived, deleteOrder, updateOrder,
            rawMaterialPurchases, addRawMaterialPurchase, deleteRawMaterialPurchase, updateRawMaterialPurchase,
            rawMaterialUsage, addRawMaterialUsage, deleteRawMaterialUsage, updateRawMaterialUsage,
            rawMaterialPrices, addRawMaterialPrice, updateRawMaterialPrice, deleteRawMaterialPrice,
            products, addProduct, updateProduct, deleteProduct,
            // Farm Module
            farmCrops, addFarmCrop, updateFarmCrop, deleteFarmCrop,
            farmExpenses, addFarmExpense, updateFarmExpense, deleteFarmExpense,
            farmIncome, addFarmIncome, updateFarmIncome, deleteFarmIncome,
            farmExpenseCategories, addFarmExpenseCategory, updateFarmExpenseCategory, deleteFarmExpenseCategory,
            addFarmExpenseSubcategory, updateFarmExpenseSubcategory, deleteFarmExpenseSubcategory,
            farmTimeline, addFarmTimeline, updateFarmTimeline, deleteFarmTimeline,
            cropTypes, addCropType, updateCropType, deleteCropType,
            items,
            loading, refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};
