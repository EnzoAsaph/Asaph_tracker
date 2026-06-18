/**
 * storage.js
 * Handles all localStorage interactions for transactions.
 * Provides CRUD, import/export, and data-healing utilities.
 */
const Storage = (() => {
  const KEY = 'finance_tracker_transactions';

  /**
   * Load all transactions from localStorage.
   * Heals records that are missing an id.
   * @returns {Array} Array of transaction objects.
   */
  const load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : [];

      // Data healing: assign IDs to any records missing one
      let healed = false;
      const fixed = data.map((t, i) => {
        if (!t.id) {
          t.id = 'txn_healed_' + Date.now() + '_' + i;
          healed = true;
        }
        return t;
      });

      if (healed) {
        localStorage.setItem(KEY, JSON.stringify(fixed));
      }
      return fixed;
    } catch (e) {
      return [];
    }
  };

  /**
   * Save full transactions array to localStorage.
   * @param {Array} data
   */
  const save = (data) => {
    localStorage.setItem(KEY, JSON.stringify(data));
  };

  /**
   * Add a new transaction.
   * @param {Object} record - Must include description, amount, category, date.
   */
  const addTransaction = (record) => {
    const all = load();
    const now = new Date().toISOString();
    all.push({
      ...record,
      createdAt: now,
      updatedAt: now
    });
    save(all);
  };

  /**
   * Update an existing transaction by id.
   * @param {string} id
   * @param {Object} updates - Fields to merge.
   */
  const updateTransaction = (id, updates) => {
    const all = load();
    const now = new Date().toISOString();
    const updated = all.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: now } : t
    );
    save(updated);
  };

  /**
   * Delete a transaction by id.
   * @param {string} id
   */
  const deleteTransaction = (id) => {
    const all = load().filter(t => t.id !== id);
    save(all);
  };

  /** Clear all transaction data. */
  const clearAll = () => {
    localStorage.removeItem(KEY);
  };

  /**
   * Export transactions as a JSON string.
   * @returns {string}
   */
  const exportData = () => {
    return JSON.stringify({
      transactions: load(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  };

  /**
   * Import transactions from a parsed JSON object.
   * Validates structure before merging.
   * @param {Object} json - Expected shape: { transactions: [...] }
   * @returns {{ success: boolean, count?: number, error?: string }}
   */
  const importData = (json) => {
    try {
      if (!json || !Array.isArray(json.transactions)) {
        throw new Error('Invalid format: expected a "transactions" array.');
      }

      const valid = json.transactions.every(t =>
        t.id && t.description && t.amount !== undefined && t.category && t.date
      );

      if (!valid) {
        throw new Error('Some records are missing required fields.');
      }

      // Merge: skip duplicates by id
      const current = load();
      const existingIds = new Set(current.map(t => t.id));
      const incoming = json.transactions.filter(t => !existingIds.has(t.id));
      const merged = [...current, ...incoming];
      save(merged);

      return { success: true, count: merged.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return {
    load,
    save,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAll,
    exportData,
    importData
  };
})();
