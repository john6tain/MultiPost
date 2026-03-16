# Project Context

This file is a quick handoff for continuing work on Multi-Post later without re-discovering the current setup.

## Workspace Layout

```text
MultiPost/
├─ backend/
├─ extension/
├─ mobile-app/
├─ README.md
├─ PROJECT_CONTEXT.md
└─ .gitignore
```

## What The Project Does

Multi-Post lets a user:

1. pair a mobile app with a Chrome extension using a QR code
2. create a listing on mobile
3. send that listing to the desktop session through the backend
4. autofill the OLX listing form from the extension

## Current Working Flow

1. Backend creates pairing tokens.
2. Extension popup generates QR from pairing token.
3. Mobile app scans QR and confirms pairing.
4. Extension stores paired session in `chrome.storage.local`.
5. Mobile app uploads selected photos to backend.
6. Mobile app sends listing data plus backend image paths to backend.
7. Extension popup fetches the latest listing.
8. User clicks `Fill OLX`.
9. Extension fills title, description, price, and images on OLX.
10. Extension calls backend to delete temp uploaded images after successful fill.

## Important Runtime Assumptions

### Backend

- Runs on `http://localhost:3000` for desktop/extension.
- Uses in-memory session state.
- Restarting backend clears pairings and active listings.
- Uploaded images are stored temporarily in:
  - [backend/uploads](C:\Users\John\Documents\js\MultiPost\backend\uploads)

### Mobile App

- Uses Expo SDK 55.
- Real phones must use the computer LAN IP in:
  - [api.ts](C:\Users\John\Documents\js\MultiPost\mobile-app\src\services\api.ts)
- Current file has a hardcoded LAN IP and may need changing on another network.

### Extension

- Uses Manifest V3.
- Popup handles pairing and listing preview.
- Background script only handles `on/off` badge state.
- Content script only targets OLX right now.

## Important Files

### Backend

- [server.js](C:\Users\John\Documents\js\MultiPost\backend\server.js)
- [package.json](C:\Users\John\Documents\js\MultiPost\backend\package.json)

### Extension

- [manifest.json](C:\Users\John\Documents\js\MultiPost\extension\manifest.json)
- [background.js](C:\Users\John\Documents\js\MultiPost\extension\background.js)
- [popup.js](C:\Users\John\Documents\js\MultiPost\extension\popup.js)
- [content.js](C:\Users\John\Documents\js\MultiPost\extension\content.js)
- [src/api.js](C:\Users\John\Documents\js\MultiPost\extension\src\api.js)

### Mobile App

- [App.tsx](C:\Users\John\Documents\js\MultiPost\mobile-app\App.tsx)
- [theme.ts](C:\Users\John\Documents\js\MultiPost\mobile-app\src\theme.ts)
- [HomeScreen.tsx](C:\Users\John\Documents\js\MultiPost\mobile-app\src\screens\HomeScreen.tsx)
- [CreateListingScreen.tsx](C:\Users\John\Documents\js\MultiPost\mobile-app\src\screens\CreateListingScreen.tsx)
- [ListingPreviewScreen.tsx](C:\Users\John\Documents\js\MultiPost\mobile-app\src\screens\ListingPreviewScreen.tsx)
- [QRScannerScreen.tsx](C:\Users\John\Documents\js\MultiPost\mobile-app\src\screens\QRScannerScreen.tsx)
- [api.ts](C:\Users\John\Documents\js\MultiPost\mobile-app\src\services\api.ts)

## Current OLX Selectors

- Title:
  - `input[name="title"]`
- Description:
  - `textarea[name="description"]`
- Price:
  - `input[name="parameters.price.price"]`
- Image input:
  - `input[data-testid="attach-photos-input"]`

## Current UX Notes

### Mobile App

- Dark theme is enabled.
- Main accent color is green.
- Home screen draft card behavior:
  - tap => open listing preview / send flow
  - long press => edit draft

### Extension

- Popup shows latest listing.
- Popup has:
  - `Generate QR`
  - `Refresh`
  - `Fill OLX`
  - `Disconnect`
- Badge still shows `on/off` based on supported site.

## Known Limitations

- Backend has no database.
- Pairing is not authenticated beyond token exchange.
- OLX category/location/image ordering refinements are not implemented.
- Extension cleanup removes backend temp images after successful fill, but failed fills may still leave files behind.
- Popup listing data can become stale if backend restarts.

## Good Next Steps

1. Add OLX category fill.
2. Add OLX location fill.
3. Add image upload retry/wait logic if OLX is slow.
4. Add backend cleanup job for orphaned uploads.
5. Persist pairings/listings in a database.
6. Add support for Facebook Marketplace and mobile.bg forms.
7. Add better listing state in extension after successful fill.

## Local Start Commands

### Backend

```powershell
cd C:\Users\John\Documents\js\MultiPost\backend
npm install
npm start
```

### Extension

```powershell
cd C:\Users\John\Documents\js\MultiPost\extension
npm install
```

Then load unpacked in `chrome://extensions`.

### Mobile App

```powershell
cd C:\Users\John\Documents\js\MultiPost\mobile-app
npm install
npx expo start -c
```

## If Resuming Later

Before debugging anything:

1. confirm backend is running
2. confirm mobile app `API_BASE_URL` matches the current machine/network
3. reload the unpacked extension
4. resend the listing from mobile if the extension shows stale image paths
5. verify whether listing images are backend paths like `/uploads/...` and not `file:///...`

## Primary Documentation

For full documentation, use:

- [README.md](C:\Users\John\Documents\js\MultiPost\README.md)
