const express = require("express");
const compression = require("compression");
const path = require("path");
const ip = require("ip");

module.exports = function createFileServer(filepath, onCreate) {
  // Set default callback.
  onCreate = onCreate || function() {};

  // Create server.
  const app = express();
  app.use(
    compression({
      level: 9
    })
  );
  app.get("/", (req, res) => {
    res.download(filepath, path.basename(filepath));
  });
  const server = app.listen(0).on("error", err => {
    console.log(err);
  });
  const address = ip.address();
  const port = server.address().port;

  onCreate(`http://${address}:${port}`, server);

  // Close after 5 minutes.
  setTimeout(() => {
    server.close();
  }, 5 * 60 * 1000);
};
