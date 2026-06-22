function createWarningBadge(data) {
  const badge = document.createElement('div');
  badge.className = 'phishguard-alert-badge';
  const riskPercent = (data.risk_score * 100).toFixed(0);
  const topSignals = data.explanation
    ? data.explanation
        .filter(e => e.phrase !== "No strong phishing indicators found")
        .slice(0, 3)
        .map(e => `"${e.phrase}"`)
        .join(', ')
    : '';

  badge.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; font-weight: 700; font-size: 13px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">⚠️</span>
        <span>AJMAL's-PHISHING-GUARD: Critical Threat Detected</span>
      </div>
      <div style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 999px; font-size: 11px;">
        Risk Score: ${riskPercent}%
      </div>
    </div>
    ${topSignals ? `<div style="margin-top: 6px; font-size: 12px; color: #7f1d1d; line-height: 1.4;">
      <strong>Reasoning:</strong> Threat signals found: ${topSignals}.
    </div>` : ''}
    <div style="margin-top: 8px; font-size: 11px; color: #b91c1c; font-style: italic;">
      Caution: This message matches common phishing templates. Do not click links or reveal sensitive details.
    </div>
  `;

  badge.style.cssText = [
    'display:block',
    'margin-bottom:12px',
    'padding:12px 16px',
    'border-radius:12px',
    'background:#fef2f2',
    'border:1px solid #fee2e2',
    'color:#991b1b',
    'font-family:system-ui, -apple-system, sans-serif',
    'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  ].join(';');
  return badge;
}

async function scanVisibleEmailBlocks() {
  // Target specifically Gmail's email body containers (.a3s) for high efficiency
  const candidates = document.querySelectorAll('.a3s');
  for (const element of candidates) {
    const text = element.innerText?.trim();
    if (!text || text.length < 30) {
      continue;
    }

    // Check if we already scanned this exact text content on this DOM node
    if (element.dataset.phishguardScannedText === text) {
      continue;
    }
    
    // Mark text immediately to prevent parallel triggers while fetching
    element.dataset.phishguardScannedText = text;
    console.log("AJMAL's-PHISHING-GUARD: Scanning email body text (length:", text.length, ")");

    try {
      const response = await chrome.runtime.sendMessage({ type: 'PHISHGUARD_PREDICT', text });
      console.log("AJMAL's-PHISHING-GUARD: API response:", response);
      if (response?.ok && response.data?.prediction === 'phishing') {
        if (!element.dataset.phishguardFlagged) {
          element.dataset.phishguardFlagged = 'true';
          element.style.borderLeft = '4px solid #dc2626';
          element.style.paddingLeft = '16px';
          element.prepend(createWarningBadge(response.data));
        }
      } else {
        // If clean, clean up any previous warning styling/badges from recycled element
        if (element.dataset.phishguardFlagged) {
          element.removeAttribute('data-phishguard-flagged');
          element.style.borderLeft = '';
          element.style.paddingLeft = '';
          const existingBadge = element.querySelector('.phishguard-alert-badge');
          if (existingBadge) {
            existingBadge.remove();
          }
        }
      }
    } catch (err) {
      console.error("AJMAL's-PHISHING-GUARD: Message error:", err);
      // Revert scan status on error to allow retry on next loop
      element.removeAttribute('data-phishguard-scanned-text');
    }
  }
}

const observer = new MutationObserver(() => {
  clearTimeout(window.__phishguardTimer);
  window.__phishguardTimer = setTimeout(scanVisibleEmailBlocks, 1000);
});

observer.observe(document.documentElement, { childList: true, subtree: true });
scanVisibleEmailBlocks();

