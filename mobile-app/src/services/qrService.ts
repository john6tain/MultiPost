import { PairingQrPayload } from "../types/pairing";

export function parsePairingQr(rawValue: string): PairingQrPayload {
  let data: unknown;

  try {
    data = JSON.parse(rawValue);
  } catch {
    throw new Error("Invalid QR code format.");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid QR code payload.");
  }

  const payload = data as Partial<PairingQrPayload>;

  if (payload.type !== "pair") {
    throw new Error("Unsupported QR code type.");
  }

  if (typeof payload.token !== "string" || !payload.token) {
    throw new Error("QR code is missing a pairing token.");
  }

  if (typeof payload.expiresIn !== "number" || payload.expiresIn <= 0) {
    throw new Error("QR code expiration data is invalid.");
  }

  if (typeof payload.expiresAt === "number" && Date.now() >= payload.expiresAt) {
    throw new Error("This QR code has expired.");
  }

  return {
    type: "pair",
    token: payload.token,
    expiresIn: payload.expiresIn,
    expiresAt: payload.expiresAt
  };
}
