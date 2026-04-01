# Multi-Post

Multi-Post is a local MVP for creating marketplace listings on mobile and autofilling them in a desktop Chrome extension.

## Architecture

The project now uses only:

- `mobile-app/` (Expo React Native app)
- `extension/` (Chrome extension)

There is no standalone backend service.

## How Pairing Works (One Scan + Relay Signaling)

1. Open extension popup and click `Generate QR`.
2. Mobile app scans the single QR.
3. Extension offer is fetched via a tiny relay session.
4. Mobile posts WebRTC answer back to relay automatically.
5. Extension auto-connects by polling relay answer.
6. Keep popup open while receiving new listings from mobile.

If mobile runtime has no WebRTC (`RTCPeerConnection` missing), pairing and listing transfer fall back to relay mode automatically.

## How Listing Transfer Works

1. Create a listing in mobile app.
2. Tap `Send to Desktop`.
3. Mobile app converts selected images to data URIs and sends listing directly over peer channel.
4. Extension stores latest listing and uses existing marketplace adapters to fill forms.

## Run Locally

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

## Notes

- If mobile runtime does not expose `RTCPeerConnection`, pairing will fail until WebRTC-capable runtime/build is used.
- Extension fills forms using the marketplace adapters under `extension/content/marketplaces`.
