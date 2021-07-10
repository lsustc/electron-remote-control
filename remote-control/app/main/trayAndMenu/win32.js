const { app, Menu, Tray  } = require('electron')
const path = require('path')
const {show: showMainWindow} = require('../windows/main')
const {create: createAboutWindow}= require('../windows/about')

let tray;
app.whenReady().then(() => {
    tray = new Tray(path.resolve(__dirname, './icon_win32.png'))
    const contextMenu = Menu.buildFromTemplate([
        { label: '打开' + app.name, click: showMainWindow},
        { label: '关于' + app.name, click: createAboutWindow},
        { type: 'separator' },
        { label: '退出', click: () => {app.quit()}}
    ])
    tray.setContextMenu(contextMenu)
    menu = Menu.buildFromTemplate([
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow
                },
                { type: 'separator'  },
                { role: 'services'  },
                { type: 'separator'  },
                { role: 'hide'  },
                { role: 'hideothers'  },
                { role: 'unhide'  },
                { type: 'separator'  },
                { role: 'quit'  },
                { type: 'separator'  },
                { role: 'toggleDevTools' }
            ],

        },
		{ role: 'fileMenu' },
		{ role: 'windowMenu' },
		{ role: 'editMenu' }
    ])
    app.applicationMenu = menu;
})
