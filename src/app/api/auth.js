import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const BASE_URL = API_BASE_URL;

const defaultOptions = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

// Token storage functions
export async function storeToken(token) {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.log('Error storing token:', error);
  }
}

export async function getToken() {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
}

export async function removeToken() {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.log('Error removing token:', error);
  }
}

// Login API call
export async function authLogin({ email, password }) {
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
export async function authRegister({ email, password, }) {
  try {
    console.log('Attempting registration with:', { email, password });
    
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    console.log('Register response:', data);
    
    if (response.ok) {
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
export async function authMe() {
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
      // Handle different response structures
      return data.user || data;
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
export async function authLogout() {
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