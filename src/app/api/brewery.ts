import { API_BASE_URL } from './config';

// Types for Brewery API responses
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  isMixedDrink?: boolean;
}

export interface Order {
  id: number;
  customer: {
    id: number;
    email: string;
    fullName: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
}

// API Response wrapper
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Get auth token from storage
const getAuthToken = async (): Promise<string | null> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    return apiCall<Product[]>('/products');
  },

  getById: async (id: number): Promise<Product> => {
    return apiCall<Product>(`/products/${id}`);
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    return apiCall<Product[]>(`/products?category=${category}`);
  },
};

// Orders API
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    return apiCall<Order[]>('/orders');
  },

  getById: async (id: number): Promise<Order> => {
    return apiCall<Order>(`/orders/${id}`);
  },

  create: async (orderData: {
    items: { productId: number; quantity: number }[];
  }): Promise<Order> => {
    return apiCall<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  cancel: async (id: number): Promise<Order> => {
    return apiCall<Order>(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};

// Customer/Profile API - UPDATED to match backend
export const customerApi = {
  getProfile: async (): Promise<Customer> => {
    // Change from '/profile' to '/me'
    return apiCall<Customer>('/me');
  },

  updateProfile: async (data: Partial<Customer>): Promise<Customer> => {
    // Change from '/profile' to '/me' with PATCH or PUT
    return apiCall<Customer>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};