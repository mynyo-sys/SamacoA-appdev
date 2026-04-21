import { combineReducers } from 'redux';
import authReducer from './authReducer';
import type { AuthState } from '../../types';

export interface RootState {
  auth: AuthState;
}

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

export default rootReducer;
