/* DutyFreeDeal, direction « Studio » : rendu depuis window.DFD, interactions accessibles, une seule grammaire de mouvement. */
(() => {
  'use strict';

  const D = window.DFD;
  const STUDIO = window.DFD_STUDIO || {};
  const ICONS = window.DFD_ICONS || {};
  const STORE = 'dutyfreedeal-explo-studio';
  const REFONTE_STORE = 'dutyfreedeal-refonte-v1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const svg = (name, cls = '') => (ICONS[name]
    ? `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`
    : '');
  /* French typography for generated copy: narrow no-break space before high punctuation, no-break space after short words. */
  const fr = (s) => String(s)
    .replace(/ ([:;?!])/g, ' $1')
    .replace(/(^|\s)(à|au|aux|de|des|du|en|et|la|le|les|un|une|par|sur) /gi, '$1$2 ');
  /* "de" with elision before a vowel or a mute h ("d’Huile", but "de Hochet"). */
  const de = (s) => (/^([aeiouyàâéèêîïôû]|hu)/i.test(s) ? `d’${s}` : `de ${s}`);
  const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const roundPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  const IN = { FR: 'en France', ES: 'en Espagne', US: 'aux États-Unis', MX: 'au Mexique' };
  const SELLER_IN = { FR: 'Vendeur en France', ES: 'Vendeur en Espagne', US: 'Vendeur aux États-Unis', MX: 'Vendeur au Mexique' };
  const COUNTRY_ORDER = ['FR', 'ES', 'US', 'MX'];

  const offerById = new Map(D.offers.map((o) => [o.id, o]));
  const keyOf = (offer) => offer.image.split('/').pop().replace(/\.webp$/, '');
  const studio = (key) => STUDIO[key] || null;
  const sizeAttrs = (w, h) => (w && h ? ` width="${w}" height="${h}"` : '');

  /* A studio cut-out with a 480 px variant for small slots; `sizes` describes the rendered width. */
  function cutImg(key, { alt = '', sizes = '320px', lazy = true, small = false, priority = false } = {}) {
    const s = studio(key);
    if (!s) return '';
    const load = lazy ? ' loading="lazy" decoding="async"' : '';
    const pr = priority ? ' fetchpriority="high"' : '';
    if (small || !s.sm) return `<img src="./${esc((s.sm || s).file)}" alt="${esc(alt)}"${sizeAttrs((s.sm || s).w, (s.sm || s).h)}${load}${pr}>`;
    return `<img src="./${esc(s.sm.file)}" srcset="./${esc(s.sm.file)} ${s.sm.w}w, ./${esc(s.file)} ${s.w}w" sizes="${esc(sizes)}" alt="${esc(alt)}"${sizeAttrs(s.w, s.h)}${load}${pr}>`;
  }

  /* ---------- State : the refonte's storage is the reference, so the bag stays one across both ---------- */

  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  };

  function load() {
    const validDest = (c) => D.countries.some((x) => x.code === c);
    const refonte = read(REFONTE_STORE);
    if (refonte && refonte.version === 1) {
      return {
        dest: validDest(refonte.country) ? refonte.country : 'FR',
        bag: Object.fromEntries((Array.isArray(refonte.cart) ? refonte.cart : [])
          .filter((l) => l && offerById.has(l.id) && Number.isInteger(l.qty) && l.qty > 0)
          .map((l) => [l.id, Math.min(l.qty, 99)])),
        favs: new Set((Array.isArray(refonte.favorites) ? refonte.favorites : []).filter((id) => offerById.has(id))),
      };
    }
    const own = read(STORE) || {};
    return {
      dest: validDest(own.dest) ? own.dest : 'FR',
      bag: Object.fromEntries(Object.entries(own.bag || {}).filter(([id, qty]) => offerById.has(id) && qty > 0)),
      favs: new Set((own.favs || []).filter((id) => offerById.has(id))),
    };
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ dest: state.dest, bag: state.bag, favs: [...state.favs] }));
      const refonte = read(REFONTE_STORE) || {};
      localStorage.setItem(REFONTE_STORE, JSON.stringify({
        ...refonte,
        version: 1,
        lang: refonte.lang === 'en' ? 'en' : 'fr',
        requests: Array.isArray(refonte.requests) ? refonte.requests : [],
        country: state.dest,
        cart: Object.entries(state.bag).map(([id, qty]) => ({ id, qty })),
        favorites: [...state.favs],
      }));
    } catch {
      /* Storage can be unavailable (private mode); the page keeps working in memory. */
    }
  }

  const state = load();
  const deliverable = () => D.offersFor(state.dest);
  const purchasable = () => deliverable().filter((o) => o.mode === 'purchase' && o.stock > 0);
  const motionOK = () => Boolean(window.gsap) && !reducedMotion.matches;
  const RISE = { opacity: 0, y: 28 };
  const RISE_TO = { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07 };

  /* ---------- Page registry : each department keeps its main object for its own card, and no photograph is shown twice ---------- */

  const MAIN = {
    fashion: 'bag', beauty: 'powder-box', tech: 'portable-speaker', home: 'chair', kitchen: 'moka-pot', garden: 'watering-can',
    construction: 'cordless-drill', auto: 'car', sports: 'bicycle', toys: 'teddy-bear', baby: 'baby-bottles', food: 'olive-oil',
    pets: 'dog-bowl', books: 'books', office: 'notebooks',
  };
  const reserved = new Set(Object.values(MAIN));
  const shown = { showcase: new Set(), selections: new Set(), world: new Set(), cart: new Set() };
  const shownAll = () => new Set([...shown.showcase, ...shown.selections, ...shown.world, ...shown.cart]);
  /* 0: free photograph, 1: a department's main object, 2: already on the page, +3 without a studio cut-out. */
  const tier = (o, seen) => (seen.has(keyOf(o)) ? 2 : reserved.has(keyOf(o)) ? 1 : 0) + (studio(keyOf(o)) ? 0 : 3);

  /* ---------- Shared fragments ---------- */

  function favButton(offer) {
    return `<button class="fav" type="button" aria-pressed="${state.favs.has(offer.id)}" data-fav="${esc(offer.id)}">`
      + `<span class="sr-only">Favori : ${esc(offer.name)}</span>${svg('heart', 'off')}${svg('heartFill', 'on')}</button>`;
  }

  function addPill(offer, cls) {
    return `<button class="${cls}" type="button" data-add="${esc(offer.id)}">${svg('bag')}Ajouter<span class="sr-only"> ${esc(offer.name)} au panier</span></button>`;
  }

  function amounts(offer) {
    return `<div class="amounts"><p class="price">${D.price(offer.price)}</p><p class="ship">+ ${D.price(offer.shipping)} de livraison</p></div>`;
  }

  function thumb(offer, cls = 'thumb thumb--lg') {
    const key = keyOf(offer);
    return studio(key)
      ? `<span class="${cls}" aria-hidden="true">${cutImg(key, { small: true })}</span>`
      : `<span class="${cls}" aria-hidden="true"><img class="cover" src="${esc(offer.image)}" alt="" loading="lazy"></span>`;
  }

  /* ---------- Showcase ---------- */

  const SHOW_SCALE = { perfume: 0.84, headphones: 1, camera: 0.78 };

  function renderShowcase() {
    const list = D.showcaseFor(state.dest);
    shown.showcase = new Set(list.map(keyOf));
    $('[data-show-title]').textContent = fr(`Vitrine : ${plural(list.length, 'offre livrable', 'offres livrables')} ${IN[state.dest]}`);
    $('[data-showcase]').innerHTML = list.length ? list.map((o, i) => {
      const key = keyOf(o);
      const image = studio(key)
        ? cutImg(key, { alt: o.imageAlt, sizes: '(max-width: 640px) 70vw, 320px', lazy: false, priority: i === 0 })
        : `<img src="${esc(o.image)}" alt="${esc(o.imageAlt)}">`;
      return `<article class="show-item" style="--s:${SHOW_SCALE[key] || 0.9}">
        <a class="show-media" href="../../#/product/${esc(o.id)}" tabindex="-1" aria-hidden="true">${image}</a>
        <div class="show-info">
          <h3 class="show-name"><a href="../../#/product/${esc(o.id)}">${esc(o.name)}</a></h3>
          <p class="show-seller">${SELLER_IN[o.from.code]} · ${esc(o.vendor.name)}</p>
          <div class="buy">${amounts(o)}${addPill(o, 'pill')}${favButton(o)}</div>
        </div>
      </article>`;
    }).join('') : `<p class="show-seller">${esc(fr(`Aucune offre à présenter ${IN[state.dest]} pour l’instant.`))}</p>`;
  }

  /* ---------- Offer component (selections and grid) ---------- */

  function offer(o, { large = false } = {}) {
    const key = keyOf(o);
    const media = studio(key)
      ? cutImg(key, { alt: o.imageAlt, sizes: large ? '(max-width: 900px) 60vw, 300px' : '(max-width: 900px) 40vw, 220px' })
      : `<img class="cover" src="${esc(o.image)}" alt="${esc(o.imageAlt)}" loading="lazy" decoding="async">`;
    return `<li class="offer${large ? ' offer--lg' : ''}" data-reveal>
      <a class="offer-media" href="../../#/product/${esc(o.id)}" tabindex="-1" aria-hidden="true"${studio(key) ? ' data-cut' : ''}>${media}</a>
      ${favButton(o)}
      <div class="offer-body">
        <h3 class="offer-name"><a href="../../#/product/${esc(o.id)}">${esc(o.name)}</a></h3>
        <p class="offer-seller">${SELLER_IN[o.from.code]} · ${esc(o.vendor.name)}</p>
        <div class="buy">${amounts(o)}${addPill(o, 'pill pill--dark')}</div>
      </div>
    </li>`;
  }

  /* ---------- Bons plans | Introuvables ---------- */

  const PREFER = {
    deals: ['portable-speaker', 'cordless-drill', 'sneakers', 'watch', 'cast-iron-skillet', 'tennis-racket', 'wooden-blocks',
      'claw-hammer', 'chocolate', 'pruning-shears', 'mechanical-keyboard', 'sunglasses', 'moka-pot', 'bicycle', 'olive-oil'],
    rare: ['felt-hat', 'ceramic-vase', 'chef-knife', 'leather-boots', 'coffee-beans', 'fountain-pen', 'baby-rattle', 'dog-collar',
      'spices', 'powder-box', 'chair', 'teddy-bear', 'bag', 'books'],
  };

  /* An offer is "hard to find" only for buyers outside its seller's country; models, departments and sellers vary. */
  function pick(collection, count) {
    const showcaseVendors = new Set(D.showcaseFor(state.dest).map((o) => o.vendorId));
    const rank = (o) => {
      const i = PREFER[collection].indexOf(keyOf(o));
      return i === -1 ? 99 : i;
    };
    const seen = new Set([...shown.showcase, ...shown.selections]);
    const pool = deliverable()
      .filter((o) => o.mode === 'purchase' && o.stock > 0 && o.collections.includes(collection)
        && !seen.has(keyOf(o)) && (collection !== 'rare' || o.from.code !== state.dest))
      .sort((a, b) => tier(a, seen) - tier(b, seen) || rank(a) - rank(b) || a.price - b.price);
    const out = [];
    const fresh = (o) => !out.includes(o) && !out.some((x) => keyOf(x) === keyOf(o));
    const varied = (o) => !out.some((x) => x.rayon === o.rayon || x.vendorId === o.vendorId);
    const free = (o) => tier(o, seen) === 0;
    /* Tests from the most to the least demanding; each pick restarts from the best candidates. */
    const firstTests = [(o) => free(o) && !showcaseVendors.has(o.vendorId), free, (o) => !showcaseVendors.has(o.vendorId), () => true];
    const nextTests = [(o) => free(o) && varied(o), varied, () => true];
    while (out.length < count) {
      const tests = out.length ? nextTests : firstTests;
      let picked = null;
      for (const test of tests) {
        picked = pool.find((o) => fresh(o) && test(o));
        if (picked) break;
      }
      if (!picked) break;
      out.push(picked);
    }
    return out;
  }

  function renderPromises() {
    shown.selections = new Set();
    const words = { deals: ['bon plan', 'bons plans', 'le '], rare: ['introuvable', 'introuvables', 'l’'] };
    const chosen = {};
    for (const collection of ['rare', 'deals']) {
      chosen[collection] = pick(collection, 3);
      chosen[collection].forEach((o) => shown.selections.add(keyOf(o)));
    }
    for (const collection of ['deals', 'rare']) {
      $(`[data-collection-text="${collection}"]`).textContent = fr(D.collections[collection].text);
      const list = chosen[collection];
      $(`[data-tiles="${collection}"]`).innerHTML = list.length
        ? list.map((o, i) => offer(o, { large: i === 0 })).join('')
        : `<li class="empty-note">${esc(fr(`Aucune offre de cette sélection n’est livrable ${IN[state.dest]} pour l’instant.`))}</li>`;
      const n = deliverable().filter((o) => o.collections.includes(collection)).length;
      const [one, many, article] = words[collection];
      const link = $(`[data-more="${collection}"]`);
      link.hidden = n === 0;
      const label = n > 1 ? `Voir les ${n} ${many} livrables ${IN[state.dest]}` : `Voir ${article}${one} livrable ${IN[state.dest]}`;
      link.innerHTML = `${esc(fr(label))} ${svg('arrow')}`;
    }
  }

  /* ---------- Du monde entier ---------- */

  let worldFilter = 'all';

  /* Eight cut-outs; with « Tous », seller countries alternate so that every row shows the whole world. */
  function pickWorld(count) {
    const base = purchasable().filter((o) => worldFilter === 'all' || o.from.code === worldFilter);
    const withCut = base.filter((o) => studio(keyOf(o)));
    const pool = withCut.length ? withCut : base;
    const seen = new Set([...shown.showcase, ...shown.selections]);
    const order = D.departments.map((d) => d.id);
    const ranked = [...pool].sort((a, b) => tier(a, seen) - tier(b, seen) || order.indexOf(a.rayon) - order.indexOf(b.rayon) || a.price - b.price);
    const laneOf = (o) => (worldFilter === 'all' ? o.from.code : o.rayon);
    const lanes = new Map();
    ranked.forEach((o) => {
      if (!lanes.has(laneOf(o))) lanes.set(laneOf(o), []);
      lanes.get(laneOf(o)).push(o);
    });
    const laneOrder = worldFilter === 'all' ? COUNTRY_ORDER.filter((c) => lanes.has(c)) : [...lanes.keys()];
    const out = [];
    const models = new Set();
    const rayons = new Set();
    for (const strict of [true, false]) {
      let moved = true;
      while (out.length < count && moved) {
        moved = false;
        for (const id of laneOrder) {
          const lane = lanes.get(id);
          const next = lane.find((o) => !models.has(keyOf(o)) && (!strict || (tier(o, seen) === 0 && !rayons.has(o.rayon))));
          if (!next) continue;
          lane.splice(lane.indexOf(next), 1);
          out.push(next);
          models.add(keyOf(next));
          rayons.add(next.rayon);
          moved = true;
          if (out.length === count) break;
        }
      }
    }
    return out;
  }

  function sellerCountriesPhrase(codes) {
    const parts = COUNTRY_ORDER.filter((c) => codes.has(c)).map((c) => IN[c]);
    return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}` : parts[0] || '';
  }

  function worldCounts() {
    const pool = purchasable();
    return { pool, counts: Object.fromEntries(COUNTRY_ORDER.map((c) => [c, pool.filter((o) => o.from.code === c).length])) };
  }

  function renderChips() {
    const { pool, counts } = worldCounts();
    if (worldFilter !== 'all' && !counts[worldFilter]) worldFilter = 'all';
    const chips = [['all', 'Tous', pool.length], ...COUNTRY_ORDER.filter((c) => counts[c]).map((c) => [c, D.country(c).name, counts[c]])];
    $('[data-chips]').innerHTML = chips.map(([code, label, n]) => `<button class="chip" type="button" data-chip="${code}" aria-pressed="${code === worldFilter}">`
      + `${esc(label)}<small aria-hidden="true">${n}</small><span class="sr-only"> : ${plural(n, 'offre', 'offres')} en achat direct</span></button>`).join('');
  }

  function renderWorld() {
    const all = deliverable();
    const { pool, counts } = worldCounts();
    const codes = new Set(pool.map((o) => o.from.code));
    $('[data-world-lead]').textContent = pool.length
      ? fr(`${plural(all.length, 'offre livrable', 'offres livrables')} ${IN[state.dest]}, dont ${pool.length} en achat direct, proposées par des vendeurs ${sellerCountriesPhrase(codes)}. Une fiche par vendeur.`)
      : fr(`Aucune offre en achat direct n’est livrable ${IN[state.dest]} pour l’instant.`);
    const list = pickWorld(8);
    shown.world = new Set(list.map(keyOf));
    $('[data-grid]').innerHTML = list.length
      ? list.map((o) => offer(o)).join('')
      : `<li class="world-empty">${esc(fr(`Aucune offre de ce pays n’est livrable ${IN[state.dest]}.`))}</li>`;
    const n = worldFilter === 'all' ? pool.length : counts[worldFilter];
    const link = $('[data-world-all]');
    link.hidden = n === 0;
    link.href = `../../#/catalog?mode=purchase${worldFilter === 'all' ? '' : `&origin=${worldFilter}`}`;
    const scope = worldFilter === 'all' ? '' : ` de vendeurs ${IN[worldFilter]}`;
    link.innerHTML = `${esc(fr(n > 1 ? `Voir les ${n} offres en achat direct${scope}` : `Voir l’offre en achat direct${scope}`))} ${svg('arrow')}`;
  }

  function setWorldFilter(code) {
    if (code === worldFilter) return;
    worldFilter = code;
    $$('[data-chip]').forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.chip === code)));
    const grid = $('[data-grid]');
    const apply = () => {
      renderWorld();
      renderOneCart();
      renderAisles();
      if (motionOK()) {
        gsap.fromTo($$('.offer', grid), RISE, { ...RISE_TO, stagger: 0.05 });
        registerReveals($('[data-aisles]'));
      }
      const { pool, counts } = worldCounts();
      const n = code === 'all' ? pool.length : counts[code];
      announce(fr(`${plural(n, 'offre', 'offres')} en achat direct${code === 'all' ? '' : ` de vendeurs ${IN[code]}`}, ${n > 1 ? 'livrables' : 'livrable'} ${IN[state.dest]}.`));
    };
    if (motionOK()) {
      gsap.to(grid, { opacity: 0, duration: 0.22, ease: 'power1.out', onComplete: () => { apply(); gsap.set(grid, { opacity: 1 }); } });
    } else {
      apply();
    }
  }

  /* ---------- Plusieurs vendeurs, un seul paiement ---------- */

  const DEMO_PREFER = ['sunglasses', 'spices', 'coffee-beans', 'dog-collar', 'chocolate', 'fountain-pen', 'felt-hat', 'ceramic-vase',
    'wooden-blocks', 'leather-boots', 'chef-knife', 'baby-rattle', 'pruning-shears', 'claw-hammer'];

  function renderOneCart() {
    const seen = new Set([...shown.showcase, ...shown.selections, ...shown.world]);
    const rank = (o) => {
      const i = DEMO_PREFER.indexOf(keyOf(o));
      return i === -1 ? 99 : i;
    };
    const pool = purchasable().filter((o) => studio(keyOf(o)) && !shown.showcase.has(keyOf(o)))
      .sort((a, b) => tier(a, seen) - tier(b, seen) || rank(a) - rank(b));
    const lines = [];
    for (const o of pool) {
      if (lines.length === 3) break;
      if (!lines.some((l) => l.from.code === o.from.code || keyOf(l) === keyOf(o))) lines.push(o);
    }
    shown.cart = new Set(lines.map(keyOf));
    const figure = $('.onecart-visual');
    figure.hidden = lines.length < 2;
    if (lines.length < 2) return;
    const products = lines.reduce((sum, o) => sum + o.price, 0);
    const shipping = lines.reduce((sum, o) => sum + o.shipping, 0);
    $('[data-cart-demo]').innerHTML = `<div class="cart-card-head"><strong>Exemple de panier</strong><span>${esc(fr(`Livraison ${IN[state.dest]} · ${plural(lines.length, 'vendeur', 'vendeurs')}`))}</span></div>
      ${lines.map((o) => `<div class="demo-seller">
        <p>${esc(o.vendor.name)} <span>· ${SELLER_IN[o.from.code]}</span></p>
        <div class="demo-line">${thumb(o, 'thumb')}<span>${esc(o.name)}</span><span class="price">${D.price(o.price)}</span></div>
        <div class="demo-ship"><span>Livraison, expédiée par ce vendeur</span><span>+ ${D.price(o.shipping)}</span></div>
      </div>`).join('')}
      <div class="demo-total">
        <div><span>Produits</span><span class="price">${D.price(products)}</span></div>
        <div><span>Livraison (${plural(lines.length, 'expédition', 'expéditions')})</span><span class="price">${D.price(shipping)}</span></div>
        <div class="grand"><span>Total</span><span class="price">${D.price(products + shipping)}</span></div>
      </div>
      <p class="demo-pay"><span>Un seul paiement</span><small>simulé dans la maquette</small></p>`;
  }

  /* ---------- Rayons : compositions of real cut-outs, with plausible relative sizes ---------- */

  const AISLE = {
    fashion: ['leather-boots', 'felt-hat', 'watch', 'sneakers', 'sunglasses'],
    beauty: ['perfume'],
    tech: ['mechanical-keyboard', 'headphones', 'camera'],
    home: ['ceramic-vase'],
    kitchen: ['chef-knife', 'cast-iron-skillet'],
    garden: ['pruning-shears'],
    construction: ['claw-hammer'],
    auto: [],
    sports: ['tennis-racket'],
    toys: ['wooden-blocks'],
    baby: ['baby-rattle'],
    food: ['coffee-beans', 'chocolate', 'spices'],
    pets: ['dog-collar'],
    books: [],
    office: ['fountain-pen'],
  };
  /* Height of each object as a share of the stage height. */
  const SIZE = {
    bag: 62, 'leather-boots': 26, 'felt-hat': 34, watch: 17, sneakers: 27, sunglasses: 13, 'powder-box': 42, perfume: 64,
    'portable-speaker': 50, 'mechanical-keyboard': 48, headphones: 64, camera: 40, chair: 72, 'ceramic-vase': 34, 'moka-pot': 56,
    'chef-knife': 20, 'cast-iron-skillet': 22, 'watering-can': 56, 'cordless-drill': 60, 'claw-hammer': 18, car: 46, bicycle: 56,
    'tennis-racket': 38, 'teddy-bear': 58, 'wooden-blocks': 30, 'baby-bottles': 48, 'baby-rattle': 25, 'olive-oil': 58,
    'coffee-beans': 30, chocolate: 30, spices: 34, 'dog-bowl': 42, 'dog-collar': 21, books: 62, notebooks: 50, 'fountain-pen': 9,
  };
  /* Photographs cut at their right edge: they sit flush against the card's right edge so the cut reads as intended. */
  const BLEED = new Set(['books', 'notebooks']);
  /* The three large cards open with departments whose main object holds the frame alone. */
  const LARGE = ['fashion', 'home', 'sports'];
  const SUBS = { auto: [0, 3, 1] };

  function composition(dept, large) {
    const ratio = large ? 5 / 4 : 4 / 3;
    const used = shownAll();
    const main = MAIN[dept];
    const extras = (AISLE[dept] || []).filter((k) => studio(k) && !used.has(k) && !reserved.has(k));
    /* The main object leaves the card only when it is already on the page and the department has other objects to show. */
    const lead = used.has(main) && extras.length ? [] : [main];
    let items = [...lead, ...extras].filter((k) => studio(k)).slice(0, 3).map((k, i) => {
      const h = Math.min((SIZE[k] || 40) * (large && i === 0 ? 1.1 : 1), 74);
      return { k, h, w: (h * (STUDIO[k].w / STUDIO[k].h)) / ratio };
    });
    const free = () => items.filter((it) => !BLEED.has(it.k));
    while (free().length > 1 && free().reduce((s, it) => s + it.w, 0) > 88) {
      const smallest = free().reduce((a, b) => (a.h <= b.h ? a : b));
      items = items.filter((it) => it !== smallest);
    }
    const bleed = items.find((it) => BLEED.has(it.k));
    /* One object alone fills the card the way a product shot would: about 58 % of the height, 64 % of the width at most. */
    if (items.length === 1 && !bleed) {
      const it = items[0];
      const target = Math.min(large ? 66 : 58, (64 * ratio * STUDIO[it.k].h) / STUDIO[it.k].w);
      if (target > it.h) {
        it.w *= target / it.h;
        it.h = target;
      }
    }
    const row = free().sort((a, b) => b.h - a.h);
    const ordered = row.length === 3 ? [row[1], row[0], row[2]] : row;
    const gap = ordered.length > 1 ? -Math.min(...ordered.map((it) => it.w)) * 0.12 : 0;
    const total = ordered.reduce((s, it) => s + it.w, 0) + gap * (ordered.length - 1);
    const centre = bleed ? Math.max(30, (100 - bleed.w * 0.6) / 2) : 50;
    let left = centre - total / 2;
    const sizes = large ? '(max-width: 900px) 45vw, 260px' : '(max-width: 900px) 40vw, 200px';
    const parts = ordered.map((it) => {
      const x = Math.min(Math.max(left + it.w / 2, it.w / 2 + 3), 97 - it.w / 2);
      left += it.w + gap;
      return `<span class="obj" style="--h:${it.h.toFixed(1)}%;--x:${x.toFixed(1)}%;--z:${it === row[0] ? 2 : 3}">${cutImg(it.k, { sizes })}</span>`;
    });
    if (bleed) parts.unshift(`<span class="obj obj--bleed" style="--h:${bleed.h}%;--z:1">${cutImg(bleed.k, { sizes })}</span>`);
    return parts.join('');
  }

  const subsList = (d) => (SUBS[d.id] ? SUBS[d.id].map((i) => d.subcategories[i]).filter(Boolean) : d.subcategories.slice(0, 3));
  const subsHtml = (list) => list.map((s) => `<span class="nw">${esc(s)}</span>`).join(' · ');

  /* Keeps as many sub-categories as fit on one line, so that no separator starts or ends a line. */
  function fitSubs() {
    $$('.aisle-subs[data-subs]').forEach((p) => {
      const list = JSON.parse(p.dataset.subs);
      p.innerHTML = subsHtml(list.slice(0, 1));
      const oneLine = p.offsetHeight;
      for (let n = list.length; n >= 1; n -= 1) {
        p.innerHTML = subsHtml(list.slice(0, n));
        if (p.offsetHeight <= oneLine + 1) break;
      }
    });
  }

  function aisleOrder() {
    const rest = D.departments.filter((d) => !LARGE.includes(d.id));
    /* The cards whose photograph is cut at the right edge are never side by side. */
    const cut = (d) => BLEED.has(MAIN[d.id]);
    for (let i = 1; i < rest.length; i += 1) {
      if (!cut(rest[i - 1]) || !cut(rest[i])) continue;
      if (i + 1 < rest.length) [rest[i], rest[i + 1]] = [rest[i + 1], rest[i]];
      else if (i >= 2) [rest[i - 1], rest[i - 2]] = [rest[i - 2], rest[i - 1]];
    }
    return [...LARGE.map((id) => D.department(id)), ...rest];
  }

  function renderAisles() {
    renderAisleCards();
    fitSubs();
  }

  function renderAisleCards() {
    const total = D.departments.reduce((sum, d) => sum + d.categoryCount, 0);
    $('[data-aisles-lead]').textContent = fr(`${D.departments.length} rayons et ${total} catégories, des parfums aux maisons préfabriquées. Chaque rayon couvre ses biens principaux et leurs accessoires.`);
    $('[data-aisles]').innerHTML = aisleOrder().map((d, i) => `<li class="aisle${i < 3 ? ' aisle--lg' : ''}" data-reveal>
        <a class="aisle-link" href="../../#/catalog?category=${esc(d.id)}">
          <div class="aisle-stage" aria-hidden="true">${composition(d.id, i < 3)}</div>
          <div class="aisle-text">
            <h3 class="aisle-name">${esc(d.name)}</h3>
            <p class="aisle-subs" data-subs="${esc(JSON.stringify(subsList(d)))}">${subsHtml(subsList(d))}</p>
            <p class="aisle-count">${plural(d.categoryCount, 'catégorie', 'catégories')}</p>
          </div>
        </a>
      </li>`).join('');
  }

  /* ---------- Gros biens ---------- */

  function renderBig() {
    const quotes = deliverable().filter((o) => o.mode === 'quote');
    const block = (o) => {
      const key = keyOf(o);
      const media = studio(key)
        ? cutImg(key, { alt: '', sizes: '(max-width: 900px) 80vw, 500px' })
        : `<img class="cover" src="${esc(o.image)}" alt="" loading="lazy" decoding="async">`;
      return `<article class="big-card${studio(key) ? ' big-card--studio' : ''}" data-reveal>
        <a class="big-media" href="../../#/product/${esc(o.id)}" tabindex="-1" aria-hidden="true">${media}</a>
        <div class="big-info">
          <h3><a href="../../#/product/${esc(o.id)}">${esc(o.name)}</a></h3>
          <p class="seller">${SELLER_IN[o.from.code]} · ${esc(o.vendor.name)}</p>
          <dl class="big-facts">
            <dt>Prix indicatif</dt><dd class="price">${roundPrice.format(o.price)}</dd>
            <dt>Modalité</dt><dd>Demande de devis ou de réservation</dd>
            <dt>Acompte</dt><dd>Aucun, démonstration</dd>
            <dt>Transport et délai</dt><dd>À préciser dans le devis</dd>
          </dl>
          <a class="btn btn--light" href="../../#/product/${esc(o.id)}">Demander un devis<span class="sr-only"> : ${esc(o.name)}</span></a>
        </div>
      </article>`;
    };
    const blocks = [quotes.find((o) => o.rayon === 'auto'), quotes.find((o) => o.rayon === 'construction')].filter(Boolean).map(block);
    $('[data-big]').innerHTML = blocks.length ? blocks.join('') : `<p class="big-empty">${esc(fr(`Aucun gros bien n’est proposé ${IN[state.dest]} dans cette démonstration.`))}</p>`;
  }

  /* ---------- Menu des rayons : univers à gauche, catégories à droite, filtre ---------- */

  let menuDept = 'fashion';
  let menuQuery = '';

  const deptMatches = (d, q) => !q || norm(d.name).includes(q)
    || d.tree.some((s) => norm(s.name).includes(q) || s.children.some((l) => norm(l.name).includes(q)));

  function renderRayonsPanel() {
    $('[data-panel="rayons"]').innerHTML = `<div class="rm-head">
        <label class="rm-filter">${svg('search')}<span class="sr-only">Filtrer les rayons et les catégories</span>
          <input type="search" placeholder="Filtrer les rayons et les catégories" autocomplete="off" data-rm-filter></label>
        <a class="more" href="../../#/categories">Arborescence complète</a>
        <button class="close-btn" type="button" data-close aria-label="Fermer le menu des rayons">${svg('close')}</button>
      </div>
      <div class="rm-body">
        <ul class="rm-list" role="list" aria-label="Rayons" data-rm-list></ul>
        <div class="rm-detail" data-rm-detail></div>
      </div>`;
    renderRmList();
    renderRmDetail();
  }

  function renderRmList() {
    const q = norm(menuQuery.trim());
    const list = D.departments.filter((d) => deptMatches(d, q));
    if (list.length && !list.some((d) => d.id === menuDept)) menuDept = list[0].id;
    $('[data-rm-list]').innerHTML = list.length ? list.map((d) => `<li><button class="rm-item" type="button" data-rm="${d.id}" aria-current="${d.id === menuDept}">`
      + `<span class="thumb" aria-hidden="true">${cutImg(MAIN[d.id], { small: true })}</span><span>${esc(d.name)}</span></button></li>`).join('')
      : `<li class="rm-empty">${esc(fr(`Aucun rayon ne correspond à « ${menuQuery.trim()} ».`))}</li>`;
  }

  function renderRmDetail() {
    const d = D.department(menuDept);
    const q = norm(menuQuery.trim());
    const target = $('[data-rm-detail]');
    if (!d || !deptMatches(d, q)) {
      target.innerHTML = '';
      return;
    }
    const groups = d.tree.map((s) => {
      const leaves = q && !norm(d.name).includes(q) && !norm(s.name).includes(q) ? s.children.filter((l) => norm(l.name).includes(q)) : s.children;
      if (q && !norm(d.name).includes(q) && !norm(s.name).includes(q) && !leaves.length) return '';
      return `<div class="rm-group"><h4><a href="../../#/catalog?category=${esc(s.id)}">${esc(s.name)}</a></h4>
        <ul role="list">${leaves.map((l) => `<li><a href="../../#/catalog?category=${esc(l.id)}">${esc(l.name)}</a></li>`).join('')}</ul></div>`;
    }).join('');
    target.innerHTML = `<div class="rm-detail-head"><h3>${esc(d.name)}</h3><a class="more" href="../../#/catalog?category=${esc(d.id)}">Voir tout le rayon ${svg('arrow')}</a></div>
      <div class="rm-groups">${groups}</div>`;
  }

  function selectRm(id, focus = false) {
    menuDept = id;
    $$('[data-rm]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.rm === id)));
    renderRmDetail();
    if (focus) $(`[data-rm="${id}"]`)?.focus();
  }

  function renderMenuPanel() {
    $('[data-panel="menu"]').innerHTML = `<div class="bag-top"><div class="bag-head"><h2 id="menu-title">Menu</h2>
        <button class="close-btn" type="button" data-close aria-label="Fermer le menu">${svg('close')}</button></div></div>
      <ul class="menu-links" role="list">
        <li><a href="#rayons">Tous les rayons</a></li>
        <li><a href="#bons-plans">Bons plans</a></li>
        <li><a href="#introuvables">Introuvables</a></li>
        <li><a href="../../#/orders">Mes commandes</a></li>
        <li><a href="../../#/sell">Vendre sur DutyFreeDeal</a></li>
      </ul>
      <div class="lang" role="group" aria-label="Langue">
        <button type="button" aria-pressed="true" lang="fr" data-lang="fr">FR</button>
        <button type="button" aria-pressed="false" lang="en" data-lang="en">EN</button>
      </div>`;
  }

  /* ---------- Destination, bag, favourites ---------- */

  function renderDestPanel() {
    $('[data-panel="dest"]').innerHTML = `<p class="dest-intro">${esc(fr('Le catalogue affiche les offres que leurs vendeurs livrent dans ce pays. La langue reste un réglage séparé.'))}</p>
      ${D.countries.map((c) => `<button class="dest-option" type="button" data-dest="${c.code}" aria-current="${c.code === state.dest}">`
        + `${esc(c.name)}<small>${plural(D.offersFor(c.code).length, 'offre', 'offres')}</small></button>`).join('')}`;
  }

  function renderBag() {
    const entries = Object.entries(state.bag).filter(([, qty]) => qty > 0);
    const groups = new Map();
    for (const [id, qty] of entries) {
      const o = offerById.get(id);
      const vendor = D.vendor(o.vendorId);
      if (!groups.has(vendor.id)) groups.set(vendor.id, { vendor, lines: [] });
      groups.get(vendor.id).lines.push({ o, qty });
    }
    let products = 0;
    let shipping = 0;
    let shipments = 0;
    const blocks = [...groups.values()].map(({ vendor, lines }) => {
      const ok = vendor.deliveryTo.includes(state.dest);
      if (ok) {
        products += lines.reduce((sum, l) => sum + l.o.price * l.qty, 0);
        shipping += vendor.shipping[state.dest];
        shipments += 1;
      }
      const titleId = `bag-seller-${esc(vendor.id)}`;
      return `<div class="bag-seller" role="group" aria-labelledby="${titleId}">
        <h3 id="${titleId}">${esc(vendor.name)}</h3>
        <p>${SELLER_IN[vendor.country]}</p>
        ${lines.map(({ o, qty }) => `<div class="bag-line">${thumb(o)}
          <div><strong>${esc(o.name)}</strong>
            <div class="qty" role="group" aria-label="${esc(`Quantité : ${o.name}`)}">
              <button type="button" data-qty="${esc(o.id)}" data-step="-1" aria-label="${esc(`Retirer un exemplaire ${de(o.name)}`)}">−</button>
              <output>${qty}</output>
              <button type="button" data-qty="${esc(o.id)}" data-step="1" aria-label="${esc(`Ajouter un exemplaire ${de(o.name)}`)}">+</button>
              <button class="remove-btn" type="button" data-remove="${esc(o.id)}">Retirer<span class="sr-only"> ${esc(o.name)}</span></button>
            </div>
          </div>
          <span class="price">${D.price(o.price * qty)}</span>
        </div>`).join('')}
        ${ok
          ? `<div class="ship-line"><span>${esc(fr(`Livraison ${IN[state.dest]}, expédiée par ce vendeur`))}</span><span class="price">+ ${D.price(vendor.shipping[state.dest])}</span></div>`
          : `<p class="not-deliverable">${esc(fr(`Ce vendeur ne livre pas ${IN[state.dest]} : ces articles ne sont pas comptés.`))}</p>`}
      </div>`;
    }).join('');
    const foot = `<div class="bag-foot">
        <div class="bag-total">
          <div><span>Produits</span><span class="price">${D.price(products)}</span></div>
          <div><span>Livraison (${plural(shipments, 'expédition', 'expéditions')})</span><span class="price">${D.price(shipping)}</span></div>
          <div class="grand"><span>Total</span><span class="price">${D.price(products + shipping)}</span></div>
        </div>
        <p class="bag-pay">${esc(fr('Un seul paiement pour toute la commande. Paiement simulé : aucune transaction réelle.'))}</p>
        <a class="btn btn--light bag-cta" href="../../#/checkout">Passer commande</a>
      </div>`;
    $('[data-panel="bag"]').innerHTML = `<div class="bag-top"><div class="bag-head"><h2 id="bag-title">Panier</h2>
        <button class="close-btn" type="button" data-close aria-label="Fermer le panier">${svg('close')}</button></div>
        <p class="bag-note">${esc(fr('Un seul panier, des expéditions organisées par vendeur.'))}</p></div>
      ${entries.length ? `<div class="bag-scroll">${blocks}</div>${foot}` : '<div class="bag-scroll"><p class="bag-empty">Votre panier est vide.</p></div>'}`;
  }

  function renderFavs() {
    const list = [...state.favs].map((id) => offerById.get(id)).filter(Boolean);
    $('[data-panel="favs"]').innerHTML = `<div class="bag-top"><div class="bag-head"><h2 id="favs-title">Favoris</h2>
        <button class="close-btn" type="button" data-close aria-label="Fermer les favoris">${svg('close')}</button></div>
        <p class="bag-note">${esc(fr('Enregistrés dans cette maquette, sur cet appareil.'))}</p></div>
      <div class="bag-scroll">${list.length ? list.map((o) => {
        const vendor = D.vendor(o.vendorId);
        const ok = vendor.deliveryTo.includes(state.dest);
        return `<div class="bag-line">${thumb(o)}
          <div><strong><a href="../../#/product/${esc(o.id)}">${esc(o.name)}</a></strong>
            <p class="ship">${ok ? `+ ${D.price(vendor.shipping[state.dest])} de livraison` : esc(fr(`Ne livre pas ${IN[state.dest]}`))}</p>
            <button class="remove-btn" type="button" data-unfav="${esc(o.id)}">Retirer des favoris<span class="sr-only"> : ${esc(o.name)}</span></button>
          </div>
          <span class="price">${D.price(o.price)}</span>
        </div>`;
      }).join('') : '<p class="bag-empty">Aucun favori pour l’instant.</p>'}</div>`;
  }

  /* ---------- Panels ---------- */

  let openName = null;
  let opener = null;

  function openPanel(name, trigger) {
    if (openName === name) {
      closePanel();
      return;
    }
    closePanel(false);
    const panel = $(`[data-panel="${name}"]`);
    if (name === 'rayons') {
      menuQuery = '';
      renderRayonsPanel();
    }
    if (name === 'dest') renderDestPanel();
    if (name === 'bag') renderBag();
    if (name === 'favs') renderFavs();
    if (name === 'menu') renderMenuPanel();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    openName = name;
    opener = trigger;
    if (motionOK()) gsap.fromTo(panel, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' });
    const first = {
      rayons: () => panel.querySelector('[data-rm][aria-current="true"]'),
      dest: () => panel.querySelector('[aria-current="true"]'),
      menu: () => panel.querySelector('.menu-links a'),
    }[name];
    ((first && first()) || panel.querySelector('a[href], button') || panel).focus({ preventScroll: true });
  }

  function closePanel(restoreFocus = true) {
    if (!openName) return;
    $(`[data-panel="${openName}"]`).hidden = true;
    opener?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) opener?.focus({ preventScroll: true });
    openName = null;
    opener = null;
  }

  /* ---------- Header, counts, labels, statics ---------- */

  function renderCounts() {
    const items = Object.values(state.bag).reduce((sum, qty) => sum + qty, 0);
    const bagCount = $('[data-bag-count]');
    bagCount.textContent = items;
    bagCount.dataset.empty = String(items === 0);
    $('[data-bag-label]').setAttribute('aria-label', `Panier, ${plural(items, 'article', 'articles')}`);
    const favs = state.favs.size;
    const favCount = $('[data-fav-count]');
    favCount.textContent = favs;
    favCount.dataset.empty = String(favs === 0);
    $('[data-fav-label]').setAttribute('aria-label', `Favoris, ${plural(favs, 'offre', 'offres')}`);
  }

  function renderDestLabels() {
    const country = D.country(state.dest);
    $$('[data-dest-name]').forEach((el) => { el.textContent = country.name; });
    $$('[data-dest-in]').forEach((el) => { el.textContent = IN[state.dest]; });
  }

  const LICENSE_FR = { 'Public domain': 'Domaine public', 'Generated for this prototype': 'Générée pour la maquette' };
  const authorFr = (a) => String(a).replace(/\s*\(edit\)/gi, ' (retouche)').replace(/\(background removal\)/gi, '(détourage)').replace(/;\s*collar by /gi, ' ; collier : ');

  function renderStatics() {
    $('[data-demo-notice]').textContent = fr(D.demoNotice);
    $('[data-demo-notice-footer]').textContent = fr(D.demoNotice);
    $('[data-slogan]').textContent = D.slogan;
    $('[data-credits]').innerHTML = D.credits.map((c) => {
      const name = LICENSE_FR[c.license] || c.license;
      const license = c.licenseUrl ? `<a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(name)}</a>` : esc(name);
      const source = c.source ? ` · <a href="${esc(c.source)}" target="_blank" rel="noopener">source</a>` : '';
      return `<li>${esc(c.label)} · ${esc(authorFr(c.author))} · ${license}${source}</li>`;
    }).join('');
    /* French spacing for the copy written in the page, except the slogan and the pitch, which stay verbatim. */
    for (const root of [$('main'), $('.site-footer')]) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (node.parentElement.closest('h1, .hero-pitch, script, style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const next = fr(node.nodeValue);
        if (next !== node.nodeValue) node.nodeValue = next;
      }
    }
  }

  /* ---------- Feedback ---------- */

  let toastTimer = 0;
  function toast(message) {
    const el = $('[data-toast]');
    el.innerHTML = `${svg('check')}<span>${esc(message)}</span>`;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2800);
  }

  function announce(message) {
    const live = $('[data-live]');
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  }

  /* ---------- Actions ---------- */

  function addToBag(id) {
    state.bag[id] = Math.min((state.bag[id] || 0) + 1, 99);
    save();
    renderCounts();
    if (openName === 'bag') renderBag();
    toast(`Ajouté au panier : ${offerById.get(id).name}`);
    if (motionOK()) gsap.fromTo('[data-bag-count]', { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  }

  function setQty(id, step) {
    const name = offerById.get(id).name;
    const next = (state.bag[id] || 0) + step;
    if (next <= 0) delete state.bag[id];
    else state.bag[id] = Math.min(next, 99);
    save();
    renderCounts();
    renderBag();
    const again = $(`[data-qty="${CSS.escape(id)}"][data-step="${step}"]`) || $('[data-panel="bag"] .close-btn');
    again?.focus({ preventScroll: true });
    announce(next > 0 ? `Quantité : ${Math.min(next, 99)}, ${name}` : `Retiré du panier : ${name}`);
  }

  function removeFromBag(id) {
    const name = offerById.get(id).name;
    delete state.bag[id];
    save();
    renderCounts();
    renderBag();
    ($('[data-panel="bag"] [data-remove]') || $('[data-panel="bag"] .close-btn'))?.focus({ preventScroll: true });
    announce(`Retiré du panier : ${name}`);
  }

  function toggleFav(id, fromPanel = false) {
    const removing = state.favs.has(id);
    const order = [...state.favs];
    if (removing) state.favs.delete(id);
    else state.favs.add(id);
    save();
    renderCounts();
    $$(`[data-fav="${CSS.escape(id)}"]`).forEach((btn) => btn.setAttribute('aria-pressed', String(state.favs.has(id))));
    if (openName === 'favs') {
      renderFavs();
      if (fromPanel) {
        const nextId = order[order.indexOf(id) + 1] || order[order.indexOf(id) - 1];
        ($(`[data-unfav="${CSS.escape(nextId || '')}"]`) || $('[data-panel="favs"] .close-btn'))?.focus({ preventScroll: true });
        announce(`Retiré des favoris : ${offerById.get(id).name}`);
      }
    }
  }

  function renderOffers() {
    renderShowcase();
    renderPromises();
    renderChips();
    renderWorld();
    renderOneCart();
    renderAisles();
    renderBig();
  }

  /* New blocks rendered below the fold join the same reveal as the rest of the page. */
  function registerReveals(scope = document) {
    if (!motionOK() || !window.ScrollTrigger) return;
    const below = $$('[data-reveal]', scope).filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    if (below.length) {
      gsap.set(below, RISE);
      ScrollTrigger.batch(below, { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { ...RISE_TO, overwrite: true }) });
    }
    ScrollTrigger.refresh();
  }

  function setDest(code) {
    if (code === state.dest) {
      closePanel();
      return;
    }
    state.dest = code;
    save();
    renderDestLabels();
    closePanel();
    const changing = [$('[data-showcase]'), ...$$('[data-tiles]'), $('[data-grid]'), $('[data-cart-demo]'), $('[data-aisles]'), $('[data-big]')];
    const apply = () => {
      renderOffers();
      if (!motionOK()) return;
      gsap.set(changing, { opacity: 1 });
      const inView = [...$$('.show-item'), ...$$('.offer'), ...$$('.aisle'), ...$$('.big-card')]
        .filter((el) => el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0);
      gsap.fromTo(inView, RISE, RISE_TO);
      registerReveals();
    };
    if (motionOK()) gsap.to(changing, { opacity: 0, duration: 0.25, ease: 'power1.out', onComplete: apply });
    else apply();
    announce(fr(`${plural(D.offersFor(code).length, 'offre livrable', 'offres livrables')} ${IN[code]}.`));
  }

  /* Another page of the demo (the refonte) may have changed the shared bag: read it again when coming back. */
  function resync() {
    const next = load();
    const destChanged = next.dest !== state.dest;
    Object.assign(state, next);
    renderCounts();
    $$('[data-fav]').forEach((btn) => btn.setAttribute('aria-pressed', String(state.favs.has(btn.dataset.fav))));
    if (destChanged) {
      renderDestLabels();
      renderOffers();
    }
    if (openName === 'bag') renderBag();
    if (openName === 'favs') renderFavs();
  }

  /* ---------- Events ---------- */

  function bind() {
    document.addEventListener('click', (event) => {
      const t = event.target.closest('button, a');
      const inPanel = event.target.closest('[data-panel]');
      if (openName && !inPanel && t !== opener && !(t && t.dataset.toggle)) closePanel(false);
      if (!t) return;
      if (t.dataset.toggle) {
        event.preventDefault();
        openPanel(t.dataset.toggle, t);
        return;
      }
      if (t.dataset.rm) return selectRm(t.dataset.rm);
      if (t.dataset.add) return addToBag(t.dataset.add);
      if (t.dataset.fav) return toggleFav(t.dataset.fav);
      if (t.dataset.unfav) return toggleFav(t.dataset.unfav, true);
      if (t.dataset.qty) return setQty(t.dataset.qty, Number(t.dataset.step));
      if (t.dataset.remove) return removeFromBag(t.dataset.remove);
      if (t.dataset.dest) return setDest(t.dataset.dest);
      if (t.dataset.chip) return setWorldFilter(t.dataset.chip);
      if (t.hasAttribute('data-close')) return closePanel();
      if (t.dataset.lang === 'en') return toast('Exploration disponible en français uniquement');
      if (t.dataset.lang === 'fr') return;
      if (t.hasAttribute('data-open-sources')) $('[data-sources]').open = true;
      if (inPanel && t.matches('a[href^="#"]')) closePanel(false);
    });

    /* A panel never stays open over the element that receives the focus next. */
    document.addEventListener('focusout', (event) => {
      if (!openName) return;
      const panel = $(`[data-panel="${openName}"]`);
      const to = event.relatedTarget;
      if (to && !panel.contains(to) && to !== opener) closePanel(false);
    });

    /* Anything reached with the keyboard is shown, even before its reveal. */
    document.addEventListener('focusin', (event) => {
      const block = event.target.closest('[data-reveal]');
      if (block && window.gsap && Number(gsap.getProperty(block, 'opacity')) < 1) {
        gsap.to(block, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', overwrite: true });
      }
      const rm = event.target.closest('[data-rm]');
      if (rm && rm.getAttribute('aria-current') !== 'true') selectRm(rm.dataset.rm);
    });

    document.addEventListener('mouseover', (event) => {
      const rm = event.target.closest('[data-rm]');
      if (rm && rm.getAttribute('aria-current') !== 'true') selectRm(rm.dataset.rm);
    });

    document.addEventListener('input', (event) => {
      if (event.target.matches('[data-rm-filter]')) {
        menuQuery = event.target.value;
        renderRmList();
        renderRmDetail();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!openName) return;
      const panel = $(`[data-panel="${openName}"]`);
      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel();
        return;
      }
      if (openName === 'rayons') {
        const items = $$('[data-rm]', panel);
        if (event.target.matches('[data-rm-filter]') && event.key === 'ArrowDown' && items.length) {
          event.preventDefault();
          selectRm(items[0].dataset.rm, true);
          return;
        }
        const onItem = event.target.closest('[data-rm]');
        if (onItem && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const i = items.indexOf(onItem);
          const j = { ArrowDown: Math.min(i + 1, items.length - 1), ArrowUp: Math.max(i - 1, 0), Home: 0, End: items.length - 1 }[event.key];
          selectRm(items[j].dataset.rm, true);
          return;
        }
        if (onItem && event.key === 'ArrowRight') {
          event.preventDefault();
          $('[data-rm-detail] a', panel)?.focus();
          return;
        }
        if (event.target.closest('[data-rm-detail]') && event.key === 'ArrowLeft') {
          event.preventDefault();
          $(`[data-rm="${menuDept}"]`, panel)?.focus();
          return;
        }
        if (event.target.closest('[data-rm-detail]') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
          event.preventDefault();
          const links = $$('[data-rm-detail] a', panel);
          const i = links.indexOf(event.target);
          links[Math.max(0, Math.min(links.length - 1, i + (event.key === 'ArrowDown' ? 1 : -1)))]?.focus();
        }
        return;
      }
      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && panel.contains(document.activeElement)) {
        const items = $$('a[href], button:not([disabled])', panel);
        const i = items.indexOf(document.activeElement);
        if (i === -1) return;
        event.preventDefault();
        items[(i + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
      }
    });

    $$('[data-q]').forEach((input) => input.addEventListener('input', () => {
      $$('[data-q]').forEach((other) => { if (other !== input) other.value = input.value; });
    }));

    $$('[data-search]').forEach((form) => form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('[data-q]');
      const q = input.value.trim();
      if (!q) {
        input.focus();
        return;
      }
      window.location.href = `../../#/catalog?q=${encodeURIComponent(q)}`;
    }));

    $$('[data-home]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      closePanel(false);
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      $('#hero-title').focus({ preventScroll: true });
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    }));

    const header = $('[data-header]');
    const headerSearch = $('.header-search');
    new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting;
      header.classList.toggle('has-search', show);
      headerSearch.setAttribute('aria-hidden', String(!show));
      $$('input, button', headerSearch).forEach((el) => { el.tabIndex = show ? 0 : -1; });
    }, { rootMargin: '-80px 0px 0px 0px' }).observe($('[data-search="hero"]'));

    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-compact', !entry.isIntersecting);
    }).observe($('.demo'));

    window.addEventListener('pageshow', (event) => { if (event.persisted) resync(); });
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitSubs, 150);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSubs);
    window.addEventListener('storage', (event) => { if (event.key === REFONTE_STORE || event.key === STORE) resync(); });
  }

  /* ---------- Motion: one grammar (rise and fade, expo out), a scrubbed hero, the stage light ---------- */

  function motion() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const FROM = { ...RISE, duration: RISE_TO.duration, ease: RISE_TO.ease, stagger: RISE_TO.stagger };
      gsap.timeline()
        .from('.display .line', FROM)
        .from(['.hero-pitch', '.hero-search'], FROM, 0.2)
        .from('.show-item', FROM, 0.35)
        .from('.show-note', { opacity: 0, duration: 1, ease: 'expo.out' }, 0.6);

      gsap.to('[data-hero-copy]', {
        y: -70,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: 0.6 },
      });
      gsap.to('[data-stage]', {
        y: -36,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
      });

      gsap.set('[data-reveal]', RISE);
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (els) => gsap.to(els, { ...RISE_TO, overwrite: true }),
      });
    });
  }

  /* ---------- Init ---------- */

  $$('[data-icon]').forEach((el) => { el.outerHTML = svg(el.dataset.icon); });
  renderStatics();
  renderDestLabels();
  renderOffers();
  renderCounts();
  bind();
  motion();
})();
