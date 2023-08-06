const path = window.require('path');
//const isDev = window.require('electron-is-dev');
//const { app, process } = window.require('@electron/remote');
const { app } = window.require('electron');

console.log(app);

export const SQLITE3_DB_NAME = 'boda-lite.sqlite3';

//console.log(app);
	
//let basepath = app.getAppPath();

// if (!isDev) {
//   basepath = process.resourcesPath
// } 

/*
* Path to sqlite3 database 
*/
//export const SQLITE3_DB_PATH = path.join(basepath,'db',SQLITE3_DB_NAME);
export const SQLITE3_DB_PATH = SQLITE3_DB_NAME; //path.join(basepath,'db',SQLITE3_DB_NAME);

