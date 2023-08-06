import {
	DASHBOARD_ADD_NOTICE,
	DASHBOARD_CLEAR_NOTICE
} from './dashboard-actions';

const INITIAL_DASHBOARD_STATE = {
	//{message, type}
	notice: null
}

export default function dashboard(state = INITIAL_DASHBOARD_STATE, action: any){
	switch (action.type) {
		case DASHBOARD_ADD_NOTICE:
			return {
				...state,
				notice: action.notice
			};
		case DASHBOARD_CLEAR_NOTICE:
			return {
				...state,
				notice: null
			}
		default:
			return state;
	}
}