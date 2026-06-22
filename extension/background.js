const DEFAULT_API_URL = 'http://localhost:5000';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiBaseUrl'], (result) => {
    if (!result.apiBaseUrl) {
      chrome.storage.sync.set({ apiBaseUrl: DEFAULT_API_URL });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'PHISHGUARD_PREDICT') {
    return false;
  }

  chrome.storage.sync.get(['apiBaseUrl'], async (result) => {
    const apiBaseUrl = result.apiBaseUrl || DEFAULT_API_URL;
    try {
      const response = await fetch(`${apiBaseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.text }),
      });
      const data = await response.json();
      sendResponse({ ok: true, data });
    } catch (error) {
      sendResponse({ ok: false, error: error?.message || 'Request failed' });
    }
  });

  return true;
});
