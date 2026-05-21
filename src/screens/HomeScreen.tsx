import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
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

  const handleProductsPress = (): void => {
    console.log('[ACTION] Products button pressed');
    navigation.navigate(ROUTES.PRODUCTS);
  };

  const handleOrdersPress = (): void => {
    console.log('[ACTION] Orders button pressed');
    // Check if user is authenticated before navigating to orders
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to view your orders',
        position: 'top',
        visibilityTime: 3000,
      });
      // @ts-ignore - navigating to Auth stack
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    navigation.navigate(ROUTES.ORDERS);
  };

  const handleProfilePress = (): void => {
    console.log('[ACTION] Profile button pressed');
    // Check if user is authenticated before navigating to profile
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to view your profile',
        position: 'top',
        visibilityTime: 3000,
      });
      // @ts-ignore - navigating to Auth stack
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    navigation.navigate(ROUTES.PROFILE);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Replace with actual logo: <Image source={require('../assets/images/logo.png')} style={styles.logoImage} /> */}
          <Image source={require('../../../assets/images/logo.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.headerTitle}>Samaco Brewery</Text>
        <Text style={styles.headerSubtitle}>Craft Beer Excellence</Text>
      </View>

      {/* Welcome Section */}
      {user ? (
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user.fullName || user.email}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      ) : (
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>Welcome to Samaco Brewery</Text>
          <Text style={styles.guestSubtitle}>Browse our products and order when ready</Text>
        </View>
      )}

      {/* Featured Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <View style={styles.featuredCard}>
          <Text style={styles.featuredIcon}>🍻</Text>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Premium Craft Beer</Text>
            <Text style={styles.featuredSubtitle}>Fresh from our brewery</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard} onPress={handleProductsPress}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🍺</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Browse Products</Text>
            <Text style={styles.actionSubtitle}>View our selection</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleOrdersPress}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>📦</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Orders</Text>
            <Text style={styles.actionSubtitle}>View order history</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleProfilePress}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>👤</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Profile</Text>
            <Text style={styles.actionSubtitle}>Manage your account</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button (only show if authenticated) */}
      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  logoContainer: {
    backgroundColor: '#FFD700',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  welcomeCard: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  guestCard: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  featuredIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row' as const,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  actionArrow: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold' as const,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});

export default HomeScreen;
