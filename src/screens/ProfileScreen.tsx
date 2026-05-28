import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { customerApi, type Customer } from '../app/api/brewery';
import { getOrders, type Order } from '../utils/cartStorage';
import type { RootState } from '../app/reducers';
import { LOGOUT } from '../app/reducers/authReducer';
import { ROUTES, type MainStackParamList } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);


  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getProfile();
      setCustomerData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('[PROFILE] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
      setTotalOrders(ordersData.length);
      const spent = ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
      setTotalSpent(spent);
    } catch (err: any) {
      console.error('[PROFILE] Load stats error:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      loadStats();
    }, [])
  );

  const handleLogout = (): void => {
    dispatch({ type: LOGOUT });
    // Navigation is handled by RootNav based on isAuthenticated state
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👤 My Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>Account information</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(customerData?.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>✎</Text>
          </View>
        </View>

        <Text style={styles.name}>
          {customerData?.fullName || user?.fullName || 'Customer'}
        </Text>
        <Text style={styles.email}>{customerData?.email || user?.email}</Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>📧</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{customerData?.email || user?.email}</Text>
            </View>
          </View>

          {customerData?.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>📞</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{customerData.phone}</Text>
              </View>
            </View>
          )}

          {customerData?.address && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>📍</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{customerData.address}</Text>
              </View>
            </View>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadProfile}>
              <Text style={styles.retryLink}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Account Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₱{totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      </View>

      <View style={styles.ordersSection}>
        <View style={styles.ordersHeader}>
          <Text style={styles.ordersTitle}>Order History</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.ORDERS)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Text style={styles.emptyOrdersText}>No orders yet</Text>
          </View>
        ) : (
          <FlatList
            data={orders.slice(0, 5)}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderNumber}>#{item.id}</Text>
                  <Text style={[
                    styles.orderStatus,
                    { color: item.status === 'completed' ? '#4CAF50' : item.status === 'cancelled' ? '#EF4444' : '#FFA500' }
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.orderDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <Text style={styles.orderTotal}>₱{item.totalAmount.toFixed(2)}</Text>
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutButtonText}>Logout</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111827',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFD700',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    margin: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  editBadgeText: {
    fontSize: 16,
    color: '#FFD700',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  infoSection: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  retryLink: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239,68,68,0.15)',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ordersSection: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  viewAllText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyOrders: {
    padding: 20,
    alignItems: 'center',
  },
  emptyOrdersText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default ProfileScreen;
