chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "fillListing" && message?.type !== "fillListingImages") {
    return;
  }

  const listing = message.listing;
  const language = listing?.language === "bg" ? "bg" : "en";

  function t(enText, bgText) {
    return language === "bg" ? bgText : enText;
  }

  if (!listing) {
    sendResponse({ ok: false, message: t("No listing data available.", "Няма налични данни за обява.") });
    return;
  }

  const adapter = globalThis.MultiPostContent?.findMarketplaceAdapter(window.location.href);

  if (!adapter) {
    sendResponse({
      ok: false,
      message: t(
        "Open a supported marketplace listing form page before using Fill Form.",
        "Отвори форма за обява в поддържан сайт, преди да използваш „Попълни форма“."
      )
    });
    return;
  }

  (async () => {
    try {
      const response = await adapter.fill(listing, {
        imagesOnly: message?.type === "fillListingImages"
      });
      sendResponse(response ?? {
        ok: false,
        message: t(
          `Could not fill the ${adapter.label} page.`,
          `Неуспешно попълване на страницата за ${adapter.label}.`
        )
      });
    } catch (error) {
      sendResponse({
        ok: false,
        message: error instanceof Error
          ? error.message
          : t(
            `Could not fill the ${adapter.label} page.`,
            `Неуспешно попълване на страницата за ${adapter.label}.`
          )
      });
    }
  })();

  return true;
});
