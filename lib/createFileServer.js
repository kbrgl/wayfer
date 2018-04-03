const express = require("express");
const compression = require("compression");
const ip = require("ip");

module.exports = function createFileServer(path, onCreate) {
  // Set default callback.
  onCreate = onCreate || function() {};

  // Create server.
  const app = express();
  app.use(compression);
  app.get("/", (req, res) => {
    res.sendFile(path);
  });
  const server = app.listen(0).on("error", err => {
    console.log(err);
  });
  const address = ip.address();
  const port = server.address().port;

  onCreate(`http://${address}:${port}`, server);

  // Close after 20 minutes.
  setTimeout(() => {
    server.close();
  }, 20 * 60 * 1000);
};
