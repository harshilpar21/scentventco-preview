/* Scentvent Co. shared catalogue: categories, seed products, seed journal posts, local-storage migration
   and the product-card markup. Loaded before script.js (website) and admin.js (admin panel). */
(() => {
  'use strict';

  const PRODUCT_KEY = 'scentvent-products';
  const BLOG_KEY = 'scentvent-blogs';
  const LEAD_KEY = 'scentvent-leads';
  const VERSION_KEY = 'scentvent-catalog-version';
  const VERSION = 4;

  // The three shop categories. `key` is used in URLs (products.html#agarbatti) and filters.
  const CATEGORIES = [
    { key: 'luxury-perfumes', name: 'Luxury Perfumes', tag: 'Eau de Parfum', image: 'assets/signature-lineup.webp', blurb: 'Eau de parfum, extrait and the Privé Discovery Box — made for confidence and gifting.' },
    { key: 'room-spray', name: 'Room Spray', tag: 'Room Spray', image: 'assets/room-ritual-lineup.webp', blurb: 'Camphor room sprays that refresh entryways, bedrooms and everyday spaces.' },
    { key: 'agarbatti', name: 'Agarbatti', tag: 'Masala Agarbatti', image: 'assets/agarbatti-lineup.webp', blurb: 'Premium masala agarbatti for puja, meditation and calm home rituals — Aahuti, Pushpanjali, Samidha and Somdhara.' }
  ];

  // Shared text for the masala agarbatti range (taken from the box).
  const AGARBATTI_DETAILS = 'Premium masala agarbatti crafted using the 500-year-old traditional method. Made with natural wood powder, pure essential oils and sacred herbs — no charcoal, no harmful chemicals. Made in Bharat with devotion.';
  const AGARBATTI_HOWTO = ['Light the tip of the incense stick.', 'Gently blow out the flame.', 'Place it on an incense holder and let the luxury spread.'];
  const agarbatti = (slug, name, nameLocal, tagline, description, quote) => ({
    id: 'agarbatti-' + slug, name, nameLocal, fullName: `${name} Premium Masala Agarbatti`, price: 799, category: 'Agarbatti', tag: 'Masala Agarbatti',
    slug: slug + '-agarbatti', image: `assets/agarbatti-${slug}-1.webp`,
    images: [1, 2, 3].map((i) => `assets/agarbatti-${slug}-${i}.webp`),
    tagline, description, quote, weight: '100 g', details: AGARBATTI_DETAILS, howTo: AGARBATTI_HOWTO, status: 'available', published: true
  });
  const oudhSoon = (slug, name, tagline, description) => ({
    id: 'agarbatti-' + slug, name, fullName: `${name} Oudh Agarbatti`, price: 0, category: 'Agarbatti', tag: 'Oudh Agarbatti',
    slug: slug + '-agarbatti', image: `assets/agarbatti-${slug}.webp`, images: [`assets/agarbatti-${slug}.webp`],
    tagline, description, status: 'coming-soon', published: true
  });

  const seedProducts = [
    { id: 'v-king', name: 'V-King', fullName: 'V-King Eau de Parfum', price: 799, category: 'Luxury Perfumes', tag: 'Eau de Parfum', slug: 'v-king', image: 'assets/v-king.webp', description: 'Dark. Bold. Regal.', published: true },
    { id: 'bright', name: 'Bright', fullName: 'Bright Eau de Parfum', price: 799, category: 'Luxury Perfumes', tag: 'Eau de Parfum', slug: 'bright', image: 'assets/bright.webp', description: 'Clean. Open. Effortless.', published: true },
    { id: 'tobacco-oudh', name: 'Tobacco Oudh', fullName: 'Tobacco Oudh Eau de Parfum', price: 899, category: 'Luxury Perfumes', tag: 'Eau de Parfum', slug: 'tobacco-oudh', image: 'assets/tobacco-oudh.webp', description: 'Deep. Warm. Distinct.', published: true },
    { id: 'vanilla', name: 'Vanilla', fullName: 'Vanilla Eau de Parfum', price: 799, category: 'Luxury Perfumes', tag: 'Eau de Parfum', slug: 'vanilla', image: 'assets/vanilla.webp', description: 'Soft. Creamy. Unforgettable.', published: true },
    { id: 'royal', name: 'Royal', fullName: 'Royal Extrait de Parfum', price: 1499, category: 'Luxury Perfumes', tag: 'Extrait de Parfum', slug: 'royal', image: 'assets/royal-extrait.webp', description: 'Warm. Refined. Elevated.', published: true },
    { id: 'discovery', name: 'Discovery Box', fullName: 'Privé Discovery Box', price: 599, category: 'Luxury Perfumes', tag: 'Discovery Box', slug: 'discovery', image: 'assets/discovery-detail.png', description: 'Try, explore, choose.', published: true },
    { id: 'gulab', name: 'Gulab Camphor', fullName: 'Gulab Camphor Room Spray', price: 299, category: 'Room Spray', tag: 'Room Spray', slug: 'gulab-camphor', image: 'assets/gulab-camphor.webp', description: 'Soft floral ritual.', published: true },
    { id: 'catchy', name: 'Catchy Camphor', fullName: 'Catchy Camphor Room Spray', price: 299, category: 'Room Spray', tag: 'Room Spray', slug: 'catchy-camphor', image: 'assets/catchy-camphor.webp', description: 'Freshened everyday spaces.', published: true },
    { id: 'chandan', name: 'Chandan Camphor', fullName: 'Chandan Camphor Room Spray', price: 299, category: 'Room Spray', tag: 'Room Spray', slug: 'chandan-camphor', image: 'assets/chandan-camphor.webp', description: 'A centred home mood.', published: true },
    { id: 'kesar', name: 'Kesar Chandan', fullName: 'Kesar Chandan Camphor Room Spray', price: 299, category: 'Room Spray', tag: 'Room Spray', slug: 'kesar-chandan', image: 'assets/kesar-chandan-camphor.webp', description: 'Warm, rich atmosphere.', published: true },
    agarbatti('aahuti', 'Aahuti', 'आहुति', 'Dhoopam Samarpayami', 'A sacred dhoop offering for daily puja.', 'I am the pure fragrance of the earth.'),
    agarbatti('pushpanjali', 'Pushpanjali', 'पुष्पांजलि', 'Sugandhim Pushtivardhanam', 'A floral offering made with love.', 'If you offer a leaf, a flower with love, I will accept it.'),
    agarbatti('samidha', 'Samidha', 'समिधा', 'Shanti Samarpayami', 'An offering of peace and calm.', 'Whatever you offer with devotion, it reaches the Divine.'),
    agarbatti('somdhara', 'Somdhara', 'सोमधारा', 'Pushpam Samarpayami', 'A serene, flowing prayer ritual.', 'May every breath you take become a prayer.'),
    oudhSoon('noor-al-oudh', 'Noor Al Oudh', 'Divine Light', 'Oudh agarbatti inspired by divine light.'),
    oudhSoon('layl-al-sahra', 'Layl Al Sahra', 'Desert Night', 'Oudh agarbatti inspired by a desert night.'),
    oudhSoon('majlis-al-oudh', 'Majlis Al Oudh', 'Amber Majlis', 'Amber and oudh for the gathering.')
  ];

  const AGARBATTI_BLOG = { id: 'agarbatti-home-ritual', title: 'Agarbatti for a Sacred Home: Aahuti, Pushpanjali, Samidha & Somdhara', excerpt: 'Meet the Scentvent Co. masala agarbatti range and learn how to create a sacred space at home.', category: 'Agarbatti', published: true, date: '2026-10-15', content: 'Every Scentvent Co. agarbatti is a premium masala agarbatti crafted using the 500-year-old traditional method, with natural wood powder, pure essential oils and sacred herbs — no charcoal and no harmful chemicals.\n\nAahuti (Dhoopam Samarpayami) is a sacred dhoop offering for daily puja. Pushpanjali (Sugandhim Pushtivardhanam) is a floral offering made with love. Samidha (Shanti Samarpayami) is an offering of peace and calm, and Somdhara (Pushpam Samarpayami) brings a serene, flowing mood to your prayer space. Each box holds 100 g.\n\nHow to create a sacred space: light the tip of the incense stick, gently blow out the flame, then place it on an incense holder and let the luxury spread. Never leave burning incense unattended, and keep it away from children, pets and fabrics.\n\nComing soon: an Oudh agarbatti collection — Noor Al Oudh, Layl Al Sahra and Majlis Al Oudh.' };

  const seedBlogs = [
    { id: 'room-spray-rituals', title: 'Room Spray Rituals: 5 Ways to Refresh Your Space', excerpt: 'A simple guide to using room spray with intention across entryways, bedrooms, living spaces and everyday reset moments.', category: 'Room Rituals', published: true, date: '2026-09-20', content: 'Room spray can become a small ritual rather than a last-minute refresh. Start with a clean space, choose one scent mood and use a light amount where air can circulate. Entryways can create a welcoming first impression, bedrooms can support a softer evening atmosphere, and living spaces can be refreshed before guests arrive.' },
    { id: 'how-to-choose-fragrance', title: 'How to Choose a Fragrance That Feels Like You', excerpt: 'A practical framework for choosing between bold, bright, warm and soft fragrance profiles.', category: 'Fragrance Guide', published: true, date: '2026-09-20', content: 'Start with the mood you want to create. Bold profiles can feel more commanding, bright profiles can feel clean and open, warm profiles can feel rich, and soft profiles can feel intimate. A discovery set can help you compare before choosing a signature.' },
    { id: 'discovery-box-guide', title: 'Why a Discovery Box Makes Fragrance Shopping Easier', excerpt: 'How sampling several scent directions can reduce guesswork when choosing a signature fragrance.', category: 'Discovery', published: true, date: '2026-09-20', content: 'A discovery box gives you a practical way to experience multiple scent directions before choosing a full-size fragrance. Test each on separate occasions and note which one fits your preferred mood and setting.' },
    { id: 'private-label-fragrance', title: 'Private Label Fragrance: What Brands Should Prepare First', excerpt: 'The key information to include when you contact a fragrance manufacturing partner.', category: 'Manufacturing', published: true, date: '2026-09-20', content: 'Brands should prepare their product category, expected quantity, packaging direction, target market and desired timeline. A clear initial brief helps a manufacturing discussion move faster and makes the first conversation more useful.' },
    AGARBATTI_BLOG
  ];

  // Placeholder agarbatti items from the previous build (replaced by the real range above).
  const RETIRED_IDS = ['agarbatti-chandan', 'agarbatti-gulab', 'agarbatti-kesar-chandan', 'agarbatti-oudh'];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function read(key, seed) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : clone(seed);
    } catch (e) { return clone(seed); }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function has(key) { try { return !!localStorage.getItem(key); } catch (e) { return false; } }

  // Maps any older category name onto one of the three current categories.
  function normalizeCategory(name = '') {
    const value = String(name).toLowerCase();
    if (value.includes('agarbat') || value.includes('incense')) return 'Agarbatti';
    if (value.includes('room') || value.includes('ritual')) return 'Room Spray';
    return 'Luxury Perfumes';
  }
  function categoryKey(name) {
    const normal = normalizeCategory(name);
    return (CATEGORIES.find((c) => c.name === normal) || CATEGORIES[0]).key;
  }
  function categoryByKey(key) { return CATEGORIES.find((c) => c.key === key); }

  // Same product saved twice (e.g. added by hand in the admin and also in the catalogue): keep the best copy.
  const nameKey = (p) => normalizeCategory(p.category) + '|' + String(p.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const seedIds = new Set(seedProducts.map((s) => s.id));
  const isUnpriced = (p) => p.status !== 'coming-soon' && !(Number(p.price) > 0);
  function score(p) {
    return (seedIds.has(p.id) ? 1000 : 0) + (!isUnpriced(p) ? 100 : 0) + (p.published !== false ? 10 : 0) + Math.min(9, (Array.isArray(p.images) ? p.images.length : 0) + (p.image ? 1 : 0));
  }
  function dedupe(list) {
    const best = new Map();
    list.forEach((p) => { const k = nameKey(p); if (!best.has(k) || score(p) > score(best.get(k))) best.set(k, p); });
    const keep = new Set([...best.values()]);
    return list.filter((p) => keep.has(p));
  }

  // Upgrades catalogues saved in a visitor's or owner's browser by older versions of the site.
  function migrate() {
    let version = 0;
    try { version = Number(localStorage.getItem(VERSION_KEY) || 0); } catch (e) { return; }
    if (version >= VERSION) return;
    const agarbattiSeeds = seedProducts.filter((s) => s.category === 'Agarbatti');

    if (has(PRODUCT_KEY)) {
      let products = read(PRODUCT_KEY, seedProducts);
      if (version < 2) {
        // v1 → v2: Personal Fragrance / Discovery / Room Spray → three categories with type labels.
        products = products.map((p) => {
          const category = normalizeCategory(p.category);
          const seed = seedProducts.find((s) => s.id === p.id);
          const tag = p.tag || (p.category === 'Discovery' ? 'Discovery Box' : (seed ? seed.tag : (CATEGORIES.find((c) => c.name === category) || {}).tag));
          return { ...p, category, tag };
        });
      }
      // v3: replace placeholder agarbatti with the real range. Products the owner deleted are not brought back.
      products = products.filter((p) => !RETIRED_IDS.includes(p.id));
      agarbattiSeeds.forEach((seed) => { if (!products.some((p) => p.id === seed.id)) products.push(clone(seed)); });
      // v4: remove duplicate copies (such as ₹0 entries added by hand) of the same product.
      products = dedupe(products);
      write(PRODUCT_KEY, products);
    } else {
      write(PRODUCT_KEY, seedProducts);
    }

    if (has(BLOG_KEY)) {
      const blogs = read(BLOG_KEY, seedBlogs);
      const i = blogs.findIndex((b) => b.id === AGARBATTI_BLOG.id);
      if (i >= 0) blogs[i] = clone(AGARBATTI_BLOG); else blogs.push(clone(AGARBATTI_BLOG));
      write(BLOG_KEY, blogs);
    } else {
      write(BLOG_KEY, seedBlogs);
    }
    if (!has(LEAD_KEY)) write(LEAD_KEY, []);
    try { localStorage.setItem(VERSION_KEY, String(VERSION)); } catch (e) {}
  }

  // ---------- shared markup ----------
  const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const imagesOf = (p) => {
    const list = (Array.isArray(p.images) ? p.images : []).filter(Boolean);
    if (p.image && !list.includes(p.image)) list.unshift(p.image);
    return list.length ? list : [p.image].filter(Boolean);
  };
  const isSoon = (p) => p.status === 'coming-soon';

  function cardHTML(p) {
    const key = categoryKey(p.category);
    const label = p.fullName || p.name;
    const imgs = imagesOf(p);
    const soon = isSoon(p);
    const alt = imgs[1] ? `<img class="card-alt-img" src="${esc(imgs[1])}" width="480" height="600" alt="" loading="lazy" decoding="async" aria-hidden="true"/>` : '';
    const photos = imgs.length > 1 ? `<span class="photo-count" aria-label="${imgs.length} photos"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.4"/><path d="M8 6l1.6-2h4.8L16 6"/></svg>${imgs.length}</span>` : '';
    const local = p.nameLocal ? `<span class="name-local" lang="hi">${esc(p.nameLocal)}</span>` : '';
    const action = soon
      ? `<span class="product-price is-soon">Coming soon</span><button class="shop-add notify-me" type="button" data-notify-product="${esc(label)}">Notify me <span>↗</span></button>`
      : `<span class="product-price">${money(p.price)}</span><button class="shop-add buy-now" type="button" data-buy-product="${esc(label)}" data-price="${Number(p.price) || 0}">Buy Now <span>↗</span></button>`;
    return `<article class="shop-card${soon ? ' is-coming-soon' : ''}${imgs[1] ? ' has-alt' : ''}" data-category="${key}" data-product-id="${esc(p.id)}" data-reveal><div class="product-visual" data-tilt data-quick-view="${esc(p.id)}" tabindex="0" role="button" aria-label="View ${esc(label)}${imgs.length > 1 ? ` — ${imgs.length} photos` : ''}"><img src="${esc(imgs[0])}" width="480" height="600" alt="${esc(label)}" loading="lazy" decoding="async"/>${alt}<span class="shop-tag">${soon ? 'Coming Soon' : esc(p.tag || p.category)}</span>${photos}<span class="quick-view-hint">View details</span><span class="product-sheen"></span></div><div class="shop-card-detail"><div><h3>${esc(p.name)}${local}</h3><p>${esc(p.tagline ? p.tagline + ' · ' + (p.description || '') : (p.description || ''))}</p></div><div>${action}</div></div></article>`;
  }

  function groupsHTML(products, whatsapp) {
    return CATEGORIES.map((c, i) => {
      const items = products.filter((p) => p.category === c.name);
      if (!items.length) return '';
      const soonCount = items.filter(isSoon).length;
      const available = items.length - soonCount;
      const countText = `${available} ${available === 1 ? 'product' : 'products'}${soonCount ? ` · ${soonCount} coming soon` : ''}`;
      const helpText = encodeURIComponent(`Hello Scentvent Co., I need help choosing from your ${c.name} collection.`);
      const fill = `<aside class="shop-fill"><p class="eyebrow">Need help choosing?</p><h4>Let us find your<br /><em>${esc(c.name.toLowerCase())}.</em></h4><p>Tell us the mood, space or occasion and we will suggest the right ${esc(c.name.toLowerCase())} on WhatsApp.</p><a class="button" href="https://wa.me/${whatsapp}?text=${helpText}" target="_blank" rel="noopener noreferrer">Ask on WhatsApp <span>↗</span></a></aside>`;
      return `<section class="shop-group" data-group="${c.key}" data-fill4="${items.length % 4}" data-fill2="${items.length % 2}" aria-labelledby="group-${c.key}"><div class="shop-group-head" data-reveal><div><p class="eyebrow">0${i + 1} · ${countText}</p><h3 id="group-${c.key}">${esc(c.name)}</h3></div><p>${esc(c.blurb)}</p></div><div class="shop-grid">${items.map(cardHTML).join('')}${fill}</div></section>`;
    }).join('');
  }

  migrate();

  window.ScentventCatalog = {
    PRODUCT_KEY, BLOG_KEY, LEAD_KEY, CATEGORIES, AGARBATTI_DETAILS, AGARBATTI_HOWTO,
    seedProducts, seedBlogs,
    read, write, normalizeCategory, categoryKey, categoryByKey,
    esc, money, imagesOf, isSoon, cardHTML, groupsHTML,
    products: () => read(PRODUCT_KEY, seedProducts).map((p) => ({ ...p, category: normalizeCategory(p.category) })),
    // What shoppers see: published, one copy per product, and never a ₹0 "Buy Now" item.
    storefront: () => dedupe(read(PRODUCT_KEY, seedProducts).map((p) => ({ ...p, category: normalizeCategory(p.category) }))).filter((p) => p.published !== false && !isUnpriced(p)),
    isUnpriced, dedupe,
    blogs: () => read(BLOG_KEY, seedBlogs),
    leads: () => read(LEAD_KEY, [])
  };
})();
