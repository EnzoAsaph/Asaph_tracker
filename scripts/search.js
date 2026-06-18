/**
 * search.js
 * Safe regex compiler and match highlighter for live search.
 */
const Search = (() => {
  /**
   * Safely compile a user-typed regex string.
   * Returns null if the input is empty or invalid.
   * @param {string} input - Raw user input.
   * @param {string} flags - Regex flags (default: 'i' for case-insensitive).
   * @returns {RegExp|null}
   */
  const compileRegex = (input, flags = 'i') => {
    try {
      return input ? new RegExp(input, flags) : null;
    } catch (e) {
      return null;
    }
  };

  /**
   * Wrap regex matches in <mark> tags for accessible highlighting.
   * Returns original text if no regex is provided.
   * @param {string} text - The source text.
   * @param {RegExp} re - Compiled regex.
   * @returns {string} HTML string with <mark> highlights.
   */
  const highlight = (text, re) => {
    if (!re) return text;
    return String(text).replace(re, match => `<mark>${match}</mark>`);
  };

  return { compileRegex, highlight };
})();
