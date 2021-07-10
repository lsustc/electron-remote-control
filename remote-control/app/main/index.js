const {app} = require('electron')
const {create: createMainWindow, show: showMainWindow, close: closeMainWindow} = require('./windows/main')
const {create: createControlWindow} = require('./windows/control')
const handleIPC = require('./ipc');
const gotTheLock = app.requestSingleInstanceLock()
if(!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        showMainWindow();
    });
    app.on('ready', () => {
        // createControlWindow()
        createMainWindow()
        handleIPC()
        require('./trayAndMenu/index')
        require('./robot.js')()
    });
    app.on('before-quit', () => {
        closeMainWindow();
    });
    app.on('activate', () => {
        showMainWindow();
    })
}