import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';
import type { AuthLoginParams, AuthRegisterParams, User } from '../../types';

const BASE_URL: string = API_BASE_URL;

const defaultOptions: RequestInit = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

// Token storage functions
export async function storeToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.log('Error storing token:', error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('customerId');
  } catch (error) {
    console.log('Error removing token:', error);
  }
}

export async function storeCustomerId(customerId: number | string): Promise<void> {
  try {
    await AsyncStorage.setItem('customerId', String(customerId));
  } catch (error) {
    console.log('Error storing customer ID:', error);
  }
}

export async function syncCustomerIdFromProfile(userData: {
  customer?: { id?: number };
  customerId?: number;
}): Promise<void> {
  const customerId = userData.customer?.id ?? userData.customerId;
  if (customerId) {
    await storeCustomerId(customerId);
  }
}

// Login API call
export async function authLogin({ email, password }: AuthLoginParams): Promise<{ token: string; user: User | null }> {
  try {
    console.log('Attempting login with:', { email });

    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (response.ok) {
      if (data.token) {
        await storeToken(data.token);
        return data;
      } else {
        throw new Error('No token received');
      }
    } else {
      throw new Error(data.message || data.detail || 'Login failed');
    }
  } catch (error) {
    console.log('Login error:', error);
    throw error;
  }
}

// Register API call
export async function authRegister({ email, password, firstName, lastName }: AuthRegisterParams): Promise<any> {
  try {
    console.log('Attempting registration with:', { email, password, firstName, lastName });

    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const data = await response.json();
    console.log('Register response:', data);

    if (response.ok) {
      // Save token if returned
      if (data.token) {
        await storeToken(data.token);
      }
      return data;
    } else {
      throw new Error(data.message || data.error || 'Registration failed');
    }
  } catch (error) {
    console.log('Register error:', error);
    throw error;
  }
}

// Get current user
export async function authMe(): Promise<User> {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No token found');
    }

    console.log('Fetching user with token:', token.substring(0, 20) + '...');

    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('User response:', data);

    if (response.ok) {
      const user = data.user || data;
      await syncCustomerIdFromProfile(user);
      return user;
    } else {
      if (response.status === 401) {
        await removeToken();
      }
      throw new Error(data.message || data.detail || 'Failed to get user');
    }
  } catch (error) {
    console.log('authMe error:', error);
    throw error;
  }
}

// Logout
export async function authLogout(): Promise<{ success: boolean }> {
  try {
    const token = await getToken();

    if (token) {
      // Call logout API (optional)
      try {
        await fetch(`${BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (apiError) {
        console.log('Logout API error (non-critical):', apiError);
      }
    }

    // Remove token from storage
    await removeToken();
    return { success: true };
  } catch (error) {
    console.log('Logout error:', error);
    return { success: true }; // Still return success even if API fails
  }
}

// Resend verification email
export async function resendVerification(email: string): Promise<any> {
  try {
    console.log('Resending verification email for:', email);

    const response = await fetch(`${BASE_URL}/api/resend-verification`, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log('Resend verification response:', data);

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || data.message || 'Failed to resend verification email');
    }
  } catch (error) {
    console.log('Resend verification error:', error);
    throw error;
  }
}
