import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { LogBox, AppState, AppStateStatus } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { store, persistor } from './src/app/store';
import RootNav from './src/navigations/RootNav';

LogBox.ignoreLogs([
  'Deep imports from the \'react-native\' package are deprecated',
  'InteractionManager has been deprecated',
]);

const App: React.FC = () => {
  useEffect(() => {
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
