(function registerBazarBgMarketplaceAdapter() {
  const { registerMarketplaceAdapter, helpers } = globalThis.MultiPostContent;

  const IMAGE_SELECTORS = [
    'input[type="file"][accept*="image"]',
    'input[type="file"][multiple]',
    'input[type="file"]'
  ];

  const CATEGORY_LABELS = ["Рубрика", "Категория"];
  const SUBCATEGORY_LABELS = ["Подрубрика", "Подкатегория"];
  const LEAF_CATEGORY_LABELS = ["Марка", "Подкатегория"];

  const SCHEMA_FIELDS = {
    generic_goods: [
      { name: "title", labels: ["Заглавие"], required: true },
      { name: "description", labels: ["Описание"], required: true, multiline: true },
      { name: "price", labels: ["Цена"], required: true },
      { name: "condition", labels: ["Състояние"] },
      { name: "delivery", labels: ["Доставка"] },
      { name: "kind", labels: ["Вид"] },
      { name: "location", labels: ["Локация", "Населено място", "Град"], required: true },
      { name: "phone", labels: ["Телефон", "Телефон за връзка"] }
    ],
    auto_accessories: [
      { name: "title", labels: ["Заглавие"], required: true },
      { name: "description", labels: ["Описание"], required: true, multiline: true },
      { name: "price", labels: ["Цена"], required: true },
      { name: "condition", labels: ["Състояние"] },
      { name: "vehicleType", labels: ["Тип мпс"], required: true },
      { name: "accessoryType", labels: ["Aксесоар", "Аксесоар"], required: true },
      { name: "location", labels: ["Локация", "Населено място", "Град"], required: true },
      { name: "phone", labels: ["Телефон", "Телефон за връзка"] }
    ],
    real_estate: [
      { name: "title", labels: ["Заглавие"], required: true },
      { name: "description", labels: ["Описание"], required: true, multiline: true },
      { name: "price", labels: ["Цена"], required: true },
      { name: "location", labels: ["Локация", "Населено място", "Град"], required: true },
      { name: "phone", labels: ["Телефон", "Телефон за връзка"] },
      { name: "dealType", labels: ["Тип сделка"], required: true },
      { name: "propertyType", labels: ["Тип апартамент", "Тип имот"], required: true },
      { name: "areaSqm", labels: ["Квадратура"], required: true },
      { name: "constructionType", labels: ["Вид строителство"] },
      { name: "floor", labels: ["Eтаж", "Етаж"] },
      { name: "year", labels: ["Година"] }
    ],
    jobs_services: [
      { name: "title", labels: ["Заглавие"], required: true },
      { name: "description", labels: ["Описание"], required: true, multiline: true },
      { name: "salary_or_price", labels: ["Заплата", "Цена"] },
      { name: "location", labels: ["Локация", "Населено място", "Град"], required: true },
      { name: "phone", labels: ["Телефон", "Телефон за връзка"] }
    ]
  };

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function isVisible(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function isFormControl(element) {
    return element instanceof HTMLInputElement
      || element instanceof HTMLTextAreaElement
      || element instanceof HTMLSelectElement;
  }

  function findControlInside(element) {
    if (!element) {
      return null;
    }

    if (isFormControl(element)) {
      return element;
    }

    return element.querySelector("input, textarea, select");
  }

  function findNearbyControl(labelElement) {
    if (!labelElement) {
      return null;
    }

    if (labelElement instanceof HTMLLabelElement && labelElement.htmlFor) {
      const target = document.getElementById(labelElement.htmlFor);
      if (isFormControl(target)) {
        return target;
      }
    }

    const nested = findControlInside(labelElement);
    if (nested) {
      return nested;
    }

    let current = labelElement.nextElementSibling;
    while (current) {
      const control = findControlInside(current);
      if (control) {
        return control;
      }
      current = current.nextElementSibling;
    }

    const row = labelElement.closest("div, li, td, th, section");
    if (row) {
      const control = row.querySelector("input, textarea, select");
      if (control) {
        return control;
      }
    }

    return null;
  }

  function findControlByLabels(labels) {
    const candidates = Array.from(document.querySelectorAll("label, span, div, p, strong, td, th"))
      .filter((element) => isVisible(element))
      .filter((element) => {
        const text = normalizeText(element.textContent);
        return labels.some((label) => text.includes(normalizeText(label)));
      });

    for (const candidate of candidates) {
      const control = findNearbyControl(candidate);
      if (control) {
        return control;
      }
    }

    return null;
  }

  function setControlValue(control, value) {
    if (!control || value == null || value === "") {
      return false;
    }

    if (control instanceof HTMLSelectElement) {
      return helpers.setSelectValue(control, value, { dispatchEvents: true });
    }

    return helpers.setFieldValue(control, value);
  }

  function clickCategoryAnchor(columnId, categoryId) {
    if (!categoryId) {
      return false;
    }

    const anchor = document.querySelector(`#${columnId} a[data-id="${categoryId}"]`);
    if (!(anchor instanceof HTMLElement)) {
      return false;
    }

    anchor.click();
    return true;
  }

  function getFieldValue(listing, bazarData, fieldName) {
    const explicitValue = bazarData?.fields?.[fieldName];
    if (explicitValue) {
      return explicitValue;
    }

    switch (fieldName) {
      case "title":
        return listing.title || "";
      case "description":
        return listing.description || "";
      case "price":
      case "salary_or_price":
        return listing.price != null ? String(listing.price) : "";
      case "location":
        return listing.location || "";
      default:
        return "";
    }
  }

  async function fillCategoryFields(bazarData) {
    if (!bazarData) {
      return;
    }

    if (clickCategoryAnchor("colMain", bazarData.topLevelCategoryId)) {
      await helpers.wait(400);
    } else {
      const categoryControl = findControlByLabels(CATEGORY_LABELS);
      if (categoryControl && bazarData.topLevelCategory) {
        setControlValue(categoryControl, bazarData.topLevelCategory);
        await helpers.wait(500);
      }
    }

    if (clickCategoryAnchor("colRub", bazarData.subcategoryId)) {
      await helpers.wait(400);
    } else {
      const subcategoryControl = findControlByLabels(SUBCATEGORY_LABELS);
      if (subcategoryControl && bazarData.subcategory) {
        setControlValue(subcategoryControl, bazarData.subcategory);
        await helpers.wait(500);
      }
    }

    if (clickCategoryAnchor("colSub", bazarData.leafCategoryId)) {
      await helpers.wait(400);
      return;
    }

    const leafCategoryControl = findControlByLabels(LEAF_CATEGORY_LABELS);
    if (leafCategoryControl && bazarData.leafCategory) {
      setControlValue(leafCategoryControl, bazarData.leafCategory);
      await helpers.wait(500);
    }
  }

  registerMarketplaceAdapter({
    id: "bazar-bg",
    label: "bazar.bg",
    matches(url) {
      return url.origin === "https://bazar.bg";
    },
    async fill(listing) {
      if (window.location.pathname.startsWith("/user/login")) {
        return {
          ok: false,
          consumedImages: false,
          message: "Log in to bazar.bg first, then open the posting form."
        };
      }

      const bazarData = listing.marketplaceData?.bazarBg;
      const schemaKey = bazarData?.schemaKey || "generic_goods";
      const schemaFields = SCHEMA_FIELDS[schemaKey] ?? SCHEMA_FIELDS.generic_goods;

      await fillCategoryFields(bazarData);

      const missingRequired = [];

      for (const field of schemaFields) {
        const value = getFieldValue(listing, bazarData, field.name);
        if (!value) {
          if (field.required) {
            missingRequired.push(field.labels[0]);
          }
          continue;
        }

        const control = findControlByLabels(field.labels);
        if (!control) {
          if (field.required) {
            missingRequired.push(field.labels[0]);
          }
          continue;
        }

        setControlValue(control, value);

        if (field.name === "title" || field.name === "description") {
          await helpers.wait(100);
        }
      }

      const imagesAttached = await helpers.attachListingImages(IMAGE_SELECTORS, listing.images);
      const titleControl = findControlByLabels(["Заглавие"]);

      if (!titleControl) {
        return {
          ok: false,
          consumedImages: false,
          message: "Could not find the bazar.bg posting form fields on this page."
        };
      }

      if (missingRequired.length) {
        return {
          ok: true,
          consumedImages: imagesAttached,
          message: `Filled bazar.bg best-effort. Review required fields manually: ${missingRequired.join(", ")}.`
        };
      }

      return {
        ok: true,
        consumedImages: imagesAttached,
        message: imagesAttached
          ? "Filled the bazar.bg form and attached images where possible."
          : "Filled the bazar.bg form. If images are still missing, use the live uploader manually."
      };
    }
  });
})();
