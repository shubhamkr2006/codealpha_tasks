

(function () {
  'use strict';

  
  // Product photos default to the category images in style.css (--img-product-*),
  // but any product can get its own photo by filling in the matching
  // data-img="" in the #productPhotoOverrides block near the end of index.html.
  const photoOverrides = {};
  document.querySelectorAll('#productPhotoOverrides [data-id]').forEach((el) => {
    const url = (el.dataset.img || '').trim();
    if (url) photoOverrides[el.dataset.id] = url;
  });

  function imgStyleFor(p) {
    const custom = photoOverrides[p.id];
    return custom ? `background-image:url('${custom}')` : `background-image:var(--img-product-${p.cat})`;
  }

 
  const PRODUCTS = [
    { id: 'p1', cat: 'pens', name: 'The Correspondent Fountain Pen', desc: 'Medium nib, resin body, weighted for long letters.', price: 199, tag: null, rating: 4.8, reviews: 132 },
    { id: 'p2', cat: 'pens', name: "Clerk's Rollerball", desc: 'Brushed brass barrel with a fine, consistent line.', price: 199, tag: null, rating: 4.6, reviews: 74 },
    { id: 'p3', cat: 'pens', name: 'Brass Dip Pen', desc: 'A single flexible nib for ink work and lettering.', price: 199, tag: 'New', rating: 4.9, reviews: 21 },
    { id: 'p4', cat: 'pens', name: 'Number Two Fountain Pen', desc: 'Everyday steel-nib pen, refillable, unfussy.', price: 199, tag: null, rating: 4.7, reviews: 210 },
    { id: 'p5', cat: 'paper', name: 'Field Notebook — Dot Grid', desc: 'Pocket-sized, 64 pages, sewn binding.', price: 99, tag: null, rating: 4.7, reviews: 340 },
    { id: 'p6', cat: 'paper', name: 'Ledger Journal — Ruled', desc: 'A5 hardback, 192 pages of 100gsm stock.', price: 399, tag: null, rating: 4.8, reviews: 156 },
    { id: 'p7', cat: 'paper', name: 'Sketch Quire — Blank', desc: 'Unlined pages for drawing, planning, thinking.', price: 149, tag: 'New', rating: 4.9, reviews: 18 },
    { id: 'p8', cat: 'paper', name: 'Desk Diary — Weekly', desc: 'Undated, so you can start any month you like.', price: 292, tag: null, rating: 4.5, reviews: 88 },
    { id: 'p9', cat: 'ink', name: 'Iron Gall Ink — 50ml', desc: 'Archival black that darkens as it dries.', price: 133, tag: null, rating: 4.8, reviews: 97 },
    { id: 'p10', cat: 'ink', name: 'Prussian Blue Ink — 50ml', desc: 'A deep, slightly green-leaning blue.', price: 133, tag: null, rating: 4.6, reviews: 63 },
    { id: 'p11', cat: 'ink', name: 'Sepia Ink — 50ml', desc: 'Warm brown, reads like an old letter.', price: 133, tag: 'Limited', rating: 4.9, reviews: 41 },
    { id: 'p12', cat: 'desk', name: 'Brass Letter Opener', desc: 'Solid brass, ages into a warm patina.', price: 219, tag: null, rating: 4.7, reviews: 52 },
    { id: 'p13', cat: 'desk', name: 'Wax Seal &amp; Stamp Kit', desc: 'Initial stamp, spoon, and three wax sticks.', price: 265, tag: null, rating: 4.8, reviews: 66 },
    { id: 'p14', cat: 'desk', name: 'Walnut Pen Tray', desc: 'Holds four pens, lined with felt.', price: 315, tag: null, rating: 4.6, reviews: 29 }
  ];

  const FREE_SHIP_THRESHOLD = 400;
  const FLAT_SHIPPING = 500;
  const PROMO_CODES = { WRITE10: 0.10, INKHOUSE15: 0.15 };
  const STORAGE_KEY_CART = 'inkhouse_cart_v1';
  const STORAGE_KEY_WISHLIST = 'inkhouse_wishlist_v1';
  const STORAGE_KEY_PROMO = 'inkhouse_promo_v1';


  let currentFilter = 'all';
  let currentSearch = '';
  let cart = loadJSON(STORAGE_KEY_CART, []);
  let wishlist = loadJSON(STORAGE_KEY_WISHLIST, []); 
  let appliedPromo = loadJSON(STORAGE_KEY_PROMO, null); 

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable, fail silently */ }
  }

  /* ---------- DOM refs ---------- */
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const searchBox = document.getElementById('searchBox');
  const searchIconBtn = document.getElementById('searchIconBtn');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const filterIndicator = document.getElementById('filterIndicator');
  const collectionChips = document.querySelectorAll('.collection-chip');
  const filterLinks = document.querySelectorAll('[data-filter-link]');

  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartLines = document.getElementById('cartLines');
  const cartEmptyMsg = document.getElementById('cartEmptyMsg');
  const cartCount = document.getElementById('cartCount');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const cartDiscount = document.getElementById('cartDiscount');
  const discountRow = document.getElementById('discountRow');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const receiptNumber = document.getElementById('receiptNumber');
  const shipProgressFill = document.getElementById('shipProgressFill');
  const shipProgressText = document.getElementById('shipProgressText');
  const promoInput = document.getElementById('promoInput');
  const promoApply = document.getElementById('promoApply');
  const promoMsg = document.getElementById('promoMsg');

  const wishlistToggle = document.getElementById('wishlistToggle');
  const wishlistClose = document.getElementById('wishlistClose');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistOverlay = document.getElementById('wishlistOverlay');
  const wishlistItemsEl = document.getElementById('wishlistItems');
  const wishlistEmptyMsg = document.getElementById('wishlistEmptyMsg');
  const wishlistCount = document.getElementById('wishlistCount');

  const toastStack = document.getElementById('toastStack');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const siteHeader = document.getElementById('siteHeader');
  const hero = document.getElementById('hero');
  const inkDots = document.querySelectorAll('.ink-dot');
  const newsletterForm = document.getElementById('newsletterForm');
  const backToTop = document.getElementById('backToTop');

  
  const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  const money = (n) => inrFormatter.format(n);
  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

  function starString(rating) {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  
  function renderProducts() {
    const term = currentSearch.trim().toLowerCase();

    const visible = PRODUCTS.filter((p) => {
      const matchesFilter = currentFilter === 'all' || p.cat === currentFilter;
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });

    grid.innerHTML = visible.map(cardHTML).join('');
    emptyState.hidden = visible.length !== 0;

    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('is-visible'), i * 40);
      // shimmer skeleton on the image tile clears shortly after the card appears
      setTimeout(() => card.classList.add('is-loaded'), i * 40 + 260);
      attachTilt(card);
    });

    grid.querySelectorAll('.add-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleAddToCart(btn));
    });
    grid.querySelectorAll('.wishlist-btn').forEach((btn) => {
      btn.addEventListener('click', () => toggleWishlist(btn.dataset.id));
    });
  }

  /* ---------- Subtle 3D tilt on product cards (desktop pointers only) ---------- */
  const canHover = window.matchMedia('(pointer: fine)').matches;
  function attachTilt(card) {
    if (!canHover) return;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;
      card.style.transform = `translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  }

  function cardHTML(p) {
    const isSaved = wishlist.includes(p.id);
    return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-visual" data-cat="${p.cat}">
          ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
          <button class="wishlist-btn${isSaved ? ' is-active' : ''}" data-id="${p.id}" aria-label="Save ${p.name} to wishlist" aria-pressed="${isSaved}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8">
              <path d="M12 21s-7.5-4.7-10-9.3C.5 8.4 2.2 5 5.6 5c2 0 3.4 1 4.4 2.4C11 6 12.4 5 14.4 5 17.8 5 19.5 8.4 22 11.7 19.5 16.3 12 21 12 21Z"/>
            </svg>
          </button>
          <div class="product-visual-img" style="${imgStyleFor(p)}" role="img" aria-label="${p.name}"></div>
        </div>
        <div class="product-body">
          <span class="product-cat">${p.cat}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-rating">
            <span class="stars">${starString(p.rating)}</span>
            <span class="count">${p.rating.toFixed(1)} (${p.reviews})</span>
          </div>
          <p class="product-desc">${p.desc}</p>
          <div class="product-foot">
            <span class="product-price">${money(p.price)}</span>
            <button class="add-btn" data-id="${p.id}" type="button">Add to cart</button>
          </div>
        </div>
      </article>
    `;
  }


  function setFilter(filter) {
    currentFilter = filter;
    let activeBtn = null;
    filterButtons.forEach((btn) => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
      if (active) activeBtn = btn;
    });
    moveFilterIndicator(activeBtn);
    renderProducts();
  }

  function moveFilterIndicator(btn) {
    if (!filterIndicator || !btn) return;
    filterIndicator.style.width = `${btn.offsetWidth}px`;
    filterIndicator.style.transform = `translateX(${btn.offsetLeft}px)`;
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  collectionChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      setFilter(chip.dataset.filter);
      document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
    });
  });

  filterLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const f = link.dataset.filterLink;
      if (f) setFilter(f);
    });
  });

  if (searchIconBtn && searchBox) {
    searchIconBtn.addEventListener('click', () => {
      searchBox.classList.toggle('is-open');
      if (searchBox.classList.contains('is-open')) searchInput.focus();
    });
    searchInput.addEventListener('blur', () => {
      if (!searchInput.value) searchBox.classList.remove('is-open');
    });
  }

  let searchDebounce;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      currentSearch = e.target.value;
      renderProducts();
    }, 120);
  });

 
  function handleAddToCart(btn) {
    const id = btn.dataset.id;
    const existing = cart.find((line) => line.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, qty: 1 });
    }
    saveJSON(STORAGE_KEY_CART, cart);
    renderCart();
    showToast(`Added "${findProduct(id).name}" to your order`);

    btn.classList.add('is-added');
    const original = btn.textContent;
    btn.textContent = 'Added ✓';
    setTimeout(() => {
      btn.classList.remove('is-added');
      btn.textContent = original;
    }, 1200);
  }

  function changeQty(id, delta) {
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter((l) => l.id !== id);
    saveJSON(STORAGE_KEY_CART, cart);
    renderCart();
  }

  function removeLine(id) {
    cart = cart.filter((l) => l.id !== id);
    saveJSON(STORAGE_KEY_CART, cart);
    renderCart();
  }

  function renderCart() {
    const totalItems = cart.reduce((sum, l) => sum + l.qty, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = 'flex';

    let subtotal = 0;
    cart.forEach((line) => { subtotal += findProduct(line.id).price * line.qty; });

    // Shipping progress bar
    const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
    const pct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
    shipProgressFill.style.width = `${pct}%`;
    shipProgressText.textContent = subtotal === 0
      ? `Spend ${money(FREE_SHIP_THRESHOLD)} for free shipping`
      : remaining > 0
        ? `Add ${money(remaining)} more for free shipping`
        : "You've unlocked free shipping";

    if (cart.length === 0) {
      cartLines.innerHTML = '';
      cartEmptyMsg.hidden = false;
    } else {
      cartEmptyMsg.hidden = true;
      cartLines.innerHTML = cart.map((line) => {
        const product = findProduct(line.id);
        const lineTotal = product.price * line.qty;
        return `
          <div class="receipt-line" data-id="${line.id}">
            <div class="thumb-img" style="${imgStyleFor(product)}" role="img" aria-label="${product.name}"></div>
            <div class="receipt-line-main">
              <div class="receipt-line-top">
                <span class="receipt-line-name">${product.name}</span>
                <span class="receipt-line-price">${money(lineTotal)}</span>
              </div>
              <span class="receipt-line-meta">
                <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
                ${line.qty}
                <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
                <button class="remove-line" data-action="remove">remove</button>
              </span>
            </div>
          </div>
        `;
      }).join('');

      cartLines.querySelectorAll('.receipt-line').forEach((row) => {
        const id = row.dataset.id;
        row.querySelector('[data-action="inc"]').addEventListener('click', () => changeQty(id, 1));
        row.querySelector('[data-action="dec"]').addEventListener('click', () => changeQty(id, -1));
        row.querySelector('[data-action="remove"]').addEventListener('click', () => removeLine(id));
      });
    }

    const discountRate = appliedPromo && PROMO_CODES[appliedPromo] ? PROMO_CODES[appliedPromo] : 0;
    const discountAmount = subtotal * discountRate;
    const shipping = subtotal > 0 && subtotal < FREE_SHIP_THRESHOLD ? FLAT_SHIPPING : 0;
    const total = Math.max(0, subtotal - discountAmount + shipping);

    cartSubtotal.textContent = money(subtotal);
    cartShipping.textContent = shipping === 0 ? 'Free' : money(shipping);
    cartTotal.textContent = money(total);

    if (discountAmount > 0) {
      discountRow.hidden = false;
      cartDiscount.textContent = `−${money(discountAmount)}`;
    } else {
      discountRow.hidden = true;
    }
  }

  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartToggle.setAttribute('aria-expanded', 'true');
    receiptNumber.textContent = String(1000 + Math.floor(Math.random() * 9000));
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartToggle.setAttribute('aria-expanded', 'false');
  }

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', () => { closeCart(); closeWishlist(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCart(); closeWishlist(); }
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty — add something first.');
      return;
    }
    showToast('Order placed. A confirmation would land in your inbox.');
    cart = [];
    appliedPromo = null;
    saveJSON(STORAGE_KEY_CART, cart);
    saveJSON(STORAGE_KEY_PROMO, appliedPromo);
    promoInput.value = '';
    promoMsg.textContent = '';
    renderCart();
    closeCart();
  });

 
  promoApply.addEventListener('click', applyPromo);
  promoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyPromo(); });

  function applyPromo() {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      appliedPromo = code;
      saveJSON(STORAGE_KEY_PROMO, appliedPromo);
      promoMsg.textContent = `Code applied — ${Math.round(PROMO_CODES[code] * 100)}% off your order.`;
      promoMsg.classList.remove('is-error');
      renderCart();
    } else {
      promoMsg.textContent = 'That code is not valid.';
      promoMsg.classList.add('is-error');
    }
  }
  if (appliedPromo) promoInput.value = appliedPromo;

  
  function toggleWishlist(id) {
    if (wishlist.includes(id)) {
      wishlist = wishlist.filter((w) => w !== id);
    } else {
      wishlist.push(id);
      showToast(`Saved "${findProduct(id).name}" for later`);
    }
    saveJSON(STORAGE_KEY_WISHLIST, wishlist);
    renderProducts();
    renderWishlist();
  }

  function renderWishlist() {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';

    if (wishlist.length === 0) {
      wishlistItemsEl.innerHTML = '';
      wishlistEmptyMsg.hidden = false;
      return;
    }
    wishlistEmptyMsg.hidden = true;

    wishlistItemsEl.innerHTML = wishlist.map((id) => {
      const p = findProduct(id);
      return `
        <div class="wishlist-item" data-id="${p.id}">
          <div class="thumb-img" style="${imgStyleFor(p)}" role="img" aria-label="${p.name}"></div>
          <div class="wishlist-item-body">
            <div class="wishlist-item-name">${p.name}</div>
            <div class="wishlist-item-price">${money(p.price)}</div>
            <div class="wishlist-item-actions">
              <button data-action="move-to-cart">Add to cart</button>
              <button data-action="remove">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    wishlistItemsEl.querySelectorAll('.wishlist-item').forEach((row) => {
      const id = row.dataset.id;
      row.querySelector('[data-action="move-to-cart"]').addEventListener('click', () => {
        const existing = cart.find((l) => l.id === id);
        if (existing) existing.qty += 1; else cart.push({ id, qty: 1 });
        saveJSON(STORAGE_KEY_CART, cart);
        renderCart();
        showToast(`Added "${findProduct(id).name}" to your order`);
      });
      row.querySelector('[data-action="remove"]').addEventListener('click', () => toggleWishlist(id));
    });
  }

  function openWishlist() {
    wishlistDrawer.classList.add('is-open');
    wishlistOverlay.classList.add('is-open');
    wishlistDrawer.setAttribute('aria-hidden', 'false');
    wishlistToggle.setAttribute('aria-expanded', 'true');
  }
  function closeWishlist() {
    wishlistDrawer.classList.remove('is-open');
    wishlistOverlay.classList.remove('is-open');
    wishlistDrawer.setAttribute('aria-hidden', 'true');
    wishlistToggle.setAttribute('aria-expanded', 'false');
  }
  wishlistToggle.addEventListener('click', openWishlist);
  wishlistClose.addEventListener('click', closeWishlist);
  wishlistOverlay.addEventListener('click', () => { closeWishlist(); closeCart(); });

  /* ---------- Toasts ---------- */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 2700);
  }

  /* ---------- Ink colour picker ---------- */
  const inkHighlight = document.getElementById('inkHighlight');
  inkDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const color = dot.dataset.ink;
      document.documentElement.style.setProperty('--accent-ink', color);
      inkDots.forEach((d) => d.classList.remove('is-active'));
      dot.classList.add('is-active');
    });
  });
  if (inkDots[0]) inkDots[0].classList.add('is-active');

  /* ---------- Mobile nav ---------- */
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Sticky header + back-to-top ---------- */
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    siteHeader.classList.toggle('is-scrolled', y > 8);
    backToTop.hidden = y < 500;
    backToTop.classList.toggle('is-visible', y >= 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scrollspy for nav ---------- */
  const navLinks = document.querySelectorAll('.main-nav a[data-section]');
  const sections = Array.from(navLinks)
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.dataset.section === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((sec) => spy.observe(sec));
  }

  /* ---------- Scroll reveal for sections (unified .reveal system) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Scroll progress bar + back-to-top ring ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    if (scrollProgress) scrollProgress.style.width = `${pct}%`;
    backToTop.style.setProperty('--scroll-pct', pct.toFixed(1));
  }, { passive: true });

  /* ---------- Cursor glow in hero ---------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (hero && cursorGlow && canHover) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      cursorGlow.style.left = `${e.clientX - rect.left}px`;
      cursorGlow.style.top = `${e.clientY - rect.top}px`;
    });
  }

  /* ---------- Magnetic pull on primary/ghost buttons ---------- */
  if (canHover) {
    document.querySelectorAll('.btn:not(.btn-checkout)').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Click ripple for buttons ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .add-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });

  /* ---------- Subtle parallax on the story image ---------- */
  const storyImg = document.getElementById('storyImg');
  if (storyImg) {
    window.addEventListener('scroll', () => {
      const rect = storyImg.parentElement.getBoundingClientRect();
      const winH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > winH) return;
      const progress = (winH - rect.top) / (winH + rect.height);
      const offset = (progress - 0.5) * 36;
      storyImg.style.transform = `translateY(${offset}px) scale(1.08)`;
    }, { passive: true });
  }

  /* ---------- Newsletter (demo submit, no backend) ---------- */
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    const original = submitBtn.textContent;
    showToast(`Subscribed — welcome, ${emailInput.value}`);
    submitBtn.textContent = 'Subscribed ✓';
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.textContent = original;
      submitBtn.disabled = false;
      newsletterForm.reset();
    }, 1600);
  });

  /* ---------- Init ---------- */
  renderProducts();
  renderCart();
  renderWishlist();
  moveFilterIndicator(document.querySelector('.filter-btn.is-active'));
  window.addEventListener('resize', () => {
    moveFilterIndicator(document.querySelector('.filter-btn.is-active'));
  });
})();