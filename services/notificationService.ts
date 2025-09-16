import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

export interface PushToken {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
}

class NotificationService {
  private pushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return false;
        }

        return true;
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Register push token with backend
   */
  async registerTokenWithBackend(token: string, authToken: string): Promise<boolean> {
    try {
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      
      const requestBody = {
        deviceType,
        token,
      };

      const url = getApiUrl(API_CONFIG.ENDPOINTS.REGISTER_PUSH_TOKEN);
      const headers = getAuthHeaders(authToken);

      console.log('=== REGISTER PUSH TOKEN API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(`Failed to register push token: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      if (data.success) {
        console.log('Push token registered successfully with backend');
        return true;
      } else {
        throw new Error(data.message || 'Failed to register push token');
      }
    } catch (error) {
      console.error('Error registering push token with backend:', error);
      return false;
    }
  }

  /**
   * Get push notification token
   */
  async getPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.log('Project ID not found in app config');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = token.data;
      console.log('Push token:', this.pushToken);
      return this.pushToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(authToken?: string): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = await this.getPushToken();
      if (!token) {
        return null;
      }

      // Register token with backend if auth token is provided
      if (authToken) {
        await this.registerTokenWithBackend(token, authToken);
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0e3c67',
        });

        await Notifications.setNotificationChannelAsync('family', {
          name: 'Family Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0e3c67',
        });

        await Notifications.setNotificationChannelAsync('events', {
          name: 'Event Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0e3c67',
        });

        await Notifications.setNotificationChannelAsync('photos', {
          name: 'Photo Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0e3c67',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    notificationData: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound !== false,
          badge: notificationData.badge,
        },
        trigger: trigger || null,
      });

      console.log('Scheduled notification:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a notification for a specific date/time
   */
  async scheduleNotificationForDate(
    notificationData: NotificationData,
    date: Date,
    channelId?: string
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound !== false,
          badge: notificationData.badge,
          ...(channelId && { channelId }),
        },
        trigger: { date },
      });

      console.log('Scheduled notification for date:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification for date:', error);
      throw error;
    }
  }

  /**
   * Schedule a recurring notification
   */
  async scheduleRecurringNotification(
    notificationData: NotificationData,
    interval: 'daily' | 'weekly' | 'monthly',
    channelId?: string
  ): Promise<string> {
    try {
      let trigger: Notifications.NotificationTriggerInput;

      switch (interval) {
        case 'daily':
          trigger = { repeats: true, seconds: 24 * 60 * 60 };
          break;
        case 'weekly':
          trigger = { repeats: true, seconds: 7 * 24 * 60 * 60 };
          break;
        case 'monthly':
          trigger = { repeats: true, seconds: 30 * 24 * 60 * 60 };
          break;
        default:
          trigger = { repeats: true, seconds: 24 * 60 * 60 };
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound !== false,
          badge: notificationData.badge,
          ...(channelId && { channelId }),
        },
        trigger,
      });

      console.log('Scheduled recurring notification:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling recurring notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Cancelled notification:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listener for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Get current push token
   */
  getCurrentPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Open notification settings
   */
  async openNotificationSettings(): Promise<void> {
    try {
      await Notifications.openNotificationSettingsAsync();
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }

  /**
   * Retry token registration with backend
   */
  async retryTokenRegistration(authToken: string): Promise<boolean> {
    if (!this.pushToken) {
      console.log('No push token available for retry');
      return false;
    }

    return await this.registerTokenWithBackend(this.pushToken, authToken);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
