import type { AuthState, Action, User } from '../../types';

// ========== ACTION TYPES ==========
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';
export const LOGOUT = 'LOGOUT';
export const GET_USER_REQUEST = 'GET_USER_REQUEST';
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const GET_USER_FAILURE = 'GET_USER_FAILURE';

// ========== INITIAL STATE ==========
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  registerSuccess: false,
};

// ========== REDUCER ==========
export default function authReducer(state: AuthState = initialState, action: Action): AuthState {
  console.log('Reducer action:', action.type);
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case GET_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        token: action.payload?.token ?? null,
        user: action.payload?.user ?? null,
        error: null,
      };

    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        registerSuccess: true,
      };

    case GET_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload as User,
        error: null,
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case GET_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload as string | null,
      };

    case LOGOUT:
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

// ========== ACTION CREATORS ==========
export const loginRequest = (email: string, password: string) => ({
  type: LOGIN_REQUEST,
  payload: { email, password },
});

export const registerRequest = (email: string, password: string) => ({
  type: REGISTER_REQUEST,
  payload: { email, password },
});

export const getUserRequest = () => ({
  type: GET_USER_REQUEST,
});

export const logoutRequest = () => ({
  type: LOGOUT,
});
