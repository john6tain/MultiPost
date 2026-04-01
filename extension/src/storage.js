import { LATEST_LISTING_STORAGE_KEY, PAIRING_STORAGE_KEY } from "./config.js";

export async function getPairedSession() {
  const data = await chrome.storage.local.get(PAIRING_STORAGE_KEY);
  return data[PAIRING_STORAGE_KEY] || null;
}

export async function setPairedSession(session) {
  await chrome.storage.local.set({
    [PAIRING_STORAGE_KEY]: session
  });
}

export async function clearPairedSession() {
  await chrome.storage.local.remove(PAIRING_STORAGE_KEY);
}

export async function getLatestListing() {
  const data = await chrome.storage.local.get(LATEST_LISTING_STORAGE_KEY);
  return data[LATEST_LISTING_STORAGE_KEY] || null;
}

export async function setLatestListing(listing) {
  await chrome.storage.local.set({
    [LATEST_LISTING_STORAGE_KEY]: listing
  });
}

export async function clearLatestListing() {
  await chrome.storage.local.remove(LATEST_LISTING_STORAGE_KEY);
}
