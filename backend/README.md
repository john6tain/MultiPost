# Backend

This folder contains the local bridge backend for Multi-Post.

Responsibilities:

- create pairing sessions for the Chrome extension
- confirm pairing from the mobile app
- store the latest listing for a paired session
- accept uploaded images from the mobile app
- serve uploaded images to the extension
- delete temporary uploaded images after successful OLX fill

Main files:

- [server.js](/C:/Users/John/Documents/js/MultiPost/backend/server.js)
- [package.json](/C:/Users/John/Documents/js/MultiPost/backend/package.json)

Run locally:

```powershell
npm install
npm start
```

Default URL:

```text
http://localhost:3000
```

For full project setup, API details, and testing instructions, see:

- [README.md](/C:/Users/John/Documents/js/MultiPost/README.md)
