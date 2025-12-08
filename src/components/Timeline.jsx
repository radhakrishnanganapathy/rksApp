import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

const Timeline = ({ onNavigateBack }) => {
    const { farmCrops, farmTimeline, addFarmTimeline, updateFarmTimeline, deleteFarmTimeline, refreshData } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        cropId: '',
        date: new Date().toISOString().split('T')[0],
        task: '',
        notes: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        doneDate: ''
    });

    const activeCrops = farmCrops?.filter(c => c.cropStatus === 'active') || [];

    const resetForm = () => {
        setFormData({
            cropId: '',
            date: new Date().toISOString().split('T')[0],
            task: '',
            notes: '',
            dueDate: '',
            priority: 'medium',
            status: 'todo',
            doneDate: ''
        });
        setEditingTask(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingTask) {
                await updateFarmTimeline(editingTask.id, formData);
            } else {
                await addFarmTimeline(formData);
            }

            // Refresh data to show updated list
            await refreshData();

            resetForm();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task. Please try again.');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);

        // Format dates properly for date input fields (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        setFormData({
            cropId: task.cropId || '',
            date: formatDateForInput(task.date) || new Date().toISOString().split('T')[0],
            task: task.task || '',
            notes: task.notes || '',
            dueDate: formatDateForInput(task.dueDate) || '',
            priority: task.priority || 'medium',
            status: task.status || 'todo',
            doneDate: formatDateForInput(task.doneDate) || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteFarmTimeline(id);
                await refreshData();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'done': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'todo': return 'bg-yellow-100 text-yellow-800';
            case 'skip': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done': return <CheckCircle size={16} className="text-green-600" />;
            case 'processing': return <Clock size={16} className="text-blue-600" />;
            case 'todo': return <AlertCircle size={16} className="text-yellow-600" />;
            case 'skip': return <XCircle size={16} className="text-gray-600" />;
            default: return <AlertCircle size={16} />;
        }
    };

    const getCropName = (cropId) => {
        const crop = farmCrops?.find(c => c.id === cropId);
        return crop ? crop.cropName : 'Unknown Crop';
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getCardBorderAndBg = (status) => {
        switch (status) {
            case 'done': return 'border-green-400 bg-green-50';
            case 'processing': return 'border-blue-400 bg-blue-50';
            case 'todo': return 'border-yellow-400 bg-yellow-50';
            case 'skip': return 'border-gray-400 bg-gray-50';
            default: return 'border-gray-200 bg-white';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const sortedTimeline = farmTimeline?.sort((a, b) => {
        // Separate done tasks from others
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;

        // If both are done, sort by date DESC (newest first)
        if (a.status === 'done' && b.status === 'done') {
            return new Date(b.date) - new Date(a.date);
        }

        // For non-done tasks, sort by priority first (high > medium > low)
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const priorityCompare = priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
        if (priorityCompare !== 0) return priorityCompare;

        // Then by date DESC (newest first)
        return new Date(b.date) - new Date(a.date);
    }) || [];

    return (
        <div className="pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onNavigateBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Timeline</h2>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Task
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingTask ? 'Edit Task' : 'Add New Task'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop *
                                </label>
                                <select
                                    required
                                    value={formData.cropId}
                                    onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Crop</option>
                                    {activeCrops.map(crop => (
                                        <option key={crop.id} value={crop.id}>
                                            {crop.cropName} ({crop.cropType})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Task/Process *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.task}
                                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Water Supply, Fertilizer Application"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Additional details..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority *
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status *
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="processing">Processing</option>
                                    <option value="done">Done</option>
                                    <option value="skip">Skip</option>
                                </select>
                            </div>

                            {/* Done Date - Only show when status is 'done' */}
                            {formData.status === 'done' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Done Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.doneDate}
                                        onChange={(e) => setFormData({ ...formData, doneDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        The date when this task was completed
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    {editingTask ? 'Update' : 'Add'} Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Timeline List */}
            {sortedTimeline.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No tasks yet. Add your first task to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedTimeline.map((task) => {
                        const daysUntil = getDaysUntilDue(task.dueDate);
                        const isUpcoming = daysUntil <= 5 && daysUntil >= 0 && task.status !== 'done';

                        return (
                            <div
                                key={task.id}
                                className={`border-2 rounded-lg p-4 shadow-sm ${getCardBorderAndBg(task.status)}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusIcon(task.status)}
                                            <h4 className="font-semibold text-lg text-gray-800">
                                                {task.task}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {getCropName(task.cropId)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority || 'medium')}`}>
                                            {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
                                        </span>
                                    </div>
                                </div>

                                {task.notes && (
                                    <p className="text-sm text-gray-600 mb-3 italic">
                                        {task.notes}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                        <span className="font-medium text-gray-700">Date:</span>{' '}
                                        {new Date(task.date).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Due:</span>{' '}
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Show Done Date if task is completed */}
                                {task.status === 'done' && task.doneDate && (
                                    <div className="bg-green-100 border border-green-300 rounded px-3 py-2 mb-3">
                                        <p className="text-sm text-green-800 font-medium">
                                            ✅ Completed on: {new Date(task.doneDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {isUpcoming && (
                                    <div className="bg-orange-100 border border-orange-300 rounded px-3 py-2 mb-3">
                                        <p className="text-sm text-orange-800 font-medium">
                                            ⏰ Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}!
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Timeline;
