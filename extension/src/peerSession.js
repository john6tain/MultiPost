const ICE_WAIT_TIMEOUT_MS = 10000;

const state = {
  peerConnection: null,
  dataChannel: null,
  sessionId: null,
  pendingTransfer: null
};

function waitForIceGatheringComplete(peerConnection, timeoutMs = ICE_WAIT_TIMEOUT_MS) {
  if (peerConnection.iceGatheringState === "complete") {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    function handleStateChange() {
      if (peerConnection.iceGatheringState === "complete") {
        cleanup();
        resolve(true);
      }
    }

    function cleanup() {
      clearTimeout(timeoutId);
      peerConnection.removeEventListener("icegatheringstatechange", handleStateChange);
    }

    peerConnection.addEventListener("icegatheringstatechange", handleStateChange);
  });
}

function resetPendingTransfer() {
  state.pendingTransfer = null;
}

function closePeerSession() {
  if (state.dataChannel) {
    state.dataChannel.close();
  }

  if (state.peerConnection) {
    state.peerConnection.close();
  }

  state.peerConnection = null;
  state.dataChannel = null;
  state.sessionId = null;
  resetPendingTransfer();
}

function parseAnswerPayload(rawValue) {
  let payload;

  try {
    payload = JSON.parse(rawValue);
  } catch {
    throw new Error("Answer payload is not valid JSON.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Answer payload is invalid.");
  }

  if (payload.type !== "pair-answer") {
    throw new Error("Unsupported answer payload type.");
  }

  if (typeof payload.sessionId !== "string" || !payload.sessionId) {
    throw new Error("Answer payload is missing session id.");
  }

  if (!payload.answer || payload.answer.type !== "answer" || typeof payload.answer.sdp !== "string" || !payload.answer.sdp) {
    throw new Error("Answer payload is missing answer SDP.");
  }

  return payload;
}

function handleChunkedMessage(message, onListing) {
  if (message.type === "listing") {
    onListing(message.listing);
    return;
  }

  if (message.type === "listing-start") {
    if (typeof message.transferId !== "string" || typeof message.totalChunks !== "number" || message.totalChunks <= 0) {
      throw new Error("Invalid listing transfer start.");
    }

    state.pendingTransfer = {
      transferId: message.transferId,
      totalChunks: message.totalChunks,
      chunks: new Array(message.totalChunks)
    };
    return;
  }

  if (message.type === "listing-chunk") {
    if (!state.pendingTransfer || state.pendingTransfer.transferId !== message.transferId) {
      throw new Error("Received chunk for unknown transfer.");
    }

    if (typeof message.index !== "number" || message.index < 0 || message.index >= state.pendingTransfer.totalChunks) {
      throw new Error("Invalid listing chunk index.");
    }

    if (typeof message.data !== "string") {
      throw new Error("Invalid listing chunk data.");
    }

    state.pendingTransfer.chunks[message.index] = message.data;
    return;
  }

  if (message.type === "listing-end") {
    if (!state.pendingTransfer || state.pendingTransfer.transferId !== message.transferId) {
      throw new Error("Received end for unknown transfer.");
    }

    const serialized = state.pendingTransfer.chunks.join("");
    resetPendingTransfer();

    if (!serialized) {
      throw new Error("Listing transfer payload is empty.");
    }

    const listing = JSON.parse(serialized);
    onListing(listing);
  }
}

function registerDataChannelHandlers(channel, callbacks) {
  channel.addEventListener("open", () => {
    callbacks.onOpen();
  });

  channel.addEventListener("close", () => {
    callbacks.onClose();
  });

  channel.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      handleChunkedMessage(message, callbacks.onListing);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error.message : "Could not parse incoming listing payload.");
    }
  });
}

export async function createPairingOffer(callbacks) {
  closePeerSession();

  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  const dataChannel = peerConnection.createDataChannel("multipost");
  registerDataChannelHandlers(dataChannel, callbacks);

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  const iceCompleted = await waitForIceGatheringComplete(peerConnection);

  if (!peerConnection.localDescription?.sdp) {
    throw new Error("Could not create WebRTC offer.");
  }

  const sessionId = crypto.randomUUID();
  state.peerConnection = peerConnection;
  state.dataChannel = dataChannel;
  state.sessionId = sessionId;

  return {
    sessionId,
    iceCompleted,
    offer: {
      type: "offer",
      sdp: peerConnection.localDescription.sdp
    }
  };
}

export async function applyPairingAnswer(rawValue) {
  if (!state.peerConnection || !state.sessionId) {
    throw new Error("No pending pairing offer.");
  }

  const payload = parseAnswerPayload(rawValue);

  if (payload.sessionId !== state.sessionId) {
    throw new Error("Answer session does not match current offer.");
  }

  await state.peerConnection.setRemoteDescription(payload.answer);

  return {
    deviceName: typeof payload.deviceName === "string" && payload.deviceName ? payload.deviceName : "Phone",
    sessionId: payload.sessionId
  };
}

export function disconnectPeer() {
  closePeerSession();
}
