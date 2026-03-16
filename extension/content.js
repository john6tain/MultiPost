const SELECTORS = {
  title: 'input[name="title"]',
  description: 'textarea[name="description"]',
  price: 'input[name="parameters.price.price"]',
  imageInput: 'input[data-testid="attach-photos-input"]'
};

const API_BASE_URL = "http://localhost:3000";
const PRICE_FILL_DELAY_MS = 2000;

function setFieldValue(element, value) {
  if (!element) {
    return false;
  }

  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(element, value);

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));

  return true;
}

function toAbsoluteImageUrl(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("file://")) {
    throw new Error("Images are still local phone files. Resend the listing after restarting the updated backend and mobile app.");
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

async function fetchImageAsFile(imageUrl, index) {
  const response = await fetch(toAbsoluteImageUrl(imageUrl));

  if (!response.ok) {
    throw new Error(`Could not fetch image ${index + 1}.`);
  }

  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "jpg";

  return new File([blob], `listing-image-${index + 1}.${extension}`, {
    type: blob.type || "image/jpeg"
  });
}

async function attachListingImages(imageUrls) {
  if (!Array.isArray(imageUrls) || !imageUrls.length) {
    return true;
  }

  const input = document.querySelector(SELECTORS.imageInput);

  if (!(input instanceof HTMLInputElement)) {
    return false;
  }

  const transfer = new DataTransfer();
  const files = await Promise.all(
    imageUrls.map((imageUrl, index) => fetchImageAsFile(imageUrl, index))
  );

  files.forEach((file) => {
    transfer.items.add(file);
  });

  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "fillOlxListing") {
    return;
  }

  const listing = message.listing;

  if (!listing) {
    sendResponse({ ok: false, message: "No listing data available." });
    return;
  }

  const titleFilled = setFieldValue(
    document.querySelector(SELECTORS.title),
    listing.title || ""
  );

  if (!titleFilled) {
    sendResponse({ ok: false, message: "Could not find OLX form fields on this page." });
    return;
  }

  window.setTimeout(async () => {
    setFieldValue(document.querySelector(SELECTORS.description), listing.description || "");
    setFieldValue(
      document.querySelector(SELECTORS.price),
      listing.price != null ? String(listing.price) : ""
    );

    try {
      const imagesAttached = await attachListingImages(listing.images);

      if (!imagesAttached) {
        sendResponse({ ok: false, message: "Could not find the OLX image upload input." });
        return;
      }

      sendResponse({ ok: true });
    } catch (error) {
      sendResponse({
        ok: false,
        message: error instanceof Error ? error.message : "Could not attach listing images."
      });
    }
  }, PRICE_FILL_DELAY_MS);

  return true;
});
