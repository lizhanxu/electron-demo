const electron = require('electron');
const url = require('url');
const path = require('path');

const {app,BrowserWindow,Menu,ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'devlopment';

let mainWindow;
let addWindow;

// Listen for app to ready
app.on('ready',function(){
    // Create new Window
    mainWindow = new BrowserWindow({
        //webPreferences   进行网页功能的设置
        webPreferences: { //解决在视图页面引入electron模块，遇到的Uncaught ReferenceError: require is not defined
            nodeIntegration: true   //是否整合node
        }
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainWindow.html'),
        protocol:'file',
        slashes:true     //是否在协议的冒号后面使用双斜杠
    }));
    // file://dirname//mainWindow.html

    // Quit app with closed
    mainWindow.on('close',function(){
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // 当没有指定菜单时，显示默认菜单
    Menu.setApplicationMenu(mainMenu);
});

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
              //通过accelerator指定快捷键
              //darwin代表苹果系统
              accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
              click(){
                  app.quit();
              }
          }
      ]
  }
];

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
    // GC，释放资源
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