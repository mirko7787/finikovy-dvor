// Виджеты: scroll-анимации, счётчики, фильтры каталога, быстрый просмотр, тосты.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Тосты ----------
  const toastRoot = document.getElementById("toasts");
  window.showToast = function (text) {
    if (!toastRoot) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="toast__check">✓</span> ${text}`;
    toastRoot.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 2200);
  };

  // ---------- Scroll-анимации ----------
  const animated = document.querySelectorAll("[data-animate]");
  if (reduceMotion) {
    animated.forEach((el) => el.classList.add("in-view"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    animated.forEach((el) => io.observe(el));
  } else {
    animated.forEach((el) => el.classList.add("in-view"));
  }

  // ---------- Счётчики ----------
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  // ---------- Фильтры каталога ----------
  const filtersEl = document.getElementById("filters");
  if (filtersEl && typeof CATEGORIES !== "undefined") {
    const chips = ["Все", ...CATEGORIES];
    filtersEl.innerHTML = chips
      .map((c, i) => `<button class="filter-chip${i === 0 ? " is-active" : ""}" data-filter="${c}">${c}</button>`)
      .join("");
    filtersEl.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      filtersEl.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const filter = chip.dataset.filter;
      document.querySelectorAll(".catalog-group").forEach((g) => {
        g.hidden = filter !== "Все" && g.dataset.cat !== filter;
      });
    });
  }

  // ---------- Быстрый просмотр ----------
  const qv = document.getElementById("quickView");
  const qvBody = document.getElementById("quickViewBody");

  function openQuickView(id) {
    const p = PRODUCTS.find((x) => x.id === Number(id));
    if (!p || !qv) return;
    qvBody.innerHTML = `
      <div class="qv__img">${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<div style="font-size:80px;display:grid;place-items:center;height:100%">${p.emoji}</div>`}</div>
      <div class="qv__info">
        <span class="code">${p.category || ""}</span>
        <h3 class="qv__name">${p.name}</h3>
        <p class="qv__desc">${p.description}</p>
        <div class="qv__price">${fmt(p.price)} <span class="code">/ ${p.unit}</span></div>
        <div class="qv__actions"><button class="btn btn--filled" data-qv-add="${p.id}">Добавить в корзину</button></div>
      </div>`;
    qv.hidden = false;
    requestAnimationFrame(() => qv.classList.add("open"));
    document.body.style.overflow = "hidden";
  }

  function closeQuickView() {
    if (!qv) return;
    qv.classList.remove("open");
    setTimeout(() => { qv.hidden = true; }, 250);
    if (!document.getElementById("cart").classList.contains("open")) {
      document.body.style.overflow = "";
    }
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-quick]");
    if (trigger) { openQuickView(trigger.dataset.quick); return; }
    const qvAdd = e.target.closest("[data-qv-add]");
    if (qvAdd) { window.addToCart?.(qvAdd.dataset.qvAdd); closeQuickView(); return; }
  });

  document.getElementById("quickViewClose")?.addEventListener("click", closeQuickView);
  document.getElementById("quickViewOverlay")?.addEventListener("click", closeQuickView);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeQuickView(); });
})();
