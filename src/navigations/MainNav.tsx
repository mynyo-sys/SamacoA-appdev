import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { MainStackParamList } from '../types';
import { ROUTES } from '../types';

// screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductsScreen from '../screens/ProductsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CartScreen from '../screens/CartScreen';
import AuthNavigation from './AuthNav';

const Stack = createStackNavigator<MainStackParamList>();

const MainNav: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME}>
      <Stack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.PRODUCTS}
        component={ProductsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.ORDERS}
        component={OrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.CART}
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.AUTH}
        component={AuthNavigation}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainNav;