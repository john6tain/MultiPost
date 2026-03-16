import { API_BASE_URL } from "./config.js";

async function requestJson(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error(`Could not reach API at ${API_BASE_URL}`);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      if (typeof data?.message === "string" && data.message) {
        message = data.message;
      }
    } catch {
      // Ignore invalid error payloads and keep the fallback message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function createPairingSession() {
  return requestJson("/api/extension/pairing-session", {
    method: "POST"
  });
}

export async function getPairingStatus(pairingToken) {
  return requestJson(`/api/extension/pairing-status/${encodeURIComponent(pairingToken)}`);
}

export async function getActiveListing(pairingToken) {
  return requestJson(`/api/extension/active-listing/${encodeURIComponent(pairingToken)}`);
}

export async function deleteUploadedImages(images) {
  return requestJson("/api/extension/delete-images", {
    method: "POST",
    body: JSON.stringify({ images })
  });
}
