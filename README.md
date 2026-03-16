# Multi-Post

Multi-Post is a local MVP for creating marketplace listings on mobile and pushing them to a desktop Chrome extension for autofill on marketplace websites.

Current workspace structure:

```text
MultiPost/
├─ backend/
├─ extension/
├─ mobile-app/
└─ .gitignore
```

## Overview

The project has three parts:

1. `mobile-app`
React Native + Expo app where the user:
- pairs the phone with the Chrome extension by scanning a QR code
- creates a listing
- uploads listing images to the backend
- sends the listing to the paired desktop session

2. `extension`
Chrome Manifest V3 extension that:
- shows `on` / `off` on supported sites
- generates a QR pairing token
- stores pairing state locally
- fetches the latest listing from the backend
- fills OLX title, description, price, and images

3. `backend`
Node backend used as the session bridge between mobile and extension:
- creates pairing sessions
- confirms mobile pairing
- stores the latest listing per paired session
- stores uploaded images temporarily
- deletes uploaded images after successful OLX autofill

## Supported marketplace detection

The extension badge shows:

- `on` for:
  - `https://www.olx.bg/`
  - `https://www.facebook.com/marketplace/`
  - `https://www.mobile.bg/`
- `off` for everything else

The autofill implementation currently targets OLX.

## Current Features

### Mobile app

- QR code scanner with Expo Camera
- pairing with desktop extension
- local draft listing storage
- listing form with:
  - title
  - description
  - price
  - category
  - location
  - photos
- gallery and camera image selection
- send listing to desktop
- dark theme
- tap draft card to open send preview
- long press draft card to edit

### Extension

- popup-based QR pairing flow
- restore pairing from `chrome.storage.local`
- disconnect flow
- listing preview inside popup
- refresh latest listing
- autofill OLX title, description, and price
- upload OLX images from backend-served temp files
- delete uploaded backend images after successful fill

### Backend

- in-memory pairing session storage
- image upload endpoint with disk storage
- static file serving for uploaded images
- listing bridge between mobile and extension

## Tech Stack

### Mobile app

- Expo
- React Native
- TypeScript
- React Navigation
- Expo Camera
- Expo Image Picker
- Axios

### Extension

- Chrome Extension Manifest V3
- plain JavaScript
- popup UI with local QR generation

### Backend

- Node.js
- Express
- Multer

## Folder Details

### `backend/`

Main files:

- [server.js](/C:/Users/John/Documents/js/MultiPost/backend/server.js)
- [package.json](/C:/Users/John/Documents/js/MultiPost/backend/package.json)

Responsibilities:

- create pairing sessions
- confirm pairing state
- return the active listing to extension
- receive uploaded images from mobile
- serve uploaded images from `/uploads/...`
- delete uploaded images after extension fill

### `extension/`

Main files:

- [manifest.json](/C:/Users/John/Documents/js/MultiPost/extension/manifest.json)
- [background.js](/C:/Users/John/Documents/js/MultiPost/extension/background.js)
- [popup.html](/C:/Users/John/Documents/js/MultiPost/extension/popup.html)
- [popup.js](/C:/Users/John/Documents/js/MultiPost/extension/popup.js)
- [content.js](/C:/Users/John/Documents/js/MultiPost/extension/content.js)
- [src/api.js](/C:/Users/John/Documents/js/MultiPost/extension/src/api.js)
- [src/storage.js](/C:/Users/John/Documents/js/MultiPost/extension/src/storage.js)

Responsibilities:

- badge state on supported marketplaces
- generate QR token
- poll pairing status
- fetch active listing
- fill OLX form

### `mobile-app/`

Main files:

- [App.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/App.tsx)
- [src/theme.ts](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/theme.ts)
- [src/screens/HomeScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/HomeScreen.tsx)
- [src/screens/QRScannerScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/QRScannerScreen.tsx)
- [src/screens/CreateListingScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/CreateListingScreen.tsx)
- [src/screens/ListingPreviewScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/ListingPreviewScreen.tsx)
- [src/services/api.ts](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/services/api.ts)

Responsibilities:

- pair with extension by scanning QR
- create and edit listing drafts
- upload local mobile images to backend
- send backend image URLs plus listing data to desktop

## Backend API

### Pairing

`POST /api/extension/pairing-session`

Response:

```json
{
  "pairingToken": "abc123",
  "expiresIn": 120
}
```

`GET /api/extension/pairing-status/:token`

Response before pairing:

```json
{
  "paired": false
}
```

Response after pairing:

```json
{
  "paired": true,
  "userId": "user_1",
  "deviceName": "Android phone"
}
```

`POST /api/mobile/pair-extension`

Body:

```json
{
  "pairingToken": "abc123",
  "deviceName": "Android phone"
}
```

### Listing bridge

`POST /api/mobile/send-listing`

Body:

```json
{
  "pairingToken": "abc123",
  "listing": {
    "title": "Vintage bicycle",
    "description": "Very good condition",
    "price": 100,
    "category": "Bikes",
    "location": "Sofia",
    "images": [
      "/uploads/file-1.jpg"
    ]
  }
}
```

`GET /api/extension/active-listing/:token`

Response:

```json
{
  "listing": {
    "title": "Vintage bicycle",
    "description": "Very good condition",
    "price": 100,
    "category": "Bikes",
    "location": "Sofia",
    "images": [
      "/uploads/file-1.jpg"
    ]
  }
}
```

### Image upload and cleanup

`POST /api/mobile/upload-images`

Multipart form field:

- `images`

Response:

```json
{
  "images": [
    "/uploads/uuid-1.jpg",
    "/uploads/uuid-2.jpg"
  ]
}
```

`POST /api/extension/delete-images`

Body:

```json
{
  "images": [
    "/uploads/uuid-1.jpg",
    "/uploads/uuid-2.jpg"
  ]
}
```

This is called by the extension after successful OLX image fill so temporary backend files do not accumulate.

## How Pairing Works

1. User opens the extension popup.
2. User clicks `Generate QR`.
3. Extension requests a pairing session from the backend.
4. Extension renders the token as QR payload JSON.
5. Mobile app scans the QR code.
6. Mobile app validates the QR payload.
7. Mobile app confirms pairing via backend.
8. Extension polls backend until it sees `paired: true`.
9. Extension stores the paired session in `chrome.storage.local`.

## How Listing Transfer Works

1. User creates or edits a draft listing in the mobile app.
2. User taps `Send to Desktop`.
3. Mobile app uploads selected photos to backend.
4. Backend returns temporary image URLs under `/uploads/...`.
5. Mobile app sends listing data plus those image URLs to backend.
6. Extension popup fetches the active listing for the paired token.
7. User opens OLX and clicks `Fill OLX`.
8. Extension content script:
   - fills title
   - waits briefly
   - fills description
   - fills price
   - fetches backend images
   - creates browser `File` objects
   - injects them into the OLX file input
9. Extension calls backend cleanup to delete uploaded temp images.

## Installation

### 1. Backend

From [backend](/C:/Users/John/Documents/js/MultiPost/backend):

```powershell
npm install
npm start
```

Expected log:

```text
Multi-Post backend listening on http://localhost:3000
```

Health check:

```powershell
curl http://localhost:3000/health
```

### 2. Chrome extension

From [extension](/C:/Users/John/Documents/js/MultiPost/extension):

```powershell
npm install
```

Then in Chrome:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select the `extension` folder

Reload the extension after manifest or script changes.

### 3. Mobile app

From [mobile-app](/C:/Users/John/Documents/js/MultiPost/mobile-app):

```powershell
npm install
npx expo start -c
```

## Important Network Note

The mobile app uses:

- [src/services/api.ts](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/services/api.ts)

If you run the mobile app on a real phone, `API_BASE_URL` must be your computer's LAN IP, not `localhost`.

Example:

```ts
export const API_BASE_URL = "http://192.168.88.2:3000";
```

The extension still uses `http://localhost:3000`, which is correct because it runs on the same desktop as the backend.

## How to Test

### Full happy path

1. Start the backend.
2. Load the Chrome extension.
3. Start the mobile app.
4. Open extension popup and click `Generate QR`.
5. In the mobile app, tap `Scan Desktop QR`.
6. Scan the extension QR code.
7. Confirm both sides show connected state.
8. In the mobile app, create a listing with photos.
9. Tap `Send to Desktop`.
10. Open extension popup and confirm the listing appears.
11. Open an OLX create-listing page.
12. Click `Fill OLX`.
13. Confirm:
    - title filled
    - description filled
    - price filled
    - images attached to OLX uploader

### Debugging checklist

If the mobile app cannot reach backend:

- verify `backend` is running on port `3000`
- verify `API_BASE_URL` in mobile app
- if using a real phone, use LAN IP instead of `localhost`

If extension popup shows no listing:

- confirm mobile app tapped `Send to Desktop`
- click `Refresh` in popup
- confirm the listing is tied to the currently paired token

If OLX fill fails:

- make sure you are on an OLX create-listing page
- reload the extension after content script changes
- verify popup contains the latest listing

If image upload fails:

- confirm popup listing images are backend paths like `/uploads/...`
- not mobile file paths like `file:///...`
- confirm backend is serving uploaded files

## Current OLX Mappings

Currently mapped selectors:

- title: `input[name="title"]`
- description: `textarea[name="description"]`
- price: `input[name="parameters.price.price"]`
- image input: `input[data-testid="attach-photos-input"]`

## Current Limitations

- backend uses in-memory pairing sessions
  - restarting backend clears active pairings and listings
- no authentication
- no permanent database
- only OLX autofill is implemented
- category, location, and advanced form fields are not filled yet
- image deletion happens after successful extension-side fill only

## Recommended Next Steps

1. Add category fill on OLX
2. Add location fill on OLX
3. Add Facebook Marketplace form mapping
4. Add `mobile.bg` form mapping
5. Persist pairings and listings in a database
6. Add authentication between mobile, extension, and backend
7. Add listing versioning or multiple draft support
8. Add image cleanup fallback jobs on backend

## Notes

- Root ignore rules are in [.gitignore](/C:/Users/John/Documents/js/MultiPost/.gitignore)
- Backend uploaded temp images are ignored in git via `backend/uploads/`
- Mobile app uses a dark theme with green as the main accent color
