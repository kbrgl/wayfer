const { TouchBar, Menu } = require("electron")
const menubar = require("menubar")
const path = require("path")
const url = require("url")

const mb = menubar({
  title: "Wayfer",
  width: 250,
  minWidth: 250,
  height: 220,
  minHeight: 220,
  preloadWindow: true,
  icon: null,
  showDockIcon: true,
  backgroundColor: "#e4fefd",
})

function createTouchBar() {
  const { TouchBarButton } = TouchBar
  const open = new TouchBarButton({
    label: "Open",
    backgroundColor: "#effffa",
    click: () => {
      mb.window.webContents.send("open-files", null)
    },
  })
  return new TouchBar({ items: [open] })
}

mb.on("ready", () => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click: () => {
        mb.app.quit()
      },
    },
  ])

  let iconFile = null
  switch (process.platform) {
    case "darwin":
      iconFile = "trayTemplate.png"
      break
    case "win32":
      iconFile = "tray.ico"
      break
    default:
      iconFile = "tray.png"
  }
  mb.tray.setImage(path.join(__dirname, "assets", iconFile))

  mb.tray.on("right-click", () => {
    mb.tray.popUpContextMenu(contextMenu)
  })

  mb.tray.on("drop-files", (e, filepaths) => {
    e.preventDefault()
    mb.window.webContents.send("open-files", filepaths)
  })
})

mb.on("after-create-window", () => {
  mb.window.loadURL(
    url.format({
      pathname: path.join(__dirname, "src", "index.html"),
      protocol: "file:",
      slashes: true,
    }),
  )

  if (process.platform === "darwin") {
    mb.window.setTouchBar(createTouchBar())
  }
})
