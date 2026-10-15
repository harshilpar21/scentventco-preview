(() => {
  'use strict';
  const C = window.ScentventCatalog;
  const { PRODUCT_KEY, BLOG_KEY, LEAD_KEY, CATEGORIES, seedProducts, seedBlogs } = C;
  const ADMIN_CODE = 'SCENTVENT2026'; // Change before production. Client-side codes are not real security.
  const SESSION_KEY = 'scentvent-admin-session';

  const get = (k, seed) => C.read(k, seed);
  const set = (k, v) => {
    if (!C.write(k, v)) alert('Could not save. Browser storage is full — use image paths (assets/...) or smaller images.');
  };
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const login = $('#adminLogin'), dash = $('#adminDashboard');
  let productFilter = 'all';

  function enter() { login.classList.add('is-hidden'); dash.classList.remove('is-hidden'); renderAll(); }
  function tryLogin() {
    if ($('#adminPin').value.trim() === ADMIN_CODE) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
      enter();
    } else {
      $('#adminError').textContent = 'Invalid admin code.';
    }
  }
  $('#adminLoginBtn')?.addEventListener('click', tryLogin);
  $('#adminPin')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
  $('#adminLogout')?.addEventListener('click', () => { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} location.reload(); });
  try { if (sessionStorage.getItem(SESSION_KEY) === '1') enter(); } catch (e) {}

  function products() { return get(PRODUCT_KEY, seedProducts).map((p) => ({ ...p, category: C.normalizeCategory(p.category) })); }

  function renderAll() { renderCategories(); renderProducts(); renderBlogs(); renderLeads(); $('#leadCount').textContent = get(LEAD_KEY, []).length; }

  function renderCategories() {
    const el = $('#categoryCards'); if (!el) return;
    const all = products();
    el.innerHTML = CATEGORIES.map((c) => {
      const items = all.filter((p) => p.category === c.name);
      const live = items.filter((p) => p.published).length;
      return `<button type="button" class="admin-cat-card ${productFilter === c.key ? 'is-active' : ''}" data-cat-filter="${c.key}"><img src="${attr(c.image)}" alt=""><span><b>${esc(c.name)}</b><small>${items.length} products · ${live} published</small></span></button>`;
    }).join('');
    const chips = $('#categoryChips');
    if (chips) {
      chips.innerHTML = [`<button type="button" class="filter-button ${productFilter === 'all' ? 'is-active' : ''}" data-cat-filter="all">All (${all.length})</button>`]
        .concat(CATEGORIES.map((c) => `<button type="button" class="filter-button ${productFilter === c.key ? 'is-active' : ''}" data-cat-filter="${c.key}">${esc(c.name)} (${all.filter((p) => p.category === c.name).length})</button>`)).join('');
    }
    $$('[data-cat-filter]').forEach((b) => b.onclick = () => { productFilter = b.dataset.catFilter; renderCategories(); renderProducts(); });
  }

  function renderProducts() {
    const body = $('#productTable'); if (!body) return;
    const cat = C.categoryByKey(productFilter);
    const list = products().filter((p) => !cat || p.category === cat.name);
    body.innerHTML = list.length ? list.map((p) => `<tr><td><div class="admin-product"><img src="${attr(C.imagesOf(p)[0] || '')}" alt=""><span><b>${esc(p.name)}${p.nameLocal ? ` <i lang="hi">${esc(p.nameLocal)}</i>` : ''}</b><small>${esc(p.fullName)} · ${C.imagesOf(p).length} ${C.imagesOf(p).length === 1 ? 'photo' : 'photos'}</small></span></div></td><td>${esc(p.category)}<small class="admin-sub">${esc(p.tag || '')}</small></td><td>${C.isSoon(p) ? '—' : '₹' + Number(p.price).toLocaleString('en-IN')}</td><td><span class="status ${p.published ? 'is-live' : ''}">${p.published ? 'Published' : 'Draft'}</span>${C.isSoon(p) ? '<span class="status is-soon">Coming soon</span>' : ''}${C.isUnpriced(p) ? '<span class="status is-warn" title="Add a price or set Coming soon to show it on the website">No price · hidden</span>' : ''}</td><td><button class="table-btn" data-edit-product="${attr(p.id)}">Edit</button><button class="table-btn danger" data-delete-product="${attr(p.id)}">Delete</button></td></tr>`).join('')
      : `<tr><td colspan="5"><div class="empty-state">No products in this category yet. Click “+ Add Product”.</div></td></tr>`;
    body.querySelectorAll('[data-edit-product]').forEach((b) => b.onclick = () => openProduct(b.dataset.editProduct));
    body.querySelectorAll('[data-delete-product]').forEach((b) => b.onclick = () => {
      if (confirm('Delete this product?')) { set(PRODUCT_KEY, get(PRODUCT_KEY, seedProducts).filter((x) => x.id !== b.dataset.deleteProduct)); renderAll(); }
    });
  }

  function renderBlogs() {
    const el = $('#blogAdminList'); if (!el) return;
    el.innerHTML = get(BLOG_KEY, seedBlogs).map((b) => `<article class="admin-list-card"><div><span class="status ${b.published ? 'is-live' : ''}">${b.published ? 'Published' : 'Draft'}</span><h3>${esc(b.title)}</h3><p>${esc(b.excerpt)}</p><small>${esc(b.category)} · ${esc(b.date)}</small></div><div><button class="table-btn" data-edit-blog="${attr(b.id)}">Edit</button><button class="table-btn danger" data-delete-blog="${attr(b.id)}">Delete</button></div></article>`).join('');
    el.querySelectorAll('[data-edit-blog]').forEach((b) => b.onclick = () => openBlog(b.dataset.editBlog));
    el.querySelectorAll('[data-delete-blog]').forEach((b) => b.onclick = () => { if (confirm('Delete this article?')) { set(BLOG_KEY, get(BLOG_KEY, seedBlogs).filter((x) => x.id !== b.dataset.deleteBlog)); renderAll(); } });
  }

  function renderLeads() {
    const el = $('#leadList'); if (!el) return;
    const leads = get(LEAD_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
    el.innerHTML = leads.length ? leads.map((l) => `<article class="admin-list-card"><div><span class="status is-live">New enquiry</span><h3>${esc(l.name)} — ${esc(l.requirement)}</h3><p><b>Business:</b> ${esc(l.business || '—')} · <b>Phone:</b> ${esc(l.phone)} · <b>Email:</b> ${esc(l.email)}</p><p><b>Quantity:</b> ${esc(l.quantity || 'Not specified')}</p><p>${esc(l.message)}</p><small>${new Date(l.createdAt).toLocaleString('en-IN')}</small></div><div><button class="table-btn danger" data-delete-lead="${attr(l.id)}">Remove</button></div></article>`).join('') : '<div class="empty-state">No enquiries yet.</div>';
    el.querySelectorAll('[data-delete-lead]').forEach((b) => b.onclick = () => { set(LEAD_KEY, get(LEAD_KEY, []).filter((x) => x.id !== b.dataset.deleteLead)); renderAll(); });
  }

  const modal = $('#contentModal'), form = $('#contentForm');

  function openProduct(id) {
    const preset = C.categoryByKey(productFilter) || CATEGORIES[0];
    const existing = id ? products().find((x) => x.id === id) : null;
    const p = existing || { id: 'p-' + Date.now(), name: '', fullName: '', price: 0, category: preset.name, tag: preset.tag, slug: '', image: '', images: [], description: '', published: false, status: 'available' };
    let gallery = C.imagesOf(p).slice();
    $('#modalEyebrow').textContent = existing ? 'Edit product' : 'New product';
    $('#modalTitle').textContent = existing ? 'Edit product' : 'Add product';
    const catOptions = CATEGORIES.map((c) => `<option value="${attr(c.name)}" ${p.category === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
    form.innerHTML = `<input type="hidden" name="id" value="${attr(p.id)}">
      <div class="admin-two"><label>Product name<input name="name" required value="${attr(p.name)}" placeholder="e.g. Aahuti"></label><label>Full product name<input name="fullName" required value="${attr(p.fullName)}" placeholder="e.g. Aahuti Premium Masala Agarbatti"></label></div>
      <div class="admin-three"><label>Category<select name="category" id="productCategory">${catOptions}</select></label><label>Type label (shown on card)<input name="tag" value="${attr(p.tag || '')}" placeholder="e.g. Masala Agarbatti"></label><label>Price (₹)<input name="price" type="number" min="0" value="${Number(p.price) || 0}"></label></div>
      <div class="admin-three"><label>Status<select name="status"><option value="available" ${p.status !== 'coming-soon' ? 'selected' : ''}>Available — Buy Now</option><option value="coming-soon" ${p.status === 'coming-soon' ? 'selected' : ''}>Coming soon — Notify me</option></select></label><label>Hindi name (optional)<input name="nameLocal" value="${attr(p.nameLocal || '')}" placeholder="e.g. आहुति"></label><label>Net weight (optional)<input name="weight" value="${attr(p.weight || '')}" placeholder="e.g. 100 g"></label></div>
      <div class="admin-gallery-field"><p class="admin-field-label">Product images <small>(first image is the main card photo · hover shows the 2nd)</small></p><div class="admin-gallery" id="galleryList"></div>
        <div class="admin-gallery-add"><input id="galleryPath" placeholder="assets/your-image.webp"><button type="button" class="button" id="galleryAddPath">Add path</button><label class="button is-solid upload-btn">Upload images<input type="file" id="galleryUpload" accept="image/*" multiple hidden></label></div>
        <small class="admin-hint">Best: portrait 4:5 photos (e.g. 960×1200). Uploads are compressed and stored in this browser — for many products, add files to the assets folder and use paths.</small></div>
      <div class="admin-two"><label>Tagline (optional)<input name="tagline" value="${attr(p.tagline || '')}" placeholder="e.g. Dhoopam Samarpayami"></label><label>Short description (card)<input name="description" value="${attr(p.description || '')}" placeholder="e.g. A sacred dhoop offering for daily puja."></label></div>
      <label>Quote (optional)<input name="quote" value="${attr(p.quote || '')}" placeholder="e.g. I am the pure fragrance of the earth."></label>
      <label>Product details (shown in product view)<textarea name="details" rows="3" placeholder="Ingredients, method, usage…">${esc(p.details || '')}</textarea></label>
      <label>How to use (one step per line, optional)<textarea name="howTo" rows="3">${esc((p.howTo || []).join('\n'))}</textarea></label>
      <label class="check-row"><input type="checkbox" name="published" ${p.published ? 'checked' : ''}> Publish on website</label>
      <p class="admin-error" id="productError" role="alert"></p>
      <button class="button is-solid" type="submit">Save Product</button>`;
    const list = $('#galleryList');
    function drawGallery() {
      list.innerHTML = gallery.length ? gallery.map((src, i) => `<figure class="admin-thumb ${i === 0 ? 'is-main' : ''}"><img src="${attr(src)}" alt="Image ${i + 1}"><figcaption>${i === 0 ? 'Main' : '#' + (i + 1)}</figcaption><div class="admin-thumb-actions">${i > 0 ? `<button type="button" data-g-main="${i}" title="Make main image">★</button><button type="button" data-g-left="${i}" title="Move left">←</button>` : ''}<button type="button" data-g-del="${i}" title="Remove image" class="danger">✕</button></div></figure>`).join('') : '<div class="empty-state admin-gallery-empty">No images yet — add a path or upload photos.</div>';
      list.querySelectorAll('[data-g-del]').forEach((b) => b.onclick = () => { gallery.splice(Number(b.dataset.gDel), 1); drawGallery(); });
      list.querySelectorAll('[data-g-main]').forEach((b) => b.onclick = () => { const [img] = gallery.splice(Number(b.dataset.gMain), 1); gallery.unshift(img); drawGallery(); });
      list.querySelectorAll('[data-g-left]').forEach((b) => b.onclick = () => { const i = Number(b.dataset.gLeft); [gallery[i - 1], gallery[i]] = [gallery[i], gallery[i - 1]]; drawGallery(); });
    }
    drawGallery();
    $('#galleryAddPath').onclick = () => { const v = $('#galleryPath').value.trim(); if (v) { gallery.push(v); $('#galleryPath').value = ''; drawGallery(); } };
    $('#galleryPath').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#galleryAddPath').click(); } });
    $('#galleryUpload').addEventListener('change', async (e) => {
      const files = [...(e.target.files || [])];
      for (const file of files) {
        try { gallery.push(await compressImage(file, 960, 1200)); } catch (err) { $('#productError').textContent = `Could not read ${file.name}. Try JPG, PNG or WebP.`; }
      }
      e.target.value = ''; drawGallery();
    });
    $('#productCategory').addEventListener('change', (e) => {
      const tagInput = form.querySelector('[name="tag"]');
      const prevCat = CATEGORIES.find((c) => c.tag === tagInput.value.trim());
      if (!tagInput.value.trim() || prevCat) tagInput.value = (CATEGORIES.find((c) => c.name === e.target.value) || {}).tag || '';
    });
    openModal();
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!gallery.length) { $('#productError').textContent = 'Add at least one product image.'; return; }
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const text = (k) => String(fd.get(k) || '').trim();
      const item = {
        ...(existing || {}),
        id: fd.get('id') || 'p-' + Date.now(), name, fullName: text('fullName'), nameLocal: text('nameLocal'),
        price: Number(fd.get('price') || 0), category: C.normalizeCategory(fd.get('category')), tag: text('tag'),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: gallery[0], images: gallery.slice(),
        status: fd.get('status') === 'coming-soon' ? 'coming-soon' : 'available',
        weight: text('weight'), tagline: text('tagline'), description: text('description'), quote: text('quote'), details: text('details'),
        howTo: text('howTo').split('\n').map((x) => x.trim()).filter(Boolean),
        published: fd.get('published') === 'on'
      };
      if (item.status === 'available' && !item.price) { $('#productError').textContent = 'Add a price, or set the status to Coming soon.'; return; }
      const all = get(PRODUCT_KEY, seedProducts);
      const i = all.findIndex((x) => x.id === item.id);
      if (i >= 0) all[i] = item; else all.push(item);
      set(PRODUCT_KEY, all); closeModal(); renderAll();
    };
  }

  function compressImage(file, maxW, maxH) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width, maxH / img.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          let data = canvas.toDataURL('image/webp', 0.82);
          if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', 0.84);
          resolve(data);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function openBlog(id) {
    const b = get(BLOG_KEY, seedBlogs).find((x) => x.id === id) || { id: 'b-' + Date.now(), title: '', excerpt: '', category: 'Fragrance Guide', date: new Date().toISOString().slice(0, 10), content: '', published: false };
    $('#modalEyebrow').textContent = id ? 'Edit article' : 'New article';
    $('#modalTitle').textContent = id ? 'Edit journal article' : 'Add journal article';
    form.innerHTML = `<input type="hidden" name="id" value="${attr(b.id)}"><label>Title<input name="title" required value="${attr(b.title)}"></label><label>Excerpt<textarea name="excerpt" rows="3" required>${esc(b.excerpt)}</textarea></label><div class="admin-two"><label>Category<input name="category" value="${attr(b.category)}" list="blogCats"><datalist id="blogCats"><option>Luxury Perfumes</option><option>Room Spray</option><option>Agarbatti</option><option>Fragrance Guide</option><option>Manufacturing</option></datalist></label><label>Date<input type="date" name="date" value="${attr(b.date)}"></label></div><label>Article content<textarea name="content" rows="10" required>${esc(b.content)}</textarea></label><label class="check-row"><input type="checkbox" name="published" ${b.published ? 'checked' : ''}> Publish article</label><button class="button is-solid" type="submit">Save Article</button>`;
    openModal();
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const item = { id: fd.get('id') || 'b-' + Date.now(), title: fd.get('title').trim(), excerpt: fd.get('excerpt').trim(), category: fd.get('category').trim(), date: fd.get('date'), content: fd.get('content').trim(), published: fd.get('published') === 'on' };
      const all = get(BLOG_KEY, seedBlogs); const i = all.findIndex((x) => x.id === item.id);
      if (i >= 0) all[i] = item; else all.unshift(item);
      set(BLOG_KEY, all); closeModal(); renderAll();
    };
  }

  function openModal() { modal.classList.remove('is-hidden'); document.body.classList.add('is-locked'); }
  function closeModal() { modal.classList.add('is-hidden'); document.body.classList.remove('is-locked'); }
  $('#closeModal')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('is-hidden')) closeModal(); });
  $('#newProduct')?.addEventListener('click', () => openProduct());
  $('#newBlog')?.addEventListener('click', () => openBlog());

  $$('[data-admin-tab]').forEach((btn) => btn.onclick = () => {
    $$('.admin-panel').forEach((x) => x.classList.add('is-hidden'));
    $('#panel-' + btn.dataset.adminTab).classList.remove('is-hidden');
    $$('[data-admin-tab]').forEach((b) => b.classList.toggle('is-solid', b === btn));
  });

  $('#exportData')?.addEventListener('click', () => {
    const data = { products: get(PRODUCT_KEY, seedProducts), blogs: get(BLOG_KEY, seedBlogs), leads: get(LEAD_KEY, []), categories: CATEGORIES.map((c) => c.name) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'scentvent-admin-export.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  });

  function esc(v = '') { return String(v ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])); }
  function attr(v = '') { return esc(v).replace(/'/g, '&#39;'); }
})();
