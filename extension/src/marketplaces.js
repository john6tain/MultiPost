export const MARKETPLACES = [
  {
    id: "olx",
    label: "OLX",
    origin: "https://www.olx.bg",
    pathPrefix: "/",
    supportsAutofill: true
  },
  {
    id: "facebook-marketplace",
    label: "Facebook Marketplace",
    origin: "https://www.facebook.com",
    pathPrefix: "/marketplace/",
    supportsAutofill: false
  },
  {
    id: "mobile-bg",
    label: "mobile.bg",
    origin: "https://www.mobile.bg",
    pathPrefix: "/",
    supportsAutofill: true
  },
  {
    id: "bazar-bg",
    label: "bazar.bg",
    origin: "https://bazar.bg",
    pathPrefix: "/",
    supportsAutofill: true
  }
];

export function findMarketplaceByUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    return MARKETPLACES.find((marketplace) => {
      return url.origin === marketplace.origin && url.pathname.startsWith(marketplace.pathPrefix);
    }) ?? null;
  } catch {
    return null;
  }
}

export function getAutofillMarketplaces() {
  return MARKETPLACES.filter((marketplace) => marketplace.supportsAutofill);
}

export function getAutofillMarketplaceNames() {
  return getAutofillMarketplaces().map((marketplace) => marketplace.label);
}
