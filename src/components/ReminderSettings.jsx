import React, { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Bell, Clock, ChevronLeft, Save, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

const ReminderSettings = ({ onNavigateBack }) => {
    const [enabled, setEnabled] = useState(false);
    const [time, setTime] = useState('21:00');
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedEnabled = localStorage.getItem('reminder_enabled') === 'true';
            const savedTime = localStorage.getItem('reminder_time') || '21:00';
            setEnabled(savedEnabled);
            setTime(savedTime);
        } catch (error) {
            console.error('Error loading reminder settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const requestPermission = async () => {
        const permission = await LocalNotifications.checkPermissions();
        if (permission.display !== 'granted') {
            const request = await LocalNotifications.requestPermissions();
            return request.display === 'granted';
        }
        return true;
    };

    const scheduleNotification = async (reminderTime) => {
        // Cancel existing notifications first
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

        if (!enabled) return;

        const [hours, minutes] = reminderTime.split(':').map(Number);

        const now = new Date();
        const scheduleDate = new Date();
        scheduleDate.setHours(hours);
        scheduleDate.setMinutes(minutes);
        scheduleDate.setSeconds(0);

        // If time is already past for today, schedule for tomorrow
        if (scheduleDate <= now) {
            scheduleDate.setDate(scheduleDate.getDate() + 1);
        }

        const messages = [
            "Time to record your daily wins! 🌟 Entering your expenses helps you grow your business.",
            "A gentle reminder to log your daily activities. Stay consistent and keep up the great work! 💪",
            "Don't forget to track your progress! Small steps lead to big success. 🚀",
            "Quick reminder: Update your entries for today. Your future self will thank you! 📈",
            "Hello! Time for a quick business check-in. Let's keep those records tidy! ✨"
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: "Daily Business Reminder 📊",
                    body: randomMessage,
                    id: 1,
                    schedule: {
                        at: scheduleDate,
                        repeats: true,
                        every: 'day'
                    },
                    sound: 'default',
                    attachments: [],
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const hasPermission = await requestPermission();
            if (!hasPermission && enabled) {
                alert('Please enable notification permissions in your phone settings to use this feature.');
                setLoading(false);
                return;
            }

            localStorage.setItem('reminder_enabled', enabled.toString());
            localStorage.setItem('reminder_time', time);

            await scheduleNotification(time);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving reminder settings:', error);
            alert('Failed to schedule notification.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !showSuccess) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onNavigateBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Reminder Settings</h2>
                <div className="w-10"></div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <p className="text-green-700 font-medium">Settings saved successfully!</p>
                </div>
            )}

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 space-y-8">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${enabled ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Daily Reminder</p>
                                <p className="text-sm text-gray-500">Get notified to enter daily data</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEnabled(!enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary-600' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>

                    {/* Time Picker */}
                    <div className={`space-y-3 transition-opacity duration-300 ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <Clock size={20} />
                            </div>
                            <p className="font-semibold text-gray-800">Reminder Time</p>
                        </div>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Preview Card */}
                    <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-5 border border-primary-100">
                        <div className="flex items-center space-x-2 mb-3">
                            <Sparkles size={16} className="text-primary-600" />
                            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Preview Reminder</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-primary-100">
                            <p className="font-bold text-sm text-gray-800 mb-1">Daily Business Reminder 📊</p>
                            <p className="text-sm text-gray-600 italic">
                                "Time to record your daily wins! 🌟 Entering your expenses helps you grow your business."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Save Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tips Section */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    💡 <span className="font-bold uppercase">Pro Tip:</span> Setting a reminder for 9:00 PM is ideal as it helps you review your daily business performance before you wrap up for the day.
                </p>
            </div>
        </div>
    );
};

export default ReminderSettings;
