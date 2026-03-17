(function registerOlxMarketplaceAdapter() {
  const PRICE_FILL_DELAY_MS = 2000;
  const { registerMarketplaceAdapter, helpers } = globalThis.MultiPostContent;

  const SELECTORS = {
    title: ['input[name="title"]'],
    description: ['textarea[name="description"]'],
    price: ['input[name="parameters.price.price"]'],
    imageInput: ['input[data-testid="attach-photos-input"]']
  };

  registerMarketplaceAdapter({
    id: "olx",
    label: "OLX",
    matches(url) {
      return url.origin === "https://www.olx.bg";
    },
    async fill(listing) {
      const titleFilled = helpers.setFieldValue(
        helpers.queryFirst(SELECTORS.title),
        listing.title || ""
      );

      if (!titleFilled) {
        return { ok: false, message: "Could not find OLX form fields on this page." };
      }

      await helpers.wait(PRICE_FILL_DELAY_MS);

      helpers.setFieldValue(
        helpers.queryFirst(SELECTORS.description),
        listing.description || ""
      );
      helpers.setFieldValue(
        helpers.queryFirst(SELECTORS.price),
        listing.price != null ? String(listing.price) : ""
      );

      const imagesAttached = await helpers.attachListingImages(
        SELECTORS.imageInput,
        listing.images
      );

      if (!imagesAttached) {
        return { ok: false, message: "Could not find the OLX image upload input." };
      }

      return { ok: true, consumedImages: true };
    }
  });
})();
