import React from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import type { RootState } from '../app/reducers';

// Navigators
import AuthNav from './AuthNav';
import MainNav from './MainNav';

const Stack = createStackNavigator<RootStackParamList>();

const RootNav: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  console.log('RootNav - isAuthenticated:', isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNav} />
      ) : (
        <Stack.Screen name="Main" component={MainNav} />
      )}
    </Stack.Navigator>
  );
};

export default RootNav;
