const SUPPORTED_RULES = [
  {
    origin: "https://www.olx.bg",
    pathPrefix: "/"
  },
  {
    origin: "https://www.facebook.com",
    pathPrefix: "/marketplace/"
  },
  {
    origin: "https://www.mobile.bg",
    pathPrefix: "/"
  }
];

function isSupportedUrl(rawUrl) {
  if (!rawUrl) {
    return false;
  }

  try {
    const url = new URL(rawUrl);
    return SUPPORTED_RULES.some((rule) => {
      return url.origin === rule.origin && url.pathname.startsWith(rule.pathPrefix);
    });
  } catch {
    return false;
  }
}

async function setTabState(tabId, isSupported) {
  await chrome.action.setBadgeBackgroundColor({
    tabId,
    color: isSupported ? "#16a34a" : "#6b7280"
  });

  await chrome.action.setBadgeText({
    tabId,
    text: isSupported ? "on" : "off"
  });
}

async function updateTabState(tabId, rawUrl) {
  if (typeof tabId !== "number") {
    return;
  }

  await setTabState(tabId, isSupportedUrl(rawUrl));
}

async function refreshTabState(tabId) {
  if (typeof tabId !== "number") {
    return;
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    await updateTabState(tab.id, tab.url);
  } catch {
    await setTabState(tabId, false);
  }
}

async function refreshActiveTabState() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (tab?.id) {
    await updateTabState(tab.id, tab.url);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  refreshActiveTabState();
});

chrome.runtime.onStartup.addListener(() => {
  refreshActiveTabState();
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  refreshTabState(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (typeof changeInfo.url === "string" || changeInfo.status === "complete") {
    updateTabState(tabId, changeInfo.url ?? tab.url);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    refreshActiveTabState();
  }
});
