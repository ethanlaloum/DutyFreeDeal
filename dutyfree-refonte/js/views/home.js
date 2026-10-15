import {
  state, t, label, esc, icon, categories, products, visibleProducts, purchasable, isQuote, vendor, vendorName,
  countryTo, modelKey, descendantCount, totalCategoryNodes, price, money, shippingFee
} from '../core.js';
import { searchFieldHTML } from '../search.js';
import { route, priceLine, buyButton, offerEntry, productHref } from '../components.js';
import { DEPARTMENT_IMAGES } from '../departments.js';

/* ---------- Offer selection ---------- */
const PLATE_MODELS = ['perfume', 'headphones', 'camera'];

/* Three purchasable offers, one per plate model, maximising distinct seller countries other than the destination. */
export function coverOffers() {
  const pools = PLATE_MODELS.map(m => products.filter(p => modelKey(p) === m && purchasable(p)));
  if (pools.some(pool => !pool.length)) {
    return visibleProducts().filter(purchasable).slice(0, 3);
  }
  let best = null;
  let bestScore = -Infinity;
  for (const a of pools[0]) for (const b of pools[1]) for (const c of pools[2]) {
    const origins = [a, b, c].map(p => vendor(p.vendorId).country);
    const foreign = new Set(origins.filter(o => o !== state.country)).size;
    const distinct = new Set(origins).size;
    const score = foreign * 10 + distinct * 3 + [a, b, c].reduce((s, p) => s + Math.min(p.stock, 10) / 10, 0);
    if (score > bestScore) {
      bestScore = score;
      best = [a, b, c];
    }
  }
  return best;
}

function collectionOffers(key, exclude, n = 2) {
  const taken = new Set(exclude.map(p => p.id));
  const seenModels = new Set(exclude.map(modelKey));
  const foreign = p => (vendor(p.vendorId).country !== state.country ? 0 : 1);
  const pool = products
    .filter(p => p.collections?.includes(key) && purchasable(p) && !taken.has(p.id))
    .sort((a, b) => foreign(a) - foreign(b));
  const picked = [];
  for (const p of pool) {
    if (picked.length >= n) break;
    if (seenModels.has(modelKey(p))) continue;
    picked.push(p);
    seenModels.add(modelKey(p));
  }
  for (const p of pool) {
    if (picked.length >= n) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}

const collectionCount = key => products.filter(p => p.collections?.includes(key) && purchasable(p)).length;

/* ---------- Cover ---------- */
function plateHTML(offers) {
  return `<div class="plate" role="group" aria-label="${esc(t('plateLabel'))}">
    ${offers.map((p, i) => `<a class="plate-item plate-item--${modelKey(p)}" href="${productHref(p)}" data-ref="${i + 1}" tabindex="-1" aria-hidden="true">
      <span class="plate-obj"><span class="plate-ref">${i + 1}</span><span class="plate-crop"><img src="${esc(p.image)}" alt="" ${i === 0 ? 'fetchpriority="high"' : ''} decoding="async"></span></span>
    </a>`).join('')}
  </div>`;
}

function legendHTML(offers) {
  return `<ol class="legend" role="list" aria-label="${esc(t('plateLabel'))}">
    ${offers.map((p, i) => `<li class="legend-item" data-ref="${i + 1}" data-offer="${esc(p.id)}">
      <span class="legend-ref" aria-hidden="true">${i + 1}</span>
      <div class="legend-text">
        <a class="legend-name" href="${productHref(p)}">${esc(label(p.name))}</a>
        ${route(p)}
      </div>
      <div class="legend-price">${price(p.price, 'm')}<span class="shipping">${esc(t('shippingPlus', { amount: money(shippingFee(p)) }))}</span></div>
      <div class="legend-action">${buyButton(p, { short: true, size: 'btn--small', tone: 'secondary' })}</div>
    </li>`).join('')}
  </ol>`;
}

function coverHTML() {
  const offers = coverOffers();
  return `<section class="cover" aria-labelledby="cover-title">
    <div class="container cover-grid">
      <h1 class="cover-title" id="cover-title" tabindex="-1"><span>${esc(t('sloganA'))}</span> <span>${esc(t('sloganB'))}</span></h1>
      <div class="cover-copy">
        <p class="cover-lead">${esc(t('coverLead'))}</p>
        ${searchFieldHTML({
          scope: 'cover',
          placeholder: t('searchPlaceholderCover'),
          label: t('searchLabelCover', { country: esc(countryTo(state.country)) }),
          submitLabel: t('searchSubmit'),
          visibleLabel: true
        })}
      </div>
      <div class="cover-showcase" data-reprint>
        ${plateHTML(offers)}
        ${legendHTML(offers)}
        <p class="cover-note">${esc(t('plateNote'))} <a href="#/credits">${esc(t('plateSources'))}</a></p>
      </div>
    </div>
  </section>`;
}

/* ---------- Two promises ---------- */
function promiseHTML(key, exclude) {
  const isDeals = key === 'deals';
  const offers = collectionOffers(key, exclude);
  const n = collectionCount(key);
  return `<article class="promise promise--${key}" aria-labelledby="${key}-title">
    <div class="promise-head">
      <h2 id="${key}-title">${icon(isDeals ? 'tag' : 'binoculars')}<span>${esc(t(isDeals ? 'deals' : 'rare'))}</span></h2>
      <p>${esc(t(isDeals ? 'dealsText' : 'rareText'))}</p>
    </div>
    ${offers.length
      ? `<div class="promise-list">${offers.map(offerEntry).join('')}</div>`
      : `<p class="promise-empty">${esc(t('collectionEmpty'))}</p>`}
    ${n ? `<a class="promise-more" href="#/catalog?collection=${key}">${esc(t(isDeals ? 'dealsMore' : 'rareMore', { n }))} ${esc(countryTo(state.country))}${icon('arrow-right')}</a>` : ''}
  </article>`;
}

function promisesHTML() {
  const cover = coverOffers();
  const deals = collectionOffers('deals', cover);
  return `<section class="promises" data-reprint>
    <div class="container promises-grid">
      ${promiseHTML('deals', cover)}
      ${promiseHTML('rare', [...cover, ...deals])}
    </div>
  </section>`;
}

/* ---------- The 15 departments ---------- */
function rayonCardHTML(c, index) {
  const img = DEPARTMENT_IMAGES[c.id];
  const href = `#/catalog?category=${encodeURIComponent(c.id)}`;
  const children = c.children || [];
  const shown = children.length <= 4 ? children : children.slice(0, 3);
  const rest = children.length - shown.length;
  const wide = index < 3;
  return `<li class="rayon-card ${wide ? 'rayon-card--wide' : ''}">
    <a class="rayon-photo" href="${href}" tabindex="-1" aria-hidden="true">
      <img src="${esc(img.src)}" alt="${esc(label(img.alt))}" loading="${index < 7 ? 'eager' : 'lazy'}" decoding="async">
    </a>
    <h3 class="rayon-name"><a href="${href}">${esc(label(c.name))}</a></h3>
    <p class="rayon-subs">${shown.map(ch => `<a href="#/catalog?category=${encodeURIComponent(ch.id)}">${esc(label(ch.name))}</a>`).join(', ')}${rest > 0 ? ` <span>${esc(t('andMore', { n: rest }))}</span>` : ''}</p>
    <p class="rayon-meta">${esc(t('categoriesCount', { n: descendantCount(c) }))}</p>
  </li>`;
}

function rayonsHTML() {
  return `<section class="rayons" aria-labelledby="rayons-title">
    <div class="container">
      <div class="section-head">
        <h2 id="rayons-title">${esc(t('rayonsTitle'))}</h2>
        <p>${esc(t('rayonsText', { n: totalCategoryNodes() - categories.length }))}</p>
        <a class="link-arrow" href="#/categories">${esc(t('rayonsTree'))}${icon('arrow-right')}</a>
      </div>
      <ul class="rayon-grid" role="list">${categories.map(rayonCardHTML).join('')}</ul>
    </div>
  </section>`;
}

/* ---------- Large goods on request ---------- */
function largeHTML() {
  const offers = ['car', 'house']
    .map(m => products.filter(p => modelKey(p) === m && isQuote(p) && visibleProducts().includes(p)).sort((a, b) => a.price - b.price)[0])
    .filter(Boolean);
  return `<section class="large" aria-labelledby="large-title" data-reprint>
    <div class="container large-grid">
      <div class="large-copy">
        <h2 id="large-title">${esc(t('largeTitle'))}</h2>
        <p>${esc(t('largeText'))}</p>
      </div>
      ${offers.length ? `<div class="large-items">${offers.map(p => `<article class="large-item" data-offer="${esc(p.id)}">
        <a class="large-photo" href="${productHref(p)}" tabindex="-1" aria-hidden="true"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"></a>
        <div class="large-body">
          <h3><a href="${productHref(p)}">${esc(label(p.name))}</a></h3>
          <p class="large-seller">${esc(vendorName(vendor(p.vendorId)))}</p>
          ${route(p)}
          <dl class="large-specs">
            <div><dt>${esc(t('indicativePrice'))}</dt><dd>${price(p.price, 'm', { round: true })}</dd></div>
            <div><dt>${esc(t('largeMode'))}</dt><dd>${esc(t('largeModeValue'))}</dd></div>
            <div><dt>${esc(t('largeDeposit'))}</dt><dd>${esc(t('largeDepositValue'))}</dd></div>
            <div><dt>${esc(t('largeTransport'))}</dt><dd>${esc(t('largeTransportValue'))}</dd></div>
          </dl>
          ${buyButton(p, { size: 'btn--small' })}
        </div>
      </article>`).join('')}</div>` : `<p class="large-none">${esc(t('largeNone'))}</p>`}
    </div>
  </section>`;
}

/* ---------- How ordering works ---------- */
function howHTML() {
  const items = [['how1Title', 'how1Text'], ['how2Title', 'how2Text'], ['how3Title', 'how3Text'], ['how4Title', 'how4Text']];
  return `<section class="how" aria-labelledby="how-title">
    <div class="container">
      <h2 id="how-title">${esc(t('howTitle'))}</h2>
      <dl class="how-list">
        ${items.map(([title, text]) => `<div class="how-item"><dt>${esc(t(title))}</dt><dd>${esc(t(text))}</dd></div>`).join('')}
      </dl>
    </div>
  </section>`;
}

export function homeView() {
  return `${coverHTML()}${promisesHTML()}${rayonsHTML()}${largeHTML()}${howHTML()}`;
}

