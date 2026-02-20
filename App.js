import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNav from './src/navigations/AuthNav'; // or MainNav if you want to go directly to Home

const App = () => {
  return (
    <NavigationContainer>
      <AuthNav />
    </NavigationContainer>
  );
};

export default App;