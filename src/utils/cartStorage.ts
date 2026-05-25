import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../app/api/brewery';

export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  customerEmail: string;
}

const CART_KEY = '@cart';
const ORDERS_KEY = '@orders';

// Cart functions
export const getCart = async (): Promise<CartItem[]> => {
  try {
    const cartJson = await AsyncStorage.getItem(CART_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

export const addToCart = async (product: Product, quantity: number = 1): Promise<void> => {
  try {
    const cart = await getCart();
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        imageUrl: product.imageUrl,
      });
    }

    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (productId: number): Promise<void> => {
  try {
    const cart = await getCart();
    const updatedCart = cart.filter(item => item.productId !== productId);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const getCartTotal = async (): Promise<number> => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
};

// Order functions
export const getOrders = async (): Promise<Order[]> => {
  try {
    const ordersJson = await AsyncStorage.getItem(ORDERS_KEY);
    return ordersJson ? JSON.parse(ordersJson) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const createOrder = async (customerEmail: string): Promise<Order> => {
  try {
    const cart = await getCart();
    
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const totalAmount = cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      items: [...cart],
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customerEmail,
    };

    const orders = await getOrders();
    orders.unshift(newOrder);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    await clearCart();

    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  try {
    const orders = await getOrders();
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
