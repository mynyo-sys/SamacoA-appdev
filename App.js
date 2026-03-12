import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/app/store';
import AuthNav from './src/navigations/AuthNav'; // or MainNav if you want to go directly to Home

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