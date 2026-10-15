import {
  state, t, label, esc, icon, products, product, vendor, vendorName, countryTo, countryAt,
  findCategory, isQuote, deliverableTo, modelKey, purchasable
} from '../core.js';
import { route, priceLine, buyButton, favButton, photo, productHref, emptyState, stockText } from '../components.js';

export function productView(id) {
  const p = product(id);
  if (!p) {
    return `<div class="container page">${emptyState({
      iconName: 'magnifying-glass',
      title: t('productMissing'),
      text: esc(t('productMissingText')),
      actions: `<a class="btn btn--primary" href="#/catalog">${esc(t('backToCatalogue'))}</a>`
    })}</div>`;
  }
  const v = vendor(p.vendorId);
  const crumbs = [`<a href="#/">${esc(t('home'))}</a>`, ...(p.path || []).map(cid => {
    const found = findCategory(cid);
    return found ? `<a href="#/catalog?category=${encodeURIComponent(cid)}">${esc(label(found.node.name))}</a>` : '';
  }).filter(Boolean)];
  const others = products.filter(o => o.id !== p.id && modelKey(o) === modelKey(p) && deliverableTo(o));
  const deliverable = deliverableTo(p);

  return `<div class="container page product-page">
    <nav class="breadcrumb" aria-label="${esc(t('breadcrumb'))}">${crumbs.join(icon('caret-right'))}</nav>
    <div class="product-layout">
      <div class="product-gallery ${p.image.includes('/photos/car') || p.image.includes('/photos/house') ? 'is-wide' : ''}">${photo(p, { eager: true })}</div>
      <div class="product-info">
        ${isQuote(p) ? `<span class="tag tag--quote">${icon('envelope-simple')}${esc(t('onRequest'))}</span>` : ''}
        <h1 tabindex="-1">${esc(label(p.name))}</h1>
        <div class="product-seller">
          <p class="meta">${esc(t('soldBy'))}</p>
          <p class="product-seller-name">${icon('storefront')}<strong>${esc(vendorName(v))}</strong></p>
          <p class="meta">${esc(t(v.type === 'business' ? 'business' : 'individual'))}, ${esc(countryAt(v.country))}. ${esc(t('verificationDemo', { kind: v.verification.toUpperCase() }))}</p>
          ${route(p)}
          <p class="meta">${esc(t('sellerCountryNote'))}</p>
        </div>
        <div class="product-buy">
          ${priceLine(p, 'xl')}
          ${!isQuote(p) && deliverable ? `<p class="product-delivery">${icon('truck')}<span>${esc(t('deliveryTo', { country: countryTo(state.country) }))}, ${esc(label(p.delivery))}</span></p>` : ''}
          ${!deliverable ? `<p class="notice">${icon('warning')}<span>${esc(t('productNotDeliverable', { country: countryTo(state.country) }))}</span></p>` : ''}
          <p class="meta">${esc(stockText(p))}</p>
          <div class="product-actions">${buyButton(p, { size: 'btn--large' })}${favButton(p)}</div>
        </div>
        <p class="notice">${icon('info')}<span>${esc(label(p.description))}</span></p>
        <div class="product-specs">
          <h2>${esc(t('specs'))}</h2>
          <dl>${(p.specs || []).map(s => `<div><dt>${esc(label(s.name))}</dt><dd>${esc(label(s.value))}</dd></div>`).join('')}</dl>
        </div>
      </div>
    </div>
    <section class="other-offers" aria-labelledby="others-title">
      <h2 id="others-title">${esc(t('otherOffers'))}</h2>
      <p class="page-lead">${esc(t('otherOffersText'))}</p>
      ${others.length ? `<ul class="others-list" role="list">${others.map(o => {
        const ov = vendor(o.vendorId);
        return `<li class="others-row">
          <div><a class="others-name" href="${productHref(o)}">${esc(vendorName(ov))}</a>${route(o)}</div>
          <div class="others-price">${priceLine(o, 'm')}</div>
          <div class="others-action">${purchasable(o) || isQuote(o) ? buyButton(o, { size: 'btn--small' }) : `<span class="meta">${esc(stockText(o))}</span>`}</div>
        </li>`;
      }).join('')}</ul>` : `<p class="meta">${esc(t('noOtherOffers'))}</p>`}
    </section>
    <p class="notice page-progress">${icon('info')}<span>${esc(t('pageInProgress'))}</span></p>
  </div>`;
}

export const productTitle = id => label(product(id)?.name || '');
