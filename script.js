'use strict';

(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Replace this with Scentvent Co.'s WhatsApp number in international format, without + or spaces.
  const WHATSAPP_NUMBER = '916357310396';

  // Catalogue rendering runs first, so reveal animations, tilt and Buy Now buttons attach to the real cards.
  const Catalog = window.ScentventCatalog;
  const managedProducts = Catalog ? Catalog.storefront() : [];
  const categoryOrder = Catalog ? Catalog.CATEGORIES.map((c) => c.name) : [];
  managedProducts.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  // Products page: one labelled group per category (Luxury Perfumes, Room Spray, Agarbatti).
  const shopGroups = document.querySelector('[data-shop-groups]');
  if (shopGroups && Catalog && managedProducts.length) {
    shopGroups.innerHTML = Catalog.groupsHTML(managedProducts, WHATSAPP_NUMBER);
  }

  // Category counts on filter buttons and category tiles.
  if (Catalog) {
    const counts = { all: managedProducts.length }, soon = { all: managedProducts.filter(Catalog.isSoon).length };
    Catalog.CATEGORIES.forEach((c) => {
      const items = managedProducts.filter((p) => p.category === c.name);
      counts[c.key] = items.length; soon[c.key] = items.filter(Catalog.isSoon).length;
    });
    document.querySelectorAll('[data-count-for]').forEach((el) => {
      const key = el.dataset.countFor, n = counts[key] || 0, s = soon[key] || 0, live = n - s;
      el.textContent = el.dataset.countStyle === 'text' ? `${live} ${live === 1 ? 'product' : 'products'}${s ? ` · ${s} coming soon` : ''}` : String(n);
    });
  }

  // Home "Meet the collection": first four perfumes from the admin-managed catalogue.
  const homeGrid = document.querySelector('[data-home-products]');
  if (homeGrid && Catalog) {
    const featured = managedProducts.filter((p) => p.category === 'Luxury Perfumes' && p.tag !== 'Discovery Box').slice(0, 4);
    if (featured.length) {
      homeGrid.innerHTML = featured.map((p, i) => {
        const label = p.fullName || p.name;
        return `<article class="product-card" data-reveal><div class="product-visual" data-tilt data-quick-view="${escapeAttr(p.id)}" tabindex="0" role="button" aria-label="View ${escapeAttr(label)}"><img src="${escapeAttr(p.image)}" width="480" height="600" alt="${escapeAttr(label)}" loading="lazy" decoding="async"/><span class="product-number">${String(i + 1).padStart(2, '0')}</span><span class="product-sheen"></span><button class="product-quick buy-now" data-buy-product="${escapeAttr(label)}" data-price="${Number(p.price) || 0}" type="button" aria-label="Buy ${escapeAttr(label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 6l6 6-6 6"/></svg></button></div><div class="product-meta"><div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || '')}</p></div><span class="product-price">₹${Number(p.price || 0).toLocaleString('en-IN')}</span></div></article>`;
      }).join('');
    }
  }

  // Journal page renderer.
  const blogGrid = document.querySelector('#blogGrid');
  if (blogGrid && Catalog) {
    const blogs = Catalog.blogs().filter((b) => b.published !== false);
    blogGrid.innerHTML = blogs.map((b, i) => `<article class="blog-card" data-reveal><span class="eyebrow">${escapeHTML(b.category || 'Journal')}</span><div class="blog-number">${String(i + 1).padStart(2, '0')}</div><h2>${escapeHTML(b.title)}</h2><p>${escapeHTML(b.excerpt)}</p><details><summary>Read article</summary><div class="blog-content">${escapeHTML(b.content).replace(/\n/g, '<br>')}</div></details><small>${escapeHTML(b.date || '')}</small></article>`).join('');
  }


  // Quiet, fast loader: it clears immediately after the first paint + image load.
  const loader = document.querySelector('.site-loader');
  const dismissLoader = () => {
    if (!loader) return;
    window.setTimeout(() => loader.classList.add('is-done'), 120);
  };
  if (document.readyState === 'complete') dismissLoader();
  else window.addEventListener('load', dismissLoader, { once: true });

  // Theme is preserved per visitor.
  const themeButton = document.querySelector('[data-theme-toggle]');
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('scentvent-theme', theme); } catch (e) {}
    if (themeButton) {
      const isLight = theme === 'light';
      themeButton.setAttribute('aria-pressed', String(isLight));
      themeButton.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      themeButton.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    }
  };
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('scentvent-theme'); } catch (e) {}
  if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  else setTheme(root.dataset.theme || 'dark');
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light'));

  // Header and read-progress move with the page, without layout-heavy work.
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  let scrollTick = false;
  let previousY = window.scrollY;
  function updateScrollUI() {
    scrollTick = false;
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
    if (header) {
      header.classList.toggle('is-scrolled', y > 18);
      const shouldHide = y > previousY && y > 270 && !body.classList.contains('is-locked');
      header.classList.toggle('is-hidden', shouldHide);
    }
    previousY = y;
    updateParallax();
    updateScrolly();
    updateFloatFX();
  }
  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(updateScrollUI);
    }
  }, { passive: true });

  // Custom cursor expands over interactive objects on fine pointers only.
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!reduceMotion && dot && ring && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let dotX = 0, dotY = 0, ringX = 0, ringY = 0, tickingCursor = false;
    const drawCursor = () => {
      tickingCursor = false;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    };
    window.addEventListener('pointermove', (event) => {
      dotX = event.clientX; dotY = event.clientY;
      ringX += (dotX - ringX) * .22;
      ringY += (dotY - ringY) * .22;
      if (!tickingCursor) { tickingCursor = true; requestAnimationFrame(drawCursor); }
    }, { passive: true });
    document.querySelectorAll('a, button, input, summary').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  // Scroll reveals are controlled by the browser, avoiding third-party animation libraries.
  const revealNodes = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .11, rootMargin: '0px 0px -5% 0px' });
    revealNodes.forEach((el) => revealObserver.observe(el));
    // Safety net: anything still hidden after load (e.g. jumped past by an anchor link) becomes visible.
    window.addEventListener('load', () => window.setTimeout(() => {
      revealNodes.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible'); });
    }, 600), { once: true });
  } else revealNodes.forEach((el) => el.classList.add('is-visible'));

  // A tiny parallax layer for editorial images; only transform properties are changed.
  const parallaxNodes = document.querySelectorAll('[data-parallax]');
  function updateParallax() {
    if (reduceMotion || window.innerWidth < 760) return;
    const viewport = window.innerHeight;
    parallaxNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewport) return;
      const shift = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const target = node.querySelector('img') || node;
      target.style.transform = `translate3d(0, ${shift * -16}px, 0) scale(1.055)`;
    });
  }

  // Lightweight up/down scroll float. It gives luxury motion without loading animation libraries.
  const floatNodes = document.querySelectorAll('[data-scroll-float]');
  function updateFloatFX() {
    if (reduceMotion || !floatNodes.length) return;
    const viewport = window.innerHeight;
    floatNodes.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      if (rect.bottom < -60 || rect.top > viewport + 60) return;
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const strength = index % 2 ? -22 : 18;
      node.style.setProperty('--scroll-float', `${progress * strength}px`);
    });
  }

  // Magnetic buttons feel premium but only transform small UI elements for performance.
  const magneticTargets = document.querySelectorAll('.button, .filter-button, .shop-add');
  if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    magneticTargets.forEach((target) => {
      target.addEventListener('pointermove', (event) => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        target.style.transform = `translate3d(${x * 8}px, ${y * 7}px, 0)`;
      });
      target.addEventListener('pointerleave', () => { target.style.transform = ''; });
    });
  }

  // Hero 3D and individual product card tilt.
  const tiltTargets = document.querySelectorAll('[data-tilt]');
  if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    tiltTargets.forEach((target) => {
      const active = target.querySelector('.hero-product') || (target.matches('.product-visual') ? target : target.querySelector('.product-visual'));
      if (!active) return;
      target.addEventListener('pointermove', (event) => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        if (active.classList.contains('hero-product')) {
          active.style.transform = `translate(-50%,-50%) rotateY(${-9 + x * 16}deg) rotateX(${3 - y * 10}deg) translate3d(${x * 14}px, ${y * -10}px, 20px)`;
        } else {
          active.style.transform = `perspective(820px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
        }
      });
      target.addEventListener('pointerleave', () => {
        active.style.transform = active.classList.contains('hero-product')
          ? 'translate(-50%,-50%) rotateY(-10deg) rotateX(3deg)'
          : '';
      });
    });
  }

  // Scrolly room ritual story.
  const scrolly = document.querySelector('[data-scrolly]');
  const scrollyImage = scrolly?.querySelector('.scrolly-image img');
  const scrollyOrbit = scrolly?.querySelector('.scrolly-orbit');
  const storyItems = scrolly?.querySelectorAll('.story-item');
  function updateScrolly() {
    if (!scrolly || reduceMotion || window.innerWidth < 760) return;
    const rect = scrolly.getBoundingClientRect();
    const length = Math.max(1, scrolly.offsetHeight - window.innerHeight);
    const raw = Math.min(1, Math.max(0, -rect.top / length));
    const index = Math.min((storyItems?.length || 1) - 1, Math.floor(raw * (storyItems?.length || 1)));
    storyItems?.forEach((item, i) => item.classList.toggle('is-active', i === index));
    if (scrollyImage) scrollyImage.style.transform = `scale(${1.05 + raw * .11}) translate3d(${raw * -3}%, ${raw * -1.5}%, 0)`;
    if (scrollyOrbit) scrollyOrbit.style.transform = `rotateX(67deg) rotateZ(${10 + raw * 135}deg) scale(${1 + raw * .09})`;
  }

  // Mobile nav.
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('.mobile-menu');
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    body.classList.remove('is-locked');
  }
  menuButton?.addEventListener('click', () => {
    const willOpen = !mobileMenu?.classList.contains('is-open');
    mobileMenu?.classList.toggle('is-open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
    body.classList.toggle('is-locked', willOpen);
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  // Direct WhatsApp buying: no cart, no checkout page.
  function buyOnWhatsApp(name, price, quantity = 1) {
    const qty = Math.max(1, Number(quantity) || 1);
    const total = Number(price || 0) * qty;
    const message = [
      'Hello Scentvent Co.,',
      '',
      'I would like to buy this product:',
      `Product: ${name}`,
      `Price: ₹${Number(price || 0).toLocaleString('en-IN')}`,
      `Quantity: ${qty}`,
      `Total: ₹${total.toLocaleString('en-IN')}`,
      '',
      'Please share availability, payment and delivery details.'
    ].join('\n');
    if (WHATSAPP_NUMBER.includes('X')) {
      notify('Add your WhatsApp number in script.js first.');
      return;
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  document.querySelectorAll('[data-buy-product]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (event.target.closest('button') && event.currentTarget !== event.target.closest('button')) return;
      buyOnWhatsApp(button.dataset.buyProduct, button.dataset.price || 0, 1);
    });
    if (button.classList.contains('product-visual')) {
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          buyOnWhatsApp(button.dataset.buyProduct, button.dataset.price || 0, 1);
        }
      });
    }
  });

  // "Notify me" for Coming Soon products.
  function notifyOnWhatsApp(name) {
    const message = `Hello Scentvent Co.,\n\nPlease notify me when ${name} is available.\n\nThank you.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
  document.querySelectorAll('[data-notify-product]').forEach((button) => {
    button.addEventListener('click', () => notifyOnWhatsApp(button.dataset.notifyProduct));
  });

  // Product quick view with photo gallery (multiple images per product).
  const productById = (id) => managedProducts.find((p) => p.id === id);
  let qv = null, qvIndex = 0, qvImages = [], qvLastFocus = null, qvQty = 1, qvProduct = null;
  function buildQuickView() {
    qv = document.createElement('div');
    qv.className = 'qv';
    qv.setAttribute('role', 'dialog');
    qv.setAttribute('aria-modal', 'true');
    qv.setAttribute('aria-labelledby', 'qvTitle');
    qv.hidden = true;
    qv.innerHTML = `<div class="qv-backdrop" data-qv-close></div><div class="qv-panel"><button class="qv-close" type="button" data-qv-close aria-label="Close product details">×</button><div class="qv-gallery"><div class="qv-stage"><div class="qv-track"></div><button class="qv-nav is-prev" type="button" aria-label="Previous photo">‹</button><button class="qv-nav is-next" type="button" aria-label="Next photo">›</button><span class="qv-counter" aria-live="polite"></span></div><div class="qv-thumbs" role="tablist" aria-label="Product photos"></div></div><div class="qv-info"></div></div>`;
    document.body.appendChild(qv);
    qv.querySelectorAll('[data-qv-close]').forEach((el) => el.addEventListener('click', closeQuickView));
    qv.querySelector('.is-prev').addEventListener('click', () => goTo(qvIndex - 1));
    qv.querySelector('.is-next').addEventListener('click', () => goTo(qvIndex + 1));
    const stage = qv.querySelector('.qv-stage');
    let startX = null;
    stage.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 40) goTo(qvIndex + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', () => { startX = null; });
  }
  function goTo(i) {
    if (!qvImages.length) return;
    qvIndex = (i + qvImages.length) % qvImages.length;
    qv.querySelector('.qv-track').style.transform = `translate3d(${-qvIndex * 100}%,0,0)`;
    qv.querySelectorAll('.qv-thumb').forEach((t, k) => { t.classList.toggle('is-active', k === qvIndex); t.setAttribute('aria-selected', String(k === qvIndex)); });
    qv.querySelector('.qv-counter').textContent = qvImages.length > 1 ? `${qvIndex + 1} / ${qvImages.length}` : '';
  }
  function openQuickView(id, trigger) {
    const p = productById(id);
    if (!p || !Catalog) return;
    if (!qv) buildQuickView();
    qvProduct = p; qvQty = 1; qvLastFocus = trigger || document.activeElement;
    qvImages = Catalog.imagesOf(p);
    const label = p.fullName || p.name;
    const soon = Catalog.isSoon(p);
    qv.classList.toggle('is-single', qvImages.length < 2);
    qv.querySelector('.qv-track').innerHTML = qvImages.map((src, k) => `<figure class="qv-slide"><img src="${escapeAttr(src)}" alt="${escapeAttr(label)} — photo ${k + 1} of ${qvImages.length}" ${k ? 'loading="lazy"' : ''} decoding="async"/></figure>`).join('');
    qv.querySelector('.qv-thumbs').innerHTML = qvImages.length > 1 ? qvImages.map((src, k) => `<button class="qv-thumb" type="button" role="tab" data-qv-thumb="${k}" aria-label="Show photo ${k + 1}"><img src="${escapeAttr(src)}" alt="" loading="lazy"/></button>`).join('') : '';
    qv.querySelectorAll('[data-qv-thumb]').forEach((t) => t.addEventListener('click', () => goTo(Number(t.dataset.qvThumb))));
    const howTo = Array.isArray(p.howTo) && p.howTo.length ? `<div class="qv-block"><p class="qv-label">How to create a sacred space</p><ol>${p.howTo.map((step) => `<li>${escapeHTML(step)}</li>`).join('')}</ol></div>` : '';
    const facts = [p.weight ? `<span><b>Net wt.</b> ${escapeHTML(p.weight)}</span>` : '', p.tag ? `<span><b>Type</b> ${escapeHTML(p.tag)}</span>` : ''].join('');
    qv.querySelector('.qv-info').innerHTML = `<p class="eyebrow">${escapeHTML(p.category)}${soon ? ' · Coming soon' : ''}</p>
      <h2 id="qvTitle">${escapeHTML(p.name)}${p.nameLocal ? ` <span class="name-local" lang="hi">${escapeHTML(p.nameLocal)}</span>` : ''}</h2>
      ${p.tagline ? `<p class="qv-tagline">${escapeHTML(p.tagline)}</p>` : ''}
      <div class="qv-price-row">${soon ? '<strong class="qv-price is-soon">Coming soon</strong>' : `<strong class="qv-price">${Catalog.money(p.price)}</strong><span class="qv-mrp">MRP · incl. of all taxes</span>`}</div>
      ${p.description ? `<p class="qv-desc">${escapeHTML(p.description)}</p>` : ''}
      ${p.quote ? `<blockquote class="qv-quote">“${escapeHTML(p.quote)}”</blockquote>` : ''}
      ${facts ? `<div class="qv-facts">${facts}</div>` : ''}
      ${p.details ? `<div class="qv-block"><p class="qv-label">About this product</p><p>${escapeHTML(p.details)}</p></div>` : ''}
      ${howTo}
      <div class="qv-actions">${soon
        ? `<button class="button is-solid" type="button" data-qv-notify>Notify me on WhatsApp <span>↗</span></button>`
        : `<div class="quantity-control" aria-label="Quantity"><button type="button" data-qv-qty="-1" aria-label="Decrease quantity">−</button><span data-qv-qty-value>1</span><button type="button" data-qv-qty="1" aria-label="Increase quantity">+</button></div><button class="button is-solid" type="button" data-qv-buy>Buy Now on WhatsApp <span>↗</span></button>`}</div>
      <p class="qv-note">${soon ? 'We will message you on WhatsApp as soon as it launches.' : 'Your order is confirmed directly on WhatsApp.'}</p>`;
    qv.querySelectorAll('[data-qv-qty]').forEach((b) => b.addEventListener('click', () => {
      qvQty = Math.max(1, qvQty + Number(b.dataset.qvQty));
      qv.querySelector('[data-qv-qty-value]').textContent = String(qvQty);
    }));
    qv.querySelector('[data-qv-buy]')?.addEventListener('click', () => buyOnWhatsApp(label, p.price, qvQty));
    qv.querySelector('[data-qv-notify]')?.addEventListener('click', () => notifyOnWhatsApp(label));
    qv.querySelector('.qv-info').scrollTop = 0;
    qv.hidden = false;
    requestAnimationFrame(() => qv.classList.add('is-open'));
    body.classList.add('is-locked');
    goTo(0);
    qv.querySelector('.qv-close').focus({ preventScroll: true });
    try { const url = new URL(location.href); url.searchParams.set('product', p.id); history.replaceState(null, '', url); } catch (e) {}
  }
  function closeQuickView() {
    if (!qv || qv.hidden) return;
    qv.classList.remove('is-open');
    body.classList.remove('is-locked');
    window.setTimeout(() => { qv.hidden = true; }, reduceMotion ? 0 : 220);
    try { const url = new URL(location.href); url.searchParams.delete('product'); history.replaceState(null, '', url); } catch (e) {}
    if (qvLastFocus && qvLastFocus.focus) qvLastFocus.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-quick-view]').forEach((el) => {
    el.addEventListener('click', (event) => {
      if (event.target.closest('button')) return; // the arrow / buy buttons keep their own action
      openQuickView(el.dataset.quickView, el);
    });
    el.addEventListener('keydown', (event) => {
      if (event.target !== el) return;
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openQuickView(el.dataset.quickView, el); }
    });
  });
  window.addEventListener('keydown', (event) => {
    if (!qv || qv.hidden) return;
    if (event.key === 'ArrowRight') goTo(qvIndex + 1);
    if (event.key === 'ArrowLeft') goTo(qvIndex - 1);
    if (event.key === 'Tab') {
      const focusables = [...qv.querySelectorAll('button, a[href]')].filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  try {
    const wanted = new URL(location.href).searchParams.get('product');
    if (wanted && productById(wanted)) window.addEventListener('load', () => openQuickView(wanted), { once: true });
  } catch (e) {}

  // Product filter on the shop page (also driven by products.html#agarbatti style links).
  const filters = document.querySelectorAll('[data-filter]');
  const shopEmpty = document.querySelector('[data-shop-empty]');
  function applyFilter(filterName, scroll) {
    if (!filters.length) return false;
    const target = [...filters].find((f) => f.dataset.filter === filterName);
    if (!target) return false;
    filters.forEach((item) => {
      const active = item === target;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    document.querySelectorAll('[data-group]').forEach((group) => {
      const show = (filterName === 'all' || group.dataset.group === filterName) && !!group.querySelector('.shop-card');
      group.classList.toggle('is-hidden', !show);
      if (show) {
        visible += group.querySelectorAll('.shop-card').length;
        group.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      }
    });
    shopEmpty?.classList.toggle('is-hidden', visible > 0);
    document.querySelectorAll('[data-category-tile]').forEach((tile) => tile.classList.toggle('is-current', tile.dataset.categoryTile === filterName));
    if (scroll) {
      const bar = document.querySelector('.filter-bar');
      if (bar) window.scrollTo({ top: bar.getBoundingClientRect().top + window.scrollY - 110, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    return true;
  }
  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      applyFilter(filter.dataset.filter, false);
      const hash = filter.dataset.filter === 'all' ? ' ' : '#' + filter.dataset.filter;
      try { history.replaceState(null, '', hash === ' ' ? location.pathname : hash); } catch (e) {}
    });
  });
  const hashFilter = () => decodeURIComponent((location.hash || '').replace('#', ''));
  if (hashFilter() && applyFilter(hashFilter(), false)) {
    window.addEventListener('load', () => applyFilter(hashFilter(), true), { once: true });
  }
  window.addEventListener('hashchange', () => { if (hashFilter()) applyFilter(hashFilter(), true); });

  // Quantity component on the discovery page.
  const quantity = document.querySelector('[data-quantity]');
  const quantityValue = document.querySelector('[data-quantity-value]');
  quantity?.addEventListener('click', (event) => {
    const action = event.target.dataset.quantityAction;
    if (!action || !quantityValue) return;
    const current = Number(quantityValue.textContent || 1);
    const next = action === 'increase' ? current + 1 : Math.max(1, current - 1);
    quantityValue.textContent = String(next);
  });
  const detailBuy = document.querySelector('[data-detail-buy]');
  detailBuy?.addEventListener('click', () => {
    const count = Number(quantityValue?.textContent || 1);
    buyOnWhatsApp(detailBuy.dataset.detailBuy, detailBuy.dataset.price || 0, count);
  });

  // Forms stay local until an email platform is connected.
  document.querySelectorAll('[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = form.querySelector('input[type="email"]')?.value.trim();
      const note = form.parentElement?.querySelector('.form-note');
      if (!email) return;
      if (note) note.textContent = `${email} is now on the Scentvent Co. list.`;
      form.reset();
    });
  });

  const LEAD_KEY = 'scentvent-leads';
  function readLocal(key, seed){try{const x=JSON.parse(localStorage.getItem(key));return Array.isArray(x)?x:seed}catch(e){return seed}}

  // Manufacturing / private-label enquiry inbox for the admin panel.
  document.querySelectorAll('[data-lead-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const fd = new FormData(form); const lead = Object.fromEntries(fd.entries());
      lead.id = 'lead-' + Date.now(); lead.createdAt = Date.now();
      const leads = readLocal(LEAD_KEY, []); leads.push(lead); localStorage.setItem(LEAD_KEY, JSON.stringify(leads));
      const note = form.querySelector('[data-form-note]'); if (note) note.textContent = 'Thank you. Your enquiry has been recorded and the Scentvent Co. team can follow up with you.';
      form.reset();
    });
  });
  function escapeHTML(value=''){return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(value=''){return escapeHTML(value).replace(/`/g,'&#96;');}

  // Small non-blocking confirmation used for UI-only actions.
  let toastTimer;
  function notify(message) {
    const toast = document.querySelector('.toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3100);
  }

  // Page fade on internal navigation makes the separate HTML pages feel continuous.
  document.querySelectorAll('a[data-page-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const url = new URL(href, window.location.href);
      const samePage = url.pathname === window.location.pathname || (url.pathname.endsWith('/index.html') && /\/$/.test(window.location.pathname));
      if (samePage && url.hash) {
        event.preventDefault();
        closeMenu();
        const key = url.hash.slice(1);
        if (!applyFilter(key, true)) document.getElementById(key)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        try { history.replaceState(null, '', url.hash); } catch (e) {}
        return;
      }
      event.preventDefault();
      closeMenu();
      body.classList.add('is-leaving');
      window.setTimeout(() => { window.location.href = href; }, reduceMotion ? 0 : 160);
    });
  });
  // When the visitor returns with the browser Back button, the page can be restored mid-fade; show it again.
  window.addEventListener('pageshow', () => body.classList.remove('is-leaving'));

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (qv && !qv.hidden) { closeQuickView(); return; }
    closeMenu();
  });

  // Mobile bottom bar: Shop + WhatsApp, always within thumb reach on phones.
  (() => {
    const dock = document.createElement('nav');
    dock.className = 'mobile-dock';
    dock.setAttribute('aria-label', 'Quick actions');
    const onShop = /products\.html$/.test(location.pathname);
    const waText = encodeURIComponent('Hi Scentvent Co., I would like to know more about your fragrances.');
    dock.innerHTML = `<a class="dock-shop" href="${onShop ? '#shop' : 'products.html'}">${onShop ? 'Categories' : 'Shop now'}</a><a class="dock-wa" href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>WhatsApp</a>`;
    document.body.appendChild(dock);
    const shopTarget = onShop && (document.querySelector('.products-shop-section') || document.querySelector('.filter-bar'));
    if (shopTarget && !shopTarget.id) shopTarget.id = 'shop';
    const sync = () => {
      const blocked = mobileMenu?.classList.contains('is-open') || document.querySelector('.qv.is-open');
      dock.classList.toggle('is-hidden', !!blocked || window.scrollY < 120);
    };
    window.addEventListener('scroll', sync, { passive: true });
    document.addEventListener('click', () => setTimeout(sync, 60));
    document.addEventListener('keydown', () => setTimeout(sync, 60));
    sync();
  })();

  updateScrollUI();
})();
