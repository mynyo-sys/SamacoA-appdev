import { call, put, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { Action } from '../../types';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAILURE,
  LOGOUT,
} from '../reducers/authReducer';
import { authLogin, authRegister, authMe, authLogout, syncCustomerIdFromProfile } from '../api/auth';

// Login Saga
function* loginSaga(action: Action): SagaIterator {
  console.log('loginSaga started with:', action.payload);
  try {
    const { email, password } = action.payload || {};
    const result = yield call(authLogin, { email, password });

    console.log('Login response in saga:', result);

    yield put({
      type: LOGIN_SUCCESS,
      payload: {
        token: result.token,
        user: result.user || null,
      },
    });

    // Fetch user after login
    yield put({ type: GET_USER_REQUEST });

  } catch (error: any) {
    console.log('Login error in saga:', error);
    yield put({
      type: LOGIN_FAILURE,
      payload: error.message,
    });
  }
}

// Register Saga
function* registerSaga(action: Action): SagaIterator {
  console.log('registerSaga started with:', action.payload);
  try {
    const { email, password } = action.payload || {};
    const result = yield call(authRegister, { email, password });

    console.log('Register response in saga:', result);

    yield put({
      type: REGISTER_SUCCESS,
      payload: result,
    });

  } catch (error: any) {
    console.log('Register error in saga:', error);
    yield put({
      type: REGISTER_FAILURE,
      payload: error.message,
    });
  }
}

// Get User Saga
function* getUserSaga(): SagaIterator {
  console.log('getUserSaga started');
  try {
    const userData = yield call(authMe);

    console.log('Get user response in saga:', userData);

    yield call(syncCustomerIdFromProfile, userData);

    yield put({
      type: GET_USER_SUCCESS,
      payload: userData,
    });

  } catch (error: any) {
    console.log('Get user error in saga:', error);
    yield put({
      type: GET_USER_FAILURE,
      payload: error.message,
    });
  }
}

// Logout Saga
function* logoutSaga(): SagaIterator {
  console.log('logoutSaga started');
  try {
    yield call(authLogout);
    console.log('Logout successful');
  } catch (error) {
    console.log('Logout error in saga:', error);
  }
}

// ========== WATCHER SAGAS ==========
export function* watchLogin(): SagaIterator {
  yield takeEvery(LOGIN_REQUEST, loginSaga);
}

export function* watchRegister(): SagaIterator {
  yield takeEvery(REGISTER_REQUEST, registerSaga);
}

export function* watchGetUser(): SagaIterator {
  yield takeEvery(GET_USER_REQUEST, getUserSaga);
}

export function* watchLogout(): SagaIterator {
  yield takeEvery(LOGOUT, logoutSaga);
}
