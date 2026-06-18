/**
 * add.js
 * Handles the Add New Transaction form with real-time regex validation.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('transaction-form');
  const descInput   = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const catInput    = document.getElementById('category');
  const dateInput   = document.getElementById('date');
  const formStatus  = document.getElementById('form-status');

  /**
   * Validate a single input against a regex.
   * Shows/hides the adjacent error message.
   * @param {HTMLElement} input
   * @param {RegExp} regex
   * @param {string} [customMsg] - Override message for the error element.
   * @returns {boolean}
   */
  const validateField = (input, regex, customMsg) => {
    const errorEl = input.parentElement.querySelector('.form-error-msg');
    const value   = input.value;
    let valid     = Validators.test(value, regex);

    // Advanced check: duplicate consecutive words in description
    if (valid && input === descInput && Validators.test(value, Validators.duplicateWord)) {
      valid = false;
      if (errorEl) errorEl.textContent = 'Duplicate consecutive words detected (e.g. "Lunch Lunch").';
    } else if (errorEl && customMsg) {
      errorEl.textContent = customMsg;
    }

    if (valid) {
      input.classList.remove('invalid');
      input.setAttribute('aria-invalid', 'false');
      if (errorEl) errorEl.style.display = 'none';
    } else {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.style.display = 'block';
    }
    return valid;
  };

  // ---------- Form Submit ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const v1 = validateField(descInput, Validators.description, 'No leading/trailing spaces allowed.');
    const v2 = validateField(amountInput, Validators.amount, 'Enter a valid positive number (e.g. 12.50).');
    const v3 = validateField(catInput, Validators.category, 'Select a valid category.');
    const v4 = validateField(dateInput, Validators.date, 'Use YYYY-MM-DD format.');

    if (v1 && v2 && v3 && v4) {
      Storage.addTransaction({
        id: 'txn_' + Date.now(),
        description: descInput.value.trim(),
        amount: parseFloat(amountInput.value).toFixed(2),
        category: catInput.value,
        date: dateInput.value
      });

      form.reset();
      // Announce success to screen readers
      formStatus.textContent = 'Transaction saved successfully!';
      UI.showToast('Transaction added!');
    } else {
      formStatus.textContent = 'Please fix the errors above.';
    }
  });

  // ---------- Real-time Validation ----------
  descInput.addEventListener('input', () =>
    validateField(descInput, Validators.description, 'No leading/trailing spaces allowed.')
  );
  amountInput.addEventListener('input', () =>
    validateField(amountInput, Validators.amount, 'Enter a valid positive number.')
  );
  catInput.addEventListener('change', () =>
    validateField(catInput, Validators.category, 'Select a valid category.')
  );
  dateInput.addEventListener('change', () =>
    validateField(dateInput, Validators.date, 'Use YYYY-MM-DD format.')
  );
});
