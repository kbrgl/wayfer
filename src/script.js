const qr = require("qr-image");
const tempWrite = require("temp-write");
const { webFrame, remote } = require("electron");
const { dialog } = remote;
const opn = require("opn");
const fs = require("fs");
const createFileServer = require("../lib/createFileServer");

webFrame.setVisualZoomLevelLimits(1, 1);

/**
 * macOS title bar double click handler.
 */
const titleBar = document.getElementById("title-bar");

titleBar.ondblclick = () => {
  const setting = remote.systemPreferences
    .getUserDefault("AppleActionOnDoubleClick", "string")
    .toLowerCase();
  if (setting === "minimize") remote.getCurrentWindow().minimize();
};

/**
 * Drop zone event handlers.
 */
const dropZone = document.getElementById("drop-zone");

dropZone.ondblclick = () => {
  dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      properties: ["openFile", "multiSelections"]
    },
    paths => {
      handleFiles(
        paths.map(path => ({
          path
        }))
      );
    }
  );
};

dropZone.ondragenter = () => {
  dropZone.classList.add("active");
  return false;
};

dropZone.ondragleave = () => {
  dropZone.classList.remove("active");
  return false;
};

dropZone.ondragover = () => {
  return false;
};

dropZone.ondragend = () => {
  return false;
};

dropZone.ondrop = e => {
  e.preventDefault();

  dropZone.classList.remove("active");

  handleFiles(e.dataTransfer.files);

  return false;
};

function handleFiles(files) {
  for (let f of files) {
    ensureFile(f.path, () => {
      createFileServer(f.path, (address, server) => {
        console.log(`Opened file ${f.path} at ${address}`);

        const qrImage = qr.image(address, { parse_url: true, size: 20 });
        tempWrite(qrImage).then(res => {
          opn(res);
        });
      });
    });
  }
}

function ensureFile(path, onSure) {
  fs.lstat(path, (err, stats) => {
    if (err) alert("An unexpected error occurred");
    else if (stats.isFile()) onSure();
    else alert("Folders are currently unsupported.");
  });
}
