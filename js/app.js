// Рендер каталога, корзины и оформление заказа.

const fmt = (n) => n.toLocaleString("ru-RU") + " ₸";

function pluralItems(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "товар";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "товара";
  return "товаров";
}

// ---------- Каталог ----------
function controlHTML(p) {
  const qty = Cart.items[p.id] || 0;
  if (qty > 0) {
    return `<div class="stepper">
      <button data-dec="${p.id}" aria-label="Убрать одну">−</button>
      <span>${qty}</span>
      <button data-inc="${p.id}" aria-label="Добавить одну">+</button>
    </div>`;
  }
  return `<button class="card__add" data-add="${p.id}">В корзину</button>`;
}

function cardHTML(p) {
  return `
    <article class="card">
      <div class="card__img" data-quick="${p.id}">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : `<span style="font-size:56px">${p.emoji}</span>`}
        <button class="card__quick" data-quick="${p.id}">Подробнее</button>
      </div>
      <div class="card__body">
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.description}</p>
        <div class="card__bottom">
          <div>
            <div class="card__price">${fmt(p.price)}</div>
            <div class="card__unit">${p.unit}</div>
          </div>
          <div class="card__control" data-control="${p.id}">${controlHTML(p)}</div>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const root = document.getElementById("products");
  if (!root) return;
  const order = (typeof CATEGORIES !== "undefined" && CATEGORIES) || [];
  const groups = [...new Set([...order, ...PRODUCTS.map((p) => p.category || "Прочее")])];

  root.innerHTML = groups
    .map((cat) => {
      const items = PRODUCTS.filter((p) => (p.category || "Прочее") === cat);
      if (items.length === 0) return "";
      return `
        <section class="catalog-group" data-cat="${cat}">
          <h3 class="catalog-group__title">${cat}</h3>
          <div class="products-grid">${items.map(cardHTML).join("")}</div>
        </section>`;
    })
    .join("");
}

// Обновляет только контролы (кнопка/степпер) без перезагрузки картинок.
function updateControls() {
  PRODUCTS.forEach((p) => {
    const el = document.querySelector(`[data-control="${p.id}"]`);
    if (el) el.innerHTML = controlHTML(p);
  });
}

// ---------- Корзина ----------
function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  if (!itemsEl) return;
  const entries = Cart.entries();

  if (entries.length === 0) {
    itemsEl.innerHTML = `<p class="cart__empty">Корзина пуста.<br>Добавьте что-нибудь вкусное 🌴</p>`;
  } else {
    itemsEl.innerHTML = entries.map(({ product, qty }) => `
      <div class="cart-item">
        <div class="cart-item__emoji">${product.image ? `<img src="${product.image}" alt="">` : product.emoji}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${product.name}</div>
          <div class="cart-item__price">${fmt(product.price)} × ${qty} = ${fmt(product.price * qty)}</div>
        </div>
        <div class="cart-item__qty">
          <button data-dec="${product.id}" aria-label="Убрать одну">−</button>
          <span>${qty}</span>
          <button data-inc="${product.id}" aria-label="Добавить одну">+</button>
        </div>
        <button class="cart-item__remove" data-remove="${product.id}" aria-label="Удалить">✕</button>
      </div>
    `).join("");
  }

  const count = Cart.totalCount();
  const total = Cart.totalPrice();
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = fmt(total);
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = count;
  const fabCount = document.getElementById("fabCartCount");
  if (fabCount) fabCount.textContent = count;
  const submitBtn = document.getElementById("submitOrderBtn");
  if (submitBtn) submitBtn.disabled = entries.length === 0;

  // Мобильная нижняя панель
  const bar = document.getElementById("mobileBar");
  if (bar) {
    document.getElementById("mobileBarCount").textContent = `${count} ${pluralItems(count)}`;
    document.getElementById("mobileBarTotal").textContent = fmt(total);
    bar.hidden = count === 0;
    document.body.classList.toggle("mobilebar-on", count > 0);
  }

  updateControls();
}

function openCart() {
  document.getElementById("cart").classList.add("open");
  const overlay = document.getElementById("cartOverlay");
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("open"));
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart").classList.remove("open");
  const overlay = document.getElementById("cartOverlay");
  overlay.classList.remove("open");
  setTimeout(() => { overlay.hidden = true; }, 250);
  document.body.style.overflow = "";
}

// Публичные помощники (для quickview в widgets.js)
function addToCart(id, opts = {}) {
  Cart.add(Number(id));
  renderCart();
  const p = PRODUCTS.find((x) => x.id === Number(id));
  if (!opts.silent) window.showToast?.(`${p ? p.name : "Товар"} — в корзине`);
}
window.addToCart = addToCart;
window.openCart = openCart;

// ---------- Заказ ----------
async function submitOrder(event) {
  event.preventDefault();
  const statusEl = document.getElementById("orderStatus");
  const btn = document.getElementById("submitOrderBtn");

  const order = {
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    comment: document.getElementById("customerComment").value.trim(),
    items: Cart.entries().map(({ product, qty }) => ({
      name: product.name, price: product.price, qty, sum: product.price * qty,
    })),
    total: Cart.totalPrice(),
  };

  btn.disabled = true;
  statusEl.className = "order-status";
  statusEl.textContent = "Отправляем заказ…";

  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    statusEl.className = "order-status order-status--ok";
    statusEl.textContent = "Заказ отправлен! Мы свяжемся с вами.";
    Cart.clear();
    renderCart();
    document.getElementById("orderForm").reset();
  } catch (err) {
    statusEl.className = "order-status order-status--error";
    statusEl.textContent = "Не удалось отправить заказ. Попробуйте ещё раз.";
    btn.disabled = false;
  }
}

// ---------- События ----------
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { addToCart(add.dataset.add); return; }

  const inc = e.target.closest("[data-inc]");
  if (inc) { Cart.add(Number(inc.dataset.inc)); renderCart(); return; }

  const dec = e.target.closest("[data-dec]");
  if (dec) { Cart.decrease(Number(dec.dataset.dec)); renderCart(); return; }

  const rm = e.target.closest("[data-remove]");
  if (rm) { Cart.remove(Number(rm.dataset.remove)); renderCart(); return; }
});

// Устойчивое подключение: пропущенный элемент (например, из-за старого кэша HTML)
// не должен ронять весь скрипт — используем optional chaining.
document.getElementById("cartBtn")?.addEventListener("click", openCart);
document.getElementById("fabCart")?.addEventListener("click", openCart);
document.getElementById("mobileBarBtn")?.addEventListener("click", openCart);
document.getElementById("cartClose")?.addEventListener("click", closeCart);
document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
document.getElementById("orderForm")?.addEventListener("submit", submitOrder);

// ---------- Старт ----------
Cart.load();
renderProducts();
renderCart();
