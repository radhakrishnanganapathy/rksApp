import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Timer, Plus, Trash2, Calendar, ArrowLeft, Clock } from 'lucide-react';

const HomeCountdown = ({ onNavigateBack }) => {
    const { countdowns, addCountdown, deleteCountdown } = useData();
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        fromDate: new Date().toISOString().split('T')[0],
        toDate: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.toDate) return;

        try {
            await addCountdown(formData);
            setFormData({
                title: '',
                fromDate: new Date().toISOString().split('T')[0],
                toDate: ''
            });
            setShowAdd(false);
        } catch (err) {
            console.error(err);
        }
    };

    const calculateDays = (toDate) => {
        const diff = new Date(toDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className="p-4 pb-20 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <button onClick={onNavigateBack} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Countdowns</h2>
                </div>
                {!showAdd && (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="bg-purple-600 text-white p-2 rounded-full shadow-lg"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </div>

            {showAdd && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-purple-100 mb-6">
                    <h3 className="font-bold text-gray-800 mb-4">Add New Countdown</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="e.g. Goa Trip, Savings Goal"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={formData.fromDate}
                                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                                <input
                                    type="date"
                                    value={formData.toDate}
                                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                className="flex-1 px-4 py-3 border rounded-xl text-gray-600 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-purple-200"
                            >
                                Save Countdown
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {countdowns.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="bg-gray-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-400">No active countdowns</p>
                    </div>
                ) : (
                    countdowns.map((cd) => {
                        const daysLeft = calculateDays(cd.toDate);
                        const isExpired = daysLeft < 0;

                        return (
                            <div key={cd.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600'}`}>
                                        <Timer size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{cd.title}</h4>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Calendar size={12} />
                                            Target: {new Date(cd.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className={`text-2xl font-black ${isExpired ? 'text-gray-400' : 'text-purple-600'}`}>
                                            {isExpired ? 'Ended' : daysLeft}
                                        </p>
                                        {!isExpired && <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Days Left</p>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Delete this countdown?')) {
                                                deleteCountdown(cd.id);
                                            }
                                        }}
                                        className="text-red-300 hover:text-red-500 p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default HomeCountdown;
