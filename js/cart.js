// Корзина: хранение в localStorage, добавление/удаление, подсчёт суммы.
const Cart = {
  STORAGE_KEY: "finikovy-dvor-cart",

  // { [productId]: quantity }
  items: {},

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    } catch {
      this.items = {};
    }
  },

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
  },

  add(productId) {
    this.items[productId] = (this.items[productId] || 0) + 1;
    this.save();
  },

  decrease(productId) {
    if (!this.items[productId]) return;
    this.items[productId] -= 1;
    if (this.items[productId] <= 0) delete this.items[productId];
    this.save();
  },

  remove(productId) {
    delete this.items[productId];
    this.save();
  },

  clear() {
    this.items = {};
    this.save();
  },

  totalCount() {
    return Object.values(this.items).reduce((sum, qty) => sum + qty, 0);
  },

  totalPrice() {
    return Object.entries(this.items).reduce((sum, [id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === Number(id));
      return product ? sum + product.price * qty : sum;
    }, 0);
  },

  // [{ product, qty }] — только существующие товары
  entries() {
    return Object.entries(this.items)
      .map(([id, qty]) => ({
        product: PRODUCTS.find((p) => p.id === Number(id)),
        qty,
      }))
      .filter((e) => e.product);
  },
};
