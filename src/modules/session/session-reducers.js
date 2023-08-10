import { 
    LOGIN, 
    LOGOUT, 
    AUTHENTICATE, 
    AUTHENTICATION_FAILED, 
    CLEAR_AUTH_ERROR,
    CLEAR_OLD_SESSION, 
    WAIT_FOR_DATABASE_SETUP, 
    CONFIRM_DB_READY, 
    CLEAR_NOTICES,
	RESET_STATE,
    SET_UPDATING
} from './session-actions';
import VERSION from '../../version';

let initialState = {
    authenticated: false,
    authenticating: false,
    loginError: null,
    waitingForDB: false,
	version: VERSION,
    updating: true
};
function session(state = initialState, action) {
    switch (action.type) {
        case AUTHENTICATE:
            return Object.assign({}, state, {
                authenticated: false,
                authenticating: true,
                waitingForDB: false,
                loginError: null,
				version: VERSION
            });
        case LOGIN:
            return Object.assign({}, state, {
                authenticated: true,
                authenticating: false,
                waitingForDB: false,
                userDetails: action.userDetails,
                loginError: null,
				version: VERSION
            });
        case LOGOUT:
            return Object.assign({}, state, {
                authenticated: false,
                authenticating: false,
                waitingForDB: false,
                loginError: null,
				version: VERSION});
        case AUTHENTICATION_FAILED:
            return Object.assign({}, state, {
                authenticated: false,
                authenticating: false,
                waitingForDB: false,
                loginError: action.error,
				version: VERSION});
        case CLEAR_AUTH_ERROR:
            return Object.assign({}, state, {loginError: null});
        case WAIT_FOR_DATABASE_SETUP:
            return Object.assign({}, state, {
                loginError: action.message,
                waitingForDB: true,
                authenticating: false,
                authenticated: false,
				version: VERSION
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
		case CLEAR_NOTICES:
			return {
				...state,
				authenticated: false,
				authenticating: false,
				loginError: null,
				waitingForDB: false
			}
		case RESET_STATE:
			return initialState;
        case SET_UPDATING:
            return {
                ...state,
                updating: action.status
            }
        default:
            return state;
    }
}


export default session;
