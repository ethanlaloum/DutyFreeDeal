# DutyFreeDeal Studio: build contract for the page builders

Read this whole file before writing code. It is the single source of truth for the pages you build.

## 1. What we are building

DutyFreeDeal is a global consumer marketplace (demonstration prototype, fictional data). Two equal promises: **advantageous prices** and **access to products that are hard to find in your country**. Slogan: **“Duty free, without going through the airport.”**

The owner judged every restrained version “bland” and three bold explorations “cheap” (airport signage, saturated color blocks, passport theme, animations “going in every direction”). He approved the **Studio** direction (the current home page): references **Apple, Revolut / Stripe, Farfetch / SSENSE**. The target is the look of a company worth billions: premium **and** alive.

Studio in one paragraph: products cut out and photographed as in a studio, all on the same soft backdrop with the same contact shadow; a quiet interface in black, white and grays with one typeface (Switzer); color comes from the products (and one slow light behind the home search, nowhere else); generous space, strong type scale, pill-shaped actions, one calm motion grammar.

**The site is in English only (US English).** No French anywhere in the interface: no French word, no French typography, no language switch. The data keeps `{ fr, en }` pairs from older prototypes: always display `label(value)`, which returns the English text.

Open the running site at **http://127.0.0.1:4182/** (server already running; never start another one on that port). Study the home page (`js/views/home.js`, `css/home.css`), the header panels (`js/ui/header.js`) and `css/foundation.css` before writing anything: your pages must look like they were designed by the same person.

## 2. Files

You own only the files listed for your group in section 9. **Do not edit any other file**: other agents work in parallel. Shared files are read-only for you: `index.html`, `js/app.js`, `js/core.js`, `js/data.js`, `js/art.js`, `js/icons.js`, `js/credits.js`, `js/ui/*`, `js/views/home.js`, `js/views/info.js`, `css/foundation.css`, `css/layout.css`, `css/home.css`, `css/pages.css`, `tools/*`. If you need something added to a shared file, implement it locally in your own module and say so in your report.

## 3. Runtime architecture

- No build, no framework: ES modules, hash router (`#/path?query`). Pages are **pure functions returning HTML strings**.
- Your module exports `export const views = { name(ctx) { … } }`. The router (`js/app.js`) already maps every route to `views.<name>` of your module (section 9).
- A view returns `{ title, html, surface?, mount? }`:
  - `title`: document title, e.g. `'Cart · DutyFreeDeal'`.
  - `html`: the content of `<main>` (header and footer are rendered by the app). Exactly **one `<h1>`**, with `tabindex="-1"` (the `pageHead()` component does it): the app focuses it after each navigation.
  - `surface`: background of `<main>`: `'light'` (default, white), `'studio'` (#f5f5f7, use it for the back office and the seller workspace) or `'dark'`.
  - `mount(main, ctx)`: optional; attach behavior after insertion; **return a cleanup function** that removes every listener you added to `main`, `document` or `window`.
- `ctx` = `{ params (URLSearchParams), path, match (route captures, e.g. [productId]), reason ('route' | 'state'), rerender(), go(hash), toast(message, iconName?), announce(message), openDialog(options), closeDialog() }`.
- `ctx.rerender()` re-renders the current page in place: it keeps the scroll position, the focused control (found again by `id`, or by `data-action` + `data-id` + `data-step`, or `name`) and **the values typed in every form that has a `data-form="…"` attribute**. Give every form a unique `data-form` name.
- Global actions already handled by the app, everywhere (do not reimplement them, just use the attributes):
  - `data-action="add" data-id="<offerId>"`: adds to the cart (quantity from an input with `data-qty-for="<offerId>"` if one exists on the page), toast, header counter, bag panel.
  - `data-action="fav" data-id`: toggles a saved offer (keeps `aria-pressed` of every heart in sync).
  - `data-action="qty" data-id data-step="1|-1"` and `data-action="remove" data-id`: cart quantities.
  - The pages `#/cart`, `#/checkout` and `#/wishlist` are re-rendered automatically after any cart or saved-offer change.
  - Links to in-page anchors (`href="#some-id"`) scroll to the element instead of changing the route.
- Dialogs: `ctx.openDialog({ title, body, onSubmit, size })` (`size` = `'s' | 'm' | 'l'`). With `onSubmit(values, form)`, the body is wrapped in a form; `values` are trimmed strings; return a non-empty string to show it as an error and keep the dialog open; return nothing to close it. The dialog traps focus, closes with Escape and restores focus. Do not open dialogs for things that can be inline.
- Feedback: `ctx.toast(message, iconName)` for the result of an action, `ctx.announce(message)` for screen-reader-only updates (counts after filtering, status changes).
- To open a header panel from a page (for example the delivery country), import `openPanel` from `../ui/header.js` and call `openPanel('dest', theButtonYouClicked)`.

## 4. Shared code you can import

From `../core.js`:
- State: `state` (`country`, `cart`, `favorites`, `orders`, `requests`, `applications`, `vendorStates`, `productStates`, `overrides`, `extraProducts`, `selectedVendor`), `save()`, `resetDemo()`.
- Text: `label(v)` (English of a data value), `esc(s)` (escape **every** data value you put in HTML), `normalize(s)` (search), `plural(n, one, many)` (“1 offer”, “3 offers”), `icon(name, cls)`.
- Formatting: `money(n)` (€82.00), `moneyRound(n)` (€24,900, for large goods), `number(n)`, `dateText(iso)` (“October 14, 2026”), `uid(prefix)`.
- Countries: `countries`, `countryName(code)`, `countryIn(code)` (“to France”: delivery destination), `countryAt(code)` (“in France”), `sellerIn(code)` (“Seller in France”).
- Catalog: `categories`, `vendors`, `vendor(id)`, `vendorName(v)`, `vendorState(id)`, `allProducts()`, `product(id)`, `isHidden(p)`, `publicOffer(p)`, `deliverable(p, code?)`, `stock(p)`, `isQuote(p)`, `available(p)`, `shipping(vendorId, code?)`, `shopOffers(code?)` (public + deliverable to the destination), `inCollection(p, 'deals' | 'rare', code?)` (**always use it for selections**: an offer is Hard to find only if its seller is not in the destination country), `modelKey(p)`, `cutout(key)`, `altText(p)`, `sameModel(p)` (other offers of the same product), `findCategory(id)` (`{ node, path }`), `department(id)`, `inCategory(p, id)`, `countNodes(node)`, `totalCategories()`.
- Cart: `cartCount()`, `cartLines()`, `cartGroups()` (`[{ v, lines: [{ p, qty }] }]`, one group per seller), `lineIssue(line)` (why a line cannot be ordered, or ''), `cartTotals()` (`{ subtotal, delivery, total, shipments, blocked }`), `addToCart(id, qty)` (returns an error message or ''), `setCartQty(id, qty)`, `toggleFavorite(id)`.
- Orders and simulations: `SHIPMENT_STEPS`, `shipmentLabel(status)`, `placeOrder(contact)` (returns the order or null), `advanceShipment(orderId, vendorId)`, `addRequest({ productId, kind, name, email, desiredDate, note })`, `addApplication({ type, country, name, email })`, `sellerOffers(vendorId?)`, `editOffer(id, { price, stock })`, `createOffer({ vendorId, name, category, mode, price, stock, image })`, `setProductState(id, hidden)`, `setVendorState(id, paused)`, `setApplicationStatus(id, status)`, `reviewRequest(id)`.
- Navigation: `route()`, `catalogHref(params)`, `productHref(p)`, `go(hash)`.

From `../ui/components.js` (all return HTML strings, data already escaped):
- `offerCard(p, { large, level, reveal, sizes })`: **the** offer card; use it for every grid or list of offers. `offerGrid(list, opts)`. `offerImage(p, { sizes, lazy, priority, alt })`, `cutImg(key, …)`, `thumb(p, cls)` (`thumb--s`, `thumb--l`, `thumb--xl`), `favButton(p)`, `amounts(p)` (price, then delivery on its own line), `offerAction(p)`, `sellerLine(p)`.
- `departmentArt(deptId, { large, avoid })`: the studio composition of a department card (`.aisle-stage` markup).
- `pageHead({ crumbs: [[label, href], …], title, lead, meta, actions, eyebrow })`, `breadcrumb(items)`, `emptyState({ iconName, title, text, actions })`, `chip(text, tone)` (tone: `neutral`, `success`, `warning`, `danger`, `info`), `demoTag(text)`, `notice(html, iconName)`, `statCard(value, label, hint)`, `table(headHtmlList, rowsOfCellHtml, { caption })`.
- Forms: `field({ name, text, type, value, required, help, full, extra })`, `selectField({ name, text, options: [[value, label]], value, … })`, `textareaField(…)`, `check({ name, text, type, value, checked, required })`. Labels are always visible; required fields end with an asterisk that is hidden from screen readers.

From `../ui/workspace.js`: `workspace({ kind: 'seller' | 'admin', title, lead, actions, aside, body })`: the seller workspace and back office layout (side navigation, page heading). Use it for every seller-workspace and back-office page.

Added after the first build round (use them; remove local copies that duplicate them):
- `../core.js`: `requestStatusLabel(status)` (“Request saved · simulation” / “Under review · simulation”), `requestKindLabel(kind)` (“Quote request” / “Reservation request”), `applicationStatusLabel(status)` (“Awaiting review · simulation” / “Verified · simulation” / “Needs details · simulation”) and `applicationStatusTone(status)` for its chip. **The same object must carry the same status words on every page.** Requests now store `price` (the indicative price at the time of the request). `setCartQty` caps at the example stock. `sameModel` ignores offers created by a seller in the prototype.
- `../ui/components.js`: `shipmentSteps(status, { name })`: the single shipment tracker (four steps) for the buyer, the seller and the back office; replace every local tracker with it.
- `../ui/feedback.js`: `setDialogError(message)` shows, updates or clears (empty string) the dialog's error, which now sits at the top of the dialog form; built-in messages read “Label: message”. `onSubmit` may return `false` to keep the dialog open without a message.
- `css/foundation.css`: surface tokens `--danger`, `--danger-bg`, `--success`, `--success-bg`, `--warning`, `--warning-bg`, `--info`, `--info-bg` (correct on light, studio and dark surfaces, also when nested); `.input[aria-invalid='true']` and `.select[aria-invalid='true']` get the danger border; `.field-error` for the message under a field. Never hard-code `#a3122a` or other status colors. `.table-wrap` is now `position: relative` (screen-reader-only text no longer widens the page), `.thumb img` no longer squashes tall cut-outs.
- Read-only imports are allowed from `../ui/header.js` (`refreshHeaderCounts`, `openPanel`), `../art.js` (`MAIN`, `SIZE`, `BLEED`, `BRANDED`, `CUT`, `ALT`) and `../credits.js` (`CREDITS`). The app now refreshes the header counters at every render, so a view does not need to after `placeOrder()`.
- Captions: a generated image (the car, the house: `kind` “generated-illustration” in `CREDITS`) is captioned “Generated illustration · fictional product, seller and price”, a photograph “Illustrative photograph · fictional product, seller and price”.
- Another session added an example customer account (`#/sign-in`, `state.account`, `js/views/account.js`, `css/account.css`) and a WebGL background on the home page (`js/ui/sky.js`). They are part of the site: do not modify or remove them.

From `../ui/motion.js`: `revealNow(elements)` after replacing content in place, `motionOK()`.

Icons available (`icon(name)`): search, caretDown, caretRight, caretLeft, heart, heartFill, bag, close, plus, minus, arrow, arrowLeft, globe, seal, bagOpen, check, checkCircle, list, truck, package, storefront, user, envelope, pencil, trash, eye, eyeSlash, warning, info, clock, mapPin, creditCard, receipt, squares, sliders, shield, gear, chart, house, reset, idCard, buildings, bank, tag, calendar, external, question, lock, pause, play, fileText, listChecks.

## 5. Design rules

- Reuse the classes of `css/foundation.css` and `css/layout.css` first: type (`display`, `title-xl`, `title-l`, `title-m`, `title-s`, `lead`, `soft`, `muted`, `small`, `price`), `page`, `wrap`, `section`, `section-head`, `card`, `card-head`, `card-grid`, `stats`, `btn` (`btn--primary`, `btn--secondary`, `btn--quiet`, `btn--small`, `btn--block`, `btn--danger`), `pill`, `more`, `link-btn`, `chip`, `demo-tag`, `notice`, `offers` (`offers--grid`, `offers--3`), `table`, `cell-main`, `cell-sub`, `cell-actions`, `form-grid`, `field`, `input`, `select`, `textarea`, `check`, `form-actions`, `form-error`, `qty`, `totals`, `totals-grand`, `empty`.
- New classes go in **your** CSS file with your prefix (`shop-`, `pur-`, `sel-`, `adm-`).
- **Colors**: only the surface variables (`--bg`, `--fg`, `--fg-2`, `--line`, `--line-strong`, `--fill`, `--fill-2`, `--raised`, `--ring`, `--btn-bg`, `--btn-fg`, `--well`, `--shadow`) and the status chips. No new accent color, no gradients except the existing `--well`, no colored backgrounds, no glow.
- Type: Switzer only, weights 400 to 600 (700 only for counters). Sentence case for every heading, button and label. Titles tight (`letter-spacing: -0.02em` to `-0.035em`), body 15 to 17 px, secondary 13 px.
- Shapes: cards 18 px radius, fields 12 px, every action is a pill (`border-radius: 999px`). Borders 1 px `var(--line)`. One soft shadow (`var(--shadow)`) only for floating things (summary cards may use it).
- Space: generous. Sections 72 to 136 px apart, cards padded 24 to 28 px, grids gap 20 px. Align everything on the `wrap` grid.
- Product imagery: always through `offerImage()` / `thumb()` / `offerCard()` (cut-out on the studio well, or the full photograph as a cover when there is no cut-out). Never stretch or crop a cut-out.
- Motion: put `data-reveal` on the blocks that should rise in when they enter the viewport (cards, section heads, rows of a list: not on every small element). Nothing else moves: no rotation, bounce, flip, scramble, parallax, counters that count up, or flying elements. Hover: 4 px lift at most, 600 ms.
- Desktop first: pages must be impeccable at 1440×900 and 1280×800; at 390 px wide there must be no horizontal overflow (no more is asked).

## 6. Business rules (never break them)

- Buyers: consumers only. Sellers: individuals and businesses, after verification (**KYC** for individuals, **KYB** for businesses), always presented as **simulated** in this prototype.
- New physical goods only. No used or refurbished goods.
- Each seller manages their own stock and ships their own orders. **Never** suggest a DutyFreeDeal warehouse or that DutyFreeDeal owns the stock.
- The national catalog = every offer worldwide that delivers to the selected country. The country shown with an offer is the **seller's country** (“Seller in Mexico”), never the place of manufacture: never write “made in”, “origin”, “provenance”.
- **One listing per seller offer**, even when two sellers offer the identical product: show the other sellers of the same product as separate offers to compare (`sameModel()`).
- The product price is the main figure; **delivery is always shown separately**, on its own line (“+ €24.90 delivery”). Example delivery fee: one per seller in the cart (a demonstration rule, not a commercial decision).
- One cart and **one payment** for several sellers, with **one shipment per seller**.
- Large goods (cars, prefabricated houses: `mode: 'quote'`) go through a **quote or reservation request**: no payment, **no deposit, no confirmed reservation**, no message sent.
- Every amount is an example in **euros**, for every market. France, Spain, the United States and Mexico are example markets, not confirmed launch countries.
- **Never invent**: discounts, crossed-out prices, percentages, “save”, “deal of the day”, reviews, stars, ratings, view counts, best sellers, countdowns, scarcity (“only 2 left”), traffic figures, guarantees, “authentic”, “certified”, commissions or fees, membership prices, penalties, currencies, customs or tax advantages. The 15% commission, the membership, verification details, delay penalties, customer support, returns and payouts are **open decisions**: mention them only as questions to define.
- Everything is demonstration data: say so where an action would be real (payment, verification, messages, statuses): “simulated”, “demonstration”, “example”, “fictional details”. Example sellers keep their “· Demo” suffix (from the data).
- A department with no example offer shows an **honest empty state**, never unrelated products.

## 7. Copy (US English)

- Tone: calm, precise, confident; short sentences; no exclamation marks, no hype, no emoji. Sentence case.
- Vocabulary: “All departments”, “Deals”, “Hard to find”, “My orders”, “Sell”, “Become a seller”, “Delivery to France”, “Seller in Spain”, “Direct purchase”, “Quote or reservation”, “Request a quote”, “Add to cart”, “Checkout”, “Saved offers”, “Seller workspace”, “Back office”, “Example stock”, “Simulated”, “Demonstration”.
- Write numbers with `plural()`; amounts with `money()`; dates with `dateText()`.

## 8. Accessibility

- Semantic HTML: `section` with headings, lists for lists (`role="list"` on styled `ul`), `table` with `<th scope="col">` and a caption for data tables, `button` for actions, `a` for navigation. Heading levels never skip (h1, then h2, then h3).
- Every control has a visible label or an accessible name that includes the item it acts on (“Edit Meridian watch”, “Remove Studio headphones from cart”).
- Visible focus everywhere (the ring follows `--ring`); after an in-place update, focus stays on or near the control that triggered it; dialogs restore focus.
- Images: product images get `altText(p)` where the image carries information; decorative duplicates inside `aria-hidden` links get `alt=""` or are inside the hidden link.
- Contrast AA: text uses `--fg` or `--fg-2` only (both pass on every surface).
- Status and errors are announced (`ctx.announce`, `role="alert"` for form errors) and never conveyed by color alone.
- With `prefers-reduced-motion: reduce` everything is visible and still (the shared motion code handles `data-reveal`; do not add other animations).

## 9. Groups

### Group “shop”: `js/views/shop.js`, `css/shop.css` (prefix `shop-`)

Views: `catalog` (`#/catalog`), `categories` (`#/categories`), `product` (`#/product/<id>`, id in `ctx.match[0]`), `wishlist` (`#/wishlist`).

- **catalog**. Query parameters: `q` (search: offer name, seller name, seller country, category names), `category` (any node id of the tree), `collection` (`deals` | `rare`, use `inCollection`), `origin` (seller country code), `mode` (`purchase` | `quote`), `max` (maximum product price, number), `stock` (`1` = in stock only), `sort` (`''` relevance, `price-asc`, `price-desc`, `name`). Source list: `shopOffers()`. Title: “Results for “q””, the category name, “Deals”, “Hard to find” or “All offers”; lead for the two selections (same sentences as the home page); meta: “N offers delivering to France” + `demoTag('Demonstration catalog')`; breadcrumb with the category path. Layout: a left filter column (sticky) and the results. Facets are lists of links with counts computed with the other filters applied: Department (children of the current category, a link back to the parent), Selection (All, Deals, Hard to find), Seller country (All + the four countries), Purchase type (All, Direct purchase, Quote or reservation); then a small form (`data-form="price-filter"`) with Maximum product price (help: “Delivery is shown separately”) and In stock only, applied by navigation. Results bar: count, active filters as removable pills, sort select (changes the URL), the note “One listing per seller · new products only”. Results: `offerCard()` in a 3-column grid. Honest empty states: a department without example offers (say so, show its sub-categories as links, no other products); a search without results (suggest clearing filters, show the departments). Changing a filter is a navigation (`catalogHref`).
- **categories**. All 15 departments with their full tree: for each department a block with a small studio composition (`departmentArt(id)` inside a `.aisle-stage`-like frame of your own, or the department's main cut-out), its name (link to its catalog), the number of example offers delivering to the destination (or “No example offer yet”), and its sub-categories with their leaf categories as links to the catalog. Clean, scannable, Apple-store-like; a jump list or index of the 15 departments at the top is welcome.
- **product**. Missing id or offer not public: honest “This offer is unavailable” page with links. Otherwise a two-column top section: the large image on a studio stage (cut-out on the well, or the photograph as a cover) with the caption “Illustrative photograph · fictional product, seller and price”; the buy column: name (h1), `sellerLine`, verification (“Business · KYB verification, simulated” or “Individual · KYC verification, simulated”), price (large), delivery to the destination with the seller's delivery time on its own line, example stock, quantity input (`data-qty-for`), primary “Add to cart” button (`data-action="add"`), heart. Not deliverable: a notice and a button to change the delivery country (`openPanel('dest', button)`). Quote offers: indicative price (`moneyRound`), “Request a quote or reservation” opens a dialog (request type quote/reservation, fictional name, fictional email, desired date optional, project details optional, required checkbox “I am using fictional details for this simulation”) → `addRequest()` → toast → `go('#/orders')`; state “No deposit, no confirmed reservation, no message sent.” Below: “The same product from other sellers” (one row per other public offer of the same model: seller, seller country, price, delivery, link, add; or “No other seller offers this product delivering to France”), with the line “One listing per seller: compare price and delivery”. Then “Details” (specs + “Condition: New only” + seller + seller country) and “More in this department” (4 `offerCard`s).
- **wishlist**. Saved offers with `offerCard()`; offers that are not deliverable to the destination are flagged (the card does it); count in the meta; empty state with a link to the departments.

### Group “purchase”: `js/views/purchase.js`, `css/purchase.css` (prefix `pur-`)

Views: `cart` (`#/cart`), `checkout` (`#/checkout`), `orders` (`#/orders`).

- **cart**. One block per seller (`cartGroups()`): seller name, seller country, the seller's delivery fee to the destination on its own line (“Delivery to France, shipped by this seller + €8.90”); lines with thumbnail, name (link), delivery time, quantity stepper (`data-action="qty"`), remove (`data-action="remove"`), line total, and `lineIssue()` messages. A summary card (sticky): Products, Delivery (N shipments), Total, “One cart, one payment”, the primary “Continue to checkout” link (disabled state with the reason when `blocked` or empty), “No real payment: these amounts illustrate the checkout journey.” Destination shown with a button to change it (`openPanel('dest', …)`). Empty state.
- **checkout**. Empty cart → empty state; blocked cart → explanation and link back to the cart. Otherwise a form (`data-form="checkout"`, `novalidate` + your own accessible validation): “1. Delivery” (fictional full name, fictional email, address, postal code, city; the country is the destination, shown read-only with how to change it; a “Fill in an example” button prefilling realistic fictional details for the destination country), “2. One payment” (a single radio “Demonstration payment · no card details”; never ask for card numbers), required checkbox “I understand this is a simulation with no real purchase”, submit “Place the example order”. Summary aside: one row per seller shipment (seller, items, delivery fee), totals. On submit: `placeOrder(contact)` → `go('#/orders?placed=<id>')`.
- **orders**. With `placed=<id>`: a confirmation block at the top (order number, total, “One simulated payment. Each seller now prepares their part.”, nothing sent). Orders, most recent first: number, date, destination, total; one block per seller shipment with status chip, a 4-step timeline (pending, preparing, shipped, delivered via `shipmentLabel`), items (thumb, name, quantity, amount), delivery fee; “Demonstration shipments and statuses.” Then “Quote and reservation requests”: product, seller, destination, request type, date, status (“Request saved · simulation” or “Under review · simulation”), “No message sent, no deposit and no confirmed booking.” Empty state when there is nothing.

### Group “seller”: `js/views/seller.js`, `css/seller.css` (prefix `sel-`)

Views: `sell` (`#/sell`, also `#/seller/onboarding`), `dashboard` (`#/seller`), `inventory` (`#/seller/inventory`), `shipments` (`#/seller/orders`).

- **sell** (public page, normal layout, not the workspace). Heading “Sell beyond your country.” and a lead for individuals and businesses; three steps (seller profile: individual or business and seller country; KYC or KYB verification: identity or business, bank check to be defined; review: simulated approval in the back office). Form (`data-form="onboarding"`): You sell as (Individual · KYC / Business · KYB), Seller country (the four countries), fictional name or business name, fictional email; an information box that updates with the type and country (what the KYC or KYB process covers, and that exact documents, enhanced checks and review times depend on country rules still to be defined); required checkbox “I am using fictional details to simulate this application”. Submit → `addApplication()` → show the application with “Awaiting review · simulation” and links to the seller workspace and the back office. Notice: “No identity document, bank number or company document is requested.”
- **dashboard**. `workspace({ kind: 'seller', … })`; the `aside` holds the example seller account switcher (a select of every seller, `state.selectedVendor`, re-render on change, labelled “Example seller account”). Heading “Hello, <seller>” and the lead “You manage your stock and prepare your shipments. Figures come from this demonstration catalog and its orders.” Stats: offers of this seller, example units in stock, shipments to prepare. Cards: My seller account (status “Verified · simulation” or “Suspended · simulation”, seller country, individual or business, KYC or KYB, bank verification to be defined), My destinations (countries delivered with the example delivery fee for each), Rules to define with Vito (seller membership, the basis of the “15% net of the global price” commission, delay penalties, customer support: open questions, nothing is calculated) with a link to `#/admin/settings`.
- **inventory**. Workspace; action “Create an example offer”. Table of the seller's offers: offer (thumb, name link, department), product price, example stock, journey (Direct purchase / Quote or reservation), visibility (“Published” or “Hidden by moderation”), action “Edit” (dialog: product price in euros, units in stock → `editOffer`). Create dialog: name, department, journey, product price, example stock, illustration (choose among the photographed models, show its name) → `createOffer({ image: './assets/photos/<key>.webp', … })`. Note “Local change, visible immediately in the shop.” Empty state.
- **shipments**. Workspace; every order that contains a shipment of the selected seller: order number, date, destination, fictional customer, this seller's items and delivery fee, status chip and timeline, a button to simulate the next status (“Simulate “Shipped””) via `advanceShipment`; note “Promised shipping times, delay penalties and their calculation remain to be defined with Vito.” Empty state that explains how to create an order in the shop.

### Group “admin”: `js/views/admin.js`, `css/admin.css` (prefix `adm-`)

Views: `overview` (`#/admin`), `vendors` (`#/admin/vendors`), `products` (`#/admin/products`), `orders` (`#/admin/orders`), `requests` (`#/admin/requests`), `settings` (`#/admin/settings`). Every page uses `workspace({ kind: 'admin', … })` and `surface: 'studio'`.

- **overview**. Lead: central view of the catalog, sellers and simulated operations; figures come only from this prototype's data. Stats: visible offers, simulated orders, applications awaiting review, large-goods requests. Cards: Awaiting review (seller applications, new requests, with links), Commercial definition (the open decisions, link to settings), Latest orders (table, 4 rows, link to orders).
- **vendors**. Applications submitted in this prototype (fictional profile, seller country, KYC or KYB, status chip, actions “Simulate approval” and “Needs details” → `setApplicationStatus`), then the example seller accounts (seller, country, KYC/KYB, simulated status, “Suspend” / “Reactivate” → `setVendorState`), with the note “Suspending a seller hides their offers and blocks their purchase in this demonstration.”
- **products**. Moderation of every offer (one row per seller offer): offer (thumb, name, department, “New”), seller, example price, status (“Published” / “Hidden”), action “Hide” / “Publish” (`setProductState`); a search field filtering the rows in place is welcome.
- **orders**. Every order: number, date, fictional customer, destination, total, and each seller shipment with its status and a button to simulate the next status.
- **requests**. Every quote and reservation request: type, product, number, date, seller, destination, fictional contact, desired date, project details, status, “Simulate review” (`reviewRequest`); “No message sent. No deposit, reservation or service confirmed.” Empty state with a link to `#/catalog?mode=quote`.
- **settings**. “Decisions to make with Vito”: the agreed framework (buyers: consumers at launch; sellers: individuals and businesses after KYC or KYB; products: new physical goods at launch; catalog: worldwide offers delivering to the selected country; payment: one cart and one payment; presentation: one listing per seller, delivery shown separately; site language: English), then the open decisions as cards, each with an “To define with Vito” chip: the source of the savings (how parallel trade creates the price advantage, which product flows and suppliers), the “15% net of the global price” commission (basis, timing, treatment of delivery and returns), seller membership (price, conditions, mandatory or not), country-specific checks (KYC or KYB documents, enhanced checks, bank verification by seller country), shipping delays (commitment, when a delay triggers a penalty, how it is calculated), customer support (first contact, who settles a dispute), large goods (difference between quote and reservation, steps, confirmation, later payment), prices and destinations (currencies, final-price display by country, delivery arrangements per seller). Finally “Reset the demonstration” with a confirmation dialog (`resetDemo()`, then toast and `ctx.rerender()`); explain it only clears this browser's demonstration data.

## 10. Verification (mandatory)

1. `node --check js/views/<your-file>.js` and `node tools/render-check.mjs '#/<your-routes-prefix>'` (run from `dutyfree-studio/`): every one of your routes must render in the three demonstration states with no flag. Run the full `node tools/render-check.mjs` once at the end too.
2. Browser: from `/Users/ethanlaloum/dev/DutyFreeDeal/dutyfree-refonte` (where Playwright is installed) use **your own session** `npx playwright-cli -s=<group> …` (read `.claude/skills/playwright-cli/SKILL.md` there). Check at 1440×900 and 1280×800: no console error, no horizontal overflow (also at 390), every interaction of your pages (keyboard included: Tab order, Enter, Escape in dialogs, focus after re-render), and that the pages look like the home page's family.
3. **The disk of this machine is nearly full.** Run `df -h /` before writing captures; stop and report if less than 300 MB is free. Save at most 12 PNG captures, only in `dutyfree-studio/.captures/<group>/` (create it), name them after the page and state (`catalog-1440.png`, `product-quote-dialog.png`…). Close your browser session at the end (`npx playwright-cli -s=<group> close`). Never write other large files.
4. Look at your captures (read the images) and criticize them against this contract and the home page: hierarchy, alignment, spacing, typography, copy. Fix, then capture again. At least two passes.

## 11. Report

Return: what you built per view (one line each); deviations from this contract and why; anything you needed from a shared file; known issues or unverified points; the list of captures.
