import axios from '../../api/config';
import 'url-search-params-polyfill';
//import * as sqlite3 from 'sqlite3';
import { createConnection, Connection, ConnectionOptions } from "typeorm";

//const sqlite3 = window.require('sqlite3').sqlite3;
//const sqlite3 = window.require('sqlite3').verbose()


export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const AUTHENTICATE = 'AUTHENTICATE'; //login attemp
export const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const CLEAR_OLD_SESSION = 'CLEAR_OLD_SESSION';
export const CHECK_DB_SETUP_STATUS = 'CHECK_DB_SETUP_STATUS';
export const CONFIRM_DB_READY = 'CONFIRM_DB_READY';
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

/**
 * Check if the database is ready
 */
export function checkDBSetupStatus(){
    return (dispatch, getState) => {
        
		/*
		const connection = createConnection({
			  "type": "sqlite",
			  "synchronize": true,
			  "logging": true,
			  "logger": "simple-console",
			  "database": "bts.sqlite",
			  "entities": [
				"../../entities/*.js"
			  ]
		});
		*/
		dispatch(waitForDatabaseSetup("Loading preferences..."));

		//Check every minute 1000*60
		//setTimeout(() => dispatch(checkDBSetupStatus()), 60000);
				
	
    }
}

export function attemptAuthentication(loginDetails){
    return (dispatch, getState) => {
        dispatch(authenticateUser(loginDetails));
        /*
        const params = new URLSearchParams();
        params.append('username', loginDetails.username);
        params.append('password', loginDetails.password);
    
		const connection = createConnection({
			  "type": "sqlite",
			  "synchronize": true,
			  "logging": true,
			  "logger": "simple-console",
			  "database": "bts.sqlite",
			  "entities": [
				"../../entities/*.js"
			  ]
		});
		*/
		//connection.runMigrations()
		
		
		dispatch(logIntoApp({first_name: "btsuser", email: "btsusr@bodastage.org"}));
	
	
    }
}
export default { logIntoApp, logOutOfApp, authenticateUser, attemptAuthentication };