const express = require("express")
const compression = require("compression")
const path = require("path")
const ip = require("ip")

module.exports = function createFileServer(filepath, options) {
  // Set default options.
  options = options || {}
  options.onCreate = options.onCreate || function onCreate() {}
  options.onSend = options.onSend || function onSend() {}

  // Create server.
  const app = express()
  app.use(
    compression({
      level: 9,
    }),
  )
  app.get("/", (req, res) => {
    res.download(filepath, path.basename(filepath))
    options.onSend()
  })
  const server = app.listen(0)
  const address = ip.address()
  const { port } = server.address()

  options.onCreate(`http://${address}:${port}`)

  // Close after 5 minutes.
  setTimeout(() => {
    server.close()
  }, 5 * 60 * 1000)
}
