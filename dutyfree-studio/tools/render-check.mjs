// Renders every route of DutyFreeDeal Studio in Node, in several demonstration states, without a browser.
// Flags exceptions, empty output, leftover French, forbidden marketing claims and broken values.
// Usage (from dutyfree-studio/): node tools/render-check.mjs [route-prefix]
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const store = new Map();
globalThis.window = globalThis;
globalThis.location = { hash: '#/', pathname: '/' };
globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.CSS = { escape: (s) => String(s).replace(/["\\]/g, '\\$&') };
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const core = await imp('js/core.js');
const { state } = core;

const ROUTES = [
  ['#/', 'home', 'home'],
  ['#/catalog', 'shop', 'catalog'],
  ['#/catalog?q=coffee', 'shop', 'catalog'],
  ['#/catalog?q=zzzz', 'shop', 'catalog'],
  ['#/catalog?category=fashion', 'shop', 'catalog'],
  ['#/catalog?category=pets-aquariums', 'shop', 'catalog'],
  ['#/catalog?collection=deals&sort=price-asc', 'shop', 'catalog'],
  ['#/catalog?collection=rare&origin=MX', 'shop', 'catalog'],
  ['#/catalog?mode=quote', 'shop', 'catalog'],
  ['#/catalog?max=50&stock=1', 'shop', 'catalog'],
  ['#/categories', 'shop', 'categories'],
  ['#/product/perfume-mercado', 'shop', 'product', ['perfume-mercado']],
  ['#/product/car-mobility', 'shop', 'product', ['car-mobility']],
  ['#/product/turntable-pacific', 'shop', 'product', ['turntable-pacific']],
  ['#/product/does-not-exist', 'shop', 'product', ['does-not-exist']],
  ['#/wishlist', 'shop', 'wishlist'],
  ['#/cart', 'purchase', 'cart'],
  ['#/checkout', 'purchase', 'checkout'],
  ['#/orders', 'purchase', 'orders'],
  ['#/sign-in', 'account', 'signIn'],
  ['#/sign-in?mode=create&next=%23%2Fcart', 'account', 'signIn'],
  ['#/sell', 'seller', 'sell'],
  ['#/seller', 'seller', 'dashboard'],
  ['#/seller/inventory', 'seller', 'inventory'],
  ['#/seller/orders', 'seller', 'shipments'],
  ['#/admin', 'admin', 'overview'],
  ['#/admin/vendors', 'admin', 'vendors'],
  ['#/admin/products', 'admin', 'products'],
  ['#/admin/orders', 'admin', 'orders'],
  ['#/admin/requests', 'admin', 'requests'],
  ['#/admin/settings', 'admin', 'settings'],
  ['#/credits', 'info', 'credits']
];

const STATES = {
  empty: () => {
    Object.assign(state, { country: 'FR', cart: [], favorites: [], orders: [], requests: [], applications: [], vendorStates: {}, productStates: {}, overrides: {}, extraProducts: [], account: null });
  },
  filled: () => {
    STATES.empty();
    state.favorites = ['perfume-mercado', 'bag-camille', 'car-mobility'];
    core.addToCart('perfume-mercado', 2);
    core.addToCart('headphones-pacific', 1);
    core.addToCart('moka-pot-costa', 1);
    core.placeOrder({ name: 'Alex Example', email: 'alex@example.com', address: '12 Example Street', postal: '75001', city: 'Paris' });
    core.addToCart('watch-atelier', 1);
    core.addToCart('chair-formes', 1);
    core.addRequest({ productId: 'car-mobility', kind: 'quote', name: 'Alex Example', email: 'alex@example.com', note: 'Grey, automatic.' });
    core.addApplication({ type: 'business', country: 'MX', name: 'Example Imports', email: 'shop@example.com' });
    core.setVendorState('cargo-demo', true);
    core.setProductState('sneakers-mercado', true);
    core.signIn({ name: 'Alex Example', email: 'alex@example.com' });
  },
  spain: () => {
    STATES.filled();
    state.country = 'ES';
  }
};

const FORBIDDEN = [
  [/[àâçéèêëîïôûùüÿœÀÂÇÉÈÊÎÔÛ]/, 'accented character (French text?)'],
  [/\b(livraison|vendeur|panier|rayon|commande|démo|offres?|achat|devis|introuvable|bons plans)\b/i, 'French word'],
  [/\d\s?%|\bpercent\b/i, 'percentage'],
  [/\b(save \d|save up to|you save|savings of|discount|sale price|was €|bargain of|best sellers?|bestsellers?|hot deals?|limited time|only \d+ left|hurry)\b/i, 'promotional claim'],
  [/\b(guarantee[ds]?|authentic|certified|genuine)\b/i, 'guarantee or authenticity claim'],
  [/\b(customs|tax|taxes|tax-free|duty-free price|vat)\b/i, 'customs or tax claim'],
  [/\b(made in|origin of the product|country of origin|provenance)\b/i, 'origin wording (use seller country)'],
  [/\b(customer reviews?|product reviews?|\d+ reviews?|\d(\.\d)? ?stars?|star ratings?|ratings?)\b/i, 'reviews or ratings'],
  [/\b(lorem|ipsum|todo|fixme|undefined|NaN|\[object Object\])\b/, 'placeholder or broken value'],
  [/#\/cart\b(?!")|#\/seller\/onboarding/, null]
];

const textOf = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
/* Proper names of photographers and deliberate disclaimers are allowed. */
const ALLOWED = [/Jürgen Matern/g, /Frank C\. Müller/g, /makes no claim about taxes or customs/g, /15%(?= net| commission)/g, /“15% net of the global price”/g];
const allow = (text) => ALLOWED.reduce((t, re) => t.replace(re, ' '), text);

const only = process.argv[2] || '';
let problems = 0;
for (const [stateName, setup] of Object.entries(STATES)) {
  for (const [hash, mod, view, match = []] of ROUTES) {
    if (only && !hash.startsWith(only)) continue;
    setup();
    location.hash = hash;
    const r = core.route();
    let out = '';
    try {
      const m = await imp(`js/views/${mod}.js`);
      const fn = m.views?.[view];
      if (!fn) throw new Error(`views.${view} is missing in js/views/${mod}.js`);
      const v = fn({ params: r.params, path: r.path, match, reason: 'route', rerender: async () => {}, go: () => {}, toast: () => {}, announce: () => {}, openDialog: () => {}, closeDialog: () => {} });
      if (!v || typeof v.html !== 'string' || v.html.length < 200) throw new Error('view returned no HTML');
      if (!v.title) throw new Error('view has no title');
      const text = allow(`${textOf(v.html)} ${v.title}`);
      const attrs = (v.html.match(/(?:aria-label|alt|title|placeholder)="[^"]*"/g) || []).join(' ');
      const flags = [];
      for (const [re, why] of FORBIDDEN) {
        if (!why) continue;
        const hit = (text + ' ' + attrs).match(re);
        if (hit) flags.push(`${why}: “${hit[0]}”`);
      }
      if ((v.html.match(/<h1\b/g) || []).length !== 1) flags.push(`expected exactly one h1, found ${(v.html.match(/<h1\b/g) || []).length}`);
      if (/href="#\/(?!catalog|categories|product\/|wishlist|cart|checkout|orders|sign-in|sell\b|seller|admin|credits|"|\?)/.test(v.html)) flags.push('link to an unknown route');
      if (flags.length) {
        problems += flags.length;
        console.log(`! ${stateName.padEnd(6)} ${hash}\n    ${flags.join('\n    ')}`);
      } else {
        console.log(`  ${stateName.padEnd(6)} ${hash}  ok (${v.html.length} chars)`);
      }
    } catch (error) {
      problems += 1;
      console.log(`✗ ${stateName.padEnd(6)} ${hash}\n    ${error.stack.split('\n').slice(0, 3).join('\n    ')}`);
    }
  }
}
console.log(problems ? `\n${problems} problem(s)` : '\nall routes render cleanly');
process.exitCode = problems ? 1 : 0;
