const qr = require("qr-image");
const tempWrite = require("temp-write");
const { webFrame, remote } = require("electron");
const { dialog } = remote;
const opn = require("opn");
const createFileServer = require("../lib/createFileServer");

webFrame.setVisualZoomLevelLimits(1, 1);

const holder = document.getElementById("drop-zone");

holder.onclick = () => {
  dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      properties: ["openFile", "openDirectory", "multiSelections"]
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

holder.ondragenter = () => {
  holder.classList.add("active");
  return false;
};

holder.ondragleave = () => {
  holder.classList.remove("active");
  return false;
};

holder.ondragover = () => {
  return false;
};

holder.ondragend = () => {
  return false;
};

holder.ondrop = e => {
  e.preventDefault();

  holder.classList.remove("active");

  handleFiles(e.dataTransfer.files);

  return false;
};

function handleFiles(files) {
  for (let f of files) {
    createFileServer(f.path, (address, server) => {
      console.log(`Opened file ${f.path} at ${address}`);

      const qrImage = qr.image(address, {
        parse_url: true,
        size: 20
      });
      tempWrite(qrImage).then(res => {
        opn(res);
      });
    });
  }
}
