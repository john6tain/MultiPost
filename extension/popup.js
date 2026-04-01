import {
  createPairingSession,
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
  titleText: document.getElementById("titleText"),
  subtitleText: document.getElementById("subtitleText"),
  statusText: document.getElementById("statusText"),
  countdownText: document.getElementById("countdownText"),
  errorText: document.getElementById("errorText"),
  qrWrapper: document.getElementById("qrWrapper"),
  qrCode: document.getElementById("qrCode"),
  listingSection: document.getElementById("listingSection"),
  listingHeaderTitle: document.getElementById("listingHeaderTitle"),
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
  latestListing: null,
  currentLanguage: "en"
};
const TAB_MESSAGE_TIMEOUT_MS = 20000;
const CONTENT_SCRIPT_FILES = [
  "content/common.js",
  "content/marketplaces/olx.js",
  "content/marketplaces/mobileBg.js",
  "content/marketplaces/bazarBg.js",
  "content/marketplaces/facebookMarketplace.js",
  "content.js"
];
const TRANSLATIONS = {
  en: {
    title: "Extension Pairing",
    subtitle: "Connect this browser to your mobile app.",
    notConnected: "Not connected.",
    generateQr: "Generate QR",
    regenerateQr: "Regenerate QR",
    waitingForMobile: "Waiting for mobile app...",
    generating: "Generating...",
    pairingExpired: "Pairing expired. Generate a new QR code.",
    connectedTo: "Connected to {{deviceName}}",
    latestListing: "Latest Listing",
    fillForm: "Fill Form",
    fillSite: "Fill {{site}}",
    uploadImages: "Upload Images",
    refresh: "Refresh",
    noListingYet: "No listing received yet.",
    untitledListing: "Untitled listing",
    priceSet: "Price: {{value}}",
    priceNotSet: "Price: not set",
    categorySet: "Category: {{value}}",
    categoryNotSet: "Category: not set",
    locationSet: "Location: {{value}}",
    locationNotSet: "Location: not set",
    noDescription: "No description",
    imagesCount: "Images: {{count}}",
    expiresIn: "Expires in {{value}}",
    disconnect: "Disconnect",
    or: "or",
    openSupportedForAutofill: "Open {{sites}} to autofill this listing.",
    openTargetedMobileImages: "Open a targeted mobile.bg page with pending images to use Upload Images.",
    noListingToFill: "No listing available to fill.",
    noActiveTab: "Could not find the active tab.",
    openSupportedBeforeFill: "Open {{sites}} before using Fill Form.",
    fillTimedOut: "Filling timed out. Refresh the page and try again.",
    couldNotFillSite: "Could not fill the {{site}} page.",
    openSiteBeforeFill: "Open a {{site}} listing form page before using Fill Form.",
    fillSuccess: "Filled {{site}} successfully.",
    uploadImagesOnlyMobileBg: "Upload Images is available only on mobile.bg.",
    listingNotTargetedMobileBg: "This listing is not targeted for mobile.bg.",
    noPendingImages: "No images are pending for upload.",
    uploading: "Uploading...",
    imageUploadTimedOut: "Image upload timed out. Check backend connection and retry.",
    couldNotUploadMobileBg: "Could not upload images on mobile.bg.",
    imagesUploaded: "Uploaded images successfully.",
    openMobileBgPhotos: "Open the mobile.bg photos step before using Upload Images.",
    noListingLoad: "Could not load listing.",
    checkPairingFailed: "Could not check pairing status.",
    createPairingFailed: "Could not create pairing session.",
    restorePairingFailed: "Could not restore pairing state.",
    listingNotTargeted: "This listing is not targeted for {{site}}."
  },
  bg: {
    title: "Свързване на разширението",
    subtitle: "Свържи този браузър с мобилното приложение.",
    notConnected: "Няма връзка.",
    generateQr: "Генерирай QR",
    regenerateQr: "Генерирай нов QR",
    waitingForMobile: "Изчакване на мобилното приложение...",
    generating: "Генериране...",
    pairingExpired: "Срокът за свързване изтече. Генерирай нов QR код.",
    connectedTo: "Свързано с {{deviceName}}",
    latestListing: "Последна обява",
    fillForm: "Попълни форма",
    fillSite: "Попълни {{site}}",
    uploadImages: "Качи снимки",
    refresh: "Обнови",
    noListingYet: "Все още няма получена обява.",
    untitledListing: "Обява без заглавие",
    priceSet: "Цена: {{value}}",
    priceNotSet: "Цена: не е зададена",
    categorySet: "Категория: {{value}}",
    categoryNotSet: "Категория: не е зададена",
    locationSet: "Локация: {{value}}",
    locationNotSet: "Локация: не е зададена",
    noDescription: "Няма описание",
    imagesCount: "Снимки: {{count}}",
    expiresIn: "Изтича след {{value}}",
    disconnect: "Прекъсни връзка",
    or: "или",
    openSupportedForAutofill: "Отвори {{sites}}, за да попълниш обявата.",
    openTargetedMobileImages: "Отвори целевата страница в mobile.bg с чакащи снимки, за да използваш „Качи снимки“.",
    noListingToFill: "Няма обява за попълване.",
    noActiveTab: "Не може да се открие активният таб.",
    openSupportedBeforeFill: "Отвори {{sites}}, преди да използваш „Попълни форма“.",
    fillTimedOut: "Попълването изтече. Обнови страницата и опитай отново.",
    couldNotFillSite: "Неуспешно попълване на страницата за {{site}}.",
    openSiteBeforeFill: "Отвори форма за обява в {{site}}, преди да използваш „Попълни форма“.",
    fillSuccess: "Успешно попълване за {{site}}.",
    uploadImagesOnlyMobileBg: "„Качи снимки“ е налично само за mobile.bg.",
    listingNotTargetedMobileBg: "Тази обява не е насочена към mobile.bg.",
    noPendingImages: "Няма чакащи снимки за качване.",
    uploading: "Качване...",
    imageUploadTimedOut: "Качването на снимки изтече. Провери връзката с backend и опитай отново.",
    couldNotUploadMobileBg: "Неуспешно качване на снимки в mobile.bg.",
    imagesUploaded: "Снимките са качени успешно.",
    openMobileBgPhotos: "Отвори стъпката за снимки в mobile.bg, преди да използваш „Качи снимки“.",
    noListingLoad: "Неуспешно зареждане на обявата.",
    checkPairingFailed: "Неуспешна проверка на статуса за свързване.",
    createPairingFailed: "Неуспешно създаване на сесия за свързване.",
    restorePairingFailed: "Неуспешно възстановяване на състоянието за свързване.",
    listingNotTargeted: "Тази обява не е насочена към {{site}}."
  }
};

function isSupportedLanguage(value) {
  return value === "en" || value === "bg";
}

function t(key, vars = {}) {
  const lang = isSupportedLanguage(state.currentLanguage) ? state.currentLanguage : "en";
  const template = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return Object.entries(vars).reduce((accumulator, [token, value]) => {
    return accumulator.replaceAll(`{{${token}}}`, String(value));
  }, template);
}

function updateLanguageFromListing(listing) {
  const listingLanguage = listing?.language;
  if (isSupportedLanguage(listingLanguage)) {
    state.currentLanguage = listingLanguage;
  }
}

function applyStaticTranslations() {
  if (elements.titleText) {
    elements.titleText.textContent = t("title");
  }

  if (elements.subtitleText) {
    elements.subtitleText.textContent = t("subtitle");
  }

  if (elements.listingHeaderTitle) {
    elements.listingHeaderTitle.textContent = t("latestListing");
  }

  elements.fillImagesButton.textContent = t("uploadImages");
  elements.refreshListingButton.textContent = t("refresh");
  elements.generateButton.textContent = t("generateQr");
  elements.disconnectButton.textContent = t("disconnect");
  elements.listingEmptyText.textContent = t("noListingYet");
}

function getFillButtonLabel(rawUrl) {
  const marketplace = findMarketplaceByUrl(rawUrl);
  return marketplace?.supportsAutofill
    ? t("fillSite", { site: marketplace.label })
    : t("fillForm");
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
    : t("openSupportedForAutofill", { sites: getAutofillMarketplaceNames().join(` ${t("or")} `) });
  setHidden(elements.fillImagesButton, !state.latestListing || marketplace?.id !== "mobile-bg");
  elements.fillImagesButton.disabled = !canUploadImages;
  elements.fillImagesButton.title = canUploadImages
    ? ""
    : t("openTargetedMobileImages");
}

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

function renderListing(listing) {
  updateLanguageFromListing(listing);
  applyStaticTranslations();
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

  elements.listingTitle.textContent = listing.title || t("untitledListing");
  elements.listingPrice.textContent = listing.price ? t("priceSet", { value: listing.price }) : t("priceNotSet");
  elements.listingCategory.textContent = listing.category ? t("categorySet", { value: listing.category }) : t("categoryNotSet");
  elements.listingLocation.textContent = listing.location ? t("locationSet", { value: listing.location }) : t("locationNotSet");
  elements.listingDescription.textContent = listing.description || t("noDescription");
  elements.listingImages.textContent = t("imagesCount", { count: Array.isArray(listing.images) ? listing.images.length : 0 });

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
  elements.statusText.textContent = t("notConnected");
  elements.countdownText.textContent = "";
  setHidden(elements.countdownText, true);
  setHidden(elements.qrWrapper, true);
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = t("generateQr");
  setHidden(elements.generateButton, false);
  setHidden(elements.disconnectButton, true);
}

function renderExpired() {
  resetPendingSession();
  hideListing();
  elements.statusText.textContent = t("pairingExpired");
  elements.countdownText.textContent = "";
  setHidden(elements.countdownText, true);
  setHidden(elements.qrWrapper, true);
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = t("regenerateQr");
  setHidden(elements.generateButton, false);
  setHidden(elements.disconnectButton, true);
}

function renderPaired(session) {
  resetPendingSession();
  setError();
  elements.statusText.textContent = t("connectedTo", { deviceName: session.deviceName });
  elements.countdownText.textContent = "";
  setHidden(elements.countdownText, true);
  setHidden(elements.qrWrapper, true);
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = t("generateQr");
  setHidden(elements.generateButton, true);
  setHidden(elements.disconnectButton, false);
}

function renderWaiting() {
  elements.statusText.textContent = t("waitingForMobile");
  setHidden(elements.qrWrapper, false);
  setHidden(elements.countdownText, false);
  elements.generateButton.disabled = true;
  elements.generateButton.textContent = t("generating");
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

  elements.countdownText.textContent = t("expiresIn", { value: formatRemainingTime(state.expiresAt) });
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
    setError(error.message || t("checkPairingFailed"));
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
    setError(error.message || t("noListingLoad"));
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
  elements.generateButton.textContent = t("generating");

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
    setError(error.message || t("createPairingFailed"));
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
    setError(t("noListingToFill"));
    return;
  }

  const tab = await getActiveTab();
  const marketplace = findMarketplaceByUrl(tab?.url);

  if (!tab?.id) {
    setError(t("noActiveTab"));
    return;
  }

  if (!marketplace?.supportsAutofill) {
    setError(t("openSupportedBeforeFill", { sites: getAutofillMarketplaceNames().join(` ${t("or")} `) }));
    await syncFillButtonState();
    return;
  }

  if (!canFillMarketplace(state.latestListing, marketplace)) {
    setError(t("listingNotTargeted", { site: marketplace.label }));
    await syncFillButtonState();
    return;
  }

  try {
    const response = await sendTabMessageWithInjectionRetry(tab.id, {
      type: "fillListing",
      listing: state.latestListing
    }, t("fillTimedOut"));

    if (!response?.ok) {
      setError(response?.message || t("couldNotFillSite", { site: marketplace.label }));
      return;
    }

    // Keep uploaded backend images available across multiple marketplace fills.
    // They are cleared when the user sends a new listing payload.

    setSuccess(response?.message || t("fillSuccess", { site: marketplace.label }));
  } catch (error) {
    setError(error?.message || t("openSiteBeforeFill", { site: marketplace.label }));
  }
}

async function handleFillImagesClick() {
  if (!state.latestListing) {
    setError(t("noListingToFill"));
    return;
  }

  const tab = await getActiveTab();
  const marketplace = findMarketplaceByUrl(tab?.url);

  if (!tab?.id) {
    setError(t("noActiveTab"));
    return;
  }

  if (marketplace?.id !== "mobile-bg") {
    setError(t("uploadImagesOnlyMobileBg"));
    await syncFillButtonState();
    return;
  }

  if (!canFillMarketplace(state.latestListing, marketplace)) {
    setError(t("listingNotTargetedMobileBg"));
    await syncFillButtonState();
    return;
  }

  if (!Array.isArray(state.latestListing.images) || !state.latestListing.images.length) {
    setError(t("noPendingImages"));
    await syncFillButtonState();
    return;
  }

  const originalFillImagesLabel = elements.fillImagesButton.textContent;
  elements.fillImagesButton.disabled = true;
  elements.fillImagesButton.textContent = t("uploading");

  try {
    const response = await sendTabMessageWithInjectionRetry(tab.id, {
      type: "fillListingImages",
      listing: state.latestListing
    }, t("imageUploadTimedOut"));

    if (!response?.ok) {
      setError(response?.message || t("couldNotUploadMobileBg"));
      return;
    }

    // Keep uploaded backend images available across multiple marketplace fills.
    // They are cleared when the user sends a new listing payload.

    setSuccess(response?.message || t("imagesUploaded"));
  } catch (error) {
    setError(error?.message || t("openMobileBgPhotos"));
  } finally {
    elements.fillImagesButton.textContent = originalFillImagesLabel;
    await syncFillButtonState();
  }
}

async function initializePopup() {
  try {
    applyStaticTranslations();
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
    setError(error.message || t("restorePairingFailed"));
  }
}

elements.generateButton.addEventListener("click", handleGenerateClick);
elements.disconnectButton.addEventListener("click", handleDisconnectClick);
elements.fillListingButton.addEventListener("click", handleFillListingClick);
elements.fillImagesButton.addEventListener("click", handleFillImagesClick);
elements.refreshListingButton.addEventListener("click", handleRefreshListingClick);

initializePopup();
