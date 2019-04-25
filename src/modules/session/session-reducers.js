import { combineReducers } from 'redux';
import { LOGIN, LOGOUT, AUTHENTICATE, AUTHENTICATION_FAILED, CLEAR_AUTH_ERROR,
    CLEAR_OLD_SESSION, WAIT_FOR_DATABASE_SETUP, CONFIRM_DB_READY} 
    from './session-actions';

let initialState = {
    authenticated: false,
    authenticating: false,
    loginError: null,
    waitingForDB: false
};
function session(state = initialState, action) {
    switch (action.type) {
        case AUTHENTICATE:
            return Object.assign({}, state, {
                authenticated: false,
                authenticating: true,
                waitingForDB: false,
                loginError: null
            });
        case LOGIN:
            return Object.assign({}, state, {
                authenticated: true,
                authenticating: false,
                waitingForDB: false,
                userDetails: action.userDetails,
                loginError: null
            });
        case LOGOUT:
            return Object.assign({}, state, {
                authenticated: false,
                authenticating: false,
                waitingForDB: false,
                loginError: null});
        case AUTHENTICATION_FAILED:
            return Object.assign({}, state, {
                authenticated: false,
                authenticating: false,
                waitingForDB: false,
                loginError: action.error});
        case CLEAR_AUTH_ERROR:
            return Object.assign({}, state, {loginError: null});
        case WAIT_FOR_DATABASE_SETUP:
            return Object.assign({}, state, {
                loginError: action.message,
                waitingForDB: true,
                authenticating: false,
                authenticated: false
            });
        case CLEAR_OLD_SESSION:
            return Object.assign({}, state, {
                authenticated: false,
                authenticating: false,
                userDetails: null,
                loginError: action.error});
        case CONFIRM_DB_READY:
            return {
                ...state,
                waitingForDB: true,
                loginError: (state.loginError !== null )? "Database is ready!" : null
            }
        default:
            return state;
    }
}


export default session;
