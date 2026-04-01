(function registerMobileBgMarketplaceAdapter() {
  const { registerMarketplaceAdapter, helpers } = globalThis.MultiPostContent;

  const VEHICLE_CATEGORY_CONFIG = {
    cars: { topmenu: "1", priceField: "f12", descriptionField: "f21", cityField: "f19" },
    buses: { topmenu: "3", priceField: "f15", descriptionField: "f24", cityField: "f22" },
    trucks: { topmenu: "4", priceField: "f15", descriptionField: "f24", cityField: "f22" },
    motorcycles: { topmenu: "5", priceField: "f15", descriptionField: "f24", cityField: "f22" },
    forklifts: { topmenu: "8", priceField: "f11", descriptionField: "f20", cityField: "f18" },
    boats: { topmenu: "10", priceField: "f16", descriptionField: "f24", cityField: "f22" },
    trailers: { topmenu: "11", priceField: "f10", descriptionField: "f18", cityField: "f16" },
    bicycles: { topmenu: "12", priceField: "f12", descriptionField: "f17", cityField: "f15" },
    parts: { topmenu: "1", rub: "5", titleField: "f24", priceField: "f12", descriptionField: "f17", cityField: "f15" }
  };

  const SELECTORS = {
    title: [
      'input[name="title"]',
      'input[name="ad_title"]',
      'input[name="headline"]'
    ],
    description: [
      'textarea[name="description"]',
      'textarea[name="descr"]',
      'textarea[name="text"]'
    ],
    price: [
      'input[name="price"]',
      'input[name="price1"]',
      'input[name*="price"]'
    ],
    imageInput: [
      'div[id$="_html5_container"] input[type="file"]',
      'input[id$="_html5"][type="file"]',
      'div.plupload.html5 input[type="file"][multiple]',
      'ul#container input[type="file"][multiple]',
      'li#imgUploadSelectFiles + div input[type="file"][multiple]',
      'li#imgUploadSelectFiles ~ div input[type="file"]',
      'input[type="file"][multiple]',
      'input[name="images[]"]',
      'input[name="picture"]'
    ],
    tiresRims: {
      adType: ['select[name="f5"]'],
      price: ['input[name="f6"]'],
      vatStatus: ['select[name="f43"]'],
      currency: ['select[name="f7"]'],
      condition: ['select[name="f8"]'],
      tireBrand: ['select[name="f12"]'],
      tireWidthMm: ['select[name="f13"]'],
      tireHeight: ['select[name="f14"]'],
      rimDiameterInch: ['select[name="f15"]'],
      season: ['select[name="f18"]'],
      speedIndex: ['select[name="f20"]'],
      loadIndex: ['select[name="f19"]'],
      treadPattern: ['select[name="f22"]'],
      carMake: ['select[name="f9"]'],
      carModel: ['select[name="f10"]'],
      rimBrand: ['select[name="f11"]'],
      rimWidthInch: ['select[name="f17"]'],
      rimMaterial: ['select[name="f26"]'],
      rimOffsetEtMm: ['select[name="f30"]'],
      boltsCount: ['select[name="f27"]'],
      boltSpacing: ['select[name="f28"]'],
      centerHole: ['select[name="f31"]'],
      quantity: ['input[name="f24"]'],
      region: ['select[name="f33"]'],
      city: ['select[name="f34"]'],
      rimType: ['select[name="f29"]'],
      description: ['textarea[name="f36"]']
    }
  };

  function queryByName(fieldName) {
    return document.querySelector(`select[name="${fieldName}"], input[name="${fieldName}"], textarea[name="${fieldName}"]`);
  }

  function dispatchFieldEvents(element) {
    if (!element) {
      return;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function getNormalizedText(value) {
    return String(value || "").trim();
  }

  function getResolvedVehicleFieldValue(fieldName, fieldValue, listing, categoryConfig) {
    const normalizedFieldValue = getNormalizedText(fieldValue);
    if (normalizedFieldValue) {
      return normalizedFieldValue;
    }

    if (fieldName === categoryConfig.cityField) {
      return getNormalizedText(listing.location);
    }

    return "";
  }

  async function fillVehicleCategory(listing, categoryKey) {
    const mobileBgData = listing.marketplaceData?.mobileBg;
    const categoryConfig = VEHICLE_CATEGORY_CONFIG[categoryKey];
    const fields = mobileBgData?.fields ?? {};
    const selectedFeatures = new Set(mobileBgData?.features ?? []);

    const topmenu = document.querySelector('input[name="topmenu"]')?.value;
    if (topmenu !== categoryConfig.topmenu) {
      return {
        ok: false,
        consumedImages: false,
        message: "Open the matching mobile.bg primary category step before filling this listing."
      };
    }

    if (categoryConfig.rub) {
      const rub = document.querySelector('input[name="rub"]')?.value;
      if (rub !== categoryConfig.rub) {
        return {
          ok: false,
          consumedImages: false,
          message: "Open the matching mobile.bg category form before filling this listing."
        };
      }
    }

    const brandField = queryByName("f5");
    if (brandField && fields.f5) {
      helpers.setSelectValue(brandField, fields.f5, { dispatchEvents: true });
      await helpers.wait(250);
    }

    Object.entries(fields).forEach(([fieldName, fieldValue]) => {
      const resolvedValue = getResolvedVehicleFieldValue(fieldName, fieldValue, listing, categoryConfig);
      if (!resolvedValue || fieldName === "f5") {
        return;
      }

      const element = queryByName(fieldName);
      if (!element) {
        return;
      }

      if (element.tagName === "SELECT") {
        helpers.setSelectValue(element, resolvedValue);
        return;
      }

      helpers.setFieldValue(element, resolvedValue);
    });

    helpers.setFieldValue(
      queryByName(categoryConfig.priceField),
      listing.price != null ? String(listing.price) : ""
    );
    if (categoryConfig.titleField) {
      helpers.setFieldValue(queryByName(categoryConfig.titleField), listing.title || "");
    }
    helpers.setFieldValue(
      queryByName(categoryConfig.descriptionField),
      listing.description || ""
    );

    document.querySelectorAll('input[type="checkbox"][name^="f"]').forEach((checkbox) => {
      const shouldCheck = selectedFeatures.has(checkbox.name);
      checkbox.checked = shouldCheck;
      dispatchFieldEvents(checkbox);
    });

    return {
      ok: true,
      consumedImages: false,
      message: "Filled the mobile.bg category step. Open the photos step to attach images."
    };
  }

  function fillTiresRimsCategory(listing) {
    const tiresRimsData = listing.marketplaceData?.mobileBg?.tiresRims;

    if (!tiresRimsData) {
      return;
    }

    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.adType), tiresRimsData.adType);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.vatStatus), tiresRimsData.vatStatus);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.currency), tiresRimsData.currency);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.condition), tiresRimsData.condition);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.tireBrand), tiresRimsData.tireBrand);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.tireWidthMm), tiresRimsData.tireWidthMm);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.tireHeight), tiresRimsData.tireHeight);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.rimDiameterInch), tiresRimsData.rimDiameterInch);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.season), tiresRimsData.season);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.speedIndex), tiresRimsData.speedIndex);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.loadIndex), tiresRimsData.loadIndex);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.treadPattern), tiresRimsData.treadPattern);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.carMake), tiresRimsData.carMake, { dispatchEvents: true });
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.carModel), tiresRimsData.carModel);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.rimBrand), tiresRimsData.rimBrand);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.rimWidthInch), tiresRimsData.rimWidthInch);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.rimMaterial), tiresRimsData.rimMaterial);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.rimOffsetEtMm), tiresRimsData.rimOffsetEtMm);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.boltsCount), tiresRimsData.boltsCount);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.boltSpacing), tiresRimsData.boltSpacing);
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.centerHole), tiresRimsData.centerHole);
    helpers.setFieldValue(helpers.queryFirst(SELECTORS.tiresRims.quantity), tiresRimsData.quantity || "");
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.region), tiresRimsData.region);
    helpers.setSelectValue(
      helpers.queryFirst(SELECTORS.tiresRims.city),
      getNormalizedText(tiresRimsData.city) || getNormalizedText(listing.location)
    );
    helpers.setSelectValue(helpers.queryFirst(SELECTORS.tiresRims.rimType), tiresRimsData.rimType);
  }

  function isTiresRimsStep() {
    return Boolean(
      document.querySelector('input[name="pubact"][value="2"]')
      || document.querySelector('input[name="rub"][value="7"]')
      || document.querySelector('textarea[name="f36"]')
      || document.querySelector('select[name="f33"]')
      || document.querySelector('select[name="f34"]')
    );
  }

  function isPhotosStep() {
    return Boolean(
      document.querySelector('li#imgUploadSelectFiles')
      || document.querySelector('ul#container')
      || document.querySelector('div[id$="_html5_container"] input[type="file"]')
      || document.querySelector('input[id$="_html5"][type="file"]')
      || document.querySelector('div.plupload.html5 input[type="file"][multiple]')
      || document.querySelector('ul#container input[type="file"][multiple]')
      || document.querySelector('li#imgUploadSelectFiles ~ div input[type="file"]')
    );
  }

  registerMarketplaceAdapter({
    id: "mobile-bg",
    label: "mobile.bg",
    matches(url) {
      return url.origin === "https://www.mobile.bg";
    },
    async fill(listing, context = {}) {
      const { imagesOnly = false } = context;
      const mobileBgData = listing.marketplaceData?.mobileBg;
      const categoryKey = mobileBgData?.primaryCategoryKey;

      if (imagesOnly) {
        if (!isPhotosStep()) {
          return {
            ok: false,
            consumedImages: false,
            message: "Open the mobile.bg photos step before using Upload Images."
          };
        }

        const imagesAttached = await helpers.attachListingImages(SELECTORS.imageInput, listing.images);

        if (!imagesAttached) {
          return {
            ok: false,
            message: "Could not find the mobile.bg photo upload input on the images step."
          };
        }

        return {
          ok: true,
          consumedImages: true,
          message: "Attached images on the mobile.bg photos step."
        };
      }

      if (categoryKey && VEHICLE_CATEGORY_CONFIG[categoryKey]) {
        return fillVehicleCategory(listing, categoryKey);
      }

      if (isTiresRimsStep()) {
        fillTiresRimsCategory(listing);

        const priceFilled = helpers.setFieldValue(
          helpers.queryFirst(SELECTORS.tiresRims.price),
          listing.price != null ? String(listing.price) : ""
        );
        helpers.setFieldValue(helpers.queryFirst(SELECTORS.tiresRims.description), listing.description || "");

        if (!priceFilled) {
          return {
            ok: false,
            message: "Could not find the mobile.bg price field for the tires/rims category."
          };
        }

        return {
          ok: true,
          consumedImages: false,
          message: "Filled the mobile.bg tires/rims step. Open the photos step to attach images."
        };
      }

      if (isPhotosStep()) {
        return {
          ok: false,
          consumedImages: false,
          message: "Use Upload Images on the mobile.bg photos step."
        };
      }

      const titleFilled = helpers.setFieldValue(helpers.queryFirst(SELECTORS.title), listing.title || "");
      if (!titleFilled) {
        return {
          ok: false,
          message: "Could not find the mobile.bg title field. Update the selector map for the current mobile.bg form."
        };
      }

      helpers.setFieldValue(helpers.queryFirst(SELECTORS.description), listing.description || "");
      helpers.setFieldValue(helpers.queryFirst(SELECTORS.price), listing.price != null ? String(listing.price) : "");

      return {
        ok: true,
        consumedImages: false,
        message: "Filled the current mobile.bg details step."
      };
    }
  });
})();
