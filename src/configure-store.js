import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import appReducer from './app-reducer';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, appReducer)
 
const loggerMiddleware = createLogger();

export default function configureStore(preloadedState) {
    return createStore(
            persistedReducer,
            preloadedState,
            applyMiddleware(
                    thunkMiddleware,
                    loggerMiddleware
                    )
            )
}