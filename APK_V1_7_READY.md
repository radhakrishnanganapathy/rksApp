# APK v1.7 Ready

The new APK `rks_v1_7.apk` has been built and is ready for installation.

## New Features
- **Automated Daily Backups**:
  - Automatically backs up the entire database to a SQL file every day at **9:15 PM**.
  - **Offline Handling**: If offline at 9:15 PM, it sends a notification and retries immediately when the internet connection is restored.
  - **Storage**: Backups are saved to the **Documents** folder on your device.
  - **Notifications**: You will receive notifications for successful backups or if action is needed (e.g., turn on internet).

## Installation
1. Transfer `rks_v1_7.apk` to your Android device.
2. Install the APK.
3. **Permissions**: On first launch, allow the app to send notifications if prompted.

## Verification
- To test the backup immediately, you can change the time on your phone to 9:14 PM and wait a minute, or simply toggle your internet connection if a backup is pending.
- Check your "Documents" folder for files starting with `backup_`.
