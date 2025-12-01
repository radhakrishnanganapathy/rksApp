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
    const [items] = useState(ITEMS);
    const [loading, setLoading] = useState(true);

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
        employeeId: a.employee_id
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

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoints = [
                    'sales', 'production', 'expenses', 'stocks',
                    'customers', 'employees', 'attendance', 'orders', 'raw-material-purchases', 'raw-material-usage'
                ];

                const responses = await Promise.all(
                    endpoints.map(endpoint => fetch(`${API_URL}/${endpoint}`))
                );

                // Check for errors
                for (let i = 0; i < responses.length; i++) {
                    if (!responses[i].ok) {
                        throw new Error(`Failed to fetch ${endpoints[i]}: ${responses[i].statusText}`);
                    }
                }

                const data = await Promise.all(responses.map(res => res.json()));

                setSales(data[0]?.map(mapSale) || []);
                setProduction(data[1]?.map(mapProduction) || []);
                setExpenses(data[2]?.map(mapExpense) || []);
                setStocks(data[3] || { products: [], rawMaterials: [] });
                setCustomers(data[4] || []);
                setEmployees(data[5]?.map(mapEmployee) || []);
                setAttendance(data[6]?.map(mapAttendance) || []);
                setOrders(data[7]?.map(mapOrder) || []);
                setRawMaterialPurchases(data[8]?.map(mapPurchase) || []);
                setRawMaterialUsage(data[9]?.map(mapUsage) || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    const markAttendance = async (employeeId, date, status) => {
        try {
            const res = await fetch(`${API_URL}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Date.now(), employeeId, date, status })
            });
            // Refetch attendance
            const attendanceRes = await fetch(`${API_URL}/attendance`);
            const attendanceData = await attendanceRes.json();
            setAttendance(attendanceData.map(mapAttendance));
        } catch (err) {
            console.error("Error marking attendance:", err);
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

    // Specific Delete/Update Functions
    const deleteSale = (id) => deleteItem('sales', id, setSales, sales);
    const updateSale = (id, data) => updateItem('sales', id, data, setSales, sales, mapSale);

    const deleteOrder = (id) => deleteItem('orders', id, setOrders, orders);
    const updateOrder = (id, data) => updateItem('orders', id, data, setOrders, orders, mapOrder);

    const deleteProduction = (id) => deleteItem('production', id, setProduction, production);
    const updateProduction = (id, data) => updateItem('production', id, data, setProduction, production, mapProduction);



    const deleteStock = async (type, name) => {
        try {
            const res = await fetch(`${API_URL}/stocks/${type}/${name}`, { method: 'DELETE' });
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
            await fetch(`${API_URL}/stocks/${type}/${name}`, {
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

    const deleteEmployee = (id) => deleteItem('employees', id, setEmployees, employees);
    const updateEmployee = (id, data) => updateItem('employees', id, data, setEmployees, employees, mapEmployee);

    const deleteCustomer = (id) => deleteItem('customers', id, setCustomers, customers);
    const updateCustomer = (id, data) => updateItem('customers', id, data, setCustomers, customers);

    const deleteAttendance = (id) => deleteItem('attendance', id, setAttendance, attendance);

    const deleteRawMaterialPurchase = (id) => deleteItem('raw-material-purchases', id, setRawMaterialPurchases, rawMaterialPurchases);
    const updateRawMaterialPurchase = (id, data) => updateItem('raw-material-purchases', id, data, setRawMaterialPurchases, rawMaterialPurchases, mapPurchase);


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
            items,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
