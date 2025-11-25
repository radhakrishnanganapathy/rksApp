import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils';
import { Plus, Trash2, Save, AlertCircle, UserPlus } from 'lucide-react';

const Billing = () => {
    const { customers, items, stocks, addSale, sales } = useData();

    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [billItems, setBillItems] = useState([]);
    const [currentItem, setCurrentItem] = useState('');
    const [currentQty, setCurrentQty] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState('paid');
    const [showFrequentBuyerAlert, setShowFrequentBuyerAlert] = useState(false);

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
        if (stockItem && stockItem.qty < Number(currentQty)) {
            alert(`Insufficient stock! Only ${stockItem.qty} available.`);
            return;
        }

        setBillItems([...billItems, {
            name: currentItem,
            qty: Number(currentQty),
            price: Number(currentPrice),
            total: Number(currentQty) * Number(currentPrice)
        }]);

        // Reset item fields
        setCurrentItem('');
        setCurrentQty(1);
        setCurrentPrice(0);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...billItems];
        newItems.splice(index, 1);
        setBillItems(newItems);
    };

    const calculateTotal = () => {
        const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
        return subtotal - Number(discount);
    };

    const handleSaveBill = () => {
        if (!selectedCustomer || billItems.length === 0) return;

        const newSale = {
            date: billDate,
            customerId: Number(selectedCustomer),
            items: billItems,
            discount: Number(discount),
            total: calculateTotal(),
            paymentStatus
        };

        addSale(newSale);

        // Reset Form
        setBillItems([]);
        setSelectedCustomer('');
        setDiscount(0);
        setPaymentStatus('paid');
        alert('Bill Saved Successfully!');
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold text-gray-800">New Invoice</h2>

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
                    <button className="p-2 bg-gray-100 rounded text-blue-600"><UserPlus size={20} /></button>
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
                    className="w-full bg-primary-600 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add Item
                </button>
            </div>

            {/* Bill Items List */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
                <div className="space-y-2">
                    {billItems.map((item, idx) => (
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
                    onClick={handleSaveBill}
                    disabled={billItems.length === 0}
                    className={`w-full mt-4 bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold ${billItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Save size={20} /> Save Invoice
                </button>
            </div>
        </div>
    );
};

export default Billing;
