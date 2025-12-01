import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { Plus, Trash2, Save, AlertCircle, UserPlus, List, FileText } from 'lucide-react';
import BillingList from './BillingList';

const Billing = () => {
    const { customers, items, stocks, addSale, updateSale, sales, addCustomer } = useData();

    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'list'
    const [editingSaleId, setEditingSaleId] = useState(null);

    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [billItems, setBillItems] = useState([]);
    const [currentItem, setCurrentItem] = useState('');
    const [currentQty, setCurrentQty] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState('paid');
    const [showFrequentBuyerAlert, setShowFrequentBuyerAlert] = useState(false);

    const [editingItemIndex, setEditingItemIndex] = useState(null);

    // New Customer Modal States
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerShopName, setNewCustomerShopName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [newCustomerArea, setNewCustomerArea] = useState('');

    // Check for frequent buyer alert when customer changes
    useEffect(() => {
        if (selectedCustomer) {
            const lastSale = sales
                .filter(s => s.customerId === Number(selectedCustomer))
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            if (lastSale) {
                const daysSinceLastBuy = (new Date() - new Date(lastSale.date)) / (1000 * 60 * 60 * 24);
                if (daysSinceLastBuy > 4) {
                    setShowFrequentBuyerAlert(true);
                } else {
                    setShowFrequentBuyerAlert(false);
                }
            } else {
                setShowFrequentBuyerAlert(false);
            }
        }
    }, [selectedCustomer, sales]);

    const handleAddItem = () => {
        if (!currentItem || Number(currentQty) <= 0 || Number(currentPrice) <= 0) return;

        // Check stock
        const stockItem = stocks.products.find(p => p.name === currentItem);
        // If editing, we need to account for the qty we already have in the bill
        const existingQtyInBill = editingItemIndex !== null ? billItems[editingItemIndex].qty : 0;

        if (stockItem && (stockItem.qty + existingQtyInBill) < Number(currentQty)) {
            alert(`Insufficient stock! Only ${stockItem.qty} available.`);
            return;
        }

        const newItem = {
            name: currentItem,
            qty: Number(currentQty),
            price: Number(currentPrice),
            total: Number(currentQty) * Number(currentPrice)
        };

        if (editingItemIndex !== null) {
            const newItems = [...billItems];
            newItems[editingItemIndex] = newItem;
            setBillItems(newItems);
            setEditingItemIndex(null);
        } else {
            setBillItems([...billItems, newItem]);
        }

        // Reset item fields
        setCurrentItem('');
        setCurrentQty(1);
        setCurrentPrice(0);
    };

    const handleEditItem = (index) => {
        const item = billItems[index];
        setCurrentItem(item.name);
        setCurrentQty(item.qty);
        setCurrentPrice(item.price);
        setEditingItemIndex(index);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...billItems];
        newItems.splice(index, 1);
        setBillItems(newItems);
        if (editingItemIndex === index) {
            setEditingItemIndex(null);
            setCurrentItem('');
            setCurrentQty(1);
            setCurrentPrice(0);
        }
    };

    const calculateTotal = () => {
        const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
        return subtotal - Number(discount);
    };

    const handleSaveBill = () => {
        if (!selectedCustomer || billItems.length === 0) return;

        const saleData = {
            date: billDate,
            customerId: Number(selectedCustomer),
            items: billItems,
            discount: Number(discount),
            total: calculateTotal(),
            paymentStatus
        };

        if (editingSaleId) {
            updateSale(editingSaleId, saleData);
            alert('Bill Updated Successfully!');
            setEditingSaleId(null);
        } else {
            addSale(saleData);
            alert('Bill Saved Successfully!');
        }

        // Reset Form
        resetForm();
    };

    const resetForm = () => {
        setBillItems([]);
        setSelectedCustomer('');
        setDiscount(0);
        setPaymentStatus('paid');
        setEditingSaleId(null);
        setBillDate(new Date().toISOString().split('T')[0]);
        setEditingItemIndex(null);
        setCurrentItem('');
        setCurrentQty(1);
        setCurrentPrice(0);
    };

    const handleEditSale = (sale) => {
        setEditingSaleId(sale.id);
        setSelectedCustomer(sale.customerId);
        setBillDate(sale.date.split('T')[0]);
        setBillItems(sale.items);
        setDiscount(sale.discount);
        setPaymentStatus(sale.paymentStatus);
        setActiveTab('new');
    };

    const handleAddNewCustomer = () => {
        if (!newCustomerName.trim()) {
            alert('Customer Name is required!');
            return;
        }

        const newCustomer = addCustomer({
            name: newCustomerName.trim(),
            shopName: newCustomerShopName.trim(),
            phone: newCustomerPhone.trim(),
            area: newCustomerArea.trim()
        });

        // Select the newly created customer
        if (newCustomer && newCustomer.id) {
            setSelectedCustomer(newCustomer.id);
        }

        // Close modal and reset fields
        setShowAddCustomerModal(false);
        setNewCustomerName('');
        setNewCustomerShopName('');
        setNewCustomerPhone('');
        setNewCustomerArea('');

        alert('Customer added successfully!');
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${activeTab === 'new' ? 'bg-white shadow text-primary-600 font-medium' : 'text-gray-600'}`}
                >
                    <FileText size={18} />
                    {editingSaleId ? 'Edit Invoice' : 'New Invoice'}
                </button>
                <button
                    onClick={() => { setActiveTab('list'); resetForm(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${activeTab === 'list' ? 'bg-white shadow text-primary-600 font-medium' : 'text-gray-600'}`}
                >
                    <List size={18} />
                    Sales List
                </button>
            </div>

            {activeTab === 'new' ? (
                <>
                    {/* Customer Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Customer</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                className="w-full border rounded p-2"
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button
                                onClick={() => setShowAddCustomerModal(true)}
                                className="p-2 bg-gray-100 rounded text-blue-600 hover:bg-blue-50"
                                title="Add New Customer"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>

                        {showFrequentBuyerAlert && (
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded text-sm">
                                <AlertCircle size={16} />
                                <span>Customer hasn't bought in 4+ days!</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Bill Date</label>
                            <input
                                type="date"
                                value={billDate}
                                onChange={(e) => setBillDate(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Payment Status</label>
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
                                    {items.map(i => <option key={i} value={i}>{i}</option>)}
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
                            className={`w-full text-white py-2 rounded flex items-center justify-center gap-2 ${editingItemIndex !== null ? 'bg-amber-600' : 'bg-primary-600'}`}
                        >
                            {editingItemIndex !== null ? <Save size={18} /> : <Plus size={18} />}
                            {editingItemIndex !== null ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>

                    {/* Bill Items List */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
                        <div className="space-y-2">
                            {billItems.map((item, idx) => (
                                <div key={idx} className={`flex justify-between items-center border-b pb-2 last:border-0 ${editingItemIndex === idx ? 'bg-amber-50 p-2 rounded' : ''}`}>
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.qty} x {formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEditItem(idx)} className="text-blue-500 p-1 hover:bg-blue-50 rounded">
                                                <FileText size={16} />
                                            </button>
                                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
                            onClick={handleSaveBill}
                            disabled={billItems.length === 0}
                            className={`w-full mt-4 bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold ${billItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={20} /> {editingSaleId ? 'Update Invoice' : 'Save Invoice'}
                        </button>

                        {editingSaleId && (
                            <button
                                onClick={resetForm}
                                className="w-full mt-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <BillingList onEdit={handleEditSale} />
            )}

            {/* Add Customer Modal */}
            {showAddCustomerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add New Customer</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Customer Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Shop Name (Optional)</label>
                                <input
                                    type="text"
                                    value={newCustomerShopName}
                                    onChange={(e) => setNewCustomerShopName(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Shop Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Area (Optional)</label>
                                <input
                                    type="text"
                                    value={newCustomerArea}
                                    onChange={(e) => setNewCustomerArea(e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Area"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        setShowAddCustomerModal(false);
                                        setNewCustomerName('');
                                        setNewCustomerShopName('');
                                        setNewCustomerPhone('');
                                        setNewCustomerArea('');
                                    }}
                                    className="flex-1 py-2 border rounded text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddNewCustomer}
                                    className="flex-1 py-2 bg-primary-600 text-white rounded flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
