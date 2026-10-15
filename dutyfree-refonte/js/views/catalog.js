import {
  state, t, label, esc, icon, normalize, categories, countries, visibleProducts, vendor, vendorName,
  countryName, countryTo, findCategory, inCategory
} from '../core.js';
import { offerCard, emptyState } from '../components.js';

const KEYS = ['q', 'category', 'collection', 'mode', 'origin', 'sort'];

function readParams(params) {
  const out = {};
  for (const key of KEYS) out[key] = (params.get(key) || '').trim();
  if (!['', 'deals', 'rare'].includes(out.collection)) out.collection = '';
  if (!['', 'purchase', 'quote'].includes(out.mode)) out.mode = '';
  if (!['', 'price-asc', 'price-desc'].includes(out.sort)) out.sort = '';
  if (out.category && !findCategory(out.category)) out.category = '';
  if (out.origin && !countries.some(c => c.code === out.origin)) out.origin = '';
  return out;
}

export function hrefWith(current, changes) {
  const next = { ...current, ...changes };
  const qs = new URLSearchParams();
  for (const key of KEYS) if (next[key]) qs.set(key, next[key]);
  const s = qs.toString();
  return `#/catalog${s ? `?${s}` : ''}`;
}

function matchesQuery(p, q) {
  if (!q) return true;
  const v = vendor(p.vendorId);
  const pathNames = (p.path || []).map(id => {
    const found = findCategory(id);
    return found ? `${found.node.name.fr} ${found.node.name.en}` : '';
  });
  const hay = normalize([p.name.fr, p.name.en, vendorName(v), countryName(v?.country), ...pathNames].join(' '));
  return normalize(q).split(/\s+/).every(word => hay.includes(word));
}

function filterList(f, skip = '') {
  return visibleProducts().filter(p =>
    matchesQuery(p, f.q) &&
    (skip === 'category' || inCategory(p, f.category)) &&
    (skip === 'collection' || !f.collection || p.collections?.includes(f.collection)) &&
    (skip === 'mode' || !f.mode || p.mode === f.mode) &&
    (skip === 'origin' || !f.origin || vendor(p.vendorId)?.country === f.origin)
  );
}

function facet(title, options) {
  return `<div class="facet"><h2 class="facet-title">${esc(title)}</h2><ul class="facet-list" role="list">
    ${options.map(o => `<li><a class="facet-option" href="${o.href}" ${o.active ? 'aria-current="true"' : ''}><span>${esc(o.label)}</span>${o.count != null ? `<span class="count">${o.count}</span>` : ''}</a></li>`).join('')}
  </ul></div>`;
}

export function catalogView(params) {
  const f = readParams(params);
  const list = filterList(f);
  if (f.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (f.sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  const cat = f.category ? findCategory(f.category) : null;
  const title = cat ? label(cat.node.name)
    : f.collection ? t(f.collection === 'deals' ? 'deals' : 'rare')
    : f.q ? t('catalogueSearch', { q: f.q })
    : t('catalogueAll');
  const lead = cat ? '' : f.collection === 'deals' ? t('dealsText') : f.collection === 'rare' ? t('rareText') : '';

  /* Facets */
  const baseCat = filterList(f, 'category');
  const deptOptions = [{ label: t('all'), href: hrefWith(f, { category: '' }), active: !f.category, count: baseCat.length }];
  const scope = cat && cat.node.children ? cat.node.children : categories;
  if (cat) {
    const parent = cat.path.length > 1 ? cat.path[cat.path.length - 2] : null;
    deptOptions.push({ label: `${label(cat.node.name)}`, href: hrefWith(f, { category: cat.node.id }), active: true, count: baseCat.filter(p => inCategory(p, cat.node.id)).length });
    if (parent) deptOptions.splice(1, 0, { label: `‹ ${label(parent.name)}`, href: hrefWith(f, { category: parent.id }), active: false, count: null });
  }
  for (const node of scope) {
    const count = baseCat.filter(p => inCategory(p, node.id)).length;
    if (count > 0) deptOptions.push({ label: label(node.name), href: hrefWith(f, { category: node.id }), active: false, count });
  }
  const baseCol = filterList(f, 'collection');
  const baseMode = filterList(f, 'mode');
  const baseOrigin = filterList(f, 'origin');
  const facets = [
    facet(t('filterDepartment'), deptOptions),
    facet(t('filterCollection'), [
      { label: t('all'), href: hrefWith(f, { collection: '' }), active: !f.collection, count: baseCol.length },
      { label: t('deals'), href: hrefWith(f, { collection: 'deals' }), active: f.collection === 'deals', count: baseCol.filter(p => p.collections?.includes('deals')).length },
      { label: t('rare'), href: hrefWith(f, { collection: 'rare' }), active: f.collection === 'rare', count: baseCol.filter(p => p.collections?.includes('rare')).length }
    ]),
    facet(t('filterMode'), [
      { label: t('all'), href: hrefWith(f, { mode: '' }), active: !f.mode, count: baseMode.length },
      { label: t('modePurchase'), href: hrefWith(f, { mode: 'purchase' }), active: f.mode === 'purchase', count: baseMode.filter(p => p.mode === 'purchase').length },
      { label: t('modeQuote'), href: hrefWith(f, { mode: 'quote' }), active: f.mode === 'quote', count: baseMode.filter(p => p.mode === 'quote').length }
    ]),
    facet(t('filterOrigin'), [
      { label: t('all'), href: hrefWith(f, { origin: '' }), active: !f.origin, count: baseOrigin.length },
      ...countries.map(c => ({ label: label(c.name), href: hrefWith(f, { origin: c.code }), active: f.origin === c.code, count: baseOrigin.filter(p => vendor(p.vendorId)?.country === c.code).length }))
        .filter(o => o.count > 0 || o.active)
    ])
  ].join('');

  const filtersActive = f.category || f.collection || f.mode || f.origin;
  const crumbs = [`<a href="#/">${esc(t('home'))}</a>`, ...(cat ? cat.path.slice(0, -1).map(n => `<a href="${hrefWith({}, { category: n.id })}">${esc(label(n.name))}</a>`) : [])];

  let results;
  if (list.length) {
    results = `<div class="offer-grid">${list.map(offerCard).join('')}</div>`;
  } else if (cat && !f.q && !f.collection && !f.mode && !f.origin) {
    const children = cat.node.children || [];
    results = `${emptyState({ iconName: 'squares-four', title: t('departmentEmptyTitle'), text: esc(t('departmentEmptyText', { country: countryTo(state.country) })) })}
      ${children.length ? `<ul class="subcat-list" role="list">${children.map(ch => `<li><a href="${hrefWith({}, { category: ch.id })}">${esc(label(ch.name))}${icon('arrow-right')}</a></li>`).join('')}</ul>` : ''}`;
  } else {
    results = emptyState({
      iconName: 'magnifying-glass',
      title: t('catalogueEmptyTitle'),
      text: esc(t('catalogueEmptyText')),
      actions: filtersActive ? `<a class="btn btn--secondary" href="${hrefWith({ q: f.q }, {})}">${esc(t('clearFilters'))}</a>` : ''
    });
  }

  return `<div class="container page">
    <nav class="breadcrumb" aria-label="${esc(t('breadcrumb'))}">${crumbs.join(icon('caret-right'))}</nav>
    <div class="page-head">
      <h1 tabindex="-1">${esc(title)}</h1>
      ${lead ? `<p class="page-lead">${esc(lead)}</p>` : ''}
      <p class="page-meta"><span>${esc(t('catalogueCount', { n: list.length, country: countryTo(state.country) }))}</span><span class="tag">${esc(t('demoCatalogue'))}</span></p>
    </div>
    <div class="catalog-layout">
      <aside class="filters" aria-label="${esc(t('refine'))}">${facets}
        ${filtersActive ? `<a class="btn btn--quiet" href="${hrefWith({ q: f.q, sort: f.sort }, {})}">${icon('arrow-counter-clockwise')}${esc(t('clearFilters'))}</a>` : ''}
      </aside>
      <div class="results">
        <div class="results-bar">
          <label class="sort"><span>${esc(t('sort'))}</span>
            <select class="select" data-action="sort" data-base="${esc(hrefWith(f, { sort: '' }))}">
              <option value="" ${!f.sort ? 'selected' : ''}>${esc(t('sortRelevance'))}</option>
              <option value="price-asc" ${f.sort === 'price-asc' ? 'selected' : ''}>${esc(t('sortPriceAsc'))}</option>
              <option value="price-desc" ${f.sort === 'price-desc' ? 'selected' : ''}>${esc(t('sortPriceDesc'))}</option>
            </select>
          </label>
        </div>
        ${results}
        <p class="notice page-progress">${icon('info')}<span>${esc(t('pageInProgress'))}</span></p>
      </div>
    </div>
  </div>`;
}
