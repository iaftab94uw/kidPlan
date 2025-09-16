import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService, NotificationData } from '@/services/notificationService';
import { NotificationSettings, NOTIFICATION_CHANNELS } from '@/types/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export interface UseNotificationsReturn {
  // State
  pushToken: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  settings: NotificationSettings;
  scheduledNotifications: Notifications.NotificationRequest[];
  
  // Actions
  registerForPushNotifications: (authToken?: string) => Promise<string | null>;
  requestPermissions: () => Promise<boolean>;
  scheduleNotification: (data: NotificationData, trigger?: Notifications.NotificationTriggerInput) => Promise<string>;
  scheduleEventReminder: (eventId: string, eventTitle: string, eventDate: Date, reminderMinutes: number) => Promise<string>;
  scheduleFamilyUpdate: (memberName: string, updateType: 'added' | 'updated' | 'deleted') => Promise<string>;
  schedulePhotoUpdate: (uploadedBy: string, photoCount: number, albumName: string) => Promise<string>;
  scheduleScheduleReminder: (scheduleName: string, startDate: Date) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  openSettings: () => Promise<void>;
  refreshScheduledNotifications: () => Promise<void>;
  retryTokenRegistration: (authToken: string) => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    eventReminders: true,
    familyUpdates: true,
    photoUpdates: true,
    scheduleReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);

  // Load settings from storage
  const loadSettings = useCallback(async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  // Save settings to storage
  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, []);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async (authToken?: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await notificationService.registerForPushNotifications(authToken);
      if (token) {
        setPushToken(token);
        setIsRegistered(true);
        console.log('Successfully registered for push notifications');
      } else {
        setError('Failed to register for push notifications');
      }
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error registering for push notifications:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        const token = await notificationService.getPushToken();
        if (token) {
          setPushToken(token);
          setIsRegistered(true);
        }
      }
      return hasPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error requesting permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Schedule a notification
  const scheduleNotification = useCallback(async (
    data: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    try {
      const notificationId = await notificationService.scheduleLocalNotification(data, trigger);
      await refreshScheduledNotifications();
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }, []);

  // Schedule event reminder
  const scheduleEventReminder = useCallback(async (
    eventId: string,
    eventTitle: string,
    eventDate: Date,
    reminderMinutes: number
  ): Promise<string> => {
    if (!settings.eventReminders) {
      throw new Error('Event reminders are disabled');
    }

    const reminderDate = new Date(eventDate.getTime() - (reminderMinutes * 60 * 1000));
    
    const notificationData: NotificationData = {
      title: 'Event Reminder',
      body: `You have an event "${eventTitle}" starting in ${reminderMinutes} minutes`,
      data: { eventId, type: 'event_reminder' },
      sound: settings.soundEnabled,
    };

    return await scheduleNotification(notificationData, { date: reminderDate });
  }, [settings.eventReminders, settings.soundEnabled, scheduleNotification]);

  // Schedule family update notification
  const scheduleFamilyUpdate = useCallback(async (
    memberName: string,
    updateType: 'added' | 'updated' | 'deleted'
  ): Promise<string> => {
    if (!settings.familyUpdates) {
      throw new Error('Family updates are disabled');
    }

    const title = updateType === 'added' ? 'New Family Member' : 
                 updateType === 'updated' ? 'Family Member Updated' : 
                 'Family Member Removed';
    
    const body = updateType === 'added' ? `${memberName} has been added to your family` :
                updateType === 'updated' ? `${memberName}'s profile has been updated` :
                `${memberName} has been removed from your family`;

    const notificationData: NotificationData = {
      title,
      body,
      data: { memberName, updateType, type: 'family_update' },
      sound: settings.soundEnabled,
    };

    return await scheduleNotification(notificationData);
  }, [settings.familyUpdates, settings.soundEnabled, scheduleNotification]);

  // Schedule photo update notification
  const schedulePhotoUpdate = useCallback(async (
    uploadedBy: string,
    photoCount: number,
    albumName: string
  ): Promise<string> => {
    if (!settings.photoUpdates) {
      throw new Error('Photo updates are disabled');
    }

    const notificationData: NotificationData = {
      title: 'New Photos',
      body: `${uploadedBy} uploaded ${photoCount} photo${photoCount > 1 ? 's' : ''} to ${albumName}`,
      data: { uploadedBy, photoCount, albumName, type: 'photo_update' },
      sound: settings.soundEnabled,
    };

    return await scheduleNotification(notificationData);
  }, [settings.photoUpdates, settings.soundEnabled, scheduleNotification]);

  // Schedule schedule reminder
  const scheduleScheduleReminder = useCallback(async (
    scheduleName: string,
    startDate: Date
  ): Promise<string> => {
    if (!settings.scheduleReminders) {
      throw new Error('Schedule reminders are disabled');
    }

    // Schedule reminder for 1 day before
    const reminderDate = new Date(startDate.getTime() - (24 * 60 * 60 * 1000));

    const notificationData: NotificationData = {
      title: 'Schedule Reminder',
      body: `Schedule "${scheduleName}" starts tomorrow`,
      data: { scheduleName, startDate: startDate.toISOString(), type: 'schedule_reminder' },
      sound: settings.soundEnabled,
    };

    return await scheduleNotification(notificationData, { date: reminderDate });
  }, [settings.scheduleReminders, settings.soundEnabled, scheduleNotification]);

  // Cancel notification
  const cancelNotification = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await notificationService.cancelNotification(notificationId);
      await refreshScheduledNotifications();
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await notificationService.cancelAllNotifications();
      await refreshScheduledNotifications();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<void> => {
    const updatedSettings = { ...settings, ...newSettings };
    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  // Open notification settings
  const openSettings = useCallback(async (): Promise<void> => {
    try {
      await notificationService.openNotificationSettings();
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }, []);

  // Refresh scheduled notifications
  const refreshScheduledNotifications = useCallback(async (): Promise<void> => {
    try {
      const notifications = await notificationService.getScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error refreshing scheduled notifications:', error);
    }
  }, []);

  // Retry token registration
  const retryTokenRegistration = useCallback(async (authToken: string): Promise<boolean> => {
    try {
      const success = await notificationService.retryTokenRegistration(authToken);
      if (success) {
        setIsRegistered(true);
      }
      return success;
    } catch (error) {
      console.error('Error retrying token registration:', error);
      return false;
    }
  }, []);

  // Setup notification listeners
  useEffect(() => {
    notificationService.setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification response:', response);
        // Handle notification tap/response here
      }
    );

    return () => {
      notificationService.removeNotificationListeners();
    };
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Refresh scheduled notifications on mount
  useEffect(() => {
    refreshScheduledNotifications();
  }, [refreshScheduledNotifications]);

  return {
    // State
    pushToken,
    isRegistered,
    isLoading,
    error,
    settings,
    scheduledNotifications,
    
    // Actions
    registerForPushNotifications,
    requestPermissions,
    scheduleNotification,
    scheduleEventReminder,
    scheduleFamilyUpdate,
    schedulePhotoUpdate,
    scheduleScheduleReminder,
    cancelNotification,
    cancelAllNotifications,
    updateSettings,
    openSettings,
    refreshScheduledNotifications,
    retryTokenRegistration,
  };
};
