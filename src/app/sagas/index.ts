import { all, call } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  watchLogin,
  watchRegister,
  watchGetUser,
  watchLogout,
} from './authSaga';

export default function* rootSaga(): SagaIterator {
  console.log('Root saga started');
  yield all([
    call(watchLogin),
    call(watchRegister),
    call(watchGetUser),
    call(watchLogout),
  ]);
}
