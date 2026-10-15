import { DATA } from './data.js';
import { ICONS } from './icons.js';
import { STRINGS } from './i18n.js';

export const STORAGE_KEY = 'dutyfreedeal-refonte-v1';
const INITIAL = { version: 1, lang: 'fr', country: 'FR', cart: [], favorites: [], requests: [] };

function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    saved = null;
  }
  const state = structuredClone(INITIAL);
  if (!saved || saved.version !== 1) return state;
  if (saved.lang === 'en' || saved.lang === 'fr') state.lang = saved.lang;
  if (DATA.countries.some(c => c.code === saved.country)) state.country = saved.country;
  if (Array.isArray(saved.cart)) {
    state.cart = saved.cart
      .filter(l => l && typeof l.id === 'string' && Number.isInteger(l.qty) && l.qty > 0 && DATA.products.some(p => p.id === l.id))
      .map(l => ({ id: l.id, qty: Math.min(l.qty, 99) }));
  }
  if (Array.isArray(saved.favorites)) {
    state.favorites = [...new Set(saved.favorites.filter(id => DATA.products.some(p => p.id === id)))];
  }
  if (Array.isArray(saved.requests)) {
    state.requests = saved.requests.filter(r => r && typeof r.id === 'string' && typeof r.productId === 'string');
  }
  return state;
}

export const state = loadState();

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage can be unavailable (private mode); the prototype keeps working in memory. */
  }
}

/* ---------- Text ---------- */
export function t(key, vars) {
  const entry = STRINGS[key];
  if (!entry) return key;
  const value = entry[state.lang] ?? entry.fr;
  return typeof value === 'function' ? value(vars || {}) : value;
}

export const label = value => (value && typeof value === 'object' ? value[state.lang] || value.fr || '' : String(value ?? ''));

export const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const normalize = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function icon(name, extraClass = '') {
  const body = ICONS[name];
  if (!body) return '';
  return `<svg class="icon ${extraClass}" viewBox="0 0 256 256" aria-hidden="true" focusable="false">${body}</svg>`;
}

/* ---------- Money ---------- */
const locale = () => (state.lang === 'fr' ? 'fr-FR' : 'en-IE');

/* French grouping uses U+202F, nearly invisible in display type: a regular no-break space reads better. */
const spaced = s => s.replace(/\u202f/g, '\u00a0');

export const money = n =>
  spaced(new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Number(n) || 0));

/* Catalogue price: integer part large, decimals and currency small. Screen readers get the plain amount. */
export function price(n, size = 'l', { round = false } = {}) {
  const formatter = new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: round ? 0 : 2,
    maximumFractionDigits: round ? 0 : 2
  });
  const parts = formatter.formatToParts(Number(n) || 0);
  const first = parts.findIndex(p => p.type === 'integer');
  let last = first;
  parts.forEach((p, i) => {
    if (p.type === 'integer' || p.type === 'group') last = i;
  });
  const join = list => spaced(list.map(p => p.value).join(''));
  const lead = join(parts.slice(0, first)).trim();
  const main = join(parts.slice(first, last + 1));
  const minor = join(parts.slice(last + 1));
  return `<span class="price price--${size}"><span class="sr-only">${esc(spaced(formatter.format(Number(n) || 0)))}</span><span aria-hidden="true" class="price-inner">${lead ? `<span class="price-minor price-lead">${esc(lead)}</span>` : ''}<span class="price-main">${esc(main)}</span>${minor ? `<span class="price-minor">${esc(minor)}</span>` : ''}</span></span>`;
}

/* ---------- Data access ---------- */
export const countries = DATA.countries;
export const categories = DATA.categories;
export const vendors = DATA.vendors;
export const products = DATA.products;

export const vendor = id => vendors.find(v => v.id === id);
export const product = id => products.find(p => p.id === id);
export const countryName = code => label(countries.find(c => c.code === code)?.name || code);

const COUNTRY_IN = {
  fr: { FR: 'en France', ES: 'en Espagne', US: 'aux États-Unis', MX: 'au Mexique' },
  en: { FR: 'to France', ES: 'to Spain', US: 'to the United States', MX: 'to Mexico' }
};
const COUNTRY_FROM = {
  fr: { FR: 'de France', ES: 'd’Espagne', US: 'des États-Unis', MX: 'du Mexique' },
  en: { FR: 'from France', ES: 'from Spain', US: 'from the United States', MX: 'from Mexico' }
};
const COUNTRY_SELLER = {
  fr: { FR: 'en France', ES: 'en Espagne', US: 'aux États-Unis', MX: 'au Mexique' },
  en: { FR: 'in France', ES: 'in Spain', US: 'in the United States', MX: 'in Mexico' }
};
export const countryTo = code => COUNTRY_IN[state.lang][code] || countryName(code);
export const countryFrom = code => COUNTRY_FROM[state.lang][code] || countryName(code);
export const countryAt = code => COUNTRY_SELLER[state.lang][code] || countryName(code);

/* Seller names carry a "· Démo" suffix in the dataset; the demo status is shown once per context instead. */
export const vendorName = v => String(v?.name || '').replace(/\s*·\s*Démo$/, '');

export const deliverableTo = (p, code = state.country) => Boolean(vendor(p.vendorId)?.deliveryTo.includes(code));
export const stock = p => Math.max(0, Math.floor(Number(p?.stock) || 0));
export const isQuote = p => p.mode === 'quote';
export const purchasable = p => p.mode === 'purchase' && stock(p) > 0 && deliverableTo(p);
export const shippingFee = (p, code = state.country) => Number(vendor(p.vendorId)?.shipping?.[code] ?? 0);
export const visibleProducts = (code = state.country) => products.filter(p => deliverableTo(p, code));
export const modelKey = p => p.image.replace(/^.*\//, '').replace(/\.\w+$/, '');

/* Photos with a white studio ground sit on the stone plate; the others are framed as full photographs. */
const CUTOUT_MODELS = new Set(['perfume', 'headphones', 'camera']);
export const photoMode = p => (CUTOUT_MODELS.has(modelKey(p)) ? 'cutout' : 'cover');

export function findCategory(id, nodes = categories, trail = []) {
  for (const node of nodes) {
    const path = [...trail, node];
    if (node.id === id) return { node, path };
    const found = findCategory(id, node.children || [], path);
    if (found) return found;
  }
  return null;
}

export const countNodes = node => 1 + (node.children || []).reduce((sum, child) => sum + countNodes(child), 0);
export const totalCategoryNodes = () => categories.reduce((sum, c) => sum + countNodes(c), 0);
export const descendantCount = node => countNodes(node) - 1;

export function inCategory(p, id) {
  return !id || p.category === id || (Array.isArray(p.path) && p.path.includes(id));
}

/* ---------- Cart ---------- */
export const cartCount = () => state.cart.reduce((sum, line) => sum + line.qty, 0);

export function cartLines() {
  return state.cart.map(line => ({ p: product(line.id), qty: line.qty })).filter(line => line.p);
}

export function cartGroups() {
  const groups = new Map();
  for (const line of cartLines()) {
    const id = line.p.vendorId;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(line);
  }
  return [...groups].map(([id, lines]) => ({ v: vendor(id), lines }));
}

export function lineIssue(line) {
  if (!deliverableTo(line.p)) return t('issueNotDeliverable', { country: countryTo(state.country) });
  if (line.qty > stock(line.p)) return t('issueStock', { n: stock(line.p) });
  return '';
}

export function cartTotals() {
  const groups = cartGroups();
  const subtotal = groups.reduce((sum, g) => sum + g.lines.reduce((s, l) => s + l.p.price * l.qty, 0), 0);
  const delivery = groups.reduce((sum, g) => sum + (g.lines.some(l => deliverableTo(l.p)) ? Number(g.v?.shipping?.[state.country] ?? 0) : 0), 0);
  return { subtotal, delivery, total: subtotal + delivery, sellers: groups.length };
}

export function go(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

export const uid = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
