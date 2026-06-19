# Student Finance Tracker

A responsive, accessible, privacy-focused web application for managing student finances. Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks or external libraries.

**Theme:** Student Finance Tracker

## Live Demo

https://EnzoAsaph.github.io/Asaph_tracker/

## Demo Video

*(Link will be added after recording)*

---

## Features

- **Dashboard** — Total records, total spent, top category, budget status, and a 7-day spending trend bar chart (pure CSS/JS).
- **Transaction Records** — Searchable, sortable table with inline editing and delete confirmation.
- **Add New** — Form with real-time regex validation and ARIA live feedback.
- **Settings** — Dark/light theme toggle, currency selector (USD/EUR/GBP/JPY with mock rates), monthly budget target, JSON import/export, clear data.
- **About** — App purpose and developer contact.

---

## Data Model

Each transaction record follows this structure:

```json
{
  "id": "txn_1718700000000",
  "description": "Lunch at cafeteria",
  "amount": "12.50",
  "category": "Food",
  "date": "2026-06-14",
  "createdAt": "2026-06-14T12:00:00.000Z",
  "updatedAt": "2026-06-14T12:00:00.000Z"
}
```

- `id` — Unique identifier (`txn_` + timestamp), auto-generated on creation.
- `createdAt` / `updatedAt` — ISO timestamps, set automatically.
- All changes are auto-saved to `localStorage`.

**Default categories:** Food, Books, Transport, Entertainment, Fees, Other.

---

## Currency & Exchange Rates

Base currency is **USD**. Three additional currencies are supported using manual mock rates (no API calls):

| Currency | Symbol | Rate (to USD) |
|----------|--------|---------------|
| USD | $ | 1.00 |
| EUR | € | 0.92 |
| GBP | £ | 0.79 |
| JPY | ¥ | 150.12 |

Rates can be changed in `scripts/settings.js`. The active currency is selected in Settings and persisted via `localStorage`.

---

## Regex Catalog

| # | Field | Pattern | Purpose | Example Match |
|---|-------|---------|---------|---------------|
| 1 | Description | `/^\S(?:.*\S)?$/` | No leading/trailing spaces | `"Lunch at cafe"` ✅ · `" bad "` ❌ |
| 2 | Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | Positive number, up to 2 decimals | `"12.50"` ✅ · `".50"` ❌ |
| 3 | Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Strict YYYY-MM-DD | `"2026-06-14"` ✅ · `"26-13-01"` ❌ |
| 4 | Category | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Letters, spaces, hyphens | `"Self-Care"` ✅ · `"Food!"` ❌ |
| 5 | **Advanced** | `/\b(\w+)\s+\1\b/i` | Back-reference: duplicate consecutive words | `"Coffee Coffee"` ⚠️ detected |

### Search Patterns (Records page)

- **Cents present:** `/\.\d{2}\b/` — finds amounts with cents
- **Beverage keyword:** `/(coffee\|tea)/i` — matches beverage transactions
- **Any category:** type a category name to filter instantly
- Users can type any valid regex into the search bar; invalid patterns are silently ignored via `try/catch`.

---

## Keyboard Map

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Navigate between interactive elements |
| `Enter` | Activate buttons, submit forms, confirm actions |
| `Space` | Toggle buttons, open selects |
| `Escape` | Close modals (delete confirmation) |
| Skip link | Press `Tab` on page load → "Skip to content" appears |

All form controls have bound `<label>` elements. Focus indicators use a visible `2px solid` outline via `:focus-visible`.

---

## Accessibility (a11y) Notes

- **Semantic landmarks:** `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` on every page.
- **Heading hierarchy:** Single `<h1>` per page, logical `<h2>`/`<h3>` nesting.
- **Skip-to-content link:** Hidden until focused via keyboard.
- **ARIA live regions:** `role="status"` and `aria-live="polite"` for form feedback and toast notifications; `aria-live="assertive"` when budget is exceeded.
- **Labels:** All form inputs have associated `<label>` elements or `aria-label`.
- **Color contrast:** Dark theme uses light text on dark backgrounds; light theme uses dark text on light backgrounds. Both target WCAG AA.
- **Responsive table:** On mobile, the table converts to stacked cards using `data-label` attributes.

---

## File Structure

```
├── index.html          # Dashboard page
├── records.html        # Transaction records
├── addnew.html         # Add new transaction form
├── settings.html       # Preferences & data management
├── about.html          # About page with contact info
├── tests.html          # Logic verification tests
├── seed.json           # 12 sample transactions for testing
├── .gitignore          # OS, editor, and node ignores
├── styles/
│   ├── vars.css        # CSS custom properties & theme
│   ├── global.css      # Reset, base styles, utilities
│   ├── layout.css      # Header, nav, footer, responsive
│   └── components.css  # Cards, buttons, forms, tables, modals
├── scripts/
│   ├── storage.js      # localStorage CRUD, import/export
│   ├── validators.js   # Regex validation rules (4 + 1 advanced)
│   ├── search.js       # Safe regex compiler & match highlighter
│   ├── ui.js           # Mobile menu, theme loader, toast
│   ├── settings.js     # Currency utility, settings page logic
│   ├── dashboard.js    # Stats calculation, CSS bar chart
│   ├── records.js      # Table rendering, sort, search, edit, delete
│   └── add.js          # Form handling with real-time validation
└── README.md
```

---

## Setup & Testing

1. **Clone the repo:**
   ```bash
   git clone https://github.com/EnzoAsaph/Asaph_tracker.git
   ```
2. **Open `index.html`** in any modern browser — no build step or server required.
3. **Run tests:** Open `tests.html` to see regex, search, and storage assertions.
4. **Load sample data:** Go to Settings → Import JSON → select `seed.json`.

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Base (~360px) | Single column, hamburger menu, stacked card table |
| Tablet (768px) | Two-column dashboard grid, top-bar navigation |
| Desktop (1024px) | Four-column stats grid, full-width chart and table |

---

## Technologies

- HTML5 (semantic)
- CSS3 (custom properties, flexbox, grid, media queries, transitions)
- Vanilla JavaScript (IIFE modules, DOM manipulation, localStorage, regex)
- Fonts: Poppins + Source Code Pro (Google Fonts)
- No frameworks, no external libraries
