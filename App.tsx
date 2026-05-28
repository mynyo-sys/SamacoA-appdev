import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { LogBox, AppState, AppStateStatus } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { store, persistor } from './src/app/store';
import RootNav from './src/navigations/RootNav';
import { pushNotificationService } from './src/utils/pushNotification';

LogBox.ignoreLogs([
  'Deep imports from the \'react-native\' package are deprecated',
  'InteractionManager has been deprecated',
]);

const App: React.FC = () => {
  useEffect(() => {
    // Initialize FCM
    const initializeFCM = async () => {
      try {
        console.log('[App] Initializing FCM...');
        await pushNotificationService.requestUserPermission();

        // Listen to foreground messages
        pushNotificationService.listenToForegroundMessages(remoteMessage => {
          console.log('[App] Foreground FCM message:', remoteMessage);
          // Show toast notification for foreground messages
          Toast.show({
            type: 'info',
            text1: remoteMessage.notification?.title || 'Notification',
            text2: remoteMessage.notification?.body || '',
            position: 'top',
          });
        });

        // Listen to notification opens
        pushNotificationService.listenToNotificationOpen(remoteMessage => {
          console.log('[App] Notification opened:', remoteMessage);
          // Handle navigation based on notification data
          if (remoteMessage.data?.orderId) {
            // Navigate to order details (you can implement this)
            console.log('[App] Navigate to order:', remoteMessage.data.orderId);
          }
        });

        // Listen to token refresh
        pushNotificationService.listenToTokenRefresh(token => {
          console.log('[App] FCM token refreshed:', token);
          // Re-register with backend if needed
        });
      } catch (error) {
        console.error('[App] FCM initialization error:', error);
      }
    };

    initializeFCM();

    // Handle app state changes (foreground/background)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[App] App came to foreground');
        // Refresh data if needed
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      pushNotificationService.stopListening();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <RootNav />
        </NavigationContainer>
        <Toast />
      </PersistGate>
    </Provider>
  );
};

export default App;
