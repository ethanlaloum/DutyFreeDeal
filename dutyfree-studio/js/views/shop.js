/* Shop pages: the catalog and its filters, the department tree, the offer page and the saved offers.
 * The catalog of a destination is every public offer whose seller delivers there; every amount is an example in euros. */
import {
  state, label, esc, icon, normalize, plural, money, moneyRound, countries, countryName, countryIn, categories, vendor,
  vendorName, vendorState, allProducts, product, isHidden, publicOffer, deliverable, stock, isQuote, available, shipping,
  shopOffers, inCollection, modelKey, cutout, altText, sameModel, findCategory, department, inCategory, countNodes,
  catalogHref, productHref, addRequest, requestKindLabel
} from '../core.js';
import {
  offerCard, offerImage, cutImg, favButton, sellerLine, departmentArt, breadcrumb, pageHead, emptyState,
  chip, demoTag, notice, check
} from '../ui/components.js';
import { setDialogError } from '../ui/feedback.js';
import { openPanel } from '../ui/header.js';
import { BRANDED } from '../art.js';
import { CREDITS } from '../credits.js';

/* ---------- Shared helpers ---------- */

const KEYS = ['q', 'category', 'collection', 'origin', 'mode', 'max', 'stock', 'sort'];
const SORTS = [['', 'Relevance'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['name', 'Name: A to Z']];
const COUNTRY_ORDER = ['FR', 'ES', 'US', 'MX'];
const SELECTIONS = { deals: 'Deals', rare: 'Hard to find' };
const MODES = { purchase: 'Direct purchase', quote: 'Quote or reservation' };
const LEADS = {
  deals: 'Advantageous prices from sellers around the world, with delivery shown separately.',
  rare: 'Products that are hard to find in your country, offered by sellers around the world.'
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/* Photographs that show a maker's mark (the dial of the watch too): never first in a list, never the art of a page. */
const LOGO = new Set([...BRANDED, 'watch']);
/* Visuals generated for the prototype (the car and the house) are illustrations, not photographs. */
const GENERATED = new Set(CREDITS.filter((c) => c.kind === 'generated-illustration').map((c) => c.key));

/* The data now carries US English, except two image descriptions of art.js ("charcoal grey", "timber house"): they are
 * corrected here until the source is. "Hardback" (data.js name and spec, art.js description) is left as it is on purpose:
 * renamed here only, the same offer would carry another name in the toast, the header panels, the cart and the orders. */
const US_ALT = [[/\bgrey\b/gi, 'gray'], [/\btimber house\b/gi, 'wood house']];
const usAlt = (text) => US_ALT.reduce((t, [re, to]) => t.replace(re, (w) => (w[0] === w[0].toUpperCase() ? `${to[0].toUpperCase()}${to.slice(1)}` : to)), String(text ?? ''));
/** Name of a department or category. */
const catName = (n) => label(n?.name);

const dest = () => countryIn(state.country);
/** "France", "Spain", "the United States", "Mexico". */
const place = (code) => countryIn(code).replace(/^to /, '');
const listPlaces = (codes = []) => {
  const names = COUNTRY_ORDER.filter((c) => codes.includes(c)).map(place);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] || '';
};
const offersText = (n) => (n ? plural(n, 'offer', 'offers') : 'No offer');
const shortName = (d) => catName(d).split(/,| and /)[0].trim();
const sellerKind = (v) => (v?.type === 'individual' ? 'Individual · KYC verification, simulated' : 'Business · KYB verification, simulated');
const count = (n, one = 'offer', many = 'offers') => `<span class="shop-n" aria-hidden="true">${n}</span><span class="sr-only">, ${esc(plural(n, one, many))}</span>`;
/** Other listings of the very same product: same photograph, same name and same department (a seller's own new offer may reuse a photograph). */
const twins = (p) => sameModel(p).filter((o) => o.category === p.category && normalize(label(o.name)) === normalize(label(p.name)));
const mainKey = (id) => departmentArt(id).keys[0];
const deptThumb = (id, cls = 'thumb--s') => `<span class="thumb ${cls}" aria-hidden="true">${cutImg(mainKey(id), { small: true })}</span>`;
const canon = (hash) => {
  const [path, query = ''] = String(hash).replace(/^#/, '').split('?');
  return `${path}?${new URLSearchParams(query).toString()}`;
};

/** Department composition on a studio stage (the cut-outs of the home department cards). */
const deptStage = (id, sizes) => `<span class="shop-stage shop-stage--dept">${departmentArt(id, { large: true, sizes }).html}</span>`;

/** The 15 departments as a row of studio thumbnails: the index of the categories page, and a way out of an empty search. */
const deptStrip = (href, navLabel, attrs = '') => `<nav class="shop-index" aria-label="${esc(navLabel)}"${attrs}>
  <ul role="list">${categories.map((d) => `<li><a href="${href(d)}">${deptThumb(d.id, 'thumb--l')}<span class="shop-index-name" aria-hidden="true">${esc(shortName(d))}</span><span class="sr-only">${esc(catName(d))}</span></a></li>`).join('')}</ul>
</nav>`;

/** The shared offer card; only the US spelling of two image descriptions is corrected here (see US_ALT). */
const card = (p, opts) => offerCard(p, opts).replace(/ alt="([^"]*)"/g, (m, alt) => ` alt="${usAlt(alt)}"`);

/**
 * Order that spreads identical products: the first offer of every product, then the second ones;
 * cut-outs first, photographs with a visible brand mark after them, full photographs last.
 */
function varietyRank() {
  const first = new Map();
  const seen = new Map();
  const rank = new Map();
  allProducts().forEach((p, i) => {
    const key = modelKey(p);
    if (!first.has(key)) first.set(key, i);
    const round = seen.get(key) || 0;
    seen.set(key, round + 1);
    const look = cutout(key) ? (LOGO.has(key) ? 400 : 0) : 500;
    rank.set(p.id, round * 1000 + look + first.get(key));
  });
  return rank;
}

/**
 * Puts a focused control fully in view, in the filter column (which scrolls on its own) and in the window, below the
 * sticky header (html scroll-padding-top). Instant, and nothing moves when it is already in view.
 */
const showFocus = (el) => el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });

/**
 * Where a page opens after a navigation. The app puts the window at the top, but the ScrollTrigger refresh that the
 * motion runs in the next frame can put it back at a stale position (GSAP's scroll cache): the bottom of a shorter
 * page, or the top when the catalog should open where a filter was used. `place` runs after that refresh, in the same
 * frame, before anything is painted; by default it puts the window at the top. Local until js/ui/motion.js keeps the
 * scroll position across its refresh.
 */
function openAt(main, place = () => false) {
  const title = main.querySelector('h1');
  queueMicrotask(() => requestAnimationFrame(() => {
    if (!title?.isConnected || place()) return;
    if (window.scrollY) window.scrollTo({ top: 0, behavior: 'instant' });
  }));
}

/** A view with no behavior of its own still opens at the top after a navigation (see openAt). */
const opensAtTop = (view, ctx) => ({
  ...view,
  mount(main) {
    if (ctx.reason === 'route') openAt(main);
    return () => {};
  }
});

/** Moves focus to a sensible place when a re-render removed the focused control. */
function rescueFocus(main, pick) {
  requestAnimationFrame(() => {
    if (document.activeElement && document.activeElement !== document.body) return;
    (pick() || main.querySelector('h1'))?.focus({ preventScroll: true });
  });
}

function bindDestination(main) {
  const onClick = (event) => {
    const button = event.target.closest('[data-shop-dest]');
    if (button) openPanel('dest', button);
  };
  main.addEventListener('click', onClick);
  return () => main.removeEventListener('click', onClick);
}

const destButton = (text = 'Change the delivery country', cls = 'btn btn--secondary') => `<button class="${cls}" type="button" data-shop-dest id="shop-dest" aria-expanded="false" aria-controls="panel-dest">${cls.split(' ').includes('btn') ? icon('globe') : ''}<span>${esc(text)}</span></button>`;

/* ---------- Search ---------- */

const words = (text) => normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
/** Singular of a plural word, enough for this catalog: "watches" → "watch", "shoes" → "shoe", "accessories" → "accessory". */
const stem = (t) => {
  if (t.length <= 3 || /(ss|us|is)$/.test(t)) return t;
  if (/(x|z|ch|sh|ss)es$/.test(t)) return t.slice(0, -2);
  if (/ies$/.test(t)) return `${t.slice(0, -3)}y`;
  return t.endsWith('s') ? t.slice(0, -1) : t;
};

function haystack(p) {
  const v = vendor(p.vendorId);
  const cats = [...new Set([p.category, ...(p.path || [])])].map((id) => findCategory(id)).filter(Boolean)
    .map(({ node, path }) => ({ words: words(`${label(node.name)} ${catName(node)}`), depth: path.length }));
  return {
    name: words(label(p.name)),
    seller: words([vendorName(v), countryName(v?.country)].join(' ')),
    cats,
    alt: words(`${altText(p)} ${usAlt(altText(p))}`),
    full: normalize(label(p.name))
  };
}

/**
 * Score of an offer for a query: every word must match its name, seller, seller country, one of its categories
 * (the more specific the category, the higher) or, as a whole word, its image description.
 */
function searchScore(p, q) {
  const tokens = words(q);
  if (!tokens.length) return 0;
  const h = haystack(p);
  const same = (w, t) => w === t || stem(w) === stem(t);
  const begins = (w, t, min) => t.length >= min && w.startsWith(t);
  let score = 0;
  for (const t of tokens) {
    const name = h.name.some((w) => same(w, t)) ? 4 : h.name.some((w) => begins(w, t, 3)) ? 3 : 0;
    const cat = Math.max(0, ...h.cats.map((c) => (c.words.some((w) => same(w, t) || begins(w, t, 4)) ? 0.8 + 0.4 * c.depth : 0)));
    const seller = h.seller.some((w) => same(w, t) || begins(w, t, 4)) ? 1.5 : 0;
    const alt = h.alt.some((w) => same(w, t)) ? 1 : 0;
    const s = Math.max(name, cat, seller, alt);
    if (!s) return 0;
    score += s;
  }
  return score + (h.full.includes(normalize(q)) ? 3 : 0);
}

/* ---------- Catalog ---------- */

function readFilters(params) {
  const f = {};
  const q = (params.get('q') || '').trim().slice(0, 150);
  if (q) f.q = q;
  const category = (params.get('category') || '').trim();
  if (category) f.category = category;
  const collection = params.get('collection');
  if (Object.hasOwn(SELECTIONS, collection || '')) f.collection = collection;
  const origin = (params.get('origin') || '').toUpperCase();
  if (countries.some((c) => c.code === origin)) f.origin = origin;
  const mode = params.get('mode');
  if (Object.hasOwn(MODES, mode || '')) f.mode = mode;
  const max = Number(params.get('max'));
  if (params.get('max') && Number.isFinite(max) && max > 0) f.max = Math.round(max * 100) / 100;
  if (params.get('stock') === '1') f.stock = '1';
  const sort = params.get('sort');
  if (sort && SORTS.some(([v]) => v === sort)) f.sort = sort;
  return f;
}

const TESTS = {
  q: (p, g, scores) => (scores.get(p.id) || 0) > 0,
  category: (p, g) => inCategory(p, g.category),
  collection: (p, g) => inCollection(p, g.collection),
  origin: (p, g) => vendor(p.vendorId)?.country === g.origin,
  mode: (p, g) => p.mode === g.mode,
  max: (p, g) => p.price <= g.max,
  stock: (p) => stock(p) > 0
};
const matches = (p, g, scores) => Object.keys(TESTS).every((k) => g[k] === undefined || g[k] === '' || TESTS[k](p, g, scores));

/** Catalog link with every filter kept, in a stable order, so that the same filters always give the same address. */
function hrefWith(f, patch = {}) {
  const next = { ...f, ...patch };
  return catalogHref(Object.fromEntries(KEYS.filter((k) => next[k] !== undefined && next[k] !== '' && next[k] !== null).map((k) => [k, next[k]])));
}

/**
 * `pictured`: products already shown in the page's banner, placed after the other products.
 * Relevance puts the offers with example stock first (quote offers have stock), then the best matches.
 */
function sortOffers(list, f, scores, pictured = new Set()) {
  const rank = varietyRank();
  const r = (p) => rank.get(p.id) + (pictured.has(modelKey(p)) ? 300 : 0);
  const relevance = (a, b) => Number(stock(b) > 0) - Number(stock(a) > 0) || (scores.get(b.id) || 0) - (scores.get(a.id) || 0) || r(a) - r(b);
  const compare = {
    'price-asc': (a, b) => a.price - b.price || relevance(a, b),
    'price-desc': (a, b) => b.price - a.price || relevance(a, b),
    name: (a, b) => label(a.name).localeCompare(label(b.name), 'en') || a.price - b.price
  }[f.sort] || relevance;
  return [...list].sort(compare);
}

/**
 * Art of a category page, built only from the offers the page lists (filters applied): the department composition of
 * the home card when every object in it is listed, otherwise one cut-out of the listed offers, otherwise no art at all.
 */
function bannerArt(deptId, listed) {
  const sizes = '(max-width: 900px) 60vw, 360px';
  const inList = new Set(listed.map(modelKey));
  const avoid = new Set(allProducts().map(modelKey).filter((k) => !inList.has(k)));
  const art = departmentArt(deptId, { large: true, avoid, sizes });
  if (art.keys.length && art.keys.every((k) => inList.has(k))) return art;
  const rank = varietyRank();
  const key = [...listed].sort((a, b) => Number(stock(b) > 0) - Number(stock(a) > 0) || rank.get(a.id) - rank.get(b.id)).map(modelKey).find((k) => cutout(k) && !LOGO.has(k));
  if (!key) return null;
  const c = cutout(key);
  const h = Math.min(66, (80 * c.h) / c.w);
  return { html: `<span class="obj" style="--h:${h.toFixed(1)}%;--x:50%;--z:2">${cutImg(key, { sizes })}</span>`, keys: [key] };
}

const filterLabel = (k, f) => ({
  q: () => `Search: “${f.q}”`,
  category: () => catName(findCategory(f.category)?.node),
  collection: () => SELECTIONS[f.collection],
  origin: () => `Seller ${countryIn(f.origin).replace(/^to /, 'in ')}`,
  mode: () => MODES[f.mode],
  max: () => `Product price up to ${money(f.max)}`,
  stock: () => 'In stock only'
}[k]());

/** One option of a facet: a link with its count, or a plain line when nothing would match (departments stay links). */
function optionEl({ href, text, n, current, key, cls = '', keepZero = false }) {
  const inner = `<span class="shop-opt-text">${esc(text)}</span>${count(n)}`;
  if (!n && !current && !keepZero) return `<span class="shop-opt is-off${cls}">${inner}</span>`;
  return `<a class="shop-opt${cls}${n ? '' : ' is-empty'}" href="${href}"${current ? ' aria-current="true"' : ''} data-keep="${esc(key)}">${inner}</a>`;
}
const option = (o) => `<li>${optionEl(o)}</li>`;

function departmentFacet(f, node, path, n) {
  const item = (c, current, cls = '') => optionEl({ href: hrefWith(f, { category: c.id }), text: catName(c), n: n(c.id), current, key: `dept:${c.id}`, cls, keepZero: true });
  const back = (target) => `<li><a class="shop-back" href="${hrefWith(f, { category: target?.id || '' })}" data-keep="dept:${esc(target?.id || '')}" data-from="dept:${esc(path[target ? path.indexOf(target) + 1 : 0]?.id || '')}">${icon('caretLeft')}<span>${esc(target ? catName(target) : 'All departments')}</span></a></li>`;
  const branch = (head, current, children, isCurrent) => `<li>${item(head, current, ' shop-opt--head')}
    <ul class="shop-sub" role="list">${children.map((c) => `<li>${item(c, isCurrent(c))}</li>`).join('')}</ul></li>`;
  let html;
  if (!node) {
    /* Departments without a match are folded away when there are several of them, so the facets that matter stay in view. */
    const none = categories.filter((d) => !n(d.id));
    const folded = new Set(none.length >= 3 ? none : []);
    html = categories.filter((d) => !folded.has(d)).map((d) => `<li>${item(d, false)}</li>`).join('');
    if (folded.size) {
      html += `<li class="shop-fold"><details>
        <summary>${icon('caretDown')}<span>${esc(`Departments without a match (${folded.size})`)}</span></summary>
        <ul class="shop-opts" role="list">${[...folded].map((d) => `<li><a class="shop-opt is-empty" href="${hrefWith(f, { category: d.id })}" data-keep="dept:${esc(d.id)}"><span class="shop-opt-text">${esc(catName(d))}</span><span class="sr-only">, ${esc('no offer')}</span></a></li>`).join('')}</ul>
      </details></li>`;
    }
  } else if (node.children?.length) {
    html = `${back(path[path.length - 2] || null)}${branch(node, true, node.children, () => false)}`;
  } else {
    const parent = path[path.length - 2] || null;
    html = parent
      ? `${back(path[path.length - 3] || null)}${branch(parent, false, parent.children, (c) => c.id === node.id)}`
      : `${back(null)}<li>${item(node, true, ' shop-opt--head')}</li>`;
  }
  return `<div class="shop-facet"><h3 id="facet-dept">${esc('Department')}</h3><ul class="shop-opts" role="list" aria-labelledby="facet-dept">${html}</ul></div>`;
}

function listFacet(id, title, entries) {
  return `<div class="shop-facet"><h3 id="facet-${id}">${esc(title)}</h3><ul class="shop-opts" role="list" aria-labelledby="facet-${id}">${entries.join('')}</ul></div>`;
}

function filtersHtml(f, node, path, run, shown) {
  const n = (patch) => run({ ...f, ...patch }).length;
  const selection = [['', 'All'], ['deals', 'Deals'], ['rare', 'Hard to find']]
    .map(([v, text]) => option({ href: hrefWith(f, { collection: v }), text, n: n({ collection: v }), current: (f.collection || '') === v, key: `collection:${v}` }));
  const origin = [['', 'All'], ...COUNTRY_ORDER.map((c) => [c, countryName(c)])]
    .map(([v, text]) => option({ href: hrefWith(f, { origin: v }), text, n: n({ origin: v }), current: (f.origin || '') === v, key: `origin:${v}` }));
  const mode = [['', 'All'], ['purchase', MODES.purchase], ['quote', MODES.quote]]
    .map(([v, text]) => option({ href: hrefWith(f, { mode: v }), text, n: n({ mode: v }), current: (f.mode || '') === v, key: `mode:${v}` }));
  const max = f.max === undefined ? '' : String(f.max);
  const skip = !shown ? 'Skip to the results' : shown === 1 ? 'Skip to the offer' : `Skip to the ${shown} offers`;
  return `<aside class="shop-filters" aria-labelledby="shop-filters-title" data-shop-filters>
    <a class="shop-skip" href="#shop-results">${esc(skip)}</a>
    <h2 class="sr-only" id="shop-filters-title">${esc('Filters')}</h2>
    ${departmentFacet(f, node, path, (id) => n({ category: id }))}
    ${listFacet('selection', 'Selection', selection)}
    ${listFacet('origin', 'Seller country', origin)}
    ${listFacet('mode', 'Purchase type', mode)}
    <form class="shop-facet shop-price-form" data-form="price-filter" novalidate aria-labelledby="facet-price">
      <h3 id="facet-price">${esc('Price and stock')}</h3>
      <div class="field">
        <label for="shop-max">${esc('Maximum product price')}<span class="sr-only"> ${esc('in euros')}</span></label>
        <div class="shop-money"><span aria-hidden="true">€</span><input class="input" id="shop-max" name="max" type="number" inputmode="decimal" min="1" step="any" autocomplete="off" value="${esc(max)}" aria-describedby="shop-max-help"></div>
        <p class="help" id="shop-max-help">${esc('Delivery is shown separately')}</p>
        <p class="shop-field-error" id="shop-max-error" role="alert" hidden></p>
      </div>
      ${check({ name: 'stock', value: '1', text: esc('In stock only'), checked: Boolean(f.stock) })}
      <button class="btn btn--secondary btn--small" type="submit" id="shop-apply">${esc('Apply')}<span class="sr-only"> ${esc('the price and stock filters')}</span></button>
    </form>
  </aside>`;
}

function resultsBar(f, refinements, scopeKey) {
  const pills = refinements.map((k, i) => `<li><a class="shop-pill" href="${hrefWith(f, { [k]: '' })}" data-pill="${i}"><span class="sr-only">${esc('Remove the filter')} </span>${esc(filterLabel(k, f))}${icon('close')}</a></li>`).join('');
  const keep = { [scopeKey]: f[scopeKey], sort: f.sort };
  return `<div class="shop-bar">
    <div class="shop-bar-row">
      <p class="shop-note">${icon('squares')}<span>${esc('One listing per seller · new products only')}</span>${demoTag('Demonstration catalog')}</p>
      <div class="shop-sort"><label for="shop-sort">${esc('Sort by')}</label>
        <select class="select" id="shop-sort" name="sort">${SORTS.map(([v, text]) => `<option value="${v}"${(f.sort || '') === v ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></div>
    </div>
    ${refinements.length ? `<div class="shop-refine" role="group" aria-label="${esc('Active filters')}">
      <ul class="shop-pills" role="list">${pills}</ul>
      <a class="link-btn shop-clear" href="${hrefWith({}, keep)}" data-keep="clear">${esc('Clear filters')}</a>
    </div>` : ''}
  </div>`;
}

/** "Or browse a department", under an empty search or an unknown category. */
const browseDepartments = (title) => `<section class="shop-browse" aria-labelledby="shop-browse-title">
  <h2 class="title-s" id="shop-browse-title">${esc(title)}</h2>
  ${deptStrip((d) => catalogHref({ category: d.id }), 'Departments')}
</section>`;

/** Honest empty states: an empty department, a search without results, filters that exclude everything. */
function emptyResults({ f, scopeKey, node, path, total, refinements }) {
  const elsewhere = (test) => COUNTRY_ORDER.filter((c) => c !== state.country && allProducts().some((p) => publicOffer(p) && deliverable(p, c) && test(p)));
  if (total && refinements.length) {
    return `<div class="empty shop-empty">${icon('sliders', 'empty-icon')}
      <h2 class="title-s">${esc('No offer matches these filters')}</h2>
      <p>${esc(`${total === 1 ? 'These filters exclude the only offer here.' : `These filters exclude all ${plural(total, 'offer', 'offers')}.`} Remove a filter above, or clear them all.`)}</p>
      <div class="empty-actions"><a class="btn btn--primary" href="${hrefWith({}, { [scopeKey]: f[scopeKey], sort: f.sort })}" data-keep="clear">${esc('Clear filters')}</a></div>
    </div>`;
  }
  if (scopeKey === 'category') {
    const other = elsewhere((p) => inCategory(p, node.id));
    const parent = path[path.length - 2] || null;
    const name = catName(node);
    const subs = node.children?.length
      ? `<div class="shop-empty-subs"><p class="shop-empty-label" id="shop-subs-title">${esc('Categories')}</p>
        <ul class="shop-links" role="list" aria-labelledby="shop-subs-title">${node.children.map((c) => `<li><a class="more" href="${catalogHref({ category: c.id })}">${esc(catName(c))}</a></li>`).join('')}</ul></div>`
      : '';
    const text = other.length
      ? `In this demonstration, the example offers of ${name} deliver to ${listPlaces(other)}.`
      : `No example seller offers anything in ${name} yet.${subs ? ' Browse its categories below.' : ''}`;
    return `<div class="empty shop-empty">${icon('package', 'empty-icon')}
      <h2 class="title-s">${esc(other.length ? `No example offer delivering ${dest()} yet` : 'No example offer yet')}</h2>
      <p>${esc(text)}</p>
      ${subs}
      <div class="empty-actions">
        ${parent ? `<a class="btn btn--primary" href="${catalogHref({ category: parent.id })}">${icon('arrowLeft')}${esc(`Back to ${catName(parent)}`)}</a>` : ''}
        <a class="btn btn--secondary" href="#/categories">${esc('All departments')}</a>
        ${other.length ? destButton() : ''}
      </div>
    </div>`;
  }
  if (scopeKey === 'q') {
    const other = elsewhere((p) => searchScore(p, f.q) > 0);
    return `<div class="empty shop-empty">${icon('search', 'empty-icon')}
      <h2 class="title-s">${esc(other.length ? `No offer matching “${f.q}” delivers ${dest()}` : `No offer matches “${f.q}”`)}</h2>
      <p>${esc(other.length
        ? `Matching example offers deliver to ${listPlaces(other)}.`
        : 'Check the spelling or try a more general word. The search covers offer names, sellers, seller countries and categories.')}</p>
      <div class="empty-actions">
        <a class="btn btn--primary" href="#/catalog">${esc('See all offers')}</a>
        ${other.length ? destButton() : ''}
      </div>
    </div>
    ${browseDepartments('Or browse a department')}`;
  }
  return `<div class="empty shop-empty">${icon('package', 'empty-icon')}
    <h2 class="title-s">${esc(f.collection ? `No offer from this selection delivers ${dest()} for now` : `No offer delivers ${dest()} for now`)}</h2>
    <p>${esc('Sellers choose the countries they deliver to. Another destination may show more example offers.')}</p>
    <div class="empty-actions">${destButton('Change the delivery country', 'btn btn--primary')}<a class="btn btn--secondary" href="#/categories">${esc('All departments')}</a></div>
  </div>`;
}

function unknownCategory(f) {
  return {
    title: 'Category not found · DutyFreeDeal',
    html: `<div class="page wrap shop-catalog">
      ${pageHead({
        crumbs: [['Home', '#/'], ['All departments', '#/categories'], ['Category not found', '']],
        title: esc('This category does not exist'),
        lead: esc(`No department or category of the demonstration catalog is called “${f.category}”.`),
        meta: demoTag('Demonstration catalog')
      })}
      ${browseDepartments('Browse a department')}
    </div>`
  };
}

/* Focus kept on the filter that was used, across the navigation it triggers. */
let pending = null;

function catalog(ctx) {
  const f = readFilters(ctx.params);
  const found = f.category ? findCategory(f.category) : null;
  if (f.category && !found) return opensAtTop(unknownCategory(f), ctx);
  const node = found?.node || null;
  const path = found?.path || [];
  const base = shopOffers();
  const scores = new Map();
  if (f.q) base.forEach((p) => scores.set(p.id, searchScore(p, f.q)));
  const run = (g) => base.filter((p) => matches(p, g, scores));
  const scopeKey = f.q ? 'q' : f.category ? 'category' : f.collection ? 'collection' : '';
  const scope = scopeKey ? run({ [scopeKey]: f[scopeKey] }) : base;
  /* The banner pictures only offers listed below, with the filters applied; none listed, no art. */
  const listed = run(f);
  const banner = scopeKey === 'category' && listed.length ? bannerArt(path[0].id, listed) : null;
  const results = sortOffers(listed, f, scores, new Set(banner?.keys || []));
  const refinements = KEYS.filter((k) => k !== 'sort' && k !== scopeKey && f[k] !== undefined);

  const title = f.q ? `Results for “${f.q}”` : node ? catName(node) : f.collection ? SELECTIONS[f.collection] : 'All offers';
  const crumbs = [['Home', '#/']];
  if (node) {
    crumbs.push(['All departments', '#/categories']);
    path.forEach((n) => crumbs.push([catName(n), catalogHref({ category: n.id })]));
  }
  if (scopeKey === 'q') crumbs.push(['Search results', '']);
  else if (scopeKey === 'collection') crumbs.push([SELECTIONS[f.collection], '']);
  else if (!node) crumbs.push(['All offers', '']);
  const lead = scopeKey === 'collection' ? LEADS[f.collection] : '';
  const art = banner ? `<div class="shop-head-art" aria-hidden="true"><span class="shop-stage shop-stage--dept">${banner.html}</span></div>` : '';
  /* The large gray line counts what the page shows; with no offer at all, the empty state below says so once. */
  const parent = path[path.length - 2] || null;
  const soft = scope.length
    ? (refinements.length ? `${results.length} of ${plural(scope.length, 'offer', 'offers')} delivering ${dest()}` : `${offersText(scope.length)} delivering ${dest()}`)
    : scopeKey === 'category' && parent ? `in ${catName(parent)}` : '';
  const status = scope.length ? soft : `No offer delivering ${dest()}`;

  const html = `<div class="page wrap shop-catalog">
    <header class="page-head shop-head">
      ${breadcrumb(crumbs)}
      <div class="shop-head-row${art ? ' shop-banner' : ''}">
        <div class="shop-head-text">
          <h1 class="title-l" tabindex="-1">${esc(title)}</h1>
          ${soft ? `<p class="title-l soft shop-head-count">${esc(soft)}</p>` : ''}
          ${scope.length ? '' : `<p class="page-meta">${demoTag('Demonstration catalog')}</p>`}
        </div>
        ${lead ? `<p class="lead shop-head-lead">${esc(lead)}</p>` : ''}
        ${art}
      </div>
    </header>
    ${scope.length ? `<div class="shop-layout">
      ${filtersHtml(f, node, path, run, results.length)}
      <section class="shop-results" id="shop-results" aria-labelledby="shop-results-title">
        <h2 class="sr-only" id="shop-results-title">${esc('Offers')}</h2>
        ${resultsBar(f, refinements, scopeKey)}
        ${results.length
          ? `<ul class="offers offers--3" role="list">${results.map((p) => card(p)).join('')}</ul>`
          : emptyResults({ f, scopeKey, node, path, total: scope.length, refinements })}
      </section>
    </div>` : emptyResults({ f, scopeKey, node, path, total: 0, refinements })}
  </div>`;

  return {
    title: `${title} · DutyFreeDeal`,
    html,
    mount(main) {
      const aside = main.querySelector('[data-shop-filters]');
      const keepFocus = (href, selector, extra = {}) => {
        if (canon(href) === canon(location.hash)) {
          pending = null;
          return;
        }
        pending = { hash: canon(href), selector, scroll: aside?.scrollTop || 0, top: window.scrollY, ...extra };
      };

      /* After a filter used in the page, the window goes back to where it was, but no lower than the point where the filter
       * column sticks (the new results then start at the top and the column stays in place), and the filter takes the
       * focus, fully in view. Every scroll is instant, so nothing can cancel it halfway. */
      const placeFocus = ({ selector, index, top }) => {
        let target = null;
        for (const s of [].concat(selector || [])) {
          target = main.querySelector(s);
          if (target) break;
        }
        if (index !== undefined) {
          const pillsLeft = [...main.querySelectorAll('[data-pill]')];
          target = pillsLeft[Math.min(index, pillsLeft.length - 1)] || null;
        }
        target = target || main.querySelector('#shop-sort');
        if (!target) return false;
        let y = top || 0;
        const column = aside && getComputedStyle(aside);
        if (column?.position === 'sticky') {
          const natural = aside.parentElement.getBoundingClientRect().top + window.scrollY + (parseFloat(column.marginTop) || 0);
          y = Math.min(y, natural - (parseFloat(column.top) || 0));
        }
        window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
        target.focus({ preventScroll: true });
        showFocus(target);
        return true;
      };
      if (ctx.reason === 'route') {
        const kept = pending && pending.hash === canon(location.hash) ? pending : null;
        if (kept && aside) aside.scrollTop = kept.scroll;
        openAt(main, () => Boolean(kept) && placeFocus(kept));
        if (kept) ctx.announce(status);
      }
      pending = null;

      const fitColumn = () => {
        if (!aside) return;
        const more = aside.scrollHeight - aside.clientHeight - aside.scrollTop > 2;
        aside.toggleAttribute('data-more', more);
      };
      const onClick = (event) => {
        const link = event.target.closest('a[href]');
        if (!link || !main.contains(link)) return;
        const href = link.getAttribute('href');
        if (link.hasAttribute('data-pill')) keepFocus(href, null, { index: Number(link.dataset.pill) });
        else if (link.dataset.keep === 'clear') keepFocus(href, '#shop-sort');
        else if (link.dataset.keep) {
          const key = link.dataset.keep;
          const exact = `[data-keep="${CSS.escape(key)}"]`;
          const from = link.dataset.from ? `[data-keep="${CSS.escape(link.dataset.from)}"]` : null;
          keepFocus(href, key.startsWith('dept:') ? [from, exact, '#facet-dept + ul a.shop-opt'].filter(Boolean) : exact);
        }
      };
      const onChange = (event) => {
        if (event.target.id !== 'shop-sort') return;
        const href = hrefWith(f, { sort: event.target.value });
        keepFocus(href, '#shop-sort');
        ctx.go(href);
      };
      const onSubmit = (event) => {
        const form = event.target.closest('form[data-form="price-filter"]');
        if (!form) return;
        event.preventDefault();
        const input = form.elements.max;
        const error = form.querySelector('#shop-max-error');
        const raw = input.value.trim();
        const value = Number(raw);
        let message = '';
        if (input.validity.badInput) message = 'Enter an amount in euros, for example 50.';
        else if (raw && (!Number.isFinite(value) || value <= 0)) message = 'Enter an amount greater than zero, in euros.';
        if (message) {
          error.innerHTML = `${icon('warning')}<span>${esc(message)}</span>`;
          error.hidden = false;
          input.setAttribute('aria-invalid', 'true');
          input.setAttribute('aria-describedby', 'shop-max-error shop-max-help');
          input.focus();
          return;
        }
        const href = hrefWith(f, { max: raw ? Math.round(value * 100) / 100 : '', stock: form.elements.stock.checked ? '1' : '' });
        /* The same filters again: nothing to reload, the count is simply confirmed. */
        if (canon(href) === canon(location.hash)) {
          ctx.announce(status);
          return;
        }
        keepFocus(href, '#shop-apply');
        ctx.go(href);
      };
      const onInput = (event) => {
        if (event.target.id !== 'shop-max') return;
        const error = main.querySelector('#shop-max-error');
        if (error && !error.hidden) {
          error.hidden = true;
          error.textContent = '';
          event.target.removeAttribute('aria-invalid');
          event.target.setAttribute('aria-describedby', 'shop-max-help');
        }
      };
      main.addEventListener('click', onClick);
      main.addEventListener('change', onChange);
      main.addEventListener('submit', onSubmit);
      main.addEventListener('input', onInput);
      aside?.addEventListener('scroll', fitColumn, { passive: true });
      window.addEventListener('resize', fitColumn);
      fitColumn();
      if (document.fonts?.ready) document.fonts.ready.then(fitColumn);
      const unbindDest = bindDestination(main);
      if (ctx.reason === 'state') rescueFocus(main, () => main.querySelector('#shop-sort'));
      return () => {
        main.removeEventListener('click', onClick);
        main.removeEventListener('change', onChange);
        main.removeEventListener('submit', onSubmit);
        main.removeEventListener('input', onInput);
        aside?.removeEventListener('scroll', fitColumn);
        window.removeEventListener('resize', fitColumn);
        unbindDest();
      };
    }
  };
}

/* ---------- All departments: the full tree ---------- */

function categoriesView(ctx) {
  const offers = shopOffers();
  const n = (id) => offers.filter((p) => inCategory(p, id)).length;
  const anywhere = (id) => allProducts().some((p) => publicOffer(p) && inCategory(p, id));
  const total = categories.reduce((sum, c) => sum + countNodes(c), 0);
  const leafLink = (c) => {
    const k = n(c.id);
    return `<a class="${k ? 'has-offers' : ''}" href="${catalogHref({ category: c.id })}">${esc(catName(c))}${k ? ` ${count(k, 'example offer', 'example offers')}` : ''}</a>`;
  };
  const index = deptStrip((d) => `#dept-${esc(d.id)}`, 'Jump to a department', ' data-reveal');
  const blocks = categories.map((d) => {
    const k = n(d.id);
    const id = esc(d.id);
    const name = catName(d);
    const href = catalogHref({ category: d.id });
    const status = k ? `${plural(k, 'example offer', 'example offers')} delivering ${dest()}`
      : anywhere(d.id) ? `No example offer delivering ${dest()} yet` : 'No example offer yet';
    const groups = d.children || [];
    const cols = Math.min(Math.max(groups.length, 2), 5);
    const tree = groups.map((s) => `<div class="shop-tree-group">
        <h3>${leafLink(s)}</h3>
        ${s.children?.length ? `<ul role="list">${s.children.map((l) => `<li>${leafLink(l)}</li>`).join('')}</ul>` : ''}
      </div>`).join('');
    return `<section id="dept-${id}" aria-labelledby="dept-${id}-name"><div class="shop-dept" data-reveal>
      <a class="shop-dept-art" href="${href}" tabindex="-1" aria-hidden="true">${deptStage(d.id, '(max-width: 900px) 80vw, 300px')}</a>
      <div class="shop-dept-body">
        <div class="shop-dept-head">
          <div>
            <h2 class="title-m" id="dept-${id}-name"><a href="${href}">${esc(name)}</a></h2>
            <p class="shop-dept-meta"><span>${esc(status)}</span><span aria-hidden="true"> · </span><span>${esc(plural(countNodes(d), 'category', 'categories'))}</span></p>
          </div>
          ${k ? `<a class="more" href="${href}">${esc(k === 1 ? 'See the offer' : `See the ${k} offers`)}<span class="sr-only"> ${esc(`in ${name}`)}</span>${icon('arrow')}</a>` : ''}
        </div>
        <div class="shop-tree" style="--cols:${cols}">${tree}</div>
      </div>
    </div></section>`;
  }).join('');
  return {
    title: 'All departments · DutyFreeDeal',
    surface: 'dark',
    html: `<div class="page wrap shop-tree-page">
      <header class="page-head shop-head">
        ${breadcrumb([['Home', '#/'], ['All departments', '']])}
        <div class="shop-head-row">
          <div class="shop-head-text">
            <h1 class="title-l" tabindex="-1">${esc('All departments')}</h1>
            <p class="title-l soft shop-head-count">${esc(`${offersText(offers.length)} delivering ${dest()}`)}</p>
          </div>
          <div class="shop-head-lead">
            <p class="lead">${esc(`${categories.length} departments and ${total} categories, from fragrances to prefabricated houses. Each department covers its main goods and their accessories.`)}</p>
            <p class="page-meta">${demoTag('Demonstration catalog')}</p>
          </div>
        </div>
      </header>
      ${index}
      <div class="shop-depts">${blocks}</div>
    </div>`,
    mount(main) {
      if (ctx.reason === 'state') rescueFocus(main, () => null);
      else openAt(main);
      return () => {};
    }
  };
}

/* ---------- Offer page ---------- */

/**
 * Four other offers delivering to the destination: the department's first, one per product, then, when the department
 * has fewer, offers of the same selection and the rest of the catalog.
 */
function moreOffers(p) {
  const rank = varietyRank();
  const order = (a, b) => Number(available(b)) - Number(available(a)) || rank.get(a.id) - rank.get(b.id);
  const pool = shopOffers().filter((o) => o.id !== p.id && modelKey(o) !== modelKey(p));
  const list = [];
  const take = (offers) => {
    for (const o of [...offers].sort(order)) {
      if (list.length === 4) return;
      if (!list.some((x) => modelKey(x) === modelKey(o))) list.push(o);
    }
  };
  take(pool.filter((o) => o.category === p.category));
  const inDept = list.length;
  const sel = deliverable(p) ? Object.keys(SELECTIONS).filter((c) => inCollection(p, c)) : [];
  take(pool.filter((o) => o.category !== p.category && sel.some((c) => inCollection(o, c))));
  take(pool.filter((o) => o.category !== p.category));
  return { list, inDept };
}

function unavailable(p, id) {
  const others = p ? twins(p).filter((o) => publicOffer(o) && deliverable(o)) : [];
  const why = !p ? '' : isHidden(p) ? 'It is hidden by moderation in the back office of this demonstration.'
    : vendorState(p.vendorId) === 'paused' ? 'Its seller is suspended in the back office of this demonstration.' : '';
  const html = `<div class="page wrap shop-gone">
    ${pageHead({
      crumbs: [['Home', '#/'], ['All departments', '#/categories'], ['Offer unavailable', '']],
      title: esc('This offer is unavailable'),
      lead: esc(p
        ? `This listing, ${label(p.name)} from ${vendorName(vendor(p.vendorId))}, is not shown in the shop right now. ${why}`.trim()
        : `No offer of the demonstration catalog matches the address “${id || ''}”. It may be incomplete.`),
      actions: `<a class="btn btn--primary" href="#/catalog">${esc('See all offers')}</a><a class="btn btn--secondary" href="#/categories">${esc('All departments')}</a>`
    })}
    ${others.length ? `<section class="section shop-section" aria-labelledby="shop-gone-title">
      <div class="section-head"><div>
        <h2 class="title-m" id="shop-gone-title">${esc('The same product from other sellers')}</h2>
        <p class="lead">${esc(`One listing per seller: ${plural(others.length, 'other seller offers', 'other sellers offer')} this product delivering ${dest()}.`)}</p>
      </div></div>
      <ul class="offers offers--grid" role="list">${others.map((o) => card(o)).join('')}</ul>
    </section>` : ''}
  </div>`;
  return { title: 'Offer unavailable · DutyFreeDeal', html };
}

/** `hasMore`: the page shows "More in this department" (#shop-more), a way forward when the offer is out of stock. */
function buyBlock(p, near, hasMore) {
  const v = vendor(p.vendorId);
  const name = label(p.name);
  const quote = isQuote(p);
  const ships = deliverable(p);
  const units = stock(p);
  const lines = [];
  if (!ships) lines.push(`<p class="shop-line shop-line--strong">${esc(`Does not deliver ${dest()}`)}</p>`);
  else if (quote) {
    lines.push(`<p class="shop-line">${esc('Quote or reservation request, no payment')}</p>`);
    lines.push(`<p class="shop-line">${esc(label(p.delivery))}</p>`);
  } else {
    lines.push(`<p class="shop-line shop-line--strong">${esc(`+ ${money(shipping(v.id))} delivery ${dest()}`)}</p>`);
    lines.push(`<p class="shop-line">${esc(`Delivery in ${label(p.delivery)}`)}</p>`);
  }
  /* Said once: the actions below only show where to go next. */
  lines.push(units
    ? `<p class="shop-line">${esc(`Example stock: ${plural(units, 'unit', 'units')}`)}</p>`
    : `<p class="shop-line shop-line--strong">${esc('Out of stock in this demonstration')}</p>`);

  let actions;
  if (!ships) {
    const to = listPlaces(v.deliveryTo);
    actions = `${notice(esc(to
      ? `This seller does not deliver ${dest()}. In this demonstration, they deliver to ${to}.`
      : 'This seller does not deliver to any example country in this demonstration.'), 'truck')}
      <div class="shop-actions">${to ? destButton() : ''}${favButton(p)}</div>`;
  } else if (quote) {
    actions = `<div class="shop-actions">
        <button class="btn btn--primary shop-cta" type="button" id="shop-quote" data-shop-quote>${icon('fileText')}<span>${esc('Request a quote or reservation')}</span><span class="sr-only">: ${esc(`${name}, ${vendorName(v)}`)}</span></button>${favButton(p)}
      </div>
      <p class="shop-fine">${esc('No deposit, no confirmed reservation, no message sent.')}</p>`;
  } else if (available(p)) {
    const max = Math.min(units, 10);
    actions = `<form class="shop-actions" data-form="shop-buy">
        <div class="shop-qty"><label for="shop-qty">${esc('Quantity')}</label>
          <select class="select" id="shop-qty" name="qty" data-qty-for="${esc(p.id)}">${Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}</select></div>
        <button class="btn btn--primary shop-cta" type="button" id="shop-add" data-action="add" data-id="${esc(p.id)}">${icon('bag')}<span>${esc('Add to cart')}</span><span class="sr-only">: ${esc(`${name}, ${vendorName(v)}`)}</span></button>${favButton(p)}
      </form>`;
  } else {
    const next = near.length
      ? `<a class="btn btn--primary shop-cta" href="#shop-sellers" id="shop-compare">${icon('storefront')}<span>${esc(near.length === 1 ? 'Compare the other seller' : 'Compare other sellers')}</span></a>`
      : hasMore ? `<a class="btn btn--secondary shop-cta" href="#shop-more" id="shop-see-more">${esc('See more offers')}</a>` : '';
    actions = `<div class="shop-actions">${next}${favButton(p)}</div>`;
  }
  return { lines: lines.join(''), actions };
}

function assurances(p, near) {
  const quote = isQuote(p);
  const compare = near.length
    ? `${esc(`${plural(near.length, 'other seller offers', 'other sellers offer')} this product delivering ${dest()}.`)} <a href="#shop-sellers">${esc('Compare price and delivery')}</a>`
    : esc(`no other seller offers this product delivering ${dest()}.`);
  /* Without delivery to the destination there is no request to save: say when one can be made instead. */
  const items = quote
    ? [deliverable(p)
      ? ['envelope', esc('Nothing is sent and nothing is paid: the request is saved in this browser and appears in My orders.')]
      : ['truck', esc('A quote or reservation can be requested only for a country the seller delivers to.')],
    ['calendar', esc('How quotes and reservations work is still to be defined; nothing is confirmed in this demonstration.')]]
    : [['truck', esc('Shipped by the seller, who manages their own stock and ships their own orders.')],
      ['bag', esc('One cart and one payment across sellers; each seller’s delivery is shown separately.')]];
  items.push(['squares', `${esc('One listing per seller:')} ${compare}`]);
  return `<ul class="shop-assure" role="list">${items.map(([ic, text]) => `<li>${icon(ic)}<span>${text}</span></li>`).join('')}</ul>`;
}

function sellersSection(p, near, far) {
  const head = `<div class="section-head"><div>
      <h2 class="title-m" id="shop-sellers-title">${esc('The same product from other sellers')}</h2>
      <p class="lead">${esc('One listing per seller: compare price and delivery.')}</p>
    </div></div>`;
  const farText = far ? ` ${far === 1 ? 'One other example seller offers it' : `${far} other example sellers offer it`}, without delivery ${dest()}.` : '';
  if (!near.length) {
    return `<section class="section shop-section shop-sellers" id="shop-sellers" aria-labelledby="shop-sellers-title">${head}
      <p class="shop-none">${icon('storefront')}<span>${esc(`No other seller offers this product delivering ${dest()}.${farText}`)}</span></p>
    </section>`;
  }
  const rows = [p, ...near].map((o) => {
    const ov = vendor(o.vendorId);
    const seller = vendorName(ov);
    const quote = isQuote(o);
    const action = o.id === p.id
      ? chip('This listing')
      : `<span class="cell-actions"><a class="link-btn" href="${productHref(o)}">${esc('View')}<span class="sr-only"> ${esc(`the offer of ${seller}`)}</span></a>${
        quote ? `<a class="pill" href="${productHref(o)}">${esc('Request a quote')}<span class="sr-only"> ${esc(`from ${seller}`)}</span></a>`
          : available(o) ? `<button class="pill" type="button" data-action="add" data-id="${esc(o.id)}">${icon('bag')}${esc('Add')}<span class="sr-only"> ${esc(`${label(o.name)} from ${seller} to the cart`)}</span></button>`
            : `<span class="pill pill--off" aria-disabled="true">${esc(stock(o) ? 'Unavailable' : 'Out of stock')}</span>`}</span>`;
    return `<tr>
      <th scope="row"><span class="cell-main"><span><strong>${esc(seller)}</strong><span class="cell-sub">${esc(sellerKind(ov))}</span></span></span></th>
      <td>${esc(countryName(ov.country))}</td>
      <td><span class="price">${esc(quote ? moneyRound(o.price) : money(o.price))}</span>${quote ? `<span class="cell-sub">${esc('Indicative')}</span>` : ''}</td>
      <td>${!deliverable(o) ? `<span class="cell-sub">${esc('Does not deliver')}</span>`
        : quote ? `<span class="cell-sub">${esc('In the quotation')}</span>` : esc(`+ ${money(shipping(o.vendorId))}`)}</td>
      <td>${deliverable(o) ? `<span class="shop-time">${esc(label(o.delivery))}</span>`
        : `<span class="shop-time" aria-hidden="true">—</span><span class="sr-only">${esc('Not applicable')}</span>`}</td>
      <td>${action}</td>
    </tr>`;
  }).join('');
  const cols = ['Seller', 'Seller country', 'Product price', `Delivery ${dest()}`, 'Delivery time'];
  return `<section class="section shop-section shop-sellers" id="shop-sellers" aria-labelledby="shop-sellers-title">${head}
    <div class="table-wrap"><table class="table shop-compare">
      <caption class="sr-only">${esc(`Sellers offering ${label(p.name)}: product price, delivery ${dest()} and delivery time`)}</caption>
      <thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}<th scope="col"><span class="sr-only">${esc('Actions')}</span></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${far ? `<p class="shop-none shop-none--after">${icon('globe')}<span>${esc(farText.trim())}</span></p>` : ''}
  </section>`;
}

function detailsSection(p) {
  const v = vendor(p.vendorId);
  const trail = findCategory(p.path?.[p.path.length - 1] || p.category)?.path || [];
  const specs = (p.specs || []).filter((s) => label(s.name) !== 'Condition').map((s) => [label(s.name), esc(label(s.value))]);
  const rows = [
    ['Condition', esc('New only')],
    ['Purchase type', esc(isQuote(p) ? MODES.quote : MODES.purchase)],
    ...specs,
    ['Department', trail.map((n) => `<a href="${catalogHref({ category: n.id })}">${esc(catName(n))}</a>`).join('<span aria-hidden="true"> › </span>')],
    ['Seller', esc(vendorName(v))],
    ['Seller country', esc(countryName(v.country))],
    ['Seller verification', esc(sellerKind(v))],
    /* A delivery time only where the seller delivers: the same answer as the buy column. */
    deliverable(p) ? ['Delivery time', esc(label(p.delivery))] : ['Delivery', esc(`Does not deliver ${dest()}`)]
  ];
  return `<section class="section shop-section" aria-labelledby="shop-details-title">
    <div class="shop-details">
      <div>
        <h2 class="title-m" id="shop-details-title">${esc('Details')}</h2>
        <p class="shop-desc">${esc(label(p.description))}</p>
      </div>
      <dl class="shop-specs">${rows.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`).join('')}</dl>
    </div>
  </section>`;
}

/* ---------- Quote or reservation request ---------- */

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** "11/20/2026" (or 11-20-2026, 11.20.2026, 11202026) → "2026-11-20"; null when the text is not a real date in US order. */
function usDate(text) {
  const t = text.trim();
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t) || /^(\d{2})(\d{2})(\d{4})$/.exec(t);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return d.getMonth() === Number(m[1]) - 1 && d.getDate() === Number(m[2]) ? isoDay(d) : null;
}

/* Fields checked by the request form, in the order of the page, with the name used in the error summary. */
const QUOTE_FIELDS = [['desiredDate', 'Desired date'], ['name', 'Fictional full name'], ['email', 'Fictional email'], ['fictional', 'Fictional details confirmation']];
/** Summary at the top of the dialog (the same words as the sign-in page); the messages themselves sit under the fields. */
const quoteSummary = (bad) => (bad.length ? `Check ${bad.length === 1 ? 'this field' : 'these fields'}: ${bad.map(([, n]) => n).join(', ')}.` : '');

/** Shows or clears the message under a field: icon and text, referenced by the field; never color alone. */
function paintError(form, name, message = '') {
  const el = form.querySelector(`#f-${name}`);
  const box = form.querySelector(`#f-${name}-error`);
  if (!el || !box) return;
  const help = form.querySelector(`#f-${name}-help`) ? `f-${name}-help` : '';
  if (message) {
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', [`f-${name}-error`, help].filter(Boolean).join(' '));
    box.innerHTML = `${icon('warning')}<span>${esc(message)}</span>`;
    box.hidden = false;
  } else {
    el.removeAttribute('aria-invalid');
    if (help) el.setAttribute('aria-describedby', help);
    else el.removeAttribute('aria-describedby');
    box.textContent = '';
    box.hidden = true;
  }
}

function quoteDialog(p, ctx) {
  const v = vendor(p.vendorId);
  const star = ' <span aria-hidden="true">*</span>';
  const input = ({ name, text, required = false, help = '', attrs = '' }) => `<div class="field">
      <label for="f-${name}">${text}${required ? star : ''}</label>
      <input class="input" id="f-${name}" name="${name}" type="text"${required ? ' aria-required="true"' : ''}${help ? ` aria-describedby="f-${name}-help"` : ''}${attrs}>
      ${help ? `<p class="help" id="f-${name}-help">${esc(help)}</p>` : ''}
      <p class="shop-field-error" id="f-${name}-error" hidden></p>
    </div>`;
  const body = `<div class="shop-quote">
    <p class="shop-dialog-lead">${esc(`${label(p.name)}, from ${vendorName(v)}. Indicative price: ${moneyRound(p.price)}.`)}</p>
    <div class="form-grid">
      <fieldset class="shop-kind">
        <legend>${esc('Request type')}</legend>
        <div class="shop-kind-options">
          <label class="check"><input type="radio" name="kind" value="quote" checked aria-describedby="shop-kind-help"><span>${esc('Quote')}</span></label>
          <label class="check"><input type="radio" name="kind" value="reservation" aria-describedby="shop-kind-help"><span>${esc('Reservation')}</span></label>
        </div>
        <p class="help" id="shop-kind-help">${esc('Their terms are still to be defined.')}</p>
      </fieldset>
      ${input({ name: 'desiredDate', text: `${esc('Desired date')} <span class="muted">${esc('(optional)')}</span>`, help: 'Month, day and year: MM/DD/YYYY.', attrs: ' autocomplete="off" placeholder="MM/DD/YYYY" maxlength="10"' })}
      ${input({ name: 'name', text: esc('Fictional full name'), required: true, attrs: ' autocomplete="off"' })}
      ${input({ name: 'email', text: esc('Fictional email'), required: true, attrs: ' inputmode="email" autocomplete="off" spellcheck="false" placeholder="name@example.com"' })}
      <div class="field field--full">
        <label for="f-note">${esc('Project details')} <span class="muted">${esc('(optional)')}</span></label>
        <textarea class="input textarea" id="f-note" name="note" rows="3" aria-describedby="f-note-help"></textarea>
        <p class="help" id="f-note-help">${esc('Configuration, delivery place or questions for the seller.')}</p>
      </div>
    </div>
    <div class="shop-confirm">
      <label class="check"><input type="checkbox" name="fictional" value="on" id="f-fictional" aria-required="true"><span>${esc('I am using fictional details for this simulation')}${star}</span></label>
      <p class="shop-field-error" id="f-fictional-error" hidden></p>
    </div>
    ${notice(esc('No deposit, no confirmed reservation, no message sent. The request is saved in this browser only.'), 'info')}
    <div class="form-actions"><button class="btn btn--secondary" type="button" data-dialog-close>${esc('Cancel')}</button><button class="btn btn--primary" type="submit">${esc('Save the request')}</button></div>
  </div>`;
  ctx.openDialog({
    title: esc('Request a quote or reservation'),
    size: 'm',
    body,
    onSubmit(values, form) {
      /* Messages sit under their fields and are cleared as soon as the field changes; the summary follows. */
      if (!form.dataset.shopWatch) {
        form.dataset.shopWatch = '1';
        const clear = (event) => {
          const name = event.target.name;
          if (!QUOTE_FIELDS.some(([k]) => k === name) || event.target.getAttribute('aria-invalid') !== 'true') return;
          paintError(form, name);
          setDialogError(quoteSummary(QUOTE_FIELDS.filter(([k]) => form.querySelector(`#f-${k}`)?.getAttribute('aria-invalid') === 'true')));
        };
        form.addEventListener('input', clear);
        form.addEventListener('change', clear);
      }
      const errors = {};
      const date = values.desiredDate ? usDate(values.desiredDate) : '';
      if (date === null) errors.desiredDate = 'Enter the date as MM/DD/YYYY, for example 11/20/2026, or leave it empty.';
      else if (date && date < isoDay(new Date())) errors.desiredDate = 'Choose a date from today onward, or leave it empty.';
      if (!values.name) errors.name = 'Enter a fictional full name.';
      if (!EMAIL.test(values.email || '')) errors.email = 'Enter a fictional email address, such as name@example.com.';
      if (!values.fictional) errors.fictional = 'Confirm that you are using fictional details.';
      QUOTE_FIELDS.forEach(([k]) => paintError(form, k, errors[k]));
      const bad = QUOTE_FIELDS.filter(([k]) => errors[k]);
      if (bad.length) {
        form.querySelector(`#f-${bad[0][0]}`)?.focus();
        return quoteSummary(bad);
      }
      const kind = values.kind === 'reservation' ? 'reservation' : 'quote';
      const request = addRequest({ productId: p.id, kind, name: values.name, email: values.email, desiredDate: date, note: values.note || '' });
      if (!request) return `This offer can no longer be requested for delivery ${dest()}.`;
      ctx.toast(`${requestKindLabel(kind)} saved · simulation, nothing sent`, 'checkCircle');
      ctx.go('#/orders');
      return undefined;
    }
  });
}

function productView(ctx) {
  const id = ctx.match?.[0] || '';
  const p = id ? product(id) : null;
  if (!p || !publicOffer(p)) return opensAtTop(unavailable(p, id), ctx);
  const v = vendor(p.vendorId);
  const name = label(p.name);
  const key = modelKey(p);
  const cut = cutout(key);
  const others = twins(p).filter(publicOffer);
  const near = others.filter((o) => deliverable(o)).sort((a, b) => a.price - b.price);
  const far = others.length - near.length;
  const trail = findCategory(p.path?.[p.path.length - 1] || p.category)?.path || [department(p.category)].filter(Boolean);
  const crumbs = [['Home', '#/'], ['All departments', '#/categories'], ...trail.map((n) => [catName(n), catalogHref({ category: n.id })]), [name, '']];
  /* A selection badge only where the offer belongs to that selection's list: delivered to the destination. */
  const selections = deliverable(p) ? Object.keys(SELECTIONS).filter((c) => inCollection(p, c)) : [];
  const more = moreOffers(p);
  const { lines, actions } = buyBlock(p, near, more.list.length > 0);
  const quote = isQuote(p);
  const dept = department(p.category);
  const caption = GENERATED.has(key) ? 'Generated illustration · fictional product, seller and price' : 'Illustrative photograph · fictional product, seller and price';

  const html = `<div class="page wrap shop-offer">
    ${breadcrumb(crumbs)}
    <div class="shop-product">
      <figure class="shop-figure" data-reveal>
        <div class="shop-stage shop-stage--product"${cut ? ` data-cut style="--cut-w:${cut.w}px;--cut-h:${cut.h}px"` : ''}>${offerImage(p, { sizes: '(max-width: 900px) 90vw, 760px', lazy: false, priority: true, alt: usAlt(altText(p)) })}</div>
        <figcaption>${esc(caption)}</figcaption>
      </figure>
      <div class="shop-buy" data-reveal>
        ${selections.length ? `<p class="shop-eyebrow">${selections.map((c) => `<a href="${catalogHref({ collection: c })}">${esc(SELECTIONS[c])}</a>`).join('')}</p>` : ''}
        <h1 class="title-l" tabindex="-1">${esc(name)}</h1>
        <p class="shop-seller">${sellerLine(p)}</p>
        <p class="shop-verify">${icon('seal')}<span>${esc(sellerKind(v))}</span></p>
        <div class="shop-pricing">
          <p class="shop-price-label">${esc(quote ? 'Indicative price' : 'Product price')}</p>
          <p class="shop-price">${esc(quote ? moneyRound(p.price) : money(p.price))}</p>
          <div class="shop-lines">${lines}</div>
        </div>
        ${actions}
        ${assurances(p, near)}
      </div>
    </div>
    ${sellersSection(p, near, far)}
    ${detailsSection(p)}
    ${more.list.length ? `<section class="section shop-section" id="shop-more" aria-labelledby="shop-more-title">
      <div class="section-head">
        <h2 class="title-m" id="shop-more-title">${esc(more.inDept === more.list.length ? 'More in this department' : `More offers delivering ${dest()}`)}</h2>
        ${dept ? `<a class="more" href="${catalogHref({ category: dept.id })}">${esc(`See ${catName(dept)}`)}${icon('arrow')}</a>` : ''}
      </div>
      <ul class="offers offers--grid" role="list">${more.list.map((o) => card(o)).join('')}</ul>
    </section>` : ''}
  </div>`;

  return {
    title: `${name} · DutyFreeDeal`,
    html,
    mount(main) {
      const onClick = (event) => {
        if (event.target.closest('[data-shop-quote]')) quoteDialog(p, ctx);
      };
      /* The quantity form only carries the quantity; adding goes through the shared "add" action. */
      const onSubmit = (event) => {
        if (event.target.closest('form[data-form="shop-buy"]')) event.preventDefault();
      };
      main.addEventListener('click', onClick);
      main.addEventListener('submit', onSubmit);
      const qty = main.querySelector('#shop-qty');
      if (qty && !qty.value) qty.value = '1';
      const unbindDest = bindDestination(main);
      if (ctx.reason === 'state') rescueFocus(main, () => main.querySelector('#shop-add, #shop-quote, #shop-dest, #shop-compare, #shop-see-more'));
      else openAt(main);
      return () => {
        main.removeEventListener('click', onClick);
        main.removeEventListener('submit', onSubmit);
        unbindDest();
      };
    }
  };
}

/* ---------- Saved offers ---------- */

let savedIndex = -1;

function wishlist(ctx) {
  const list = state.favorites.map(product).filter(Boolean);
  const awayList = list.filter((p) => publicOffer(p) && !deliverable(p));
  const away = awayList.length;
  const gone = list.filter((p) => !publicOffer(p)).length;
  const issues = [
    away ? `${plural(away, 'saved offer does', 'saved offers do')} not deliver ${dest()}.` : '',
    gone ? `${plural(gone, 'saved offer is', 'saved offers are')} unavailable in this demonstration.` : ''
  ].filter(Boolean).join(' ');
  /* Changing the destination helps only when one of these sellers delivers somewhere. */
  const canMove = awayList.some((p) => vendor(p.vendorId)?.deliveryTo?.length);
  const reachable = list.length - away - gone;
  const tally = !list.length ? ''
    : reachable === list.length ? `${plural(list.length, 'offer', 'offers')} delivering ${dest()}`
      : `${plural(list.length, 'offer', 'offers')}, ${reachable} delivering ${dest()}`;
  const head = `<header class="page-head shop-head">
    ${breadcrumb([['Home', '#/'], ['Saved offers', '']])}
    <div class="shop-head-row">
      <div class="shop-head-text">
        <h1 class="title-l" tabindex="-1">${esc('Saved offers')}</h1>
        ${tally ? `<p class="title-l soft shop-head-count">${esc(tally)}</p>` : ''}
      </div>
      <p class="lead shop-head-lead">${esc(list.length
        ? 'Offers kept in view to compare sellers, prices and delivery. Saved in this browser only, for this demonstration.'
        : 'Saved in this browser only, for this demonstration.')}</p>
    </div>
  </header>`;
  const body = list.length
    ? `${issues ? `<div class="shop-saved-note">${notice(`${esc(issues)}${away && canMove ? ` ${destButton('Change the delivery country', 'link-btn')}` : ''}`, 'truck')}</div>` : ''}
      <ul class="offers offers--grid" role="list">${list.map((p) => card(p, { level: 2 })).join('')}</ul>`
    : emptyState({
      iconName: 'heart',
      title: esc('No saved offer yet'),
      text: esc('The heart on an offer keeps it here, in this browser, so that you can come back to compare sellers.'),
      actions: `<a class="btn btn--primary" href="#/categories">${esc('Browse all departments')}</a><a class="btn btn--secondary" href="${catalogHref({ collection: 'deals' })}">${esc('See the deals')}</a>`
    });
  return {
    title: 'Saved offers · DutyFreeDeal',
    html: `<div class="page wrap shop-saved">${head}${body}</div>`,
    mount(main) {
      const onClick = (event) => {
        const heart = event.target.closest('[data-action="fav"]');
        if (heart && main.contains(heart)) savedIndex = [...main.querySelectorAll('.offer [data-action="fav"]')].indexOf(heart);
      };
      main.addEventListener('click', onClick);
      const unbindDest = bindDestination(main);
      if (ctx.reason === 'state') {
        const index = savedIndex;
        rescueFocus(main, () => {
          const hearts = [...main.querySelectorAll('.offer [data-action="fav"]')];
          return hearts[Math.min(Math.max(index, 0), hearts.length - 1)] || main.querySelector('.empty a');
        });
      } else openAt(main);
      savedIndex = -1;
      return () => {
        main.removeEventListener('click', onClick);
        unbindDest();
      };
    }
  };
}

export const views = { catalog, categories: categoriesView, product: productView, wishlist };
