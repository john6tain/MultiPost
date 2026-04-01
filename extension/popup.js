import {
  findMarketplaceByUrl,
  getAutofillMarketplaceNames
} from "./src/marketplaces.js";
import {
  clearLatestListing,
  clearPairedSession,
  getLatestListing,
  getPairedSession,
  setLatestListing,
  setPairedSession
} from "./src/storage.js";
import {
  applyPairingAnswer,
  disconnectPeer
} from "./src/peerSession.js";
import { createRelaySession, getRelaySession, updateRelaySession } from "./src/relay.js";

const elements = {
  statusText: document.getElementById("statusText"),
  countdownText: document.getElementById("countdownText"),
  errorText: document.getElementById("errorText"),
  qrWrapper: document.getElementById("qrWrapper"),
  qrCode: document.getElementById("qrCode"),
  qrChunkInfo: document.getElementById("qrChunkInfo"),
  answerSection: document.getElementById("answerSection"),
  answerInput: document.getElementById("answerInput"),
  scanAnswerButton: document.getElementById("scanAnswerButton"),
  connectButton: document.getElementById("connectButton"),
  answerScanner: document.getElementById("answerScanner"),
  answerVideo: document.getElementById("answerVideo"),
  stopScanButton: document.getElementById("stopScanButton"),
  listingSection: document.getElementById("listingSection"),
  relayStatusText: document.getElementById("relayStatusText"),
  listingEmptyText: document.getElementById("listingEmptyText"),
  listingContent: document.getElementById("listingContent"),
  listingTitle: document.getElementById("listingTitle"),
  listingPrice: document.getElementById("listingPrice"),
  listingCategory: document.getElementById("listingCategory"),
  listingLocation: document.getElementById("listingLocation"),
  listingDescription: document.getElementById("listingDescription"),
  listingImages: document.getElementById("listingImages"),
  fillListingButton: document.getElementById("fillListingButton"),
  fillImagesButton: document.getElementById("fillImagesButton"),
  refreshListingButton: document.getElementById("refreshListingButton"),
  generateButton: document.getElementById("generateButton"),
  disconnectButton: document.getElementById("disconnectButton")
};

const state = {
  latestListing: null,
  pairedSession: null,
  pendingSessionId: null,
  relayUrl: null,
  lastRelayListingUpdatedAt: null,
  expiresAt: null,
  countdownIntervalId: null,
  scanStream: null,
  scanIntervalId: null,
  relayPollingIntervalId: null,
  relayListingIntervalId: null,
  relayListingSyncInProgress: false,
  detector: null,
  isConnecting: false
};

const TAB_MESSAGE_TIMEOUT_MS = 20000;
const PAIRING_TTL_SECONDS = 180;
const RELAY_POLL_INTERVAL_MS = 1500;
const CONTENT_SCRIPT_FILES = [
  "content/common.js",
  "content/marketplaces/olx.js",
  "content/marketplaces/mobileBg.js",
  "content/marketplaces/bazarBg.js",
  "content/marketplaces/facebookMarketplace.js",
  "content.js"
];

function setHidden(element, hidden) {
  element.classList.toggle("hidden", hidden);
}

function setError(message = "", type = "error") {
  elements.errorText.textContent = message;
  elements.errorText.classList.toggle("success", type === "success");
  setHidden(elements.errorText, !message);
}

function setSuccess(message = "") {
  setError(message, "success");
}

function setRelayStatus(message = "") {
  if (!elements.relayStatusText) {
    return;
  }

  elements.relayStatusText.textContent = message;
  setHidden(elements.relayStatusText, !message);
}

function clearRelayPolling() {
  if (state.relayPollingIntervalId) {
    clearInterval(state.relayPollingIntervalId);
    state.relayPollingIntervalId = null;
  }

  if (elements.qrChunkInfo) {
    elements.qrChunkInfo.textContent = "";
    setHidden(elements.qrChunkInfo, true);
  }
}

function clearRelayListingPolling() {
  if (state.relayListingIntervalId) {
    clearInterval(state.relayListingIntervalId);
    state.relayListingIntervalId = null;
  }
  state.relayListingSyncInProgress = false;
}

function stopAnswerScan() {
  if (state.scanIntervalId) {
    clearInterval(state.scanIntervalId);
    state.scanIntervalId = null;
  }

  if (state.scanStream) {
    state.scanStream.getTracks().forEach((track) => track.stop());
    state.scanStream = null;
  }

  if (elements.answerVideo) {
    elements.answerVideo.srcObject = null;
  }

  state.detector = null;
  setHidden(elements.answerScanner, true);
}

function clearCountdown() {
  if (state.countdownIntervalId) {
    clearInterval(state.countdownIntervalId);
    state.countdownIntervalId = null;
  }
}

function formatRemainingTime(expiresAt) {
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateCountdown() {
  if (!state.expiresAt) {
    setHidden(elements.countdownText, true);
    return;
  }

  if (Date.now() >= state.expiresAt) {
    clearRelayPolling();
    clearCountdown();
    state.expiresAt = null;
    state.pendingSessionId = null;
    state.relayUrl = null;
    setHidden(elements.qrWrapper, true);
    setHidden(elements.answerSection, true);
    elements.statusText.textContent = "Pairing expired. Generate a new QR.";
    elements.generateButton.disabled = false;
    return;
  }

  elements.countdownText.textContent = `Expires in ${formatRemainingTime(state.expiresAt)}`;
  setHidden(elements.countdownText, false);
}

function getFillButtonLabel(rawUrl) {
  const marketplace = findMarketplaceByUrl(rawUrl);
  return marketplace?.supportsAutofill ? `Fill ${marketplace.label}` : "Fill Form";
}

function getMarketplaceTargetIds(marketplace) {
  if (!marketplace) {
    return [];
  }

  const targetIds = Array.isArray(marketplace.postingTargetIds)
    ? marketplace.postingTargetIds
    : [marketplace.id];

  return targetIds.filter((value) => typeof value === "string" && value);
}

function canFillMarketplace(listing, marketplace) {
  if (!marketplace?.supportsAutofill) {
    return false;
  }

  if (!Array.isArray(listing?.postingTargets) || !listing.postingTargets.length) {
    return true;
  }

  const targetIds = getMarketplaceTargetIds(marketplace);
  return targetIds.some((targetId) => listing.postingTargets.includes(targetId));
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tab ?? null;
}

async function sendTabMessageWithTimeout(tabId, payload, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, TAB_MESSAGE_TIMEOUT_MS);

    chrome.tabs.sendMessage(tabId, payload)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function isMissingReceiverError(error) {
  const message = String(error?.message || error || "");
  return message.includes("Receiving end does not exist");
}

async function injectContentScripts(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: CONTENT_SCRIPT_FILES
  });
}

async function sendTabMessageWithInjectionRetry(tabId, payload, timeoutMessage) {
  try {
    return await sendTabMessageWithTimeout(tabId, payload, timeoutMessage);
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      throw error;
    }

    await injectContentScripts(tabId);
    return sendTabMessageWithTimeout(tabId, payload, timeoutMessage);
  }
}

async function syncFillButtonState() {
  const tab = await getActiveTab();
  const marketplace = findMarketplaceByUrl(tab?.url);
  const canAutofill = Boolean(state.latestListing && canFillMarketplace(state.latestListing, marketplace));
  const canUploadImages = Boolean(
    state.latestListing
    && marketplace?.id === "mobile-bg"
    && canFillMarketplace(state.latestListing, marketplace)
    && Array.isArray(state.latestListing.images)
    && state.latestListing.images.length
  );

  elements.fillListingButton.textContent = getFillButtonLabel(tab?.url);
  elements.fillListingButton.disabled = !canAutofill;
  elements.fillListingButton.title = canAutofill
    ? ""
    : `Open ${getAutofillMarketplaceNames().join(" or ")} before Fill Form.`;

  setHidden(elements.fillImagesButton, !state.latestListing || marketplace?.id !== "mobile-bg");
  elements.fillImagesButton.disabled = !canUploadImages;
  elements.fillImagesButton.title = canUploadImages
    ? ""
    : "Open targeted mobile.bg listing photos step before Upload Images.";
}

function renderListing(listing) {
  state.latestListing = listing;
  setHidden(elements.listingSection, false);
  setHidden(elements.refreshListingButton, false);
  setHidden(elements.fillListingButton, false);

  if (!listing) {
    setHidden(elements.listingEmptyText, false);
    setHidden(elements.listingContent, true);
    syncFillButtonState();
    if (!state.relayUrl) {
      setRelayStatus("");
    }
    return;
  }

  elements.listingTitle.textContent = listing.title || "Untitled listing";
  elements.listingPrice.textContent = listing.price ? `Price: ${listing.price}` : "Price: not set";
  elements.listingCategory.textContent = listing.category ? `Category: ${listing.category}` : "Category: not set";
  elements.listingLocation.textContent = listing.location ? `Location: ${listing.location}` : "Location: not set";
  elements.listingDescription.textContent = listing.description || "No description";
  elements.listingImages.textContent = `Images: ${Array.isArray(listing.images) ? listing.images.length : 0}`;

  setHidden(elements.listingEmptyText, true);
  setHidden(elements.listingContent, false);
  syncFillButtonState();
  if (!state.relayUrl) {
    setRelayStatus("");
  }
}

function renderIdle() {
  clearRelayPolling();
  clearRelayListingPolling();
  stopAnswerScan();
  clearCountdown();
  state.pendingSessionId = null;
  state.relayUrl = null;
  state.lastRelayListingUpdatedAt = null;
  state.expiresAt = null;
  elements.statusText.textContent = "Not connected.";
  elements.generateButton.disabled = false;
  setHidden(elements.generateButton, false);
  setHidden(elements.disconnectButton, true);
  setHidden(elements.qrWrapper, true);
  setHidden(elements.answerSection, true);
  setHidden(elements.countdownText, true);
  setRelayStatus("");
}

function renderWaiting() {
  elements.statusText.textContent = "Waiting for mobile app scan...";
  elements.generateButton.disabled = true;
  setHidden(elements.generateButton, false);
  setHidden(elements.disconnectButton, true);
  setHidden(elements.qrWrapper, false);
  setHidden(elements.answerSection, true);
  setHidden(elements.answerScanner, true);
  setRelayStatus("");
  updateCountdown();
}

function renderPaired(session) {
  clearRelayPolling();
  stopAnswerScan();
  clearCountdown();
  state.pairedSession = session;
  elements.statusText.textContent = `Connected to ${session.deviceName}`;
  elements.generateButton.disabled = false;
  setHidden(elements.generateButton, true);
  setHidden(elements.disconnectButton, false);
  setHidden(elements.qrWrapper, true);
  setHidden(elements.answerSection, true);
  setHidden(elements.countdownText, true);
  setRelayStatus(session.relayUrl ? "Connected. Waiting for listing sync..." : "");

  if (session.relayUrl) {
    state.relayUrl = session.relayUrl;
    startRelayListingPolling();
  }
}

async function drawQrCode(payload) {
  elements.qrCode.replaceChildren();
  try {
    if (typeof QRCode !== "function") {
      throw new Error("QR library is not available.");
    }

    new QRCode(elements.qrCode, {
      text: JSON.stringify(payload),
      width: 220,
      height: 220
    });
    setHidden(elements.qrChunkInfo, true);
  } catch {
    throw new Error("Could not render pairing QR payload. Click Generate QR and retry.");
  }
}

function startRelayAnswerPolling() {
  clearRelayPolling();

  if (!state.relayUrl || !state.pendingSessionId) {
    return;
  }

  state.relayPollingIntervalId = setInterval(async () => {
    try {
      const relayPayload = await getRelaySession(state.relayUrl);
      if (relayPayload?.disconnected === true) {
        await performLocalDisconnect("Disconnected from mobile app.");
        return;
      }

      const answer = relayPayload?.answer;
      if (!answer || answer.type !== "answer" || typeof answer.sdp !== "string" || !answer.sdp) {
        if (relayPayload?.paired === true) {
          const pairedSession = {
            pairingToken: state.pendingSessionId,
            userId: "local-relay",
            deviceName: relayPayload?.deviceName || "Phone",
            pairedAt: new Date().toISOString(),
            relayUrl: state.relayUrl
          };

          clearRelayPolling();
          await setPairedSession(pairedSession);
          renderPaired(pairedSession);
          setSuccess("Connected (relay mode).");
        }
        return;
      }

      elements.answerInput.value = JSON.stringify({
        type: "pair-answer",
        sessionId: state.pendingSessionId,
        deviceName: relayPayload?.deviceName || "Phone",
        answer
      });

      clearRelayPolling();
      await handleConnectClick();
    } catch {
      // Keep polling.
    }
  }, RELAY_POLL_INTERVAL_MS);
}

function startRelayListingPolling() {
  clearRelayListingPolling();

  if (!state.relayUrl) {
    return;
  }

  state.relayListingIntervalId = setInterval(async () => {
    if (state.relayListingSyncInProgress) {
      return;
    }

    state.relayListingSyncInProgress = true;

    try {
      setRelayStatus("Checking relay for latest listing...");
      const relayPayload = await getRelaySession(state.relayUrl);
      if (relayPayload?.disconnected === true) {
        await performLocalDisconnect("Disconnected from mobile app.");
        return;
      }

      if (!relayPayload?.listing) {
        state.relayListingSyncInProgress = false;
        return;
      }

      const updatedAt = typeof relayPayload.listingUpdatedAt === "number" ? relayPayload.listingUpdatedAt : null;
      if (updatedAt && state.lastRelayListingUpdatedAt === updatedAt) {
        state.relayListingSyncInProgress = false;
        return;
      }

      let listing = relayPayload.listing;

      if (Array.isArray(listing?.imageRelayChunkRefs) && listing.imageRelayChunkRefs.length) {
        const resolvedImages = [];
        const totalImages = listing.imageRelayChunkRefs.length;
        setRelayStatus(`Resolving relay images 0/${totalImages}...`);

        for (let imageIndex = 0; imageIndex < listing.imageRelayChunkRefs.length; imageIndex += 1) {
          const imageChunkRefs = listing.imageRelayChunkRefs[imageIndex];
          if (!Array.isArray(imageChunkRefs) || !imageChunkRefs.length) {
            continue;
          }

          const chunkPayloads = [];
          const totalChunks = imageChunkRefs.length;
          setRelayStatus(`Resolving image ${imageIndex + 1}/${totalImages} chunks 0/${totalChunks}...`);

          for (let chunkIndex = 0; chunkIndex < imageChunkRefs.length; chunkIndex += 1) {
            const chunkRelayUrl = imageChunkRefs[chunkIndex];
            try {
              const chunkPayload = await getRelaySession(chunkRelayUrl);
              if (typeof chunkPayload?.chunk === "string") {
                chunkPayloads.push({
                  chunkIndex: typeof chunkPayload.chunkIndex === "number" ? chunkPayload.chunkIndex : 0,
                  chunk: chunkPayload.chunk
                });
              }
            } catch {
              // Continue with remaining chunks.
            }

            setRelayStatus(`Resolving image ${imageIndex + 1}/${totalImages} chunks ${chunkIndex + 1}/${totalChunks}...`);
          }

          if (!chunkPayloads.length) {
            continue;
          }

          chunkPayloads.sort((a, b) => a.chunkIndex - b.chunkIndex);
          const dataUrl = chunkPayloads.map((item) => item.chunk).join("");
          if (dataUrl.startsWith("data:")) {
            resolvedImages.push(dataUrl);
          }

          setRelayStatus(`Resolving relay images ${imageIndex + 1}/${totalImages}...`);
        }

        listing = {
          ...listing,
          images: resolvedImages
        };
      } else if (Array.isArray(listing?.imageRelayRefs) && listing.imageRelayRefs.length) {
        const resolvedImages = [];
        const totalImages = listing.imageRelayRefs.length;
        setRelayStatus(`Resolving relay images 0/${totalImages}...`);

        for (let imageIndex = 0; imageIndex < listing.imageRelayRefs.length; imageIndex += 1) {
          const imageRelayUrl = listing.imageRelayRefs[imageIndex];
          try {
            const imagePayload = await getRelaySession(imageRelayUrl);
            if (typeof imagePayload?.dataUrl === "string" && imagePayload.dataUrl.startsWith("data:")) {
              resolvedImages.push(imagePayload.dataUrl);
            }
          } catch {
            // Continue with remaining relay images.
          }

          setRelayStatus(`Resolving relay images ${imageIndex + 1}/${totalImages}...`);
        }

        listing = {
          ...listing,
          images: resolvedImages
        };
      }

      if (updatedAt) {
        state.lastRelayListingUpdatedAt = updatedAt;
      }

      await setLatestListing(listing);
      renderListing(listing);
      setRelayStatus(`Listing synced${Array.isArray(listing.images) && listing.images.length ? ` (${listing.images.length} images)` : ""}.`);
    } catch {
      setRelayStatus("Relay sync retrying...");
      // Keep polling.
    } finally {
      state.relayListingSyncInProgress = false;
    }
  }, RELAY_POLL_INTERVAL_MS);
}

async function handleGenerateClick() {
  clearRelayPolling();
  stopAnswerScan();
  clearCountdown();
  setError();
  elements.generateButton.disabled = true;

  try {
    const now = Date.now();
    const expiresAt = now + PAIRING_TTL_SECONDS * 1000;
    const sessionId = crypto.randomUUID();

    state.pendingSessionId = sessionId;
    state.expiresAt = expiresAt;
    state.relayUrl = await createRelaySession({
      sessionId,
      createdAt: now,
      expiresAt
    });
    elements.answerInput.value = "";

    await drawQrCode({
      type: "pair-relay",
      sessionId,
      relayUrl: state.relayUrl,
      expiresAt
    });

    renderWaiting();
    state.countdownIntervalId = setInterval(updateCountdown, 1000);
    startRelayAnswerPolling();
  } catch (error) {
    renderIdle();
    setError(error?.message || "Could not create pairing offer.");
  }
}

async function handleConnectClick() {
  if (state.isConnecting) {
    return;
  }

  const rawAnswer = elements.answerInput.value.trim();
  if (!rawAnswer) {
    setError("Paste the answer payload from mobile first.");
    return;
  }

  state.isConnecting = true;
  elements.connectButton.disabled = true;

  try {
    const result = await applyPairingAnswer(rawAnswer);
    const pairedSession = {
      pairingToken: result.sessionId,
      userId: "local-peer",
      deviceName: result.deviceName,
      pairedAt: new Date().toISOString(),
      relayUrl: state.relayUrl
    };

    await setPairedSession(pairedSession);
    renderPaired(pairedSession);
    setSuccess("Connected. Keep this popup open while sending listings.");
  } catch (error) {
    setError(error?.message || "Could not apply mobile answer.");
  } finally {
    state.isConnecting = false;
    elements.connectButton.disabled = false;
  }
}

async function handleScanAnswerClick() {
  if (state.scanStream) {
    return;
  }

  if (typeof BarcodeDetector !== "function") {
    setError("QR scanning is not available in this Chrome version. Use paste fallback.");
    return;
  }

  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      audio: false
    });

    state.detector = detector;
    state.scanStream = stream;
    elements.answerVideo.srcObject = stream;
    await elements.answerVideo.play();
    setHidden(elements.answerScanner, false);
    setError();

    if (state.scanIntervalId) {
      clearInterval(state.scanIntervalId);
    }

    state.scanIntervalId = setInterval(async () => {
      if (!state.detector || !elements.answerVideo || elements.answerVideo.readyState < 2) {
        return;
      }

      try {
        const barcodes = await state.detector.detect(elements.answerVideo);
        const qrValue = barcodes.find((item) => typeof item.rawValue === "string" && item.rawValue)?.rawValue;

        if (!qrValue) {
          return;
        }

        elements.answerInput.value = qrValue;
        stopAnswerScan();
        await handleConnectClick();
      } catch {
        // Keep scanning.
      }
    }, 250);
  } catch (error) {
    stopAnswerScan();
    setError(error?.message || "Could not start camera scanning.");
  }
}

async function handleDisconnectClick() {
  const relayUrl = state.relayUrl;
  const sessionId = state.pairedSession?.pairingToken || state.pendingSessionId;

  if (relayUrl && sessionId) {
    try {
      await updateRelaySession(relayUrl, {
        sessionId,
        disconnected: true,
        disconnectedBy: "extension",
        disconnectedAt: Date.now()
      });
    } catch {
      // Best-effort sync only.
    }
  }

  await performLocalDisconnect();
}

async function performLocalDisconnect(message = "") {
  clearRelayPolling();
  clearRelayListingPolling();
  stopAnswerScan();
  disconnectPeer();
  state.pairedSession = null;
  state.latestListing = null;
  state.relayUrl = null;
  state.lastRelayListingUpdatedAt = null;
  await clearPairedSession();
  await clearLatestListing();
  renderListing(null);
  renderIdle();
  if (message) {
    setError(message);
    return;
  }

  setError();
}

async function handleRefreshListingClick() {
  const listing = await getLatestListing();
  renderListing(listing);
}

async function handleFillListingClick() {
  if (!state.latestListing) {
    setError("No listing available to fill.");
    return;
  }

  const tab = await getActiveTab();
  const marketplace = findMarketplaceByUrl(tab?.url);

  if (!tab?.id) {
    setError("Could not find the active tab.");
    return;
  }

  if (!marketplace?.supportsAutofill) {
    setError(`Open ${getAutofillMarketplaceNames().join(" or ")} before using Fill Form.`);
    await syncFillButtonState();
    return;
  }

  if (!canFillMarketplace(state.latestListing, marketplace)) {
    setError(`This listing is not targeted for ${marketplace.label}.`);
    await syncFillButtonState();
    return;
  }

  try {
    const response = await sendTabMessageWithInjectionRetry(tab.id, {
      type: "fillListing",
      listing: state.latestListing
    }, "Filling timed out. Refresh and retry.");

    if (!response?.ok) {
      setError(response?.message || `Could not fill the ${marketplace.label} page.`);
      return;
    }

    setSuccess(response?.message || `Filled ${marketplace.label} successfully.`);
  } catch (error) {
    setError(error?.message || `Open a ${marketplace.label} listing form page first.`);
  }
}

async function handleFillImagesClick() {
  if (!state.latestListing) {
    setError("No listing available to fill.");
    return;
  }

  const tab = await getActiveTab();
  const marketplace = findMarketplaceByUrl(tab?.url);

  if (!tab?.id) {
    setError("Could not find the active tab.");
    return;
  }

  if (marketplace?.id !== "mobile-bg") {
    setError("Upload Images is available only on mobile.bg.");
    await syncFillButtonState();
    return;
  }

  if (!canFillMarketplace(state.latestListing, marketplace)) {
    setError("This listing is not targeted for mobile.bg.");
    await syncFillButtonState();
    return;
  }

  if (!Array.isArray(state.latestListing.images) || !state.latestListing.images.length) {
    setError("No images are pending for upload.");
    await syncFillButtonState();
    return;
  }

  const originalLabel = elements.fillImagesButton.textContent;
  elements.fillImagesButton.disabled = true;
  elements.fillImagesButton.textContent = "Uploading...";

  try {
    const response = await sendTabMessageWithInjectionRetry(tab.id, {
      type: "fillListingImages",
      listing: state.latestListing
    }, "Image upload timed out.");

    if (!response?.ok) {
      setError(response?.message || "Could not upload images on mobile.bg.");
      return;
    }

    setSuccess(response?.message || "Uploaded images successfully.");
  } catch (error) {
    setError(error?.message || "Open mobile.bg photos step before Upload Images.");
  } finally {
    elements.fillImagesButton.textContent = originalLabel;
    await syncFillButtonState();
  }
}

async function initializePopup() {
  try {
    const [pairedSession, latestListing] = await Promise.all([
      getPairedSession(),
      getLatestListing()
    ]);

    renderListing(latestListing);

    if (pairedSession) {
      state.pairedSession = pairedSession;
      state.relayUrl = pairedSession.relayUrl || null;
      renderPaired(pairedSession);
    } else {
      renderIdle();
    }

    await syncFillButtonState();
  } catch (error) {
    renderIdle();
    setError(error?.message || "Could not restore popup state.");
  }
}

elements.generateButton.addEventListener("click", handleGenerateClick);
elements.scanAnswerButton.addEventListener("click", handleScanAnswerClick);
elements.connectButton.addEventListener("click", handleConnectClick);
elements.stopScanButton.addEventListener("click", stopAnswerScan);
elements.disconnectButton.addEventListener("click", handleDisconnectClick);
elements.fillListingButton.addEventListener("click", handleFillListingClick);
elements.fillImagesButton.addEventListener("click", handleFillImagesClick);
elements.refreshListingButton.addEventListener("click", handleRefreshListingClick);

initializePopup();
