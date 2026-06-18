/**
 * dashboard.js
 * Calculates stats and renders a pure CSS/JS 7-day bar chart.
 * No external chart libraries used.
 */
document.addEventListener('DOMContentLoaded', () => {
  const transactions = Storage.load();

  // --- Stat Elements ---
  const totalRecordsEl   = document.getElementById('total-records');
  const totalAmountEl    = document.getElementById('total-amount');
  const topCategoryEl    = document.getElementById('top-category');
  const budgetValueEl    = document.getElementById('budget-value');
  const budgetNoteEl     = document.getElementById('budget-note');
  const budgetCardEl     = document.getElementById('budget-card');
  const chartContainer   = document.getElementById('chart-bars');

  // --- 1. Total Records ---
  totalRecordsEl.textContent = transactions.length;

  // --- 2. Total Amount ---
  const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  totalAmountEl.textContent = Currency.format(totalAmount);

  // --- 3. Top Category ---
  const counts = {};
  transactions.forEach(t => {
    if (t.category) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
  });

  let topCat = '-';
  let topCount = 0;
  for (const [cat, n] of Object.entries(counts)) {
    if (n > topCount) { topCount = n; topCat = cat; }
  }
  topCategoryEl.textContent = topCat;

  // --- 4. Budget Status ---
  const budgetTarget = parseFloat(localStorage.getItem('budgetTarget') || 0);

  if (budgetTarget > 0) {
    const remaining = budgetTarget - totalAmount;
    const isOver = remaining < 0;

    budgetValueEl.textContent = Currency.format(Math.abs(remaining));

    if (isOver) {
      budgetNoteEl.textContent = 'Over budget!';
      budgetNoteEl.className = 'stat-note over-budget';
      // Assertive for over-budget warnings
      budgetCardEl.setAttribute('aria-live', 'assertive');
    } else {
      budgetNoteEl.textContent = 'Remaining';
      budgetNoteEl.className = 'stat-note under-budget';
      budgetCardEl.setAttribute('aria-live', 'polite');
    }
  } else {
    budgetValueEl.textContent = '-';
    budgetNoteEl.textContent = 'Set a target in Settings';
    budgetNoteEl.className = 'stat-note';
  }

  // --- 5. Last 7 Days Bar Chart (pure CSS/JS) ---
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7.push(d.toISOString().split('T')[0]);
  }

  const dailyTotals = last7.map(date =>
    transactions
      .filter(t => t.date === date)
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0)
  );

  const maxVal = Math.max(...dailyTotals, 1); // avoid division by zero

  chartContainer.innerHTML = '';
  last7.forEach((date, i) => {
    const pct = (dailyTotals[i] / maxVal) * 100;
    const label = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    const col = document.createElement('div');
    col.className = 'chart-col';

    const amountLabel = document.createElement('span');
    amountLabel.className = 'chart-amount';
    amountLabel.textContent = Currency.format(dailyTotals[i]);

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = pct + '%';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', label + ': ' + Currency.format(dailyTotals[i]));

    const dayLabel = document.createElement('span');
    dayLabel.className = 'chart-label';
    dayLabel.textContent = label;

    col.appendChild(amountLabel);
    col.appendChild(bar);
    col.appendChild(dayLabel);
    chartContainer.appendChild(col);
  });
});
