const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');
const { Client, Pool } = window.require('pg');
const path = window.require('path');
const isDev = window.require('electron-is-dev');
const { app, process } = window.require('electron').remote;
const SQLITE3_DB_NAME = 'boda-lite.sqlite3';

let basepath = app.getAppPath();

if (!isDev) {
  basepath = process.resourcesPath
} 

const SQLITE3_DB_PATH = path.join(basepath,'db',SQLITE3_DB_NAME);


/**
* Get database connection details
*/
async function getSQLiteDBConnectionDetails(dbName='boda'){
		
		let details = await
		new Promise((resolve, reject) => {
			
			let db = new sqlite3.Database(SQLITE3_DB_PATH);
			db.all("SELECT * FROM databases WHERE name = ?", [dbName] , (err, row) => {
				if(err !== null){
					log.error(row);
					//@TODO: Show table data log error
					return reject(err);
					
				}
				
				return resolve({
					hostname : row[0].hostname,
					port : row[0].port,
					username : row[0].username,
					password : row[0].password
				});
			});
			
		});

		return details;
}



/**
* Run report query
*
* @param string query
*/
async function runQuery(query){
	
	const dbConDetails  = await getSQLiteDBConnectionDetails('boda');

	const hostname = dbConDetails.hostname;
	const port = dbConDetails.port;
	const username = dbConDetails.username;
	const password = dbConDetails.password;
	
	const connectionString = `postgresql://${username}:${password}@${hostname}:${port}/boda`;
	const client = new Client({
		connectionString: connectionString,
	});
		
	client.connect((err) => {
		if(err){
			return err;
		}
	});
		
	let results = await
	new Promise((resolve, reject) => {
		client.query(query)
		.then( result => {
			resolve(result);
		} )
		.catch(e => {
			//@TODO: Error notice
			reject(e);
			
		})
		.then(() => client.end());
	});	
	
	return results;
	
}

exports.getSQLiteDBConnectionDetails = getSQLiteDBConnectionDetails;
exports.runQuery = runQuery;