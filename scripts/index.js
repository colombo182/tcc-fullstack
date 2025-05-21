"use strict";

const electron = require("electron");
const path = require("path");
const url = require('url')
//const Server = require(`${__dirname}/server`);
//const Utils = require(`${__dirname}/utils`);

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Get version number.
global.version = require(`${__dirname}/../package.json`).version;
console.log("Iniciando Espelho Inteligente: v" + global.version);
console.log(__dirname);

// global absolute root path
global.root_path = path.resolve(`${__dirname}/../`);
//console.log(global.root_path);

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		x: 0,
		y: 0,
		darkTheme: true,
		autoHideMenuBar : true,
 		fullscreen: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
			webSecurity: false
		},
		// Add these options for X11
        platform: 'linux',
		backgroundColor: "#000000"
	})

    // Handle X server errors
    mainWindow.on('unresponsive', () => {
        console.log('Window became unresponsive, checking X server...');
    });

    mainWindow.maximize();

    // and load the menu.html of the app.
    //console.log(__dirname);
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../menu.html'),
        protocol: 'file:',
        slashes: true
    }))

    //mainWindow.webContents.openDevTools(); // Add this line to open dev tools

	// Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// Add X server check before app.on('ready')
if (!process.env.DISPLAY) {
    console.error('No DISPLAY environment variable set');
    process.exit(1);
}

// This is required to be set to false beginning in Electron v9 otherwise
// the SerialPort module can not be loaded in Renderer processes like we are doing
// in this example. The linked Github issues says this will be deprecated starting in v10,
// however it appears to still be changed and working in v11.2.0
// Relevant discussion: https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse=false

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})


