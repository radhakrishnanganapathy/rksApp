import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Save, UserPlus, Phone, MapPin, Store, Trash2, Edit } from 'lucide-react';

const Customers = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [name, setName] = useState('');
    const [shopName, setShopName] = useState('');
    const [phone, setPhone] = useState('');
    const [area, setArea] = useState('');

    const handleAddCustomer = () => {
        if (!name || !phone || !area) return;

        if (editingCustomer) {
            updateCustomer(editingCustomer.id, { name, shopName, phone, area });
        } else {
            addCustomer({ name, shopName, phone, area });
        }

        closeModal();
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setName(customer.name);
        setShopName(customer.shopName || '');
        setPhone(customer.phone);
        setArea(customer.area);
        setShowAddModal(true);
    };

    const handleDelete = (id, customerName) => {
        if (window.confirm(`Are you sure you want to delete ${customerName}?`)) {
            deleteCustomer(id);
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingCustomer(null);
        setName('');
        setShopName('');
        setPhone('');
        setArea('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Customers</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
                >
                    <UserPlus size={16} /> Add Customer
                </button>
            </div>

            {/* Customer List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y">
                    {customers.map((customer) => (
                        <div key={customer.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1">
                                    <p className="font-semibold text-gray-800">{customer.name}</p>
                                    {customer.shopName && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Store size={14} />
                                            <span>{customer.shopName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Phone size={14} />
                                        <span>{customer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <MapPin size={14} />
                                        <span>{customer.area}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                    <button
                                        onClick={() => handleEdit(customer)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Edit Customer"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer.id, customer.name)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        title="Delete Customer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add/Edit Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">
                            {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Shop Name (Optional)</label>
                                <input
                                    type="text"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Area *</label>
                                <input
                                    type="text"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-2 border rounded text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCustomer}
                                    className="flex-1 py-2 bg-primary-600 text-white rounded flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> {editingCustomer ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
