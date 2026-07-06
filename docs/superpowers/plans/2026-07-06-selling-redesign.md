# Selling Redesign v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the one-page storefront into a dense, trust-building selling page (13 blocks per spec) with real product photos, staying inside the Monad design system.

**Architecture:** Static site, no framework. All markup in `index.html`, all styles in `css/style.css`, product data in `js/products.js`. Cart/order JS untouched. Photos self-hosted in `/images`.

**Tech Stack:** HTML, CSS (custom properties), vanilla JS, JetBrains Mono + Playfair Display (Google Fonts).

**Spec:** `docs/superpowers/specs/2026-07-06-selling-redesign-design.md` — block-by-block content source of truth.

## Global Constraints

- Page canvas `#f6f3f1` (never `#ffffff`); headings Playfair Display 400 only; all UI text JetBrains Mono; buttons/tags radius 100px/9999px; cards radius ≥16px; borders 1px `#cecac8`; no drop shadows; exactly one Lake Blue `#2b59d1` CTA on the page (hero) + one inside the cart drawer (submit).
- Photos only inside rounded cards with 1px ash border.
- No test framework in repo — each task verifies via the `finikovy-dvor` preview server (launch.json, port 3210): screenshot + `preview_eval` computed-style checks + console error check.
- Russian copy; prices in ₸.
- Commit after each task; push only at the end (already user-authorized).

---

### Task 1: Product photos

**Files:**
- Create: `images/hero.jpg`, `images/medjool.jpg`, `images/safawi.jpg`, `images/ajwa.jpg`, `images/sukkari-mufattal.jpg`, `images/sukkari-rutab.jpg`, `images/choco.jpg`, `images/gift.jpg`
- Modify: `js/products.js` (fill `image` fields)

**Interfaces:**
- Produces: image paths `images/<slug>.jpg` consumed by Task 2 (hero, bestseller markup) and existing `renderProducts()` (reads `p.image`).

- [ ] **Step 1: Find + download 8 free photos of dates** (Unsplash/Pexels, commercial-use licenses). Search terms: "dates fruit", "medjool dates", "dates bowl", "dates chocolate", "dried fruit gift box". Download via `curl -L -o images/<name>.jpg "<direct-image-url>?w=1200&q=75"` (Unsplash CDN supports width/quality params; for Pexels use their `?auto=compress&w=1200`).
- [ ] **Step 2: Verify each file** — `Get-Item images/*.jpg` all >20KB (not error pages), open one in preview to confirm real photo.
- [ ] **Step 3: Fill `image` fields in `js/products.js`**: id1→`images/medjool.jpg`, id2→`images/safawi.jpg`, id3→`images/ajwa.jpg`, id4→`images/sukkari-mufattal.jpg`, id5→`images/sukkari-rutab.jpg`, id6→`images/choco.jpg`, id7→`images/gift.jpg`. Keep `emoji` as cart-item fallback.
- [ ] **Step 4: Preview check** — catalog cards show photos (object-fit cover already in CSS v1; final sizing in Task 3).
- [ ] **Step 5: Commit** — `git add images js/products.js; git commit -m "feat: add self-hosted product photos"`.

### Task 2: New page markup (index.html)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: image paths from Task 1.
- Produces: class names/ids consumed by Task 3 CSS and existing JS (`#products`, `#cartBtn`, `#cartCount`, `#cart*`, `#orderForm` ids MUST stay unchanged). New classes: `.trust`, `.bestseller`, `.features`, `.reviews`, `.delivery`, `.faq`, `.cta-final`, `.fab-cart`.

- [ ] **Step 1: Rewrite `<body>` into 13 blocks per spec** (spec §Структура has full content per block). Key points:
  - Announcement: «Доставка по Казахстану · Оплата Kaspi».
  - Hero: 2-col grid; left — h1 «Отборные финики прямо к вашему столу», p, buttons (`.btn--primary` «Смотреть каталог ▸», `.btn--ghost` «Как заказать» → `#delivery`); right — `<img src="images/hero.jpg">` in `.hero__photo` card, `.hero__wash` behind.
  - Trust strip: `<ul class="trust">` — 7 сортов / ручной отбор / поставки еженедельно / оплата Kaspi.
  - Bestseller: `.bestseller` periwinkle card — serif h2 «Хит: Меджул (Королевские)», copy, price 6 900 ₸/500 г, `<button class="btn btn--dark" data-add="1">В корзину</button>`, `<img src="images/medjool.jpg">`.
  - Catalog: unchanged `<div class="products" id="products">`.
  - Features: 3 `.feature-card` — Свежие партии / Прямые поставки / Ручной отбор (serif h3 24px + mono p).
  - Reviews: 3 `.review-card` with `<!-- ЗАГЛУШКА: заменить на реальные отзывы -->` marker.
  - Delivery `id="delivery"`: 2 cols — Доставка (Алматы 1-2 дня, Астана 2-3, Казахстан 3-7) / Оплата (Kaspi перевод, счёт при получении заказа).
  - FAQ: `<details class="faq__item">` ×5 (хранение, срок годности, опт, доставка, оплата) — native, no JS.
  - Final CTA: `.cta-final` ink section, serif h2 parchment color, `.btn btn--ghost-light` → `#catalog`.
  - FAB: `<button class="fab-cart" id="fabCart">` — mirrors cart count via second span; add tiny inline listener in app.js? No — reuse: give it `onclick` → `#cartBtn` click? Cleaner: Task 2 adds `id="fabCart"` and Task 4 wires `document.getElementById('fabCart').addEventListener('click', openCart)` + count sync in `renderCart()`.
- [ ] **Step 2: Preview reload** — structure renders (unstyled new blocks OK), console has no JS errors, cart still opens.
- [ ] **Step 3: Commit** — `git commit -m "feat: selling-page markup (13 blocks)"`.

### Task 3: Styles for new blocks (css/style.css)

**Files:**
- Modify: `css/style.css`

**Interfaces:**
- Consumes: class names from Task 2; existing custom properties (`--color-*`, `--font-*`).

- [ ] **Step 1: Add/adjust sections** (all inside Monad constraints from Global Constraints):
  - Hero 2-col: `display:grid; grid-template-columns: 1.1fr 0.9fr; gap:48px; align-items:center; text-align:left`. `.hero__photo`: border-radius 40px, 1px ash border, overflow hidden, img cover, aspect-ratio 4/5 max-height ~520px. Wash stays behind photo column.
  - `.trust`: flex row, mono 12px uppercase smoke, gap 24px, items separated by 1px ash left-border, section 1px ash top/bottom border, padding 20px 0.
  - `.bestseller`: periwinkle bg, radius 40px, padding 40px, grid 1fr 1fr, photo card radius 24px inside; `.btn--dark` = off-black fill pill.
  - `.features`, `.reviews`: grid auto-fill minmax(280px,1fr), gap 16px; cards 1px ash, radius 32px, padding 32-40px.
  - `.delivery`: 2-col grid, each col 1px ash card radius 32px padding 40px, mono lists.
  - `.faq__item`: border-bottom 1px ash, summary serif 24px padding 24px 0, `details[open]` chevron rotate via `summary::after` content "↓"/"↑" (mono glyph, no icon font).
  - `.cta-final`: ink bg, centered, padding 96px 24px, h2 parchment color; `.btn--ghost-light`: transparent, 1px parchment border, parchment text.
  - `.fab-cart`: position fixed, right 24px bottom 24px, off-black pill, mono 14px uppercase, z-index 80, hidden ≥ nothing (always visible), display none while `.cart.open` (avoid overlap: `body:has(.cart.open) .fab-cart { display:none }`).
  - Responsive <900px: hero + bestseller + delivery collapse to 1 column; trust strip wraps.
- [ ] **Step 2: Preview verification** — screenshots top-to-bottom; `preview_eval` computed checks: bestseller bg `rgb(207,218,245)`, faq summary font Playfair 24px, fab border-radius 100px, no box-shadows on cards; console clean; mobile width via `preview_resize` 380px.
- [ ] **Step 3: Commit** — `git commit -m "feat: styles for selling blocks"`.

### Task 4: FAB wiring + cart count sync (js/app.js)

**Files:**
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `#fabCart` from Task 2, `openCart()`/`renderCart()` existing.
- Produces: `#fabCartCount` span text kept in sync with `#cartCount`.

- [ ] **Step 1: Wire** — after existing `cartBtn` listener add:
  ```js
  document.getElementById("fabCart").addEventListener("click", openCart);
  ```
  and in `renderCart()` after `cartCount` update:
  ```js
  const fabCount = document.getElementById("fabCartCount");
  if (fabCount) fabCount.textContent = Cart.totalCount();
  ```
- [ ] **Step 2: Preview test** — click FAB → drawer opens; add item from bestseller button (`data-add="1"` reuses existing delegation) → both counters update; submit disabled state intact.
- [ ] **Step 3: Commit** — `git commit -m "feat: floating cart button (future Mirzakim slot)"`.

### Task 5: Final verification + push

- [ ] **Step 1: Full pass in preview** — desktop + 380px mobile screenshots of every block; console errors = none; cart end-to-end (add → qty → form validation).
- [ ] **Step 2: Push** — `git push origin main`; verify `git status` clean.
- [ ] **Step 3: Close bd task**, report Vercel URL.

## Self-Review

- Spec coverage: 13 blocks → Tasks 2-3; photos → Task 1; FAB → Tasks 2-4; verification/push → Task 5. Отзывы marked as placeholder per spec. ✓
- No placeholders in steps beyond deliberate «ЗАГЛУШКА» review copy (spec-mandated). ✓
- Ids consumed by JS unchanged (`#products`, `#cartBtn`, etc.) — stated in Task 2 interfaces. ✓
