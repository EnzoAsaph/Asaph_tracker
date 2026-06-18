/**
 * ui.js
 * Handles shared UI behaviour: mobile menu, theme, toast notifications.
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Menu Toggle ---
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open');
    });
  }

  // --- Theme: apply saved preference on every page ---
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
});

/**
 * UI Utilities (global)
 */
const UI = (() => {
  /**
   * Display a toast notification.
   * @param {string} message
   */
  const showToast = (message) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = message;
    document.body.appendChild(el);

    // Trigger enter animation
    requestAnimationFrame(() => el.classList.add('visible'));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => el.remove(), 300);
    }, 3000);
  };

  return { showToast };
})();
