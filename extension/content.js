chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "fillListing" && message?.type !== "fillListingImages") {
    return;
  }

  const listing = message.listing;

  if (!listing) {
    sendResponse({ ok: false, message: "No listing data available." });
    return;
  }

  const adapter = globalThis.MultiPostContent?.findMarketplaceAdapter(window.location.href);

  if (!adapter) {
    sendResponse({
      ok: false,
      message: "Open a supported marketplace listing form page before using Fill Form."
    });
    return;
  }

  (async () => {
    try {
      const response = await adapter.fill(listing, {
        imagesOnly: message?.type === "fillListingImages"
      });
      sendResponse(response ?? { ok: false, message: `Could not fill the ${adapter.label} page.` });
    } catch (error) {
      sendResponse({
        ok: false,
        message: error instanceof Error ? error.message : `Could not fill the ${adapter.label} page.`
      });
    }
  })();

  return true;
});
