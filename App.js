import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { LogBox } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/app/store';
import AuthNav from './src/navigations/RootNav';


LogBox.ignoreLogs([
  'Deep imports from the \'react-native\' package are deprecated',
  'InteractionManager has been deprecated'
]);

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <AuthNav />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;