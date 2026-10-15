import { state, save, t, esc, icon, go, visibleProducts, countryTo, product, label } from './core.js';
import {
  stripHTML, headerHTML, openDestination, closeDestination, isDestinationOpen, onDestinationKeydown,
  menu, openRayons, closeRayons, refreshMenu, setActiveRayon, hoverRayon, cancelHoverRayon, onRayonsKeydown, updateBadges
} from './header.js';
import { drafts, syncDrafts, openSuggest, closeSuggest, closeAllSuggest, onSearchKeydown, submitSearch } from './search.js';
import { notify, announce, clearToast } from './toast.js';
import { openCart, closeCart, onCartClosed, renderCart, addToCart, changeQty, removeLine } from './cart.js';
import { openQuote, closeQuote, onQuoteClosed, submitQuote } from './quote.js';
import { homeView } from './views/home.js';
import { catalogView } from './views/catalog.js';
import { productView } from './views/product.js';
import { wishlistView, ordersView, placeholderView, creditsView, treeView, notFoundView } from './views/pages.js';

const hosts = {
  strip: document.getElementById('strip-host'),
  header: document.getElementById('header-host'),
  main: document.getElementById('main'),
  footer: document.getElementById('footer-host')
};

/* ---------- Routing ---------- */
function currentRoute() {
  let raw = location.hash.slice(1) || '/';
  if (!raw.startsWith('/')) raw = '/';
  const [path, ...rest] = raw.split('?');
  return { path: path.replace(/\/$/, '') || '/', params: new URLSearchParams(rest.join('?')) };
}

function viewFor(r) {
  if (r.path === '/') return homeView();
  if (r.path === '/catalog') return catalogView(r.params);
  if (r.path.startsWith('/product/')) return productView(decodeURIComponent(r.path.slice('/product/'.length)));
  if (r.path === '/categories') return treeView();
  if (r.path === '/wishlist') return wishlistView();
  if (r.path === '/orders') return ordersView();
  if (r.path === '/credits') return creditsView();
  if (['/checkout', '/sell', '/seller', '/admin'].includes(r.path)) return placeholderView(r.path.slice(1));
  return notFoundView();
}

function titleFor(r) {
  const base = 'DutyFreeDeal';
  if (r.path === '/') return t('docTitle');
  if (r.path.startsWith('/product/')) return `${label(product(decodeURIComponent(r.path.slice(9)))?.name || '') || t('productMissing')} | ${base}`;
  const h1 = hosts.main.querySelector('h1');
  return `${h1 ? h1.textContent.trim() : base} | ${base}`;
}

/* ---------- Footer: the catalogue's back cover ---------- */
function footerHTML() {
  return `<footer class="back-cover on-pine">
    <div class="container">
      <div class="back-seller">
        <div>
          <h2>${esc(t('sellerTitle'))}</h2>
          <p>${esc(t('sellerText'))}</p>
        </div>
        <a class="btn btn--light btn--large" href="#/sell">${esc(t('becomeSeller'))}${icon('arrow-right')}</a>
      </div>
      <div class="back-columns">
        <div class="back-brand">
          <a class="wordmark wordmark--light" href="#/" data-action="home">DutyFree<span>Deal</span></a>
          <p>${esc(t('sloganA'))} ${esc(t('sloganB'))}</p>
        </div>
        <nav aria-label="${esc(t('footerBuy'))}"><h3>${esc(t('footerBuy'))}</h3><ul role="list">
          <li><a href="#/categories">${esc(t('footerTree'))}</a></li>
          <li><a href="#/catalog?collection=deals">${esc(t('deals'))}</a></li>
          <li><a href="#/catalog?collection=rare">${esc(t('rare'))}</a></li>
          <li><a href="#/wishlist">${esc(t('footerSaved'))}</a></li>
          <li><a href="#/orders">${esc(t('orders'))}</a></li>
        </ul></nav>
        <nav aria-label="${esc(t('footerSell'))}"><h3>${esc(t('footerSell'))}</h3><ul role="list">
          <li><a href="#/sell">${esc(t('becomeSeller'))}</a></li>
          <li><a href="#/seller">${esc(t('footerSellerSpace'))}</a></li>
          <li><a href="#/admin">${esc(t('footerAdmin'))}</a></li>
        </ul></nav>
        <nav aria-label="${esc(t('footerPrototype'))}"><h3>${esc(t('footerPrototype'))}</h3><ul role="list">
          <li><a href="#/credits">${esc(t('stripLink'))}</a></li>
          <li><button type="button" class="back-reset" data-action="reset-demo">${esc(t('footerReset'))}</button></li>
        </ul></nav>
      </div>
      <p class="back-note">${esc(t('footerNote'))}</p>
    </div>
  </footer>`;
}

/* ---------- Rendering ---------- */
let coverObserver;

function observeCoverSearch() {
  coverObserver?.disconnect();
  const header = document.querySelector('.site-header');
  const cover = document.querySelector('.search--cover');
  if (!header || !cover) return;
  coverObserver = new IntersectionObserver(([entry]) => {
    const headerSearchFocused = header.querySelector('.search--header')?.contains(document.activeElement);
    const visible = !entry.isIntersecting || headerSearchFocused;
    header.dataset.search = visible ? 'visible' : 'hidden';
    if (!visible) closeSuggest(header.querySelector('.search-input'));
  }, { rootMargin: `-${document.querySelector('.site-header').offsetHeight}px 0px 0px 0px`, threshold: 0 });
  coverObserver.observe(cover);
}

function snapshotFocus() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  return { id: el.id, start: el.selectionStart, end: el.selectionEnd };
}

function render({ reason = 'route', focusTarget = null } = {}) {
  const r = currentRoute();
  if (r.path === '/catalog' && reason === 'route') drafts.q = r.params.get('q') || drafts.q;
  const snap = reason === 'route' ? null : snapshotFocus();
  menu.open = false;
  document.documentElement.lang = state.lang;
  hosts.strip.innerHTML = stripHTML();
  hosts.header.innerHTML = headerHTML(r);
  hosts.main.innerHTML = viewFor(r);
  hosts.footer.innerHTML = footerHTML();
  document.title = titleFor(r);
  document.querySelector('.skip-link').textContent = t('skip');
  observeCoverSearch();
  if (document.getElementById('cart-drawer')?.open) renderCart();

  if (focusTarget) {
    document.querySelector(focusTarget)?.focus({ preventScroll: true });
  } else if (snap?.id) {
    const el = document.getElementById(snap.id);
    if (el) {
      el.focus({ preventScroll: true });
      if (typeof snap.start === 'number' && el.setSelectionRange) el.setSelectionRange(snap.start, snap.end);
    }
  }
}

let firstRender = true;
function onRoute() {
  closeLayers();
  render({ reason: 'route' });
  if (firstRender) {
    firstRender = false;
    return;
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  hosts.main.querySelector('h1')?.focus({ preventScroll: true });
}

function closeLayers() {
  closeDestination(false);
  closeRayons(false);
  closeAllSuggest();
}

function reprint() {
  document.querySelectorAll('[data-reprint]').forEach(el => {
    el.classList.remove('is-reprinting');
    void el.offsetWidth;
    el.classList.add('is-reprinting');
  });
}

/* ---------- Actions ---------- */
function setCountry(code) {
  closeDestination(false);
  if (code === state.country) {
    document.getElementById('destination-btn')?.focus();
    return;
  }
  state.country = code;
  save();
  render({ reason: 'country', focusTarget: '#destination-btn' });
  reprint();
  announce(t('destinationChanged', { country: countryTo(code), n: visibleProducts().length }));
}

function setLang(code) {
  if (code === state.lang) return;
  state.lang = code;
  save();
  render({ reason: 'lang', focusTarget: `[data-action="set-lang"][data-lang="${code}"]` });
  announce(t('languageChanged'));
}

function toggleFavorite(id, btn) {
  const p = product(id);
  if (!p) return;
  const on = !state.favorites.includes(id);
  state.favorites = on ? [...state.favorites, id] : state.favorites.filter(f => f !== id);
  save();
  document.querySelectorAll(`[data-action="favorite"][data-id="${CSS.escape(id)}"]`).forEach(el => {
    el.setAttribute('aria-pressed', String(on));
    el.innerHTML = icon(on ? 'heart-fill' : 'heart');
  });
  updateBadges({ bump: 'favorites' });
  announce(t(on ? 'favAdded' : 'favRemoved'));
  if (currentRoute().path === '/wishlist' && !on) {
    render({ reason: 'refresh' });
    hosts.main.querySelector('h1')?.focus({ preventScroll: true });
  } else btn?.focus();
}

function resetDemo() {
  state.cart = [];
  state.favorites = [];
  state.requests = [];
  save();
  render({ reason: 'refresh', focusTarget: '[data-action="reset-demo"]' });
  notify(t('footerResetDone'));
}

function scrollHomeTop() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
  document.getElementById('cover-title')?.focus({ preventScroll: true });
}

/* ---------- Event delegation ---------- */
document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  const action = target?.dataset.action;

  if (!event.target.closest('[data-setting="destination"]') && isDestinationOpen()) closeDestination(false);
  if (menu.open && !event.target.closest('#rayons-menu') && !event.target.closest('#rayons-btn')) closeRayons(false);
  if (!event.target.closest('.search')) closeAllSuggest();

  const option = event.target.closest('.suggest-option');
  if (option) {
    const input = option.closest('.search')?.querySelector('.search-input');
    if (input) closeSuggest(input);
    go(option.dataset.href);
    return;
  }
  if (!action) return;

  switch (action) {
    case 'skip':
      event.preventDefault();
      hosts.main.focus();
      hosts.main.scrollIntoView();
      break;
    case 'home':
      if (currentRoute().path === '/') {
        event.preventDefault();
        closeLayers();
        scrollHomeTop();
      }
      break;
    case 'destination':
      if (isDestinationOpen()) closeDestination(true);
      else openDestination();
      break;
    case 'set-country':
      setCountry(target.dataset.code);
      break;
    case 'set-lang':
      setLang(target.dataset.lang);
      break;
    case 'rayons':
      if (menu.open) closeRayons(true);
      else openRayons({ categoryHint: currentRoute().params.get('category') || '' });
      break;
    case 'menu-rayon':
      setActiveRayon(target.dataset.id);
      break;
    case 'menu-close':
      closeRayons(true);
      break;
    case 'menu-filter-clear': {
      menu.filter = '';
      const input = document.getElementById('rayons-filter');
      if (input) input.value = '';
      refreshMenu({ keepFilterFocus: true });
      break;
    }
    case 'menu-search': {
      const q = menu.filter;
      closeRayons(false);
      drafts.q = q;
      go(`#/catalog?q=${encodeURIComponent(q)}`);
      break;
    }
    case 'open-cart':
      clearToast();
      openCart(target.closest('.toast') ? document.querySelector('.cart-btn') : target);
      break;
    case 'close-cart':
      closeCart();
      break;
    case 'close-cart-link':
      if (target.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        return;
      }
      closeCart();
      break;
    case 'add':
      addToCart(target.dataset.id, target);
      break;
    case 'favorite':
      toggleFavorite(target.dataset.id, target);
      break;
    case 'quote':
      openQuote(target.dataset.id, target);
      break;
    case 'close-quote':
      closeQuote();
      break;
    case 'qty':
      changeQty(target.dataset.id, Number(target.dataset.step));
      break;
    case 'remove':
      removeLine(target.dataset.id);
      break;
    case 'clear-search': {
      const input = target.closest('.search')?.querySelector('.search-input');
      if (input) {
        input.value = '';
        syncDrafts(input);
        closeSuggest(input);
        input.focus();
      }
      break;
    }
    case 'reset-demo':
      resetDemo();
      break;
    default:
      break;
  }
});

document.addEventListener('keydown', event => {
  if (onSearchKeydown(event)) return;
  if (isDestinationOpen() && onDestinationKeydown(event)) return;
  if (menu.open && onRayonsKeydown(event)) return;
  if (event.key === 'Escape') {
    if (menu.open) {
      event.preventDefault();
      closeRayons(true);
    } else if (isDestinationOpen()) {
      event.preventDefault();
      closeDestination(true);
    }
  }
});

document.addEventListener('input', event => {
  const el = event.target;
  if (el.classList?.contains('search-input')) {
    syncDrafts(el);
    openSuggest(el);
  } else if (el.id === 'rayons-filter') {
    menu.filter = el.value;
    refreshMenu({ keepFilterFocus: true });
  }
});

document.addEventListener('focusin', event => {
  const el = event.target;
  if (el.classList?.contains('search-input') && el.value.trim()) openSuggest(el);
  const header = el.closest?.('.site-header');
  if (header && el.closest('.search--header')) header.dataset.search = 'visible';
  const legend = el.closest?.('.legend-item');
  if (legend) highlightRef(legend.dataset.ref);
});

document.addEventListener('focusout', event => {
  const form = event.target.closest?.('.search');
  if (form && !form.contains(event.relatedTarget)) closeSuggest(form.querySelector('.search-input'));
  if (menu.open && event.relatedTarget && !event.relatedTarget.closest('#rayons-menu') && !event.relatedTarget.closest('#rayons-btn')) closeRayons(false);
  if (event.target.closest?.('.legend-item') && !event.relatedTarget?.closest('.legend-item')) highlightRef('');
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (form.matches('[data-search]')) {
    event.preventDefault();
    submitSearch(form.querySelector('.search-input'));
  } else if (form.matches('[data-form="quote"]')) {
    event.preventDefault();
    submitQuote(form);
  }
});

document.addEventListener('change', event => {
  const el = event.target;
  if (el.matches('select[data-action="sort"]')) {
    const base = el.dataset.base;
    go(el.value ? `${base}${base.includes('?') ? '&' : '?'}sort=${el.value}` : base);
  }
});

/* Plate and legend: hovering or focusing an entry points at its object, and the reverse. */
function highlightRef(ref) {
  const showcase = document.querySelector('.cover-showcase');
  if (!showcase) return;
  if (ref) showcase.dataset.activeRef = ref;
  else delete showcase.dataset.activeRef;
}

document.addEventListener('mouseover', event => {
  const rayon = event.target.closest?.('.rayon-option');
  if (rayon && menu.open) hoverRayon(rayon.dataset.id);
  const ref = event.target.closest?.('.legend-item, .plate-item');
  if (ref) highlightRef(ref.dataset.ref);
});

document.addEventListener('mouseout', event => {
  if (event.target.closest?.('.rayon-option') && !event.relatedTarget?.closest?.('.rayon-option')) cancelHoverRayon();
  const from = event.target.closest?.('.legend-item, .plate-item');
  if (from && !event.relatedTarget?.closest?.('.legend-item, .plate-item')) highlightRef('');
});

/* Dialogs: close on backdrop click, restore focus on close */
for (const [id, onClose] of [['cart-drawer', onCartClosed], ['quote-dialog', onQuoteClosed]]) {
  const dialog = document.getElementById(id);
  dialog.addEventListener('close', onClose);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}

window.addEventListener('hashchange', onRoute);
onRoute();
