import { SEND_PROFILE_UPDATE_REQUEST, NOTIFY_PROFILE_UPDATE_FAILURE, 
    NOTIFY_PROFILE_UPDATE_SUCCESS, CLEAR_PROFILE_UPDATE_ERROR
} from './profile-actions';

let initialState = {
    updateError: null,
    updating: false
};

export default function profile(state = initialState, action) {

    switch (action.type) {
        case SEND_PROFILE_UPDATE_REQUEST:
            return Object.assign({}, state, {
                updating: true,
                updateError: null
            });
        case NOTIFY_PROFILE_UPDATE_FAILURE:
            return Object.assign({}, state, {
                updating: false,
                updateError: action.error
            });
        case NOTIFY_PROFILE_UPDATE_SUCCESS:
            return Object.assign({}, state, {
                updating: false,
                updateError: null
            });
        case CLEAR_PROFILE_UPDATE_ERROR:
            return Object.assign({}, state, {
                updating: false,
                updateError: null
            });
        default:
            return state;
        
    }
}