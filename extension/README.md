# Extension

This folder contains the Chrome Manifest V3 extension for Multi-Post.

Responsibilities:

- show `on` / `off` badge state on supported marketplace sites
- generate QR pairing sessions
- store paired desktop state in `chrome.storage.local`
- fetch and display the latest listing
- fill marketplace fields and images from the received listing through site adapters

Main files:

- [manifest.json](/C:/Users/John/Documents/js/MultiPost/extension/manifest.json)
- [background.js](/C:/Users/John/Documents/js/MultiPost/extension/background.js)
- [popup.html](/C:/Users/John/Documents/js/MultiPost/extension/popup.html)
- [popup.js](/C:/Users/John/Documents/js/MultiPost/extension/popup.js)
- [content.js](/C:/Users/John/Documents/js/MultiPost/extension/content.js)
- [src/marketplaces.js](/C:/Users/John/Documents/js/MultiPost/extension/src/marketplaces.js)
- [content/marketplaces/olx.js](/C:/Users/John/Documents/js/MultiPost/extension/content/marketplaces/olx.js)
- [content/marketplaces/mobileBg.js](/C:/Users/John/Documents/js/MultiPost/extension/content/marketplaces/mobileBg.js)

Setup:

```powershell
npm install
```

Then load the folder as an unpacked extension in:

```text
chrome://extensions
```

For full project setup, pairing flow, marketplace autofill details, and testing instructions, see:

- [README.md](/C:/Users/John/Documents/js/MultiPost/README.md)
