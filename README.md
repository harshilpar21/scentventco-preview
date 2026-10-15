# Scentvent Co. Luxury E-commerce Website

A fast, multi-page luxury e-commerce storefront built from the supplied Scentvent Co. logo and product imagery.

## Pages
- `index.html` — Home
- `about.html` — Founder story of Jay Vyas, brand origin, values and quality promise
- `products.html` — Product catalogue with filters
- `discovery.html` — Privé Discovery Box product page
- `rituals.html` — Room Ritual Collection

## Included
- Dark and light mode toggle (remembered in the visitor browser)
- Premium custom cursor on desktop
- Smooth scroll progress, parallax, hover tilt, page transitions, scroll-reveal and scrolly Room Ritual section
- Mobile menu and responsive layout
- Separate product-image crops created from the supplied group photos
- Lightweight local shopping bag demo (stored in browser local storage)
- Optimized WebP images, no external font or JavaScript framework dependencies

## Run locally
Open `index.html` in a browser, or use a simple static server. Example:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Before launch
Replace demo prices, add final product descriptions/ingredients, connect the **Proceed to checkout** action to Shopify, WooCommerce or Razorpay, and connect the newsletter form to your email platform. The website files use no third-party libraries, helping page loads stay lean on normal web hosting.


Founder update:
- Added founder photo of Jay Vyas.
- Added emotional founder journey, wife/life-partner inspiration, China manufacturing research, global sample response and hands-on quality story.
- Added lightweight scroll animations, dark/light theme support and optimized WebP assets for fast loading.


## Deep Founder Story Update
This version includes a longer emotional founder journey for Jay Vyas, wife/life-partner inspiration, room spray origin, international sample response, China manufacturing research, bottle-by-bottle quality narrative, and stronger purchase-focused storytelling sections.


## WhatsApp Buy Now setup

The storefront no longer uses a shopping cart or checkout drawer. Product `Buy Now` buttons open WhatsApp with the product name, price, quantity and total pre-filled.

Before publishing, open `script.js` and replace:

```js
const WHATSAPP_NUMBER = '91XXXXXXXXXX';
```

with the Scentvent Co. WhatsApp number in international format, without `+`, spaces or dashes. Example format: `919876543210`.

The new transparent PNG icon is `assets/scentvent-icon.png`. It is used for the website logo and PNG favicon.


## New Scentvent Co. management features
- Added `blog.html` Journal with FAQ-friendly article structure.
- Added `contact.html` manufacturing/private-label enquiry form. Enquiries are stored in browser localStorage for this static build.
- Added `admin.html` for product/category editing, Journal publishing/editing, enquiry review and JSON export.
- Added Room Spray category/filter and a Home Room Rituals / Room Spray section.
- Added FAQ content and Organization/Blog/Contact structured data for SEO, GEO and AEO-friendly discoverability.

### Important production note
This ZIP is still a static website. The Admin Panel is a browser-local content manager using localStorage; it is not a secure multi-user backend. For production, connect the same admin UI to Firebase, Supabase, or a server API with authentication and database storage. Do not treat the client-side admin code as secure authentication.

### Optional local backend
Run `npm start` from the project folder and open `http://localhost:3000`. This starts a dependency-free Node API under `/api/products`, `/api/blogs` and `/api/leads` and serves the website. The included admin UI remains browser-local by default; connect its CRUD actions to these endpoints (or Firebase/Supabase) for multi-device persistence and authentication before production.


## Category update — Luxury Perfumes · Room Spray · Agarbatti (October 2026)
- The shop is now divided into **3 categories**: **Luxury Perfumes** (Eau de Parfum, Royal Extrait, Privé Discovery Box), **Room Spray** (4 camphor room sprays) and **Agarbatti** (new: Chandan, Gulab, Kesar Chandan, Oudh).
- `products.html`: "Shop by category" tiles, filter buttons with product counts, and the product grid grouped under each category heading. Direct links work: `products.html#luxury-perfumes`, `products.html#room-spray`, `products.html#agarbatti`.
- `index.html`: new "Three collections" section and the Agarbatti section changed from *Coming Soon* to *Now available* with a Shop Agarbatti button. FAQ and SEO text updated; Product/ItemList structured data added on the products page.
- New shared file `catalog.js` holds the categories, products and journal seed data for both the website and the admin. Visitors who already had the old catalogue saved in their browser are upgraded automatically (their edits are kept; only the new Agarbatti products and article are added).
- Admin Panel: category cards and filters, a **Category** dropdown with the 3 categories, a **Type label** field (text on the product card), and **image upload** (compressed and saved in the browser). Admin login stays signed in for the browser tab and has a Log out button.
- New images: `assets/agarbatti-*.webp` (4 products + `agarbatti-lineup.webp`). Room spray card images were re-cropped so the full bottle is visible.
- **Agarbatti prices (₹149 / ₹149 / ₹179 / ₹199) are placeholders** — change them in Admin → Products → Agarbatti. Replace the illustrated agarbatti images with real product photos when available (upload in Admin, or overwrite the files in `assets/` with the same names).

### UI fixes in this update
- Fixed empty/blank areas: product cards on Home and Products were rendered after the scroll animations started, so they stayed invisible. They now render first.
- Fixed the "Set the mood" scroll section leaving a large blank band (sticky layout now works).
- Fixed sideways scrolling / white strip on mobile.
- Fixed a blank page when returning with the browser Back button, and same-page category links no longer fade the page out.
- Slightly tighter spacing between sections; removed a stray HTML tag and a broken footer link attribute.


## Agarbatti range — real products with photo galleries (October 2026)
- **Available (₹799 · 100 g · Premium Masala Agarbatti):** Aahuti (आहुति · Dhoopam Samarpayami), Pushpanjali (पुष्पांजलि · Sugandhim Pushtivardhanam), Samidha (समिधा · Shanti Samarpayami), Somdhara (सोमधारा · Pushpam Samarpayami). Each has 3 photos: front, back and side (`assets/agarbatti-<name>-1/2/3.webp`).
- **Coming soon (Oudh Agarbatti):** Noor Al Oudh (Divine Light), Layl Al Sahra (Desert Night), Majlis Al Oudh (Amber Majlis). Cards show a "Coming Soon" badge and a **Notify me** button that opens WhatsApp.
- Product details (method, ingredients, how-to steps, MRP, weight, quotes) are taken from the box artwork.
- The earlier illustrated placeholder agarbatti (Chandan, Gulab, Kesar Chandan, Oudh) were removed; browsers that saved the previous catalogue are upgraded automatically (owner edits and owner-added products are kept).
- **Product quick view:** clicking a product photo opens a gallery (arrows, thumbnails, swipe on phones, keyboard arrows) with full details, quantity and Buy Now on WhatsApp. Cards with several photos show a photo count and reveal the 2nd photo on hover. Share a product directly with `products.html?product=agarbatti-aahuti`.
- **Admin:** each product now has an image gallery (add by path or upload several photos at once, set main image, reorder, remove), plus Status (Available / Coming soon), Hindi name, net weight, tagline, quote, details and how-to steps.
- New `assets/agarbatti-lineup.webp` (real boxes) is used on the Home page and the Agarbatti category tile.

### About page logo
- The "Choose by emotion" section on `about.html` now shows the original full logo (`assets/brand-logo.webp`: owl perfume bottle + "SCENTVENTCO · Luxury Fragrance") in a square gold-framed plaque. It is no longer stretched, rotated or cut off. The Contact page header uses the same logo. The old cropped `brand-crest.webp` was removed.

### Menu + duplicate fix
- Every page now has the same top menu: Home, About, Products, Discovery, Room Rituals, Journal, Contact (with the current page highlighted).
- Products saved twice in the browser (for example ₹0 copies of Aahuti, Pushpanjali, Samidha, Somdhara added by hand in the admin) are cleaned up automatically; the copy with the real photos and price is kept.
- The shop never shows a product with no price and a Buy Now button. In the admin such items are marked "No price · hidden" — add a price, or set the status to Coming soon, to show them.
