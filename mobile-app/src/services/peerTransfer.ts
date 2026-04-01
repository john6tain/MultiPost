import { ListingImage, ListingPayload } from "../types/listing";
import { PairingAnswerPayload, PairingQrPayload, PairingSession } from "../types/pairing";
import * as FileSystem from "expo-file-system/legacy";

type RuntimePeerState = {
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  sessionId: string | null;
};

type HandshakeResult = {
  session: PairingSession;
  answerPayload: string;
};

const IMAGE_MIME_FALLBACK = "image/jpeg";
const CHUNK_SIZE = 12000;
const ICE_WAIT_TIMEOUT_MS = 10000;
const CONNECT_TIMEOUT_MS = 15000;

const state: RuntimePeerState = {
  peerConnection: null,
  dataChannel: null,
  sessionId: null
};

export function isWebRtcAvailable() {
  return typeof globalThis.RTCPeerConnection === "function";
}

function ensureWebRtcAvailability() {
  if (!isWebRtcAvailable()) {
    throw new Error("WebRTC is not available in this app runtime. Use a build with WebRTC support.");
  }
}

async function waitForIceGatheringComplete(peerConnection: RTCPeerConnection, timeoutMs: number) {
  if (peerConnection.iceGatheringState === "complete") {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    function handleChange() {
      if (peerConnection.iceGatheringState === "complete") {
        cleanup();
        resolve(true);
      }
    }

    function cleanup() {
      clearTimeout(timeoutId);
      peerConnection.removeEventListener("icegatheringstatechange", handleChange);
    }

    peerConnection.addEventListener("icegatheringstatechange", handleChange);
  });
}

function closeCurrentPeer() {
  if (state.dataChannel) {
    state.dataChannel.close();
  }

  if (state.peerConnection) {
    state.peerConnection.close();
  }

  state.dataChannel = null;
  state.peerConnection = null;
  state.sessionId = null;
}

function waitForOpenChannel(timeoutMs: number) {
  if (state.dataChannel?.readyState === "open") {
    return Promise.resolve();
  }

  const channel = state.dataChannel;
  if (!channel) {
    return Promise.reject(new Error("No peer channel is available. Pair with the extension first."));
  }

  const activeChannel = channel;

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Peer connection did not open in time."));
    }, timeoutMs);

    function handleOpen() {
      cleanup();
      resolve();
    }

    function handleClose() {
      cleanup();
      reject(new Error("Peer channel closed before it could connect."));
    }

    function cleanup() {
      clearTimeout(timeoutId);
      activeChannel.removeEventListener("open", handleOpen);
      activeChannel.removeEventListener("close", handleClose);
    }

    activeChannel.addEventListener("open", handleOpen);
    activeChannel.addEventListener("close", handleClose);
  });
}

function guessMimeType(image: ListingImage) {
  if (image.mimeType && image.mimeType.includes("/")) {
    return image.mimeType;
  }

  const lowerUri = (image.uri || "").toLowerCase();
  if (lowerUri.endsWith(".png")) {
    return "image/png";
  }

  if (lowerUri.endsWith(".webp")) {
    return "image/webp";
  }

  return IMAGE_MIME_FALLBACK;
}

async function imageToDataUrl(image: ListingImage, index: number) {
  try {
    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    if (!base64) {
      throw new Error(`Could not encode image ${index + 1}.`);
    }

    return `data:${guessMimeType(image)};base64,${base64}`;
  } catch {
    throw new Error(`Could not read image ${index + 1} from device storage.`);
  }
}

export async function buildListingWithEmbeddedImages(listing: ListingPayload, sourceImages: ListingImage[]) {
  const images = await Promise.all(sourceImages.map((image, index) => imageToDataUrl(image, index)));

  return {
    ...listing,
    images
  };
}

function sendChunkedListing(listing: ListingPayload) {
  const channel = state.dataChannel;
  if (!channel || channel.readyState !== "open") {
    throw new Error("Peer channel is not connected.");
  }

  const serialized = JSON.stringify(listing);

  if (serialized.length <= CHUNK_SIZE) {
    channel.send(JSON.stringify({
      type: "listing",
      listing
    }));
    return;
  }

  const transferId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const totalChunks = Math.ceil(serialized.length / CHUNK_SIZE);

  channel.send(JSON.stringify({
    type: "listing-start",
    transferId,
    totalChunks
  }));

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    channel.send(JSON.stringify({
      type: "listing-chunk",
      transferId,
      index,
      data: serialized.slice(start, end)
    }));
  }

  channel.send(JSON.stringify({
    type: "listing-end",
    transferId
  }));
}

export async function createPairingAnswer(payload: PairingQrPayload, deviceName: string): Promise<HandshakeResult> {
  ensureWebRtcAvailability();
  closeCurrentPeer();

  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  let channel: RTCDataChannel | null = null;

  peerConnection.ondatachannel = (event) => {
    channel = event.channel;
    state.dataChannel = channel;
  };

  await peerConnection.setRemoteDescription(payload.offer as RTCSessionDescriptionInit);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  const iceCompleted = await waitForIceGatheringComplete(peerConnection, ICE_WAIT_TIMEOUT_MS);

  if (!peerConnection.localDescription?.sdp) {
    peerConnection.close();
    throw new Error("Could not create WebRTC answer.");
  }

  state.peerConnection = peerConnection;
  state.dataChannel = channel;
  state.sessionId = payload.sessionId;

  const session: PairingSession = {
    pairingToken: payload.sessionId,
    userId: "local-peer",
    deviceName,
    pairedAt: new Date().toISOString()
  };

  const answerPayload: PairingAnswerPayload = {
    type: "pair-answer",
    sessionId: payload.sessionId,
    deviceName,
    answer: {
      type: "answer",
      sdp: peerConnection.localDescription.sdp
    },
    expiresAt: payload.expiresAt
  };

  if (!iceCompleted) {
    // Keep pairing flowing with available candidates; user can retry if channel does not open.
    console.warn("ICE gathering timed out; using partial candidates.");
  }

  return {
    session,
    answerPayload: JSON.stringify(answerPayload)
  };
}

export async function finalizePairingConnection() {
  await waitForOpenChannel(CONNECT_TIMEOUT_MS);
}

export async function sendListingToExtension(
  listing: ListingPayload,
  sourceImages: ListingImage[]
) {
  await waitForOpenChannel(CONNECT_TIMEOUT_MS);
  const listingPayload = await buildListingWithEmbeddedImages(listing, sourceImages);
  sendChunkedListing(listingPayload);
}

export function disconnectPeer() {
  closeCurrentPeer();
}
