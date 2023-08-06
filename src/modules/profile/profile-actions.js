import { SQLITE3_DB_PATH } from "../session/db-settings";
//const sqlite3 = window.require('sqlite3').verbose()

export const SEND_PROFILE_UPDATE_REQUEST = 'SEND_PROFILE_UPDATE_REQUEST';

export const NOTIFY_PROFILE_UPDATE_FAILURE = 'NOTIFY_PROFILE_UPDATE_FAILURE';

export const NOTIFY_PROFILE_UPDATE_SUCCESS = 'NOTIFY_PROFILE_UPDATE_SUCCESS';

//Dismiss the error message
export const CLEAR_PROFILE_UPDATE_ERROR = 'CLEAR_PROFILE_UPDATE_ERROR';


export function sendProfileUpdateRequest(profileData){
    return {
        type: SEND_PROFILE_UPDATE_REQUEST,
        data: profileData
    }
}

export function notifyProfileUpdateFailure(error){
    return {
        type: NOTIFY_PROFILE_UPDATE_FAILURE,
        error: error
    }
}

export function notifyProfileUpdateSuccess(){
    return {
        type: NOTIFY_PROFILE_UPDATE_SUCCESS,
    }
}

export function clearProfileUpdateError(){
    return {
        type: CLEAR_PROFILE_UPDATE_ERROR
    }
}

export function updateUserProfile(profileData){
    return (dispatch, getState) => {
        dispatch(sendProfileUpdateRequest(profileData));
        
		// let db = new sqlite3.Database(SQLITE3_DB_PATH);
		// db.serialize(() => {
		// 	try{
		// 		let query = "UPDATE users SET email = ?, first_name = ?, last_name = ?, other_names = ? ";
		// 		let values= [profileData.email, 
		// 					 profileData.first_name, 
		// 					 profileData.last_name, 
		// 					 profileData.other_names]
		// 		if(profileData.password !== null && profileData.password !== ""){
		// 			query += ", password = ? "
		// 			values.push(profileData.password);
		// 		}
		// 		query += " WHERE email = ?";
		// 		values.push(profileData.email);
				
		// 		var stmt = db.prepare(query,values);
					
		// 		stmt.run();
		// 		stmt.finalize();
				
		// 		dispatch(notifyProfileUpdateSuccess());
		// 	}catch(e){
		// 		dispatch(notifyProfileUpdateFailure("Update failed"));
		// 	}
			
		// });
    }
}