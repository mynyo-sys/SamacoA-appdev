import { call, put, takeLatest } from 'redux-saga/effects';
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
  LOGOUT 
} from '../reducers/authReducer';
import { authLogin, authMe, authLogout } from '../api/auth';

// Login Saga
function* loginSaga(action) {
  try {
    const { email, password } = action.payload;
    // authLogin throws on error, returns data directly on success
    const result = yield call(authLogin, { email, password });
    
    yield put({ 
      type: LOGIN_SUCCESS, 
      payload: { 
        token: result.token,
        user: result.user || null
      } 
    });
    
    // Optionally fetch user after login
    yield put({ type: GET_USER_REQUEST });
    
  } catch (error) {
    yield put({ 
      type: LOGIN_FAILURE, 
      payload: error.message 
    });
  }
}

// Register Saga
function* registerSaga(action) {
  try {
    const { email, password } = action.payload;
    // authRegister throws on error, returns data directly on success
    yield call(authRegister, { email, password });

    yield put({ 
      type: REGISTER_SUCCESS 
    });

  } catch (error) {
    yield put({ 
      type: REGISTER_FAILURE, 
      payload: error.message 
    });
  }
}

// Get User Saga
function* getUserSaga() {
  try {
    // authMe throws on error, returns user data directly on success
    const userData = yield call(authMe);
    
    yield put({ 
      type: GET_USER_SUCCESS, 
      payload: { user: userData } 
    });
    
  } catch (error) {
    yield put({ 
      type: GET_USER_FAILURE, 
      payload: error.message 
    });
  }
}

// Logout Saga
function* logoutSaga() {
  try {
    yield call(authLogout);
  } catch (error) {
    console.log('Logout error:', error);
  }
}

// Watcher Saga
export function* watchAuth() {
  yield takeLatest(LOGIN_REQUEST, loginSaga);
  yield takeLatest(REGISTER_REQUEST, registerSaga);
  yield takeLatest(GET_USER_REQUEST, getUserSaga);
  yield takeLatest(LOGOUT, logoutSaga);
}