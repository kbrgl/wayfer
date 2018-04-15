const Koa = require("koa")
const compress = require("koa-compress")
const range = require("koa-range")
const send = require("koa-send")
const http = require("http")
const ip = require("ip")

module.exports = function createFileServer(filepath, onrequest, onsent) {
  // Set default middleware.
  onrequest = onrequest || function onrequest() {}
  onsent = onsent || function onsent() {}

  // Create server.
  const app = new Koa()
  app.use(
    compress({
      level: 9,
    }),
  )
  app.use(range)
  app.use(async ctx => {
    await onrequest()
    await send(ctx, filepath, { root: "/" })
    if (!ctx.request.headers.range) await onsent()
  })

  const server = http.createServer(app.callback())
  server.networkAddress = function networkAddress() {
    if (!this.listening) {
      return null
    }
    const address = ip.address()
    const { port } = this.address()
    return `http://${address}:${port}`
  }

  return server
}
