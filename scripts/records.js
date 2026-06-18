/**
 * records.js
 * Renders the transaction table with sort, regex search, inline edit, and delete.
 */
document.addEventListener('DOMContentLoaded', () => {
  const tableBody   = document.getElementById('records-body');
  const searchInput = document.getElementById('search');
  const sortSelect  = document.getElementById('sort-select');
  const caseToggle  = document.getElementById('case-toggle');

  // Modal elements
  const deleteModal     = document.getElementById('delete-modal');
  const confirmDelBtn   = document.getElementById('confirm-delete');
  const cancelDelBtn    = document.getElementById('cancel-delete');

  let deleteTargetId = null;

  // ---------- Render ----------
  const render = () => {
    let records = Storage.load();

    // Regex search (respects case-insensitive toggle)
    const term  = searchInput.value.trim();
    const flags = caseToggle && caseToggle.checked ? 'i' : '';
    const re    = Search.compileRegex(term, flags);
    if (re) {
      records = records.filter(t =>
        re.test(t.description) || re.test(t.category)
      );
    }

    // Sort
    const sort = sortSelect.value;
    records.sort((a, b) => {
      switch (sort) {
        case 'date-desc':   return new Date(b.date) - new Date(a.date);
        case 'date-asc':    return new Date(a.date) - new Date(b.date);
        case 'amount-desc': return parseFloat(b.amount) - parseFloat(a.amount);
        case 'amount-asc':  return parseFloat(a.amount) - parseFloat(b.amount);
        case 'desc-asc':    return a.description.localeCompare(b.description);
        case 'desc-desc':   return b.description.localeCompare(a.description);
        default:            return 0;
      }
    });

    // Build rows
    tableBody.innerHTML = '';

    if (records.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">No records found.</td></tr>';
      return;
    }

    records.forEach(t => {
      const row = document.createElement('tr');
      row.dataset.id = t.id;

      const desc = Search.highlight(t.description, re);

      row.innerHTML =
        '<td data-label="Date">' + t.date + '</td>' +
        '<td data-label="Description">' + desc + '</td>' +
        '<td data-label="Category"><span class="badge">' + t.category + '</span></td>' +
        '<td data-label="Amount">' + Currency.format(t.amount) + '</td>' +
        '<td data-label="Actions">' +
          '<button class="btn-icon edit-btn" aria-label="Edit record">' +
            '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-3.5 1.5a.5.5 0 0 1-.65-.65l1.5-3.5a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 2L2 11.207V12h.793L13 2.793 11.207 2z"/></svg>' +
          '</button>' +
          '<button class="btn-icon delete-btn" style="color:var(--color-danger)" aria-label="Delete record">' +
            '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0v-6zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0v-6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h4a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>' +
          '</button>' +
        '</td>';

      tableBody.appendChild(row);
    });

    bindActions();
  };

  // ---------- Action Listeners ----------
  const bindActions = () => {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        deleteTargetId = e.target.closest('tr').dataset.id;
        deleteModal.classList.add('active');
        // Move focus into the modal for keyboard users
        cancelDelBtn.focus();
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        startEdit(e.target.closest('tr'));
      });
    });
  };

  // ---------- Delete Modal ----------
  if (confirmDelBtn) {
    confirmDelBtn.addEventListener('click', () => {
      if (deleteTargetId) {
        Storage.deleteTransaction(deleteTargetId);
        deleteModal.classList.remove('active');
        deleteTargetId = null;
        render();
        UI.showToast('Record deleted.');
      }
    });
  }

  if (cancelDelBtn) {
    cancelDelBtn.addEventListener('click', () => {
      deleteModal.classList.remove('active');
      deleteTargetId = null;
    });
  }

  // Close modal on backdrop
  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        deleteModal.classList.remove('active');
        deleteTargetId = null;
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteModal && deleteModal.classList.contains('active')) {
      deleteModal.classList.remove('active');
      deleteTargetId = null;
    }
  });

  // Focus trap: keep Tab cycling inside modal when open
  if (deleteModal) {
    deleteModal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = deleteModal.querySelectorAll('button');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // ---------- Inline Edit ----------
  const startEdit = (row) => {
    const id = row.dataset.id;
    const t  = Storage.load().find(r => r.id === id);
    if (!t) return;

    const cats = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];
    const options = cats.map(c =>
      '<option value="' + c + '"' + (t.category === c ? ' selected' : '') + '>' + c + '</option>'
    ).join('');

    row.innerHTML =
      '<td data-label="Date"><input type="date" class="form-input edit-date" value="' + t.date + '"></td>' +
      '<td data-label="Description"><input type="text" class="form-input edit-desc" value="' + t.description + '"></td>' +
      '<td data-label="Category"><select class="form-select edit-cat">' + options + '</select></td>' +
      '<td data-label="Amount"><input type="number" class="form-input edit-amount" value="' + t.amount + '" step="0.01" min="0"></td>' +
      '<td data-label="Actions">' +
        '<button class="btn-icon save-btn" style="color:var(--color-success)" aria-label="Save">' +
          '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>' +
        '</button>' +
        '<button class="btn-icon cancel-edit-btn" style="color:var(--color-danger)" aria-label="Cancel">' +
          '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>' +
        '</button>' +
      '</td>';

    row.querySelector('.save-btn').addEventListener('click', () => saveEdit(row, id));
    row.querySelector('.cancel-edit-btn').addEventListener('click', () => render());
  };

  const saveEdit = (row, id) => {
    const desc   = row.querySelector('.edit-desc').value;
    const amount = row.querySelector('.edit-amount').value;
    const date   = row.querySelector('.edit-date').value;
    const cat    = row.querySelector('.edit-cat').value;

    // Validate using Validators module
    if (!Validators.test(desc, Validators.description)) {
      alert('Invalid description (no leading/trailing spaces).');
      return;
    }
    if (Validators.test(desc, Validators.duplicateWord)) {
      alert('Duplicate consecutive words detected.');
      return;
    }
    if (!Validators.test(amount, Validators.amount)) {
      alert('Invalid amount. Use numbers like 12.50.');
      return;
    }
    if (!Validators.test(date, Validators.date)) {
      alert('Invalid date. Use YYYY-MM-DD format.');
      return;
    }

    Storage.updateTransaction(id, {
      description: desc,
      amount: parseFloat(amount).toFixed(2),
      date: date,
      category: cat
    });
    render();
    UI.showToast('Record updated.');
  };

  // ---------- Listeners ----------
  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);
  if (caseToggle) caseToggle.addEventListener('change', render);

  // Initial render
  render();
});
