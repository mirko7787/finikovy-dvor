// Рендер каталога, корзины и оформление заказа.

const fmt = (n) => n.toLocaleString("ru-RU") + " ₸";

// ---------- Каталог ----------
function cardHTML(p) {
  return `
    <article class="card">
      <div class="card__img">${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : p.emoji}</div>
      <div class="card__body">
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.description}</p>
        <div class="card__bottom">
          <div>
            <div class="card__price">${fmt(p.price)}</div>
            <div class="card__unit">${p.unit}</div>
          </div>
          <button class="card__add" data-add="${p.id}">В корзину</button>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const root = document.getElementById("products");
  // Порядок разделов из CATEGORIES; товары без известной категории уходят в конец.
  const order = (typeof CATEGORIES !== "undefined" && CATEGORIES) || [];
  const groups = [...new Set([...order, ...PRODUCTS.map((p) => p.category || "Прочее")])];

  root.innerHTML = groups
    .map((cat) => {
      const items = PRODUCTS.filter((p) => (p.category || "Прочее") === cat);
      if (items.length === 0) return "";
      return `
        <section class="catalog-group">
          <h3 class="catalog-group__title">${cat}</h3>
          <div class="products-grid">${items.map(cardHTML).join("")}</div>
        </section>`;
    })
    .join("");
}

// ---------- Корзина ----------
function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const entries = Cart.entries();

  if (entries.length === 0) {
    itemsEl.innerHTML = `<p class="cart__empty">Корзина пуста.<br>Добавьте что-нибудь вкусное 🌴</p>`;
  } else {
    itemsEl.innerHTML = entries.map(({ product, qty }) => `
      <div class="cart-item">
        <div class="cart-item__emoji">${product.emoji}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${product.name}</div>
          <div class="cart-item__price">${fmt(product.price)} × ${qty} = ${fmt(product.price * qty)}</div>
        </div>
        <div class="cart-item__qty">
          <button data-dec="${product.id}" aria-label="Убрать одну">−</button>
          <span>${qty}</span>
          <button data-inc="${product.id}" aria-label="Добавить одну">+</button>
        </div>
        <button class="cart-item__remove" data-remove="${product.id}" aria-label="Удалить">🗑</button>
      </div>
    `).join("");
  }

  document.getElementById("cartTotal").textContent = fmt(Cart.totalPrice());
  document.getElementById("cartCount").textContent = Cart.totalCount();
  const fabCount = document.getElementById("fabCartCount");
  if (fabCount) fabCount.textContent = Cart.totalCount();
  document.getElementById("submitOrderBtn").disabled = entries.length === 0;
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
      name: product.name,
      price: product.price,
      qty,
      sum: product.price * qty,
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
  if (add) {
    Cart.add(Number(add.dataset.add));
    renderCart();
    add.textContent = "Добавлено ✓";
    add.classList.add("card__add--added");
    setTimeout(() => {
      add.textContent = "В корзину";
      add.classList.remove("card__add--added");
    }, 900);
    return;
  }
  const inc = e.target.closest("[data-inc]");
  if (inc) { Cart.add(Number(inc.dataset.inc)); renderCart(); return; }

  const dec = e.target.closest("[data-dec]");
  if (dec) { Cart.decrease(Number(dec.dataset.dec)); renderCart(); return; }

  const rm = e.target.closest("[data-remove]");
  if (rm) { Cart.remove(Number(rm.dataset.remove)); renderCart(); return; }
});

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("fabCart").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
document.getElementById("orderForm").addEventListener("submit", submitOrder);

// ---------- Старт ----------
Cart.load();
renderProducts();
renderCart();
