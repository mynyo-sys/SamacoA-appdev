import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import type { RootState } from '../app/reducers';
import { ROUTES, type MainStackParamList } from '../types';
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  createOrderFromCart,
  type CartItem,
} from '../utils/cartStorage';

type CartScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Cart'>;

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingOut, setCheckingOut] = useState<boolean>(false);
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = await getCart();
      setCartItems(cart);
    } catch (error) {
      console.error('[CART] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    try {
      await updateCartItemQuantity(productId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('[CART] Update quantity error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update quantity',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const handleRemoveItem = async (productId: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(productId);
              await loadCart();
              Toast.show({
                type: 'success',
                text1: 'Removed',
                text2: 'Item removed from cart',
                position: 'top',
                visibilityTime: 2000,
              });
            } catch (error) {
              console.error('[CART] Remove error:', error);
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to checkout',
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.navigate('Auth' as any, { screen: 'Login' });
      return;
    }

    if (cartItems.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Cart Empty',
        text2: 'Add some items to your cart first',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    Alert.alert(
      'Confirm Order',
      `Total amount: ₱${getTotalAmount().toFixed(2)}\n\nDo you want to place this order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          style: 'default',
          onPress: async () => {
            try {
              console.log('[CART SCREEN] Placing order for user:', user.email);
              setCheckingOut(true);
              const newOrder = await createOrderFromCart(user.email);
              console.log('[CART SCREEN] Order created successfully:', newOrder.id);

              Toast.show({
                type: 'success',
                text1: 'Order Placed!',
                text2: `Order #${newOrder.id} has been created`,
                position: 'top',
                visibilityTime: 3000,
              });

              navigation.navigate(ROUTES.ORDERS);
            } catch (error: any) {
              console.error('[CART SCREEN] Checkout error:', error);
              Toast.show({
                type: 'error',
                text1: 'Checkout Failed',
                text2: error.message || 'Could not place order',
                position: 'top',
                visibilityTime: 3000,
              });
            } finally {
              setCheckingOut(false);
            }
          },
        },
      ]
    );
  };

  const getTotalAmount = (): number => {
    return cartItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemPrice}>₱{item.unitPrice.toFixed(2)}</Text>
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.itemSubtotal}>
          ₱{(item.unitPrice * item.quantity).toFixed(2)}
        </Text>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.productId)}
        >
          <Text style={styles.removeButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading cart...</Text>
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
          <Text style={styles.headerTitle}>🛒 My Cart</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
        </Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some products to get started</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate(ROUTES.PRODUCTS)}
          >
            <Text style={styles.shopButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => String(item.productId)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₱{getTotalAmount().toFixed(2)}</Text>
            </View>
            
            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.clearCartButton} onPress={() => {
                Alert.alert(
                  'Clear Cart',
                  'Are you sure you want to remove all items?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: async () => {
                        await clearCart();
                        await loadCart();
                        Toast.show({
                          type: 'success',
                          text1: 'Cart Cleared',
                          text2: 'All items removed',
                          position: 'top',
                          visibilityTime: 2000,
                        });
                      },
                    },
                  ]
                );
              }}>
                <Text style={styles.clearCartText}>Clear Cart</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.checkoutButton, checkingOut && styles.disabledButton]}
                onPress={handleCheckout}
                disabled={checkingOut}
              >
                <Text style={styles.checkoutButtonText}>
                  {checkingOut ? 'Processing...' : 'Place Order'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 12,
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
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  cartItem: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B5563',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    minWidth: 80,
    textAlign: 'right',
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1F2937',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearCartButton: {
    flex: 1,
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  clearCartText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
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

export default CartScreen;