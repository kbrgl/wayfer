const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const url = require("url");
const config = require("./config");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  const size = 300;
  win = new BrowserWindow({
    title: config.name,
    width: size,
    height: size,
    resizable: false,
    titleBarStyle: "hiddenInset",
    fullscreenable: false,
    backgroundColor: "#f9e0aa",
    show: false
  });

  // Load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "src", "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  /* Uncomment to open dev-tools */
  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // This method will be called when the page has been
  // loaded. I've used it to show the window only when
  // the application has finished loading, so users
  // don't see the square of solid color.
  win.on("ready-to-show", () => {
    win.show();
    win.focus();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
