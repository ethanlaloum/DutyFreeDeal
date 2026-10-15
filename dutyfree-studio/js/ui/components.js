/* Shared interface components. Every function returns an HTML string; data text is escaped here. */
import {
  state, label, esc, icon, money, moneyRound, cutout, modelKey, altText, vendor, vendorName, sellerIn, countryIn,
  available, deliverable, isQuote, stock, shipping, productHref, publicOffer, plural, SHIPMENT_STEPS, shipmentLabel
} from '../core.js';
import { MAIN, EXTRAS, SIZE, BLEED, BRANDED } from '../art.js';

/* ---------- Images ---------- */

/** A studio cut-out, with its 480 px variant for small slots. `sizes` describes the rendered width. */
export function cutImg(key, { alt = '', sizes = '320px', lazy = true, small = false, priority = false } = {}) {
  const c = cutout(key);
  if (!c) return '';
  const load = lazy ? ' loading="lazy" decoding="async"' : '';
  const pr = priority ? ' fetchpriority="high"' : '';
  if (small) return `<img src="${esc(c.sm)}" alt="${esc(alt)}" width="${c.smw}" height="${c.smh}"${load}>`;
  return `<img src="${esc(c.sm)}" srcset="${esc(c.sm)} ${c.smw}w, ${esc(c.src)} ${c.w}w" sizes="${esc(sizes)}" alt="${esc(alt)}" width="${c.w}" height="${c.h}"${load}${pr}>`;
}

/** The image of an offer: its cut-out when there is one, otherwise the full photograph framed as a cover. */
export function offerImage(p, { sizes = '(max-width: 900px) 45vw, 240px', lazy = true, priority = false, alt = altText(p) } = {}) {
  const key = modelKey(p);
  if (cutout(key)) return cutImg(key, { alt, sizes, lazy, priority });
  return `<img class="cover" src="${esc(p.image)}" alt="${esc(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ''}>`;
}

/** Small square thumbnail (cart lines, menus, tables). */
export function thumb(p, cls = '') {
  const key = modelKey(p);
  const img = cutout(key) ? cutImg(key, { small: true }) : `<img class="cover" src="${esc(p.image)}" alt="" loading="lazy">`;
  return `<span class="thumb${cls ? ` ${cls}` : ''}" aria-hidden="true">${img}</span>`;
}

/* ---------- Offer pieces ---------- */

export function favButton(p) {
  const on = state.favorites.includes(p.id);
  return `<button class="fav" type="button" aria-pressed="${on}" data-action="fav" data-id="${esc(p.id)}">`
    + `<span class="sr-only">${esc(`Saved: ${label(p.name)}`)}</span>${icon('heart', 'off')}${icon('heartFill', 'on')}</button>`;
}

/** Product price, then the delivery on its own line (never merged into the price). */
export function amounts(p) {
  if (isQuote(p)) {
    const note = deliverable(p) ? 'Indicative price · on quotation' : `Does not deliver ${countryIn(state.country)}`;
    return `<div class="amounts"><p class="price">${moneyRound(p.price)}</p><p class="ship">${esc(note)}</p></div>`;
  }
  const ship = !deliverable(p)
    ? `Does not deliver ${countryIn(state.country)}`
    : `+ ${money(shipping(p.vendorId))} delivery`;
  return `<div class="amounts"><p class="price">${money(p.price)}</p><p class="ship">${esc(ship)}</p></div>`;
}

/** The action that follows price and delivery: add, ask for a quote, or the reason why not. */
export function offerAction(p, { size = '' } = {}) {
  const name = esc(label(p.name));
  if (isQuote(p) && publicOffer(p) && deliverable(p)) return `<a class="pill${size}" href="${productHref(p)}">${esc('Request a quote')}<span class="sr-only">: ${name}</span></a>`;
  if (available(p)) return `<button class="pill${size}" type="button" data-action="add" data-id="${esc(p.id)}">${icon('bag')}${esc('Add')}<span class="sr-only"> ${name} ${esc('to the cart')}</span></button>`;
  const why = !publicOffer(p) ? 'Unavailable' : !deliverable(p) ? 'Not deliverable' : isQuote(p) || stock(p) ? 'Unavailable' : 'Out of stock';
  return `<span class="pill pill--off${size}" aria-disabled="true">${esc(why)}</span>`;
}

export const sellerLine = (p) => {
  const v = vendor(p.vendorId);
  return `${esc(sellerIn(v.country))} · ${esc(vendorName(v))}`;
};

/**
 * The offer card used by every list of offers. Photo and name open the offer; the heart saves it;
 * the action follows the price and the delivery. `level` is the heading level of the name.
 */
export function offerCard(p, { large = false, level = 3, reveal = true, sizes } = {}) {
  const key = modelKey(p);
  const s = sizes || (large ? '(max-width: 900px) 70vw, 320px' : '(max-width: 640px) 80vw, (max-width: 900px) 45vw, 240px');
  return `<li class="offer${large ? ' offer--lg' : ''}"${reveal ? ' data-reveal' : ''}>
    <a class="offer-media" href="${productHref(p)}" tabindex="-1" aria-hidden="true"${cutout(key) ? ' data-cut' : ''}>${offerImage(p, { sizes: s })}</a>
    ${favButton(p)}
    <div class="offer-body">
      <h${level} class="offer-name"><a href="${productHref(p)}">${esc(label(p.name))}</a></h${level}>
      <p class="offer-seller">${sellerLine(p)}</p>
      <div class="buy">${amounts(p)}${offerAction(p)}</div>
    </div>
  </li>`;
}

export const offerGrid = (list, opts = {}) => `<ul class="offers offers--grid" role="list">${list.map((p) => offerCard(p, opts)).join('')}</ul>`;

/* ---------- Department art: compositions of real cut-outs ---------- */

/**
 * Objects for a department card: its main object, plus extras for large cards when they fit.
 * `avoid` holds objects already shown on the page; branded photographs never illustrate a department.
 */
export function departmentArt(dept, { large = false, avoid = new Set(), sizes } = {}) {
  const ratio = large ? 5 / 4 : 4 / 3;
  const main = MAIN[dept];
  const extras = large ? (EXTRAS[dept] || []).filter((k) => cutout(k) && !avoid.has(k) && !BRANDED.has(k)) : [];
  let items = [main, ...extras].filter((k) => cutout(k)).slice(0, 3).map((k, i) => {
    const c = cutout(k);
    const h = Math.min((SIZE[k] || 40) * (large && i === 0 ? 1.1 : 1), 74);
    return { k, h, w: (h * (c.w / c.h)) / ratio };
  });
  const free = () => items.filter((it) => !BLEED.has(it.k));
  while (free().length > 1 && free().reduce((s, it) => s + it.w, 0) > 88) {
    const smallest = free().reduce((a, b) => (a.h <= b.h ? a : b));
    items = items.filter((it) => it !== smallest);
  }
  const bleed = items.find((it) => BLEED.has(it.k));
  if (items.length === 1 && !bleed) {
    const it = items[0];
    const c = cutout(it.k);
    const target = Math.min(large ? 66 : 58, (64 * ratio * c.h) / c.w);
    if (target > it.h) {
      it.w *= target / it.h;
      it.h = target;
    }
  }
  const row = free().sort((a, b) => b.h - a.h);
  const ordered = row.length === 3 ? [row[1], row[0], row[2]] : row;
  const gap = ordered.length > 1 ? -Math.min(...ordered.map((it) => it.w)) * 0.12 : 0;
  const total = ordered.reduce((s, it) => s + it.w, 0) + gap * (ordered.length - 1);
  const centre = bleed ? Math.max(30, (100 - bleed.w * 0.6) / 2) : 50;
  let left = centre - total / 2;
  const sz = sizes || (large ? '(max-width: 900px) 45vw, 260px' : '(max-width: 900px) 40vw, 200px');
  const parts = ordered.map((it) => {
    const x = Math.min(Math.max(left + it.w / 2, it.w / 2 + 3), 97 - it.w / 2);
    left += it.w + gap;
    return `<span class="obj" style="--h:${it.h.toFixed(1)}%;--x:${x.toFixed(1)}%;--z:${it === row[0] ? 2 : 3}">${cutImg(it.k, { sizes: sz })}</span>`;
  });
  if (bleed) parts.unshift(`<span class="obj obj--bleed" style="--h:${bleed.h}%;--z:1">${cutImg(bleed.k, { sizes: sz })}</span>`);
  return { html: parts.join(''), keys: items.map((it) => it.k) };
}

/* ---------- Page structure ---------- */

/** Breadcrumb from [label, href] pairs; the last one is the current page. */
export function breadcrumb(items) {
  return `<nav class="crumbs" aria-label="${esc('Breadcrumb')}"><ol>${items.map(([text, href], i) => (i === items.length - 1
    ? `<li><span aria-current="page">${esc(text)}</span></li>`
    : `<li><a href="${href}">${esc(text)}</a>${icon('caretRight')}</li>`)).join('')}</ol></nav>`;
}

/** Page heading: optional breadcrumb, h1 (focusable target after navigation), lead, meta line and actions. */
export function pageHead({ crumbs, title, lead = '', meta = '', actions = '', eyebrow = '' } = {}) {
  return `<header class="page-head">
    ${crumbs ? breadcrumb(crumbs) : ''}
    <div class="page-head-row">
      <div>
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        <h1 class="title-l" tabindex="-1">${title}</h1>
        ${lead ? `<p class="lead">${lead}</p>` : ''}
        ${meta ? `<p class="page-meta">${meta}</p>` : ''}
      </div>
      ${actions ? `<div class="page-actions">${actions}</div>` : ''}
    </div>
  </header>`;
}

/** Honest empty state: what is missing, why, and where to go. */
export function emptyState({ iconName = 'package', title, text = '', actions = '' }) {
  return `<div class="empty">${icon(iconName, 'empty-icon')}<h2 class="title-s">${title}</h2>${text ? `<p>${text}</p>` : ''}${actions ? `<div class="empty-actions">${actions}</div>` : ''}</div>`;
}

/** Status chip; tone is neutral, success, warning, danger or info. */
export const chip = (text, tone = 'neutral') => `<span class="chip chip--${tone}">${esc(text)}</span>`;

/** Marks simulated data or actions. */
export const demoTag = (text = 'Demonstration') => `<span class="demo-tag">${esc(text)}</span>`;

export const notice = (html, iconName = 'info') => `<p class="notice">${icon(iconName)}<span>${html}</span></p>`;

export const statCard = (value, text, hint = '') => `<div class="stat"><p class="stat-value">${esc(value)}</p><p class="stat-label">${esc(text)}</p>${hint ? `<p class="stat-hint">${esc(hint)}</p>` : ''}</div>`;

/** Accessible data table. `head` is a list of column titles; `rows` a list of lists of HTML cells. */
export function table(head, rows, { caption = '', cls = '' } = {}) {
  return `<div class="table-wrap"><table class="table${cls ? ` ${cls}` : ''}">${caption ? `<caption class="sr-only">${esc(caption)}</caption>` : ''}
    <thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

/* ---------- Forms ---------- */

const attrs = (o) => Object.entries(o).filter(([, v]) => v !== false && v != null && v !== '').map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`)).join('');

/** Labelled input. Extra attributes (min, max, step, pattern, autocomplete…) go in `extra`. */
export function field({ name, text, type = 'text', value = '', required = false, help = '', full = false, extra = {} }) {
  const id = `f-${name}`;
  return `<div class="field${full ? ' field--full' : ''}"><label for="${id}">${text}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <input class="input" id="${id}" name="${esc(name)}" type="${type}"${attrs({ value, required, 'aria-describedby': help ? `${id}-help` : '', ...extra })}>
    ${help ? `<p class="help" id="${id}-help">${help}</p>` : ''}</div>`;
}

export function selectField({ name, text, options, value = '', required = false, help = '', full = false, extra = {} }) {
  const id = `f-${name}`;
  return `<div class="field${full ? ' field--full' : ''}"><label for="${id}">${text}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <select class="select" id="${id}" name="${esc(name)}"${attrs({ required, 'aria-describedby': help ? `${id}-help` : '', ...extra })}>
      ${options.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(t)}</option>`).join('')}
    </select>${help ? `<p class="help" id="${id}-help">${help}</p>` : ''}</div>`;
}

export function textareaField({ name, text, value = '', required = false, help = '', rows = 4, extra = {} }) {
  const id = `f-${name}`;
  return `<div class="field field--full"><label for="${id}">${text}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <textarea class="input textarea" id="${id}" name="${esc(name)}" rows="${rows}"${attrs({ required, 'aria-describedby': help ? `${id}-help` : '', ...extra })}>${esc(value)}</textarea>
    ${help ? `<p class="help" id="${id}-help">${help}</p>` : ''}</div>`;
}

/** Checkbox or radio with its label on the right. */
export function check({ name, text, type = 'checkbox', value = 'on', checked = false, required = false }) {
  return `<label class="check"><input type="${type}" name="${esc(name)}" value="${esc(value)}"${checked ? ' checked' : ''}${required ? ' required' : ''}><span>${text}</span></label>`;
}

/* ---------- Shipment progress (one tracker for the buyer, the seller and the back office) ---------- */

/** Four steps (awaiting preparation, preparing, shipped, delivered); the current step carries aria-current="step". */
export function shipmentSteps(status, { name = 'Shipment progress' } = {}) {
  const current = Math.max(0, SHIPMENT_STEPS.indexOf(status));
  return `<ol class="steps" aria-label="${esc(name)}">${SHIPMENT_STEPS.map((s, i) => `<li class="step${i < current ? ' is-done' : ''}${i === current ? ' is-current' : ''}"${i === current ? ' aria-current="step"' : ''}>`
    + `<span class="step-dot" aria-hidden="true"></span><span class="step-label">${esc(shipmentLabel(s))}${i < current ? '<span class="sr-only"> (completed)</span>' : ''}</span></li>`).join('')}</ol>`;
}

/* ---------- Small helpers ---------- */

export const countLabel = (n, one, many) => esc(plural(n, one, many));
