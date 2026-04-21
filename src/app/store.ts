import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer, { type RootState } from './reducers';
import rootSaga from './sagas';
import type { PersistConfig } from 'redux-persist';

// Redux Persist config
const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // only auth will be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Create store
export const store = createStore(
  persistedReducer,
  applyMiddleware(sagaMiddleware)
);

// Run saga
sagaMiddleware.run(rootSaga);

// Create persistor
export const persistor = persistStore(store);
