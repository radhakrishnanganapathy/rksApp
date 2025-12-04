import { useEffect } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

const BACKUP_TIME_HOUR = 21; // 9 PM
const BACKUP_TIME_MINUTE = 15; // 15 Min
const LAST_BACKUP_KEY = 'last_backup_date';
const LAST_WARNING_KEY = 'last_warning_date';

const BackupManager = () => {
    useEffect(() => {
        // Request notification permissions on load
        const requestPermissions = async () => {
            try {
                await LocalNotifications.requestPermissions();
            } catch (e) {
                console.error("Error requesting notification permissions", e);
            }
        };
        requestPermissions();

        const performBackup = async (todayStr) => {
            try {
                console.log('Starting backup...');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await fetch(`${apiUrl}/api/backup/sql`);
                if (!response.ok) throw new Error('Backup failed');

                const sqlContent = await response.text();
                const fileName = `backup_${todayStr}_${Date.now()}.sql`;

                await Filesystem.writeFile({
                    path: fileName,
                    data: sqlContent,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                });

                await Preferences.set({ key: LAST_BACKUP_KEY, value: todayStr });

                // Notify success
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Backup Successful',
                        body: `Database backup saved to Documents/${fileName}`,
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 1000) },
                    }]
                });

                console.log('Backup successful:', fileName);
            } catch (error) {
                console.error('Backup error:', error);
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Backup Failed',
                        body: 'Could not save database backup. Please check connection.',
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 1000) },
                    }]
                });
            }
        };

        const sendOfflineNotification = async () => {
            const { value: lastWarning } = await Preferences.get({ key: LAST_WARNING_KEY });
            const todayStr = new Date().toISOString().split('T')[0];

            if (lastWarning !== todayStr) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Backup Pending',
                        body: 'Please turn on Internet/WiFi for daily database backup.',
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 1000) },
                    }]
                });
                await Preferences.set({ key: LAST_WARNING_KEY, value: todayStr });
            }
        };

        const checkBackupStatus = async () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const todayStr = now.toISOString().split('T')[0];

            // Check if it's time (after 9:15 PM)
            if (currentHour < BACKUP_TIME_HOUR || (currentHour === BACKUP_TIME_HOUR && currentMinute < BACKUP_TIME_MINUTE)) {
                return; // Too early
            }

            // Check if already backed up today
            const { value: lastBackup } = await Preferences.get({ key: LAST_BACKUP_KEY });
            if (lastBackup === todayStr) {
                return; // Already done today
            }

            // Check Network
            const status = await Network.getStatus();

            if (status.connected) {
                await performBackup(todayStr);
            } else {
                await sendOfflineNotification();
            }
        };

        // Check immediately on mount
        checkBackupStatus();

        // Check every minute
        const interval = setInterval(checkBackupStatus, 60000);

        // Listen for network changes
        let networkListener;
        Network.addListener('networkStatusChange', async (status) => {
            if (status.connected) {
                checkBackupStatus();
            }
        }).then(listener => {
            networkListener = listener;
        });

        return () => {
            clearInterval(interval);
            if (networkListener) {
                networkListener.remove();
            }
        };
    }, []);

    return null;
};

export default BackupManager;
