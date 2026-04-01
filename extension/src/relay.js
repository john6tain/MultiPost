const RELAY_BASE_URL = "https://jsonblob.com/api/jsonBlob";

function getLocationHeader(response) {
  return response.headers.get("Location") || response.headers.get("location") || "";
}

function normalizeRelayUrl(value) {
  try {
    return new URL(value, RELAY_BASE_URL).toString();
  } catch {
    return "";
  }
}

export async function createRelaySession(payload) {
  let response;
  try {
    response = await fetch(RELAY_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error("Relay network request failed. Check internet access and reload the extension.");
  }

  if (!response.ok) {
    throw new Error("Could not create relay session.");
  }

  const relayUrl = getLocationHeader(response);
  if (!relayUrl) {
    throw new Error("Relay did not return a session URL.");
  }

  const normalizedRelayUrl = normalizeRelayUrl(relayUrl);
  if (!normalizedRelayUrl) {
    throw new Error("Relay returned an invalid session URL.");
  }

  return normalizedRelayUrl;
}

export async function getRelaySession(relayUrl) {
  let response;
  try {
    response = await fetch(relayUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
  } catch {
    throw new Error("Relay polling failed. Check internet access.");
  }

  if (!response.ok) {
    throw new Error("Could not read relay session.");
  }

  return response.json();
}

export async function updateRelaySession(relayUrl, payload) {
  let response;
  try {
    response = await fetch(relayUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error("Relay update failed. Check internet access.");
  }

  if (!response.ok) {
    throw new Error("Could not update relay session.");
  }
}
