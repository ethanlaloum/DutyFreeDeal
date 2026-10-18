/* DutyFreeDeal Studio: demonstration state, data access, text helpers and business rules shared by every page. */
import { DATA } from './data.js';
import { CUT, ALT } from './art.js';
import { ICONS } from './icons.js';

/* ---------- State (local demonstration data, this browser only) ---------- */

export const STORAGE_KEY = 'dutyfreedeal-studio-v1';

const INITIAL = {
  version: 1,
  country: 'FR',
  cart: [],
  favorites: [],
  orders: [],
  requests: [],
  applications: [],
  vendorStates: {},
  productStates: {},
  overrides: {},
  extraProducts: [],
  selectedVendor: DATA.vendors[0].id,
  account: null
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    saved = null;
  }
  const s = structuredClone(INITIAL);
  if (!isObject(saved) || saved.version !== 1) return s;
  if (DATA.countries.some((c) => c.code === saved.country)) s.country = saved.country;
  if (DATA.vendors.some((v) => v.id === saved.selectedVendor)) s.selectedVendor = saved.selectedVendor;
  for (const key of ['vendorStates', 'productStates', 'overrides']) if (isObject(saved[key])) s[key] = saved[key];
  if (Array.isArray(saved.extraProducts)) {
    s.extraProducts = saved.extraProducts.filter((p) => isObject(p) && typeof p.id === 'string' && isObject(p.name)
      && DATA.vendors.some((v) => v.id === p.vendorId) && Number(p.price) > 0 && typeof p.image === 'string');
  }
  const known = new Set([...DATA.products.map((p) => p.id), ...s.extraProducts.map((p) => p.id)]);
  if (Array.isArray(saved.cart)) {
    s.cart = saved.cart.filter((l) => l && known.has(l.id) && Number.isInteger(l.qty) && l.qty > 0).map((l) => ({ id: l.id, qty: Math.min(l.qty, 99) }));
  }
  if (Array.isArray(saved.favorites)) s.favorites = [...new Set(saved.favorites.filter((id) => known.has(id)))];
  if (Array.isArray(saved.orders)) {
    s.orders = saved.orders.filter((o) => isObject(o) && typeof o.id === 'string' && Array.isArray(o.shipments) && isObject(o.contact));
  }
  if (Array.isArray(saved.requests)) s.requests = saved.requests.filter((r) => isObject(r) && typeof r.id === 'string' && typeof r.productId === 'string');
  if (Array.isArray(saved.applications)) s.applications = saved.applications.filter((a) => isObject(a) && typeof a.id === 'string' && ['individual', 'business'].includes(a.type));
  if (isObject(saved.account) && typeof saved.account.name === 'string' && typeof saved.account.email === 'string' && saved.account.email) {
    s.account = { name: saved.account.name, email: saved.account.email };
  }
  return s;
}

export const state = loadState();

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage can be unavailable (private mode); the demonstration keeps working in memory. */
  }
}

/** Clears the demonstration data of this browser, keeping the delivery destination. */
export function resetDemo() {
  const { country } = state;
  Object.assign(state, structuredClone(INITIAL), { country });
  save();
}

/* ---------- Example customer account (simulated: no password is kept, nothing is checked or sent) ---------- */

export function signIn({ name, email }) {
  state.account = { name: String(name || '').trim().replace(/\s+/g, ' '), email: String(email || '').trim() };
  save();
}

export function signOut() {
  state.account = null;
  save();
}

/** "Jordan" for "Jordan Ellis"; the email before the @ when no name is known. */
export const firstName = (account = state.account) => (account?.name || '').split(' ')[0] || (account?.email || '').split('@')[0];

/* ---------- Text (the site is in English only, decision of 14 October 2026) ---------- */

/** English text of a data value; the data keeps { fr, en } pairs from the earlier prototypes. */
export const label = (value) => (value && typeof value === 'object' ? value.en || '' : String(value ?? ''));

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** "1 offer", "2 offers", "0 offers"; the number is joined with a no-break space. */
export const plural = (n, one, many) => `${n}\u00a0${n === 1 ? one : many}`;

export function icon(name, cls = '') {
  const body = ICONS[name];
  if (!body) return '';
  return `<svg class="icon${cls ? ` ${cls}` : ''}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">${body}</svg>`;
}

/* ---------- Numbers and dates (prices are demonstration amounts in euros for every market) ---------- */

const LOCALE = 'en-US';

export const money = (n) => new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
export const moneyRound = (n) => new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(n) || 0);
export const number = (n) => new Intl.NumberFormat(LOCALE).format(Number(n) || 0);

export function dateText(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export const uid = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/* ---------- Countries ---------- */

export const countries = DATA.countries;
export const countryName = (code) => label(countries.find((c) => c.code === code)?.name || code);

const COUNTRY_TO = { FR: 'to France', ES: 'to Spain', US: 'to the United States', MX: 'to Mexico' };
const COUNTRY_AT = { FR: 'in France', ES: 'in Spain', US: 'in the United States', MX: 'in Mexico' };
/** Delivery destination phrase: "to France". */
export const countryIn = (code) => COUNTRY_TO[code] || `to ${countryName(code)}`;
/** Location phrase: "in France". */
export const countryAt = (code) => COUNTRY_AT[code] || `in ${countryName(code)}`;
/** The country shown with an offer is the seller's country, never the place of manufacture: "Seller in Mexico". */
export const sellerIn = (code) => `Seller ${countryAt(code)}`;

/* ---------- Catalogue ---------- */

export const categories = DATA.categories;
export const vendors = DATA.vendors;

export const vendor = (id) => vendors.find((v) => v.id === id);
/** Seller display name; every example seller is marked « · Demo ». */
export const vendorName = (v) => String(v?.name || '');
export const vendorState = (id) => (state.vendorStates[id] === 'paused' ? 'paused' : 'active');

export const allProducts = () => [...DATA.products, ...state.extraProducts].map((p) => ({ ...p, ...(state.overrides[p.id] || {}) }));
export const product = (id) => allProducts().find((p) => p.id === id);

export const isHidden = (p) => state.productStates[p.id] === 'hidden';
/** Visible in the shop: not hidden by moderation, seller not suspended. */
export const publicOffer = (p) => Boolean(p) && !isHidden(p) && vendorState(p.vendorId) !== 'paused';
export const deliverable = (p, code = state.country) => Boolean(vendor(p.vendorId)?.deliveryTo.includes(code));
export const stock = (p) => Math.max(0, Math.floor(Number(p?.stock) || 0));
export const isQuote = (p) => p.mode === 'quote';
/** Can go to the cart now, for the selected destination. */
export const available = (p) => publicOffer(p) && deliverable(p) && stock(p) > 0 && p.mode === 'purchase';
export const shipping = (vendorId, code = state.country) => Number(vendor(vendorId)?.shipping?.[code] ?? 0);

/** Selection membership. An offer is "Hard to find" only for buyers outside its seller's country. */
export const inCollection = (p, c, code = state.country) => Array.isArray(p.collections) && p.collections.includes(c) && (c !== 'rare' || vendor(p.vendorId)?.country !== code);

/** Offers of the shop for the selected destination: public and deliverable. */
export const shopOffers = (code = state.country) => allProducts().filter((p) => publicOffer(p) && deliverable(p, code));

export const modelKey = (p) => String(p.image || '').split('/').pop().replace(/\.\w+$/, '');
export const cutout = (key) => CUT[key] || null;
export const altText = (p) => ALT[modelKey(p)] || label(p.name);
/** Other sellers' listings of the same product: same photographed model and same department. Offers created
 * by a seller in this prototype reuse a photograph, so they never count as the same product. */
const isCreated = (p) => state.extraProducts.some((e) => e.id === p.id);
export const sameModel = (p) => (isCreated(p) ? [] : allProducts().filter((o) => o.id !== p.id && !isCreated(o) && modelKey(o) === modelKey(p) && o.category === p.category));

export function findCategory(id, nodes = categories, trail = []) {
  for (const node of nodes) {
    const path = [...trail, node];
    if (node.id === id) return { node, path };
    const found = findCategory(id, node.children || [], path);
    if (found) return found;
  }
  return null;
}
export const department = (id) => categories.find((c) => c.id === id);
export const inCategory = (p, id) => !id || p.category === id || (Array.isArray(p.path) && p.path.includes(id));
export const countNodes = (node) => (node.children || []).reduce((sum, child) => sum + 1 + countNodes(child), 0);
export const totalCategories = () => categories.reduce((sum, c) => sum + 1 + countNodes(c), 0);

/* ---------- Search (one scoring for the suggestions and the results page) ---------- */

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
    .map(({ node, path }) => ({ words: words(label(node.name)), depth: path.length }));
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
export function searchScore(p, q) {
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

/* The data now carries US English, except two image descriptions of art.js ("charcoal grey", "timber house"): they are
 * corrected here until the source is. "Hardback" (data.js name and spec, art.js description) is left as it is on purpose:
 * renamed here only, the same offer would carry another name in the toast, the header panels, the cart and the orders. */
const US_ALT = [[/\bgrey\b/gi, 'gray'], [/\btimber house\b/gi, 'wood house']];
export const usAlt = (text) => US_ALT.reduce((t, [re, to]) => t.replace(re, (w) => (w[0] === w[0].toUpperCase() ? `${to[0].toUpperCase()}${to.slice(1)}` : to)), String(text ?? ''));

/* ---------- Cart (one cart, one payment, one shipment per seller) ---------- */

export const cartCount = () => state.cart.reduce((sum, l) => sum + l.qty, 0);
export const cartLines = () => state.cart.map((l) => ({ p: product(l.id), qty: l.qty })).filter((l) => l.p);

export function cartGroups() {
  const groups = new Map();
  for (const line of cartLines()) {
    const id = line.p.vendorId;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(line);
  }
  return [...groups].map(([id, lines]) => ({ v: vendor(id), lines }));
}

/** Why a cart line cannot be ordered as is, or an empty string. */
export function lineIssue(line) {
  if (!publicOffer(line.p)) return 'Offer unavailable';
  if (!deliverable(line.p)) return `This seller does not deliver ${countryIn(state.country)}`;
  if (line.p.mode !== 'purchase') return 'This offer requires a quote request';
  if (line.qty > stock(line.p)) return stock(line.p) ? `Example stock: ${stock(line.p)} at most` : 'Out of stock in this demonstration';
  return '';
}

/** Totals counting only the lines that can be ordered; one example delivery fee per seller. */
export function cartTotals() {
  let subtotal = 0;
  let delivery = 0;
  let shipments = 0;
  for (const g of cartGroups()) {
    const ok = g.lines.filter((l) => !lineIssue(l));
    if (!ok.length) continue;
    subtotal += ok.reduce((sum, l) => sum + l.p.price * l.qty, 0);
    delivery += shipping(g.v.id);
    shipments += 1;
  }
  return { subtotal, delivery, total: subtotal + delivery, shipments, blocked: cartLines().some((l) => lineIssue(l)) };
}

/** Adds an offer to the cart; returns an error message, or an empty string when done. */
export function addToCart(id, qty = 1) {
  const p = product(id);
  if (!p || !available(p)) return `This offer is not available ${countryIn(state.country)}.`;
  if (!Number.isInteger(qty) || qty < 1) return 'Choose a positive whole quantity.';
  const line = state.cart.find((l) => l.id === id);
  const next = (line?.qty || 0) + qty;
  if (next > stock(p)) return 'The example stock does not allow this quantity.';
  if (line) line.qty = next;
  else state.cart.push({ id, qty });
  save();
  return '';
}

export function setCartQty(id, qty) {
  const line = state.cart.find((l) => l.id === id);
  if (!line) return;
  if (qty <= 0) state.cart = state.cart.filter((l) => l.id !== id);
  else line.qty = Math.max(1, Math.min(qty, 99, Math.max(stock(product(id)), 1)));
  save();
}

export function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id) ? state.favorites.filter((x) => x !== id) : [...state.favorites, id];
  save();
  return state.favorites.includes(id);
}

/* ---------- Orders, requests, applications ---------- */

export const SHIPMENT_STEPS = ['pending', 'preparing', 'shipped', 'delivered'];
export const shipmentLabel = (status) => ({
  pending: 'Awaiting preparation',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered'
}[status] || 'Awaiting preparation');

/** One wording for the status of a quote or reservation request, on every page. */
export const requestStatusLabel = (status) => (status === 'reviewing' ? 'Under review · simulation' : 'Request saved · simulation');
export const requestKindLabel = (kind) => (kind === 'reservation' ? 'Reservation request' : 'Quote request');

/** One wording for the status of a seller application, on every page. */
export const applicationStatusLabel = (status) => ({
  verified: 'Verified · simulation',
  rejected: 'Needs details · simulation'
}[status] || 'Awaiting review · simulation');
export const applicationStatusTone = (status) => ({ verified: 'success', rejected: 'danger' }[status] || 'warning');

/** Simulated checkout: one order, one shipment per seller, example stock decreased. Returns the order. */
export function placeOrder(contact) {
  const lines = cartLines();
  if (!lines.length || lines.some((l) => lineIssue(l))) return null;
  const sum = cartTotals();
  const shipments = cartGroups().map((g) => ({
    vendorId: g.v.id,
    vendorName: g.v.name,
    shipping: shipping(g.v.id),
    status: 'pending',
    items: g.lines.map((l) => ({ id: l.p.id, name: l.p.name, image: l.p.image, price: l.p.price, qty: l.qty }))
  }));
  const order = { id: uid('DFD'), date: new Date().toISOString(), country: state.country, contact, subtotal: sum.subtotal, delivery: sum.delivery, total: sum.total, shipments };
  state.orders.push(order);
  for (const l of lines) state.overrides[l.p.id] = { ...(state.overrides[l.p.id] || {}), stock: stock(l.p) - l.qty };
  state.cart = [];
  save();
  return order;
}

export function advanceShipment(orderId, vendorId) {
  const s = state.orders.find((o) => o.id === orderId)?.shipments.find((x) => x.vendorId === vendorId);
  const next = { pending: 'preparing', preparing: 'shipped', shipped: 'delivered' }[s?.status];
  if (!next) return false;
  s.status = next;
  save();
  return true;
}

/** Quote or reservation enquiry for large goods: saved locally, nothing sent, no deposit. */
export function addRequest({ productId, kind, name, email, desiredDate = '', note = '' }) {
  const p = product(productId);
  if (!p || p.mode !== 'quote' || !publicOffer(p) || !deliverable(p)) return null;
  const v = vendor(p.vendorId);
  const request = {
    id: uid('REQ'), date: new Date().toISOString(), productId: p.id, productName: p.name, image: p.image, vendorId: v.id, vendorName: v.name,
    price: p.price, country: state.country, kind: kind === 'reservation' ? 'reservation' : 'quote', name, email, desiredDate, note, status: 'new'
  };
  state.requests.push(request);
  save();
  return request;
}

export function addApplication({ type, country, name, email }) {
  const application = { id: uid(type === 'business' ? 'KYB' : 'KYC'), date: new Date().toISOString(), type: type === 'business' ? 'business' : 'individual', country, name, email, status: 'pending' };
  state.applications.push(application);
  save();
  return application;
}

/* ---------- Seller and back office (simulations) ---------- */

export const sellerOffers = (vendorId = state.selectedVendor) => allProducts().filter((p) => p.vendorId === vendorId);

export function editOffer(id, { price, stock: qty }) {
  const p = product(id);
  if (!p || !(price > 0) || !Number.isInteger(qty) || qty < 0 || qty > 100000) return false;
  state.overrides[id] = { ...(state.overrides[id] || {}), price, stock: qty };
  save();
  return true;
}

export function createOffer({ vendorId, name, category, mode, price, stock: qty, image }) {
  const cat = department(category);
  if (!vendor(vendorId) || !cat || !name || !(price > 0) || !Number.isInteger(qty) || qty < 0 || !image) return null;
  const p = {
    id: uid('OFFER').toLowerCase(), name: { en: name }, brand: 'Demo', category: cat.id, path: [cat.id], vendorId,
    price, stock: qty, image, mode: mode === 'quote' ? 'quote' : 'purchase', collections: [],
    description: { en: 'Fictional offer created in the prototype to explore the seller journey.' },
    delivery: { en: mode === 'quote' ? 'Transport and timing to be specified in the quotation · example' : '5 to 8 days · example' }, specs: []
  };
  state.extraProducts.push(p);
  save();
  return p;
}

export function setProductState(id, hidden) {
  state.productStates[id] = hidden ? 'hidden' : 'published';
  save();
}

export function setVendorState(id, paused) {
  state.vendorStates[id] = paused ? 'paused' : 'active';
  save();
}

export function setApplicationStatus(id, status) {
  const a = state.applications.find((x) => x.id === id);
  if (!a || !['verified', 'rejected', 'pending'].includes(status)) return false;
  a.status = status;
  save();
  return true;
}

export function reviewRequest(id) {
  const q = state.requests.find((x) => x.id === id);
  if (!q) return false;
  q.status = 'reviewing';
  save();
  return true;
}

/* ---------- Navigation ---------- */

export function route() {
  let raw = location.hash.slice(1) || '/';
  if (!raw.startsWith('/')) raw = '/';
  const [path, ...rest] = raw.split('?');
  return { path: path.replace(/\/$/, '') || '/', params: new URLSearchParams(rest.join('?')) };
}

/** Catalogue link built from filter values; empty values are dropped. */
export function catalogHref(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== '' && v != null) q.set(k, v);
  const s = q.toString();
  return `#/catalog${s ? `?${s}` : ''}`;
}

export const productHref = (p) => `#/product/${encodeURIComponent(p.id)}`;

export function go(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}
