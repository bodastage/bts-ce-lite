import { SQLITE3_DB_PATH } from "../session/db-settings";

const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');
const { Client } = window.require('pg');

export const START_DB_SETTINGS_UPDATE = 'START_DB_SETTINGS_UPDATE';
export const SHOW_DB_UPDATE_SUCCESS = 'SHOW_DB_UPDATE_SUCCESS';
export const TEST_DB_CONNECTION = 'TEST_DB_CONNECTION';
export const SHOW_DB_UPDATE_ERROR = 'SHOW_DB_UPDATE_ERROR';
export const UPDATE_STATE_DB_SETTINGS = 'UPDATE_STATE_DB_SETTINGS';
export const CLEAR_DB_UPDATE_ERROR = 'CLEAR_DB_UPDATE_ERROR';
export const CLEAR_DB_UPDATE_SUCCESS = 'CLEAR_DB_UPDATE_SUCCESS';
export const STOP_DB_SETTINGS_UPDATE = 'STOP_DB_SETTINGS_UPDATE';



export function stopDBSettingsUpdate(){
	return {
		type: STOP_DB_SETTINGS_UPDATE
	}
}

export function clearDBUpdateSuccess(){
	return {
		type: CLEAR_DB_UPDATE_SUCCESS
	}
}

export function clearDBUpdateError(){
	return {
		type: CLEAR_DB_UPDATE_ERROR
	}
}

export function updateStateDBSettings(settings){
	return {
		type: UPDATE_STATE_DB_SETTINGS,
		settings: settings
	}
}

export function getDBSettings(){
	return (dispatch, getState) => {
		startDBSettingsUpdate();
		
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("SELECT * FROM databases WHERE name = ?", ["postgres"] , (err, row) => {
				if(err !== null){
					log.error(row);
					dispatch(showDBUpdateError(err.toString()));
					return;
				}
				
				if(row.length > 0){
					dispatch(updateStateDBSettings({
						hostname: row[0].hostname, 
						port: row[0].port, 
						username: row[0].username, 
						password: row[0].password, 
						}));
				}else{
					dispatch(showDBUpdateError("Settings for database boda donot exist!"));
				}
				
		});
		
	}
}

export function startDBSettingsUpdate(){
	return {
		type: START_DB_SETTINGS_UPDATE
	}
}

export function showDBUpdateError(error){
	return {
		type: SHOW_DB_UPDATE_ERROR,
		error: error
	}
}

export function showDBUpdateSuccess(message){
	return {
		type: SHOW_DB_UPDATE_SUCCESS,
		message: message
	}
}

export function updateDBSettings(settings){
    return (dispatch, getState) => {
		dispatch(startDBSettingsUpdate());
		
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.serialize(() => {
			try{
				let query = "UPDATE databases SET hostname = ?, port = ?, username = ?, password = ? ";
				let values= [settings.hostname, 
							 settings.port, 
							 settings.username, 
							 settings.password]

				query += " WHERE name = 'postgres'";
				
				var stmt = db.prepare(query,values);
					
				stmt.run();
				stmt.finalize();
				dispatch(updateStateDBSettings(settings));
				dispatch(showDBUpdateSuccess("Database settings updated."));
			}catch(e){
				dispatch(showDBUpdateError("Update failed"));
			}
			
		});
	}  
}

export function checkConnection(settings){
    return (dispatch, getState) => {
		dispatch(startDBSettingsUpdate());

		const connectionString = `postgresql://${settings.username}:${settings.password}@${settings.hostname}:${settings.port}/postgres`
		
		const client = new Client({
		  connectionString: connectionString,
		})
		
		client.connect((err) => {
			if(err !== null){
				dispatch(showDBUpdateError(`Failed to connect to ${connectionString}. ${err}`));
				log.error(`Failed to connect to ${connectionString}. ${err}`)
				return;
			}

			dispatch(showDBUpdateSuccess("Connected successfully to server"));

			client.end();
		});

	}
	
}