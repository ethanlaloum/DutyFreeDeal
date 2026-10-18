/* Site header, its panels (departments menu, destination, account, saved offers, bag, narrow-screen menu) and the footer. */
import {
  state, save, label, esc, icon, normalize, plural, money, countries, countryName, countryIn, categories, department,
  shopOffers, vendor, vendorName, sellerIn, cartCount, cartGroups, cartTotals, lineIssue, shipping, product, productHref,
  catalogHref, route, deliverable, publicOffer, firstName
} from '../core.js';
import { MAIN } from '../art.js';
import { cutImg, thumb } from './components.js';
import { searchForm } from './search.js';
import { announce } from './feedback.js';

/* ---------- Header ---------- */

/* The complete logo of the brand board, in its version for midnight grounds (header and footer are midnight). */
const LOGO = '<img class="logo" src="./assets/brand/logo-on-dark.svg" alt="" width="166" height="30">';

/** Sign-in address that brings the visitor back to the page they were on. */
function signInHref() {
  const r = route();
  const next = r.path === '/sign-in' ? r.params.get('next') : location.hash;
  return next && next.startsWith('#/') ? `#/sign-in?next=${encodeURIComponent(next)}` : '#/sign-in';
}

const accountKey = () => (state.account ? `in:${state.account.name}|${state.account.email}` : 'out');

/** Signed out: "Sign in", a link to the sign-in page. Signed in: the first name, which opens the account panel. */
function accountControl() {
  const a = state.account;
  if (!a) return `<a class="account-btn" href="${signInHref()}" data-nav="sign-in" data-signin>${icon('user')}<span class="account-text">${esc('Sign in')}</span></a>`;
  return `<button class="account-btn" type="button" aria-expanded="false" aria-controls="panel-account" data-toggle="account" aria-label="${esc(`Account, ${a.name || a.email}`)}">
    ${icon('user')}<span class="account-text">${esc(firstName(a))}</span>${icon('caretDown')}</button>`;
}

export function headerHtml() {
  const count = cartCount();
  const favs = state.favorites.length;
  return `<div class="wrap bar">
    <a class="wordmark" href="#/" data-home aria-label="${esc('DutyFreeDeal, home')}">${LOGO}</a>
    <nav class="primary" aria-label="${esc('Main navigation')}">
      <button class="nav-link" type="button" aria-expanded="false" aria-controls="panel-rayons" data-toggle="rayons">${esc('All departments')}${icon('caretDown')}</button>
      <a class="nav-link" href="${catalogHref({ collection: 'deals' })}" data-nav="deals">${esc('Deals')}</a>
      <a class="nav-link" href="${catalogHref({ collection: 'rare' })}" data-nav="rare">${esc('Hard to find')}</a>
      <a class="nav-link" href="#/orders" data-nav="orders" data-optional>${esc('My orders')}</a>
      <a class="nav-link" href="#/sell" data-nav="sell" data-optional data-sell>${esc('Sell')}</a>
    </nav>
    <div class="tools">
      <div class="header-search" data-header-search>${searchForm('header', { placeholder: 'Search' })}</div>
      <button class="dest-btn" type="button" aria-expanded="false" aria-controls="panel-dest" data-toggle="dest">
        <small>${esc('Delivery')}</small><span><b data-dest-name>${esc(countryName(state.country))}</b>${icon('caretDown')}</span>
      </button>
      <div class="account-slot" data-account-slot data-key="${esc(accountKey())}">${accountControl()}</div>
      <button class="icon-btn" type="button" aria-expanded="false" aria-controls="panel-favs" data-toggle="favs" aria-label="${esc(`Saved, ${plural(favs, 'offer', 'offers')}`)}" data-fav-label>
        ${icon('heart')}<span class="count" data-fav-count${favs ? '' : ' data-empty'} aria-hidden="true">${favs}</span>
      </button>
      <button class="icon-btn" type="button" aria-expanded="false" aria-controls="panel-bag" data-toggle="bag" aria-label="${esc(`Cart, ${plural(count, 'item', 'items')}`)}" data-bag-label>
        ${icon('bag')}<span class="count" data-bag-count${count ? '' : ' data-empty'} aria-hidden="true">${count}</span>
      </button>
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="panel-menu" data-toggle="menu" aria-label="${esc('Menu')}">${icon('list')}</button>
    </div>
    <div class="panel panel--rayons surface-dark" id="panel-rayons" role="region" aria-label="${esc('All departments')}" hidden data-panel="rayons"></div>
    <div class="panel panel--dest surface-dark" id="panel-dest" role="region" aria-label="${esc('Delivery country')}" hidden data-panel="dest"></div>
    <div class="panel panel--account surface-dark" id="panel-account" role="region" aria-label="${esc('Account')}" hidden data-panel="account"></div>
    <div class="panel panel--side surface-dark" id="panel-favs" role="dialog" aria-modal="false" aria-labelledby="favs-title" hidden data-panel="favs"></div>
    <div class="panel panel--side surface-dark" id="panel-bag" role="dialog" aria-modal="false" aria-labelledby="bag-title" hidden data-panel="bag"></div>
    <div class="panel panel--menu surface-dark" id="panel-menu" role="dialog" aria-modal="false" aria-labelledby="menu-title" hidden data-panel="menu"></div>
  </div>`;
}

/** Updates counters and labels without rebuilding the header (keeps focus and open panels). */
export function refreshHeaderCounts() {
  const count = cartCount();
  const favs = state.favorites.length;
  const bag = document.querySelector('[data-bag-count]');
  if (bag) {
    bag.textContent = count;
    bag.toggleAttribute('data-empty', !count);
    document.querySelector('[data-bag-label]').setAttribute('aria-label', `Cart, ${plural(count, 'item', 'items')}`);
  }
  const fav = document.querySelector('[data-fav-count]');
  if (fav) {
    fav.textContent = favs;
    fav.toggleAttribute('data-empty', !favs);
    document.querySelector('[data-fav-label]').setAttribute('aria-label', `Saved, ${plural(favs, 'offer', 'offers')}`);
  }
  const dest = document.querySelector('[data-dest-name]');
  if (dest) dest.textContent = countryName(state.country);
  const slot = document.querySelector('[data-account-slot]');
  if (slot && slot.dataset.key !== accountKey()) {
    if (openName === 'account') closePanel(false);
    slot.dataset.key = accountKey();
    slot.innerHTML = accountControl();
    markCurrentNav();
  }
}

/** Marks the navigation link of the current page. */
export function markCurrentNav() {
  const r = route();
  const current = r.path === '/catalog' ? r.params.get('collection') : r.path === '/orders' ? 'orders' : (r.path === '/sell' || r.path.startsWith('/seller')) ? 'sell'
    : r.path === '/sign-in' ? 'sign-in' : '';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.dataset.nav === current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.querySelector('[data-signin]')?.setAttribute('href', signInHref());
}

/* ---------- Footer ---------- */

export function footerHtml() {
  return `<div class="wrap">
    <div class="footer-top">
      <a class="wordmark" href="#/" data-home aria-label="${esc('DutyFreeDeal, home')}">${LOGO}</a>
      <p>${esc('Duty free, without going through the airport')}</p>
    </div>
    <div class="footer-cols">
      <div><h2>${esc('Shop')}</h2><ul role="list">
        <li><a href="#/categories">${esc('All departments')}</a></li>
        <li><a href="${catalogHref({ collection: 'deals' })}">${esc('Deals')}</a></li>
        <li><a href="${catalogHref({ collection: 'rare' })}">${esc('Hard to find')}</a></li>
        <li><a href="#/wishlist">${esc('My saved offers')}</a></li>
        <li><a href="#/cart">${esc('My cart')}</a></li>
        <li><a href="#/orders">${esc('My orders')}</a></li>
      </ul></div>
      <div><h2>${esc('Sell')}</h2><ul role="list">
        <li><a href="#/sell">${esc('Become a vendor')}</a></li>
        <li><a href="#/seller">${esc('Seller workspace (demo)')}</a></li>
      </ul></div>
      <div><h2>${esc('Prototype')}</h2><ul role="list">
        <li><a href="#/admin">${esc('Back office (demo)')}</a></li>
        <li><a href="#/credits">${esc('About, sources and licenses')}</a></li>
      </ul></div>
      <p class="footer-demo">${esc('Demonstration prototype: fictional products, sellers and prices, no real transactions. Example prices in euros; four example countries, while the platform opens to every country.')}</p>
    </div>
  </div>`;
}

/* ---------- Departments menu: departments on the left, categories on the right, filter ---------- */

let menuDept = categories[0].id;
let menuQuery = '';

const deptMatches = (d, q) => !q || normalize(label(d.name)).includes(q)
  || (d.children || []).some((s) => normalize(label(s.name)).includes(q) || (s.children || []).some((l) => normalize(label(l.name)).includes(q)));

function renderRayons() {
  const panel = document.querySelector('[data-panel="rayons"]');
  panel.innerHTML = `<div class="rm-head">
      <label class="rm-filter">${icon('search')}<span class="sr-only">${esc('Filter departments and categories')}</span>
        <input type="search" placeholder="${esc('Filter departments and categories')}" autocomplete="off" data-rm-filter value="${esc(menuQuery)}"></label>
      <a class="more" href="#/categories">${esc('Full category tree')}</a>
      <button class="close-btn" type="button" data-close aria-label="${esc('Close the departments menu')}">${icon('close')}</button>
    </div>
    <div class="rm-body">
      <ul class="rm-list" role="list" aria-label="${esc('Departments')}" data-rm-list></ul>
      <div class="rm-detail" data-rm-detail></div>
    </div>`;
  renderRmList();
  renderRmDetail();
}

function renderRmList() {
  const q = normalize(menuQuery);
  const list = categories.filter((d) => deptMatches(d, q));
  if (list.length && !list.some((d) => d.id === menuDept)) menuDept = list[0].id;
  document.querySelector('[data-rm-list]').innerHTML = list.length
    ? list.map((d) => `<li><button class="rm-item" type="button" data-rm="${d.id}" aria-current="${d.id === menuDept}"><span class="thumb" aria-hidden="true">${cutImg(MAIN[d.id], { small: true })}</span><span>${esc(label(d.name))}</span></button></li>`).join('')
    : `<li class="rm-empty">${esc(`No department matches “${menuQuery}”.`)}</li>`;
}

function renderRmDetail() {
  const d = department(menuDept);
  const q = normalize(menuQuery);
  const target = document.querySelector('[data-rm-detail]');
  if (!target) return;
  if (!d || !deptMatches(d, q)) {
    target.innerHTML = '';
    return;
  }
  const deptHit = normalize(label(d.name)).includes(q);
  const groups = (d.children || []).map((s) => {
    const subHit = normalize(label(s.name)).includes(q);
    const leaves = q && !deptHit && !subHit ? (s.children || []).filter((l) => normalize(label(l.name)).includes(q)) : (s.children || []);
    if (q && !deptHit && !subHit && !leaves.length) return '';
    return `<div class="rm-group"><h4><a href="${catalogHref({ category: s.id })}">${esc(label(s.name))}</a></h4>
      <ul role="list">${leaves.map((l) => `<li><a href="${catalogHref({ category: l.id })}">${esc(label(l.name))}</a></li>`).join('')}</ul></div>`;
  }).join('');
  target.innerHTML = `<div class="rm-detail-head"><h3>${esc(label(d.name))}</h3><a class="more" href="${catalogHref({ category: d.id })}">${esc('See the whole department')}${icon('arrow')}</a></div>
    <div class="rm-groups">${groups}</div>`;
}

function selectRm(id, focus = false) {
  menuDept = id;
  document.querySelectorAll('[data-rm]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.rm === id)));
  renderRmDetail();
  if (focus) document.querySelector(`[data-rm="${id}"]`)?.focus();
}

/* ---------- Destination ---------- */

function renderDest() {
  document.querySelector('[data-panel="dest"]').innerHTML = `<p class="dest-intro">${esc('The catalog shows the offers that their sellers deliver to this country.')}</p>
    ${countries.map((c) => `<button class="dest-option" type="button" data-dest="${c.code}" aria-current="${c.code === state.country}">${esc(label(c.name))}<small>${esc(plural(shopOffers(c.code).length, 'offer', 'offers'))}</small></button>`).join('')}`;
}

/* ---------- Account (example account of this browser) ---------- */

function renderAccount() {
  const a = state.account;
  const panel = document.querySelector('[data-panel="account"]');
  if (!a) {
    panel.innerHTML = '';
    return;
  }
  panel.innerHTML = `<div class="acct-head">
      <p class="acct-name">${esc(a.name || firstName(a))}</p>
      <p class="acct-mail">${esc(a.email)}</p>
      <span class="demo-tag">${esc('Example account')}</span>
    </div>
    <ul class="acct-links" role="list">
      <li><a href="#/orders">${icon('receipt')}${esc('My orders')}</a></li>
      <li><a href="#/wishlist">${icon('heart')}${esc('My saved offers')}</a></li>
      <li><a href="#/cart">${icon('bag')}${esc('My cart')}</a></li>
    </ul>
    <div class="acct-foot"><button class="btn btn--secondary btn--small btn--block" type="button" data-sign-out>${esc('Sign out')}</button></div>`;
}

/* ---------- Saved offers and bag ---------- */

function renderFavs() {
  const list = state.favorites.map(product).filter(Boolean);
  document.querySelector('[data-panel="favs"]').innerHTML = `<div class="side-top"><div class="side-head"><h2 id="favs-title">${esc('Saved')}</h2>
      <button class="close-btn" type="button" data-close aria-label="${esc('Close saved offers')}">${icon('close')}</button></div>
      <p class="side-note">${esc('Saved in this prototype, on this device.')}</p></div>
    <div class="side-scroll">${list.length ? list.map((p) => {
      const v = vendor(p.vendorId);
      const ok = publicOffer(p) && deliverable(p);
      return `<div class="side-line">${thumb(p, 'thumb--l')}
        <div><strong><a href="${productHref(p)}">${esc(label(p.name))}</a></strong>
          <p class="side-sub">${esc(ok ? `+ ${money(shipping(v.id))} delivery` : `Not deliverable ${countryIn(state.country)}`)}</p>
          <button class="link-btn" type="button" data-action="unfav" data-id="${esc(p.id)}">${esc('Remove from saved')}<span class="sr-only">: ${esc(label(p.name))}</span></button>
        </div><span class="side-price">${esc(money(p.price))}</span></div>`;
    }).join('') : `<p class="side-empty">${esc('No saved offer yet. The heart on an offer saves it here.')}</p>`}</div>
    ${list.length ? `<div class="side-foot"><a class="btn btn--primary btn--block" href="#/wishlist">${esc('See all my saved offers')}</a></div>` : ''}`;
}

function renderBag() {
  const groups = cartGroups();
  const sum = cartTotals();
  const blocks = groups.map(({ v, lines }) => {
    const ok = deliverable(lines[0].p);
    return `<div class="side-group" role="group" aria-labelledby="bag-${esc(v.id)}">
      <h3 id="bag-${esc(v.id)}">${esc(vendorName(v))}</h3><p class="side-sub">${esc(sellerIn(v.country))}</p>
      ${lines.map(({ p, qty }) => {
        const issue = lineIssue({ p, qty });
        return `<div class="side-line">${thumb(p, 'thumb--l')}
          <div><strong><a href="${productHref(p)}">${esc(label(p.name))}</a></strong>
            <div class="qty" role="group" aria-label="${esc(`Quantity: ${label(p.name)}`)}">
              <button type="button" data-action="qty" data-id="${esc(p.id)}" data-step="-1" aria-label="${esc(`Remove one ${label(p.name)}`)}">−</button>
              <output>${qty}</output>
              <button type="button" data-action="qty" data-id="${esc(p.id)}" data-step="1" aria-label="${esc(`Add one ${label(p.name)}`)}">+</button>
              <button class="link-btn" type="button" data-action="remove" data-id="${esc(p.id)}">${esc('Remove')}<span class="sr-only"> ${esc(label(p.name))}</span></button>
            </div>
            ${issue ? `<p class="side-issue">${esc(issue)}</p>` : ''}
          </div><span class="side-price">${esc(money(p.price * qty))}</span></div>`;
      }).join('')}
      ${ok ? `<div class="side-ship"><span>${esc(`Delivery ${countryIn(state.country)}, shipped by this seller`)}</span><span>+ ${esc(money(shipping(v.id)))}</span></div>` : ''}
    </div>`;
  }).join('');
  document.querySelector('[data-panel="bag"]').innerHTML = `<div class="side-top"><div class="side-head"><h2 id="bag-title">${esc('Cart')}</h2>
      <button class="close-btn" type="button" data-close aria-label="${esc('Close the cart')}">${icon('close')}</button></div>
      <p class="side-note">${esc('One cart, shipments organized by seller.')}</p></div>
    ${groups.length ? `<div class="side-scroll">${blocks}</div>
      <div class="side-foot">
        <div class="totals">
          <div><span>${esc('Products')}</span><span>${esc(money(sum.subtotal))}</span></div>
          <div><span>${esc(`Delivery (${plural(sum.shipments, 'shipment', 'shipments')})`)}</span><span>${esc(money(sum.delivery))}</span></div>
          <div class="totals-grand"><span>${esc('Total')}</span><span>${esc(money(sum.total))}</span></div>
        </div>
        <p class="side-note">${esc('One payment for the whole order. Simulated payment: no real transaction.')}</p>
        <div class="side-actions"><a class="btn btn--secondary" href="#/cart">${esc('View cart')}</a>
          ${sum.blocked ? `<a class="btn btn--primary" href="#/cart">${esc('Check the cart')}</a>` : `<a class="btn btn--primary" href="#/checkout">${esc('Checkout')}</a>`}</div>
      </div>` : `<div class="side-scroll"><p class="side-empty">${esc('Your cart is empty.')}</p></div>`}`;
}

function renderMenu() {
  document.querySelector('[data-panel="menu"]').innerHTML = `<div class="side-top"><div class="side-head"><h2 id="menu-title">${esc('Menu')}</h2>
      <button class="close-btn" type="button" data-close aria-label="${esc('Close the menu')}">${icon('close')}</button></div></div>
    <ul class="menu-links" role="list">
      ${state.account ? '' : `<li><a href="${signInHref()}">${esc('Sign in')}</a></li>`}
      <li><a href="#/categories">${esc('All departments')}</a></li>
      <li><a href="${catalogHref({ collection: 'deals' })}">${esc('Deals')}</a></li>
      <li><a href="${catalogHref({ collection: 'rare' })}">${esc('Hard to find')}</a></li>
      <li><a href="#/orders">${esc('My orders')}</a></li>
      <li><a href="#/sell">${esc('Sell on DutyFreeDeal')}</a></li>
      ${state.account ? `<li><button type="button" data-sign-out>${esc(`Sign out (${firstName()})`)}</button></li>` : ''}
    </ul>`;
}

/* ---------- Opening and closing ---------- */

let openName = null;
let opener = null;
const renderers = { rayons: renderRayons, dest: renderDest, account: renderAccount, favs: renderFavs, bag: renderBag, menu: renderMenu };

export const panelOpen = () => openName;

export function openPanel(name, trigger) {
  if (openName === name && trigger === opener) {
    closePanel();
    return;
  }
  /* Opened again from another control (a "Change" button in a page): keep it open and follow the new trigger. */
  if (openName === name) {
    const panel = document.querySelector(`[data-panel="${name}"]`);
    opener?.setAttribute('aria-expanded', 'false');
    opener = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    if (name === 'dest' || name === 'account') anchorPanel(panel, trigger);
    (panel.querySelector('[aria-current="true"]') || panel.querySelector('a[href], button'))?.focus({ preventScroll: true });
    return;
  }
  closePanel(false);
  const panel = document.querySelector(`[data-panel="${name}"]`);
  if (!panel) return;
  if (name === 'rayons') {
    menuQuery = '';
    const cat = route().params.get('category');
    menuDept = categories.find((c) => cat && (c.id === cat || JSON.stringify(c).includes(`"${cat}"`)))?.id || menuDept;
  }
  renderers[name]();
  panel.hidden = false;
  if (name === 'dest' || name === 'account') anchorPanel(panel, trigger);
  trigger.setAttribute('aria-expanded', 'true');
  openName = name;
  opener = trigger;
  if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(panel, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' });
  const first = {
    rayons: () => panel.querySelector('[data-rm][aria-current="true"]'),
    dest: () => panel.querySelector('[aria-current="true"]'),
    account: () => panel.querySelector('.acct-links a'),
    menu: () => panel.querySelector('.menu-links a')
  }[name];
  ((first && first()) || panel.querySelector('a[href], button') || panel).focus({ preventScroll: true });
}

/** Lines a small panel up with the right edge of its header button, without leaving the header bar. */
function anchorPanel(panel, trigger) {
  const bar = trigger.closest('.bar');
  if (!bar) {
    panel.style.removeProperty('right');
    return;
  }
  const b = bar.getBoundingClientRect();
  const right = Math.max(0, Math.min(b.right - trigger.getBoundingClientRect().right, b.width - panel.offsetWidth));
  panel.style.right = `${right}px`;
}

export function closePanel(restoreFocus = true) {
  if (!openName) return;
  const panel = document.querySelector(`[data-panel="${openName}"]`);
  if (panel) panel.hidden = true;
  opener?.setAttribute('aria-expanded', 'false');
  if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
  openName = null;
  opener = null;
}

/** Re-renders the open panel after a change (quantity, removal, saved offers). */
export function refreshPanel() {
  if (openName && renderers[openName] && openName !== 'rayons') renderers[openName]();
}

/** Header-level events: panels, departments menu keyboard, filter, focus leaving a panel. */
export function bindHeader() {
  document.addEventListener('click', (event) => {
    const t = event.target.closest('button, a');
    const inPanel = event.target.closest('[data-panel]');
    if (openName && !inPanel && t !== opener && !(t && t.dataset.toggle)) closePanel(false);
    if (!t) return;
    if (t.dataset.toggle) {
      event.preventDefault();
      openPanel(t.dataset.toggle, t);
      return;
    }
    if (t.dataset.rm) {
      selectRm(t.dataset.rm);
      return;
    }
    if (t.hasAttribute('data-close') && t.closest('[data-panel]')) {
      closePanel();
      return;
    }
    if (inPanel && t.matches('a[href]')) closePanel(false);
  });

  document.addEventListener('focusout', (event) => {
    if (!openName) return;
    const panel = document.querySelector(`[data-panel="${openName}"]`);
    const to = event.relatedTarget;
    if (to && panel && !panel.contains(to) && to !== opener && !to.closest('.dialog-backdrop')) closePanel(false);
  });

  document.addEventListener('mouseover', (event) => {
    const rm = event.target.closest('[data-rm]');
    if (rm && rm.getAttribute('aria-current') !== 'true') selectRm(rm.dataset.rm);
  });
  document.addEventListener('focusin', (event) => {
    const rm = event.target.closest('[data-rm]');
    if (rm && rm.getAttribute('aria-current') !== 'true') selectRm(rm.dataset.rm);
  });

  document.addEventListener('input', (event) => {
    if (!event.target.matches('[data-rm-filter]')) return;
    menuQuery = event.target.value;
    renderRmList();
    renderRmDetail();
    const n = document.querySelectorAll('[data-rm]').length;
    announce(`${plural(n, 'department matches', 'departments match')}`);
  });

  document.addEventListener('keydown', (event) => {
    if (!openName) return;
    const panel = document.querySelector(`[data-panel="${openName}"]`);
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      return;
    }
    if (openName === 'rayons') {
      const items = [...panel.querySelectorAll('[data-rm]')];
      const onItem = event.target.closest('[data-rm]');
      if (event.target.matches('[data-rm-filter]') && event.key === 'ArrowDown' && items.length) {
        event.preventDefault();
        selectRm(items[0].dataset.rm, true);
        return;
      }
      if (onItem && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const i = items.indexOf(onItem);
        const j = { ArrowDown: Math.min(i + 1, items.length - 1), ArrowUp: Math.max(i - 1, 0), Home: 0, End: items.length - 1 }[event.key];
        selectRm(items[j].dataset.rm, true);
        return;
      }
      if (onItem && event.key === 'ArrowRight') {
        event.preventDefault();
        panel.querySelector('[data-rm-detail] a')?.focus();
        return;
      }
      const inDetail = event.target.closest('[data-rm-detail]');
      if (inDetail && event.key === 'ArrowLeft') {
        event.preventDefault();
        panel.querySelector(`[data-rm="${menuDept}"]`)?.focus();
        return;
      }
      if (inDetail && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        const links = [...panel.querySelectorAll('[data-rm-detail] a')];
        const i = links.indexOf(event.target);
        links[Math.max(0, Math.min(links.length - 1, i + (event.key === 'ArrowDown' ? 1 : -1)))]?.focus();
      }
      return;
    }
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && panel.contains(document.activeElement) && !event.target.matches('input')) {
      const items = [...panel.querySelectorAll('a[href], button:not([disabled])')];
      const i = items.indexOf(document.activeElement);
      if (i === -1) return;
      event.preventDefault();
      items[(i + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    }
  });
}

/** Saves the delivery destination. */
export function setCountry(code) {
  state.country = code;
  save();
}

export const destinationPhrase = () => countryIn(state.country);
export const sellerCountry = (p) => sellerIn(vendor(p.vendorId).country);
