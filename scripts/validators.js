/**
 * validators.js
 * Regex validation rules for the Student Finance Tracker.
 * Contains 4 standard + 1 advanced (back-reference) pattern.
 */
const Validators = (() => {
  // 1. Description: no leading/trailing spaces, collapse doubles
  const description = /^\S(?:.*\S)?$/;

  // 2. Amount: positive number, up to 2 decimal places
  const amount = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

  // 3. Date: strict YYYY-MM-DD
  const date = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  // 4. Category: letters, spaces, hyphens only
  const category = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

  // 5. Advanced: back-reference to catch duplicate consecutive words
  const duplicateWord = /\b(\w+)\s+\1\b/i;

  /**
   * Validate a value against a regex pattern.
   * @param {string} value - The input value to test.
   * @param {RegExp} pattern - The regex to test against.
   * @returns {boolean}
   */
  const test = (value, pattern) => pattern.test(value);

  return {
    description,
    amount,
    date,
    category,
    duplicateWord,
    test
  };
})();
