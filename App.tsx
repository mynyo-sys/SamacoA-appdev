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

let previousEmail = '';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize FCM
    const initializeFCM = async () => {
      try {
        console.log('[App] Initializing FCM...');
        const token = await pushNotificationService.requestUserPermission();

        if (!token) {
          console.log('[App] Failed to get FCM token');
          return;
        }

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
        });

        // Listen to token refresh
        pushNotificationService.listenToTokenRefresh(token => {
          console.log('[App] FCM token refreshed:', token);
          // Re-register with backend if needed
          const currentState = store.getState();
          const email = currentState.auth?.user?.email || '';
          if (email) {
            pushNotificationService.registerTokenWithBackend(
              'https://webdev2-staging.up.railway.app',
              email
            );
          }
        });

        // Subscribe to store changes to detect login
        const unsubscribe = store.subscribe(() => {
          const state = store.getState();
          const currentEmail = state.auth?.user?.email || '';
          
          // If email changed (user logged in or logged out)
          if (currentEmail !== previousEmail) {
            previousEmail = currentEmail;
            
            if (currentEmail) {
              console.log('[App] User logged in or email changed, registering FCM token:', currentEmail);
              pushNotificationService.registerTokenWithBackend(
                'https://webdev2-staging.up.railway.app',
                currentEmail
              );
            } else {
              console.log('[App] User logged out');
            }
          }
        });

        // Try to register immediately if user is already logged in
        const initialState = store.getState();
        const initialEmail = initialState.auth?.user?.email || '';
        if (initialEmail) {
          console.log('[App] User already logged in, registering FCM token:', initialEmail);
          previousEmail = initialEmail;
          pushNotificationService.registerTokenWithBackend(
            'https://webdev2-staging.up.railway.app',
            initialEmail
          );
        }

        return unsubscribe;
      } catch (error) {
        console.error('[App] FCM initialization error:', error);
      }
    };

    let unsubscribe: (() => void) | undefined;

    (async () => {
      unsubscribe = await initializeFCM();
    })();

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
      if (unsubscribe) {
        unsubscribe();
      }
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
