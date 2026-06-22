function createWarningBadge() {
  const badge = document.createElement('div');
  badge.textContent = 'PhishGuard AI warning';
  badge.style.cssText = [
    'display:inline-flex',
    'align-items:center',
    'gap:8px',
    'margin-bottom:8px',
    'padding:6px 10px',
    'border-radius:999px',
    'background:#fee2e2',
    'color:#991b1b',
    'font:600 12px/1.2 system-ui',
  ].join(';');
  return badge;
}

async function scanVisibleEmailBlocks() {
  const candidates = document.querySelectorAll('[role="main"] div, .a3s, .gmail_quote');
  for (const element of candidates) {
    const text = element.innerText?.trim();
    if (!text || text.length < 30) {
      continue;
    }
    const response = await chrome.runtime.sendMessage({ type: 'PHISHGUARD_PREDICT', text });
    if (response?.ok && response.data?.prediction === 'phishing' && !element.dataset.phishguardFlagged) {
      element.dataset.phishguardFlagged = 'true';
      element.style.borderLeft = '4px solid #dc2626';
      element.prepend(createWarningBadge());
    }
  }
}

const observer = new MutationObserver(() => {
  clearTimeout(window.__phishguardTimer);
  window.__phishguardTimer = setTimeout(scanVisibleEmailBlocks, 1200);
});

observer.observe(document.documentElement, { childList: true, subtree: true });
scanVisibleEmailBlocks();
