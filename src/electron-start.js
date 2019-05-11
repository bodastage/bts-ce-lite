// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


//Create parse cm background renderer
function createParseCMBgWindow() {
  result = new BrowserWindow({"show": false, webPreferences: {nodeIntegration: true}})
  //result = new BrowserWindow({"show": false, webPreferences: {nodeIntegration: true}})
  result.loadURL('file://' + __dirname + '/../background/parse_cm_dumps.html')
  result.on('closed', () => {
    console.log('background window closed')
  });
  return result
}

//Create application window
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true
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
	
	if(typeof process.env.ELECTRON_START_URL !== 'undefined'){
		// Open the DevTools.
		mainWindow.webContents.openDevTools();				
	}

	
  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow)

	
app.on('ready', ()  => {
	//Launch main renderer process
	createWindow()
	
	//Create background process windows 
	jobRenderer = createParseCMBgWindow()
	
	//Get msgs from backround job for logging 
	ipcMain.on('to-main', (event, arg) => {
		console.log("to-main:",arg)
	});
	
	//Recieve messages from the background process to the UI renderer
	ipcMain.on('parse-cm-request', (event, arg) => {
		console.log("parse-cm-request:",arg)
		
		//forward requests to background process 
		jobRenderer.webContents.send('parse-cm-job', arg);
	});
	
	//Forward UI renderer requests to backgroup process 
	ipcMain.on('parse-cm-job', (event, arg) => {
		console.log("parse-cm-job:",arg)
		
		//forware requests to ui renderer
		mainWindow.webContents.send('parse-cm-request', arg);
	});
	
	ipcMain.on('ready', (event, arg) => {
		console.log('parse-cm-job is ready')
	})

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
