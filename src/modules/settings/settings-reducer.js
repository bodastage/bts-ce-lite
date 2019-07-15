import { START_DB_SETTINGS_UPDATE, SHOW_DB_UPDATE_ERROR, SHOW_DB_UPDATE_SUCCESS,
UPDATE_STATE_DB_SETTINGS, CLEAR_DB_UPDATE_ERROR, CLEAR_DB_UPDATE_SUCCESS,
STOP_DB_SETTINGS_UPDATE } from './settings-actions';

let initialState = {
	db: {
		updating: false,
		settings: null,
		error: null,
		success: null
	}
};

function settings(state = initialState, action) {
    switch (action.type) {
        case START_DB_SETTINGS_UPDATE:
            return {
				...state,
				db: { ...state.db, updating: true}
			};
        case STOP_DB_SETTINGS_UPDATE:
            return {
				...state,
				db: { ...state.db, updating: false}
			};
		case SHOW_DB_UPDATE_ERROR:
			return {
				...state,
				db: { ...state.db, updating: false, error: action.error, success: null }
			}
		case SHOW_DB_UPDATE_SUCCESS:
			return {
				...state,
				db: { ...state.db, updating: false, error: null, success: action.message}
			}
		case UPDATE_STATE_DB_SETTINGS:
			return {
				...state,
				db: { ...state.db, 
					updating: false, 
					error: null, 
					success: null, 
					settings: action.settings
				}
			}
		case CLEAR_DB_UPDATE_ERROR: 
			return {
				...state,
				db: {...state.db, error: null}
			}
		case CLEAR_DB_UPDATE_SUCCESS: 
			return {
				...state,
				db: {...state.db, success: null}
			}
        default:
            return state;
	}
}

export default settings;