import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, Dimensions, Modal, Animated
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { LOGOUT } from '../app/reducers/authReducer';
import type { RootState } from '../app/reducers';
import type { MainStackParamList } from '../types';
import { ROUTES } from '../types';
import { connectToBreweryTopics, subscribeToOrderUpdates } from '../utils/mercure';

const { width, height } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width))[0];

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[SYNC] Starting polling-based sync for brewery topics');
      connectToBreweryTopics();
      const unsubscribe = subscribeToOrderUpdates((orderData) => {
        console.log('[SYNC] Order update received:', orderData);
        Toast.show({
          type: 'info',
          text1: 'Order Update',
          text2: 'Your order status has changed',
          position: 'top',
          visibilityTime: 3000,
        });
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleLogout = () => {
    dispatch({ type: LOGOUT });
    closeMenu();
    Toast.show({
      type: 'success',
      text1: 'Logged Out',
      text2: 'You have been successfully logged out',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handleProductsPress = () => {
    navigation.navigate(ROUTES.PRODUCTS);
    closeMenu();
  };

  const handleOrdersPress = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to view your orders',
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.navigate('Auth' as any, { screen: 'Login' });
      closeMenu();
      return;
    }
    navigation.navigate(ROUTES.ORDERS);
    closeMenu();
  };

  const handleProfilePress = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to view your profile',
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.navigate('Auth' as any, { screen: 'Login' });
      closeMenu();
      return;
    }
    navigation.navigate(ROUTES.PROFILE);
    closeMenu();
  };

  const handleLoginPress = () => {
    navigation.navigate('Auth' as any, { screen: 'Login' });
    closeMenu();
  };

  const handleRegisterPress = () => {
    navigation.navigate('Auth' as any, { screen: 'Register' });
    closeMenu();
  };

  return (
    <View style={styles.container}>
      {/* Header with Burger Menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, { width: 20 }]} />
            <View style={[styles.menuLine, { width: 16 }]} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerLogo}>
          <Image source={require('../../assets/images/logo.png')} style={styles.headerLogoImage} />
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Drawer Menu */}
      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.drawerHeader}>
              <Image source={require('../../assets/images/logo.png')} style={styles.drawerLogo} />
              <Text style={styles.drawerTitle}>Samaco Brewery</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawerDivider} />

            {isAuthenticated && user ? (
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{user.fullName || user.email}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity style={styles.drawerLoginButton} onPress={handleLoginPress}>
                  <Text style={styles.drawerLoginText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerRegisterButton} onPress={handleRegisterPress}>
                  <Text style={styles.drawerRegisterText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.drawerDivider} />

            <TouchableOpacity style={styles.drawerItem} onPress={handleProductsPress}>
              <Text style={styles.drawerItemIcon}>🍺</Text>
              <Text style={styles.drawerItemText}>Browse Products</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={handleOrdersPress}>
              <Text style={styles.drawerItemIcon}>📦</Text>
              <Text style={styles.drawerItemText}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={handleProfilePress}>
              <Text style={styles.drawerItemIcon}>👤</Text>
              <Text style={styles.drawerItemText}>My Profile</Text>
            </TouchableOpacity>

            {isAuthenticated && (
              <>
                <View style={styles.drawerDivider} />
                <TouchableOpacity style={styles.drawerLogoutItem} onPress={handleLogout}>
                  <Text style={styles.drawerItemIcon}>🚪</Text>
                  <Text style={styles.drawerLogoutText}>Logout</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>CRAFT BEER EXCELLENCE</Text>
          </View>
          <Text style={styles.heroTitle}>Samaco</Text>
          <Text style={styles.heroSubtitle}>Brewery</Text>
          <Text style={styles.heroDescription}>Artisanal craft beers brewed with passion and tradition since 1985</Text>
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
          <Text style={styles.sectionTitle}>Featured Product</Text>
          <View style={styles.featuredCard}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>BEST SELLER</Text>
            </View>
            <Text style={styles.featuredIcon}>🍻</Text>
            <Text style={styles.featuredTitle}>Premium Craft Beer</Text>
            <Text style={styles.featuredSubtitle}>Fresh from our brewery</Text>
            <TouchableOpacity style={styles.shopNowButton} onPress={handleProductsPress}>
              <Text style={styles.shopNowText}>Shop Now →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleProductsPress}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🍺</Text>
              </View>
              <Text style={styles.actionTitle}>Products</Text>
              <Text style={styles.actionSubtitle}>Browse our selection</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleOrdersPress}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📦</Text>
              </View>
              <Text style={styles.actionTitle}>Orders</Text>
              <Text style={styles.actionSubtitle}>View order history</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleProfilePress}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👤</Text>
              </View>
              <Text style={styles.actionTitle}>Profile</Text>
              <Text style={styles.actionSubtitle}>Manage your account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 28,
    height: 20,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: 28,
    height: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
    marginBottom: 4,
  },
  headerLogo: {
    alignItems: 'center',
  },
  headerLogoImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  placeholder: {
    width: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: height,
    backgroundColor: '#1F2937',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  drawerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#FFD700',
    lineHeight: 32,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  drawerLoginButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  drawerLoginText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
  drawerRegisterButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  drawerRegisterText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  drawerItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  drawerLogoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  drawerLogoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFD700',
    lineHeight: 56,
  },
  heroSubtitle: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  welcomeCard: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  welcomeText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  guestCard: {
    backgroundColor: '#1F2937',
    padding: 32,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  featuredIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },
  shopNowText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default HomeScreen;