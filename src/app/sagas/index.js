import { all } from 'redux-saga/effects';
import { 
  watchLogin, 
  watchRegister, 
  watchGetUser, 
  watchLogout 
} from './authSaga';

export default function* rootSaga() {
  console.log('Root saga started');
  yield all([
    watchLogin(),
    watchRegister(),
    watchGetUser(),
    watchLogout(),
  ]);
}