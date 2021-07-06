const {app} = require('electron')
const {create: createMainWindow} = require('./windows/main')
const {create: createControlWindow} = require('./windows/control')
const handleIPC = require('./ipc');
app.on('ready', () => {
    // createControlWindow()
    createMainWindow()
    handleIPC()
    require('./robot.js')()
})
