/* =====================================================================
   DutyFreeDeal · Exploration B « Marché mondial » · main.js
   Tout le contenu vient de window.DFD (../shared/catalog.js).
   Sommaire : utilitaires · icônes · pays · état · gabarits · en-tête ·
   hero (étals, réassort) · monde · marché (mur, filtres, montage) ·
   sélections · rayons · gros biens · vendeur · pied de page · actions ·
   typographie ajustée · mouvement · démarrage.
   ===================================================================== */
(() => {
  'use strict';

  const D = window.DFD;
  if (!D) return;

  const G = window.gsap || null;
  const ST = window.ScrollTrigger || null;
  const FL = window.Flip || null;
  if (G && ST) G.registerPlugin(ST);
  if (G && FL) G.registerPlugin(FL);

  /* ---------------------------------------------------------------
     Utilitaires
     --------------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hash = (s) => {
    let h = 2166136261;
    for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  /** Rotation stable dérivée d’un identifiant, entre -range et +range degrés. */
  const tilt = (seed, range = 8) => (hash(seed) % (range * 2 + 1)) - range;
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOK = () => !!G && !reduceMQ.matches;
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const inView = (el, margin = 0) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > -margin && r.top < window.innerHeight + margin;
  };
  const fromHTML = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  const plural = (n, one, many) => (n > 1 ? many : one);

  /* ---------------------------------------------------------------
     Icônes Phosphor (MIT), copiées depuis node_modules/@phosphor-icons/core
     --------------------------------------------------------------- */
  const ICONS = {
    search: '<path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"/>',
    heart: '<path d="M178,36c-20.09,0-37.92,7.93-50,21.56C115.92,43.93,98.09,36,78,36a66.08,66.08,0,0,0-66,66c0,72.34,105.81,130.14,110.31,132.57a12,12,0,0,0,11.38,0C138.19,232.14,244,174.34,244,102A66.08,66.08,0,0,0,178,36Zm-5.49,142.36A328.69,328.69,0,0,1,128,210.16a328.69,328.69,0,0,1-44.51-31.8C61.82,159.77,36,131.42,36,102A42,42,0,0,1,78,60c17.8,0,32.7,9.4,38.89,24.54a12,12,0,0,0,22.22,0C145.3,69.4,160.2,60,178,60a42,42,0,0,1,42,42C220,131.42,194.18,159.77,172.51,178.36Z"/>',
    heartFill: '<path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z"/>',
    tote: '<path d="M239,66.75a20.12,20.12,0,0,0-15-6.75H179.83A52,52,0,0,0,76.17,60H32.08A20,20,0,0,0,12.14,82.35l14.25,120A20.06,20.06,0,0,0,46.33,220H209.67a20.06,20.06,0,0,0,19.94-17.65l14.25-120A20,20,0,0,0,239,66.75ZM128,36a28,28,0,0,1,27.71,24H100.29A28,28,0,0,1,128,36Zm78.19,160H49.81L36.5,84h183Z"/>',
    caret: '<path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/>',
    grid: '<path d="M100,36H56A20,20,0,0,0,36,56v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V56A20,20,0,0,0,100,36ZM96,96H60V60H96ZM200,36H156a20,20,0,0,0-20,20v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V56A20,20,0,0,0,200,36Zm-4,60H160V60h36Zm-96,40H56a20,20,0,0,0-20,20v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V156A20,20,0,0,0,100,136Zm-4,60H60V160H96Zm104-60H156a20,20,0,0,0-20,20v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V156A20,20,0,0,0,200,136Zm-4,60H160V160h36Z"/>',
    arrow: '<path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"/>',
    close: '<path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/>',
    check: '<path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/>',
    store: '<path d="M236,96a12,12,0,0,0-.44-3.3L221.2,42.51A20.08,20.08,0,0,0,202,28H54A20.08,20.08,0,0,0,34.8,42.51L20.46,92.7A12,12,0,0,0,20,96h0v16a43.94,43.94,0,0,0,16,33.92V216a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V145.92A43.94,43.94,0,0,0,236,112V96ZM57.05,52H199l9.14,32H47.91Zm91,56v4a20,20,0,0,1-40,0v-4ZM53,128.71A20,20,0,0,1,44,112v-4H84v4a20,20,0,0,1-20,20,19.76,19.76,0,0,1-9.07-2.2A11.54,11.54,0,0,0,53,128.71ZM196,204H60V155.81c1.32.12,2.65.19,4,.19a43.86,43.86,0,0,0,32-13.85,43.89,43.89,0,0,0,64,0A43.86,43.86,0,0,0,192,156c1.35,0,2.68-.07,4-.19Zm16-92a20,20,0,0,1-9,16.71,11.66,11.66,0,0,0-1.88,1.09A20,20,0,0,1,172,112v-4h40Z"/>',
    out: '<path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"/>',
    reset: '<path d="M228,128a100,100,0,0,1-98.66,100H128a99.39,99.39,0,0,1-68.62-27.29,12,12,0,0,1,16.48-17.45,76,76,0,1,0-1.57-109c-.13.13-.25.25-.39.37L54.89,92H72a12,12,0,0,1,0,24H24a12,12,0,0,1-12-12V56a12,12,0,0,1,24,0V76.72L57.48,57.06A100,100,0,0,1,228,128Z"/>',
    translate: '<path d="M250.73,210.63l-56-112a12,12,0,0,0-21.46,0l-20.52,41A84.2,84.2,0,0,1,114,126.22,107.48,107.48,0,0,0,139.33,68H160a12,12,0,0,0,0-24H108V32a12,12,0,0,0-24,0V44H32a12,12,0,0,0,0,24h83.13A83.69,83.69,0,0,1,96,110.35,84,84,0,0,1,83.6,91a12,12,0,1,0-21.81,10A107.55,107.55,0,0,0,78,126.24,83.54,83.54,0,0,1,32,140a12,12,0,0,0,0,24,107.47,107.47,0,0,0,64-21.07,108.4,108.4,0,0,0,45.39,19.44l-24.13,48.26a12,12,0,1,0,21.46,10.73L151.41,196h65.17l12.68,25.36a12,12,0,1,0,21.47-10.73ZM163.41,172,184,130.83,204.58,172Z"/>',
  };
  const icon = (name) => `<svg class="ico" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  /* ---------------------------------------------------------------
     Pays : couleur-code et grammaire (« au Mexique », « aux États-Unis »)
     --------------------------------------------------------------- */
  const TONES = { MX: 'mx', US: 'us', ES: 'es', FR: 'fr' };
  const tone = (code) => TONES[code] || 'white';
  const PREP = { MX: 'au', US: 'aux' };
  const country = (code) => D.country(code) || { code, iso3: code, name: code };
  const prep = (c) => PREP[c.code] || 'en';
  const inCountry = (c) => `${prep(c)} ${c.name}`;
  const sellerIn = (c) => `Vendeur ${inCountry(c)}`;

  /* ---------------------------------------------------------------
     État (mémoire + localStorage protégé)
     --------------------------------------------------------------- */
  const KEY = 'dutyfreedeal-explo-b-marche';
  const state = { dest: 'FR', cart: {}, favs: new Set(), coll: 'all', origins: new Set(), rayon: '' };
  const offerById = (id) => D.offers.find((o) => o.id === id);

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s) return;
      if (D.country(s.dest)) state.dest = s.dest;
      if (s.cart && typeof s.cart === 'object') {
        Object.entries(s.cart).forEach(([id, q]) => { if (offerById(id) && q > 0) state.cart[id] = Math.round(q); });
      }
      if (Array.isArray(s.favs)) state.favs = new Set(s.favs.filter((id) => offerById(id)));
    } catch (e) { /* stockage indisponible : l’état reste en mémoire */ }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ dest: state.dest, cart: state.cart, favs: [...state.favs] }));
    } catch (e) { /* stockage indisponible */ }
  }
  const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);

  /* ---------------------------------------------------------------
     Offres
     --------------------------------------------------------------- */
  const offersTo = (dest) => D.offersFor(dest);
  const buyable = (dest) => offersTo(dest).filter((o) => o.mode === 'purchase' && o.stock > 0);
  const quoteOffers = (dest) => offersTo(dest).filter((o) => o.mode === 'quote');
  const productHref = (o) => `../../#/product/${encodeURIComponent(o.id)}`;
  const catalogHref = (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
    const s = q.toString();
    return `../../#/catalog${s ? `?${s}` : ''}`;
  };
  const shipText = (o) => `+ ${D.price(o.shipping)} de livraison`;
  const countBy = (list, key) => list.reduce((m, o) => m.set(key(o), (m.get(key(o)) || 0) + 1), new Map());

  /** Vitrine : évite deux étals voisins de la même couleur quand c’est possible. */
  function arrangeShowcase(list) {
    if (list.length !== 3) return list;
    const perms = [[0, 1, 2], [1, 0, 2], [0, 2, 1], [2, 0, 1], [1, 2, 0], [2, 1, 0]];
    for (const p of perms) {
      const l = p.map((i) => list[i]);
      if (l.every((o, k) => k === 0 || tone(o.from.code) !== tone(l[k - 1].from.code))) return l;
    }
    return list;
  }

  /* ---------------------------------------------------------------
     Gabarits
     --------------------------------------------------------------- */
  function stickerHTML(code, seed, size = '') {
    return `<span class="sticker ${size} t-${tone(code)}" style="--r:${tilt(seed)}deg" aria-hidden="true">${esc(code)}</span>`;
  }

  function priceHTML(n, cls = '') {
    const p = D.priceParts(n);
    return `<p class="price ${cls}"><span class="sr-only">${esc(D.price(n))}</span>`
      + `<span class="price-v" aria-hidden="true"><span class="pw">${esc(p.whole)}</span>`
      + `<span class="pd"><span class="pc">${esc(p.cents)}</span><span class="pu">${esc(p.currency)}</span></span></span></p>`;
  }

  /** Détourage posé sur l’aplat, ou photo dans un panneau blanc à angles vifs. */
  function prodHTML(o, cls, eager = false) {
    const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
    if (o.cutout) {
      return `<a class="${cls}" href="${productHref(o)}" tabindex="-1"><img class="pimg pimg--cut" src="${esc(o.cutout)}" alt="${esc(o.imageAlt)}" ${loading} decoding="async"></a>`;
    }
    return `<a class="${cls} is-photo" href="${productHref(o)}" tabindex="-1"><span class="pframe"><img class="pimg pimg--photo" src="${esc(o.image)}" alt="${esc(o.imageAlt)}" ${loading} decoding="async"></span></a>`;
  }

  function favHTML(o) {
    const on = state.favs.has(o.id);
    return `<button type="button" class="sq sq--fav" data-action="fav" data-id="${esc(o.id)}" aria-pressed="${on}">`
      + `<span class="i-off">${icon('heart')}</span><span class="i-on">${icon('heartFill')}</span>`
      + `<span class="sr-only">Favori : ${esc(o.name)}</span></button>`;
  }

  function addSqHTML(o) {
    return `<button type="button" class="sq sq--add" data-action="add" data-id="${esc(o.id)}">${icon('tote')}<span class="sr-only">Ajouter au panier : ${esc(o.name)}</span></button>`;
  }

  /** Étal du hero, lu comme une affichette de marché : nom et vendeur en haut, produit au centre, prix géant en bas. */
  function stallMetaHTML(o) {
    return `<div class="stall-meta t-${tone(o.from.code)}">
      <div class="stall-top">
        ${stickerHTML(o.from.code, o.id, 'sticker--l')}
        <div class="stall-id">
          <h3 class="stall-name"><a href="${productHref(o)}">${esc(o.name)}</a></h3>
          <p class="stall-seller"><span class="seller-c">${esc(sellerIn(o.from))}</span> · <span class="seller-n">${esc(o.vendor.name)}</span></p>
        </div>
        ${favHTML(o)}
      </div>
      <div class="stall-bottom">
        ${priceHTML(o.price, 'price--hero')}
        <div class="stall-buy">
          <button type="button" class="btn btn--primary stall-add" data-action="add" data-id="${esc(o.id)}">${icon('tote')}<span>Ajouter<span class="add-tail"> au panier</span><span class="sr-only"> : ${esc(o.name)}</span></span></button>
          <p class="ship">${esc(shipText(o))}</p>
        </div>
      </div>
    </div>`;
  }

  function stallHTML(o, i) {
    return `<article class="stall t-${tone(o.from.code)}" data-stall="${i}" data-id="${esc(o.id)}">
      <div class="stall-bg" aria-hidden="true"></div>
      <div class="stall-stage">${prodHTML(o, 'stall-prod', true)}</div>
      ${stallMetaHTML(o)}
    </article>`;
  }

  function cardHTML(o, mini = false) {
    return `<li class="card t-${tone(o.from.code)}${mini ? ' card--mini' : ''}" data-id="${esc(o.id)}">
      <div class="card-slab">
        <div class="card-bg" aria-hidden="true"></div>
        <div class="card-seller">${stickerHTML(o.from.code, o.id, mini ? 'sticker--s' : 'sticker--m')}<span class="seller-c">${esc(sellerIn(o.from))}</span></div>
        <div class="card-stage">${prodHTML(o, 'card-prod')}</div>
        ${priceHTML(o.price, 'card-price')}
      </div>
      <div class="card-band">
        <div class="card-txt">
          <h3 class="card-name"><a href="${productHref(o)}">${esc(o.name)}</a></h3>
          <p class="card-vendor">${esc(o.vendor.name)}</p>
          <p class="ship">${esc(shipText(o))}</p>
        </div>
        <div class="card-act">${favHTML(o)}${addSqHTML(o)}</div>
      </div>
    </li>`;
  }

  /* ---------------------------------------------------------------
     Gestes partagés : chute sur l’étal, pastille qui se colle, montage
     --------------------------------------------------------------- */
  /** Hauteur à parcourir pour qu’un produit sorte entièrement de son étal (l’étal masque ce qui dépasse). */
  const offStall = (el) => {
    const host = el.closest('.stall');
    return (host ? host.offsetHeight : 640) + 40;
  };

  /** L’objet tombe (accélération), s’écrase légèrement à l’impact, rebondit une fois et se pose. */
  function dropIn(tl, el, at) {
    if (!el) return;
    tl.fromTo(el, { y: () => -offStall(el), scaleX: 1, scaleY: 1 }, { y: 0, duration: 0.5, ease: 'power2.in', transformOrigin: '50% 100%' }, at)
      .to(el, { scaleY: 0.92, scaleX: 1.05, duration: 0.07, ease: 'power1.out' }, at + 0.5)
      .to(el, { scaleY: 1, scaleX: 1, y: -14, duration: 0.16, ease: 'power2.out' }, at + 0.57)
      .to(el, { y: 0, duration: 0.17, ease: 'power2.in' }, at + 0.73);
  }

  /** La pastille arrive plus grande et tournée, puis se plaque : un autocollant qu’on appuie. */
  function slap(tl, el, at) {
    if (!el) return;
    const r = parseFloat(el.style.getPropertyValue('--r')) || 0;
    tl.fromTo(el, { scale: 1.75, rotation: r - 26, autoAlpha: 0 }, { scale: 1, rotation: r, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.6)' }, at);
  }

  const parts = (cards, sel) => cards.map((c) => c.querySelector(sel)).filter(Boolean);

  /** États de départ du montage d’étal (posés seulement en mouvement autorisé). */
  function prepMontage(cards) {
    G.set(parts(cards, '.card-bg'), { scaleY: 0 });
    G.set(parts(cards, '.card-prod'), { autoAlpha: 0, scale: 0.85, rotation: -6 });
    G.set(parts(cards, '.card-price'), { autoAlpha: 0, yPercent: 35 });
    G.set(parts(cards, '.card-seller .sticker'), { autoAlpha: 0 });
    G.set(parts(cards, '.card-seller .seller-c'), { autoAlpha: 0 });
    G.set(parts(cards, '.card-band'), { scaleY: 0, transformOrigin: '50% 0%' });
    G.set([...parts(cards, '.card-txt'), ...parts(cards, '.card-act')], { autoAlpha: 0, y: 8 });
  }
  function clearMontage(cards) {
    G.set([
      ...parts(cards, '.card-bg'), ...parts(cards, '.card-prod'), ...parts(cards, '.card-price'),
      ...parts(cards, '.card-seller .sticker'), ...parts(cards, '.card-seller .seller-c'), ...parts(cards, '.card-band'),
      ...parts(cards, '.card-txt'), ...parts(cards, '.card-act'),
    ], { clearProps: 'transform,opacity,visibility' });
  }
  /**
   * Moment signature : l’étal se monte. Depuis la jointure, l’aplat monte et la bande blanche se déroule ;
   * le produit surgit, le prix se pose, la pastille se colle. 60 ms d’écart entre les étals, une seule fois.
   */
  function montage(cards) {
    const tl = G.timeline();
    const each = 0.06;
    tl.to(parts(cards, '.card-bg'), { scaleY: 1, duration: 0.55, ease: 'expo.out', stagger: each }, 0)
      .to(parts(cards, '.card-band'), { scaleY: 1, duration: 0.45, ease: 'expo.out', stagger: each }, 0.04)
      .to(cards.flatMap((c) => [c.querySelector('.card-txt'), c.querySelector('.card-act')]).filter(Boolean), { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out', stagger: each / 2 }, 0.3)
      .to(parts(cards, '.card-prod'), { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.62, ease: 'back.out(1.9)', stagger: each }, 0.16)
      .to(parts(cards, '.card-price'), { autoAlpha: 1, yPercent: 0, duration: 0.42, ease: 'power3.out', stagger: each }, 0.26)
      .to(parts(cards, '.card-seller .seller-c'), { autoAlpha: 1, duration: 0.3, ease: 'power2.out', stagger: each }, 0.4);
    cards.forEach((c, i) => slap(tl, c.querySelector('.card-seller .sticker'), 0.44 + i * each));
    return tl;
  }

  /* ---------------------------------------------------------------
     Notification et annonces
     --------------------------------------------------------------- */
  const Toast = {
    el: $('[data-toast]'),
    timer: 0,
    show(msg, kind = 'check') {
      this.el.innerHTML = `<span class="toast-i${kind === 'translate' ? ' is-info' : ''}" aria-hidden="true">${icon(kind)}</span><span>${esc(msg)}</span>`;
      this.el.classList.add('is-on');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.el.classList.remove('is-on'), 2800);
    },
  };
  const announcer = $('[data-announcer]');
  function announce(msg) {
    announcer.textContent = '';
    window.setTimeout(() => { announcer.textContent = msg; }, 60);
  }

  /* ---------------------------------------------------------------
     En-tête : destination, rayons, compaction, recherche d’en-tête
     --------------------------------------------------------------- */
  const TRIO = ['lime', 'violet', 'sky'];
  const P5 = [[0, 1, 2, 1, 0], [2, 0, 1, 0, 2], [1, 2, 0, 2, 1]];
  /** Couleurs des rayons : lime, violet, ciel (les couleurs-pays restent réservées au pays du vendeur), jamais deux voisines identiques. */
  function rayonTones(n, cols) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      if (cols === 5 && r < P5.length) { out.push(TRIO[P5[r][c]]); continue; }
      const left = c > 0 ? out[i - 1] : null;
      const up = r > 0 ? out[i - cols] : null;
      const cands = [0, 1, 2].map((k) => TRIO[(k + r + c) % 3]);
      out.push(cands.find((t) => t !== left && t !== up) || cands[0]);
    }
    return out;
  }

  const Header = {
    el: $('#hdr'),
    destBtn: $('#dest-btn'),
    destList: $('#dest-list'),
    rBtn: $('#rayons-btn'),
    rPanel: $('#rayons-panel'),
    destActive: 0,
    rSel: '',

    init() {
      const root = document.documentElement;
      const setH = () => root.style.setProperty('--hdr-h', `${this.el.offsetHeight}px`);
      setH();
      if ('ResizeObserver' in window) new ResizeObserver(setH).observe(this.el);
      this.renderDest();
      this.renderRayons();
      this.observe();
    },

    /* Compaction (transformations seulement) et apparition de la recherche d’en-tête */
    observe() {
      const sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText = 'position:absolute;top:140px;left:0;width:1px;height:1px;pointer-events:none';
      document.body.prepend(sentinel);
      const hs = $('#hsearch');
      if (!('IntersectionObserver' in window)) return;
      new IntersectionObserver(([e]) => {
        const compact = !e.isIntersecting && e.boundingClientRect.top < 0;
        this.el.classList.toggle('is-compact', compact);
        document.documentElement.style.setProperty('--hdr-shift', compact ? '12px' : '0px');
      }).observe(sentinel);
      new IntersectionObserver(([e]) => {
        const show = !e.isIntersecting && e.boundingClientRect.top < 120;
        if (!show && hs.contains(document.activeElement)) return;
        this.el.classList.toggle('has-search', show);
        hs.inert = !show;
      }, { rootMargin: '-110px 0px 0px 0px' }).observe($('#hero-search'));
    },

    /* --- Destination (liste d’options, clavier complet) --- */
    renderDest() {
      this.destList.innerHTML = D.countries.map((c) => {
        const n = offersTo(c.code).length;
        return `<li role="option" id="dest-opt-${esc(c.code)}" data-code="${esc(c.code)}" aria-selected="${c.code === state.dest}">`
          + `${stickerHTML(c.code, `dest-${c.code}`, 'sticker--s')}<span>${esc(c.name)}</span>`
          + `<span class="dest-o-n">${n} ${plural(n, 'offre', 'offres')}</span></li>`;
      }).join('');
      this.syncDest();
    },
    syncDest() {
      const c = country(state.dest);
      const st = $('[data-dest-sticker]');
      st.className = `sticker sticker--xs t-${tone(c.code)}`;
      st.textContent = c.code;
      st.style.setProperty('--r', `${tilt(`dest-${c.code}`)}deg`);
      $('[data-dest-name]').textContent = c.name;
      $$('[role="option"]', this.destList).forEach((li) => li.setAttribute('aria-selected', String(li.dataset.code === c.code)));
      $$('[data-dest-in]').forEach((el) => { el.textContent = inCountry(c); });
    },
    isDestOpen() { return !this.destList.hidden; },
    openDest() {
      this.closeRayons(false);
      this.destList.hidden = false;
      this.destBtn.setAttribute('aria-expanded', 'true');
      this.destActive = Math.max(0, D.countries.findIndex((c) => c.code === state.dest));
      this.paintActive();
      this.destList.focus();
      if (motionOK()) {
        G.fromTo(this.destList, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power3.out' });
        const tl = G.timeline();
        $$('.sticker', this.destList).forEach((s, i) => slap(tl, s, 0.04 + i * 0.04));
      }
    },
    closeDest(focusBtn = true) {
      if (!this.isDestOpen()) return;
      this.destList.hidden = true;
      this.destBtn.setAttribute('aria-expanded', 'false');
      this.destList.removeAttribute('aria-activedescendant');
      if (focusBtn) this.destBtn.focus();
    },
    toggleDest() { if (this.isDestOpen()) this.closeDest(true); else this.openDest(); },
    paintActive() {
      const opts = $$('[role="option"]', this.destList);
      opts.forEach((o, i) => o.classList.toggle('is-active', i === this.destActive));
      if (opts[this.destActive]) this.destList.setAttribute('aria-activedescendant', opts[this.destActive].id);
    },
    onDestKey(e) {
      const n = D.countries.length;
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); this.destActive = (this.destActive + 1) % n; this.paintActive(); break;
        case 'ArrowUp': e.preventDefault(); this.destActive = (this.destActive - 1 + n) % n; this.paintActive(); break;
        case 'Home': e.preventDefault(); this.destActive = 0; this.paintActive(); break;
        case 'End': e.preventDefault(); this.destActive = n - 1; this.paintActive(); break;
        case 'Enter':
        case ' ': e.preventDefault(); this.chooseDest(D.countries[this.destActive].code); break;
        case 'Escape': e.preventDefault(); this.closeDest(true); break;
        case 'Tab': this.closeDest(false); break;
        default: break;
      }
    },
    chooseDest(code) {
      this.closeDest(true);
      setDest(code);
    },

    /* --- Tous les rayons --- */
    renderRayons() {
      const tones = rayonTones(D.departments.length, 5);
      $('[data-rpanel-grid]').innerHTML = D.departments.map((d, i) => `<li><button type="button" class="rtile t-${tones[i]}" data-action="rtile" data-id="${esc(d.id)}" aria-pressed="false" tabindex="-1">`
        + `<span class="rtile-name" aria-hidden="true">${esc(d.short)}</span><span class="sr-only">${esc(d.name)}</span>`
        + `<span class="rtile-n">${d.categoryCount} catégories</span></button></li>`).join('');
      this.rSel = D.departments[0] ? D.departments[0].id : '';
      this.paintRayon();
    },
    paintRayon() {
      $$('.rtile', this.rPanel).forEach((b) => {
        const on = b.dataset.id === this.rSel;
        b.setAttribute('aria-pressed', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      const d = D.department(this.rSel);
      if (!d) return;
      const c = country(state.dest);
      const n = offersTo(state.dest).filter((o) => o.rayon === d.id).length;
      const avail = n
        ? `${n} ${plural(n, 'offre livrable', 'offres livrables')} ${inCountry(c)}`
        : `Pas encore d’offre exemple livrable ${inCountry(c)}`;
      $('[data-rpanel-detail]').innerHTML = `<p class="rpd-name">${esc(d.name)}</p>`
        + `<p class="rpd-meta">${d.categoryCount} catégories · ${esc(avail)}</p>`
        + `<ul class="rpd-subs">${d.subcategories.map((s) => `<li><a href="${catalogHref({ category: d.id, q: s })}"><span>${esc(s)}</span>${icon('arrow')}</a></li>`).join('')}</ul>`
        + `<a class="btn btn--primary rpd-all" href="${catalogHref({ category: d.id })}">Voir tout le rayon${icon('arrow')}</a>`;
    },
    isRayonsOpen() { return !this.rPanel.hidden; },
    openRayons() {
      this.closeDest(false);
      this.rPanel.hidden = false;
      this.rBtn.setAttribute('aria-expanded', 'true');
      this.paintRayon();
      const sel = $('.rtile[aria-pressed="true"]', this.rPanel) || $('.rtile', this.rPanel);
      if (sel) sel.focus();
      if (motionOK()) {
        G.fromTo(this.rPanel, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power3.out' });
        G.fromTo($$('.rtile', this.rPanel), { autoAlpha: 0, y: 16, scale: 0.94 }, {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'power3.out',
          stagger: { grid: 'auto', from: 0, amount: 0.11 }, clearProps: 'transform,opacity,visibility',
        });
      }
    },
    closeRayons(focusBtn = true) {
      if (!this.isRayonsOpen()) return;
      this.rPanel.hidden = true;
      this.rBtn.setAttribute('aria-expanded', 'false');
      if (focusBtn) this.rBtn.focus();
    },
    toggleRayons() { if (this.isRayonsOpen()) this.closeRayons(true); else this.openRayons(); },
    selectRayon(id, fromKeyboard) {
      this.rSel = id;
      this.paintRayon();
      if (fromKeyboard) { const first = $('.rpd-subs a', this.rPanel); if (first) first.focus(); }
    },
    onTilesKey(e) {
      const tiles = $$('.rtile', this.rPanel);
      const i = tiles.indexOf(document.activeElement);
      if (i < 0) return;
      const cols = getComputedStyle($('[data-rpanel-grid]')).gridTemplateColumns.split(' ').length || 5;
      let j = i;
      if (e.key === 'ArrowRight') j = Math.min(tiles.length - 1, i + 1);
      else if (e.key === 'ArrowLeft') j = Math.max(0, i - 1);
      else if (e.key === 'ArrowDown') j = Math.min(tiles.length - 1, i + cols);
      else if (e.key === 'ArrowUp') j = Math.max(0, i - cols);
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tiles.length - 1;
      else return;
      e.preventDefault();
      this.rSel = tiles[j].dataset.id;
      this.paintRayon();
      tiles[j].focus();
    },
    closeAll() { this.closeDest(false); this.closeRayons(false); },
  };

  /* ---------------------------------------------------------------
     Hero : trois étals, réassort au changement de destination
     --------------------------------------------------------------- */
  const Hero = {
    box: $('[data-stalls]'),
    offers: [],
    tl: null,
    introTl: null,
    pick() { return arrangeShowcase(D.showcaseFor(state.dest)); },
    render() {
      this.offers = this.pick();
      this.box.style.setProperty('--n', String(Math.max(1, this.offers.length)));
      this.box.innerHTML = this.offers.map(stallHTML).join('');
    },
    prepIntro() {
      G.set($$('.stall-bg', this.box), { scaleY: 0 });
      $$('.stall-prod', this.box).forEach((p) => G.set(p, { y: -offStall(p) }));
      G.set($$('.stall-meta', this.box), { autoAlpha: 0 });
      G.set('[data-slogan]', { '--wdth': 50 });
    },
    /** Le monde s’ouvre (largeur 50 → ajustée), puis le marché s’installe : aplats, produits, pastilles. */
    playIntro() {
      const tl = G.timeline();
      this.introTl = tl;
      tl.fromTo('[data-slogan]', { '--wdth': 50 }, { '--wdth': Fit.sloganW, duration: 0.9, ease: 'expo.out' }, 0);
      $$('.stall', this.box).forEach((s, i) => {
        const at = 0.16 + i * 0.1;
        tl.to($('.stall-bg', s), { scaleY: 1, duration: 0.7, ease: 'expo.out' }, at);
        dropIn(tl, $('.stall-prod', s), at + 0.2);
        tl.to($('.stall-meta', s), { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, at + 0.42);
        slap(tl, $('.stall-meta .sticker', s), at + 0.62);
      });
      return tl;
    },
    revealNow() {
      G.set([...$$('.stall-bg', this.box), ...$$('.stall-prod', this.box), ...$$('.stall-meta', this.box)], { clearProps: 'transform,opacity,visibility' });
      G.set('[data-slogan]', { '--wdth': Fit.sloganW });
    },
    parallax() {
      const ys = [-10, -20, -14];
      const rs = [3, -4, 2.5];
      $$('.stall-stage', this.box).forEach((stage, i) => {
        G.to(stage, {
          yPercent: ys[i % 3], rotation: rs[i % 3], ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 },
        });
      });
    },
    /**
     * Moment signature : le réassort. Chaque étal reçoit une nouvelle affiche à la couleur du pays de son nouveau vendeur
     * (collée de haut en bas, 500 ms) ; l’ancien produit glisse vers le bas et sort, le nouveau tombe d’en haut. 100 ms d’écart.
     * Une offre qui reste (même vendeur) fait un petit saut sur place et sa livraison se met à jour.
     */
    async restock() {
      const next = this.pick();
      const stalls = $$('.stall', this.box);
      if (this.introTl) { this.introTl.progress(1); this.introTl = null; }
      if (this.tl) { this.tl.progress(1); this.tl.kill(); this.tl = null; }
      if (!motionOK() || next.length !== stalls.length) {
        this.render();
        return;
      }
      await preload(next.map((o) => o.cutout || o.image));
      const tl = G.timeline({ onComplete: () => { this.tl = null; } });
      this.tl = tl;
      stalls.forEach((stall, i) => {
        const o = next[i];
        const at = i * 0.1;
        if (stall.dataset.id === o.id) { this.stay(tl, stall, o, at); return; }
        const t = tone(o.from.code);
        const stage = $('.stall-stage', stall);
        const oldBg = $('.stall-bg', stall);
        const oldProd = $('.stall-prod', stage);
        const oldMeta = $('.stall-meta', stall);
        oldBg.insertAdjacentHTML('afterend', `<div class="stall-bg t-${t}" aria-hidden="true"></div>`);
        const newBg = oldBg.nextElementSibling;
        stage.insertAdjacentHTML('beforeend', prodHTML(o, 'stall-prod', true));
        stall.insertAdjacentHTML('beforeend', stallMetaHTML(o));
        const newProd = stage.lastElementChild;
        const newMeta = stall.lastElementChild;
        G.set(newBg, { scaleY: 0, transformOrigin: '50% 0%' });
        G.set(newProd, { y: -offStall(newProd) });
        G.set(newMeta, { autoAlpha: 0 });
        stall.dataset.id = o.id;
        tl.to(oldProd, { y: offStall(oldProd), duration: 0.42, ease: 'power3.in' }, at)
          .to(oldMeta, { autoAlpha: 0, y: 18, duration: 0.22, ease: 'power2.in' }, at)
          .to(newBg, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, at + 0.08)
          .add(() => {
            oldProd.remove();
            oldMeta.remove();
            oldBg.remove();
            newBg.classList.remove(`t-${t}`);
            stall.className = `stall t-${t}`;
            G.set(newBg, { clearProps: 'transform' });
          }, at + 0.6);
        dropIn(tl, newProd, at + 0.22);
        tl.fromTo(newMeta, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power3.out' }, at + 0.5);
        slap(tl, $('.sticker', newMeta), at + 0.68);
      });
      this.offers = next;
    },
    /** Même offre, autre destination : l’objet saute sur place, la ligne de livraison bascule. */
    stay(tl, stall, o, at) {
      const prod = $('.stall-prod', stall);
      if (prod) {
        tl.to(prod, { y: -26, duration: 0.2, ease: 'power2.out', transformOrigin: '50% 100%' }, at + 0.1)
          .to(prod, { y: 0, duration: 0.2, ease: 'power2.in' }, at + 0.3)
          .to(prod, { scaleY: 0.95, scaleX: 1.03, duration: 0.06, ease: 'power1.out' }, at + 0.5)
          .to(prod, { scaleY: 1, scaleX: 1, duration: 0.22, ease: 'back.out(3)' }, at + 0.56);
      }
      const ship = $('.ship', stall);
      const txt = shipText(o);
      if (!ship || ship.textContent === txt) return;
      tl.to(ship, { yPercent: 60, autoAlpha: 0, duration: 0.18, ease: 'power2.in' }, at + 0.2)
        .add(() => { ship.textContent = txt; }, at + 0.38)
        .fromTo(ship, { yPercent: -60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.3, ease: 'power3.out', immediateRender: false }, at + 0.38);
    },
  };

  function preload(srcs) {
    const one = (src) => new Promise((res) => {
      const im = new Image();
      im.onload = () => res();
      im.onerror = () => res();
      im.src = src;
      if (im.decode) im.decode().then(res, res);
    });
    return Promise.race([Promise.all(srcs.map(one)), new Promise((res) => setTimeout(res, 700))]);
  }

  /* ---------------------------------------------------------------
     Le monde entier, livrable chez vous
     --------------------------------------------------------------- */
  const World = {
    n: 0,
    revealed: false,
    render() {
      const c = country(state.dest);
      const offers = offersTo(state.dest);
      this.n = offers.length;
      $('[data-world-n-sr]').textContent = String(this.n);
      $('[data-world-n]').textContent = String(this.n);
      $('[data-world-noun]').textContent = plural(this.n, 'offre livrable', 'offres livrables');
      const counts = countBy(offers, (o) => o.from.code);
      const codes = [...counts.keys()].sort((a, b) => ((a === c.code) - (b === c.code)) || (counts.get(b) - counts.get(a)));
      const items = codes.map((code) => {
        const cc = country(code);
        return `<span class="world-c">${esc(prep(cc))} ${stickerHTML(cc.code, `world-${cc.code}`)}${esc(cc.name)}</span>`;
      });
      const list = items.length > 1 ? `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}` : (items[0] || '');
      $('[data-world-countries]').innerHTML = list ? `de vendeurs ${list}.` : '';
    },
    count(from, to) {
      const el = $('[data-world-n]');
      const o = { v: from };
      return G.to(o, { v: to, duration: 1.1, ease: 'power3.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
    },
    motion() {
      const stickers = () => $$('.world-c .sticker');
      G.set(stickers(), { autoAlpha: 0 });
      $('[data-world-n]').textContent = '0';
      ST.create({
        trigger: '.world-stat', start: 'top 80%', once: true,
        onEnter: () => {
          this.revealed = true;
          const tl = G.timeline();
          tl.add(this.count(0, this.n), 0);
          stickers().forEach((s, i) => slap(tl, s, 0.45 + i * 0.1));
        },
      });
      G.set('.cue-n-v', { yPercent: 105 });
      ST.create({
        trigger: '.cues', start: 'top 85%', once: true,
        onEnter: () => G.to('.cue-n-v', { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12 }),
      });
    },
    update() {
      const old = this.n;
      this.render();
      if (!motionOK()) return;
      if (!this.revealed) {
        $('[data-world-n]').textContent = '0';
        G.set($$('.world-c .sticker'), { autoAlpha: 0 });
        return;
      }
      if (inView($('.world-stat'))) {
        const tl = G.timeline();
        tl.add(this.count(old, this.n), 0);
        $$('.world-c .sticker').forEach((s, i) => slap(tl, s, 0.2 + i * 0.08));
      }
    },
  };

  /* ---------------------------------------------------------------
     Tout le marché : mur d’abondance, filtres (Flip), montage au scroll
     --------------------------------------------------------------- */
  /** Placement dense sur la grille : une carte sur sept en 2×2 ; la tuile de fin complète le rectangle. */
  function pack(n, cols) {
    const bigs = new Set();
    if (cols >= 3 && n >= 5) for (let i = 0; i < n; i += 7) bigs.add(i);
    for (let guard = 0; guard < 50; guard++) {
      const grid = [];
      const free = (r, c) => !(grid[r] && grid[r][c]);
      const fits = (r, c, w, h) => {
        if (c + w > cols) return false;
        for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (!free(y, x)) return false;
        return true;
      };
      const take = (r, c, w, h) => {
        for (let y = r; y < r + h; y++) {
          grid[y] = grid[y] || new Array(cols).fill(false);
          for (let x = c; x < c + w; x++) grid[y][x] = true;
        }
      };
      const place = (w, h) => {
        for (let r = 0; r < 4000; r++) for (let c = 0; c + w <= cols; c++) if (fits(r, c, w, h)) { take(r, c, w, h); return { r, c, w, h }; }
        return { r: 0, c: 0, w, h };
      };
      const items = [];
      for (let i = 0; i < n; i++) {
        const big = bigs.has(i);
        items.push({ ...place(big ? 2 : 1, big ? 2 : 1), big });
      }
      const rows = grid.length;
      const holes = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (free(r, c)) holes.push([r, c]);
      if (!holes.length) return { items, end: { r: rows, c: 0, w: cols, h: 1 } };
      const r0 = Math.min(...holes.map((h) => h[0]));
      const r1 = Math.max(...holes.map((h) => h[0]));
      const c0 = Math.min(...holes.map((h) => h[1]));
      const c1 = Math.max(...holes.map((h) => h[1]));
      if ((r1 - r0 + 1) * (c1 - c0 + 1) === holes.length) return { items, end: { r: r0, c: c0, w: c1 - c0 + 1, h: r1 - r0 + 1 } };
      if (!bigs.size) return { items, end: { r: rows, c: 0, w: cols, h: 1 } };
      bigs.delete(Math.max(...bigs));
    }
    return { items: [], end: { r: 0, c: 0, w: cols, h: 1 } };
  }

  const Market = {
    wall: $('[data-wall]'),
    offers: [],
    cards: new Map(),
    endEl: null,
    reached: false,
    triggers: [],
    lastCols: 0,

    init() {
      this.renderControls();
      this.offers = buyable(state.dest);
      this.sync(false);
    },
    cols() { return parseInt(getComputedStyle(this.wall).getPropertyValue('--cols'), 10) || 4; },
    match(o) {
      if (state.coll !== 'all' && !o.collections.includes(state.coll)) return false;
      if (state.origins.size && !state.origins.has(o.from.code)) return false;
      if (state.rayon && o.rayon !== state.rayon) return false;
      return true;
    },
    visibleCards() { return [...this.cards.values()].filter((c) => c.style.display !== 'none'); },

    /* Contrôles */
    renderControls() {
      const opts = [['all', 'Tout'], ['deals', D.collections.deals.name], ['rare', D.collections.rare.name]];
      $('[data-f-coll]').innerHTML = opts.map(([v, l]) => `<button type="button" data-action="f-coll" data-v="${v}" aria-pressed="${state.coll === v}">${esc(l)}</button>`).join('');
      this.renderCountryFilters();
      this.renderRayonSelect();
    },
    renderCountryFilters() {
      const counts = countBy(buyable(state.dest), (o) => o.from.code);
      $('[data-f-countries]').innerHTML = D.countries
        .filter((c) => counts.has(c.code) || state.origins.has(c.code))
        .map((c) => `<button type="button" class="fc t-${tone(c.code)}" data-action="f-country" data-v="${esc(c.code)}" aria-pressed="${state.origins.has(c.code)}">`
          + `${stickerHTML(c.code, `f-${c.code}`)}<span class="fc-name">${esc(c.name)}</span><span class="fc-n">${counts.get(c.code) || 0}<span class="sr-only"> ${plural(counts.get(c.code) || 0, 'offre', 'offres')}</span></span></button>`)
        .join('');
    },
    renderRayonSelect() {
      const offers = buyable(state.dest);
      const counts = countBy(offers, (o) => o.rayon);
      if (state.rayon && !counts.has(state.rayon)) state.rayon = '';
      $('[data-f-rayon]').innerHTML = `<option value="">${esc(D.nav[0] || 'Tous les rayons')} (${offers.length})</option>`
        + D.departments.filter((d) => counts.has(d.id))
          .map((d) => `<option value="${esc(d.id)}"${d.id === state.rayon ? ' selected' : ''}>${esc(d.name)} (${counts.get(d.id)})</option>`).join('');
    },
    paintControls() {
      $$('[data-action="f-coll"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.coll)));
      $$('[data-action="f-country"]').forEach((b) => b.setAttribute('aria-pressed', String(state.origins.has(b.dataset.v))));
      $('[data-f-rayon]').value = state.rayon;
    },

    /** Réconcilie les cartes avec les offres, applique les filtres et anime avec Flip si le mur est visible. */
    sync(animate = true) {
      const ids = new Set(this.offers.map((o) => o.id));
      this.offers.forEach((o) => {
        const el = this.cards.get(o.id);
        if (!el) {
          const card = fromHTML(cardHTML(o));
          card.style.display = 'none';
          this.wall.appendChild(card);
          this.cards.set(o.id, card);
        } else {
          const ship = $('.card-band .ship', el);
          if (ship) ship.textContent = shipText(o);
        }
      });
      const vis = this.offers.filter((o) => this.match(o));
      const visIds = new Set(vis.map((o) => o.id));
      const doFlip = animate && motionOK() && FL && inView(this.wall, 120);
      const leaving = doFlip ? this.visibleCards().filter((el) => !visIds.has(el.dataset.id)) : [];

      const finish = () => {
        for (const [id, el] of this.cards) if (!ids.has(id)) { el.remove(); this.cards.delete(id); }
        const targets = [...this.cards.values(), this.endEl].filter(Boolean);
        const before = doFlip ? FL.getState(targets) : null;
        const oldTop = doFlip ? new Map(targets.map((el) => [el, el.style.display === 'none' ? null : el.getBoundingClientRect().top])) : null;
        this.layout(vis, visIds);
        if (before) {
          /* Les cartes qui viendraient de plus d’un écran surgissent sur place : la grille se remplit sans temps mort. */
          const far = [];
          const near = targets.filter((el) => {
            const t0 = oldTop.get(el);
            if (t0 == null || el.style.display === 'none') return true;
            if (Math.abs(el.getBoundingClientRect().top - t0) > window.innerHeight * 0.9) { far.push(el); return false; }
            return true;
          });
          FL.from(before, {
            targets: near,
            duration: 0.6,
            ease: 'power3.out',
            scale: true,
            stagger: 0.012,
            onEnter: (els) => G.fromTo(els, { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.46, ease: 'back.out(1.7)', delay: 0.1, stagger: 0.03 }),
            onComplete: () => { if (ST) ST.refresh(); },
          });
          if (far.length) G.fromTo(far, { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.46, ease: 'back.out(1.7)', delay: 0.06, stagger: 0.03, clearProps: 'transform,opacity,visibility' });
        } else if (ST) {
          ST.refresh();
        }
        if (motionOK() && ST && !this.reached) this.arm();
      };

      if (leaving.length) {
        G.to(leaving, {
          autoAlpha: 0, scale: 0.9, duration: 0.2, ease: 'power2.in',
          onComplete: () => { G.set(leaving, { clearProps: 'transform,opacity,visibility' }); finish(); },
        });
      } else {
        finish();
      }
      this.paintCount(vis.length);
      return vis.length;
    },

    layout(vis, visIds) {
      for (const [id, el] of this.cards) el.style.display = visIds.has(id) ? '' : 'none';
      vis.forEach((o) => this.wall.appendChild(this.cards.get(o.id)));
      const cols = this.cols();
      this.lastCols = cols;
      const plan = pack(vis.length, cols);
      vis.forEach((o, i) => {
        const el = this.cards.get(o.id);
        const p = plan.items[i];
        el.classList.toggle('is-big', p.big);
        el.style.gridColumn = `${p.c + 1} / span ${p.w}`;
        el.style.gridRow = `${p.r + 1} / span ${p.h}`;
      });
      if (!this.endEl) {
        this.endEl = fromHTML('<li class="wall-end"><a href=""><span class="wall-end-t"></span><span class="wall-end-sub"></span></a></li>');
      }
      const end = this.endEl;
      if (vis.length) {
        const c = country(state.dest);
        const params = { collection: state.coll === 'all' ? '' : state.coll, origin: state.origins.size === 1 ? [...state.origins][0] : '', category: state.rayon };
        const a = $('a', end);
        a.href = catalogHref(params);
        $('.wall-end-t', end).textContent = 'Tout le catalogue';
        $('.wall-end-sub', end).textContent = `Chercher, trier et comparer les offres livrables ${inCountry(c)}`;
        if (!$('svg', a)) a.insertAdjacentHTML('beforeend', icon('arrow'));
        end.classList.toggle('is-wide', plan.end.w >= 3);
        end.classList.toggle('is-tall', plan.end.h >= 2);
        end.style.display = '';
        end.style.gridColumn = `${plan.end.c + 1} / span ${plan.end.w}`;
        end.style.gridRow = `${plan.end.r + 1} / span ${plan.end.h}`;
        this.wall.appendChild(end);
        /* La tuile de fin garde la hauteur d’une rangée d’étals : une carte 2×2 voisine conserve ses proportions. */
        const small = vis.map((o) => this.cards.get(o.id)).find((el) => !el.classList.contains('is-big'));
        const rowH = small ? small.offsetHeight : 0;
        const gap = parseFloat(getComputedStyle(this.wall).rowGap) || 0;
        end.style.minHeight = rowH && plan.end.w < cols ? `${plan.end.h * rowH + (plan.end.h - 1) * gap}px` : '';
      } else {
        end.style.display = 'none';
      }
      $('[data-wall-empty]').hidden = vis.length > 0;
    },

    paintCount(n) { $('[data-f-count]').textContent = `${n} ${plural(n, 'offre', 'offres')}`; },

    /* Montage au scroll (une seule fois par carte) */
    arm() {
      this.disarm();
      const cards = this.visibleCards().filter((c) => !c.dataset.mounted);
      if (!cards.length) return;
      prepMontage(cards);
      this.triggers = ST.batch(cards, {
        start: 'top 90%',
        once: true,
        interval: 0.06,
        batchMax: 4,
        onEnter: (els) => {
          this.reached = true;
          els.forEach((e) => { e.dataset.mounted = '1'; });
          montage(els);
        },
      });
    },
    disarm() {
      this.triggers.forEach((t) => t.kill());
      this.triggers = [];
      const pending = [...this.cards.values()].filter((c) => !c.dataset.mounted);
      if (pending.length && G) clearMontage(pending);
    },
    settle() {
      this.reached = true;
      this.disarm();
      this.cards.forEach((c) => { c.dataset.mounted = '1'; });
    },

    motion() {
      G.fromTo('[data-market-title]', { '--wdth': 50 }, {
        '--wdth': 150, ease: 'none',
        scrollTrigger: { trigger: '.market', start: 'top 95%', end: 'top 20%', scrub: 0.6 },
      });
      this.arm();
    },
    onRevert() { this.triggers = []; },

    filterChanged() {
      this.settle();
      const n = this.sync(true);
      const c = country(state.dest);
      announce(`${n} ${plural(n, 'offre affichée', 'offres affichées')}, livrables ${inCountry(c)}`);
    },
    destChanged() {
      this.offers = buyable(state.dest);
      const prevOrigins = [...state.origins];
      this.renderCountryFilters();
      this.renderRayonSelect();
      state.origins = new Set(prevOrigins.filter((code) => $(`[data-action="f-country"][data-v="${code}"]`)));
      this.paintControls();
      this.sync(true);
    },
    relayout() {
      const vis = this.offers.filter((o) => this.match(o));
      this.layout(vis, new Set(vis.map((o) => o.id)));
    },
  };

  /* ---------------------------------------------------------------
     Bons plans | Introuvables : deux sélections strictement égales
     --------------------------------------------------------------- */
  function pickSelection(coll, dest, exclude) {
    const all = offersTo(dest).filter((o) => o.collections.includes(coll));
    const buy = all.filter((o) => o.mode === 'purchase' && o.stock > 0);
    const pool = [...buy.filter((o) => !exclude.has(o.id)), ...buy.filter((o) => exclude.has(o.id))];
    const picked = [];
    const passes = [
      (o) => !picked.some((p) => p.from.code === o.from.code || p.name === o.name),
      (o) => !picked.some((p) => p.name === o.name),
      () => true,
    ];
    passes.forEach((ok) => pool.forEach((o) => { if (picked.length < 3 && !picked.includes(o) && ok(o)) picked.push(o); }));
    return { picked, total: all.length };
  }

  const Selections = {
    keys: ['deals', 'rare'],
    revealed: false,
    render() {
      const exclude = new Set(Hero.offers.map((o) => o.id));
      const c = country(state.dest);
      this.keys.forEach((k) => {
        const coll = D.collections[k];
        const { picked, total } = pickSelection(k, state.dest, exclude);
        $(`[data-sel-cards="${k}"]`).innerHTML = picked.map((o) => cardHTML(o, true)).join('');
        const more = $(`[data-sel-more="${k}"]`);
        const name = coll.name.toLowerCase();
        if (total > 1) {
          more.innerHTML = `<a class="link-arrow" href="${catalogHref({ collection: k })}">Voir les ${total} ${esc(name)} livrables ${esc(inCountry(c))}${icon('arrow')}</a>`;
        } else if (total === 1) {
          more.innerHTML = `<a class="link-arrow" href="${catalogHref({ collection: k })}">Voir la sélection ${esc(coll.name)} livrable ${esc(inCountry(c))}${icon('arrow')}</a>`;
        } else {
          more.innerHTML = `<span class="sel-none">Aucune offre de la sélection ${esc(coll.name)} livrable ${esc(inCountry(c))} pour l’instant.</span>`;
        }
      });
    },
    cards() { return $$('.sel-cards .card'); },
    motion() {
      const fits = $$('[data-coll-name]');
      G.fromTo(fits, { '--wdth': 50 }, {
        '--wdth': () => Fit.duoW, ease: 'none',
        scrollTrigger: { trigger: '.duo', start: 'top 92%', end: 'top 30%', scrub: 0.6, invalidateOnRefresh: true },
      });
      prepMontage(this.cards());
      ST.create({
        trigger: '.duo', start: 'top 62%', once: true,
        onEnter: () => {
          this.revealed = true;
          const deals = $$('[data-sel-cards="deals"] .card');
          const rare = $$('[data-sel-cards="rare"] .card');
          montage(deals);
          montage(rare);
        },
      });
    },
    update() {
      this.render();
      if (!motionOK()) return;
      if (!this.revealed) { prepMontage(this.cards()); return; }
      if (inView($('.duo'))) {
        const deals = $$('[data-sel-cards="deals"] .card');
        const rare = $$('[data-sel-cards="rare"] .card');
        prepMontage([...deals, ...rare]);
        montage(deals);
        montage(rare);
      }
    },
  };

  /* ---------------------------------------------------------------
     Les 15 rayons : mur d’affiches en duotone
     --------------------------------------------------------------- */
  const Rayons = {
    list: $('[data-rwall]'),
    render() {
      $('[data-rayon-total]').textContent = String(D.departments.length);
      this.list.innerHTML = D.departments.map((d) => {
        const subs = d.subcategories.slice(0, 3).map(esc).join(' · ');
        const showName = d.short.toLowerCase() !== d.name.toLowerCase();
        return `<li class="rayon" data-id="${esc(d.id)}">
          <div class="rayon-img">
            <img class="duo-img" src="${esc(d.image)}" alt="${esc(d.imageAlt)}" loading="lazy" decoding="async">
            <img class="real-img" src="${esc(d.image)}" alt="" loading="lazy" decoding="async">
          </div>
          <div class="rayon-txt">
            <h3 class="rayon-short"><a href="${catalogHref({ category: d.id })}"><span class="sr-only">${esc(d.name)}</span><span class="rayon-short-v" aria-hidden="true">${esc(d.short)}</span></a></h3>
            ${showName ? `<p class="rayon-name" aria-hidden="true">${esc(d.name)}</p>` : ''}
            <p class="rayon-subs"><span class="rayon-n">${d.categoryCount} catégories</span> <span class="rayon-subs-l">${subs}</span></p>
          </div>
        </li>`;
      }).join('');
      this.retone();
    },
    retone() {
      const cols = parseInt(getComputedStyle(this.list).getPropertyValue('--cols'), 10) || 5;
      const tones = rayonTones(D.departments.length, cols);
      $$('.rayon', this.list).forEach((el, i) => {
        TRIO.forEach((t) => el.classList.remove(`t-${t}`));
        el.classList.add(`t-${tones[i]}`);
      });
    },
    motion() {
      const cards = $$('.rayon', this.list);
      const imgs = $$('.duo-img', this.list);
      G.set(cards, { autoAlpha: 0, scale: 0.9, rotation: (i) => tilt(`rayon-${i}`, 3) });
      G.set(imgs, { autoAlpha: 0 });
      ST.create({
        trigger: this.list, start: 'top 78%', once: true,
        onEnter: () => {
          const tl = G.timeline();
          tl.to(cards, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.5)', stagger: { grid: 'auto', from: 'center', each: 0.06 } }, 0)
            .to(imgs, { autoAlpha: 1, duration: 0.55, ease: 'power2.out', stagger: { grid: 'auto', from: 'center', each: 0.06 } }, 0.28);
        },
      });
    },
  };

  /* ---------------------------------------------------------------
     Gros biens sur demande
     --------------------------------------------------------------- */
  const Quote = {
    list: $('[data-quote]'),
    render() {
      const offers = quoteOffers(state.dest);
      const section = $('#sur-devis');
      section.hidden = !offers.length;
      this.list.innerHTML = offers.map((o) => {
        const p = D.priceParts(o.price);
        const price = p.cents === '00' ? `${p.whole}<small> ${esc(p.currency)}</small>` : `${p.whole},${p.cents}<small> ${esc(p.currency)}</small>`;
        return `<li class="qcard">
          <div class="qcard-media">
            <a href="${productHref(o)}" tabindex="-1"><img src="${esc(o.image)}" alt="${esc(o.imageAlt)}" loading="lazy" decoding="async"></a>
            <div class="qcard-seller">${stickerHTML(o.from.code, o.id, 'sticker--m')}<p class="seller-t"><span class="seller-c">${esc(sellerIn(o.from))}</span><span class="seller-n">${esc(o.vendor.name)}</span></p></div>
            <p class="qcard-tag" style="--r:${tilt(`q-${o.id}`, 7)}deg"><span class="qcard-tag-k">Prix indicatif</span><span class="qcard-tag-v"><span class="sr-only">${esc(D.price(o.price))}</span><span aria-hidden="true">${price}</span></span></p>
          </div>
          <div class="qcard-body">
            <div>
              <h3 class="qcard-name"><a href="${productHref(o)}">${esc(o.name)}</a></h3>
              <div class="qcard-meta"><span class="pill">Devis ou réservation · aucun acompte (démo)</span><p class="qcard-del">${esc(o.delivery)}</p></div>
            </div>
            <a class="btn btn--light" href="${productHref(o)}">Demander un devis${icon('arrow')}<span class="sr-only"> : ${esc(o.name)}</span></a>
          </div>
        </li>`;
      }).join('');
    },
    motion() {
      $$('.qcard-media', this.list).forEach((m) => {
        G.fromTo($('img', m), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom 35%', scrub: true } });
        const tag = $('.qcard-tag', m);
        G.set(tag, { autoAlpha: 0 });
        ST.create({ trigger: m, start: 'top 70%', once: true, onEnter: () => slap(G.timeline(), tag, 0) });
      });
    },
  };

  /* ---------------------------------------------------------------
     Devenir vendeur et pied de page
     --------------------------------------------------------------- */
  const Sell = {
    render() {
      $('[data-sell-stickers]').innerHTML = D.countries.map((c) => `<li>${stickerHTML(c.code, `sell-${c.code}`)}</li>`).join('');
    },
    motion() {
      const st = $$('[data-sell-stickers] .sticker');
      G.set(st, { autoAlpha: 0 });
      ST.create({
        trigger: '.sell', start: 'top 72%', once: true,
        onEnter: () => { const tl = G.timeline(); st.forEach((s, i) => slap(tl, s, i * 0.1)); },
      });
    },
  };

  const KIND = { 'real-photograph': 'Photographie réelle', 'generated-illustration': 'Illustration générée' };
  const Footer = {
    render() {
      $('[data-legend]').innerHTML = D.countries.map((c) => `<li>${stickerHTML(c.code, `legend-${c.code}`)}<span>${esc(sellerIn(c))}</span></li>`).join('');
      $('[data-credits]').innerHTML = D.credits.map((cr) => `<li>
          <span class="cr-l">${esc(cr.label)}</span>
          <span class="cr-m">${esc(cr.author)} · ${esc(cr.license)} · ${esc(KIND[cr.kind] || cr.kind)}</span>
          ${cr.source ? `<a href="${esc(cr.source)}" rel="noopener" target="_blank">Source<span class="sr-only"> : ${esc(cr.label)} (nouvel onglet)</span>${icon('out')}</a>` : '<span class="cr-m">Source : générée pour la maquette</span>'}
        </li>`).join('');
    },
  };

  /* ---------------------------------------------------------------
     Panier, favoris, destination
     --------------------------------------------------------------- */
  function paintCounts() {
    $('[data-cart-count]').textContent = String(cartCount());
    $('[data-fav-count]').textContent = String(state.favs.size);
  }
  function bump(el) {
    if (!motionOK() || !el) return;
    G.fromTo(el, { scale: 1.3 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', overwrite: 'auto' });
  }

  /** Rectangle réellement occupé par une image en object-fit: contain. */
  function contentRect(img) {
    const r = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    if (cs.objectFit !== 'contain' || !img.naturalWidth) return r;
    const s = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    const [px, py] = cs.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    return { left: r.left + (r.width - w) * (Number.isNaN(px) ? 0.5 : px), top: r.top + (r.height - h) * (Number.isNaN(py) ? 0.5 : py), width: w, height: h };
  }

  /** Le produit vole en arc jusqu’au panier (450 ms) : on voit où l’objet est parti. */
  function flyToCart(btn, done) {
    const host = btn.closest('.stall, .card');
    const imgs = host ? $$('.stall-prod img, .card-prod img', host) : [];
    const img = imgs[imgs.length - 1];
    const target = $('#cart-link .cart-ico') || $('#cart-link');
    if (!img || !target) { done(); return; }
    const r = contentRect(img);
    const t = target.getBoundingClientRect();
    const fl = document.createElement('div');
    fl.className = `flyer${img.classList.contains('pimg--cut') ? '' : ' is-photo'}`;
    fl.setAttribute('aria-hidden', 'true');
    fl.style.width = `${r.width}px`;
    fl.style.height = `${r.height}px`;
    fl.innerHTML = `<img src="${esc(img.currentSrc || img.src)}" alt="">`;
    document.body.appendChild(fl);
    const tx = t.left + t.width / 2 - r.width / 2;
    const ty = t.top + t.height / 2 - r.height / 2;
    const endScale = clamp(30 / Math.max(r.width, r.height), 0.04, 0.5);
    G.set(fl, { x: r.left, y: r.top, transformOrigin: '50% 50%' });
    const tl = G.timeline({ onComplete: () => { fl.remove(); done(); } });
    tl.to(fl, { x: tx, duration: 0.45, ease: 'power1.in' }, 0)
      .to(fl, { y: ty, duration: 0.45, ease: 'power2.out' }, 0)
      .to(fl, { scale: endScale, rotation: 16, duration: 0.45, ease: 'power2.out' }, 0)
      .to(fl, { autoAlpha: 0, duration: 0.08, ease: 'none' }, 0.39);
  }

  function addToCart(id, btn) {
    const o = offerById(id);
    if (!o) return;
    state.cart[id] = (state.cart[id] || 0) + 1;
    save();
    const after = () => {
      paintCounts();
      bump($('[data-cart-count]'));
      Toast.show(`Ajouté au panier : ${o.name}`, 'check');
    };
    if (motionOK()) flyToCart(btn, after);
    else after();
  }

  function toggleFav(id, btn) {
    const o = offerById(id);
    if (!o) return;
    const on = !state.favs.has(id);
    if (on) state.favs.add(id); else state.favs.delete(id);
    save();
    $$('[data-action="fav"]').forEach((b) => { if (b.dataset.id === id) b.setAttribute('aria-pressed', String(on)); });
    paintCounts();
    if (motionOK()) {
      const svg = btn.querySelector(on ? '.i-on svg' : '.i-off svg');
      if (svg) G.fromTo(svg, { scale: on ? 1.5 : 0.7 }, { scale: 1, duration: 0.42, ease: 'back.out(3)' });
      bump($('[data-fav-count]'));
    }
    Toast.show(on ? `Ajouté aux favoris : ${o.name}` : `Retiré des favoris : ${o.name}`, on ? 'heartFill' : 'check');
  }

  /** Changer de destination : toute la page se réapprovisionne, la recherche en cours reste intacte. */
  function setDest(code) {
    if (code === state.dest || !D.country(code)) return;
    state.dest = code;
    save();
    Header.syncDest();
    Header.paintRayon();
    Hero.restock();
    World.update();
    Market.destChanged();
    Selections.update();
    Quote.render();
    if (motionOK() && ST) {
      Motion.add(() => Quote.motion());
      ST.refresh();
    }
    const c = country(code);
    const n = offersTo(code).length;
    announce(`${n} ${plural(n, 'offre livrable', 'offres livrables')} ${inCountry(c)}`);
  }

  /* ---------------------------------------------------------------
     Actions et clavier
     --------------------------------------------------------------- */
  function goTop() {
    Header.closeAll();
    window.scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' });
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-action]');
      if (!t) return;
      const a = t.dataset.action;
      switch (a) {
        case 'top': e.preventDefault(); goTop(); break;
        case 'dest-toggle': Header.toggleDest(); break;
        case 'rayons-toggle': Header.toggleRayons(); break;
        case 'rayons-close': Header.closeRayons(true); break;
        case 'rtile': Header.selectRayon(t.dataset.id, e.detail === 0); break;
        case 'lang':
          if (t.dataset.lang !== 'fr') Toast.show('Exploration disponible en français uniquement', 'translate');
          break;
        case 'add': addToCart(t.dataset.id, t); break;
        case 'fav': toggleFav(t.dataset.id, t); break;
        case 'f-coll':
          state.coll = t.dataset.v;
          Market.paintControls();
          Market.filterChanged();
          break;
        case 'f-country':
          if (state.origins.has(t.dataset.v)) state.origins.delete(t.dataset.v); else state.origins.add(t.dataset.v);
          Market.paintControls();
          Market.filterChanged();
          break;
        case 'f-reset':
          state.coll = 'all';
          state.origins.clear();
          state.rayon = '';
          Market.paintControls();
          Market.filterChanged();
          break;
        case 'open-credits': {
          const d = $('#sources');
          d.open = true;
          window.setTimeout(() => $('summary', d).focus({ preventScroll: true }), 0);
          break;
        }
        default: break;
      }
    });

    $('[data-f-rayon]').addEventListener('change', (e) => {
      state.rayon = e.target.value;
      Market.filterChanged();
    });

    Header.destList.addEventListener('click', (e) => {
      const li = e.target.closest('[role="option"]');
      if (li) Header.chooseDest(li.dataset.code);
    });
    Header.destList.addEventListener('keydown', (e) => Header.onDestKey(e));
    Header.destBtn.addEventListener('keydown', (e) => {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !Header.isDestOpen()) { e.preventDefault(); Header.openDest(); }
    });
    $('[data-rpanel-grid]').addEventListener('keydown', (e) => Header.onTilesKey(e));
    Header.rPanel.addEventListener('focusout', (e) => {
      const to = e.relatedTarget;
      if (to && !Header.rPanel.contains(to) && to !== Header.rBtn) Header.closeRayons(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (Header.isRayonsOpen()) { e.preventDefault(); Header.closeRayons(true); }
      else if (Header.isDestOpen()) { e.preventDefault(); Header.closeDest(true); }
    });
    document.addEventListener('pointerdown', (e) => {
      if (Header.isDestOpen() && !e.target.closest('.dest')) Header.closeDest(false);
      if (Header.isRayonsOpen() && !e.target.closest('#rayons-panel, #rayons-btn')) Header.closeRayons(false);
    });

    /* Recherches : même brouillon dans l’en-tête et le hero, envoi vers le catalogue */
    const inputs = $$('[data-q]');
    inputs.forEach((inp) => inp.addEventListener('input', () => {
      inputs.forEach((other) => { if (other !== inp) other.value = inp.value; });
    }));
    $$('[data-search]').forEach((form) => form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = $('[data-q]', form).value.trim();
      window.location.href = catalogHref({ q });
    }));

    reduceMQ.addEventListener('change', () => { if (reduceMQ.matches && Hero.introTl) Hero.introTl.progress(1); });
  }

  /* ---------------------------------------------------------------
     Typographie ajustée : l’axe de largeur d’Anybody remplit la mesure
     --------------------------------------------------------------- */
  const Fit = {
    sloganW: 66,
    duoW: 74,
    measure(el, w) {
      el.style.setProperty('--wdth', String(w));
      return el.getBoundingClientRect().width;
    },
    /** Largeur (wdth) pour laquelle le texte occupe exactement `target` pixels. */
    solve(el, target, min = 50, max = 150) {
      const a = this.measure(el, min);
      const b = this.measure(el, max);
      if (target <= a) return min;
      if (target >= b) return max;
      let w = min + ((target - a) / (b - a)) * (max - min);
      const m = this.measure(el, w);
      w = clamp(w + (target - m) / ((b - a) / (max - min)), min, max);
      return w;
    },
    all() {
      this.slogan();
      this.market();
      this.duo();
      this.rayons();
      this.quote();
    },
    slogan() {
      const h1 = $('.slogan');
      const span = $('[data-slogan]');
      const avail = h1.clientWidth - 2;
      const target = avail < 700 ? 50 : 64;
      h1.style.setProperty('--slogan-fs', '100px');
      const w = this.measure(span, target);
      h1.style.setProperty('--slogan-fs', `${clamp((100 * avail) / w, 18, 132).toFixed(2)}px`);
      this.sloganW = this.solve(span, avail);
      span.style.setProperty('--wdth', this.sloganW.toFixed(2));
    },
    market() {
      const h2 = $('.market-title');
      const span = $('[data-market-title]');
      const keep = span.style.getPropertyValue('--wdth');
      h2.style.setProperty('--market-fs', '100px');
      const w = this.measure(span, 150);
      h2.style.setProperty('--market-fs', `${clamp((100 * (h2.clientWidth - 2)) / w, 24, 360).toFixed(2)}px`);
      span.style.setProperty('--wdth', keep || '150');
    },
    duo() {
      const spans = $$('[data-coll-name]');
      if (!spans.length) return;
      const titles = spans.map((s) => s.parentElement);
      const avail = Math.min(...titles.map((t) => t.clientWidth)) - 2;
      titles.forEach((t) => t.style.setProperty('--duo-fs', '100px'));
      const widest = Math.max(...spans.map((s) => this.measure(s, 74)));
      const fs = clamp((100 * avail) / widest, 36, 150);
      titles.forEach((t) => t.style.setProperty('--duo-fs', `${fs.toFixed(2)}px`));
      this.duoW = Math.min(...spans.map((s) => this.solve(s, avail)));
      spans.forEach((s) => s.style.setProperty('--wdth', this.duoW.toFixed(2)));
    },
    rayons() {
      $$('.rayon').forEach((card) => {
        const h3 = $('.rayon-short', card);
        const v = $('.rayon-short-v', card);
        h3.style.removeProperty('--rayon-fs-local');
        const avail = h3.clientWidth - 1;
        let fit = this.solve(v, avail);
        if (fit <= 50 && this.measure(v, 50) > avail) {
          const fs = parseFloat(getComputedStyle(h3).fontSize);
          h3.style.setProperty('--rayon-fs-local', `${((fs * avail) / this.measure(v, 50)).toFixed(2)}px`);
          fit = 50;
        }
        v.style.removeProperty('--wdth');
        const rest = clamp(fit - 20, 50, 130);
        h3.style.setProperty('--wdth-rest', rest.toFixed(1));
        h3.style.setProperty('--wdth-hover', Math.min(rest + 20, fit).toFixed(1));
      });
    },
    quote() {
      const box = $('.quote-title');
      const avail = box.clientWidth - 2;
      $$('.quote-line', box).forEach((line) => {
        line.style.fontSize = '100px';
        const w = line.getBoundingClientRect().width;
        line.style.fontSize = `${clamp((100 * avail) / w, 12, 240).toFixed(2)}px`;
      });
    },
  };

  function setAbove() {
    const stalls = $('[data-stalls]');
    stalls.style.setProperty('--above', `${Math.round(stalls.getBoundingClientRect().top + window.scrollY)}px`);
  }

  /* ---------------------------------------------------------------
     Mouvement : tout est créé dans gsap.matchMedia (mouvement autorisé)
     --------------------------------------------------------------- */
  const Motion = {
    ctx: null,
    add(fn) { if (this.ctx) this.ctx.add(fn); },
    setup() {
      if (!G || !ST) return;
      const mm = G.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', (context) => {
        this.ctx = context;
        Hero.parallax();
        World.motion();
        Market.motion();
        Selections.motion();
        Rayons.motion();
        Quote.motion();
        Sell.motion();
        return () => {
          this.ctx = null;
          Market.onRevert();
          Hero.revealNow();
        };
      });
    },
  };

  /* ---------------------------------------------------------------
     Démarrage
     --------------------------------------------------------------- */
  function hydrateStatic() {
    $$('[data-demo-notice]').forEach((el) => { el.textContent = D.demoNotice; });
    $('[data-slogan]').textContent = D.slogan;
    $('[data-pitch]').textContent = D.pitch;
    $$('[data-nav]').forEach((el) => { const v = D.nav[Number(el.dataset.nav)]; if (v) el.textContent = v; });
    ['deals', 'rare'].forEach((k) => {
      const c = D.collections[k];
      if (!c) return;
      $(`[data-coll-name="${k}"]`).textContent = c.name;
      $(`[data-coll-text="${k}"]`).textContent = c.text;
    });
    $$('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));
  }

  function init() {
    load();
    hydrateStatic();
    Header.init();
    Hero.render();
    World.render();
    Market.init();
    Selections.render();
    Rayons.render();
    Quote.render();
    Sell.render();
    Footer.render();
    paintCounts();
    bindEvents();

    if (motionOK()) Hero.prepIntro();
    const safety = window.setTimeout(() => { if (motionOK()) Hero.revealNow(); }, 3500);

    /* Les mesures typographiques attendent Anybody ; au-delà de 900 ms, on démarre et on réajuste à son arrivée. */
    let fontsIn = false;
    const fontsLoaded = document.fonts
      ? Promise.all([document.fonts.load('900 100px Anybody'), document.fonts.load('500 16px "Instrument Sans"')])
        .then(() => document.fonts.ready).then(() => { fontsIn = true; }).catch(() => {})
      : Promise.resolve();
    Promise.race([fontsLoaded, new Promise((res) => setTimeout(res, 900))]).then(() => {
      const late = !fontsIn;
      Fit.all();
      setAbove();
      Motion.setup();
      if (motionOK()) { window.clearTimeout(safety); Hero.playIntro(); }
      if (ST) ST.refresh();
      if (late) {
        fontsLoaded.then(() => {
          if (Hero.introTl) { Hero.introTl.progress(1); Hero.introTl = null; }
          Fit.all();
          setAbove();
          if (ST) ST.refresh();
        });
      }
    });

    let lastW = window.innerWidth;
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth === lastW) { setAbove(); return; }
      lastW = window.innerWidth;
      if (Hero.introTl) { Hero.introTl.progress(1); Hero.introTl = null; }
      Fit.all();
      setAbove();
      if (Market.cols() !== Market.lastCols) Market.relayout();
      Rayons.retone();
      if (ST) ST.refresh();
    }, 160));
  }

  init();
})();
