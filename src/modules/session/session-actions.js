import 'url-search-params-polyfill';
//import { SQLITE3_DB_PATH, migrateUp } from "./db-settings";
//import { Sequelize } from 'sequelize';

//const fs = window.require('fs');
//const sqlite3 = window.require('sqlite3').verbose()
// const log = window.require('electron-log');

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const AUTHENTICATE = 'AUTHENTICATE'; //login attemp
export const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const CLEAR_OLD_SESSION = 'CLEAR_OLD_SESSION';
export const CHECK_DB_SETUP_STATUS = 'CHECK_DB_SETUP_STATUS';
export const CONFIRM_DB_READY = 'CONFIRM_DB_READY';
export const CLEAR_NOTICES = 'CLEAR_NOTICES';
export const RESET_STATE = 'RESET_STATE';
export const SET_UPDATING = 'SET_UPDATING';

export function setUpdating(status){
	return {
		type: SET_UPDATING,
		status
	};
}

export function resetState(){
	
	
	return {
		type: RESET_STATE
	};
}

export function clearNotices(){
	return {
		type: CLEAR_NOTICES
	};
}

//The database is not yet ready
export const WAIT_FOR_DATABASE_SETUP = 'WAIT_FOR_DATABASE_SETUP';


export function confirmDBReady(){
    return {
        type: CONFIRM_DB_READY
    };
}

export function clearAuthError(){
    return {
        type: CLEAR_AUTH_ERROR
    };
}

export function clearOldSession(){
    return {
        type: CLEAR_OLD_SESSION,
    };
}

export function logIntoApp(userDetails){
    return {
        type: LOGIN,
        userDetails
    };
}

export function logOutOfApp(){
    return {
        type: LOGOUT
    };
}

export function authenticateUser(loginDetails){
    return {
        type: AUTHENTICATE,
        loginDetails
    };
}

export function markLoginAsFailed(error){
    return {
        type: AUTHENTICATION_FAILED,
        error
    };
}

/**
 * waitForDatabaseSetup
 * 
 * Wait for the database structure to be created
 * 
 * @param {type} notice
 * @returns {waitForDatabaseSetup.session-actionsAnonym$6}
 */
export function waitForDatabaseSetup(notice){
    return {
        type: WAIT_FOR_DATABASE_SETUP,
        message: notice
    };
}

export function clearSQLiteDB(){
    return (dispatch, getState) => {
		
		window.BodaAPI.clearSQLiteDB()
		
		dispatch(resetState());
	}
}
/**
 * Check if the database is ready
 */
export function checkDBSetupStatus(){
    return (dispatch, getState) => {
        
		try{ 
		
			//check if databae exists 

			
			// //Database already exists
			// if(fs.existsSync(SQLITE3_DB_PATH) ){
				
			// 	var stats = fs.statSync(SQLITE3_DB_PATH);
			// 	if(stats.size > 0 ){
			// 		dispatch(clearNotices());
			// 		return;					
			// 	}

			// }
			
			// if(fs.existsSync(SQLITE3_DB_PATH)){
			// 	fs.unlinkSync(SQLITE3_DB_PATH);
			// 	log.info(`Deleting boda-lite.sqlite3 because it's size is 0`);
			// }
			
			//@TODO: Move this logic to a different file 
			// let db = new sqlite3.Database(SQLITE3_DB_PATH);
			// db.serialize(function() {
			// 	//Create users table
			// 	db.run("CREATE TABLE users (" +
			// 		  "		first_name TEXT NOT NULL, " + 
			// 		  "		last_name TEXT NOT NULL," +
			// 		  "		other_names TEXT NOT NULL," +
			// 		  " 	email TEXT NOT NULL UNIQUE," +
			// 		  " 	password TEXT NOT NULL" +
			// 		  ")");
				
			// 	let stmt = db.prepare("INSERT INTO users " +
			// 	" (first_name, last_name, other_names, email, password)" +
			// 	" VALUES ('Expert','TelecomHall','','expert@telecomhall.net','password')," + 
			// 	" ('Boda','Lite','Bodastage','btsuser@bodastage.org','password')" 
			// 	);
				
			// 	stmt.run();
			// 	stmt.finalize();
				
			// 	//create database settings table 
			// 	db.run("CREATE TABLE databases (" +
			// 		  "		hostname TEXT NOT NULL, " + 
			// 		  "		port TEXT NOT NULL," +
			// 		  "		username TEXT NOT NULL," +
			// 		  " 	password TEXT NOT NULL," +
			// 		  " 	name TEXT NOT NULL UNIQUE," +
			// 		  " 	db_type TEXT NOT NULL" +
			// 		  ")");
					  
			// 	stmt = db.prepare("INSERT INTO databases " +
			// 	" (hostname, port, username, password, name, db_type)" +
			// 	" VALUES " +
			// 	" ('127.0.0.1','5432','bodastage','password','boda','postgresql')," + 
			// 	" ('127.0.0.1','5432','postgres','postgres','postgres','postgresql')"
			// 	);
				
			// 	stmt.run();
			// 	stmt.finalize();
				
			// 	dispatch(clearNotices());
			// });
			
		}catch(e){
			// log.log(e.toString());
			dispatch(clearNotices());
		}	
    }
}

export function attemptAuthentication(loginDetails){
    return (dispatch, getState) => {
        dispatch(authenticateUser(loginDetails));
		
		//check if user exists 
		// if error , mark login as failed
		// if user exists, log in

		// let db = new sqlite3.Database(SQLITE3_DB_PATH);
		// db.all("SELECT * FROM users WHERE email = ? AND password = ?", 
		// 	[loginDetails.username, loginDetails.password] , (err, row) => {
		// 		if(err !== null){
		// 			dispatch(markLoginAsFailed(err.toString()));
		// 			return;
		// 		}
				
		// 		if(row.length > 0){
		// 			dispatch(logIntoApp({
		// 				first_name: row[0].first_name, 
		// 				username: row[0].email, 
		// 				email: row[0].email, 
		// 				other_names: row[0].other_names, 
		// 				last_name: row[0].last_name}));
		// 		}else{
		// 			dispatch(markLoginAsFailed("Wrong email and password! Try again."));
		// 		}
				
		// });
	
	
    }
}

export function handleMigration(){
	return async (dispatch, getState) => {
		//Check if the database is ready
		await migrateUp();

		dispatch(setUpdating(false));
	}
}

export default { logIntoApp, logOutOfApp, authenticateUser, attemptAuthentication };
