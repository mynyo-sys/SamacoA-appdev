import AsyncStorage from '@react-native-async-storage/async-storage';
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

    const responseText = await response.text();
    let data: any;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      const message = `Invalid JSON response from ${endpoint}: ${responseText.slice(0, 200)}`;
      console.error(message, parseError);
      throw new Error(message);
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
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
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Raw product shape returned by the backend
interface RawProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: string | string[];
  stockQuantity?: number;
  stock?: number;
  imageUrl?: string;
  isMixedDrink?: boolean;
}

const normalizeProduct = (raw: RawProduct): Product => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  price: raw.price,
  category: Array.isArray(raw.category)
    ? raw.category.join(', ')
    : raw.category || 'Uncategorized',
  stock: raw.stockQuantity ?? raw.stock ?? 0,
  imageUrl: raw.imageUrl,
  isMixedDrink: raw.isMixedDrink,
});

const unwrapList = <T>(data: T[] | { products?: T[]; orders?: T[] }): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.products)) {
    return data.products;
  }
  if (Array.isArray(data.orders)) {
    return data.orders;
  }
  return [];
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const rawProducts = await apiCall<RawProduct[] | { products: RawProduct[] }>('/products');
    return unwrapList(rawProducts).map(normalizeProduct);
  },

  getById: async (id: number): Promise<Product> => {
    const rawProduct = await apiCall<RawProduct>(`/products/${id}`);
    return normalizeProduct(rawProduct);
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const rawProducts = await apiCall<RawProduct[]>(`/products?category=${category}`);
    return rawProducts.map(normalizeProduct);
  },
};

interface RawOrder {
  id: number;
  orderNumber?: string;
  orderDate?: string;
  status: string;
  totalAmount: string | number;
  customer?: { id: number; name?: string; email?: string; fullName?: string };
  items?: Array<{
    id?: number;
    productName?: string;
    product?: Product;
    quantity: number;
    unitPrice: string | number;
  }>;
}

const normalizeOrder = (raw: RawOrder): Order => ({
  id: raw.id,
  customer: {
    id: raw.customer?.id ?? 0,
    email: raw.customer?.email ?? '',
    fullName: raw.customer?.fullName ?? raw.customer?.name ?? 'Customer',
  },
  items: (raw.items ?? []).map((item, index) => ({
    id: item.id ?? index,
    product: item.product ?? {
      id: 0,
      name: item.productName ?? 'Product',
      description: '',
      price: Number(item.unitPrice),
      category: '',
      stock: 0,
    },
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
  })),
  totalAmount: Number(raw.totalAmount),
  status: raw.status,
  createdAt: raw.orderDate ?? '',
});

// Orders API
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const data = await apiCall<RawOrder[] | { orders: RawOrder[] }>('/orders');
    return unwrapList(data).map(normalizeOrder);
  },

  getById: async (id: number): Promise<Order> => {
    const raw = await apiCall<RawOrder>(`/orders/${id}`);
    return normalizeOrder(raw);
  },

  create: async (orderData: {
    items: { product_id: number; quantity: number }[];
    customer_id?: number;
    notes?: string;
  }): Promise<Order> => {
    const raw = await apiCall<RawOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return normalizeOrder(raw);
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
    return apiCall<Customer>('/me');
  },

  updateProfile: async (data: Partial<Customer>): Promise<Customer> => {
    return apiCall<Customer>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};