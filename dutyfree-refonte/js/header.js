import {
  state, t, label, esc, icon, normalize, countries, categories, countryName, visibleProducts,
  cartCount, descendantCount, inCategory, findCategory
} from './core.js';
import { searchFieldHTML } from './search.js';
import { DEPARTMENT_IMAGES } from './departments.js';

/* ---------- Markup ---------- */
export function stripHTML() {
  return `<div class="strip on-pine"><div class="container strip-inner">
    <p>${icon('info')}<span>${t('stripText', { country: esc(countryName(state.country)) })}</span></p>
    <a href="#/credits">${esc(t('stripLink'))}</a>
  </div></div>`;
}

function destinationHTML() {
  const current = countryName(state.country);
  return `<div class="setting" data-setting="destination">
    <button type="button" class="setting-btn" id="destination-btn" data-action="destination" aria-haspopup="listbox" aria-expanded="false" aria-controls="destination-pop" aria-label="${esc(t('destinationButton', { country: current }))}">
      ${icon('map-pin')}
      <span class="setting-text" aria-hidden="true"><span class="setting-label">${esc(t('deliverTo'))}</span><span class="setting-value">${esc(current)}</span></span>
      ${icon('caret-down', 'setting-caret')}
    </button>
    <div class="popover" id="destination-pop" hidden>
      <p class="popover-title" id="destination-title">${esc(t('destinationTitle'))}</p>
      <p class="popover-note">${esc(t('destinationIntro'))}</p>
      <ul class="country-list" role="listbox" aria-labelledby="destination-title">
        ${countries.map(c => {
          const n = visibleProducts(c.code).length;
          const selected = c.code === state.country;
          return `<li class="country-option" role="option" tabindex="-1" id="country-${c.code}" data-action="set-country" data-code="${c.code}" aria-selected="${selected}">
            <span class="country-name">${esc(label(c.name))}</span>
            <span class="country-count">${esc(t('destinationCount', { n }))}</span>
            ${selected ? icon('check', 'country-check') : '<span></span>'}
          </li>`;
        }).join('')}
      </ul>
      <p class="popover-note">${esc(t('destinationNote'))}</p>
    </div>
  </div>`;
}

function languageHTML() {
  const btn = (code, text, name) =>
    `<button type="button" data-action="set-lang" data-lang="${code}" lang="${code}" aria-pressed="${state.lang === code}" aria-label="${name}">${text}</button>`;
  return `<div class="setting setting--lang" role="group" aria-labelledby="lang-label">
    <span class="setting-label" id="lang-label">${esc(t('languageLabel'))}</span>
    <div class="segmented">${btn('fr', 'FR', 'Français')}${btn('en', 'EN', 'English')}</div>
  </div>`;
}

export function headerHTML(r) {
  const isHome = r.path === '/';
  const collection = r.path === '/catalog' ? r.params.get('collection') : '';
  const fav = state.favorites.length;
  const items = cartCount();
  const current = (path, active) => (active ? 'aria-current="page"' : '');
  return `<header class="site-header" data-search="${isHome ? 'hidden' : 'visible'}">
    <div class="mast"><div class="container mast-inner">
      <a class="wordmark" href="#/" data-action="home" aria-label="${esc(t('homeLabel'))}">DutyFree<span>Deal</span></a>
      ${searchFieldHTML({ scope: 'header', placeholder: t('searchPlaceholderHeader'), label: esc(t('searchLabelHeader')), submitLabel: t('searchSubmit') })}
      <div class="settings">${destinationHTML()}${languageHTML()}</div>
      <nav class="account" aria-label="${esc(t('navTools'))}">
        <a class="icon-link" href="#/wishlist" aria-label="${esc(t('favoritesCount', { n: fav }))}" ${current('/wishlist', r.path === '/wishlist')}>${icon('heart')}<span class="badge" data-badge="favorites" data-count="${fav}" aria-hidden="true">${fav}</span></a>
        <button type="button" class="cart-btn" data-action="open-cart" aria-label="${esc(t('cartCountLabel', { n: items }))}" aria-haspopup="dialog">${icon('shopping-bag')}<span aria-hidden="true">${esc(t('cart'))}</span><span class="badge" data-badge="cart" data-count="${items}" aria-hidden="true">${items}</span></button>
      </nav>
    </div></div>
    <div class="tabs"><div class="container tabs-inner">
      <nav class="tabs-main" aria-label="${esc(t('navCatalogue'))}">
        <button type="button" class="tab tab--menu" id="rayons-btn" data-action="rayons" aria-expanded="false" aria-controls="rayons-menu">${icon('squares-four')}${esc(t('allDepartments'))}${icon('caret-down', 'setting-caret')}</button>
        <a class="tab" href="#/catalog?collection=deals" ${current('', collection === 'deals')}>${icon('tag')}${esc(t('deals'))}</a>
        <a class="tab" href="#/catalog?collection=rare" ${current('', collection === 'rare')}>${icon('binoculars')}${esc(t('rare'))}</a>
      </nav>
      <nav class="tabs-side" aria-label="${esc(t('navAccount'))}">
        <a class="tab" href="#/orders" ${current('', r.path === '/orders')}>${icon('package')}${esc(t('orders'))}</a>
        <a class="tab" href="#/sell" ${current('', r.path === '/sell')}>${icon('storefront')}${esc(t('becomeSeller'))}</a>
      </nav>
    </div>
    <div class="rayons-menu" id="rayons-menu" role="region" aria-label="${esc(t('menuRegion'))}" hidden></div>
    </div>
  </header>`;
}

/* ---------- Destination popover ---------- */
export function isDestinationOpen() {
  return document.getElementById('destination-btn')?.getAttribute('aria-expanded') === 'true';
}

export function openDestination() {
  closeRayons(false);
  const btn = document.getElementById('destination-btn');
  const pop = document.getElementById('destination-pop');
  if (!btn || !pop) return;
  btn.setAttribute('aria-expanded', 'true');
  pop.hidden = false;
  (pop.querySelector('[aria-selected="true"]') || pop.querySelector('[role="option"]'))?.focus();
}

export function closeDestination(restoreFocus = false) {
  const btn = document.getElementById('destination-btn');
  const pop = document.getElementById('destination-pop');
  if (!btn || !pop || pop.hidden) return;
  btn.setAttribute('aria-expanded', 'false');
  pop.hidden = true;
  if (restoreFocus) btn.focus();
}

export function onDestinationKeydown(event) {
  const option = event.target.closest?.('.country-option');
  if (!option) return false;
  const options = [...option.parentElement.querySelectorAll('.country-option')];
  const i = options.indexOf(option);
  const focusAt = n => options[(n + options.length) % options.length].focus();
  if (event.key === 'ArrowDown') focusAt(i + 1);
  else if (event.key === 'ArrowUp') focusAt(i - 1);
  else if (event.key === 'Home') focusAt(0);
  else if (event.key === 'End') focusAt(options.length - 1);
  else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    option.click();
    return true;
  } else if (event.key === 'Tab') {
    closeDestination(false);
    return false;
  } else return false;
  event.preventDefault();
  return true;
}

/* ---------- Departments menu ---------- */
export const menu = { open: false, active: '', filter: '' };
let hoverTimer;

const subtreeText = node => [node.name.fr, node.name.en, ...(node.children || []).map(subtreeText)].join(' ');
const matchesFilter = node => !menu.filter || normalize(subtreeText(node)).includes(normalize(menu.filter));

function mark(text) {
  const q = normalize(menu.filter);
  const source = String(text);
  const i = q ? normalize(source).indexOf(q) : -1;
  if (i < 0) return esc(source);
  return `${esc(source.slice(0, i))}<mark>${esc(source.slice(i, i + q.length))}</mark>${esc(source.slice(i + q.length))}`;
}

const catalogLink = id => `#/catalog?category=${encodeURIComponent(id)}`;

function detailHTML() {
  const list = categories.filter(matchesFilter);
  const active = list.find(c => c.id === menu.active);
  if (!active) {
    return `<div class="rayons-empty"><h2>${esc(t('menuNoMatch', { q: menu.filter }))}</h2><p>${esc(t('menuNoMatchText'))}</p>
      <button type="button" class="btn btn--primary" data-action="menu-search">${icon('magnifying-glass')}${esc(t('menuSearchOffers', { q: menu.filter }))}</button></div>`;
  }
  const offers = visibleProducts().filter(p => inCategory(p, active.id)).length;
  const img = DEPARTMENT_IMAGES[active.id];
  return `<div class="rayons-detail-grid">
    <div class="rayons-detail-main">
      <div class="rayons-detail-head">
        <div><h2>${mark(label(active.name))}</h2><p>${esc(t('categoriesCount', { n: descendantCount(active) }))}, ${esc(t('offersCountShort', { n: offers }))}</p></div>
        <button type="button" class="menu-close" data-action="menu-close">${icon('x')}${esc(t('menuClose'))}</button>
      </div>
      <div class="rayons-columns">
        ${(active.children || []).map(child => `<section class="rayons-group">
          <h3><a href="${catalogLink(child.id)}">${mark(label(child.name))}</a></h3>
          <ul>${(child.children || []).map(leaf => `<li><a href="${catalogLink(leaf.id)}">${mark(label(leaf.name))}</a></li>`).join('')}</ul>
        </section>`).join('')}
      </div>
    </div>
    <div class="rayons-aside">
      <a class="rayons-figure" href="${catalogLink(active.id)}" tabindex="-1" aria-hidden="true" style="background-image: url('${esc(img?.thumb || '')}')"><img src="${esc(img?.src || '')}" alt="" decoding="async"></a>
      <a class="btn btn--primary rayons-all" href="${catalogLink(active.id)}">${esc(t('menuSeeAll'))}${icon('arrow-right')}</a>
    </div>
  </div>`;
}

function listHTML() {
  return categories
    .filter(matchesFilter)
    .map(c => {
      const img = DEPARTMENT_IMAGES[c.id];
      return `<li><button type="button" class="rayon-option" data-action="menu-rayon" data-id="${c.id}" aria-current="${c.id === menu.active}" aria-controls="rayons-detail">
        <img src="${esc(img?.thumb || '')}" alt="" loading="lazy">
        <span>${mark(label(c.name))}</span>${icon('caret-right')}
      </button></li>`;
    })
    .join('');
}

function renderMenu() {
  const host = document.getElementById('rayons-menu');
  if (!host) return;
  host.innerHTML = `<div class="container rayons-shell">
    <div class="rayons-side">
      <div class="rayons-filter">
        <label class="sr-only" for="rayons-filter">${esc(t('menuFilterLabel'))}</label>
        ${icon('magnifying-glass')}
        <input id="rayons-filter" type="search" autocomplete="off" spellcheck="false" value="${esc(menu.filter)}" placeholder="${esc(t('menuFilterPlaceholder'))}">
        <button type="button" class="filter-clear" data-action="menu-filter-clear" aria-label="${esc(t('menuFilterClear'))}" ${menu.filter ? '' : 'hidden'}>${icon('x')}</button>
      </div>
      <ul class="rayons-list" id="rayons-list" aria-label="${esc(t('menuDepartments'))}">${listHTML()}</ul>
    </div>
    <div class="rayons-detail" id="rayons-detail">${detailHTML()}</div>
  </div>`;
}

export function refreshMenu({ keepFilterFocus = false } = {}) {
  const list = document.getElementById('rayons-list');
  const detail = document.getElementById('rayons-detail');
  if (!list || !detail) return;
  const clear = document.querySelector('[data-action="menu-filter-clear"]');
  if (clear) clear.hidden = !menu.filter;
  const matches = categories.filter(matchesFilter);
  if (!matches.some(c => c.id === menu.active)) menu.active = matches[0]?.id || '';
  list.innerHTML = listHTML();
  detail.innerHTML = detailHTML();
  if (keepFilterFocus) document.getElementById('rayons-filter')?.focus();
}

export function setActiveRayon(id, { focus = false } = {}) {
  if (menu.active === id) return;
  menu.active = id;
  document.querySelectorAll('.rayon-option').forEach(btn => btn.setAttribute('aria-current', String(btn.dataset.id === id)));
  const detail = document.getElementById('rayons-detail');
  if (detail) detail.innerHTML = detailHTML();
  if (focus) document.querySelector(`.rayon-option[data-id="${id}"]`)?.focus();
}

export function hoverRayon(id) {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => setActiveRayon(id), 90);
}

export function cancelHoverRayon() {
  clearTimeout(hoverTimer);
}

export function openRayons({ focusFilter = false, categoryHint = '' } = {}) {
  closeDestination(false);
  const btn = document.getElementById('rayons-btn');
  const host = document.getElementById('rayons-menu');
  if (!btn || !host) return;
  menu.open = true;
  menu.filter = '';
  const hinted = categoryHint ? findCategory(categoryHint)?.path[0] : null;
  menu.active = hinted?.id || menu.active || categories[0].id;
  renderMenu();
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
  host.style.setProperty('--menu-max', `${Math.max(320, Math.round(window.innerHeight - headerBottom))}px`);
  host.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
  const scrim = document.getElementById('menu-scrim');
  if (scrim) scrim.hidden = false;
  if (focusFilter) document.getElementById('rayons-filter')?.focus();
  else document.querySelector(`.rayon-option[data-id="${menu.active}"]`)?.focus();
}

export function closeRayons(restoreFocus = false) {
  const btn = document.getElementById('rayons-btn');
  const host = document.getElementById('rayons-menu');
  menu.open = false;
  clearTimeout(hoverTimer);
  const scrim = document.getElementById('menu-scrim');
  if (scrim) scrim.hidden = true;
  if (!btn || !host || host.hidden) return;
  host.hidden = true;
  host.innerHTML = '';
  btn.setAttribute('aria-expanded', 'false');
  if (restoreFocus) btn.focus();
}

export function onRayonsKeydown(event) {
  const option = event.target.closest?.('.rayon-option');
  if (!option) return false;
  const options = [...document.querySelectorAll('.rayon-option')];
  const i = options.indexOf(option);
  const move = n => {
    const target = options[(n + options.length) % options.length];
    setActiveRayon(target.dataset.id, { focus: true });
  };
  if (event.key === 'ArrowDown') move(i + 1);
  else if (event.key === 'ArrowUp') move(i - 1);
  else if (event.key === 'Home') move(0);
  else if (event.key === 'End') move(options.length - 1);
  else if (event.key === 'ArrowRight') document.querySelector('#rayons-detail a')?.focus();
  else return false;
  event.preventDefault();
  return true;
}

export function updateBadges({ bump = '' } = {}) {
  const fav = state.favorites.length;
  const items = cartCount();
  const favBadge = document.querySelector('[data-badge="favorites"]');
  const cartBadge = document.querySelector('[data-badge="cart"]');
  if (favBadge) {
    favBadge.textContent = fav;
    favBadge.dataset.count = fav;
    favBadge.closest('a')?.setAttribute('aria-label', t('favoritesCount', { n: fav }));
  }
  if (cartBadge) {
    cartBadge.textContent = items;
    cartBadge.dataset.count = items;
    cartBadge.closest('button')?.setAttribute('aria-label', t('cartCountLabel', { n: items }));
  }
  const target = bump === 'cart' ? cartBadge : bump === 'favorites' ? favBadge : null;
  if (target) {
    target.classList.remove('is-bumped');
    void target.offsetWidth;
    target.classList.add('is-bumped');
  }
}
