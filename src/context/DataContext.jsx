import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData, ITEMS } from '../data/mockDb';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const [sales, setSales] = useState([]);
    const [production, setProduction] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [stocks, setStocks] = useState({ products: [], rawMaterials: [] });
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [orders, setOrders] = useState([]);
    const [rawMaterialPurchases, setRawMaterialPurchases] = useState([]);
    const [items] = useState(ITEMS);
    const [loading, setLoading] = useState(true);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    salesRes, productionRes, expensesRes, stocksRes,
                    customersRes, employeesRes, attendanceRes, ordersRes, rawMaterialsRes
                ] = await Promise.all([
                    fetch(`${API_URL}/sales`),
                    fetch(`${API_URL}/production`),
                    fetch(`${API_URL}/expenses`),
                    fetch(`${API_URL}/stocks`),
                    fetch(`${API_URL}/customers`),
                    fetch(`${API_URL}/employees`),
                    fetch(`${API_URL}/attendance`),
                    fetch(`${API_URL}/orders`),
                    fetch(`${API_URL}/raw-material-purchases`)
                ]);

                setSales(await salesRes.json());
                setProduction(await productionRes.json());
                setExpenses(await expensesRes.json());
                setStocks(await stocksRes.json());
                setCustomers(await customersRes.json());
                setEmployees(await employeesRes.json());
                setAttendance(await attendanceRes.json());
                setOrders(await ordersRes.json());
                setRawMaterialPurchases(await rawMaterialsRes.json());
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
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
            setSales([savedSale, ...sales]);

            // Update local stock state optimistically (backend doesn't auto-update stock table based on sales yet, logic is in frontend)
            // Ideally backend should handle this transaction. For now, we update stock in frontend state AND send stock update to backend?
            // The backend /api/stocks POST endpoint is an upsert. We can use that.

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
            setProduction([savedProd, ...production]);

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
            const savedExpense = await res.json();
            setExpenses([savedExpense, ...expenses]);
        } catch (err) {
            console.error("Error adding expense:", err);
        }
    };

    const addStock = async (type, item, qty) => {
        try {
            await fetch(`${API_URL}/stocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type === 'products' ? 'product' : 'raw_material', name: item, qty: Number(qty) })
            });
            const stocksRes = await fetch(`${API_URL}/stocks`);
            setStocks(await stocksRes.json());
        } catch (err) {
            console.error("Error adding stock:", err);
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
            setEmployees([...employees, savedEmployee]);
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
            setAttendance(await attendanceRes.json());
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
            setOrders([savedOrder, ...orders]);
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
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        } catch (err) {
            console.error("Error updating order status:", err);
        }
    };

    const convertOrderToSale = async (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.status !== 'delivered') return;

        const sale = {
            date: order.dueDate,
            customerId: order.customerId,
            items: order.items,
            discount: order.discount,
            total: order.total,
            paymentStatus: order.paymentStatus,
            amountReceived: order.amountReceived
        };

        await addSale(sale);
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
            setRawMaterialPurchases([savedPurchase, ...rawMaterialPurchases]);

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
            setSales(sales.map(s => s.id === saleId ? updatedSale : s));
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
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
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
            setSales(sales.map(s => s.id === saleId ? updatedSale : s));
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
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        } catch (err) {
            console.error("Error updating order amount:", err);
        }
    };

    return (
        <DataContext.Provider value={{
            sales, addSale, markSaleAsPaid, updateSaleAmountReceived,
            production, addProduction,
            expenses, addExpense,
            stocks, addStock,
            customers, addCustomer,
            employees, addEmployee,
            attendance, markAttendance,
            orders, addOrder, updateOrderStatus, convertOrderToSale, markOrderAsPaid, updateOrderAmountReceived,
            rawMaterialPurchases, addRawMaterialPurchase,
            items,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
