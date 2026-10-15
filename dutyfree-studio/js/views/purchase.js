/* Purchase pages: cart, checkout and orders. One cart and one payment for several sellers, one shipment per seller.
 * Every amount is a demonstration amount in euros: nothing is paid, sent or confirmed. */
import {
  state, label, esc, icon, plural, money, moneyRound, dateText, countryName, countryIn, countryAt, sellerIn, vendor, vendorName,
  product, productHref, catalogHref, cartGroups, cartLines, cartTotals, lineIssue, shipping, deliverable, stock,
  available, publicOffer, shopOffers, modelKey, cutout, placeOrder, shipmentLabel, requestStatusLabel, requestKindLabel
} from '../core.js';
import { pageHead, emptyState, chip, demoTag, notice, offerCard, offerImage, cutImg, thumb, shipmentSteps } from '../ui/components.js';
import { openPanel } from '../ui/header.js';
import { SIZE, BLEED, BRANDED } from '../art.js';
import { CREDITS } from '../credits.js';

const docTitle = (text) => `${text} · DutyFreeDeal`;

/* Captions of product images (CONTRACT section 4): a generated illustration (the car, the house) is said to be generated. */
const GENERATED = new Set(CREDITS.filter((c) => c.kind === 'generated-illustration').map((c) => c.key));

/** "Illustrative photograph · fictional product, seller and price" (plural for several images), as HTML: when the caption
 * needs two lines, it breaks after the separator, never inside "fictional product, seller and price". */
function imageCaption(keys) {
  const n = keys.length;
  const generated = keys.filter((k) => GENERATED.has(k)).length;
  const kind = !generated ? (n > 1 ? 'Illustrative photographs' : 'Illustrative photograph')
    : generated === n ? (n > 1 ? 'Generated illustrations' : 'Generated illustration')
      : 'Illustrative photographs and generated illustrations';
  return `${esc(kind)} · <span class="nw">${esc(n > 1 ? 'fictional products, sellers and prices' : 'fictional product, seller and price')}</span>`;
}

/** Keeps the " · " separators of seller names and delivery times from starting or ending a line. */
const nb = (text) => String(text ?? '').replace(/ · /g, ' · ');

/** Button that opens the delivery country panel of the header. */
const destButton = (id) => `<button class="btn btn--secondary btn--small" type="button" id="${id}" data-pur-dest aria-controls="panel-dest" aria-expanded="false">${esc('Change')}<span class="sr-only"> ${esc('the delivery country')}</span></button>`;

/** The sellers' countries of a cart: "Sellers in France, Spain and the United States". */
function sellersPhrase(groups) {
  const order = ['FR', 'ES', 'US', 'MX'];
  const codes = [...new Set(groups.map((g) => g.v.country))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (codes.length === 1) return groups.length > 1 ? `Sellers ${countryAt(codes[0])}` : sellerIn(codes[0]);
  const names = codes.map((c) => countryAt(c).replace(/^in /, ''));
  return `Sellers in ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Where the parts of the cart come from (the sellers' countries) and where they go, with the way to change it. */
function routeBlock(groups, buttonId) {
  return `<div class="pur-route">
    <p class="pur-route-from">${esc(sellersPhrase(groups))}</p>
    <p class="pur-route-to"><span class="pur-dest">${icon('mapPin')}${esc(`Delivery ${countryIn(state.country)}`)}</span>${destButton(buttonId)}</p>
  </div>`;
}

/** Studio tile of an offer: its cut-out on the well, or the photograph as a cover. Decorative next to the linked name. */
function media(p, { href = '', cls = '', sizes = '128px' } = {}) {
  const cut = cutout(modelKey(p)) ? ' data-cut' : '';
  const img = offerImage(p, { sizes, alt: '' });
  return href
    ? `<a class="offer-media ${cls}" href="${href}" tabindex="-1" aria-hidden="true"${cut}>${img}</a>`
    : `<span class="offer-media ${cls}" aria-hidden="true"${cut}>${img}</span>`;
}

/** After an in-place update whose trigger has disappeared (a destination change, for example), focus goes to the page title. */
function settleFocus(main, ctx) {
  if (ctx.reason !== 'state') return;
  requestAnimationFrame(() => {
    const active = document.activeElement;
    if (!active || active === document.body) main.querySelector('h1')?.focus({ preventScroll: true });
  });
}

/**
 * Gives the sticky aside the height of its summary (--pur-sum-h, read by css/purchase.css), kept current when the text
 * reflows. A summary taller than the screen then scrolls with the page and stays with its totals in view.
 */
function fitSummary(main) {
  const aside = main.querySelector('.pur-aside');
  const card = aside?.querySelector('.pur-summary');
  if (!card) return () => {};
  const apply = () => aside.style.setProperty('--pur-sum-h', `${card.offsetHeight}px`);
  apply();
  if (typeof ResizeObserver !== 'function') return () => {};
  const observer = new ResizeObserver(apply);
  observer.observe(card);
  return () => observer.disconnect();
}

/** Destination of the last cart or checkout render: tells a change of delivery country apart from the other updates. */
let lastCountry = null;

/** After a change of delivery country, says what it did to the cart (lines blocked, new total). */
function announceDestination(ctx) {
  const changed = ctx.reason === 'state' && lastCountry !== null && lastCountry !== state.country;
  lastCountry = state.country;
  if (!changed || !cartLines().length) return;
  const sum = cartTotals();
  const dest = countryIn(state.country);
  ctx.announce(sum.blocked ? `Delivery ${dest}: ${blockedReason()}` : `Delivery ${dest}: total ${money(sum.total)}, delivery included.`);
}

/* ====================================================================================================
 * Cart
 * ==================================================================================================== */

/** Selector of the control that receives focus once a removed line has left the page. */
let pendingFocus = null;

/** What stops the plus button: the example stock, or the cart's limit of 99 per line. */
function limitText(p) {
  const n = stock(p);
  if (n <= 0) return '';
  return n > 99 ? 'Cart limit: 99 per line' : `Example stock: ${n} at most`;
}

function lineRow(line) {
  const { p, qty } = line;
  const name = label(p.name);
  const id = esc(p.id);
  const issue = lineIssue(line);
  const atMax = qty >= Math.min(stock(p), 99);
  /* The limit note is not repeated when the line's own issue already says it (a quantity above the example stock). */
  const limit = atMax ? limitText(p) : '';
  const note = limit && limit !== issue ? limit : '';
  const describedBy = atMax ? (note ? `pur-max-${id}` : issue ? `pur-issue-${id}` : '') : '';
  const time = label(p.delivery);
  return `<li class="pur-line" data-line="${id}" data-qty="${qty}"${issue ? ' data-issue' : ''}>
    ${media(p, { href: productHref(p), cls: 'pur-media' })}
    <div class="pur-line-info">
      <h3 class="pur-line-name"><a href="${productHref(p)}">${esc(name)}</a></h3>
      ${time ? `<p class="pur-line-sub">${esc(nb(`Delivery time: ${time}`))}</p>` : ''}
      <div class="pur-line-tools">
        <div class="qty pur-qty" role="group" aria-label="${esc(`Quantity of ${name}: ${qty}`)}">
          <button type="button" data-action="qty" data-id="${id}" data-step="-1" aria-label="${esc(`Remove one ${name}`)}">${icon('minus')}</button>
          <output aria-hidden="true">${qty}</output>
          <button type="button" data-action="qty" data-id="${id}" data-step="1" aria-label="${esc(`Add one ${name}`)}"${atMax ? ` aria-disabled="true"${describedBy ? ` aria-describedby="${describedBy}"` : ''}` : ''}>${icon('plus')}</button>
        </div>
        <button class="btn btn--quiet btn--small pur-remove" type="button" data-action="remove" data-id="${id}">${icon('trash')}${esc('Remove')}<span class="sr-only"> ${esc(name)} ${esc('from the cart')}</span></button>
        ${note ? `<p class="pur-max" id="pur-max-${id}">${esc(note)}</p>` : ''}
      </div>
      ${issue ? `<p class="chip chip--warning pur-issue" id="pur-issue-${id}">${icon('warning')}<span>${esc(issue)}</span></p>` : ''}
    </div>
    <div class="pur-line-amount">
      <p class="price">${esc(money(p.price * qty))}</p>
      ${qty > 1 ? `<p class="pur-each">${esc(`${qty} × ${money(p.price)}`)}</p>` : ''}
    </div>
  </li>`;
}

function sellerBlock({ v, lines }, position) {
  const ships = lines.some((l) => !lineIssue(l));
  const dest = countryIn(state.country);
  /* When nothing from this seller can be ordered, its delivery is not counted; the note on each line says why. */
  const foot = ships
    ? `<span>${esc(`Delivery ${dest}, shipped by this seller`)}</span><span class="price">+ ${esc(money(shipping(v.id)))}</span>`
    : `<span>${esc('No delivery counted for this seller.')}</span>`;
  const tag = !ships ? 'Not counted' : position.total > 1 ? `Shipment ${position.index} of ${position.total}` : 'One shipment';
  const head = `pur-seller-${esc(v.id)}`;
  return `<section class="pur-seller" aria-labelledby="${head}" data-reveal>
    <header class="pur-seller-head">
      <div>
        <h2 class="pur-seller-name" id="${head}">${esc(nb(vendorName(v)))}</h2>
        <p class="pur-seller-sub">${esc(sellerIn(v.country))}</p>
      </div>
      <p class="pur-tag">${esc(tag)}</p>
    </header>
    <ul class="pur-lines" role="list">${lines.map(lineRow).join('')}</ul>
    <p class="pur-ship">${icon('truck')}${foot}</p>
  </section>`;
}

function blockedReason() {
  const n = cartLines().filter((l) => lineIssue(l)).length;
  return `${plural(n, 'line needs', 'lines need')} a change before checkout.`;
}

function cartSummary(sum) {
  const items = cartLines().filter((l) => !lineIssue(l)).reduce((s, l) => s + l.qty, 0);
  const dest = countryIn(state.country);
  const next = sum.blocked
    ? 'Lines that cannot be ordered are left out of these amounts.'
    : sum.shipments > 1 ? `Each seller then ships their part ${dest}.` : `The seller then ships your order ${dest}.`;
  const one = sum.shipments
    ? `<p class="pur-one"><strong>${esc('One cart, one payment.')}</strong> ${esc(next)}</p>`
    : `<p class="pur-one"><strong>${esc('Nothing in this cart can be ordered as is.')}</strong></p>`;
  const cta = sum.blocked
    ? `<p class="pur-blocked" id="pur-blocked">${icon('warning')}<span>${esc(blockedReason())}</span></p>
      <button class="btn btn--primary btn--block pur-cta" type="button" aria-disabled="true" aria-describedby="pur-blocked" data-pur-blocked>${esc('Continue to checkout')}</button>`
    : `<a class="btn btn--primary btn--block pur-cta" href="#/checkout">${esc('Continue to checkout')}${icon('arrow')}</a>`;
  return `<div class="pur-summary" data-reveal>
    <div class="pur-summary-head"><h2 class="title-s" id="pur-summary-title">${esc('Summary')}</h2>${demoTag('Demonstration amounts')}</div>
    <dl class="pur-totals">
      <div><dt>${esc(`Products (${plural(items, 'item', 'items')})`)}</dt><dd>${esc(money(sum.subtotal))}</dd></div>
      <div><dt>${esc(`Delivery (${plural(sum.shipments, 'shipment', 'shipments')})`)}</dt><dd>${esc(money(sum.delivery))}</dd></div>
      <div class="pur-grand"><dt>${esc('Total')}</dt><dd>${esc(money(sum.total))}</dd></div>
    </dl>
    ${one}
    ${cta}
    <p class="pur-fine">${esc('No real payment: these amounts illustrate the checkout journey.')}</p>
  </div>`;
}

/* Offers shown in an empty cart: deliverable now, cut out, from sellers in different countries. */
const SUGGEST = ['ceramic-vase', 'moka-pot', 'tennis-racket', 'chef-knife', 'felt-hat', 'leather-boots', 'fountain-pen', 'sunglasses', 'watch', 'wooden-blocks', 'bicycle', 'olive-oil'];

function suggestions(count = 4) {
  const rank = (p) => {
    const i = SUGGEST.indexOf(modelKey(p));
    return i === -1 ? 99 : i;
  };
  const pool = shopOffers().filter((p) => available(p) && cutout(modelKey(p))).sort((a, b) => rank(a) - rank(b) || a.price - b.price);
  const out = [];
  for (const strict of [true, false]) {
    for (const p of pool) {
      if (out.length === count) break;
      if (out.some((o) => modelKey(o) === modelKey(p))) continue;
      if (strict && out.some((o) => vendor(o.vendorId).country === vendor(p.vendorId).country)) continue;
      out.push(p);
    }
  }
  return out;
}

const savedCount = () => state.favorites.map(product).filter(Boolean).length;
const savedText = (n) => (n > 1 ? `See your ${n} saved offers` : 'See your saved offer');

function emptyCart() {
  const picks = suggestions();
  const saved = savedCount();
  return `<div class="page wrap pur-page">
    ${pageHead({
      title: `${esc('Your cart is empty.')} <span class="soft">${esc(`Start with an offer delivering ${countryIn(state.country)}.`)}</span>`,
      lead: esc('Add offers from several sellers: each one ships their part, and you pay once for the whole cart.'),
      actions: `<a class="btn btn--primary" href="#/categories">${esc('Explore the departments')}</a>${saved ? `<a class="btn btn--secondary" href="#/wishlist">${esc(savedText(saved))}</a>` : ''}`
    })}
    ${picks.length ? `<section class="pur-suggest" aria-labelledby="pur-suggest-title">
      <div class="section-head">
        <div>
          <h2 class="title-m" id="pur-suggest-title" data-reveal>${esc('From around the world')}</h2>
          <p class="lead" data-reveal>${esc('Offers you can order now from sellers in different countries, with delivery shown separately.')}</p>
        </div>
        <a class="more" href="${catalogHref({ mode: 'purchase' })}" data-reveal>${esc('See every direct-purchase offer')}${icon('arrow')}</a>
      </div>
      <ul class="offers offers--grid" role="list">${picks.map((p) => offerCard(p)).join('')}</ul>
    </section>` : ''}
  </div>`;
}

/** Where focus goes once a line leaves the cart: the next line, the previous one, or the page title. */
function focusAfterRemoval(main, line) {
  const lines = [...main.querySelectorAll('[data-line]')];
  const i = lines.indexOf(line);
  const next = lines[i + 1] || lines[i - 1];
  return next ? `[data-line="${CSS.escape(next.dataset.line)}"] .pur-line-name a` : 'h1';
}

function mountCart(main, ctx) {
  const onClick = (event) => {
    const t = event.target.closest('button, a');
    if (!t || !main.contains(t)) return;
    if (t.hasAttribute('data-pur-dest')) {
      openPanel('dest', t);
      return;
    }
    if (t.hasAttribute('data-pur-blocked')) {
      const first = main.querySelector('[data-line][data-issue] .pur-line-name a');
      ctx.announce(blockedReason());
      first?.focus();
      return;
    }
    if (t.dataset.action === 'qty' && t.getAttribute('aria-disabled') === 'true') {
      /* The example stock (or the cart limit) is reached. setCartQty() would keep the quantity, but the shared action
       * would still announce one more unit: it must not run, and the limit is said instead. */
      event.stopPropagation();
      const p = product(t.dataset.id);
      if (p) ctx.announce(`${limitText(p) || lineIssue({ p, qty: stock(p) + 1 })}, ${label(p.name)}`);
      return;
    }
    const line = t.closest('[data-line]');
    if (line && (t.dataset.action === 'remove' || (t.dataset.action === 'qty' && t.dataset.step === '-1' && Number(line.dataset.qty) <= 1))) {
      pendingFocus = focusAfterRemoval(main, line);
    }
  };
  main.addEventListener('click', onClick);
  if (pendingFocus) {
    const target = pendingFocus;
    pendingFocus = null;
    /* Runs after the shared action has placed its own focus, so the nearest line wins. */
    requestAnimationFrame(() => main.querySelector(target)?.focus());
  }
  settleFocus(main, ctx);
  announceDestination(ctx);
  const unfit = fitSummary(main);
  return () => {
    main.removeEventListener('click', onClick);
    unfit();
  };
}

function cart() {
  const groups = cartGroups();
  if (!groups.length) return { title: docTitle('Cart'), html: emptyCart(), mount: mountCart };
  const sum = cartTotals();
  const total = groups.filter((g) => g.lines.some((l) => !lineIssue(l))).length;
  let index = 0;
  const blocks = groups.map((g) => {
    if (g.lines.some((l) => !lineIssue(l))) index += 1;
    return sellerBlock(g, { index, total });
  }).join('');
  const soft = !sum.shipments ? 'Nothing can be ordered as is.'
    : groups.length > 1 ? `${plural(groups.length, 'seller', 'sellers')}, one payment.` : 'One seller, one payment.';
  const html = `<div class="page wrap pur-page">
    ${pageHead({
      title: `${esc('Your cart.')} <span class="soft">${esc(soft)}</span>`,
      lead: esc('Delivery is shown separately, with one example fee per seller.'),
      actions: routeBlock(groups, 'pur-dest-cart')
    })}
    <div class="pur-layout">
      <div class="pur-main">${blocks}</div>
      <aside class="pur-aside" aria-labelledby="pur-summary-title">${cartSummary(sum)}</aside>
    </div>
  </div>`;
  return { title: docTitle('Cart'), html, mount: mountCart };
}

/* ====================================================================================================
 * Checkout
 * ==================================================================================================== */

const FIELDS = [
  { name: 'name', text: 'Fictional full name' },
  { name: 'email', text: 'Fictional email', type: 'email' },
  { name: 'address', text: 'Address', full: true },
  { name: 'postal', text: 'Postal code' },
  { name: 'city', text: 'City' }
];

/* Realistic but fictional delivery details for each example market. */
const EXAMPLES = {
  FR: { name: 'Camille Durand', email: 'camille.durand@example.com', address: '12 Avenue Victor Hugo', postal: '69003', city: 'Lyon' },
  ES: { name: 'Lucia Romero', email: 'lucia.romero@example.com', address: 'Calle Mayor 24', postal: '28013', city: 'Madrid' },
  US: { name: 'Jordan Ellis', email: 'jordan.ellis@example.com', address: '742 Maple Street', postal: '97205', city: 'Portland, OR' },
  MX: { name: 'Sofia Navarro', email: 'sofia.navarro@example.com', address: 'Calle Colima 85', postal: '06700', city: 'Mexico City' }
};

const MESSAGES = {
  name: 'Enter a fictional full name.',
  address: 'Enter a street address.',
  postal: 'Enter a postal code.',
  city: 'Enter a city.',
  payment: 'Choose the demonstration payment.',
  consent: 'Confirm that you understand this is a simulation.'
};

/** Values typed in the checkout, kept in memory while browsing (never stored). Only what the visitor typed or filled goes here. */
let draft = {};
/** Field errors of the last submission, by field name. */
let errors = {};

/** The value a field starts with: what was typed, otherwise the name or email of the example account while signed in. */
const startValue = (name) => draft[name] ?? (name === 'name' || name === 'email' ? state.account?.[name] || '' : '');

function fieldError(name, value) {
  const v = String(value ?? '').trim();
  if (name === 'email') {
    if (!v) return 'Enter a fictional email address.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter an email address in the format name@example.com.';
  }
  if (name === 'payment' || name === 'consent') return value ? '' : MESSAGES[name];
  return v ? '' : MESSAGES[name] || '';
}

function readForm(form) {
  const values = {};
  for (const f of FIELDS) values[f.name] = form.elements[f.name]?.value || '';
  values.payment = Boolean(form.querySelector('input[name="payment"]:checked'));
  values.consent = Boolean(form.elements.consent?.checked);
  return values;
}

const ORDERED = [...FIELDS.map((f) => f.name), 'payment', 'consent'];

/* Short names of the fields in the list at the top; the full message stays next to each field. */
const SHORT = { name: 'Full name', email: 'Email', address: 'Address', postal: 'Postal code', city: 'City', payment: 'Payment', consent: 'Simulation confirmation' };

const errorCount = (n) => `${plural(n, 'field to check', 'fields to check')} before placing the order`;
const errorBody = (msg) => `${icon('warning')}<span>${esc(msg)}</span>`;

/** Content of the list at the top of the form: links to the fields to check, or why the cart cannot be ordered. */
function errorList() {
  if (errors.cart) return `<p class="pur-errors-title">${icon('warning')}<span>${esc(errors.cart)}</span></p><a class="more" href="#/cart">${esc('Back to the cart')}${icon('arrow')}</a>`;
  const names = ORDERED.filter((n) => errors[n]);
  return `<p class="pur-errors-title">${icon('warning')}<span>${esc(errorCount(names.length))}</span></p>
    <ul class="pur-errors-links" role="list">${names.map((n) => `<li><a href="#co-${n}">${esc(SHORT[n])}</a></li>`).join('')}</ul>`;
}

function coField({ name, text, type = 'text', full = false }) {
  const id = `co-${name}`;
  const err = errors[name] || '';
  return `<div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${esc(text)} <span aria-hidden="true">*</span></label>
    <input class="input" id="${id}" name="${name}" type="${type}" value="${esc(startValue(name))}" required autocomplete="off" spellcheck="false" aria-describedby="${id}-error"${err ? ' aria-invalid="true"' : ''}>
    <p class="pur-field-error" id="${id}-error"${err ? '' : ' hidden'}>${err ? errorBody(err) : ''}</p>
  </div>`;
}

/* The summary of the checkout follows the example cart of the home page: seller, items, then that seller's delivery. */
function checkoutSummary(sum) {
  const groups = cartGroups();
  const dest = countryIn(state.country);
  const rows = groups.map(({ v, lines }) => `<li class="pur-sum-ship">
      <p class="pur-sum-seller">${esc(nb(vendorName(v)))} <span>· ${esc(sellerIn(v.country))}</span></p>
      <ul class="pur-sum-lines" role="list">${lines.map(({ p, qty }) => `<li class="pur-sum-line">
        ${thumb(p, 'thumb--s')}
        <span class="pur-sum-name">${esc(label(p.name))}${qty > 1 ? `<span class="pur-sum-qty">${esc(`Quantity ${qty}`)}</span>` : ''}</span>
        <span class="price">${esc(money(p.price * qty))}</span>
      </li>`).join('')}</ul>
      <p class="pur-sum-fee"><span>${esc(`Delivery ${dest}, shipped by this seller`)}</span><span>+ ${esc(money(shipping(v.id)))}</span></p>
    </li>`).join('');
  const items = cartLines().reduce((s, l) => s + l.qty, 0);
  return `<div class="pur-summary" data-reveal>
    <div class="pur-summary-head">
      <h2 class="title-s" id="pur-summary-title">${esc('Your order')}</h2>
      <a class="link-btn" href="#/cart">${esc('Edit the cart')}</a>
    </div>
    <ol class="pur-sum-ships" role="list">${rows}</ol>
    <dl class="pur-totals">
      <div><dt>${esc(`Products (${plural(items, 'item', 'items')})`)}</dt><dd>${esc(money(sum.subtotal))}</dd></div>
      <div><dt>${esc(`Delivery (${plural(sum.shipments, 'shipment', 'shipments')})`)}</dt><dd>${esc(money(sum.delivery))}</dd></div>
      <div class="pur-grand"><dt>${esc('Total')}</dt><dd>${esc(money(sum.total))}</dd></div>
    </dl>
    <p class="pur-fine">${esc('One simulated payment.')}<br>${esc('No card details, no real transaction.')}</p>
  </div>`;
}

function checkoutForm(sum) {
  const dest = countryIn(state.country);
  const hasErrors = ORDERED.some((n) => errors[n]) || Boolean(errors.cart);
  const pay = errors.payment || '';
  const consent = errors.consent || '';
  /* The list at the top is not a live region: it follows the corrections silently. The alert below speaks once per submission. */
  return `<form class="pur-form" data-form="checkout" novalidate aria-label="${esc('Checkout')}">
    <div class="form-error pur-errors" id="pur-errors" data-pur-errors${hasErrors ? '' : ' hidden'}>${hasErrors ? errorList() : ''}</div>
    <p class="sr-only" role="alert" data-pur-alert></p>

    <section class="pur-block" aria-labelledby="co-delivery-title" data-reveal>
      <div class="pur-block-head">
        <h2 class="pur-block-title" id="co-delivery-title"><span class="soft">1.</span> ${esc('Delivery')}</h2>
        <button class="btn btn--secondary btn--small" type="button" data-pur-fill>${icon('pencil')}${esc('Fill in an example')}</button>
      </div>
      <div class="form-grid">
        ${FIELDS.map(coField).join('')}
        <div class="field field--full">
          <p class="pur-label" id="co-country-label">${esc('Country')}</p>
          <div class="pur-country" role="group" aria-labelledby="co-country-label" aria-describedby="co-country-help">
            <span class="pur-country-name">${icon('mapPin')}${esc(countryName(state.country))}</span>
            ${destButton('pur-dest-checkout')}
          </div>
          <p class="help" id="co-country-help">${esc('The delivery destination of your cart.')}</p>
        </div>
      </div>
    </section>

    <section class="pur-block" aria-labelledby="co-pay-title" data-reveal>
      <h2 class="pur-block-title" id="co-pay-title"><span class="soft">2.</span> ${esc('One payment')}</h2>
      <p class="pur-block-lead">${esc(sum.shipments > 1 ? `A single payment covers the ${sum.shipments} shipments of this order.` : 'A single payment covers this shipment.')}</p>
      <fieldset class="pur-pay">
        <legend class="sr-only">${esc('Payment method')}</legend>
        <div class="pur-option">
          <input type="radio" id="co-payment" name="payment" value="demo" checked required aria-describedby="co-payment-note co-payment-error"${pay ? ' aria-invalid="true"' : ''}>
          <div class="pur-option-text">
            <label for="co-payment">${esc('Demonstration payment · no card details')}</label>
            <span id="co-payment-note">${esc('Simulated: no card number is requested and nothing is charged.')}</span>
          </div>
        </div>
        <p class="pur-field-error" id="co-payment-error"${pay ? '' : ' hidden'}>${pay ? errorBody(pay) : ''}</p>
      </fieldset>
    </section>

    <div class="pur-place" data-reveal>
      <label class="check pur-consent">
        <input type="checkbox" id="co-consent" name="consent" value="yes" required aria-describedby="co-consent-error"${consent ? ' aria-invalid="true"' : ''}>
        <span>${esc('I understand this is a simulation with no real purchase')} <span aria-hidden="true">*</span></span>
      </label>
      <p class="pur-field-error" id="co-consent-error"${consent ? '' : ' hidden'}>${consent ? errorBody(consent) : ''}</p>
      <div class="pur-place-row">
        <button class="btn btn--primary pur-submit" type="submit">${esc('Place the example order')}</button>
        <p class="pur-place-total"><span class="price">${esc(money(sum.total))}</span> <span>${esc(`Total, delivery ${dest} included`)}</span></p>
      </div>
    </div>
  </form>`;
}

/** Shows or clears the error of one field in place. */
function paintField(form, name) {
  const msg = errors[name] || '';
  const control = form.querySelector(`#co-${name}`);
  const slot = form.querySelector(`#co-${name}-error`);
  if (control) {
    if (msg) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }
  if (slot) {
    slot.hidden = !msg;
    slot.innerHTML = msg ? errorBody(msg) : '';
  }
}

/** Paints every field and the list at the top; on a submission, the alert says how many fields to check. */
function paintErrors(form, { submit = false } = {}) {
  ORDERED.forEach((n) => paintField(form, n));
  const box = form.querySelector('[data-pur-errors]');
  const any = ORDERED.some((n) => errors[n]) || Boolean(errors.cart);
  if (!any) {
    box.hidden = true;
    box.innerHTML = '';
    /* Nothing left to check: the alert of the last submission no longer applies (clearing it is not announced). */
    form.querySelector('[data-pur-alert]').textContent = '';
    return;
  }
  /* The list appears on a submission; afterwards it follows the corrections, silently. */
  if (submit || !box.hidden) {
    box.innerHTML = errorList();
    box.hidden = false;
  }
  if (submit) {
    const alert = form.querySelector('[data-pur-alert]');
    const message = errors.cart || `${errorCount(ORDERED.filter((n) => errors[n]).length)}.`;
    alert.textContent = '';
    requestAnimationFrame(() => { alert.textContent = message; });
  }
}

function mountCheckout(main, ctx) {
  const form = main.querySelector('form[data-form="checkout"]');
  const onClick = (event) => {
    const t = event.target.closest('button, a');
    if (!t || !main.contains(t)) return;
    if (t.hasAttribute('data-pur-dest')) {
      openPanel('dest', t);
      return;
    }
    if (t.hasAttribute('data-pur-fill') && form) {
      const example = EXAMPLES[state.country] || EXAMPLES.FR;
      /* Signed in with the example account: its name and email stay (they come from the account, not the draft,
       * so they leave with it on sign-out); the example gives the address in the destination country. */
      const own = (name) => ((name === 'name' || name === 'email') && state.account?.[name]) || '';
      for (const [name, value] of Object.entries(example)) {
        const el = form.elements[name];
        if (!el) continue;
        el.value = own(name) || value;
        if (own(name)) delete draft[name];
        else draft[name] = value;
        delete errors[name];
      }
      paintErrors(form);
      /* "for France", "for the United States": the destination phrase of core.js, with its article. */
      const where = countryIn(state.country).replace(/^to /, 'for ');
      ctx.toast(`${own('name') || own('email') ? 'Example address' : 'Example details'} filled in ${where}`, 'pencil');
    }
  };
  const onInput = (event) => {
    const el = event.target;
    if (!el.name) return;
    /* Only what the visitor types goes into the draft: the values the app puts back after a re-render (synthetic
     * events) can hold the example account's name and email, which must not outlive a sign-out. */
    if (event.isTrusted && FIELDS.some((f) => f.name === el.name)) draft[el.name] = el.value;
    if (!errors[el.name]) return;
    const value = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
    const msg = fieldError(el.name, value);
    if (msg === errors[el.name]) return;
    if (msg) errors[el.name] = msg;
    else delete errors[el.name];
    paintErrors(form);
  };
  const onSubmit = (event) => {
    event.preventDefault();
    const values = readForm(form);
    errors = {};
    for (const n of ORDERED) {
      const msg = fieldError(n, values[n]);
      if (msg) errors[n] = msg;
    }
    const first = ORDERED.find((n) => errors[n]);
    if (first) {
      paintErrors(form, { submit: true });
      form.querySelector(`#co-${first}`)?.focus();
      return;
    }
    const contact = Object.fromEntries(FIELDS.map((f) => [f.name, values[f.name].trim()]));
    const order = placeOrder(contact);
    if (!order) {
      errors = { cart: 'The cart changed and cannot be ordered as is. Check it before placing the order.' };
      paintErrors(form, { submit: true });
      form.querySelector('[data-pur-errors] a')?.focus();
      return;
    }
    draft = {};
    errors = {};
    ctx.go(`#/orders?placed=${encodeURIComponent(order.id)}`);
  };
  main.addEventListener('click', onClick);
  settleFocus(main, ctx);
  announceDestination(ctx);
  form?.addEventListener('input', onInput);
  form?.addEventListener('change', onInput);
  form?.addEventListener('submit', onSubmit);
  const unfit = fitSummary(main);
  return () => {
    main.removeEventListener('click', onClick);
    form?.removeEventListener('input', onInput);
    form?.removeEventListener('change', onInput);
    form?.removeEventListener('submit', onSubmit);
    unfit();
  };
}

function checkout(ctx) {
  if (ctx.reason === 'route') errors = {};
  const crumbs = [['Cart', '#/cart'], ['Checkout', '']];
  const groups = cartGroups();
  const dest = countryIn(state.country);
  if (!groups.length) {
    return {
      title: docTitle('Checkout'),
      html: `<div class="page wrap pur-page">${pageHead({ crumbs, title: esc('Checkout') })}${emptyState({
        iconName: 'bag',
        title: esc('Your cart is empty'),
        text: esc(`Checkout starts from a cart. Add offers that deliver ${dest} first.`),
        actions: `<a class="btn btn--primary" href="#/categories">${esc('Explore the departments')}</a><a class="btn btn--secondary" href="#/cart">${esc('Go to the cart')}</a>`
      })}</div>`,
      mount: mountCheckout
    };
  }
  const sum = cartTotals();
  if (sum.blocked) {
    const issues = cartLines().filter((l) => lineIssue(l));
    return {
      title: docTitle('Checkout'),
      html: `<div class="page wrap pur-page">
        ${pageHead({ crumbs, title: `${esc('Checkout.')} <span class="soft">${esc('Your cart needs a change first.')}</span>`, lead: esc('Checkout opens once every line of the cart can be ordered as is.') })}
        <section class="pur-halt" aria-labelledby="pur-halt-title" data-reveal>
          <h2 class="title-s" id="pur-halt-title">${esc(plural(issues.length, 'line to change', 'lines to change'))}</h2>
          <ul class="pur-halt-list" role="list">${issues.map((l) => `<li>${thumb(l.p, 'thumb--xl')}<div><p class="pur-halt-name">${esc(label(l.p.name))}</p><p class="pur-halt-why">${icon('warning')}<span>${esc(lineIssue(l))}</span></p></div></li>`).join('')}</ul>
          <div class="pur-halt-actions">
            <a class="btn btn--primary" href="#/cart">${icon('arrowLeft')}${esc('Back to the cart')}</a>
            ${issues.some((l) => !deliverable(l.p)) ? `<button class="btn btn--secondary" type="button" id="pur-dest-halt" data-pur-dest aria-controls="panel-dest" aria-expanded="false">${esc('Change the delivery country')}</button>` : ''}
          </div>
        </section>
      </div>`,
      mount: mountCheckout
    };
  }
  const html = `<div class="page wrap pur-page">
    ${pageHead({
      crumbs,
      title: `${esc('Checkout.')} <span class="soft">${esc(sum.shipments > 1 ? `One payment for ${plural(sum.shipments, 'shipment', 'shipments')}.` : 'One payment, one shipment.')}</span>`,
      lead: esc('Delivery details, then one payment for the whole cart.')
    })}
    <div class="pur-layout pur-layout--checkout">
      ${checkoutForm(sum)}
      <aside class="pur-aside" aria-labelledby="pur-summary-title">${checkoutSummary(sum)}</aside>
    </div>
  </div>`;
  return { title: docTitle('Checkout'), html, mount: mountCheckout };
}

/* ====================================================================================================
 * Orders and requests
 * ==================================================================================================== */

const STATUS_TONE = { pending: 'neutral', preparing: 'info', shipped: 'info', delivered: 'success' };

/** Date-only values (a desired date) are read at midday so that no time zone shifts them. */
const dayText = (value) => dateText(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T12:00:00` : value);
const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

/**
 * Objects of the order's still life: one per seller first, at most three. Objects photographed with a visible brand
 * appear only when the order has no other cut-out (the department cards of the home page never show them).
 */
function stageKeys(order) {
  const usable = (k) => cutout(k) && !BLEED.has(k);
  const pick = (ok) => {
    const firsts = order.shipments.map((s) => s.items.map(modelKey).find((k) => usable(k) && ok(k))).filter(Boolean);
    const all = order.shipments.flatMap((s) => s.items.map(modelKey)).filter((k) => usable(k) && ok(k));
    return [...new Set([...firsts, ...all])].slice(0, 3);
  };
  const plain = pick((k) => !BRANDED.has(k));
  return plain.length ? plain : pick(() => true);
}

/** The still life and its caption: the department-card composition (tallest in the middle, slight overlap, shared .obj). */
function stage(order) {
  const art = stageArt(order);
  return art.html ? `<div class="pur-stage-wrap" data-reveal>${art.html}<p class="pur-stage-note">${imageCaption(art.keys)}</p></div>` : '';
}

function stageArt(order) {
  const items = order.shipments.flatMap((s) => s.items);
  const keys = stageKeys(order);
  const sizes = '(max-width: 900px) 40vw, 280px';
  if (!keys.length) {
    /* A photograph cut at its right edge sits flush right; without any cut-out, the first photograph is shown whole. */
    const bleed = items.map(modelKey).find((k) => cutout(k) && BLEED.has(k));
    if (bleed) return { keys: [bleed], html: `<div class="pur-stage" aria-hidden="true"><span class="obj obj--bleed" style="--h:${Math.min(SIZE[bleed] || 50, 66)}%">${cutImg(bleed, { sizes })}</span></div>` };
    if (!items.length) return { keys: [], html: '' };
    return { keys: [modelKey(items[0])], html: `<div class="pur-stage pur-stage--photo" aria-hidden="true">${offerImage(items[0], { alt: '', sizes: '(max-width: 900px) 90vw, 640px' })}</div>` };
  }
  const ratio = 16 / 10;
  const objs = keys.map((k) => {
    const c = cutout(k);
    const h = Math.min(SIZE[k] || 40, 66);
    return { k, h, w: (h * (c.w / c.h)) / ratio };
  }).sort((a, b) => b.h - a.h);
  /* Small objects alone would be lost on the stage: the group grows together, keeping its proportions. */
  const want = objs.length === 1 ? 58 : 46;
  if (objs[0].h < want) objs.forEach((o) => { o.w *= want / objs[0].h; o.h *= want / objs[0].h; });
  const ordered = objs.length === 3 ? [objs[1], objs[0], objs[2]] : objs;
  let gap = ordered.length > 1 ? -Math.min(...ordered.map((o) => o.w)) * 0.12 : 0;
  let total = ordered.reduce((s, o) => s + o.w, 0) + gap * (ordered.length - 1);
  if (total > 86) {
    const f = 86 / total;
    ordered.forEach((o) => { o.w *= f; o.h *= f; });
    gap *= f;
    total = 86;
  }
  let left = 50 - total / 2;
  return { keys, html: `<div class="pur-stage" aria-hidden="true">${ordered.map((o) => {
    const x = left + o.w / 2;
    left += o.w + gap;
    return `<span class="obj" style="--h:${o.h.toFixed(1)}%;--x:${x.toFixed(1)}%;--z:${o === objs[0] ? 2 : 3}">${cutImg(o.k, { sizes })}</span>`;
  }).join('')}</div>` };
}

function placedBand(o) {
  const n = o.shipments.length;
  const lead = n > 1
    ? 'One simulated payment. Each seller now prepares their part. Nothing was sent: no email, no message, no real transaction.'
    : 'One simulated payment. The seller now prepares your order. Nothing was sent: no email, no message, no real transaction.';
  return `<section class="pur-placed surface-dark" aria-labelledby="pur-placed-title">
    <div class="wrap pur-placed-grid">
      <div class="pur-placed-copy">
        <h1 class="title-xl" id="pur-placed-title" tabindex="-1" data-reveal>${esc('Your example order is placed.')} <span class="soft">${esc('Thank you.')}</span></h1>
        <p class="lead" data-reveal>${esc(lead)}</p>
        <dl class="pur-receipt" data-reveal>
          <div><dt>${esc('Total, delivery included')}</dt><dd class="price pur-receipt-total">${esc(money(o.total))}</dd></div>
          <div><dt>${esc('Order number')}</dt><dd>${esc(o.id)}</dd></div>
          <div><dt>${esc('Date')}</dt><dd>${esc(dateText(o.date))}</dd></div>
          <div><dt>${esc(`Delivery ${countryIn(o.country)}`)}</dt><dd>${esc(n > 1 ? `${plural(n, 'shipment', 'shipments')}, one per seller` : 'One shipment')}</dd></div>
        </dl>
        <div class="pur-placed-actions" data-reveal>
          <a class="btn btn--primary" href="#order-${esc(o.id)}">${esc(n > 1 ? 'See the shipments' : 'See the shipment')}</a>
          <a class="btn btn--secondary" href="#/">${esc('Continue shopping')}</a>
        </div>
      </div>
      ${stage(o)}
    </div>
  </section>`;
}

function shipmentRow(o, s, i, n) {
  const v = vendor(s.vendorId);
  const items = s.items.map((it) => {
    const p = product(it.id);
    const name = label(it.name);
    return `<li class="pur-item">
      ${thumb({ image: it.image }, 'thumb--l')}
      <div>
        <p class="pur-item-name">${p && publicOffer(p) ? `<a href="${productHref(p)}">${esc(name)}</a>` : esc(name)}</p>
        <p class="pur-item-sub">${esc(`Quantity ${it.qty}${it.qty > 1 ? ` · ${money(it.price)} each` : ''}`)}</p>
      </div>
      <p class="price">${esc(money(it.price * it.qty))}</p>
    </li>`;
  }).join('');
  /* The kicker is read after the seller's name and shown above it. */
  return `<li class="pur-ship-row">
    <div class="pur-ship-side">
      <h4 class="pur-seller-name">${esc(nb(s.vendorName))}</h4>
      ${v ? `<p class="pur-seller-sub">${esc(sellerIn(v.country))}</p>` : ''}
      <p class="pur-tag">${esc(n > 1 ? `Shipment ${i + 1} of ${n}` : 'One shipment')}</p>
      ${chip(shipmentLabel(s.status), STATUS_TONE[s.status] || 'neutral')}
    </div>
    <div class="pur-ship-main">
      ${shipmentSteps(s.status, { name: `Shipment progress, ${s.vendorName}` })}
      <ul class="pur-items" role="list">${items}</ul>
      <p class="pur-ship">${icon('truck')}<span>${esc(`Delivery ${countryIn(o.country)}, shipped by this seller`)}</span><span class="price">+ ${esc(money(s.shipping))}</span></p>
    </div>
  </li>`;
}

function orderCard(o, placedId) {
  const n = o.shipments.length;
  const id = `order-${esc(o.id)}`;
  const who = [o.contact?.name, o.contact?.city].filter(Boolean).join(', ');
  /* The anchor is the list item: its box is not offset by the entrance of the card, so the scroll lands right.
   * The kicker (date, destination, shipments) is read after the order number and shown above it. */
  return `<li class="pur-order-item" id="${id}"><article class="pur-order" aria-labelledby="${id}-title" data-reveal>
    <header class="pur-order-head">
      <div class="pur-order-id">
        <div class="pur-order-line">
          <h3 class="pur-order-title" id="${id}-title">${esc(`Order ${o.id}`)}</h3>
          ${o.id === placedId ? chip('Just placed', 'neutral') : ''}
        </div>
        <p class="pur-order-kicker">${esc(`${dateText(o.date)} · Delivery ${countryIn(o.country)} · ${plural(n, 'shipment', 'shipments')}`)}</p>
        ${who ? `<p class="pur-order-meta">${esc(`Fictional recipient: ${who}`)}</p>` : ''}
      </div>
      <dl class="pur-totals pur-order-sum">
        <div><dt>${esc('Products')}</dt><dd>${esc(money(o.subtotal))}</dd></div>
        <div><dt>${esc(`Delivery (${plural(n, 'shipment', 'shipments')})`)}</dt><dd>${esc(money(o.delivery))}</dd></div>
        <div class="pur-grand"><dt>${esc('Total')}</dt><dd>${esc(money(o.total))}</dd></div>
      </dl>
    </header>
    <ol class="pur-ship-rows" role="list">${o.shipments.map((s, i) => shipmentRow(o, s, i, n)).join('')}</ol>
  </article></li>`;
}

function requestCard(r) {
  const p = product(r.productId);
  const v = vendor(r.vendorId);
  const name = label(r.productName);
  const img = { image: r.image, name: r.productName };
  /* Only an offer the shop still shows gets a link; the others would open "This offer is unavailable". */
  const href = p && publicOffer(p) ? productHref(p) : '';
  /* The price saved with the request when there is one; otherwise the offer's price of today, said as such. */
  const kept = typeof r.price === 'number' && r.price > 0;
  const price = kept ? r.price : p?.price;
  return `<li class="pur-req" data-reveal>
    <figure class="pur-req-figure">
      ${media(img, { href, cls: 'pur-req-media', sizes: '280px' })}
      <figcaption>${imageCaption([modelKey(img)])}</figcaption>
    </figure>
    <div class="pur-req-body">
      <p class="pur-req-kind">${esc(requestKindLabel(r.kind))}</p>
      <h3 class="pur-req-name">${href ? `<a href="${href}">${esc(name)}</a>` : esc(name)}</h3>
      <p class="pur-seller-sub">${esc(nb([v ? sellerIn(v.country) : '', r.vendorName].filter(Boolean).join(' · ')))}</p>
      <dl class="pur-facts">
        <div><dt>${esc('Number')}</dt><dd>${esc(r.id)}</dd></div>
        <div><dt>${esc('Date')}</dt><dd>${esc(dateText(r.date))}</dd></div>
        <div><dt>${esc('Destination')}</dt><dd>${esc(countryName(r.country))}</dd></div>
        ${price ? `<div><dt>${esc(kept ? 'Indicative price' : 'Current indicative price')}</dt><dd>${esc(moneyRound(price))}</dd></div>` : ''}
        ${r.desiredDate ? `<div><dt>${esc('Desired date')}</dt><dd>${esc(dayText(r.desiredDate))}</dd></div>` : ''}
        ${r.note ? `<div class="pur-facts-wide"><dt>${esc('Project details')}</dt><dd>${esc(r.note)}</dd></div>` : ''}
      </dl>
      ${chip(requestStatusLabel(r.status), r.status === 'reviewing' ? 'info' : 'neutral')}
    </div>
  </li>`;
}

function ordersSection(list, placedId) {
  const body = list.length
    ? `<ol class="pur-orders" role="list">${list.map((o) => orderCard(o, placedId)).join('')}</ol>
      <p class="pur-note">${icon('info')}<span>${esc('Demonstration shipments and statuses.')}</span></p>`
    : `<p class="pur-none">${esc('No order yet. Orders placed from the cart appear here, with one shipment per seller.')} <a class="more" href="#/categories">${esc('Explore the departments')}${icon('arrow')}</a></p>`;
  return `<section class="pur-section" aria-labelledby="pur-orders-title">
    <div class="section-head">
      <h2 class="title-m" id="pur-orders-title" data-reveal>${esc('Orders')}</h2>
      ${list.length ? `<p class="pur-count" data-reveal>${esc(list.length > 1 ? `${plural(list.length, 'order', 'orders')}, most recent first` : '1 order')}</p>` : ''}
    </div>
    ${body}
  </section>`;
}

function requestsSection(list) {
  const body = list.length
    ? `<ul class="pur-reqs" role="list">${list.map(requestCard).join('')}</ul>
      <p class="pur-note">${icon('info')}<span>${esc('No message sent, no deposit and no confirmed booking.')}</span></p>`
    : `<p class="pur-none">${esc('No request yet. Large goods, such as cars and prefabricated houses, go through a quote or reservation request.')} <a class="more" href="${catalogHref({ mode: 'quote' })}">${esc('See the offers on quotation')}${icon('arrow')}</a></p>`;
  return `<section class="pur-section" aria-labelledby="pur-requests-title">
    <div class="section-head">
      <h2 class="title-m" id="pur-requests-title" data-reveal>${esc('Quote and reservation requests')}</h2>
      ${list.length ? `<p class="pur-count" data-reveal>${esc(plural(list.length, 'request', 'requests'))}</p>` : ''}
    </div>
    ${body}
  </section>`;
}

function orders(ctx) {
  const placedId = ctx.params.get('placed') || '';
  const list = [...state.orders].sort(byDateDesc);
  const requests = [...state.requests].sort(byDateDesc);
  const placed = placedId ? state.orders.find((o) => o.id === placedId) : null;
  const title = docTitle('My orders and requests');
  const head = pageHead({
    title: esc('My orders and requests'),
    lead: esc('Your orders and your quote or reservation requests from this demonstration, kept on this device.'),
    meta: demoTag('Demonstration data')
  });
  const missing = placedId && !placed
    ? `<div class="pur-missing">${notice(esc('This order is not in the demonstration data of this browser. It may have been cleared.'))}</div>`
    : '';
  if (!list.length && !requests.length) {
    return {
      title,
      html: `<div class="page wrap pur-page">
        ${head}
        ${missing}
        ${emptyState({
          iconName: 'receipt',
          title: esc('No order or request yet'),
          text: esc('Orders placed from the cart and quote or reservation requests for large goods appear here, on this device only.'),
          actions: `<a class="btn btn--primary" href="#/categories">${esc('Explore the departments')}</a><a class="btn btn--secondary" href="${catalogHref({ mode: 'quote' })}">${esc('Cars and houses on quotation')}</a>`
        })}
      </div>`
    };
  }
  const sections = `${ordersSection(list, placed ? placed.id : '')}${requestsSection(requests)}`;
  if (placed) {
    return {
      title: docTitle('Example order placed'),
      html: `${placedBand(placed)}<div class="wrap pur-after">${sections}</div>`
    };
  }
  return {
    title,
    html: `<div class="page wrap pur-page">
      ${head}
      ${missing}
      ${sections}
    </div>`
  };
}

export const views = { cart, checkout, orders };
