/* Home: slogan and search, the 15 departments right below (decision of 14 October 2026: no product showcase in the hero),
 * then how it works, Deals | Hard to find, offers from around the world, one cart, large goods and the seller invitation. */
import {
  state, label, esc, icon, plural, money, moneyRound, countryIn, countryName, sellerIn, vendor, vendorName, shopOffers,
  modelKey, cutout, categories, countNodes, catalogHref, productHref, countries, inCollection
} from '../core.js';
import { offerCard, departmentArt, thumb, offerImage } from '../ui/components.js';
import { searchForm } from '../ui/search.js';
import { LARGE, MAIN, BLEED } from '../art.js';
import { revealNow, RISE, RISE_TO, motionOK } from '../ui/motion.js';
import { announce } from '../ui/feedback.js';
import { mountSky } from '../ui/sky.js';

/* The former hero showcase, deliberately not featured again on the home. */
const HOME_AVOID = new Set(['perfume', 'headphones', 'camera']);
const COUNTRY_ORDER = ['FR', 'ES', 'US', 'MX'];
const PREFER = {
  deals: ['portable-speaker', 'cordless-drill', 'sneakers', 'watch', 'cast-iron-skillet', 'tennis-racket', 'wooden-blocks', 'claw-hammer',
    'chocolate', 'pruning-shears', 'mechanical-keyboard', 'sunglasses', 'moka-pot', 'bicycle', 'olive-oil'],
  rare: ['felt-hat', 'ceramic-vase', 'chef-knife', 'leather-boots', 'coffee-beans', 'fountain-pen', 'baby-rattle', 'dog-collar', 'spices',
    'powder-box', 'chair', 'teddy-bear', 'bag', 'books']
};

/* ---------- Page registry: no photograph is shown twice on the page when another one can be ---------- */

let seen = new Set();
const tier = (o) => (seen.has(modelKey(o)) ? 4 : 0) + (HOME_AVOID.has(modelKey(o)) ? 2 : 0) + (cutout(modelKey(o)) ? 0 : 6);
const purchasable = () => shopOffers().filter((o) => o.mode === 'purchase' && o.stock > 0);

function aisleOrder() {
  const rest = categories.filter((d) => !LARGE.includes(d.id));
  const cut = (d) => BLEED.has(MAIN[d.id]);
  for (let i = 1; i < rest.length; i += 1) {
    if (!cut(rest[i - 1]) || !cut(rest[i])) continue;
    if (i + 1 < rest.length) [rest[i], rest[i + 1]] = [rest[i + 1], rest[i]];
    else if (i >= 2) [rest[i - 1], rest[i - 2]] = [rest[i - 2], rest[i - 1]];
  }
  return [...LARGE.map((id) => categories.find((c) => c.id === id)), ...rest];
}

function pickCollection(collection, count) {
  const rank = (o) => {
    const i = PREFER[collection].indexOf(modelKey(o));
    return i === -1 ? 99 : i;
  };
  /* An offer is "hard to find" only for buyers outside its seller's country. */
  const pool = purchasable()
    .filter((o) => inCollection(o, collection))
    .sort((a, b) => tier(a) - tier(b) || rank(a) - rank(b) || a.price - b.price);
  const out = [];
  const fresh = (o) => !out.some((x) => modelKey(x) === modelKey(o)) && !seen.has(modelKey(o));
  const varied = (o) => !out.some((x) => x.rayon === o.rayon || x.category === o.category || x.vendorId === o.vendorId);
  const tests = [(o) => fresh(o) && tier(o) === 0 && varied(o), (o) => fresh(o) && varied(o), fresh, (o) => !out.includes(o) && !out.some((x) => modelKey(x) === modelKey(o))];
  while (out.length < count) {
    let picked = null;
    for (const test of tests) {
      picked = pool.find(test);
      if (picked) break;
    }
    if (!picked) break;
    out.push(picked);
  }
  out.forEach((o) => seen.add(modelKey(o)));
  return out;
}

let worldFilter = 'all';

function pickWorld(count) {
  const base = purchasable().filter((o) => worldFilter === 'all' || vendor(o.vendorId).country === worldFilter);
  const withCut = base.filter((o) => cutout(modelKey(o)));
  const pool = (withCut.length ? withCut : base).sort((a, b) => tier(a) - tier(b) || a.price - b.price);
  const laneOf = (o) => (worldFilter === 'all' ? vendor(o.vendorId).country : o.category);
  const lanes = new Map();
  pool.forEach((o) => {
    if (!lanes.has(laneOf(o))) lanes.set(laneOf(o), []);
    lanes.get(laneOf(o)).push(o);
  });
  const order = worldFilter === 'all' ? COUNTRY_ORDER.filter((c) => lanes.has(c)) : [...lanes.keys()];
  const out = [];
  const models = new Set();
  for (const strict of [true, false]) {
    let moved = true;
    while (out.length < count && moved) {
      moved = false;
      for (const id of order) {
        const lane = lanes.get(id);
        const next = lane.find((o) => !models.has(modelKey(o)) && (!strict || tier(o) === 0));
        if (!next) continue;
        lane.splice(lane.indexOf(next), 1);
        out.push(next);
        models.add(modelKey(next));
        moved = true;
        if (out.length === count) break;
      }
    }
  }
  return out;
}

/* ---------- Sections ---------- */

function hero() {
  return `<div class="sky" data-sky aria-hidden="true"></div>
  <section class="hero surface-dark is-sky" aria-labelledby="hero-title">
    <div class="wrap hero-copy" data-hero-copy>
      <h1 class="display" id="hero-title" tabindex="-1" data-enter>
        <span class="line">${esc('Buy Duty Free,')}</span>
        <span class="line line--soft">${esc('without going through the airport')}</span>
      </h1>
      <p class="hero-pitch" data-enter>${esc('Discover deals from around the world and hard-to-find products, delivered to your home.')}</p>
      <div class="hero-search" data-enter>
        ${searchForm('hero', {
          labelText: `${esc('Search the offers delivering')} <strong data-dest-in>${esc(countryIn(state.country))}</strong>`,
          placeholder: 'Fragrance, headphones, suitcase, department…'
        })}
      </div>
    </div>
  </section>`;
}

function aisles() {
  const total = categories.reduce((sum, c) => sum + countNodes(c), 0);
  const cards = aisleOrder().map((d, i) => {
    const large = i < 3;
    const art = departmentArt(d.id, { large, avoid: seen });
    art.keys.forEach((k) => seen.add(k));
    const subs = (d.children || []).map((s) => label(s.name));
    return `<li class="aisle${large ? ' aisle--lg' : ''}" data-reveal>
      <a class="aisle-link" href="${catalogHref({ category: d.id })}">
        <div class="aisle-stage" aria-hidden="true">${art.html}</div>
        <div class="aisle-text">
          <h3 class="aisle-name">${esc(label(d.name))}</h3>
          <p class="aisle-subs" data-subs="${esc(JSON.stringify(subs.slice(0, 3)))}">${subs.slice(0, 3).map((s) => `<span class="nw">${esc(s)}</span>`).join(' · ')}</p>
          <p class="aisle-count">${esc(plural(countNodes(d), 'category', 'categories'))}</p>
        </div>
      </a>
    </li>`;
  }).join('');
  return `<section class="aisles surface-dark is-sky" id="rayons" aria-labelledby="rayons-title">
    <div class="wrap">
      <div class="section-head">
        <div>
          <h2 class="title-xl" id="rayons-title" data-reveal>${esc('All departments')}</h2>
          <p class="lead" data-reveal>${esc(`${categories.length} departments and ${total} categories, from fragrances to prefabricated houses. Each department covers its main goods and their accessories.`)}</p>
        </div>
        <a class="more" href="#/categories" data-reveal>${esc('See the full category tree')}${icon('arrow')}</a>
      </div>
      <ul class="aisle-grid" role="list">${cards}</ul>
    </div>
  </section>`;
}

function facts() {
  return `<section class="facts surface-light" aria-labelledby="facts-title">
    <h2 class="sr-only" id="facts-title">${esc('How DutyFreeDeal works')}</h2>
    <ul class="wrap facts-list" role="list">
      <li class="fact" data-reveal><h3>${esc('Delivered')} <span data-dest-in>${esc(countryIn(state.country))}</span>.</h3> <p>${esc('The catalogue brings together offers from around the world that their sellers deliver to your country.')}</p></li>
      <li class="fact" data-reveal><h3>${esc('Verified sellers.')}</h3> <p>${esc('Every seller is verified before listing anything; the procedure is simulated in this prototype.')}</p></li>
      <li class="fact" data-reveal><h3>${esc('One cart, one payment.')}</h3> <p>${esc('Several sellers, a single order,')} <a href="#panier-unique">${esc('see an example')}</a>.</p></li>
    </ul>
  </section>`;
}

const COLLECTION_TEXT = {
  deals: () => 'Advantageous prices from sellers around the world, with delivery shown separately.',
  rare: () => 'Products that are hard to find in your country, offered by sellers around the world.'
};

function promises() {
  const chosen = {};
  for (const c of ['rare', 'deals']) chosen[c] = pickCollection(c, 3);
  const column = (c) => {
    const n = shopOffers().filter((o) => inCollection(o, c)).length;
    const name = c === 'deals' ? 'Deals' : 'Hard to find';
    const more = c === 'deals'
      ? (n > 1 ? `See the ${n} deals delivering ${countryIn(state.country)}` : `See the deal delivering ${countryIn(state.country)}`)
      : (n > 1 ? `See the ${n} hard-to-find offers delivering ${countryIn(state.country)}` : `See the hard-to-find offer delivering ${countryIn(state.country)}`);
    return `<div class="promise" id="${c === 'deals' ? 'bons-plans' : 'introuvables'}">
      <h2 class="title-xl" data-reveal>${esc(name)}</h2>
      <p class="lead" data-reveal>${esc(COLLECTION_TEXT[c]())}</p>
      ${chosen[c].length ? `<ul class="offers" role="list">${chosen[c].map((o, i) => offerCard(o, { large: i === 0 })).join('')}</ul>`
        : `<p class="empty-note">${esc(`No offer from this selection delivers ${countryIn(state.country)} for now.`)}</p>`}
      ${n ? `<a class="more" href="${catalogHref({ collection: c })}" data-reveal>${esc(more)}${icon('arrow')}</a>` : ''}
    </div>`;
  };
  return `<section class="promises surface-light" aria-label="${esc('Selections')}"><div class="wrap promises-grid">${column('deals')}${column('rare')}</div></section>`;
}

function worldCounts() {
  const pool = purchasable();
  return { pool, counts: Object.fromEntries(COUNTRY_ORDER.map((c) => [c, pool.filter((o) => vendor(o.vendorId).country === c).length])) };
}

function worldInner() {
  const all = shopOffers();
  const { pool, counts } = worldCounts();
  if (worldFilter !== 'all' && !counts[worldFilter]) worldFilter = 'all';
  const list = pickWorld(8);
  const phrase = (codes) => {
    const parts = COUNTRY_ORDER.filter((c) => codes.has(c)).map((c) => countryIn(c).replace(/^to /, 'in '));
    const and = ' and ';
    return parts.length > 1 ? `${parts.slice(0, -1).join(', ')}${and}${parts[parts.length - 1]}` : parts[0] || '';
  };
  const codes = new Set(pool.map((o) => vendor(o.vendorId).country));
  const n = worldFilter === 'all' ? pool.length : counts[worldFilter];
  const scope = worldFilter === 'all' ? '' : ` from sellers ${countryIn(worldFilter).replace(/^to /, 'in ')}`;
  return {
    lead: pool.length
      ? `${plural(all.length, 'offer', 'offers')} delivering ${countryIn(state.country)}, ${pool.length} of them for direct purchase, from sellers ${phrase(codes)}. One listing per seller.`
      : `No direct-purchase offer delivers ${countryIn(state.country)} for now.`,
    chips: [['all', 'All', pool.length], ...COUNTRY_ORDER.filter((c) => counts[c]).map((c) => [c, countryName(c), counts[c]])],
    grid: list.length ? list.map((o) => offerCard(o)).join('') : `<li class="empty-note">${esc(`No offer from this country delivers ${countryIn(state.country)}.`)}</li>`,
    list,
    href: catalogHref({ mode: 'purchase', origin: worldFilter === 'all' ? '' : worldFilter }),
    more: n > 1 ? `See the ${n} direct-purchase offers${scope}` : `See the direct-purchase offer${scope}`,
    n
  };
}

function world() {
  const w = worldInner();
  w.list.forEach((o) => seen.add(modelKey(o)));
  return `<section class="world surface-light" id="monde" aria-labelledby="world-title">
    <div class="wrap">
      <div class="world-head">
        <div>
          <h2 class="title-xl" id="world-title" data-reveal>${esc('From around the world')}</h2>
          <p class="lead" data-reveal data-world-lead>${esc(w.lead)}</p>
        </div>
        <div class="chips-wrap" data-reveal>
          <p class="chips-label" id="chips-label">${esc('Seller country')}</p>
          <div class="chips" role="group" aria-labelledby="chips-label">${w.chips.map(([code, text, n]) => `<button class="chip-btn" type="button" data-chip="${code}" aria-pressed="${code === worldFilter}">${esc(text)}<small aria-hidden="true">${n}</small><span class="sr-only">: ${esc(plural(n, 'offer', 'offers'))}</span></button>`).join('')}</div>
        </div>
      </div>
      <ul class="offers offers--grid" role="list" data-grid>${w.grid}</ul>
      <div class="world-foot"><a class="more" href="${w.href}" data-world-all${w.n ? '' : ' hidden'}>${esc(w.more)}${icon('arrow')}</a></div>
    </div>
  </section>`;
}

const DEMO_PREFER = ['sunglasses', 'spices', 'coffee-beans', 'dog-collar', 'chocolate', 'fountain-pen', 'felt-hat', 'ceramic-vase', 'wooden-blocks', 'leather-boots', 'chef-knife', 'baby-rattle', 'pruning-shears', 'claw-hammer'];

function oneCart() {
  const rank = (o) => {
    const i = DEMO_PREFER.indexOf(modelKey(o));
    return i === -1 ? 99 : i;
  };
  const pool = purchasable().filter((o) => cutout(modelKey(o))).sort((a, b) => tier(a) - tier(b) || rank(a) - rank(b));
  const lines = [];
  for (const o of pool) {
    if (lines.length === 3) break;
    if (!lines.some((l) => vendor(l.vendorId).country === vendor(o.vendorId).country || modelKey(l) === modelKey(o))) lines.push(o);
  }
  lines.forEach((o) => seen.add(modelKey(o)));
  const products = lines.reduce((s, o) => s + o.price, 0);
  const delivery = lines.reduce((s, o) => s + Number(vendor(o.vendorId).shipping[state.country] || 0), 0);
  const card = lines.length < 2 ? '' : `<figure class="cart-card" data-reveal>
    <div class="cart-card-head"><strong>${esc('Example cart')}</strong><span>${esc(`Delivery ${countryIn(state.country)} · ${plural(lines.length, 'seller', 'sellers')}`)}</span></div>
    ${lines.map((o) => {
      const v = vendor(o.vendorId);
      return `<div class="demo-seller"><p>${esc(vendorName(v))} <span>· ${esc(sellerIn(v.country))}</span></p>
        <div class="demo-line">${thumb(o)}<span>${esc(label(o.name))}</span><span class="price">${esc(money(o.price))}</span></div>
        <div class="demo-ship"><span>${esc('Delivery, shipped by this seller')}</span><span>+ ${esc(money(v.shipping[state.country]))}</span></div></div>`;
    }).join('')}
    <div class="totals">
      <div><span>${esc('Products')}</span><span>${esc(money(products))}</span></div>
      <div><span>${esc(`Delivery (${plural(lines.length, 'shipment', 'shipments')})`)}</span><span>${esc(money(delivery))}</span></div>
      <div class="totals-grand"><span>${esc('Total')}</span><span>${esc(money(products + delivery))}</span></div>
    </div>
    <p class="demo-pay"><span>${esc('One payment')}</span><small>${esc('simulated in this prototype')}</small></p>
    <figcaption class="sr-only">${esc('Example cart bringing together sellers from different countries, demonstration data.')}</figcaption>
  </figure>`;
  return `<section class="onecart surface-studio" id="panier-unique" aria-labelledby="onecart-title">
    <div class="wrap onecart-grid">
      <div>
        <h2 class="title-xl" id="onecart-title" data-reveal>${esc('Several sellers.')} <span class="soft">${esc('One payment.')}</span></h2>
        <p class="lead" data-reveal>${esc('Each seller ships their part, and their delivery is counted separately before you pay.')}</p>
      </div>
      ${card}
    </div>
  </section>`;
}

function bigGoods() {
  const quotes = shopOffers().filter((o) => o.mode === 'quote');
  const pick = [quotes.find((o) => o.category === 'auto'), quotes.find((o) => o.category === 'construction')].filter(Boolean);
  const cards = pick.map((o) => {
    const v = vendor(o.vendorId);
    const key = modelKey(o);
    return `<article class="big-card" data-reveal>
      <a class="big-media" href="${productHref(o)}" tabindex="-1" aria-hidden="true"${cutout(key) ? ' data-cut' : ''}>${offerImage(o, { sizes: '(max-width: 900px) 80vw, 520px' })}</a>
      <div class="big-info">
        <h3><a href="${productHref(o)}">${esc(label(o.name))}</a></h3>
        <p class="big-seller">${esc(sellerIn(v.country))} · ${esc(vendorName(v))}</p>
        <dl class="facts-dl">
          <div><dt>${esc('Indicative price')}</dt><dd class="price">${esc(moneyRound(o.price))}</dd></div>
          <div><dt>${esc('Arrangement')}</dt><dd>${esc('Quote or reservation request')}</dd></div>
          <div><dt>${esc('Deposit')}</dt><dd>${esc('None, demonstration')}</dd></div>
          <div><dt>${esc('Transport and timing')}</dt><dd>${esc('To be specified in the quotation')}</dd></div>
        </dl>
        <a class="btn btn--primary" href="${productHref(o)}">${esc('Request a quote')}<span class="sr-only">: ${esc(label(o.name))}</span></a>
      </div>
    </article>`;
  }).join('');
  return `<section class="big surface-dark is-sky" aria-labelledby="big-title">
    <div class="wrap">
      <div class="section-head section-head--split">
        <h2 class="title-xl" id="big-title" data-reveal>${esc('Cars and houses,')} <span class="soft">${esc('on quotation')}</span></h2>
        <p class="lead" data-reveal>${esc('Large goods go through a quote or reservation request to the seller. In this demonstration: no payment, no deposit and no confirmed reservation.')}</p>
      </div>
      ${cards ? `<div class="big-grid">${cards}</div>` : `<p class="empty-note">${esc(`No large goods are offered ${countryIn(state.country)} in this demonstration.`)}</p>`}
    </div>
  </section>`;
}

function sell() {
  return `<section class="sell surface-light" aria-labelledby="sell-title">
    <div class="wrap sell-inner">
      <h2 class="title-xl" id="sell-title" data-reveal>${esc('Sell beyond your country.')}</h2>
      <div data-reveal>
        <p class="lead">${esc('Individuals and businesses, after a verification adapted to the seller’s country: KYC for individuals, KYB for businesses. Procedure simulated in this prototype.')}</p>
        <a class="btn btn--primary" href="#/sell">${esc('Become a vendor')}</a>
      </div>
    </div>
  </section>`;
}

/* ---------- View ---------- */

export function home() {
  seen = new Set();
  const html = [hero(), aisles(), facts(), promises(), world(), oneCart(), bigGoods(), sell()].join('');
  return {
    title: 'DutyFreeDeal · Buy Duty Free, without going through the airport',
    surface: 'dark',
    home: true,
    html,
    mount(main) {
      fitSubs(main);
      const stopSky = mountSky(main.querySelector('[data-sky]'));
      const onClick = (event) => {
        const chipBtn = event.target.closest('[data-chip]');
        if (!chipBtn || chipBtn.dataset.chip === worldFilter) return;
        worldFilter = chipBtn.dataset.chip;
        main.querySelectorAll('[data-chip]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.chip === worldFilter)));
        const grid = main.querySelector('[data-grid]');
        const apply = () => {
          seen = new Set(seen);
          const w = worldInner();
          grid.innerHTML = w.grid;
          main.querySelector('[data-world-lead]').textContent = w.lead;
          const link = main.querySelector('[data-world-all]');
          link.hidden = !w.n;
          link.href = w.href;
          link.innerHTML = `${esc(w.more)}${icon('arrow')}`;
          revealNow([...grid.querySelectorAll('.offer')]);
          announce(w.n > 1 ? `${w.n} offers shown` : '1 offer shown');
        };
        if (motionOK()) gsap.to(grid, { opacity: 0, duration: 0.22, ease: 'power1.out', onComplete: () => { apply(); gsap.set(grid, { opacity: 1 }); } });
        else apply();
      };
      main.addEventListener('click', onClick);
      const onResize = () => fitSubs(main);
      window.addEventListener('resize', onResize);
      if (document.fonts?.ready) document.fonts.ready.then(() => fitSubs(main));
      return () => {
        stopSky();
        main.removeEventListener('click', onClick);
        window.removeEventListener('resize', onResize);
      };
    }
  };
}

/** Keeps as many sub-categories as fit on one line, so that no separator starts or ends a line. */
function fitSubs(main) {
  main.querySelectorAll('.aisle-subs[data-subs]').forEach((p) => {
    const list = JSON.parse(p.dataset.subs);
    const html = (n) => list.slice(0, n).map((s) => `<span class="nw">${esc(s)}</span>`).join(' · ');
    p.innerHTML = html(1);
    const one = p.offsetHeight;
    for (let n = list.length; n >= 1; n -= 1) {
      p.innerHTML = html(n);
      if (p.offsetHeight <= one + 1) break;
    }
  });
}

export const views = { home };
export { RISE, RISE_TO, countries };
