# Extension

This folder contains the Chrome Manifest V3 extension for Multi-Post.

Responsibilities:

- show `on` / `off` badge state on supported marketplace sites
- generate QR pairing sessions
- store paired desktop state in `chrome.storage.local`
- fetch and display the latest listing
- fill OLX fields and images from the received listing

Main files:

- [manifest.json](/C:/Users/John/Documents/js/MultiPost/extension/manifest.json)
- [background.js](/C:/Users/John/Documents/js/MultiPost/extension/background.js)
- [popup.html](/C:/Users/John/Documents/js/MultiPost/extension/popup.html)
- [popup.js](/C:/Users/John/Documents/js/MultiPost/extension/popup.js)
- [content.js](/C:/Users/John/Documents/js/MultiPost/extension/content.js)

Setup:

```powershell
npm install
```

Then load the folder as an unpacked extension in:

```text
chrome://extensions
```

For full project setup, pairing flow, OLX autofill details, and testing instructions, see:

- [README.md](/C:/Users/John/Documents/js/MultiPost/README.md)
