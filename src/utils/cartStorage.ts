import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../app/api/brewery';
import { ordersApi } from '../app/api/brewery';

export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  customerEmail: string;
}

const CART_KEY = '@cart';

// Cart functions (local only for temporary cart before checkout)
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
    console.log('[CART] Added to cart:', product.name, 'Quantity:', quantity);
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

export const updateCartItemQuantity = async (productId: number, quantity: number): Promise<void> => {
  try {
    const cart = await getCart();
    const cartItem = cart.find(item => item.productId === productId);
    
    if (cartItem) {
      if (quantity <= 0) {
        await removeFromCart(productId);
      } else {
        cartItem.quantity = quantity;
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
      }
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
    console.log('[CART] Cart cleared');
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

export const getCartItemCount = async (): Promise<number> => {
  try {
    const cart = await getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

// Order functions - USING BACKEND API
export const getOrders = async (): Promise<Order[]> => {
  try {
    // Fetch orders from backend API
    const backendOrders = await ordersApi.getAll();
    console.log('[ORDERS] Fetched from backend:', backendOrders.length);
    
    // Convert backend orders to frontend Order format
    const orders: Order[] = backendOrders.map(order => ({
      id: order.id,
      items: order.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        imageUrl: item.product.imageUrl,
      })),
      totalAmount: order.totalAmount,
      status: order.status as Order['status'],
      createdAt: order.createdAt,
      customerEmail: order.customer.email,
    }));
    
    return orders;
  } catch (error) {
    console.error('Error getting orders from backend:', error);
    return [];
  }
};

export const createOrderFromCart = async (customerEmail: string): Promise<Order> => {
  try {
    const cart = await getCart();
    
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    // Prepare order data for backend API
    const orderData = {
      items: cart.map(item => ({
        product_id: item.productId,
        quantity: item.quantity
      })),
      notes: `Order from mobile app - ${new Date().toLocaleString()}`
    };

    console.log('[ORDER] Creating order with data:', JSON.stringify(orderData, null, 2));

    // Create order via backend API
    const backendOrder = await ordersApi.create(orderData);
    
    console.log('[ORDER] Order created successfully:', backendOrder);

    // Clear local cart after successful order
    await clearCart();

    // Convert to frontend Order format
    const newOrder: Order = {
      id: backendOrder.id,
      items: cart,
      totalAmount: backendOrder.totalAmount,
      status: 'pending',
      createdAt: backendOrder.createdAt,
      customerEmail,
    };

    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  try {
    const backendOrder = await ordersApi.getById(orderId);
    
    if (!backendOrder) return null;
    
    return {
      id: backendOrder.id,
      items: backendOrder.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        imageUrl: item.product.imageUrl,
      })),
      totalAmount: backendOrder.totalAmount,
      status: backendOrder.status as Order['status'],
      createdAt: backendOrder.createdAt,
      customerEmail: backendOrder.customer.email,
    };
  } catch (error) {
    console.error('Error getting order by id:', error);
    return null;
  }
};