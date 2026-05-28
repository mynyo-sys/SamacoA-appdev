import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@fcm_token';

class PushNotificationService {
  private unsubscribe: (() => void) | null = null;

  // Request permission and get FCM token
  async requestUserPermission(): Promise<string | null> {
    try {
      console.log('[FCM] Requesting permission...');
      
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('[FCM] Permission denied');
        return null;
      }

      console.log('[FCM] Permission granted');

      // Get FCM token
      const token = await messaging().getToken();
      console.log('[FCM] Token:', token);

      // Save token locally
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

      return token;
    } catch (error) {
      console.error('[FCM] Permission error:', error);
      return null;
    }
  }

  // Get saved FCM token
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (token) return token;

      // If no saved token, try to get it
      return await this.requestUserPermission();
    } catch (error) {
      console.error('[FCM] Get token error:', error);
      return null;
    }
  }

  // Listen to token refresh
  listenToTokenRefresh(callback: (token: string) => void) {
    return messaging().onTokenRefresh(token => {
      console.log('[FCM] Token refreshed:', token);
      AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      callback(token);
    });
  }

  // Listen to foreground messages
  listenToForegroundMessages(
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ) {
    return messaging().onMessage(async remoteMessage => {
      console.log('[FCM] Foreground message:', remoteMessage);
      callback(remoteMessage);
    });
  }

  // Handle background/quit message opening
  getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null> {
    return messaging().getInitialNotification();
  }

  // Listen to notification open (when user taps notification)
  listenToNotificationOpen(
    callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ) {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[FCM] Notification opened:', remoteMessage);
      callback(remoteMessage);
    });
  }

  // Start listening to all notifications
  startListening(
    onForegroundMessage?: (message: FirebaseMessagingTypes.RemoteMessage) => void,
    onNotificationOpen?: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ) {
    // Foreground messages
    if (onForegroundMessage) {
      this.unsubscribe = this.listenToForegroundMessages(onForegroundMessage);
    }

    // Notification open
    if (onNotificationOpen) {
      this.listenToNotificationOpen(onNotificationOpen);
    }

    // Check if app was opened from notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && onNotificationOpen) {
          onNotificationOpen(remoteMessage);
        }
      });
  }

  // Stop listening
  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Send FCM token to backend
  async registerTokenWithBackend(backendUrl: string, email: string) {
    try {
      const token = await this.getFCMToken();
      if (!token) {
        console.log('[FCM] No token available');
        return;
      }

      if (!email) {
        console.log('[FCM] No email provided');
        return;
      }

      console.log('[FCM] Registering token with backend...');
      const response = await fetch(`${backendUrl}/api/customer/fcm/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      if (response.ok) {
        console.log('[FCM] Token registered successfully with customer');
      } else {
        console.error('[FCM] Failed to register token:', response.status);
      }
    } catch (error) {
      console.error('[FCM] Register token error:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
