import axios from '../../api/config';
import 'url-search-params-polyfill';
//import * as sqlite3 from 'sqlite3';
import {createConnection} from "typeorm";
import { HUAWEI_2G_KEY_PARAMAETERS, HUAWEI_3G_KEY_PARAMAETERS, HUAWEI_4G_KEY_PARAMAETERS } from '../../services/postgresql/HuaweiKeyParametersQueries.js';

import { SQLITE3_DB_PATH } from "./db-settings";

const fs = window.require('fs');
const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const AUTHENTICATE = 'AUTHENTICATE'; //login attemp
export const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const CLEAR_OLD_SESSION = 'CLEAR_OLD_SESSION';
export const CHECK_DB_SETUP_STATUS = 'CHECK_DB_SETUP_STATUS';
export const CONFIRM_DB_READY = 'CONFIRM_DB_READY';
export const CLEAR_NOTICES = 'CLEAR_NOTICES';


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

/**
 * Check if the database is ready
 */
export function checkDBSetupStatus(){
    return (dispatch, getState) => {
        
		try{ 
			//Database already exists
			if(fs.existsSync(SQLITE3_DB_PATH)){
				dispatch(clearNotices());
				return;
			}
			
			//@TODO: Move this logic to a different file 
			let db = new sqlite3.Database(SQLITE3_DB_PATH);
			db.serialize(function() {
				//Create users table
				db.run("CREATE TABLE users (" +
					  "		first_name TEXT NOT NULL, " + 
					  "		last_name TEXT NOT NULL," +
					  "		other_names TEXT NOT NULL," +
					  " 	email TEXT NOT NULL UNIQUE," +
					  " 	password TEXT NOT NULL" +
					  ")");
				
				let stmt = db.prepare("INSERT INTO users " +
				" (first_name, last_name, other_names, email, password)" +
				" VALUES ('Expert','TelecomHall','','expert@telecomhall.net','password')," + 
				" ('Boda','Lite','Bodastage','btsuser@bodastage.org','password')" 
				);
				
				stmt.run();
				stmt.finalize();
				
				//create database settings table 
				db.run("CREATE TABLE databases (" +
					  "		hostname TEXT NOT NULL, " + 
					  "		port TEXT NOT NULL," +
					  "		username TEXT NOT NULL," +
					  " 	password TEXT NOT NULL," +
					  " 	name TEXT NOT NULL UNIQUE," +
					  " 	db_type TEXT NOT NULL" +
					  ")");
					  
				stmt = db.prepare("INSERT INTO databases " +
				" (hostname, port, username, password, name, db_type)" +
				" VALUES ('127.0.0.1','5432','bodastage','password','boda','postgresql')"
				);
				
				stmt.run();
				stmt.finalize();
				
				//Create report categories
				db.run("CREATE TABLE rpt_categories (" +
					  "		name TEXT NOT NULL UNIQUE, " + 
					  "		notes TEXT NOT NULL," +
					  "		parent_id INTEGER NOT NULL" +
					  ")");
					  
				//Create reports table 
				db.run("CREATE TABLE reports (" +
					  "		name TEXT NOT NULL UNIQUE, " + 
					  "		notes TEXT NOT NULL," +
					  "		query TEXT NOT NULL," + 
					  "		options TEXT NOT NULL," + 
					  "		type TEXT NOT NULL," + //table|pie|bar|scatter|compound
					  "		category_id INTEGER NOT NULL" + 
					  ")");
				
				//Insert default categories
				stmt = db.prepare("INSERT INTO rpt_categories " +
				" (name, notes, parent_id)" +
				" VALUES " + 
				"('Key Parameters','Key parameter reports',0),"+
				"('Network Entities','Network Entities reports',0)"
				);
				
				stmt.run();
				stmt.finalize();
				
				//Insert default reports
				stmt = db.prepare("INSERT INTO reports  (name, notes, query, options, type, category_id)" +
				" VALUES (?, ?, ?, ?, ?, ?)" );
				
				stmt.run('Ericsson 2G parameters','Ericsson 2G parameters', '', '{}', 'table',1);
				stmt.run('Ericsson 3G parameters','Ericsson 3G parameters', '', '{}', 'table',1);
				stmt.run('Ericsson 4G parameters','Ericsson 4G parameters', '', '{}', 'table',1);
				stmt.run('Huawei 2G parameters','Huawei 2G parameters', HUAWEI_2G_KEY_PARAMAETERS, '{}', 'table',1);
				stmt.run('Huawei 3G parameters','Huawei 3G parameters', HUAWEI_3G_KEY_PARAMAETERS, '{}', 'table',1);
				stmt.run('Huawei 4G parameters','Huawei 4G parameters', HUAWEI_4G_KEY_PARAMAETERS, '{}', 'table',1);
				stmt.run('ZTE 2G parameters','ZTE 2G parameters', '', '{}', 'table',1);
				stmt.run('ZTE 3G parameters','ZTE 3G parameters', '', '{}', 'table',1);
				stmt.run('ZTE 4G parameters','ZTE 4G parameters', '', '{}', 'table',1);
				stmt.run('Nokia 2G parameters','Nokia 2G parameters', '', '{}', 'table',1);
				stmt.run('Nokia 3G parameters','Nokia 3G parameters', '', '{}', 'table',1);
				stmt.run('Nokia 4G parameters','Nokia 4G parameters', '', '{}', 'table',1);
				
				stmt.finalize();
				
				dispatch(clearNotices());
			});
			
		}catch(e){
			console.log(e.toString());
			dispatch(clearNotices());
		}	
    }
}

export function attemptAuthentication(loginDetails){
    return (dispatch, getState) => {
        dispatch(authenticateUser(loginDetails));
		
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("SELECT * FROM users WHERE email = ? AND password = ?", 
			[loginDetails.username, loginDetails.password] , (err, row) => {
				if(err !== null){
					log.info(loginDetails);
					log.info(row);
					dispatch(markLoginAsFailed(err.toString()));
					return;
				}
				
				if(row.length > 0){
					dispatch(logIntoApp({
						first_name: row[0].first_name, 
						username: row[0].email, 
						email: row[0].email, 
						other_names: row[0].other_names, 
						last_name: row[0].last_name}));
				}else{
					dispatch(markLoginAsFailed("Wrong email and password! Try again."));
				}
				
		});
	
	
    }
}


export default { logIntoApp, logOutOfApp, authenticateUser, attemptAuthentication };
