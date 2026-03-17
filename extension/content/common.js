(function initializeContentBridge() {
  const API_BASE_URL = "http://localhost:3000";

  function queryFirst(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

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

  function setSelectValue(element, value, config = {}) {
    if (!(element instanceof HTMLSelectElement) || value == null || value === "") {
      return false;
    }

    const { dispatchEvents = false } = config;

    const normalizedValue = String(value).trim().toLowerCase();
    const selectOptions = Array.from(element.options);
    const option = selectOptions.find((item) => {
      return item.value.trim().toLowerCase() === normalizedValue
        || item.textContent?.trim().toLowerCase() === normalizedValue;
    });

    if (!option) {
      return false;
    }

    element.value = option.value;

    if (dispatchEvents) {
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      element.dispatchEvent(new Event("blur", { bubbles: true }));
    }

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

  async function attachListingImages(selectors, imageUrls) {
    if (!Array.isArray(imageUrls) || !imageUrls.length) {
      return true;
    }

    const input = queryFirst(selectors);

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

  function wait(delayMs) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, delayMs);
    });
  }

  const registry = [];

  globalThis.MultiPostContent = {
    registerMarketplaceAdapter(adapter) {
      registry.push(adapter);
    },
    findMarketplaceAdapter(rawUrl = window.location.href) {
      try {
        const url = new URL(rawUrl);
        return registry.find((adapter) => adapter.matches(url)) ?? null;
      } catch {
        return null;
      }
    },
    helpers: {
      attachListingImages,
      queryFirst,
      setSelectValue,
      setFieldValue,
      wait
    }
  };
})();
