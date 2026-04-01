(function registerFacebookMarketplaceAdapter() {
  const { registerMarketplaceAdapter, helpers } = globalThis.MultiPostContent;

  const WAIT_TIMEOUT_MS = 12000;
  const WAIT_INTERVAL_MS = 150;
  const CREATE_PATH_HINTS = ["/marketplace/create", "/marketplace/you/selling"];

  const IMAGE_SELECTORS = [
    '[role="form"][aria-label="Marketplace"] input[type="file"][multiple][accept*="image"]',
    '[role="main"] input[type="file"][multiple][accept*="image"]',
    'input[type="file"][multiple][accept*="image"]',
    'input[type="file"][accept*="image/heic"]'
  ];

  const FIELD_LABELS = {
    title: ["title", "zaglavie", "zaglav", "заглавие", "заглав"],
    price: ["price", "cena", "цена"],
    description: ["description", "details", "opisanie", "описание", "детайли"]
  };

  const CATEGORY_LABELS = ["category", "kategoriya", "категория"];
  const EXCLUDED_LABEL_HINTS = ["search", "търс", "find", "chat"];

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function isVisible(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return styles.display !== "none" && styles.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }

  function getMarketplaceFormRoot() {
    return document.querySelector('[role="form"][aria-label="Marketplace"]')
      || document.querySelector('[role="main"]')
      || document.body;
  }

  function isInExcludedUi(element) {
    if (!(element instanceof Element)) {
      return true;
    }

    return Boolean(
      element.closest("header")
      || element.closest("nav")
      || element.closest('[role="navigation"]')
      || element.closest('[aria-label*="Search"]')
      || element.closest('[aria-label*="search"]')
      || element.closest('[aria-label*="Търс"]')
      || element.closest('[aria-label*="търс"]')
    );
  }

  function setEditableFieldValue(element, value) {
    if (!element) {
      return false;
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      return helpers.setFieldValue(element, value);
    }

    if (element instanceof HTMLElement && (element.isContentEditable || element.getAttribute("role") === "textbox")) {
      element.focus();
      element.textContent = value;
      element.dispatchEvent(new InputEvent("beforeinput", {
        bubbles: true,
        data: value,
        inputType: "insertText"
      }));
      element.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        data: value,
        inputType: "insertText"
      }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      element.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }

    return false;
  }

  function findControlInsideLabel(label) {
    return label.querySelector(
      'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, div[role="textbox"], div[contenteditable="true"]'
    );
  }

  function findByLabel(field, taken) {
    const root = getMarketplaceFormRoot();
    const labels = Array.from(root.querySelectorAll("label"));
    const wanted = FIELD_LABELS[field];

    for (const label of labels) {
      if (!(label instanceof HTMLElement) || !isVisible(label) || isInExcludedUi(label)) {
        continue;
      }

      const labelText = normalize(label.textContent);
      if (!labelText) {
        continue;
      }

      if (EXCLUDED_LABEL_HINTS.some((hint) => labelText.includes(hint))) {
        continue;
      }

      if (!wanted.some((keyword) => labelText.includes(keyword))) {
        continue;
      }

      const control = findControlInsideLabel(label);
      if (!control || taken.has(control) || !isVisible(control)) {
        continue;
      }

      if (field === "title" && control instanceof HTMLInputElement && control.type === "search") {
        continue;
      }

      if (field === "price" && control instanceof HTMLInputElement) {
        const meta = normalize(
          `${control.getAttribute("aria-label") || ""} ${control.getAttribute("placeholder") || ""}`
        );
        if (meta.includes("search") || meta.includes("търс")) {
          continue;
        }
      }

      return control;
    }

    return null;
  }

  function findByFallbackSelectors(field, taken) {
    const root = getMarketplaceFormRoot();

    if (field === "title") {
      const candidates = root.querySelectorAll(
        'input[aria-label*="Title"], input[placeholder*="Title"], input[aria-label*="Заглав"], input[placeholder*="Заглав"], input[name="title"]'
      );
      for (const candidate of candidates) {
        if (taken.has(candidate) || !isVisible(candidate) || isInExcludedUi(candidate)) {
          continue;
        }
        return candidate;
      }
    }

    if (field === "price") {
      const candidates = root.querySelectorAll(
        'input[aria-label*="Price"], input[placeholder*="Price"], input[aria-label*="Цена"], input[placeholder*="Цена"], input[name="price"]'
      );
      for (const candidate of candidates) {
        if (taken.has(candidate) || !isVisible(candidate) || isInExcludedUi(candidate)) {
          continue;
        }
        return candidate;
      }
    }

    if (field === "description") {
      const candidates = root.querySelectorAll(
        'textarea[aria-label*="Description"], textarea[placeholder*="Description"], textarea[aria-label*="Описание"], textarea[placeholder*="Описание"], div[role="textbox"][aria-label*="Description"], div[role="textbox"][aria-label*="Описание"], div[contenteditable="true"][aria-label*="Description"], div[contenteditable="true"][aria-label*="Описание"]'
      );
      for (const candidate of candidates) {
        if (taken.has(candidate) || !isVisible(candidate) || isInExcludedUi(candidate)) {
          continue;
        }
        return candidate;
      }
    }

    return null;
  }

  async function resolveFields() {
    const startedAt = Date.now();

    while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
      const taken = new Set();

      const title = findByLabel("title", taken) || findByFallbackSelectors("title", taken);
      if (title) {
        taken.add(title);
      }

      const price = findByLabel("price", taken) || findByFallbackSelectors("price", taken);
      if (price) {
        taken.add(price);
      }

      const description = findByLabel("description", taken) || findByFallbackSelectors("description", taken);

      if (title) {
        return { title, price, description };
      }

      await helpers.wait(WAIT_INTERVAL_MS);
    }

    return { title: null, price: null, description: null };
  }

  function findCategoryCombobox() {
    const root = getMarketplaceFormRoot();
    const labels = Array.from(root.querySelectorAll('label[role="combobox"], label'));

    for (const label of labels) {
      if (!(label instanceof HTMLElement) || !isVisible(label) || isInExcludedUi(label)) {
        continue;
      }

      const text = normalize(label.textContent);
      if (!CATEGORY_LABELS.some((keyword) => text.includes(keyword))) {
        continue;
      }

      const combobox = label.getAttribute("role") === "combobox"
        ? label
        : label.querySelector('[role="combobox"]');

      if (combobox instanceof HTMLElement && isVisible(combobox)) {
        return combobox;
      }

      const clickable = label.querySelector('[aria-haspopup="listbox"], [aria-expanded], [tabindex]');
      if (clickable instanceof HTMLElement && isVisible(clickable)) {
        return clickable;
      }
    }

    return null;
  }

  function getTextContent(element) {
    return normalize(element?.textContent || "");
  }

  function scoreCategoryOption(categoryText, optionText) {
    if (!categoryText || !optionText) {
      return 0;
    }

    if (optionText === categoryText) {
      return 100;
    }

    if (optionText.includes(categoryText) || categoryText.includes(optionText)) {
      return 80;
    }

    const terms = categoryText.split(/\s+/).filter(Boolean);
    let score = 0;
    terms.forEach((term) => {
      if (optionText.includes(term)) {
        score += 10;
      }
    });

    return score;
  }

  function getVisibleCategoryOptions() {
    const options = Array.from(document.querySelectorAll(
      '[role="option"], [role="menuitem"], [role="listbox"] [tabindex], [role="dialog"] [tabindex]'
    ));

    return options.filter((option) => {
      if (!(option instanceof HTMLElement) || !isVisible(option)) {
        return false;
      }

      const text = getTextContent(option);
      if (!text || text.length > 120) {
        return false;
      }

      if (EXCLUDED_LABEL_HINTS.some((hint) => text.includes(hint))) {
        return false;
      }

      return true;
    });
  }

  async function fillCategory(categoryValue) {
    const normalizedCategory = normalize(categoryValue);
    if (!normalizedCategory) {
      return { attempted: false, matched: false };
    }

    const combobox = findCategoryCombobox();
    if (!combobox) {
      return { attempted: true, matched: false };
    }

    combobox.click();
    await helpers.wait(250);

    const startedAt = Date.now();
    while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
      const options = getVisibleCategoryOptions();
      if (options.length) {
        let best = null;
        let bestScore = 0;

        options.forEach((option) => {
          const optionText = getTextContent(option);
          const score = scoreCategoryOption(normalizedCategory, optionText);
          if (score > bestScore) {
            best = option;
            bestScore = score;
          }
        });

        if (best && bestScore >= 10) {
          best.click();
          await helpers.wait(200);
          return { attempted: true, matched: true };
        }
      }

      await helpers.wait(WAIT_INTERVAL_MS);
    }

    return { attempted: true, matched: false };
  }

  function clickAddPhotosTrigger() {
    const root = getMarketplaceFormRoot();
    const candidates = Array.from(root.querySelectorAll('label, [role="button"], div, span'));
    const trigger = candidates.find((node) => {
      if (!(node instanceof HTMLElement) || !isVisible(node)) {
        return false;
      }

      const text = normalize(node.textContent);
      return text.includes("add photos") || text.includes("добави снимки");
    });

    if (trigger instanceof HTMLElement) {
      trigger.click();
      return true;
    }

    return false;
  }

  function looksLikeCreateFlow(pathname) {
    return CREATE_PATH_HINTS.some((prefix) => pathname.startsWith(prefix));
  }

  registerMarketplaceAdapter({
    id: "facebookmarketplace",
    label: "Facebook Marketplace",
    matches(url) {
      return url.origin === "https://www.facebook.com" && url.pathname.startsWith("/marketplace/");
    },
    async fill(listing, context = {}) {
      const { imagesOnly = false } = context;

      if (imagesOnly) {
        return {
          ok: false,
          consumedImages: false,
          message: "Upload Images is available only on mobile.bg."
        };
      }

      if (!window.location.pathname.startsWith("/marketplace/")) {
        return {
          ok: false,
          consumedImages: false,
          message: "Open the Facebook Marketplace create listing page before using Fill Form."
        };
      }

      const fields = await resolveFields();
      const titleFilled = setEditableFieldValue(fields.title, listing.title || "");

      if (!titleFilled) {
        return {
          ok: false,
          consumedImages: false,
          message: looksLikeCreateFlow(window.location.pathname)
            ? "Could not find the Facebook Marketplace title field."
            : "Open the Facebook Marketplace create listing page before using Fill Form."
        };
      }

      setEditableFieldValue(fields.price, listing.price != null ? String(listing.price) : "");
      setEditableFieldValue(fields.description, listing.description || "");
      const facebookCategory = listing.marketplaceData?.facebookMarketplace?.category || listing.category || "";
      const categoryResult = await fillCategory(facebookCategory);

      const hasImages = Array.isArray(listing.images) && listing.images.length > 0;
      let imagesAttached = false;

      if (hasImages) {
        imagesAttached = await helpers.attachListingImages(IMAGE_SELECTORS, listing.images);

        if (!imagesAttached) {
          clickAddPhotosTrigger();
          await helpers.wait(250);
          imagesAttached = await helpers.attachListingImages(IMAGE_SELECTORS, listing.images);
        }
      }

      if (hasImages && !imagesAttached) {
        return {
          ok: false,
          consumedImages: false,
          message: "Could not find the Facebook Marketplace image upload input."
        };
      }

      return {
        ok: true,
        consumedImages: imagesAttached,
        message: categoryResult.attempted && !categoryResult.matched
          ? "Filled title/price/description, but category was not matched automatically."
          : undefined
      };
    }
  });
})();
