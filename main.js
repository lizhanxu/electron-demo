const electron = require('electron');
const url = require('url');
const path = require('path');

const {app,BrowserWindow,Menu,ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to ready
app.on('ready',function(){
    // Create new Window
    mainWindow = new BrowserWindow({
        webPreferences: { //解决在视图页面引入electron模块，遇到的Uncaught ReferenceError: require is not defined
            nodeIntegration: true
        }
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainWindow.html'),
        protocol:'file',
        slashes:true
    }));
    // file://dirname//mainWindow.html

    // Quit app with closed
    mainWindow.on('close',function(){
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
    // Create new Window
    addWindow = new BrowserWindow({
        width:300,
        height:200,
        title:'Add Window',
        webPreferences: { //解决在视图页面引入electron模块，遇到的Uncaught ReferenceError: require is not defined
            nodeIntegration: true
        }
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,'addWindow.html'),
        protocol:'file',
        slashes:true
    }));

    // Garbage collection handle
    addWindow.on('close',function(){
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add',function(e,item){
    // console.log(item);
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label:'Developer Tools',
        submenu:[
            {
                label:'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}