# Mobile App

This folder contains the Expo React Native app for Multi-Post.

Responsibilities:

- scan QR codes from the extension
- pair the phone with the desktop session
- create and edit local listing drafts
- pick images from camera or gallery
- upload images to backend
- send listing data to the paired desktop

Main files:

- [App.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/App.tsx)
- [src/screens/HomeScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/HomeScreen.tsx)
- [src/screens/QRScannerScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/QRScannerScreen.tsx)
- [src/screens/CreateListingScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/CreateListingScreen.tsx)
- [src/screens/ListingPreviewScreen.tsx](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/screens/ListingPreviewScreen.tsx)
- [src/services/api.ts](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/services/api.ts)
- [src/theme.ts](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/theme.ts)

Run locally:

```powershell
npm install
npx expo start -c
```

Important:

- if testing on a real phone, update `API_BASE_URL` in [api.ts](/C:/Users/John/Documents/js/MultiPost/mobile-app/src/services/api.ts) to your computer's LAN IP

For full project setup, pairing flow, listing flow, and testing instructions, see:

- [README.md](/C:/Users/John/Documents/js/MultiPost/README.md)
