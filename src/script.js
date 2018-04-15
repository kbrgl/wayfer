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

function ensureFile(filepath, onSure) {
  fs.lstat(filepath, (err, stats) => {
    if (err) showError("An unexpected error occurred")
    else if (stats.isFile()) onSure()
    else showError("Folders are currently unsupported.")
  })
}

function handleFile(filepath) {
  ensureFile(filepath, () => {
    const minute = 60 * 1000
    const hour = 60 * minute
    let timeout = null
    const server = createFileServer(
      filepath,
      () => {
        // Server close logic.
        // Closes server 10 minutes after last request.
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          server.close()
        }, 30 * minute)
      },
      () => {
        // Send notification.
        notify("Sent.", "File transferred.")
      },
    )
    server.listen(0)

    // Set timeout in case QR is not scanned.
    timeout = setTimeout(() => {
      server.close()
    }, 2 * hour)

    // Start server and show QR code.
    // Using url.resolve() and path.basename() to append the filename to the URL,
    // so that the downloaded file has the correct filename.
    // This approach allows previewing the file in the browser before
    // download.
    const encodedFileName = encodeURIComponent(path.basename(filepath))
    const fullURL = url.resolve(server.networkAddress(), encodedFileName)
    showCode(fullURL)
  })
}

function handleFiles(filepaths) {
  Array.from(filepaths).forEach(handleFile)
}

function showOpenDialog() {
  dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      properties: ["openFile", "multiSelections"],
    },
    handleFiles,
  )
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

  handleFiles(Array.from(e.dataTransfer.files).map(({ path }) => path))

  return false
}

/**
 * Open file event originating from main process (ex. touch bar)
 */
ipcRenderer.on("open-files", (e, filepaths) => {
  if (!filepaths) showOpenDialog()
  else handleFiles(filepaths)
})
