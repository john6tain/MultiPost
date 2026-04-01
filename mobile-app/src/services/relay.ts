const RELAY_BASE_URL = "https://jsonblob.com/api/jsonBlob";
const REQUEST_TIMEOUT_MS = 12000;

function getLocationHeader(response: Response) {
  return response.headers.get("Location") || response.headers.get("location") || "";
}

function normalizeRelayUrl(value: string) {
  try {
    return new URL(value, RELAY_BASE_URL).toString();
  } catch {
    return "";
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function createRelaySession(payload: unknown) {
  let response: Response;
  try {
    response = await fetchWithTimeout(RELAY_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error("Relay network request failed. Check phone internet access.");
  }

  if (!response.ok) {
    throw new Error("Could not create relay session.");
  }

  const relayUrl = normalizeRelayUrl(getLocationHeader(response));
  if (!relayUrl) {
    throw new Error("Relay did not return a valid session URL.");
  }

  return relayUrl;
}

export async function getRelaySession(relayUrl: string) {
  let response: Response;
  try {
    response = await fetchWithTimeout(relayUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
  } catch {
    throw new Error("Relay network request failed. Check phone internet access.");
  }

  if (!response.ok) {
    throw new Error("Could not read relay session.");
  }

  return response.json();
}

export async function updateRelaySession(relayUrl: string, payload: unknown) {
  let response: Response;
  try {
    response = await fetchWithTimeout(relayUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error("Relay update failed. Check phone internet access.");
  }

  if (!response.ok) {
    throw new Error("Could not update relay session.");
  }
}
