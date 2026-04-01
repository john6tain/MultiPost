import { PairingQrChunkPayload, PairingQrPayload, PairingRelayQrPayload } from "../types/pairing";

const RELAY_BASE_URL = "https://jsonblob.com/api/jsonBlob";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(paddingLength);
  return decodeURIComponent(escape(atob(padded)));
}

export function parsePairingQr(rawValue: string): PairingQrPayload | PairingQrChunkPayload | PairingRelayQrPayload {
  function normalizeRelayUrl(value: string) {
    try {
      return new URL(value, RELAY_BASE_URL).toString();
    } catch {
      return "";
    }
  }

  if (rawValue.startsWith("MPC|")) {
    const parts = rawValue.split("|", 5);
    if (parts.length < 5) {
      throw new Error("Chunk QR payload format is invalid.");
    }

    const [, sessionId, rawIndex, rawTotal, chunk] = parts;
    const chunkIndex = Number(rawIndex) - 1;
    const totalChunks = Number(rawTotal);

    if (!sessionId) {
      throw new Error("Chunk QR is missing session id.");
    }

    if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
      throw new Error("Chunk QR index is invalid.");
    }

    if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
      throw new Error("Chunk QR total count is invalid.");
    }

    if (!chunk) {
      throw new Error("Chunk QR payload is empty.");
    }

    return {
      type: "pair-chunk",
      sessionId,
      chunkIndex,
      totalChunks,
      chunk,
      encoding: "base64url"
    };
  }

  if (rawValue.startsWith("MP1|")) {
    const encoded = rawValue.slice(4);
    if (!encoded) {
      throw new Error("Pairing QR payload is empty.");
    }

    rawValue = decodeBase64Url(encoded);
  }

  let data: unknown;

  try {
    data = JSON.parse(rawValue);
  } catch {
    throw new Error("Invalid QR code format.");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid QR code payload.");
  }

  const payload = data as Record<string, unknown>;

  if (payload.type === "pair-relay") {
    if (typeof payload.sessionId !== "string" || !payload.sessionId) {
      throw new Error("QR relay payload is missing session id.");
    }

    if (typeof payload.relayUrl !== "string" || !payload.relayUrl) {
      throw new Error("QR relay payload is missing relay URL.");
    }

    const relayUrl = normalizeRelayUrl(payload.relayUrl);
    if (!relayUrl) {
      throw new Error("QR relay URL is invalid.");
    }

    if (typeof payload.expiresAt === "number" && Date.now() >= payload.expiresAt) {
      throw new Error("This QR code has expired.");
    }

    return {
      type: "pair-relay",
      sessionId: payload.sessionId,
      relayUrl,
      expiresAt: typeof payload.expiresAt === "number" ? payload.expiresAt : undefined
    };
  }

  if (payload.type === "pair-chunk") {
    if (typeof payload.sessionId !== "string" || !payload.sessionId) {
      throw new Error("QR chunk is missing session id.");
    }

    if (typeof payload.chunkIndex !== "number" || payload.chunkIndex < 0) {
      throw new Error("QR chunk index is invalid.");
    }

    if (typeof payload.totalChunks !== "number" || payload.totalChunks <= 0) {
      throw new Error("QR chunk total count is invalid.");
    }

    if (typeof payload.chunk !== "string" || !payload.chunk) {
      throw new Error("QR chunk data is missing.");
    }

    if (typeof payload.expiresAt === "number" && Date.now() >= payload.expiresAt) {
      throw new Error("This QR code has expired.");
    }

    return {
      type: "pair-chunk",
      sessionId: payload.sessionId,
      chunkIndex: payload.chunkIndex,
      totalChunks: payload.totalChunks,
      chunk: payload.chunk,
      expiresAt: typeof payload.expiresAt === "number" ? payload.expiresAt : undefined
    };
  }

  if (payload.type !== "pair") {
    throw new Error("Unsupported QR code type.");
  }

  if (typeof payload.sessionId !== "string" || !payload.sessionId) {
    throw new Error("QR code is missing a pairing session id.");
  }

  if (!payload.offer || typeof payload.offer !== "object") {
    throw new Error("QR code is missing offer data.");
  }

  const offer = payload.offer as Record<string, unknown>;

  if (offer.type !== "offer" || typeof offer.sdp !== "string" || !offer.sdp) {
    throw new Error("QR code contains an invalid offer payload.");
  }

  if (typeof payload.expiresIn !== "number" || payload.expiresIn <= 0) {
    throw new Error("QR code expiration data is invalid.");
  }

  if (typeof payload.expiresAt === "number" && Date.now() >= payload.expiresAt) {
    throw new Error("This QR code has expired.");
  }

  return {
    type: "pair",
    sessionId: payload.sessionId,
    offer: { type: "offer", sdp: offer.sdp },
    expiresIn: payload.expiresIn,
    expiresAt: typeof payload.expiresAt === "number" ? payload.expiresAt : undefined
  };
}
