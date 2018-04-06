const qr = require("qr-image")
const tempWrite = require("temp-write")
const { webFrame, remote, ipcRenderer } = require("electron")

const { dialog } = remote
const opn = require("opn")
const fs = require("fs")
const createFileServer = require("../lib/createFileServer")

webFrame.setVisualZoomLevelLimits(1, 1)

/**
 * Helper functions.
 */
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
      createFileServer(files[i].path, address => {
        const qrImage = qr.image(address, { parse_url: true, size: 20 })
        tempWrite(qrImage).then(res => {
          opn(res)
        })
      })
    })
  }
}

function showOpenDialog() {
  dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      properties: ["openFile", "multiSelections"],
    },
    paths => {
      handleFiles(
        paths.map(path => ({
          path,
        })),
      )
    },
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

ipcRenderer.on("open-file", () => {
  showOpenDialog()
})
