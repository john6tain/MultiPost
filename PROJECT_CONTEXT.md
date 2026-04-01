# Project Context

## Current Architecture

Multi-Post now has only two runtime parts:

1. `mobile-app` (Expo React Native app)
2. `extension` (Chrome extension)

The old `backend/` service has been deprecated and removed.

## Pairing And Transfer Model

Pairing is now direct peer setup:

1. Extension creates a WebRTC offer and shows it as QR.
2. Mobile app scans one QR and reads relay URL/session id.
3. Extension offer is already stored in relay.
4. Mobile app writes answer to relay and waits for channel open.
5. Extension polls relay and applies answer automatically.
6. Mobile app sends listing payloads directly over the peer data channel.

## Listing Data

- Images are kept on mobile and encoded as data URIs before send.
- Extension stores latest received listing in `chrome.storage.local`.
- Extension content scripts use received data URIs directly when attaching files.

## Important Files

### Mobile App

- [QRScannerScreen.tsx](C:\Users\John\Documents\js\MultiPost\mobile-app\src\screens\QRScannerScreen.tsx)
- [ListingPreviewScreen.tsx](C:\Users\John\Documents\js\MultiPost\mobile-app\src\screens\ListingPreviewScreen.tsx)
- [peerTransfer.ts](C:\Users\John\Documents\js\MultiPost\mobile-app\src\services\peerTransfer.ts)
- [qrService.ts](C:\Users\John\Documents\js\MultiPost\mobile-app\src\services\qrService.ts)

### Extension

- [popup.js](C:\Users\John\Documents\js\MultiPost\extension\popup.js)
- [popup.html](C:\Users\John\Documents\js\MultiPost\extension\popup.html)
- [src/peerSession.js](C:\Users\John\Documents\js\MultiPost\extension\src\peerSession.js)
- [src/storage.js](C:\Users\John\Documents\js\MultiPost\extension\src\storage.js)
- [content/common.js](C:\Users\John\Documents\js\MultiPost\extension\content\common.js)

## Start Commands

### Mobile App

```powershell
cd C:\Users\John\Documents\js\MultiPost\mobile-app
npm install
npx expo start -c
```

### Extension

```powershell
cd C:\Users\John\Documents\js\MultiPost\extension
npm install
```

Then load unpacked extension in `chrome://extensions`.
