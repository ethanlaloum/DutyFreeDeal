import {
  state, t, label, esc, icon, money, price, vendor, vendorName, countryName, countryTo, countryAt,
  shippingFee, stock, isQuote, purchasable, deliverableTo, photoMode
} from './core.js';

const enc = encodeURIComponent;
export const productHref = p => `#/product/${enc(p.id)}`;

export function photo(p, { sizes = '', eager = false, cls = '' } = {}) {
  const mode = photoMode(p);
  return `<img class="${mode === 'cover' ? 'is-cover' : 'is-cutout'} ${cls}" src="${esc(p.image)}" alt="${esc(label(p.name))}" ${sizes ? `sizes="${sizes}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
}

/* Seller country to delivery country: the marketplace mechanism, stated as text. */
export function route(p, { withSeller = false } = {}) {
  const v = vendor(p.vendorId);
  if (!v) return '';
  const from = v.country;
  const to = state.country;
  const seller = withSeller ? `<span class="route-seller">${esc(vendorName(v))}</span>` : '';
  const sr = from === to ? t('localSeller', { country: countryAt(from) }) : t('routeLabel', { from: countryAt(from), to: countryTo(to) });
  const visual = from === to
    ? `<span>${esc(countryName(from))}</span>`
    : `<span>${esc(countryName(from))}</span>${icon('arrow-right')}<span>${esc(countryName(to))}</span>`;
  return `<p class="route">${seller}<span class="sr-only">${esc(sr)}</span><span class="route-visual" aria-hidden="true">${visual}</span></p>`;
}

export function shipping(p) {
  if (isQuote(p)) return `<span class="shipping">${esc(t('quoteDelivery'))}</span>`;
  if (!deliverableTo(p)) return `<span class="shipping">${esc(t('notDeliverableShort', { country: countryTo(state.country) }))}</span>`;
  return `<span class="shipping">${esc(t('shippingPlus', { amount: money(shippingFee(p)) }))}</span>`;
}

export function priceLine(p, size = 'l') {
  if (isQuote(p)) {
    return `<div class="price-line"><span class="price-caption">${esc(t('indicativePrice'))}</span>${price(p.price, size, { round: true })}</div>`;
  }
  return `<div class="price-line">${price(p.price, size)}${shipping(p)}</div>`;
}

export function favButton(p, small = false) {
  const on = state.favorites.includes(p.id);
  return `<button type="button" class="fav-btn ${small ? 'fav-btn--small' : ''}" data-action="favorite" data-id="${esc(p.id)}" aria-pressed="${on}" aria-label="${esc(t('saveFor', { name: label(p.name) }))}">${icon(on ? 'heart-fill' : 'heart')}</button>`;
}

export function buyButton(p, { short = false, size = '', tone = 'primary' } = {}) {
  const name = label(p.name);
  if (isQuote(p)) {
    return `<button type="button" class="btn btn--secondary ${size}" data-action="quote" data-id="${esc(p.id)}">${icon('envelope-simple')}${esc(t('requestQuote'))}</button>`;
  }
  if (!purchasable(p)) {
    const reason = !deliverableTo(p) ? t('notDeliverableShort', { country: countryTo(state.country) }) : t('outOfStock');
    return `<button type="button" class="btn btn--secondary ${size}" disabled>${esc(reason)}</button>`;
  }
  return `<button type="button" class="btn btn--${tone} ${size}" data-action="add" data-id="${esc(p.id)}" aria-label="${esc(t('addToCartFor', { name }))}">${icon('shopping-bag')}${esc(short ? t('add') : t('addToCart'))}</button>`;
}

/* Vertical card for catalogue grids */
export function offerCard(p) {
  const v = vendor(p.vendorId);
  return `<article class="offer-card" data-offer="${esc(p.id)}">
    <a class="offer-photo" href="${productHref(p)}" tabindex="-1" aria-hidden="true">${photo(p)}</a>
    <div class="offer-body">
      ${isQuote(p) ? `<span class="tag tag--quote">${icon('envelope-simple')}${esc(t('onRequest'))}</span>` : ''}
      <h3 class="offer-name"><a href="${productHref(p)}">${esc(label(p.name))}</a></h3>
      <p class="offer-seller meta">${esc(vendorName(v))}</p>
      ${route(p)}
      ${priceLine(p, 'm')}
      <div class="offer-actions">${buyButton(p, { size: 'btn--small' })}${favButton(p, true)}</div>
    </div>
  </article>`;
}

/* Horizontal entry for the two promises */
export function offerEntry(p) {
  const v = vendor(p.vendorId);
  return `<article class="entry" data-offer="${esc(p.id)}">
    <a class="entry-photo" href="${productHref(p)}" tabindex="-1" aria-hidden="true">${photo(p)}</a>
    <div class="entry-body">
      <h3 class="entry-name"><a href="${productHref(p)}">${esc(label(p.name))}</a></h3>
      <p class="entry-seller">${esc(vendorName(v))}</p>
      ${route(p)}
      ${priceLine(p, 'm')}
      <div class="entry-actions">${buyButton(p, { size: 'btn--small', tone: 'secondary' })}${favButton(p, true)}</div>
    </div>
  </article>`;
}

export function stockText(p) {
  if (isQuote(p)) return t('onRequest');
  const n = stock(p);
  return n > 0 ? t('inStock', { n }) : t('outOfStock');
}

export function emptyState({ iconName = 'package', title, text, actions = '' }) {
  return `<div class="empty">${icon(iconName)}<h2>${esc(title)}</h2><p>${text}</p>${actions ? `<div class="empty-actions">${actions}</div>` : ''}</div>`;
}
