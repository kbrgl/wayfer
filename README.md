<h1 align="center">
  <img src="build/icon.png" alt="Wayfer" height="128" width="128">
  <p>Wayfer</p>
</h1>

Wayfer is a simple app for desktop-to-mobile file transfers.

# Installation

For now, you'll have to build the package yourself.

1.  Clone the repo
2.  `yarn` or `npm install`
3.  `yarn build` or `npm run build`

# Usage

1.  Drag a file to the Wayfer window (or double click the window)
2.  Scan the QR code

QRs can be scanned using the built-in camera app (iOS) or using a QR scanner app (Android).

Files remain available until 30 minutes after the last request to the server,
or 2 hours after the server is started if no request is made.
