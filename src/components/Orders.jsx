import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { Plus, Trash2, Save, ClipboardList, Package, Calendar, CheckCircle, XCircle, Clock, Edit, ArrowLeft } from 'lucide-react';

const Orders = ({ onNavigateBack }) => {
    const { customers, products, stocks, orders, addOrder, updateOrder, updateOrderStatus, convertOrderToSale, clearOrder, deleteOrder, updateStock } = useData();

    // Filter active products for dropdown
    const activeProducts = products.filter(p => p.active);

    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'list'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
    const [deliveryOrderId, setDeliveryOrderId] = useState(null);
    const [deliveryPaymentStatus, setDeliveryPaymentStatus] = useState('paid');

    // Form state
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [orderItems, setOrderItems] = useState([]);
    const [currentItem, setCurrentItem] = useState('');
    const [currentQty, setCurrentQty] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [orderStatus, setOrderStatus] = useState('waiting');
    const [paymentStatus, setPaymentStatus] = useState('paid');

    // Filter state
    const [statusFilter, setStatusFilter] = useState('all');

    const handleAddItem = () => {
        if (!currentItem || Number(currentQty) <= 0 || Number(currentPrice) <= 0) return;

        // Check stock
        const stockItem = stocks.products.find(p => p.name === currentItem);
        if (stockItem && stockItem.qty < Number(currentQty)) {
            alert(`Insufficient stock! Only ${stockItem.qty} available.`);
            return;
        }

        setOrderItems([...orderItems, {
            name: currentItem,
            qty: Number(currentQty),
            price: Number(currentPrice),
            total: Number(currentQty) * Number(currentPrice)
        }]);

        setCurrentItem('');
        setCurrentQty(1);
        setCurrentPrice(0);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const calculateTotal = () => {
        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
        return subtotal - Number(discount);
    };

    const handleSaveOrder = () => {
        if (!selectedCustomer || orderItems.length === 0) return;

        const orderData = {
            bookingDate,
            dueDate,
            customerId: Number(selectedCustomer),
            items: orderItems,
            discount: Number(discount),
            total: calculateTotal(),
            status: orderStatus,
            paymentStatus
        };

        if (editingOrderId) {
            updateOrder(editingOrderId, orderData);
            alert('Order Updated Successfully!');
            setEditingOrderId(null);
        } else {
            addOrder(orderData);
            alert('Order Saved Successfully!');
        }

        // Reset form
        resetForm();
        setActiveTab('list');
    };

    const resetForm = () => {
        setOrderItems([]);
        setSelectedCustomer('');
        setDiscount(0);
        setBookingDate(new Date().toISOString().split('T')[0]);
        setDueDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setOrderStatus('waiting');
        setPaymentStatus('paid');
    };

    const handleEditOrder = (order) => {
        setEditingOrderId(order.id);
        setSelectedCustomer(order.customerId);
        setBookingDate(order.bookingDate);
        setDueDate(order.dueDate);
        setOrderItems(order.items);
        setDiscount(order.discount);
        setOrderStatus(order.status);
        setPaymentStatus(order.paymentStatus);
        setActiveTab('new');
    };

    const handleDeleteOrder = (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            deleteOrder(orderId);
        }
    };

    const cancelEdit = () => {
        setEditingOrderId(null);
        resetForm();
    };

    const handleMarkDelivered = (orderId) => {
        setDeliveryOrderId(orderId);
        const order = orders.find(o => o.id === orderId);
        setDeliveryPaymentStatus(order?.paymentStatus || 'paid');
        setShowDeliveryDialog(true);
    };

    const confirmDelivery = async () => {
        if (!deliveryOrderId) return;

        const order = orders.find(o => o.id === deliveryOrderId);
        if (!order) return;

        // Update order status to delivered
        await updateOrderStatus(deliveryOrderId, 'delivered');

        // Update payment status if changed
        if (deliveryPaymentStatus !== order.paymentStatus) {
            const updatedOrder = {
                ...order,
                paymentStatus: deliveryPaymentStatus,
                amountReceived: deliveryPaymentStatus === 'paid' ? order.total : 0
            };
            await updateOrder(deliveryOrderId, updatedOrder);
        }

        // Decrease stock for each item in the order
        for (const item of order.items) {
            const stockItem = stocks.products.find(p => p.name === item.name);
            if (stockItem) {
                const newQty = Number(stockItem.qty) - Number(item.qty);
                // Only update if we have a valid stock item
                if (newQty >= 0) {
                    await updateStock('product', item.name, { ...stockItem, qty: newQty });
                }
            }
        }

        setShowDeliveryDialog(false);
        setDeliveryOrderId(null);
        alert('Order marked as delivered!');
    };

    const handleCancelOrder = (orderId) => {
        updateOrderStatus(orderId, 'cancelled');
        alert('Order cancelled!');
    };

    const getStatusBadge = (status) => {
        const badges = {
            waiting: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Waiting' },
            delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Delivered' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled' }
        };
        const badge = badges[status];
        const Icon = badge.icon;
        return (
            <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    const filteredOrders = orders.filter(order =>
        statusFilter === 'all' || order.status === statusFilter
    );

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown';
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <button onClick={onNavigateBack} className="p-1 rounded-full hover:bg-gray-200">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ClipboardList size={24} />
                    Orders
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${activeTab === 'new' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    {editingOrderId ? 'Edit Order' : 'New Order'}
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${activeTab === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Order List ({orders.length})
                </button>
            </div>

            {/* New Order Tab */}
            {activeTab === 'new' && (
                <>
                    {/* Customer & Dates Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Customer</label>
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                                <input
                                    type="date"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="waiting"
                                        checked={orderStatus === 'waiting'}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                    />
                                    <span className="text-sm">Waiting</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="delivered"
                                        checked={orderStatus === 'delivered'}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                    />
                                    <span className="text-sm">Delivered</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="cancelled"
                                        checked={orderStatus === 'cancelled'}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                    />
                                    <span className="text-sm">Cancelled</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="paymentStatus"
                                        value="paid"
                                        checked={paymentStatus === 'paid'}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                    />
                                    <span className="text-sm">Paid</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="paymentStatus"
                                        value="not_paid"
                                        checked={paymentStatus === 'not_paid'}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                    />
                                    <span className="text-sm">Not Paid</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Add Items Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                        <h3 className="font-semibold text-gray-700">Add Items</h3>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                                <select
                                    value={currentItem}
                                    onChange={(e) => setCurrentItem(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="">Select Product</option>
                                    {activeProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <input
                                type="number"
                                placeholder="Qty"
                                value={currentQty}
                                onChange={(e) => setCurrentQty(Number(e.target.value))}
                                className="border rounded p-2"
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={currentPrice}
                                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                                className="border rounded p-2"
                            />
                        </div>
                        <button
                            onClick={handleAddItem}
                            className="w-full bg-primary-600 text-white py-2 rounded flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Add Item
                        </button>
                    </div>

                    {/* Order Items List */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
                        <div className="space-y-2">
                            {orderItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.qty} x {formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                                        <button onClick={() => handleRemoveItem(idx)} className="text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t space-y-2">
                            <div className="flex justify-between items-center">
                                <span>Discount</span>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="border rounded p-1 w-24 text-right"
                                />
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveOrder}
                            disabled={orderItems.length === 0}
                            className={`w-full mt-4 bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold ${orderItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={20} /> {editingOrderId ? 'Update Order' : 'Save Order'}
                        </button>
                        {editingOrderId && (
                            <button
                                onClick={cancelEdit}
                                className="w-full mt-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Order List Tab */}
            {activeTab === 'list' && (
                <>
                    {/* Status Filter */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="all">All Orders</option>
                            <option value="waiting">Waiting</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-3">
                        {filteredOrders.length === 0 && (
                            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                                <Package size={48} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500">No orders found</p>
                            </div>
                        )}

                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-800">{getCustomerName(order.customerId)}</p>
                                        <p className="text-xs text-gray-500">Order #{order.id}</p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <p className="text-gray-500 text-xs">Booking Date</p>
                                        <p className="font-medium">{new Date(order.bookingDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Due Date</p>
                                        <p className="font-medium">{new Date(order.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-2 mb-3">
                                    <p className="text-xs text-gray-500 mb-1">Items:</p>
                                    {order.items.map((item, idx) => (
                                        <p key={idx} className="text-sm">
                                            {item.name} - {item.qty} x {formatCurrency(item.price)}
                                        </p>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditOrder(order)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                            title="Edit Order"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                            title="Delete Order"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        {order.status === 'waiting' && (
                                            <>
                                                <button
                                                    onClick={() => handleMarkDelivered(order.id)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                                >
                                                    <CheckCircle size={14} />
                                                    Deliver
                                                </button>
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                                >
                                                    <XCircle size={14} />
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Delivery Payment Dialog */}
            {showDeliveryDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Payment Status</h3>
                        <p className="text-gray-600 mb-4">
                            Select the payment status for this order:
                        </p>

                        <div className="space-y-3 mb-6">
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="deliveryPayment"
                                    value="paid"
                                    checked={deliveryPaymentStatus === 'paid'}
                                    onChange={(e) => setDeliveryPaymentStatus(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <span className="font-medium text-gray-800">Paid</span>
                                    <p className="text-xs text-gray-500">Payment has been received</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="deliveryPayment"
                                    value="not_paid"
                                    checked={deliveryPaymentStatus === 'not_paid'}
                                    onChange={(e) => setDeliveryPaymentStatus(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <span className="font-medium text-gray-800">Not Paid</span>
                                    <p className="text-xs text-gray-500">Payment pending</p>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowDeliveryDialog(false);
                                    setDeliveryOrderId(null);
                                }}
                                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelivery}
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
