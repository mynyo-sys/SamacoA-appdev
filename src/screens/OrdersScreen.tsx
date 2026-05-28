import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { ordersApi, type Order } from '../app/api/brewery';
import { ROUTES, type MainStackParamList } from '../types';

type OrdersScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Orders'>;

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<OrdersScreenNavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();

      // Poll for order status updates every 10 seconds
      const interval = setInterval(() => {
        loadOrders();
      }, 10000);

      return () => clearInterval(interval);
    }, [])
  );

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error('[ORDERS] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await ordersApi.cancel(orderId);
      Toast.show({
        type: 'success',
        text1: 'Order Cancelled',
        text2: 'Your order has been cancelled successfully',
        position: 'top',
        visibilityTime: 2000,
      });
      loadOrders();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Cancellation Failed',
        text2: err.message || 'Failed to cancel order',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const getStatusColor = (status: string): { bg: string; text: string } => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'rgba(255,165,0,0.15)', text: '#FFA500' };
      case 'delivered':
        return { bg: 'rgba(76,175,80,0.15)', text: '#4CAF50' };
      case 'cancelled':
        return { bg: 'rgba(255,107,107,0.15)', text: '#FF6B6B' };
      default:
        return { bg: 'rgba(136,136,136,0.15)', text: '#888' };
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusStyle = getStatusColor(item.status);
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>#{item.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>{orderItem.product.name}</Text>
              <Text style={styles.itemPrice}>${(orderItem.quantity * orderItem.unitPrice).toFixed(2)}</Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
        </View>

        {item.status.toLowerCase() === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📦 My Orders</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>Order history</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>You haven't placed any orders</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate(ROUTES.PRODUCTS)}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderItems: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    width: 40,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  itemPrice: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  moreItems: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  noItems: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
});

export default OrdersScreen;