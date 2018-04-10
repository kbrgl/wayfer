const qr = require("qr-image")
const tempWrite = require("temp-write")
const { webFrame, remote, ipcRenderer } = require("electron")

const { dialog } = remote
const opn = require("opn")
const fs = require("fs")
const url = require("url")
const path = require("path")
const createFileServer = require("../lib/createFileServer")

webFrame.setVisualZoomLevelLimits(1, 1)

/**
 * Helper functions.
 */
function notify(title, body) {
  const notification = new Notification(title, { body })
  return notification
}

function showCode(address) {
  console.log(address)
  const qrImage = qr.image(address, { parse_url: true, size: 20 })
  tempWrite(qrImage).then(res => {
    opn(res)
  })
}

function showError(message) {
  dialog.showMessageBox(remote.getCurrentWindow(), {
    type: "error",
    message,
  })
}

function ensureFile(path, onSure) {
  fs.lstat(path, (err, stats) => {
    if (err) showError("An unexpected error occurred")
    else if (stats.isFile()) onSure()
    else showError("Folders are currently unsupported.")
  })
}

function handleFiles(files) {
  for (let i = 0; i < files.length; i += 1) {
    ensureFile(files[i].path, () => {
      // epoch is used to calculate time since last request.
      let epoch = Date.now()
      const server = createFileServer(
        files[i].path,
        () => {
          // Set epoch to request time.
          epoch = Date.now()
        },
        () => {
          // Send notification.
          notify("Sent.", "File transferred.")
        },
      )
      server.listen(0)

      // Set up server close logic.
      const minute = 60 * 1000
      const interval = setInterval(() => {
        // Check whether 10 minutes passed since last request.
        if (new Date() - epoch > 10 * minute) {
          server.close()
          clearInterval(interval)
        }
      }, 5 * minute)

      // Start server and show QR code.
      // Using url.resolve() and path.basename() to append the filename to the URL,
      // so that the downloaded file has the correct filename.
      // This approach allows previewing the file in the browser before
      // download.
      showCode(url.resolve(server.networkAddress(), path.basename(files[i].path)))
    })
  }
}

function handlePaths(paths) {
  return handleFiles(paths.map(path => ({ path })))
}

function showOpenDialog() {
  dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      properties: ["openFile", "multiSelections"],
    },
    handlePaths,
  )
}

/**
 * macOS title bar double click handler.
 */
const titleBar = document.getElementById("title-bar")

titleBar.ondblclick = () => {
  const setting = remote.systemPreferences
    .getUserDefault("AppleActionOnDoubleClick", "string")
    .toLowerCase()
  if (setting === "minimize") remote.getCurrentWindow().minimize()
}

/**
 * Drop zone event handlers.
 */
const dropZone = document.getElementById("drop-zone")

dropZone.ondblclick = showOpenDialog

dropZone.ondragenter = () => {
  dropZone.classList.add("active")
  return false
}

dropZone.ondragleave = () => {
  dropZone.classList.remove("active")
  return false
}

dropZone.ondragover = () => false

dropZone.ondragend = () => false

dropZone.ondrop = e => {
  e.preventDefault()

  dropZone.classList.remove("active")

  handleFiles(e.dataTransfer.files)

  return false
}

/**
 * Open file event originating from main process (ex. touch bar)
 */
ipcRenderer.on("open-file", () => {
  showOpenDialog()
})
