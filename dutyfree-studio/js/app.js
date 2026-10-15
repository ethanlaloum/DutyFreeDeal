/* DutyFreeDeal Studio: router, page rendering, focus management and the actions shared by every page. */
import {
  state, save, route, go, label, plural, countryIn, shopOffers, addToCart, toggleFavorite, setCartQty, product, signOut
} from './core.js';
import { headerHtml, footerHtml, bindHeader, refreshHeaderCounts, refreshPanel, closePanel, panelOpen, markCurrentNav, setCountry } from './ui/header.js';
import { bindSearch, drafts, syncDrafts, closeAllSuggest } from './ui/search.js';
import { toast, announce, openDialog, closeDialog, dialogOpen } from './ui/feedback.js';
import { startMotion, stopMotion, bindFocusReveal, motionOK, revealNow, settleReveals } from './ui/motion.js';

/* ---------- Routes: each module exports `views`, an object of view functions ---------- */

const MODULES = {
  home: () => import('./views/home.js'),
  shop: () => import('./views/shop.js'),
  purchase: () => import('./views/purchase.js'),
  seller: () => import('./views/seller.js'),
  admin: () => import('./views/admin.js'),
  account: () => import('./views/account.js'),
  info: () => import('./views/info.js')
};

const ROUTES = [
  ['/', 'home', 'home'],
  ['/catalog', 'shop', 'catalog'],
  ['/categories', 'shop', 'categories'],
  [/^\/product\/(.+)$/, 'shop', 'product'],
  ['/wishlist', 'shop', 'wishlist'],
  ['/cart', 'purchase', 'cart'],
  ['/checkout', 'purchase', 'checkout'],
  ['/orders', 'purchase', 'orders'],
  ['/sign-in', 'account', 'signIn'],
  ['/sell', 'seller', 'sell'],
  ['/seller/onboarding', 'seller', 'sell'],
  ['/seller', 'seller', 'dashboard'],
  ['/seller/inventory', 'seller', 'inventory'],
  ['/seller/orders', 'seller', 'shipments'],
  ['/admin', 'admin', 'overview'],
  ['/admin/vendors', 'admin', 'vendors'],
  ['/admin/products', 'admin', 'products'],
  ['/admin/orders', 'admin', 'orders'],
  ['/admin/requests', 'admin', 'requests'],
  ['/admin/settings', 'admin', 'settings'],
  ['/credits', 'info', 'credits']
];

function resolve(path) {
  for (const [pattern, module, view] of ROUTES) {
    if (typeof pattern === 'string' && pattern === path) return { module, view, match: [] };
    if (pattern instanceof RegExp) {
      const m = path.match(pattern);
      if (m) return { module, view, match: m.slice(1).map((x) => { try { return decodeURIComponent(x); } catch { return x; } }) };
    }
  }
  return { module: 'info', view: 'notFound', match: [] };
}

/* ---------- Rendering ---------- */

const main = document.getElementById('main');
const header = document.querySelector('[data-header]');
const footer = document.querySelector('[data-footer]');
let cleanup = null;
let renderId = 0;

/** Values typed in the forms of the page, kept across in-place re-renders (destination change, list updates). */
function snapshotForms() {
  const out = {};
  main.querySelectorAll('form[data-form]').forEach((form) => {
    const values = {};
    for (const el of form.elements) {
      if (!el.name || el.type === 'hidden' || el.type === 'submit') continue;
      values[`${el.name}::${el.type === 'radio' ? el.value : ''}`] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
    }
    out[form.dataset.form] = values;
  });
  return out;
}

function restoreForms(saved) {
  for (const [name, values] of Object.entries(saved)) {
    const form = main.querySelector(`form[data-form="${CSS.escape(name)}"]`);
    if (!form) continue;
    for (const el of form.elements) {
      if (!el.name || el.type === 'hidden' || el.type === 'submit') continue;
      const key = `${el.name}::${el.type === 'radio' ? el.value : ''}`;
      if (!(key in values)) continue;
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = values[key];
      else el.value = values[key];
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

/** A selector that finds the same control after a re-render. */
function focusKey(el) {
  if (!el || el === document.body || !main.contains(el)) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  const attrs = ['data-action', 'data-id', 'data-step', 'data-chip', 'name', 'value'].filter((a) => el.hasAttribute(a));
  if (!attrs.length) return null;
  return `${el.tagName.toLowerCase()}${attrs.map((a) => `[${a}="${CSS.escape(el.getAttribute(a))}"]`).join('')}`;
}

export async function render({ reason = 'route' } = {}) {
  const id = ++renderId;
  const r = route();
  const target = resolve(r.path);
  if (r.path === '/catalog' && reason === 'route') drafts.q = r.params.get('q') || '';
  let mod;
  try {
    mod = await MODULES[target.module]();
  } catch (error) {
    console.error(error);
    mod = await MODULES.info();
    target.view = 'broken';
  }
  if (id !== renderId) return;
  const viewFn = mod.views?.[target.view] || (await MODULES.info()).views.notFound;
  const ctx = { params: r.params, path: r.path, match: target.match, reason, rerender, go, toast, announce, openDialog, closeDialog };
  let view;
  try {
    view = viewFn(ctx);
  } catch (error) {
    console.error(error);
    view = (await MODULES.info()).views.broken(ctx);
  }

  const keep = reason === 'route' ? {} : snapshotForms();
  const focus = reason === 'route' ? null : focusKey(document.activeElement);
  const scroll = window.scrollY;
  if (cleanup) {
    try { cleanup(); } catch (error) { console.error(error); }
    cleanup = null;
  }
  stopMotion();

  document.body.dataset.page = view.home ? 'home' : target.view;
  document.title = view.title ? `${view.title}` : 'DutyFreeDeal';
  main.className = `surface-${view.surface || 'light'}`;
  refreshHeaderCounts();
  main.innerHTML = view.html;
  restoreForms(keep);
  markCurrentNav();
  syncDrafts();
  if (typeof view.mount === 'function') {
    try { cleanup = view.mount(main, ctx) || null; } catch (error) { console.error(error); }
  }

  if (reason === 'route') {
    window.scrollTo({ top: 0, behavior: 'instant' });
    /* After a navigation (not on the first load), focus moves to the new page title for screen-reader and keyboard users. */
    const h1 = main.querySelector('h1');
    if (id > 1 && h1 && document.activeElement !== h1 && !document.activeElement?.closest('.dialog-backdrop')) h1.focus({ preventScroll: true });
  } else {
    window.scrollTo({ top: scroll, behavior: 'instant' });
    if (focus) main.querySelector(focus)?.focus({ preventScroll: true });
  }
  startMotion(main, { entrance: reason === 'route', home: Boolean(view.home) });
  observeHeroSearch();
}

function rerender() {
  return render({ reason: 'state' });
}

/* ---------- Header behaviour ---------- */

let heroObserver = null;
function observeHeroSearch() {
  heroObserver?.disconnect();
  const hero = main.querySelector('[data-search="hero"]');
  const bar = document.querySelector('.site-header');
  if (!hero) {
    bar.classList.remove('has-search');
    return;
  }
  heroObserver = new IntersectionObserver(([entry]) => bar.classList.toggle('has-search', !entry.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
  heroObserver.observe(hero);
}

function renderChrome() {
  header.innerHTML = headerHtml();
  footer.innerHTML = footerHtml();
  new IntersectionObserver(([entry]) => document.querySelector('.site-header').classList.toggle('is-compact', !entry.isIntersecting)).observe(document.querySelector('.demo'));
}

/* ---------- Shared actions ---------- */

/** First element, among selectors in order of preference, that is rendered (not inside a hidden panel). */
const firstVisible = (selectors) => {
  for (const sel of selectors) {
    const el = [...document.querySelectorAll(sel)].find((x) => x.getClientRects().length > 0);
    if (el) return el;
  }
  return null;
};

const pageShowsCart = () => ['/cart', '/checkout', '/wishlist'].includes(route().path);

function afterCartChange() {
  refreshHeaderCounts();
  refreshPanel();
  if (pageShowsCart()) rerender();
}

function setDestination(code) {
  if (code === state.country) {
    closePanel();
    return;
  }
  setCountry(code);
  refreshHeaderCounts();
  closePanel();
  const apply = () => rerender().then(() => {
    if (motionOK()) revealNow([...main.querySelectorAll('.offer, .aisle')].filter((el) => el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0));
  });
  if (motionOK()) gsap.to(main, { opacity: 0, duration: 0.2, ease: 'power1.out', onComplete: () => { apply().then(() => gsap.set(main, { opacity: 1 })); } });
  else apply();
  announce(`${plural(shopOffers(code).length, 'offer delivers', 'offers deliver')} ${countryIn(code)}.`);
}

function bindActions() {
  document.addEventListener('click', (event) => {
    const t = event.target.closest('a, button');
    if (!t) return;

    /* In-page anchors (#rayons, #main…) scroll instead of changing the route. */
    const href = t.getAttribute('href');
    if (t.tagName === 'A' && href && href.startsWith('#') && !href.startsWith('#/') && href.length > 1) {
      const el = document.getElementById(href.slice(1));
      if (el) {
        event.preventDefault();
        if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
        settleReveals(el);
        el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        el.focus({ preventScroll: true });
      }
      return;
    }

    if (t.hasAttribute('data-sign-out')) {
      signOut();
      closePanel(false);
      refreshHeaderCounts();
      toast('Signed out of the example account', 'user');
      if (route().path === '/sign-in') rerender().then(() => main.querySelector('#acc-email')?.focus({ preventScroll: true }));
      else [document.querySelector('[data-signin]'), document.querySelector('.menu-btn'), main.querySelector('h1')].find((el) => el?.getClientRects().length)?.focus({ preventScroll: true });
      return;
    }

    if (t.hasAttribute('data-home')) {
      event.preventDefault();
      closePanel(false);
      closeAllSuggest();
      if (route().path === '/') {
        window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        main.querySelector('h1')?.focus({ preventScroll: true });
      } else go('#/');
      return;
    }

    const action = t.dataset.action;
    if (t.dataset.dest) {
      setDestination(t.dataset.dest);
      return;
    }
    if (!action) return;
    const id = t.dataset.id;
    if (action === 'add') {
      const input = id ? document.querySelector(`[data-qty-for="${CSS.escape(id)}"]`) : null;
      const qty = input ? Number(input.value) : 1;
      const error = addToCart(id, qty);
      if (error) {
        toast(error, 'warning');
        return;
      }
      toast(`Added to cart: ${label(product(id).name)}`);
      if (motionOK()) gsap.fromTo('[data-bag-count]', { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
      afterCartChange();
    } else if (action === 'fav' || action === 'unfav') {
      const order = [...state.favorites];
      const on = toggleFavorite(id);
      document.querySelectorAll(`[data-action="fav"][data-id="${CSS.escape(id)}"]`).forEach((b) => b.setAttribute('aria-pressed', String(on)));
      refreshHeaderCounts();
      announce(on ? `Saved: ${label(product(id).name)}` : `Removed from saved: ${label(product(id).name)}`);
      if (action === 'unfav') {
        refreshPanel();
        const next = order[order.indexOf(id) + 1] || order[order.indexOf(id) - 1];
        (document.querySelector(`[data-action="unfav"][data-id="${CSS.escape(next || '')}"]`) || document.querySelector('[data-panel="favs"] .close-btn'))?.focus({ preventScroll: true });
      }
      if (pageShowsCart()) rerender();
    } else if (action === 'qty') {
      const line = state.cart.find((l) => l.id === id);
      if (!line) return;
      const next = line.qty + Number(t.dataset.step);
      setCartQty(id, next);
      afterCartChange();
      const scope = t.closest('[data-panel]') ? '[data-panel="bag"]:not([hidden])' : 'main';
      requestAnimationFrame(() => firstVisible([`${scope} [data-action="qty"][data-id="${CSS.escape(id)}"][data-step="${t.dataset.step}"]`,
        `${scope} [data-action="qty"][data-id="${CSS.escape(id)}"]`, `${scope} [data-action="remove"]`, '[data-panel="bag"]:not([hidden]) .close-btn', 'main h1'])?.focus({ preventScroll: true }));
      announce(next > 0 ? `Quantity: ${next}, ${label(product(id).name)}` : `Removed from cart: ${label(product(id).name)}`);
    } else if (action === 'remove') {
      setCartQty(id, 0);
      afterCartChange();
      const scope = t.closest('[data-panel]') ? '[data-panel="bag"]:not([hidden])' : 'main';
      requestAnimationFrame(() => firstVisible([`${scope} [data-action="remove"]`, '[data-panel="bag"]:not([hidden]) .close-btn', 'main h1'])?.focus({ preventScroll: true }));
      announce(`Removed from cart: ${label(product(id).name)}`);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !dialogOpen() && !panelOpen()) closeAllSuggest();
  });
}

/* ---------- Start ---------- */

renderChrome();
bindHeader();
bindSearch();
bindActions();
bindFocusReveal();
window.addEventListener('hashchange', () => {
  closePanel(false);
  closeAllSuggest();
  if (dialogOpen()) closeDialog(false);
  render({ reason: 'route' });
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    refreshHeaderCounts();
    rerender();
  }
});
render({ reason: 'route' });
save();

export { rerender };
