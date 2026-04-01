(function registerBazarBgMarketplaceAdapter() {
  const { registerMarketplaceAdapter, helpers } = globalThis.MultiPostContent;

  const CREATE_PATH_PREFIX = "/ads/save";
  const LOGIN_PATH_PREFIX = "/user/login";
  const DEFAULT_TIMEOUT_MS = 8000;
  const DEPENDENCY_TIMEOUT_MS = 12000;
  const POLL_INTERVAL_MS = 120;
  const IMAGE_UPLOAD_TIMEOUT_MS = 20000;

  const SELECTORS = {
    form: 'form[action="/ads/save"]',
    title: '#title, input[name="title"]',
    description: "#descr, textarea[name=\"description\"]",
    price: 'input[name="price"]',
    currency: 'select[name="currency"]',
    phone: '#tel, input[name="phone"]',
    hidePhone: 'input[name="hide_phone"]',
    priceType: 'input[name="price_type"]',
    categoryId: '#category_id, input[name="category_id"]',
    provinceCityLocation: "#province_city_location",
    populatedLocation: "#populated_location",
    provinceId: 'input[name="province_id"]',
    cityId: 'input[name="city_id"]',
    districtId: 'input[name="district_id"]',
    latitude: "#latInput, input[name=\"lat\"]",
    longitude: "#lngInput, input[name=\"long\"]",
    exactCoordinates: "#exactCoordinatesInput, input[name=\"exact_coordinates\"]",
    videoUrl: 'input[name="video_url"]',
    pics: "#pics, input[name=\"pics\"]",
    rubChooser: "#rubChooser",
    rubChooserPopup: "#rubChooserPopup",
    confirmPhone: "#confirmPhone",
    confirmCode: "#confirmCode",
    imageUploadRoot: "#imgUpload",
    imageFileInput: [
      '#imgUpload input[type="file"][id^="html5_"]',
      '#imgUpload input[type="file"][multiple]',
      '#imgUpload input[type="file"]',
      'input[type="file"][id^="html5_"]',
      'input[type="file"][multiple]'
    ]
  };

  const SCHEMA_FIELD_NAMES = {
    generic_goods: ["condition", "delivery", "kind"],
    auto_accessories: ["condition", "vehicleType", "accessoryType"],
    real_estate: ["dealType", "propertyType", "areaSqm", "constructionType", "floor", "year"],
    jobs_services: []
  };

  function isVisible(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    return styles.display !== "none" && styles.visibility !== "hidden";
  }

  function normalizeValue(value) {
    return String(value ?? "").trim();
  }

  async function waitFor(check, timeoutMs = DEFAULT_TIMEOUT_MS, errorMessage = "Timed out while waiting for bazar.bg UI.") {
    const startedAt = Date.now();

    while (Date.now() - startedAt <= timeoutMs) {
      const result = check();
      if (result) {
        return result;
      }
      await helpers.wait(POLL_INTERVAL_MS);
    }

    throw new Error(errorMessage);
  }

  async function waitForElement(selector, timeoutMs = DEFAULT_TIMEOUT_MS) {
    return waitFor(
      () => document.querySelector(selector),
      timeoutMs,
      `Could not find required bazar.bg element: ${selector}`
    );
  }

  function dispatchChange(element) {
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function setSelectWithFallback(selectElement, value) {
    const normalized = normalizeValue(value).toLowerCase();
    if (!(selectElement instanceof HTMLSelectElement) || !normalized) {
      return false;
    }

    const didSetByHelper = helpers.setSelectValue(selectElement, value, { dispatchEvents: true });
    if (didSetByHelper) {
      return true;
    }

    const option = Array.from(selectElement.options).find((item) => {
      return normalizeValue(item.value).toLowerCase() === normalized
        || normalizeValue(item.textContent).toLowerCase() === normalized;
    });

    if (!option) {
      return false;
    }

    selectElement.value = option.value;
    dispatchChange(selectElement);
    return true;
  }

  function setFieldValue(element, value) {
    const normalized = normalizeValue(value);
    if (!normalized || !element) {
      return false;
    }

    if (element instanceof HTMLSelectElement) {
      return setSelectWithFallback(element, normalized);
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      return helpers.setFieldValue(element, normalized);
    }

    return false;
  }

  function setCheckboxValue(element, checked) {
    if (!(element instanceof HTMLInputElement) || element.type !== "checkbox") {
      return false;
    }

    element.checked = checked;
    dispatchChange(element);
    return true;
  }

  function setRadioValue(value) {
    const normalized = normalizeValue(value).toLowerCase();
    if (!normalized) {
      return false;
    }

    const radios = Array.from(document.querySelectorAll(SELECTORS.priceType));
    const target = radios.find((radio) => {
      if (!(radio instanceof HTMLInputElement)) {
        return false;
      }

      return normalizeValue(radio.value).toLowerCase() === normalized
        || normalizeValue(radio.id).toLowerCase() === normalized;
    });

    if (!(target instanceof HTMLInputElement)) {
      return false;
    }

    target.checked = true;
    dispatchChange(target);
    return true;
  }

  function getSchemaFieldNames(schemaKey) {
    return SCHEMA_FIELD_NAMES[schemaKey] ?? SCHEMA_FIELD_NAMES.generic_goods;
  }

  function getBazarFields(listing) {
    return listing.marketplaceData?.bazarBg?.fields ?? {};
  }

  function getFieldValue(listing, fieldName) {
    const bazarFields = getBazarFields(listing);
    const explicit = normalizeValue(bazarFields[fieldName]);
    if (explicit) {
      return explicit;
    }

    switch (fieldName) {
      case "title":
        return normalizeValue(listing.title);
      case "description":
        return normalizeValue(listing.description);
      case "price":
      case "salary_or_price":
        return listing.price != null ? String(listing.price) : "";
      case "location":
        return normalizeValue(listing.location);
      case "phone":
        return normalizeValue(listing.phone);
      case "currency":
        return "2";
      case "price_type":
        return "2";
      default:
        return "";
    }
  }

  function getControlForSchemaField(fieldName) {
    const escaped = CSS.escape(fieldName);
    return document.querySelector(`[name="${escaped}"], #${escaped}`);
  }

  async function waitForSelectOptions(selectElement, timeoutMs = DEPENDENCY_TIMEOUT_MS) {
    if (!(selectElement instanceof HTMLSelectElement)) {
      return;
    }

    await waitFor(
      () => !selectElement.disabled && selectElement.options.length > 1,
      timeoutMs,
      `Dependent dropdown ${selectElement.id || selectElement.name || "unknown"} did not load in time.`
    );
  }

  async function fillLocationFlow(listing) {
    const provinceSelect = document.querySelector(SELECTORS.provinceCityLocation);
    const citySelect = document.querySelector(SELECTORS.populatedLocation);

    const provinceValue = getFieldValue(listing, "province_city_location");
    if (provinceSelect instanceof HTMLSelectElement && provinceValue) {
      const didSetProvince = setSelectWithFallback(provinceSelect, provinceValue);
      if (didSetProvince && citySelect instanceof HTMLSelectElement) {
        await waitForSelectOptions(citySelect).catch(() => undefined);
      }
    }

    const cityValue = getFieldValue(listing, "populated_location");
    if (citySelect instanceof HTMLSelectElement && cityValue) {
      setSelectWithFallback(citySelect, cityValue);
    }

    setFieldValue(document.querySelector(SELECTORS.provinceId), getFieldValue(listing, "province_id"));
    setFieldValue(document.querySelector(SELECTORS.cityId), getFieldValue(listing, "city_id"));
    setFieldValue(document.querySelector(SELECTORS.districtId), getFieldValue(listing, "district_id"));
    setFieldValue(document.querySelector(SELECTORS.latitude), getFieldValue(listing, "lat"));
    setFieldValue(document.querySelector(SELECTORS.longitude), getFieldValue(listing, "long"));
    setFieldValue(document.querySelector(SELECTORS.exactCoordinates), getFieldValue(listing, "exact_coordinates"));
  }

  async function openRubChooserPopup() {
    const chooser = await waitForElement(SELECTORS.rubChooser);
    const popup = document.querySelector(SELECTORS.rubChooserPopup);

    if (!isVisible(popup)) {
      chooser.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await waitFor(
        () => isVisible(document.querySelector(SELECTORS.rubChooserPopup)),
        DEFAULT_TIMEOUT_MS,
        "Could not open bazar.bg category chooser."
      );
    }
  }

  async function clickCategoryNode(columnSelector, categoryId, label) {
    if (!normalizeValue(categoryId)) {
      return false;
    }

    const escapedId = CSS.escape(String(categoryId));
    const selector = `${columnSelector} a[data-id="${escapedId}"]`;
    const node = await waitFor(
      () => document.querySelector(selector),
      DEPENDENCY_TIMEOUT_MS,
      `Could not find ${label} category option in bazar.bg chooser.`
    );

    if (!(node instanceof HTMLElement)) {
      return false;
    }

    node.click();
    await helpers.wait(350);
    return true;
  }

  async function applyCategorySelection(listing) {
    const bazar = listing.marketplaceData?.bazarBg;
    const topLevelId = normalizeValue(bazar?.topLevelCategoryId);
    const subcategoryId = normalizeValue(bazar?.subcategoryId);
    const leafId = normalizeValue(bazar?.leafCategoryId);
    const targetCategoryId = leafId || subcategoryId || topLevelId;

    if (!targetCategoryId) {
      return;
    }

    await openRubChooserPopup();
    await clickCategoryNode("#colMain", topLevelId, "top-level");
    if (subcategoryId) {
      await clickCategoryNode("#colRub", subcategoryId, "subcategory");
    }
    if (leafId) {
      await clickCategoryNode("#colSub", leafId, "leaf");
    }

    const hiddenCategory = await waitForElement(SELECTORS.categoryId);
    const hiddenValue = normalizeValue(hiddenCategory.value);
    if (hiddenValue !== targetCategoryId) {
      hiddenCategory.value = targetCategoryId;
      dispatchChange(hiddenCategory);
    }
  }

  function resolveImageSelectors() {
    return SELECTORS.imageFileInput;
  }

  async function waitForPicsPopulation(previousValue) {
    const picsInput = document.querySelector(SELECTORS.pics);
    if (!(picsInput instanceof HTMLInputElement)) {
      return false;
    }

    try {
      await waitFor(
        () => {
          const nextValue = normalizeValue(picsInput.value);
          return Boolean(nextValue && nextValue !== normalizeValue(previousValue));
        },
        IMAGE_UPLOAD_TIMEOUT_MS,
        "Image upload did not finalize (#pics stayed empty)."
      );
      return true;
    } catch {
      return false;
    }
  }

  async function attachImagesAndConfirm(listing) {
    if (!Array.isArray(listing.images) || !listing.images.length) {
      return { attached: false, confirmed: false };
    }

    await waitForElement(SELECTORS.imageUploadRoot, DEPENDENCY_TIMEOUT_MS);
    const picsInput = document.querySelector(SELECTORS.pics);
    const previousValue = picsInput instanceof HTMLInputElement ? picsInput.value : "";

    const attached = await helpers.attachListingImages(resolveImageSelectors(), listing.images);
    if (!attached) {
      return { attached: false, confirmed: false };
    }

    const confirmed = await waitForPicsPopulation(previousValue);
    return { attached: true, confirmed };
  }

  function resolveBlockedByPhoneVerification() {
    const confirmPhone = document.querySelector(SELECTORS.confirmPhone);
    const confirmCode = document.querySelector(SELECTORS.confirmCode);

    if (!isVisible(confirmPhone) && !isVisible(confirmCode)) {
      return false;
    }

    const closeButton = document.querySelector(
      "#confirmPhone .close, #confirmCode .close, #confirmPhone [data-dismiss], #confirmCode [data-dismiss]"
    );

    if (closeButton instanceof HTMLElement) {
      closeButton.click();
      return false;
    }

    return true;
  }

  async function fillMainFields(listing) {
    setFieldValue(await waitForElement(SELECTORS.title), getFieldValue(listing, "title"));
    setFieldValue(await waitForElement(SELECTORS.description), getFieldValue(listing, "description"));
    setFieldValue(await waitForElement(SELECTORS.price), getFieldValue(listing, "price"));
    setFieldValue(document.querySelector(SELECTORS.currency), getFieldValue(listing, "currency"));
    setRadioValue(getFieldValue(listing, "price_type"));
    setFieldValue(document.querySelector(SELECTORS.phone), getFieldValue(listing, "phone"));
    setCheckboxValue(
      document.querySelector(SELECTORS.hidePhone),
      ["1", "true", "yes"].includes(getFieldValue(listing, "hide_phone").toLowerCase())
    );
    setFieldValue(document.querySelector(SELECTORS.videoUrl), getFieldValue(listing, "video_url"));
  }

  async function fillSchemaSpecificFields(listing, schemaKey) {
    const missingRequired = [];
    const requiredFieldNames = getSchemaFieldNames(schemaKey);

    requiredFieldNames.forEach((fieldName) => {
      const value = getFieldValue(listing, fieldName);
      if (!value) {
        missingRequired.push(fieldName);
        return;
      }

      const control = getControlForSchemaField(fieldName);
      if (!control) {
        missingRequired.push(fieldName);
        return;
      }

      setFieldValue(control, value);
    });

    return missingRequired;
  }

  registerMarketplaceAdapter({
    id: "bazar-bg",
    label: "bazar.bg",
    matches(url) {
      return url.origin === "https://bazar.bg";
    },
    async fill(listing, context = {}) {
      const { imagesOnly = false } = context;

      if (window.location.pathname.startsWith(LOGIN_PATH_PREFIX)) {
        return {
          ok: false,
          consumedImages: false,
          message: "Log in to bazar.bg first, then open https://bazar.bg/ads/save."
        };
      }

      if (!window.location.pathname.startsWith(CREATE_PATH_PREFIX)) {
        return {
          ok: false,
          consumedImages: false,
          message: "Open bazar.bg create page at https://bazar.bg/ads/save before using Fill Form."
        };
      }

      await waitForElement(SELECTORS.form);

      if (resolveBlockedByPhoneVerification()) {
        return {
          ok: false,
          consumedImages: false,
          message: "Phone verification popup is blocking the form. Complete/close it and retry."
        };
      }

      if (imagesOnly) {
        const imagesResult = await attachImagesAndConfirm(listing);

        if (!imagesResult.attached) {
          return {
            ok: false,
            consumedImages: false,
            message: "Could not find the bazar.bg image upload input under #imgUpload."
          };
        }

        if (!imagesResult.confirmed) {
          return {
            ok: false,
            consumedImages: false,
            message: "Images were selected but bazar.bg did not confirm upload (#pics was not populated)."
          };
        }

        return {
          ok: true,
          consumedImages: true,
          message: "Attached bazar.bg images successfully."
        };
      }

      await applyCategorySelection(listing);
      await fillMainFields(listing);
      await fillLocationFlow(listing);

      const schemaKey = listing.marketplaceData?.bazarBg?.schemaKey || "generic_goods";
      const missingRequired = await fillSchemaSpecificFields(listing, schemaKey);

      const imagesResult = await attachImagesAndConfirm(listing);
      if (!imagesResult.attached) {
        return {
          ok: false,
          consumedImages: false,
          message: "Could not find the bazar.bg image upload input under #imgUpload."
        };
      }

      if (!imagesResult.confirmed) {
        return {
          ok: false,
          consumedImages: false,
          message: "Images were selected but bazar.bg did not confirm upload (#pics was not populated)."
        };
      }

      if (missingRequired.length) {
        return {
          ok: true,
          consumedImages: true,
          message: `Filled bazar.bg with required core data. Review category-specific fields: ${missingRequired.join(", ")}.`
        };
      }

      return {
        ok: true,
        consumedImages: true,
        message: "Filled bazar.bg form and confirmed image upload."
      };
    }
  });
})();
