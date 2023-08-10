// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const log = require('electron-log');
const path = require('path');
const url = require('url');
const fs = require('fs');

// in the main process:
require('@electron/remote/main').initialize()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


//Create parse cm background renderer
function createParseCMBgWindow() {
	//use is 
	result = null

	//Show hidden window when in dev mode
	if (typeof process.env.ELECTRON_START_URL !== 'undefined') {
		result = new BrowserWindow({
			"show": true,
			width: 900,
			height: 600,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: true,
				webSecurity: false,
				preload: path.join(__dirname, 'preload.js')
			},

		});
		result.webContents.openDevTools();
	} else {
		result = new BrowserWindow({
			"show": false,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: true,
				webSecurity: false,
				preload: path.join(__dirname, 'preload.js')
			}
		});
	}
	//
	result.loadURL('file://' + __dirname + '/../background/background-process.html')
	result.on('closed', () => {
		console.log('background window closed')
	});
	return result
}

//Create application window
function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 900,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			webSecurity: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// and load the index.html of the app.
	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: path.join(__dirname, '/../build/index.html'),
		protocol: 'file:',
		slashes: true
	});

	// and load the index.html of the app.
	mainWindow.loadURL(startUrl);

	if (typeof process.env.ELECTRON_START_URL !== 'undefined') {
		// Open the DevTools.
		mainWindow.webContents.openDevTools();
	}


	// and load the index.html of the app.
	//mainWindow.loadFile('index.html')

	// Open the DevTools.
	//mainWindow.webContents.openDevTools()

	//Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
		app.quit();
	})

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow)


app.on('ready', () => {

	//initialte ipc listeners
	require(path.join(__dirname, 'backend', 'ipc', 'init.js'));


	//Launch main renderer process
	createWindow()

	// //Create background process windows 
	// jobRenderer = createParseCMBgWindow()

	// //Get msgs from backround job for logging 
	// ipcMain.on('to-main', (event, arg) => {
	// 	console.log("to-main:", arg)
	// });

	// //Recieve messages from UI renderer and send to the background process/window
	// ipcMain.on('parse-cm-request', (event, task, arg) => {
	// 	log.info(`parse-cm-request: task:${task} options: ${arg}`)
	// 	//forward requests to background process 
	// 	jobRenderer.webContents.send('parse-cm-job', task, arg);
	// });

	// //Messages from backgroup windows to renderer
	// ipcMain.on('parse-cm-job', (event, task, arg) => {
	// 	log.info(`parse-cm-job: task:${task} options: ${arg}`)
	// 	//forward requests to ui renderer
	// 	mainWindow.webContents.send('parse-cm-request', task, arg);
	// });

	// ipcMain.on('ready', (event, arg) => {
	// 	console.log('parse-cm-job is ready')
	// })

})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
})

app.on('browser-window-created', (_, window) => {
    require("@electron/remote/main").enable(window.webContents)
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.