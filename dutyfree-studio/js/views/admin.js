/* DutyFreeDeal Studio: back office. Overview, sellers and verification, offer moderation, orders and shipments,
 * quotes and reservations, open decisions. Figures come only from the local demonstration state; every action is simulated. */
import {
  state, resetDemo, label, esc, icon, plural, money, moneyRound, number, dateText, normalize,
  countries, countryName, countryIn, sellerIn, vendors, vendor, vendorName, vendorState,
  allProducts, product, isHidden, publicOffer, isQuote, department, categories, findCategory, modelKey, cutout, shopOffers,
  shipmentLabel, advanceShipment, setProductState, setVendorState, setApplicationStatus, reviewRequest, productHref,
  requestStatusLabel, requestKindLabel, applicationStatusLabel, applicationStatusTone
} from '../core.js';
import { thumb, offerImage, chip, notice, statCard, shipmentSteps } from '../ui/components.js';
import { workspace } from '../ui/workspace.js';
import { CREDITS } from '../credits.js';

/* ---------- Shared pieces ---------- */

const docTitle = (page) => (page ? `${page} · Back office · DutyFreeDeal` : 'Back office · DutyFreeDeal');
const page = (title, html, mount) => ({ title, html, surface: 'studio', mount });

/** Most recent first (ISO dates compare as strings). */
const recentFirst = (list) => [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const slug = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, '-');
const kindText = (type) => (type === 'business' ? 'Business · KYB' : 'Individual · KYC');
const kindIcon = (type) => (type === 'business' ? 'buildings' : 'user');
const tile = (name) => `<span class="adm-tile" aria-hidden="true">${icon(name)}</span>`;
/** Escaped seller name whose " · Demo" suffix never starts or ends a line. */
const sellerName = (name) => esc(name).replace(/ · /g, ' · ');

/** A date typed in a date field ("2026-11-20"), shown as a local calendar day. */
function dayText(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  return m ? dateText(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toISOString()) : String(value || '');
}

/** Studio thumbnails of distinct products, side by side: no cut-out is ever covered by another one. */
function stack(items, max = 2, more = true) {
  const keys = new Set();
  const list = items.filter((i) => {
    const k = modelKey(i);
    if (keys.has(k)) return false;
    keys.add(k);
    return true;
  });
  const extra = list.length - max;
  return `<span class="adm-stack" aria-hidden="true">${list.slice(0, max).map((i) => thumb(i, 'thumb--s')).join('')}${more && extra > 0 ? `<span class="adm-stack-more">+${extra}</span>` : ''}</span>`;
}

/** Section of a back-office page: heading, optional line under it, optional action on the right. */
const sectionHead = (id, title, sub = '', aside = '', size = 'title-m') => `<div class="adm-head" data-reveal>
    <div><h2 class="${size}" id="${id}">${title}</h2>${sub ? `<p class="adm-sub">${sub}</p>` : ''}</div>${aside}
  </div>`;

/** Honest empty block, with a heading level that follows the page outline. */
const emptyBlock = ({ iconName, title, text, actions = '', level = 3 }) => `<div class="empty adm-empty" data-reveal>${icon(iconName, 'empty-icon')}
    <h${level} class="title-s">${title}</h${level}><p>${text}</p>${actions ? `<div class="empty-actions">${actions}</div>` : ''}</div>`;

/* The same object carries the same status words and tones on every page. Words come from core.js
 * (requestStatusLabel, applicationStatusLabel…); shipments and requests take the tones of My orders and the seller
 * workspace; seller accounts and offer visibility take the chips of the seller workspace (js/views/seller.js).
 * Steady states stay neutral; color marks an outcome (an approved application, a delivery) or an exception. */
const SHIP_TONE = { pending: 'neutral', preparing: 'info', shipped: 'info', delivered: 'success' };
const NEXT = { pending: 'preparing', preparing: 'shipped', shipped: 'delivered' };
const REQUEST_TONE = { new: 'neutral', reviewing: 'info' };
/** Not reviewed yet ("Request saved · simulation"): the requests the back office still has to look at. */
const isNewRequest = (q) => q.status !== 'reviewing';
const requestChip = (status) => chip(requestStatusLabel(status), REQUEST_TONE[status] || 'neutral');
const applicationChip = (status) => chip(applicationStatusLabel(status), applicationStatusTone(status));
/** Example seller account, exactly as "My seller account" shows it: verified (same words as an approved application,
 * neutral as a steady state), unless suspended here. */
const accountChip = (paused) => (paused ? chip('Suspended · simulation', 'danger') : chip(applicationStatusLabel('verified'), 'neutral'));
/** Visibility of an offer, in the words and tones of the seller's "Offers and stock" table. */
const VISIBILITY = { published: ['Published', 'neutral'], hidden: ['Hidden by moderation', 'warning'], suspended: ['Seller suspended', 'danger'] };
const visibilityChip = (status) => chip(...VISIBILITY[status]);
/* Captions of product images (CONTRACT section 4): generated illustrations (the car, the house) are said to be generated. */
const GENERATED = new Set(CREDITS.filter((c) => c.kind === 'generated-illustration').map((c) => c.key));
const imageCaption = (p) => (GENERATED.has(modelKey(p)) ? 'Generated illustration' : 'Illustrative photograph') + ' · fictional product, seller and price';

/* The open decisions, shared by the overview (short label) and the settings page. Nothing here is decided or calculated. */
const OPEN = [
  ['Source of the price advantage', 'Price advantage source', 'How parallel trade creates the price advantage, through which product flows and which suppliers.'],
  ['The “15% net of the global price” commission', 'Commission basis', 'Its basis, when it is charged, how delivery and returns are treated, and when sellers are paid.'],
  ['Seller membership', 'Seller membership', 'Its price, its conditions, and whether it is mandatory for individuals and for businesses.'],
  ['Country-specific checks', 'Country checks', 'The KYC or KYB documents, the enhanced checks and the bank verification required in each seller country.'],
  ['Shipping delays', 'Shipping delays', 'The shipping commitment, when a delay triggers a penalty, and how that penalty is calculated.'],
  ['Customer support', 'Customer support', 'Who the buyer contacts first after a purchase, who settles a dispute, and who decides on returns and refunds.'],
  ['Large goods', 'Large goods', 'The difference between a quote and a reservation, the steps, the confirmation and the later payment.'],
  ['Prices and destinations', 'Prices by country', 'Currencies, how the final price is shown in each country, and delivery arrangements per seller. France, Spain, the United States and Mexico are example markets.']
];
const num2 = (i) => String(i + 1).padStart(2, '0');

/* ---------- Actions: every one is a local simulation, followed by an in-place re-render ---------- */

/** Scrolls a control that received focus into view when it sits outside the viewport (under the sticky header included). */
function keepInView(el) {
  const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const r = el.getBoundingClientRect();
  if (r.top < top || r.bottom > window.innerHeight) el.scrollIntoView({ block: 'center' });
}

/** Re-renders the page, then moves focus to the first visible match (when the control that was used is gone). */
function refresh(ctx, selectors = []) {
  return Promise.resolve(ctx.rerender()).then(() => {
    const main = document.getElementById('main');
    if (!main || (document.activeElement && document.activeElement !== document.body && main.contains(document.activeElement))) return;
    for (const s of selectors) {
      const el = s ? main.querySelector(s) : null;
      if (el && el.getClientRects().length) {
        el.focus({ preventScroll: true });
        keepInView(el);
        return;
      }
    }
  });
}

const sel = (action, id) => `[data-action="${action}"][data-id="${CSS.escape(id)}"]`;

const ACTIONS = {
  'adm-app'(button, ctx) {
    const a = state.applications.find((x) => x.id === button.dataset.id);
    const status = button.dataset.step;
    if (!a || !setApplicationStatus(a.id, status)) return;
    ctx.toast(`${applicationStatusLabel(status)}: ${a.name || 'Unnamed applicant'}`, status === 'verified' ? 'checkCircle' : 'info');
    /* The new status first: the opposite action must not receive focus, a second Enter would reverse the decision. */
    refresh(ctx, [`#app-${slug(a.id)}-status`, sel('adm-app', a.id)]);
  },
  'adm-vendor'(button, ctx) {
    const v = vendor(button.dataset.id);
    if (!v) return;
    const pause = vendorState(v.id) !== 'paused';
    setVendorState(v.id, pause);
    ctx.toast(pause ? `Suspended · simulation: ${vendorName(v)}` : `Reactivated · simulation: ${vendorName(v)}`, pause ? 'pause' : 'play');
    refresh(ctx, [sel('adm-vendor', v.id)]);
  },
  'adm-offer'(button, ctx) {
    const p = product(button.dataset.id);
    if (!p) return;
    const hide = !isHidden(p);
    /* Nearest rows first (below, then above), in case the status filter takes this row out of the list. */
    const rows = [...(button.closest('main')?.querySelectorAll('[data-adm-row]') || [])];
    const at = rows.indexOf(button.closest('tr'));
    const near = at < 0 ? [] : [...rows.slice(at + 1), ...rows.slice(0, at).reverse()];
    setProductState(p.id, hide);
    const paused = vendorState(p.vendorId) === 'paused';
    ctx.toast(hide ? `Hidden from the shop: ${label(p.name)}` : paused ? `Published, not shown while the seller is suspended: ${label(p.name)}` : `Published: ${label(p.name)}`, hide ? 'eyeSlash' : 'eye');
    refresh(ctx, [sel('adm-offer', p.id), ...near.map((r) => sel('adm-offer', r.dataset.id)), '[data-adm-clear]', '#adm-offer-q']);
  },
  'adm-ship'(button, ctx) {
    const [orderId, vendorId] = button.dataset.id.split('::');
    if (!advanceShipment(orderId, vendorId)) return;
    const s = state.orders.find((o) => o.id === orderId)?.shipments.find((x) => x.vendorId === vendorId);
    ctx.toast(`${s.vendorName}: ${shipmentLabel(s.status)} · simulation`, s.status === 'delivered' ? 'checkCircle' : 'truck');
    refresh(ctx, [sel('adm-ship', button.dataset.id), `#ship-${slug(orderId)}-${slug(vendorId)}`]);
  },
  'adm-request'(button, ctx) {
    const q = state.requests.find((x) => x.id === button.dataset.id);
    if (!q || !reviewRequest(q.id)) return;
    ctx.toast(`${requestStatusLabel(q.status)}: ${label(q.productName) || q.id}`, 'clock');
    refresh(ctx, [`#req-${slug(q.id)}-status`]);
  },
  'adm-reset'(button, ctx) {
    const root = ctx.openDialog({
      title: 'Reset the demonstration?',
      size: 's',
      body: `<p class="adm-dialog-text" id="adm-reset-what">This signs out of the example account and clears the cart, the saved offers, the orders, the quote and reservation requests, the seller applications and every change made through the seller workspace or the back office.</p>
        <p class="adm-dialog-text" id="adm-reset-scope">Only this browser is affected, and the delivery country is kept.</p>
        <div class="form-actions"><button class="btn btn--secondary" type="button" data-dialog-close>Cancel</button><button class="btn btn--danger" type="submit">Reset the demonstration</button></div>`,
      onSubmit() {
        resetDemo();
        /* The re-render also refreshes the header (cart, saved offers, example account). The toast region is inert while
           the dialog is open: write the result once the dialog is closed and the page re-rendered. */
        Promise.resolve(ctx.rerender()).then(() => requestAnimationFrame(() => ctx.toast('Demonstration reset in this browser', 'reset')));
      }
    });
    /* Initial focus goes to Cancel: the dialog itself carries what is cleared and where. */
    root?.querySelector('[role="dialog"]')?.setAttribute('aria-describedby', 'adm-reset-what adm-reset-scope');
  }
};

/** Mount shared by every back-office page: one delegated listener for the simulated actions. */
function bind(main, ctx, extra) {
  const onClick = (event) => {
    const button = event.target.closest('[data-action^="adm-"]');
    if (!button || !main.contains(button)) return;
    ACTIONS[button.dataset.action]?.(button, ctx);
  };
  main.addEventListener('click', onClick);
  const more = extra ? extra(main, ctx) : null;
  return () => {
    main.removeEventListener('click', onClick);
    if (more) more();
  };
}

/* ---------- Overview ---------- */

function deliveredText(o) {
  const n = o.shipments.length;
  const done = o.shipments.filter((s) => s.status === 'delivered').length;
  if (done === n) return n > 1 ? 'All delivered' : 'Delivered';
  if (done) return `${done} of ${n} delivered`;
  return o.shipments.every((s) => s.status === 'pending') ? 'Awaiting preparation' : 'None delivered yet';
}

function latestOrders(list) {
  const rows = list.map((o) => {
    const items = o.shipments.flatMap((s) => s.items);
    const units = items.reduce((n, i) => n + i.qty, 0);
    return `<tr>
      <th scope="row"><a class="adm-cell-title adm-row-link adm-nowrap" href="#/admin/orders?order=${encodeURIComponent(o.id)}">${esc(o.id)}</a><span class="cell-sub">${esc(dateText(o.date))}</span></th>
      <td><span class="adm-cell-title adm-wrap">${esc(o.contact?.name || 'Not given')}</span><span class="cell-sub adm-nowrap">${esc(`Delivery ${countryIn(o.country)}`)}</span></td>
      <td><span class="adm-items">${stack(items, 2)}<span>${esc(plural(units, 'item', 'items'))}</span></span></td>
      <td><span class="adm-cell-title adm-nowrap">${esc(plural(o.shipments.length, 'shipment', 'shipments'))}</span><span class="cell-sub adm-nowrap">${esc(deliveredText(o))}</span></td>
      <td class="num"><span class="price adm-total">${esc(money(o.total))}</span><span class="cell-sub adm-nowrap">${esc(`Including ${money(o.delivery)} delivery`)}</span></td>
    </tr>`;
  }).join('');
  const caption = list.length === 1 ? 'The most recent simulated order' : `The ${list.length} most recent simulated orders`;
  return `<div class="table-wrap"><table class="table adm-table">
    <caption class="sr-only">${esc(caption)}</caption>
    <thead><tr><th scope="col">Order</th><th scope="col">Fictional customer</th><th scope="col">Items</th><th scope="col">Seller shipments</th><th scope="col" class="num">Total</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

/** A row of "Awaiting review": the queue, then its latest item on its studio visual; the whole row links to the queue. */
const queueRow = ({ href, visual, queue, item, details = [], more = '', empty, sr }) => `<li><a class="adm-queue-item" href="${href}">
    ${visual}
    <span class="adm-queue-text">
      <span class="adm-queue-kicker">${queue}${icon('arrow')}</span>
      ${item ? `<span class="adm-queue-name">${esc(item)}</span>
      <span class="adm-queue-sub">${details.map((d) => `<span class="nw">${esc(d)}</span>`).join(' · ')}</span>${more ? `<span class="adm-queue-sub">${esc(more)}</span>` : ''}` : `<span class="adm-queue-sub">${empty}</span>`}${sr ? `<span class="sr-only">, ${sr}</span>` : ''}
    </span>
  </a></li>`;
const iconWell = (name) => `<span class="thumb thumb--xl adm-queue-icon" aria-hidden="true">${icon(name)}</span>`;

function overview(ctx) {
  const offers = allProducts();
  const visible = offers.filter(publicOffer);
  const kept = offers.length - visible.length;
  const orders = recentFirst(state.orders);
  const shipments = orders.reduce((n, o) => n + o.shipments.length, 0);
  const pending = recentFirst(state.applications.filter((a) => a.status === 'pending'));
  const fresh = recentFirst(state.requests.filter(isNewRequest));
  const sellerCount = new Set(visible.map((p) => p.vendorId)).size;
  const sellerCountries = new Set(visible.map((p) => vendor(p.vendorId)?.country)).size;

  const stats = `<div class="stats adm-stats" data-reveal>
    ${statCard(number(visible.length), 'Visible offers', kept ? `${plural(kept, 'offer', 'offers')} kept out of the shop` : `From ${plural(sellerCount, 'seller', 'sellers')} in ${plural(sellerCountries, 'country', 'countries')}`)}
    ${statCard(number(orders.length), 'Simulated orders', orders.length ? plural(shipments, 'seller shipment', 'seller shipments') : 'None placed yet')}
    ${statCard(number(pending.length), 'Applications to review', state.applications.length ? `${plural(state.applications.length, 'application', 'applications')} submitted` : 'None submitted yet')}
    ${statCard(number(state.requests.length), 'Large-goods requests', state.requests.length ? plural(fresh.length, 'new request', 'new requests') : 'None yet')}
  </div>`;

  const app = pending[0];
  const req = fresh[0];
  const more = (n) => (n > 1 ? `${n - 1} more waiting` : '');
  const reqPic = req ? product(req.productId) || { id: req.productId, image: req.image, name: req.productName } : null;
  const attention = `<section class="card surface-light adm-card adm-attention" aria-labelledby="adm-attention-title" data-reveal>
    <div class="card-head"><h2 class="title-s" id="adm-attention-title">Awaiting review</h2></div>
    <ul class="adm-queue" role="list">
      ${queueRow({
        href: '#/admin/vendors',
        visual: iconWell(app ? kindIcon(app.type) : 'idCard'),
        queue: 'Seller applications',
        item: app ? app.name || 'Unnamed applicant' : '',
        details: app ? [kindText(app.type), sellerIn(app.country)] : [],
        more: more(pending.length),
        empty: 'No application waiting',
        sr: pending.length ? esc(plural(pending.length, 'application awaiting review', 'applications awaiting review')) : ''
      })}
      ${queueRow({
        href: '#/admin/requests',
        visual: reqPic?.image ? thumb(reqPic, 'thumb--xl') : iconWell('envelope'),
        queue: 'New large-goods requests',
        item: req ? label(req.productName) || label(reqPic?.name) || 'Offer no longer available' : '',
        details: req ? [requestKindLabel(req.kind), `Delivery ${countryIn(req.country)}`] : [],
        more: more(fresh.length),
        empty: 'No new request',
        sr: fresh.length ? esc(plural(fresh.length, 'new request', 'new requests')) : ''
      })}
    </ul>
  </section>`;

  const definition = `<section class="card surface-light adm-card adm-definition" aria-labelledby="adm-definition-title" data-reveal>
    <div class="card-head"><h2 class="title-s" id="adm-definition-title">Commercial definition</h2>${chip(`${OPEN.length} open decisions`, 'neutral')}</div>
    <p class="adm-text">The commission, the seller membership, country-specific checks, shipping delays and customer support are still to be defined with Vito. This prototype calculates no commission, membership fee or penalty.</p>
    <ol class="adm-decisions" role="list">${OPEN.map(([, short], i) => `<li><span class="adm-num" aria-hidden="true">${num2(i)}</span>${esc(short)}</li>`).join('')}</ol>
    <a class="more" href="#/admin/settings">See the open decisions${icon('arrow')}</a>
  </section>`;

  const latest = `<section class="card surface-light adm-card adm-wide" aria-labelledby="adm-latest-title" data-reveal>
    <div class="card-head"><h2 class="title-s" id="adm-latest-title">Latest orders</h2>${orders.length ? `<a class="more" href="#/admin/orders">${esc(orders.length > 1 ? `See the ${orders.length} orders` : 'See the order')}${icon('arrow')}</a>` : ''}</div>
    ${orders.length ? latestOrders(orders.slice(0, 4)) : `<div class="adm-quiet">
      <p>No simulated order yet. Place an example order with offers from several sellers: it appears here with one shipment per seller.</p>
      <a class="btn btn--secondary btn--small" href="#/catalog">Browse the catalog</a>
    </div>`}
  </section>`;

  const dest = countries.map((c) => {
    const list = shopOffers(c.code);
    return { code: c.code, n: list.length, sellers: new Set(list.map((p) => p.vendorId)).size };
  });
  const max = Math.max(1, ...dest.map((d) => d.n));
  const destinations = `<section class="card surface-light adm-card adm-wide adm-dest" aria-labelledby="adm-dest-title" data-reveal>
    <div class="adm-dest-intro">
      <h2 class="title-s" id="adm-dest-title">Offers by destination</h2>
      <p class="adm-text">Each national catalog brings together the offers from around the world that their sellers deliver to that country.</p>
      <p class="adm-note">${icon('info')}<span>Example markets, not confirmed launch countries. Every amount is an example in euros.</span></p>
    </div>
    <ul class="adm-bars" role="list">${dest.map((d) => `<li>
      <span class="adm-bar-name">${esc(countryName(d.code))}</span>
      <span class="adm-bar-track" aria-hidden="true"><span class="adm-bar-fill" style="--w:${((d.n / max) * 100).toFixed(1)}%"></span></span>
      <span class="adm-bar-value"><strong>${esc(plural(d.n, 'offer', 'offers'))}</strong> ${esc(`from ${plural(d.sellers, 'seller', 'sellers')}`)}</span>
    </li>`).join('')}</ul>
  </section>`;

  const html = workspace({
    kind: 'admin',
    title: 'The marketplace <span class="soft">at a glance</span>',
    lead: 'A central view of the catalog, the sellers and the simulated operations. Every figure comes from this prototype’s data.',
    body: `${stats}<div class="adm-grid">${attention}${definition}${latest}${destinations}</div>`
  });
  return page(docTitle(''), html, (main) => bind(main, ctx));
}

/* ---------- Sellers and verification ---------- */

function applicationCard(a) {
  const name = esc(a.name || 'Unnamed applicant');
  const id = slug(a.id);
  const actions = [];
  if (a.status !== 'verified') actions.push(`<button class="btn btn--primary btn--small" type="button" data-action="adm-app" data-id="${esc(a.id)}" data-step="verified">Simulate approval<span class="sr-only">: ${name}</span></button>`);
  if (a.status !== 'rejected') actions.push(`<button class="btn btn--secondary btn--small" type="button" data-action="adm-app" data-id="${esc(a.id)}" data-step="rejected">Needs details<span class="sr-only">: ${name}</span></button>`);
  return `<li class="card surface-light adm-card adm-app" data-reveal>
    <div class="adm-app-top">
      <div class="adm-app-who">${tile(kindIcon(a.type))}<div><h3 class="adm-app-name">${name}</h3><p class="adm-kicker">${esc(`Fictional applicant · ${a.email || 'no email given'}`)}</p></div></div>
      <span class="adm-status" id="app-${id}-status" tabindex="-1">${applicationChip(a.status)}</span>
    </div>
    <div class="adm-app-bottom">
      <dl class="adm-app-facts">
        <div><dt>Seller country</dt><dd>${esc(countryName(a.country))}</dd></div>
        <div><dt>Verification</dt><dd>${esc(kindText(a.type))}</dd></div>
        <div><dt>Submitted</dt><dd>${esc(dateText(a.date))}</dd></div>
      </dl>
      <div class="adm-app-actions">${actions.join('')}</div>
    </div>
  </li>`;
}

function sellerRow(v) {
  const paused = vendorState(v.id) === 'paused';
  const offers = allProducts().filter((p) => p.vendorId === v.id);
  const name = sellerName(vendorName(v));
  const to = Array.isArray(v.deliveryTo) ? v.deliveryTo : [];
  const delivers = to.length
    ? `<span class="cell-sub adm-nowrap" aria-hidden="true">Delivers to ${to.map(esc).join(' · ')}</span><span class="sr-only">Delivers to ${to.map((c) => esc(countryName(c))).join(', ')}</span>`
    : '<span class="cell-sub">No destination</span>';
  return `<tr>
    <th scope="row"><span class="adm-cell-title adm-nowrap">${name}</span><span class="cell-sub">${esc(kindText(v.type))}</span></th>
    <td><span class="adm-cell-title adm-nowrap">${esc(countryName(v.country))}</span>${delivers}</td>
    <td><span class="adm-items">${stack(offers, 2, false)}<span>${esc(plural(offers.length, 'offer', 'offers'))}</span></span></td>
    <td>${accountChip(paused)}</td>
    <td><div class="cell-actions"><button class="btn ${paused ? 'btn--primary' : 'btn--secondary'} btn--small" type="button" data-action="adm-vendor" data-id="${esc(v.id)}">${paused ? 'Reactivate' : 'Suspend'}<span class="sr-only"> ${name}</span></button></div></td>
  </tr>`;
}

function sellers(ctx) {
  const apps = recentFirst(state.applications);
  const pending = apps.filter((a) => a.status === 'pending').length;
  const paused = vendors.filter((v) => vendorState(v.id) === 'paused').length;
  const sellerCountries = new Set(vendors.map((v) => v.country)).size;

  const applications = `<section class="adm-section adm-section--first" aria-labelledby="adm-apps-title">
    ${sectionHead('adm-apps-title', 'Applications submitted in this prototype',
      apps.length ? esc(`${plural(apps.length, 'application', 'applications')} from the Become a seller page, ${pending ? `${pending} awaiting review` : 'none awaiting review'}.`) : 'Applications sent from the Become a seller page appear here, in this browser only.',
      apps.length ? '<a class="btn btn--secondary btn--small" href="#/sell">Simulate an application</a>' : '')}
    ${apps.length ? `<ul class="adm-apps" role="list">${apps.map(applicationCard).join('')}</ul>
    <div class="adm-after" data-reveal>${notice('No identity document, bank detail or company document is collected. The checks required in each seller country remain to be defined with Vito.', 'shield')}</div>` : emptyBlock({
      iconName: 'idCard',
      title: 'No application yet',
      text: 'Fill in the Become a seller form with fictional details: the application lands here, ready for a simulated approval or a request for details.',
      actions: '<a class="btn btn--primary btn--small" href="#/sell">Simulate an application</a>'
    })}
  </section>`;

  const accounts = `<section class="adm-section" aria-labelledby="adm-sellers-title">
    ${sectionHead('adm-sellers-title', 'Example seller accounts', esc(`${plural(vendors.length, 'seller', 'sellers')} in ${plural(sellerCountries, 'country', 'countries')}, ${paused ? `${paused} suspended` : 'none suspended'}. Each one manages their own stock and ships their own orders. Statuses are simulated.`))}
    <div class="card surface-light adm-card adm-card--table" data-reveal><div class="table-wrap"><table class="table adm-table adm-sellers">
      <caption class="sr-only">Example seller accounts of the demonstration catalog. Statuses are simulated.</caption>
      <thead><tr><th scope="col">Seller</th><th scope="col">Seller country</th><th scope="col">Offers</th><th scope="col">Simulated status</th><th scope="col" class="adm-th-actions">Action</th></tr></thead>
      <tbody>${vendors.map(sellerRow).join('')}</tbody></table></div></div>
    <div class="adm-after" data-reveal>${notice('Suspending a seller hides their offers and blocks their purchase in this demonstration.', 'pause')}</div>
  </section>`;

  const html = workspace({
    kind: 'admin',
    title: 'Sellers and verification',
    lead: 'KYC for individuals, KYB for businesses, adapted to each seller’s country. Every decision here is simulated.',
    body: applications + accounts
  });
  return page(docTitle('Sellers and verification'), html, (main) => bind(main, ctx));
}

/* ---------- Offer moderation ---------- */

/** One status per row: hidden by moderation, out of the shop because its seller is suspended, or published. */
const offerStatus = (p) => (isHidden(p) ? 'hidden' : vendorState(p.vendorId) === 'paused' ? 'suspended' : 'published');

function offerRow(p) {
  const v = vendor(p.vendorId);
  const hidden = isHidden(p);
  const paused = vendorState(p.vendorId) === 'paused';
  const name = esc(label(p.name));
  const leaf = findCategory(Array.isArray(p.path) && p.path.length ? p.path[p.path.length - 1] : p.category)?.node;
  const dept = label(department(p.category)?.name);
  const text = normalize([label(p.name), vendorName(v), countryName(v.country), dept, leaf ? label(leaf.name) : '', isQuote(p) ? 'quote reservation' : 'direct purchase'].join(' '));
  /* Joined by a space: two chips are read as two statuses, not one run-on phrase (the flex gap does the visual spacing). */
  const chips = [hidden ? visibilityChip('hidden') : '', paused ? visibilityChip('suspended') : '', !hidden && !paused ? visibilityChip('published') : ''].filter(Boolean).join(' ');
  /* Only an offer the shop shows gets a link: the others would open "This offer is unavailable". */
  const title = publicOffer(p) ? `<a class="adm-cell-title adm-wrap adm-row-link" href="${productHref(p)}">${name}</a>` : `<span class="adm-cell-title adm-wrap">${name}</span>`;
  return `<tr data-adm-row data-id="${esc(p.id)}" data-status="${offerStatus(p)}" data-text="${esc(text)}">
    <th scope="row"><span class="cell-main">${thumb(p)}<span>${title}<span class="cell-sub">${esc(leaf ? label(leaf.name) : dept)} · New</span></span></span></th>
    <td><span class="adm-cell-title adm-nowrap">${sellerName(vendorName(v))}</span><span class="cell-sub">${esc(sellerIn(v.country))}</span></td>
    <td><span class="price adm-price">${esc(isQuote(p) ? moneyRound(p.price) : money(p.price))}</span><span class="cell-sub adm-nowrap">${isQuote(p) ? 'Quote or reservation' : 'Direct purchase'}</span></td>
    <td><span class="adm-chips">${chips}</span>${paused && !hidden ? '<span class="cell-sub adm-nowrap">Out of the shop</span>' : ''}</td>
    <td><div class="cell-actions"><button class="btn ${hidden ? 'btn--primary' : 'btn--secondary'} btn--small" type="button" data-action="adm-offer" data-id="${esc(p.id)}">${hidden ? 'Publish' : 'Hide'}<span class="sr-only"> ${name}, ${esc(vendorName(v))}</span></button></div></td>
  </tr>`;
}

function moderation(ctx) {
  const offers = allProducts();
  const counts = { all: offers.length, published: 0, hidden: 0, suspended: 0 };
  offers.forEach((p) => { counts[offerStatus(p)] += 1; });
  const byName = (a, b) => label(a.name).localeCompare(label(b.name)) || vendorName(vendor(a.vendorId)).localeCompare(vendorName(vendor(b.vendorId)));
  const groups = categories
    .map((d) => ({ d, list: offers.filter((p) => p.category === d.id).sort(byName) }))
    .filter((g) => g.list.length);
  const segment = (value, text) => `<label class="adm-seg-option"><input type="radio" name="status" value="${value}"${value === 'all' ? ' checked' : ''}>`
    + `<span>${text}<small aria-hidden="true">${counts[value]}</small><span class="sr-only">, ${esc(plural(counts[value], 'offer', 'offers'))}</span></span></label>`;

  const body = `<form class="adm-toolbar" data-form="adm-offers" role="search" aria-label="Filter the offers" novalidate data-reveal>
      <div class="field adm-search-field">
        <label for="adm-offer-q">Filter the offers</label>
        <div class="adm-search">${icon('search')}<input class="input" id="adm-offer-q" name="q" type="search" autocomplete="off" spellcheck="false" placeholder="Offer, seller, seller country or department"></div>
      </div>
      <fieldset class="adm-seg">
        <legend>Status</legend>
        <div class="adm-seg-row">${segment('all', 'All')}${segment('published', 'Published')}${segment('hidden', 'Hidden')}${counts.suspended ? segment('suspended', 'Seller suspended') : ''}</div>
      </fieldset>
      <p class="adm-count" data-adm-count>${esc(plural(counts.all, 'offer', 'offers'))}</p>
    </form>
    <div class="card surface-light adm-card adm-card--table" data-reveal>
      <div class="table-wrap" data-adm-table><table class="table adm-table adm-offers">
        <caption class="sr-only">Every seller offer, grouped by department</caption>
        <thead><tr><th scope="col">Offer</th><th scope="col">Seller</th><th scope="col">Example price</th><th scope="col">Status</th><th scope="col" class="adm-th-actions">Moderation</th></tr></thead>
        ${groups.map(({ d, list }) => `<tbody data-adm-group>
          <tr class="adm-group-row"><th scope="rowgroup" colspan="5">${esc(label(d.name))}<span class="sr-only">, </span><span class="adm-group-count" data-adm-group-count>${esc(plural(list.length, 'offer', 'offers'))}</span></th></tr>
          ${list.map(offerRow).join('')}
        </tbody>`).join('')}
      </table></div>
      <div class="adm-nomatch" data-adm-none hidden>
        <p>No offer matches this filter.</p>
        <button class="btn btn--secondary btn--small" type="button" data-adm-clear>Clear the filter</button>
      </div>
    </div>
    <div class="adm-after" data-reveal>${notice('New products only. A hidden offer can no longer be found or bought until it is published again.', 'eyeSlash')}</div>`;

  const html = workspace({
    kind: 'admin',
    title: 'Offer moderation',
    lead: 'One row per seller offer, even for identical products. Hiding an offer removes it from the shop.',
    body
  });
  return page(docTitle('Offer moderation'), html, (main) => bind(main, ctx, bindOfferFilter));
}

/** Filters the moderation rows in place; the typed values survive re-renders through `data-form`. */
function bindOfferFilter(main, ctx) {
  const form = main.querySelector('[data-form="adm-offers"]');
  if (!form) return null;
  const input = form.querySelector('#adm-offer-q');
  const rows = [...main.querySelectorAll('[data-adm-row]')];
  const groups = [...main.querySelectorAll('[data-adm-group]')];
  const none = main.querySelector('[data-adm-none]');
  const tableWrap = main.querySelector('[data-adm-table]');
  const count = main.querySelector('[data-adm-count]');
  const all = form.querySelector('input[name="status"][value="all"]');
  /* A status that no longer exists after a change (no suspended seller left) falls back to All. */
  if (!form.querySelector('input[name="status"]:checked')) all.checked = true;
  let timer = 0;

  const apply = (speak) => {
    const words = normalize(input.value).split(/\s+/).filter(Boolean);
    const status = form.querySelector('input[name="status"]:checked')?.value || 'all';
    let shown = 0;
    for (const r of rows) {
      const ok = (status === 'all' || r.dataset.status === status) && words.every((w) => r.dataset.text.includes(w));
      r.hidden = !ok;
      if (ok) shown += 1;
    }
    for (const g of groups) {
      const n = g.querySelectorAll('[data-adm-row]:not([hidden])').length;
      g.hidden = !n;
      g.querySelector('[data-adm-group-count]').textContent = plural(n, 'offer', 'offers');
    }
    none.hidden = shown > 0;
    tableWrap.hidden = shown === 0;
    const text = shown === rows.length ? plural(rows.length, 'offer', 'offers') : `${shown} of ${plural(rows.length, 'offer', 'offers')}`;
    count.textContent = text;
    if (speak) {
      clearTimeout(timer);
      timer = setTimeout(() => ctx.announce(shown ? `${text} shown` : 'No offer matches this filter'), 450);
    }
  };
  const onInput = () => apply(true);
  const onSubmit = (event) => event.preventDefault();
  const onClear = (event) => {
    if (!event.target.closest('[data-adm-clear]')) return;
    input.value = '';
    all.checked = true;
    apply(true);
    input.focus();
  };
  form.addEventListener('input', onInput);
  form.addEventListener('change', onInput);
  form.addEventListener('submit', onSubmit);
  main.addEventListener('click', onClear);
  apply(false);
  return () => {
    clearTimeout(timer);
    form.removeEventListener('input', onInput);
    form.removeEventListener('change', onInput);
    form.removeEventListener('submit', onSubmit);
    main.removeEventListener('click', onClear);
  };
}

/* ---------- Orders and shipments ---------- */

function shipmentBlock(o, s) {
  const v = vendor(s.vendorId);
  const name = sellerName(s.vendorName || vendorName(v));
  const next = NEXT[s.status];
  /* The shared tracker of My orders and My shipments: the same four steps on every page. */
  const progress = shipmentSteps(s.status, { name: `Shipment progress, ${s.vendorName || vendorName(v)}` });
  return `<li class="adm-ship">
    <div class="adm-ship-side">
      <h4 class="adm-ship-title" id="ship-${slug(o.id)}-${slug(s.vendorId)}" tabindex="-1">${name}</h4>
      <p class="adm-kicker">${esc(v ? sellerIn(v.country) : 'Example seller')}</p>
      ${chip(shipmentLabel(s.status), SHIP_TONE[s.status] || 'neutral')}
      ${next ? `<button class="btn btn--secondary btn--small" type="button" data-action="adm-ship" data-id="${esc(`${o.id}::${s.vendorId}`)}">Simulate “${esc(shipmentLabel(next))}”<span class="sr-only">: ${name}, order ${esc(o.id)}</span></button>` : '<p class="adm-ship-end">All steps simulated</p>'}
    </div>
    <div class="adm-ship-main">
      ${progress}
      <ul class="adm-lines" role="list">${s.items.map((i) => `<li class="adm-line">${thumb(i, 'thumb--l')}
        <span><span class="adm-cell-title">${esc(label(i.name))}</span><span class="cell-sub">${esc(`Quantity ${i.qty} · ${money(i.price)} each`)}</span></span>
        <span class="price">${esc(money(i.price * i.qty))}</span></li>`).join('')}</ul>
      <p class="adm-ship-fee"><span>${esc(`Delivery ${countryIn(o.country)}, shipped by this seller`)}</span><span class="price">+ ${esc(money(s.shipping))}</span></p>
    </div>
  </li>`;
}

function orderCard(o) {
  const id = slug(o.id);
  const c = o.contact || {};
  const place = [c.address, [c.postal || c.postalCode || c.zip, c.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const delivered = o.shipments.filter((s) => s.status === 'delivered').length;
  /* The anchor is the list item: unlike the card, it is never offset by the entrance motion, so a deep link lands right. */
  return `<li id="order-${id}"><article class="card surface-light adm-card adm-order" aria-labelledby="order-${id}-title" data-reveal>
    <header class="adm-order-head">
      <div><p class="adm-kicker">${esc(`Placed ${dateText(o.date)}`)}</p><h3 class="adm-order-id" id="order-${id}-title" tabindex="-1">${esc(o.id)}</h3></div>
      <div class="adm-order-total"><p class="price">${esc(money(o.total))}</p><p class="adm-kicker">${esc(`Products ${money(o.subtotal)} + delivery ${money(o.delivery)}`)}</p></div>
    </header>
    <dl class="adm-facts">
      <div><dt>Fictional customer</dt><dd>${esc(c.name || 'Not given')}<span>${esc(c.email || '')}</span></dd></div>
      <div><dt>Destination</dt><dd>${esc(countryName(o.country))}<span>${esc(place)}</span></dd></div>
      <div><dt>Payment</dt><dd>One payment<span>Simulated, nothing charged</span></dd></div>
      <div><dt>Seller shipments</dt><dd>${esc(plural(o.shipments.length, 'shipment', 'shipments'))}<span>${esc(`${delivered} of ${o.shipments.length} delivered`)}</span></dd></div>
    </dl>
    <ul class="adm-ships" role="list">${o.shipments.map((s) => shipmentBlock(o, s)).join('')}</ul>
  </article></li>`;
}

function ordersView(ctx) {
  const orders = recentFirst(state.orders);
  const shipments = orders.flatMap((o) => o.shipments);
  const delivered = shipments.filter((s) => s.status === 'delivered').length;
  const body = orders.length
    ? `<section class="adm-section adm-section--first" aria-labelledby="adm-orders-title">
        ${sectionHead('adm-orders-title', esc(plural(orders.length, 'simulated order', 'simulated orders')),
          esc(`${plural(shipments.length, 'seller shipment', 'seller shipments')}, ${delivered} delivered. Most recent first.`), '', 'title-s')}
        <ol class="adm-orders" role="list">${orders.map(orderCard).join('')}</ol>
        <div class="adm-after" data-reveal>${notice('Demonstration shipments and statuses. Shipping times, delay penalties and their calculation remain to be defined with Vito.', 'truck')}</div>
      </section>`
    : emptyBlock({
      iconName: 'receipt',
      level: 2,
      title: 'No simulated order yet',
      text: 'Add offers from several sellers to the cart, then place the example order at checkout. It appears here with one payment and one shipment per seller.',
      actions: '<a class="btn btn--primary" href="#/catalog">Browse the catalog</a>'
    });
  const html = workspace({
    kind: 'admin',
    title: 'Orders and shipments',
    lead: 'One payment per order, then one shipment per seller, each tracked on its own. Every status here is a local simulation.',
    body
  });
  return page(docTitle('Orders and shipments'), html, (main) => bind(main, ctx, () => {
    /* Arriving from the overview with ?order=…: bring that order into view once the page is in place. */
    const target = ctx.reason === 'route' ? ctx.params.get('order') : null;
    const item = target ? main.querySelector(`#order-${CSS.escape(slug(target))}`) : null;
    if (!item) return null;
    const frame = requestAnimationFrame(() => {
      item.scrollIntoView({ block: 'start', behavior: 'instant' });
      /* Focus shows the card at once (shared focus reveal) and announces the order. */
      item.querySelector('.adm-order-id')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }));
}

/* ---------- Quotes and reservations ---------- */

function requestCard(q) {
  const p = product(q.productId);
  const v = vendor(q.vendorId);
  const pic = p || { id: q.productId, image: q.image, name: q.productName };
  const name = esc(label(q.productName) || label(p?.name) || 'Offer no longer available');
  const rid = slug(q.id);
  /* Only an offer the shop shows gets a link: the others would open "This offer is unavailable". */
  const href = p && publicOffer(p) ? productHref(p) : '';
  const cut = pic.image && cutout(modelKey(pic)) ? ' data-cut' : '';
  const image = pic.image ? offerImage(pic, { alt: '', sizes: '(max-width: 900px) 80vw, 320px' }) : '';
  const well = href
    ? `<a class="offer-media adm-request-media" href="${href}" tabindex="-1" aria-hidden="true"${cut}>${image}</a>`
    : `<span class="offer-media adm-request-media" aria-hidden="true"${cut}>${image}</span>`;
  const media = `<figure class="adm-request-figure">${well}${pic.image ? `<figcaption>${esc(imageCaption(pic))}</figcaption>` : ''}</figure>`;
  /* The indicative price saved with the request; for an older request without one, the offer's price of today, said as such. */
  const kept = typeof q.price === 'number' && q.price > 0;
  const price = kept ? q.price : p?.price;
  return `<li><article class="card surface-light adm-card adm-request" aria-labelledby="req-${rid}-title" data-reveal>
    ${media}
    <div class="adm-request-body">
      <div class="adm-request-head">
        <div>
          <p class="adm-kicker">${esc(requestKindLabel(q.kind))} · <span class="nw">${esc(dateText(q.date))}</span></p>
          <h3 class="title-s adm-request-title" id="req-${rid}-title">${href ? `<a href="${href}">${name}</a>` : name}</h3>
          ${price ? `<p class="adm-request-price"><span class="price">${esc(moneyRound(price))}</span><span class="adm-kicker">${kept ? 'Indicative price · on quotation' : 'Current indicative price · on quotation'}</span></p>` : ''}
        </div>
        <div class="adm-request-side">
          <span class="adm-status" id="req-${rid}-status" tabindex="-1">${requestChip(q.status)}</span>
          <p class="adm-kicker adm-request-id"><span class="sr-only">Request number </span>${esc(q.id)}</p>
        </div>
      </div>
      <dl class="adm-facts adm-facts--2">
        <div><dt>Seller</dt><dd>${sellerName(q.vendorName || vendorName(v))}<span>${esc(v ? sellerIn(v.country) : '')}</span></dd></div>
        <div><dt>Destination</dt><dd>${esc(countryName(q.country))}</dd></div>
        <div><dt>Fictional contact</dt><dd>${esc(q.name || 'Not given')}<span>${esc(q.email || '')}</span></dd></div>
        <div><dt>Desired date</dt><dd>${q.desiredDate ? esc(dayText(q.desiredDate)) : '<span>Not specified</span>'}</dd></div>
        <div class="adm-facts-wide"><dt>Project details</dt><dd class="adm-details">${q.note ? esc(q.note) : '<span>None given</span>'}</dd></div>
      </dl>
      <div class="adm-request-foot">
        <p class="adm-note">${icon('info')}<span>No message sent. No deposit, reservation or service confirmed.</span></p>
        ${isNewRequest(q) ? `<button class="btn btn--secondary btn--small" type="button" data-action="adm-request" data-id="${esc(q.id)}">Simulate review<span class="sr-only">: ${name}, ${esc(q.id)}</span></button>` : ''}
      </div>
    </div>
  </article></li>`;
}

function requestsView(ctx) {
  const list = recentFirst(state.requests);
  const fresh = list.filter(isNewRequest).length;
  const body = list.length
    ? `<section class="adm-section adm-section--first" aria-labelledby="adm-requests-title">
        ${sectionHead('adm-requests-title', esc(plural(list.length, 'request', 'requests')),
          esc(`${fresh ? `${fresh} new` : 'All reviewed'}, most recent first. The exact steps remain to be defined with Vito.`), '', 'title-s')}
        <ol class="adm-requests" role="list">${list.map(requestCard).join('')}</ol>
      </section>`
    : emptyBlock({
      iconName: 'envelope',
      level: 2,
      title: 'No quote or reservation request yet',
      text: 'Open a car or a prefabricated house in the shop and request a quote or a reservation with fictional details. The request appears here.',
      actions: '<a class="btn btn--primary" href="#/catalog?mode=quote">Browse quote or reservation offers</a>'
    });
  const html = workspace({
    kind: 'admin',
    title: 'Quotes and reservations',
    lead: 'Cars and prefabricated houses go through a quote or reservation request, with no payment.',
    body
  });
  return page(docTitle('Quotes and reservations'), html, (main) => bind(main, ctx));
}

/* ---------- Open decisions ---------- */

const AGREED = [
  ['Buyers', 'Consumers only, at launch.'],
  ['Sellers', 'Individuals and businesses, after KYC or KYB verification.'],
  ['Products', 'New physical goods only, at launch.'],
  ['Catalog', 'Every offer worldwide that delivers to the selected country.'],
  ['Payment', 'One cart and one payment, then one shipment per seller.'],
  ['Stock and shipping', 'Each seller manages their own stock and ships their own orders.'],
  ['Presentation', 'One listing per seller offer, delivery shown separately.'],
  ['Site language', 'English.']
];

function settings(ctx) {
  const agreed = `<section class="adm-section adm-section--first" aria-labelledby="adm-agreed-title">
    ${sectionHead('adm-agreed-title', 'The agreed framework', 'Decisions already taken. The prototype follows them on every page.')}
    <div class="card surface-light adm-card adm-agreed-card" data-reveal>
      <dl class="adm-agreed">${AGREED.map(([term, text]) => `<div><dt>${icon('checkCircle')}<span>${esc(term)}</span></dt><dd>${esc(text)}</dd></div>`).join('')}</dl>
    </div>
  </section>`;

  const open = `<section class="adm-section" aria-labelledby="adm-open-title">
    ${sectionHead('adm-open-title', 'Open decisions', esc(`${OPEN.length} questions to settle with Vito. Nothing here is decided or calculated.`))}
    <ol class="adm-open" role="list">${OPEN.map(([title, , text], i) => `<li class="card surface-light adm-card adm-decision" data-reveal>
      <div class="adm-decision-top"><span class="adm-num" aria-hidden="true">${num2(i)}</span>${chip('To define with Vito', 'neutral')}</div>
      <h3 class="title-s adm-decision-title">${esc(title)}</h3>
      <p class="adm-text">${esc(text)}</p>
    </li>`).join('')}</ol>
  </section>`;

  const reset = `<section class="adm-section" aria-labelledby="adm-reset-title">
    <div class="card surface-light adm-card adm-reset" data-reveal>
      <div>
        <h2 class="title-s" id="adm-reset-title">Reset the demonstration</h2>
        <p class="adm-text">Signs out of the example account and clears the cart, saved offers, orders, requests, applications and every change made through the seller workspace or the back office. Only this browser’s demonstration data is affected; the delivery country is kept.</p>
      </div>
      <button class="btn btn--secondary" type="button" id="adm-reset" data-action="adm-reset">${icon('reset')}Reset the demonstration</button>
    </div>
  </section>`;

  const html = workspace({
    kind: 'admin',
    title: 'Decisions to make with Vito',
    lead: 'What is agreed, and what remains open. The prototype calculates no commission, membership fee or penalty.',
    body: agreed + open + reset
  });
  return page(docTitle('Open decisions'), html, (main) => bind(main, ctx));
}

export const views = {
  overview,
  vendors: sellers,
  products: moderation,
  orders: ordersView,
  requests: requestsView,
  settings
};
