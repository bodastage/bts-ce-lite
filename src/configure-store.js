import { applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import appReducer from './app-reducer';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';
import { configureStore } from '@reduxjs/toolkit';

// Middleware: Redux Persist Config
const persistConfig = {
        // Root
        key: 'root',
        // Storage Method (React Native)
        storage: AsyncStorage,

        // Whitelist (Save Specific Reducers)
        whitelist: [
        ],
        // Blacklist (Don't Save Specific Reducers)
        blacklist: [
        ],
};
// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, appReducer);

const store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(createLogger()).concat(thunk),
        devTools: process.env.NODE_ENV !== 'production',
});

// Middleware: Redux Persist Persister
let persistor = persistStore(store);

// Exports
export {
        store,
        persistor,
};
