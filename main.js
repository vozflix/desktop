// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const windowStateKeeper = require("electron-window-state");
const path = require("path");
const {
  default: installExtension,
  VUEJS3_DEVTOOLS,
} = require("electron-devtools-installer");
const isDevelopment = require("electron-is-dev");

let mainWindow;

function createWindow() {
  // Load the previous state with fallback to defaults
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1150,
    defaultHeight: 700,
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isDevelopment,
    },
  });

  mainWindowState.manage(mainWindow);

  // Hide menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(process.env.APP_URL);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.on("new-window", function (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (isDevelopment) {
    installExtension(VUEJS3_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log("An error occurred: ", err));
  }

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("get-folder-path", async (event, arg) => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  event.reply("folder-path", result.filePaths);
});
