import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification, { Importance } from 'react-native-push-notification';

// Constants
const NOTIFICATION_CHANNEL_ID = 'bakehouse-breads-channel';
const STORAGE_KEY_NOTIFICATIONS = 'bakehouse-breads-notifications';

// Notification types
export type NotificationType = 
  | 'starter_feeding' 
  | 'baking_step' 
  | 'recipe_reminder' 
  | 'dough_temperature';

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledTime: Date;
  data?: any;
  repeating?: boolean;
  repeatType?: 'minute' | 'hour' | 'day' | 'week';
  repeatTime?: number;
}

/**
 * Initialize the notification service
 * This should be called on app startup
 */
export const initializeNotifications = (): void => {
  // Configure notifications
  PushNotification.configure({
    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
      
      // Required on iOS only
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },
    
    // Should the initial notification be popped automatically?
    popInitialNotification: true,
    
    // iOS specific configs
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    
    // Android specific configs
    requestPermissions: Platform.OS === 'ios',
  });
  
  // Create the notification channel for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: NOTIFICATION_CHANNEL_ID,
        channelName: 'Bakehouse Breads',
        channelDescription: 'Notifications for Bakehouse Breads app',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Notification channel created: ${created}`)
    );
  }
};

/**
 * Request notification permissions from the user
 * @returns Promise that resolves to a boolean indicating if permission was granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.requestPermissions()
        .then((permissions) => {
          resolve(permissions.alert === true);
        })
        .catch(() => resolve(false));
    } else {
      // On Android, permissions are asked on app startup by default
      PushNotification.requestPermissions((permissions) => {
        resolve(permissions?.alert === true);
      });
    }
  });
};

/**
 * Schedule a notification
 * @param notification The notification to schedule
 * @returns Promise that resolves to the notification ID
 */
export const scheduleNotification = async (
  notification: Omit<ScheduledNotification, 'id'>
): Promise<string> => {
  // Generate a unique ID for the notification
  const notificationId = generateNotificationId();
  
  // Create the full notification object
  const fullNotification: ScheduledNotification = {
    ...notification,
    id: notificationId,
  };
  
  // Schedule the actual notification
  PushNotification.localNotificationSchedule({
    id: notificationId,
    channelId: NOTIFICATION_CHANNEL_ID,
    title: notification.title,
    message: notification.message,
    date: notification.scheduledTime,
    allowWhileIdle: true,
    playSound: true,
    soundName: 'default',
    userInfo: {
      ...notification.data,
      type: notification.type,
    },
    // Repeating options
    repeatType: notification.repeating ? notification.repeatType : undefined,
    repeatTime: notification.repeating ? notification.repeatTime : undefined,
  });
  
  // Save the notification to storage for later reference
  await saveScheduledNotification(fullNotification);
  
  return notificationId;
};

/**
 * Schedule a starter feeding reminder
 * @param starterName The name of the starter
 * @param scheduledTime When to send the notification
 * @param isRepeating Whether this is a repeating reminder
 * @param repeatInterval The interval in hours to repeat the reminder
 * @returns Promise that resolves to the notification ID
 */
export const scheduleStarterFeedingReminder = async (
  starterName: string,
  scheduledTime: Date,
  isRepeating: boolean = false,
  repeatInterval?: number
): Promise<string> => {
  return scheduleNotification({
    type: 'starter_feeding',
    title: 'Time to Feed Your Starter',
    message: `It's time to feed ${starterName}. Keep your sourdough healthy!`,
    scheduledTime,
    data: {
      starterName,
    },
    repeating: isRepeating,
    repeatType: isRepeating ? 'hour' : undefined,
    repeatTime: isRepeating ? repeatInterval : undefined,
  });
};

/**
 * Schedule a baking step reminder
 * @param stepName The name of the baking step
 * @param scheduledTime When to send the notification
 * @param recipeId The ID of the recipe (optional)
 * @returns Promise that resolves to the notification ID
 */
export const scheduleBakingStepReminder = async (
  stepName: string,
  scheduledTime: Date,
  recipeId?: number
): Promise<string> => {
  return scheduleNotification({
    type: 'baking_step',
    title: 'Baking Step Reminder',
    message: `It's time for your next step: ${stepName}`,
    scheduledTime,
    data: {
      stepName,
      recipeId,
    },
  });
};

/**
 * Cancel a specific notification by ID
 * @param notificationId The ID of the notification to cancel
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  PushNotification.cancelLocalNotification(notificationId);
  await removeScheduledNotification(notificationId);
};

/**
 * Cancel all notifications of a specific type
 * @param type The type of notifications to cancel
 */
export const cancelNotificationsByType = async (type: NotificationType): Promise<void> => {
  const notifications = await getScheduledNotifications();
  const notificationsToCancel = notifications.filter(
    (notification) => notification.type === type
  );
  
  for (const notification of notificationsToCancel) {
    await cancelNotification(notification.id);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = (): void => {
  PushNotification.cancelAllLocalNotifications();
  clearAllScheduledNotifications();
};

/**
 * Get all scheduled notifications from storage
 * @returns Promise that resolves to an array of scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<ScheduledNotification[]> => {
  try {
    const storedNotifications = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (storedNotifications) {
      const notifications: ScheduledNotification[] = JSON.parse(storedNotifications);
      
      // Convert string dates back to Date objects
      return notifications.map(notification => ({
        ...notification,
        scheduledTime: new Date(notification.scheduledTime),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting scheduled notifications', error);
    return [];
  }
};

// Helper functions

/**
 * Save a scheduled notification to storage
 * @param notification The notification to save
 */
const saveScheduledNotification = async (
  notification: ScheduledNotification
): Promise<void> => {
  try {
    const notifications = await getScheduledNotifications();
    notifications.push(notification);
    await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving scheduled notification', error);
  }
};

/**
 * Remove a scheduled notification from storage
 * @param notificationId The ID of the notification to remove
 */
const removeScheduledNotification = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getScheduledNotifications();
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationId
    );
    await AsyncStorage.setItem(
      STORAGE_KEY_NOTIFICATIONS,
      JSON.stringify(updatedNotifications)
    );
  } catch (error) {
    console.error('Error removing scheduled notification', error);
  }
};

/**
 * Clear all scheduled notifications from storage
 */
const clearAllScheduledNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
  } catch (error) {
    console.error('Error clearing scheduled notifications', error);
  }
};

/**
 * Generate a unique notification ID
 * @returns A unique notification ID
 */
const generateNotificationId = (): string => {
  return Math.floor(Math.random() * 1000000).toString();
};

export default {
  initializeNotifications,
  requestNotificationPermissions,
  scheduleNotification,
  scheduleStarterFeedingReminder,
  scheduleBakingStepReminder,
  cancelNotification,
  cancelNotificationsByType,
  cancelAllNotifications,
  getScheduledNotifications,
};