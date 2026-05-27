// ========== AUTH TYPES ==========
export interface User {
  id?: string;
  email: string;
  fullName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  registerSuccess: boolean;
}

// ========== REDUX ACTION TYPES ==========
export interface Action {
  type: string;
  payload?: any;
  [key: string]: any;
}

// ========== AUTH ACTION PAYLOADS ==========
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginSuccessPayload {
  token: string;
  user: User | null;
}

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  detail?: string;
  token?: string;
  user?: User;
}

// ========== AUTH API TYPES ==========
export interface AuthLoginParams {
  email: string;
  password: string;
}

export interface AuthRegisterParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// ========== NAVIGATION TYPES ==========
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Products: undefined;
  Orders: undefined;
};

// ========== COMPONENT PROP TYPES ==========
export interface CustomButtonProps {
  containerStyle?: object;
  textStyle?: object;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface CustomTextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  textStyle?: object;
  containerStyle?: object;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

// ========== ROUTES ==========
export const ROUTES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  HOME: 'Home',
  PROFILE: 'Profile',
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];
