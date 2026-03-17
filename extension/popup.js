import {
  createPairingSession,
  deleteUploadedImages,
  getActiveListing,
  getPairingStatus
} from "./src/api.js";
import {
  findMarketplaceByUrl,
  getAutofillMarketplaceNames
} from "./src/marketplaces.js";
import { POLLING_INTERVAL_MS } from "./src/config.js";
import {
  clearPairedSession,
  getPairedSession,
  setPairedSession
} from "./src/storage.js";

const elements = {
  statusText: document.getElementById("statusText"),
  countdownText: document.getElementById("countdownText"),
  errorText: document.getElementById("errorText"),
  qrWrapper: document.getElementById("qrWrapper"),
  qrCode: document.getElementById("qrCode"),
  listingSection: document.getElementById("listingSection"),
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
  countdownIntervalId: null,
  pollingIntervalId: null,
  listingIntervalId: null,
  expiresAt: null,
  pairingToken: null,
  latestListing: null
};

function getFillButtonLabel(rawUrl) {
  const marketplace = findMarketplaceByUrl(rawUrl);
  return marketplace?.supportsAutofill ? `Fill ${marketplace.label}` : "Fill Form";
}

function canFillMarketplace(listing, marketplace) {
  if (!marketplace?.supportsAutofill) {
    return false;
  }

  if (!Array.isArray(listing?.postingTargets) || !listing.postingTargets.length) {
    return true;
  }

  return listing.postingTargets.includes(marketplace.id);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tab ?? null;
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
    : `Open ${getAutofillMarketplaceNames().join(" or ")} to autofill this listing.`;
  setHidden(elements.fillImagesButton, !state.latestListing || marketplace?.id !== "mobile-bg");
  elements.fillImagesButton.disabled = !canUploadImages;
  elements.fillImagesButton.title = canUploadImages
    ? ""
    : "Open a targeted mobile.bg page with pending images to use Upload Images.";
}

function setHidden(element, hidden) {
  element.classList.toggle("hidden", hidden);
}

function setError(message = "") {
  elements.errorText.textContent = message;
  setHidden(elements.errorText, !message);
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
}

function hideListing() {
  state.latestListing = null;
  setHidden(elements.listingSection, true);
  setHidden(elements.fillListingButton, true);
  setHidden(elements.fillImagesButton, true);
  setHidden(elements.refreshListingButton, true);
  setHidden(elements.listingEmptyText, false);
  setHidden(elements.listingContent, true);
}

function formatRemainingTime(expiresAt) {
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function clearActiveTimers() {
  if (state.countdownIntervalId) {
    clearInterval(state.countdownIntervalId);
    state.countdownIntervalId = null;
  }

  if (state.pollingIntervalId) {
    clearInterval(state.pollingIntervalId);
    state.pollingIntervalId = null;
  }

  if (state.listingIntervalId) {
    clearInterval(state.listingIntervalId);
    state.listingIntervalId = null;
  }
}

function resetPendingSession() {
  clearActiveTimers();
  state.expiresAt = null;
  state.pairingToken = null;
}

function renderIdle() {
  resetPendingSession();
  setError();
  hideListing();
  elements.statusText.textContent = "Not connected.";
  elements.countdownText.textContent = "";
  setHidden(elements.countdownText, true);
  setHidden(elements.qrWrapper, true);
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = "Generate QR";
  setHidden(elements.generateButton, false);
  setHidden(elements.disconnectButton, true);
}

function renderExpired() {
  resetPendingSession();
  hideListing();
  elements.statusText.textContent = "Pairing expired. Generate a new QR code.";
  elements.countdownText.textContent = "";
  setHidden(elements.countdownText, true);
  setHidden(elements.qrWrapper, true);
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = "Regenerate QR";
  setHidden(elements.generateButton, false);
  setHidden(elements.disconnectButton, true);
}

function renderPaired(session) {
  resetPendingSession();
  setError();
  elements.statusText.textContent = `Connected to ${session.deviceName}`;
  elements.countdownText.textContent = "";
  setHidden(elements.countdownText, true);
  setHidden(elements.qrWrapper, true);
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = "Generate QR";
  setHidden(elements.generateButton, true);
  setHidden(elements.disconnectButton, false);
}

function renderWaiting() {
  elements.statusText.textContent = "Waiting for mobile app...";
  setHidden(elements.qrWrapper, false);
  setHidden(elements.countdownText, false);
  elements.generateButton.disabled = true;
  elements.generateButton.textContent = "Generating...";
  setHidden(elements.generateButton, false);
  setHidden(elements.disconnectButton, true);
}

function updateCountdown() {
  if (!state.expiresAt) {
    return;
  }

  if (Date.now() >= state.expiresAt) {
    renderExpired();
    return;
  }

  elements.countdownText.textContent = `Expires in ${formatRemainingTime(state.expiresAt)}`;
}

async function drawQrCode(pairingToken) {
  elements.qrCode.replaceChildren();
  const qrPayload = JSON.stringify({
    type: "pair",
    token: pairingToken,
    expiresIn: Math.max(0, Math.ceil((state.expiresAt - Date.now()) / 1000)),
    expiresAt: state.expiresAt
  });

  new QRCode(elements.qrCode, {
    text: qrPayload,
    width: 220,
    height: 220
  });
}

async function checkPairingStatus() {
  if (!state.pairingToken || !state.expiresAt) {
    return;
  }

  if (Date.now() >= state.expiresAt) {
    renderExpired();
    return;
  }

  try {
    const result = await getPairingStatus(state.pairingToken);

    if (!result.paired) {
      setError();
      return;
    }

    const pairedSession = {
      pairingToken: state.pairingToken,
      userId: result.userId,
      deviceName: result.deviceName,
      pairedAt: new Date().toISOString()
    };

    await setPairedSession(pairedSession);
    renderPaired(pairedSession);
    await loadActiveListing(pairedSession.pairingToken);
    startListingPolling(pairedSession.pairingToken);
  } catch (error) {
    setError(error.message || "Could not check pairing status.");
  }
}

async function loadActiveListing(pairingToken) {
  if (!pairingToken) {
    hideListing();
    return;
  }

  try {
    const result = await getActiveListing(pairingToken);
    renderListing(result.listing);
  } catch (error) {
    renderListing(null);
    setError(error.message || "Could not load listing.");
  }
}

function startListingPolling(pairingToken) {
  if (!pairingToken) {
    return;
  }

  if (state.listingIntervalId) {
    clearInterval(state.listingIntervalId);
  }

  state.listingIntervalId = setInterval(() => {
    loadActiveListing(pairingToken);
  }, POLLING_INTERVAL_MS);
}

async function handleGenerateClick() {
  resetPendingSession();
  setError();
  elements.generateButton.disabled = true;
  elements.generateButton.textContent = "Generating...";

  try {
    const session = await createPairingSession();

    state.pairingToken = session.pairingToken;
    state.expiresAt = Date.now() + session.expiresIn * 1000;

    await drawQrCode(session.pairingToken);
    renderWaiting();
    updateCountdown();

    state.countdownIntervalId = setInterval(updateCountdown, 1000);
    state.pollingIntervalId = setInterval(checkPairingStatus, POLLING_INTERVAL_MS);

    await checkPairingStatus();
  } catch (error) {
    renderIdle();
    setError(error.message || "Could not create pairing session.");
  }
}

async function handleDisconnectClick() {
  resetPendingSession();
  await clearPairedSession();
  renderIdle();
}

async function handleRefreshListingClick() {
  const pairedSession = await getPairedSession();

  if (!pairedSession?.pairingToken) {
    hideListing();
    return;
  }

  await loadActiveListing(pairedSession.pairingToken);
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
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "fillListing",
      listing: state.latestListing
    });

    if (!response?.ok) {
      setError(response?.message || `Could not fill the ${marketplace.label} page.`);
      return;
    }

    if (response?.consumedImages && Array.isArray(state.latestListing.images) && state.latestListing.images.length) {
      await deleteUploadedImages(state.latestListing.images);
      state.latestListing = {
        ...state.latestListing,
        images: []
      };
      elements.listingImages.textContent = "Images: 0";
    }

    setError(response?.message || "");
  } catch {
    setError(`Open a ${marketplace.label} listing form page before using Fill Form.`);
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

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "fillListingImages",
      listing: state.latestListing
    });

    if (!response?.ok) {
      setError(response?.message || "Could not upload images on mobile.bg.");
      return;
    }

    if (response?.consumedImages) {
      await deleteUploadedImages(state.latestListing.images);
      state.latestListing = {
        ...state.latestListing,
        images: []
      };
      elements.listingImages.textContent = "Images: 0";
    }

    setError(response?.message || "");
    await syncFillButtonState();
  } catch {
    setError("Open the mobile.bg photos step before using Upload Images.");
  }
}

async function initializePopup() {
  try {
    const pairedSession = await getPairedSession();

    if (pairedSession) {
      renderPaired(pairedSession);
      await loadActiveListing(pairedSession.pairingToken);
      startListingPolling(pairedSession.pairingToken);
      await syncFillButtonState();
      return;
    }

    renderIdle();
    await syncFillButtonState();
  } catch (error) {
    renderIdle();
    setError(error.message || "Could not restore pairing state.");
  }
}

elements.generateButton.addEventListener("click", handleGenerateClick);
elements.disconnectButton.addEventListener("click", handleDisconnectClick);
elements.fillListingButton.addEventListener("click", handleFillListingClick);
elements.fillImagesButton.addEventListener("click", handleFillImagesClick);
elements.refreshListingButton.addEventListener("click", handleRefreshListingClick);

initializePopup();
