import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { LOGOUT } from '../app/reducers/authReducer';
import type { RootState } from '../app/reducers';
import type { MainStackParamList } from '../types';
import { ROUTES } from '../types';
import { connectToBreweryTopics, subscribeToOrderUpdates } from '../utils/mercure';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  console.log('[SCREEN] Home screen loaded');

  // Connect to Mercure for real-time updates when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[MERCURE] Connecting to brewery topics...');
      connectToBreweryTopics();

      // Subscribe to order updates
      const unsubscribe = subscribeToOrderUpdates((orderData) => {
        console.log('[MERCURE] Order update received:', orderData);
        Toast.show({
          type: 'info',
          text1: 'Order Update',
          text2: `Your order status has changed`,
          position: 'top',
          visibilityTime: 3000,
        });
      });

      return () => {
        console.log('[MERCURE] Cleaning up subscriptions');
        unsubscribe();
      };
    }
  }, [isAuthenticated]);

  const handleLogout = (): void => {
    console.log('[ACTION] Logout button pressed');
    console.log(`[USER] Logging out: ${user?.email || 'unknown'}`);
    dispatch({ type: LOGOUT });
  };

  const handleProfilePress = (): void => {
    console.log('[ACTION] Profile button pressed');
    navigation.navigate(ROUTES.PROFILE);
  };

  const handleProductsPress = (): void => {
    console.log('[ACTION] Products button pressed');
    navigation.navigate(ROUTES.PRODUCTS);
  };

  const handleOrdersPress = (): void => {
    console.log('[ACTION] Orders button pressed');
    navigation.navigate(ROUTES.ORDERS);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍺 Samaco Brewery</Text>
        <Text style={styles.headerSubtitle}>Customer Dashboard</Text>
      </View>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Welcome, {user.fullName || user.email}!</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard} onPress={handleProductsPress}>
          <Text style={styles.actionIcon}>🍺</Text>
          <Text style={styles.actionTitle}>Browse Products</Text>
          <Text style={styles.actionSubtitle}>View our selection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleOrdersPress}>
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionTitle}>My Orders</Text>
          <Text style={styles.actionSubtitle}>View order history</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleProfilePress}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionTitle}>My Profile</Text>
          <Text style={styles.actionSubtitle}>Manage your account</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
    backgroundColor: '#111827',
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  userInfo: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row' as const,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});

export default HomeScreen;
