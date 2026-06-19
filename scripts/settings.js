/**
 * settings.js
 * Currency utility (available on all pages) and settings page controls.
 */

/**
 * Currency Utility
 * Base currency is USD. Manual mock exchange rates (no API).
 */
const Currency = (() => {
  const rates  = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.12 };
  const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

  const getCurrency = () => localStorage.getItem('currency') || 'USD';
  const getSymbol   = () => symbols[getCurrency()] || '$';

  /**
   * Format a numeric amount in the user's chosen currency.
   * @param {number|string} amount - Amount in base currency (USD).
   * @returns {string}
   */
  const format = (amount) => {
    const code = getCurrency();
    const rate = rates[code] || 1;
    const converted = (parseFloat(amount) * rate).toFixed(2);
    return symbols[code] + converted;
  };

  return { format, getSymbol, getCurrency };
})();

/* ---- Settings page logic (runs only if elements exist) ---- */
document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle ---
  const themeBtn  = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  if (themeBtn && themeIcon) {
    const setIcon = (t) => { themeIcon.textContent = t === 'light' ? '☀️' : '🌙'; };
    setIcon(localStorage.getItem('theme') || 'light');

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      setIcon(next);
    });
  }

  // --- Currency Select ---
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.value = localStorage.getItem('currency') || 'USD';
    currencySelect.addEventListener('change', (e) => {
      localStorage.setItem('currency', e.target.value);
      UI.showToast('Currency set to ' + e.target.value);
    });
  }

  // --- Budget Target ---
  const budgetInput = document.getElementById('budget-target');
  if (budgetInput) {
    budgetInput.value = localStorage.getItem('budgetTarget') || '';
    // Debounced save with toast feedback
    let budgetTimeout = null;
    budgetInput.addEventListener('input', (e) => {
      localStorage.setItem('budgetTarget', e.target.value);
      clearTimeout(budgetTimeout);
      budgetTimeout = setTimeout(() => {
        if (e.target.value) {
          UI.showToast('Budget target saved');
        }
      }, 600);
    });
  }

  // --- Export ---
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const blob = new Blob([Storage.exportData()], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'financial_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      UI.showToast('Data exported!');
    });
  }

  // --- Import ---
  const importBtn  = document.getElementById('import-btn');
  const fileInput   = document.getElementById('import-file');

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json   = JSON.parse(ev.target.result);
          const result = Storage.importData(json);

          if (result.success) {
            UI.showToast('Imported ' + result.count + ' records!');
            setTimeout(() => location.reload(), 1000);
          } else {
            alert('Import failed: ' + result.error);
          }
        } catch (err) {
          alert('Error: could not parse JSON file.');
        }
      };
      reader.readAsText(file);
      // Reset so the same file can be re-imported
      fileInput.value = '';
    });
  }

  // --- Clear All Data ---
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Build confirmation modal dynamically
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal-content">
          <h3 class="modal-title">Clear All Data?</h3>
          <p class="modal-body">This will permanently delete all transactions. This cannot be undone.</p>
          <div class="modal-footer">
            <button class="btn" id="clear-cancel">Cancel</button>
            <button class="btn btn-danger" id="clear-confirm">Delete Everything</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      const cancelBtn = overlay.querySelector('#clear-cancel');
      const confirmBtn = overlay.querySelector('#clear-confirm');

      cancelBtn.addEventListener('click', () => overlay.remove());
      confirmBtn.addEventListener('click', () => {
        Storage.clearAll();
        overlay.remove();
        UI.showToast('All data cleared.');
        setTimeout(() => location.reload(), 800);
      });
      // Close on backdrop click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      // Close on Escape
      const escHandler = (e) => {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
      };
      document.addEventListener('keydown', escHandler);
      // Focus trap
      overlay.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === cancelBtn) { e.preventDefault(); confirmBtn.focus(); }
        } else {
          if (document.activeElement === confirmBtn) { e.preventDefault(); cancelBtn.focus(); }
        }
      });
      // Move focus into modal
      cancelBtn.focus();
    });
  }
});
