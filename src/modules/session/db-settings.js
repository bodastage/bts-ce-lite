const path = window.require('path');
const isDev = window.require('electron-is-dev');
const { app, process } = window.require('electron').remote;

export const SQLITE3_DB_NAME = 'boda-lite.sqlite3';

	
let basepath = app.getAppPath();

if (!isDev) {
  basepath = process.resourcesPath
} 

/*
* Path to sqlite3 database 
*/
export const SQLITE3_DB_PATH = path.join(basepath,'db',SQLITE3_DB_NAME);

