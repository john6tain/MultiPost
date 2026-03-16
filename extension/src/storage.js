import { PAIRING_STORAGE_KEY } from "./config.js";

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
