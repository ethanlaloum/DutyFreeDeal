/*
 * DutyFreeDeal, exploration A « Arrivées ».
 * Renders the home page from window.DFD, drives the split-flap component, menus,
 * demo cart and favourites, and the GSAP motion (only when motion is welcome).
 * Order: environment, utilities, icons, copy, state, components, sections (page order), interactions, motion, init.
 */
(() => {
  'use strict';

  const D = window.DFD;
  if (!D) return;

  /* ───────────────────────── Environment ───────────────────────── */
  const G = window.gsap || null;
  if (G) {
    const plugins = [window.ScrollTrigger, window.ScrambleTextPlugin, window.DrawSVGPlugin, window.Flip].filter(Boolean);
    G.registerPlugin(...plugins);
  }
  const ST = G && window.ScrollTrigger ? window.ScrollTrigger : null;
  const FLIP = G && window.Flip ? window.Flip : null;
  const root = document.documentElement;
  const motion = { ok: false };
  const canAnimate = () => motion.ok && !!G;

  /* ───────────────────────── Utilities ───────────────────────── */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
  const plural = (n, one, many) => (n === 1 ? one : many);
  const pad2 = (n) => String(Math.max(0, Math.min(99, n))).padStart(2, '0');
  const inViewport = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  };
  /* Explicitly requests the three families (fonts.ready alone resolves before they are even requested). */
  const FONT_PROBES = ['800 100px "Barlow Condensed"', '700 100px "Barlow Condensed"', '400 16px "Barlow"', '700 20px "Martian Mono"'];
  let fontsPromise = null;
  const fontsReady = (timeout) => new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    setTimeout(finish, timeout);
    if (!document.fonts || !document.fonts.load) { finish(); return; }
    fontsPromise = fontsPromise || Promise.all(FONT_PROBES.map((f) => document.fonts.load(f))).then(() => document.fonts.ready);
    fontsPromise.then(finish, finish);
  });

  /* ───────────────────────── Icons (Phosphor, MIT, copied inline from node_modules) ───────────────────────── */
  const ICONS = {
    'search': '<path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"/>',
    'heart': '<path d="M178,36c-20.09,0-37.92,7.93-50,21.56C115.92,43.93,98.09,36,78,36a66.08,66.08,0,0,0-66,66c0,72.34,105.81,130.14,110.31,132.57a12,12,0,0,0,11.38,0C138.19,232.14,244,174.34,244,102A66.08,66.08,0,0,0,178,36Zm-5.49,142.36A328.69,328.69,0,0,1,128,210.16a328.69,328.69,0,0,1-44.51-31.8C61.82,159.77,36,131.42,36,102A42,42,0,0,1,78,60c17.8,0,32.7,9.4,38.89,24.54a12,12,0,0,0,22.22,0C145.3,69.4,160.2,60,178,60a42,42,0,0,1,42,42C220,131.42,194.18,159.77,172.51,178.36Z"/>',
    'heart-fill': '<path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z"/>',
    'cart': '<path d="M241.55,64.74A12,12,0,0,0,232,60H60.23L51.56,28.79A12,12,0,0,0,40,20H20a12,12,0,0,0,0,24H30.88l34.3,123.49a28.09,28.09,0,0,0,27,20.51H191a28.09,28.09,0,0,0,27-20.51l25.63-92.28A12,12,0,0,0,241.55,64.74ZM194.8,161.07A4,4,0,0,1,191,164H92.16a4,4,0,0,1-3.85-2.93L66.9,84H216.21ZM108,220a20,20,0,1,1-20-20A20,20,0,0,1,108,220Zm104,0a20,20,0,1,1-20-20A20,20,0,0,1,212,220Z"/>',
    'arrow-right': '<path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"/>',
    'arrow-down-right': '<path d="M204,88V192a12,12,0,0,1-12,12H88a12,12,0,0,1,0-24h75L55.51,72.48a12,12,0,0,1,17-17L180,163V88a12,12,0,0,1,24,0Z"/>',
    'arrow-up-right': '<path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"/>',
    'caret-down': '<path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/>',
    'squares': '<path d="M120,56v48a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40h48A16,16,0,0,1,120,56Zm80-16H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm-96,96H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm96,0H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Z"/>',
    'tag': '<path d="M246.15,133.18,146.83,33.86A19.85,19.85,0,0,0,132.69,28H40A12,12,0,0,0,28,40v92.69a19.85,19.85,0,0,0,5.86,14.14l99.32,99.32a20,20,0,0,0,28.28,0l84.69-84.69A20,20,0,0,0,246.15,133.18Zm-98.83,93.17L52,131V52h79l95.32,95.32ZM104,88A16,16,0,1,1,88,72,16,16,0,0,1,104,88Z"/>',
    'binoculars': '<path d="M241,150.65s0,0,0-.05a51.33,51.33,0,0,0-2.53-5.9L196.93,50.18a12,12,0,0,0-2.5-3.65,36,36,0,0,0-50.92,0A12,12,0,0,0,140,55V76H116V55a12,12,0,0,0-3.51-8.48,36,36,0,0,0-50.92,0,12,12,0,0,0-2.5,3.65L17.53,144.7A51.33,51.33,0,0,0,15,150.6s0,0,0,.05A52,52,0,1,0,116,168V100h24v68a52,52,0,1,0,101-17.35ZM80,62.28a12,12,0,0,1,12-1.22v63.15a51.9,51.9,0,0,0-35.9-7.62ZM64,196a28,28,0,1,1,28-28A28,28,0,0,1,64,196ZM164,61.06a12.06,12.06,0,0,1,12,1.22l23.87,54.31a51.9,51.9,0,0,0-35.9,7.62ZM192,196a28,28,0,1,1,28-28A28,28,0,0,1,192,196Z"/>',
    'package': '<path d="M225.6,62.64l-88-48.17a19.91,19.91,0,0,0-19.2,0l-88,48.17A20,20,0,0,0,20,80.19v95.62a20,20,0,0,0,10.4,17.55l88,48.17a19.89,19.89,0,0,0,19.2,0l88-48.17A20,20,0,0,0,236,175.81V80.19A20,20,0,0,0,225.6,62.64ZM128,36.57,200,76,178.57,87.73l-72-39.42Zm0,78.83L56,76,81.56,62l72,39.41ZM44,96.79l72,39.4v76.67L44,173.44Zm96,116.07V136.19l24-13.13V152a12,12,0,0,0,24,0V109.92l24-13.13v76.65Z"/>',
    'storefront': '<path d="M236,96a12,12,0,0,0-.44-3.3L221.2,42.51A20.08,20.08,0,0,0,202,28H54A20.08,20.08,0,0,0,34.8,42.51L20.46,92.7A12,12,0,0,0,20,96h0v16a43.94,43.94,0,0,0,16,33.92V216a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V145.92A43.94,43.94,0,0,0,236,112V96ZM57.05,52H199l9.14,32H47.91Zm91,56v4a20,20,0,0,1-40,0v-4ZM53,128.71A20,20,0,0,1,44,112v-4H84v4a20,20,0,0,1-20,20,19.76,19.76,0,0,1-9.07-2.2A11.54,11.54,0,0,0,53,128.71ZM196,204H60V155.81c1.32.12,2.65.19,4,.19a43.86,43.86,0,0,0,32-13.85,43.89,43.89,0,0,0,64,0A43.86,43.86,0,0,0,192,156c1.35,0,2.68-.07,4-.19Zm16-92a20,20,0,0,1-9,16.71,11.66,11.66,0,0,0-1.88,1.09A20,20,0,0,1,172,112v-4h40Z"/>',
    'x': '<path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/>',
    'check': '<path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/>',
    'globe': '<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm84,108a83.64,83.64,0,0,1-4.47,27L167,130a19.65,19.65,0,0,0-7.8-2.78l-22.82-3.08A20.14,20.14,0,0,0,117.72,132h-4.07l-2.71-5.6a19.88,19.88,0,0,0-13.8-10.84L94.46,115l4-7h14.39a20,20,0,0,0,9.66-2.49l12.25-6.76a20.57,20.57,0,0,0,3.74-2.68l26.92-24.33A20,20,0,0,0,172,56.49,84,84,0,0,1,212,128ZM140.76,45l6.2,11.1L122.75,78l-10.93,6H96.14A20.05,20.05,0,0,0,78.78,94.06l-4.49,7.85L67.68,84.28l9.91-23.42A83.91,83.91,0,0,1,140.76,45ZM44,128a83.52,83.52,0,0,1,4.4-26.77l7.74,20.65a19.89,19.89,0,0,0,14.52,12.53l19.53,4.2,3,6.1a20.11,20.11,0,0,0,13.55,10.77l-5,11.12a20,20,0,0,0,3.58,21.71l.21.22,18.16,18.7-.89,4.59A84.09,84.09,0,0,1,44,128Zm103.65,81.66a20.11,20.11,0,0,0-5-17.3l-.21-.22-17.72-18.25,11.37-25.52,19,2.56,41.43,25.48A84.2,84.2,0,0,1,147.65,209.66Z"/>',
    'id-card': '<path d="M148,108a12,12,0,0,1,12-12h28a12,12,0,0,1,0,24H160A12,12,0,0,1,148,108Zm40,28H168a12,12,0,0,0,0,24h20a12,12,0,0,0,0-24Zm48-80V200a20,20,0,0,1-20,20H40a20,20,0,0,1-20-20V56A20,20,0,0,1,40,36H216A20,20,0,0,1,236,56Zm-24,4H44V196H212ZM58.28,159.37A43.82,43.82,0,0,1,71.53,142a36,36,0,1,1,56.94,0,43.84,43.84,0,0,1,13.26,17.37,12,12,0,0,1-22.15,9.26C116.48,161.19,108.42,156,100,156s-16.47,5.2-19.59,12.63a12,12,0,1,1-22.13-9.26ZM88,120a12,12,0,1,0,12-12A12,12,0,0,0,88,120Z"/>',
    'credit-card': '<path d="M224,44H32A20,20,0,0,0,12,64V192a20,20,0,0,0,20,20H224a20,20,0,0,0,20-20V64A20,20,0,0,0,224,44Zm-4,24V88H36V68ZM36,188V112H220v76Zm172-24a12,12,0,0,1-12,12H164a12,12,0,0,1,0-24h32A12,12,0,0,1,208,164Zm-68,0a12,12,0,0,1-12,12H116a12,12,0,0,1,0-24h12A12,12,0,0,1,140,164Z"/>',
    'clipboard': '<path d="M172,164a12,12,0,0,1-12,12H96a12,12,0,0,1,0-24h64A12,12,0,0,1,172,164Zm-12-52H96a12,12,0,0,0,0,24h64a12,12,0,0,0,0-24Zm60-64V216a20,20,0,0,1-20,20H56a20,20,0,0,1-20-20V48A20,20,0,0,1,56,28H90.53a51.88,51.88,0,0,1,74.94,0H200A20,20,0,0,1,220,48ZM100.29,60h55.42a28,28,0,0,0-55.42,0ZM196,52H178.59A52.13,52.13,0,0,1,180,64v8a12,12,0,0,1-12,12H88A12,12,0,0,1,76,72V64a52.13,52.13,0,0,1,1.41-12H60V212H196Z"/>',
  };
  const icon = (name) => `<svg class="icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  function hydrateIcons(scope = document) {
    $$('[data-icon]', scope).forEach((el) => { if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon); });
  }

  /* ───────────────────────── Links into the existing refonte ───────────────────────── */
  const REFONTE = '../../';
  const link = {
    catalog(params = {}) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, value); });
      const s = qs.toString();
      return `${REFONTE}#/catalog${s ? `?${s}` : ''}`;
    },
    product: (id) => `${REFONTE}#/product/${encodeURIComponent(id)}`,
    categories: `${REFONTE}#/categories`,
    orders: `${REFONTE}#/orders`,
    wishlist: `${REFONTE}#/wishlist`,
    cart: `${REFONTE}#/cart`,
    sellerOnboarding: `${REFONTE}#/seller/onboarding`,
  };

  /* ───────────────────────── French copy helpers ───────────────────────── */
  const PREPOSITION = { FR: 'en', ES: 'en', US: 'aux', MX: 'au' };
  const countryOf = (code) => D.country(code) || { code, iso3: code, name: code };
  const inCountry = (code) => `${PREPOSITION[code] || 'en'} ${countryOf(code).name}`;
  const sellerIn = (code) => `Vendeur ${inCountry(code)}`;
  const verifLabel = (v) => `${v.verification === 'kyc' ? 'KYC' : 'KYB'} vérifié · démo`;
  const shippingLine = (o) => (o.mode === 'quote' ? 'Transport et délai à préciser dans le devis' : `+ ${D.price(o.shipping)} de livraison`);
  const NOUNS = {
    all: ['offre', 'offres'],
    deals: ['bon plan', 'bons plans'],
    rare: ['introuvable', 'introuvables'],
    quote: ['offre sur devis', 'offres sur devis'],
  };
  const countPhrase = (n, kind, dest) => {
    const [one, many] = NOUNS[kind] || NOUNS.all;
    return `${n} ${plural(n, one, many)} ${plural(n, 'livrable', 'livrables')} ${inCountry(dest)}`;
  };
  const MORE_LINK = {
    deals: (n, where) => (n === 1 ? `Voir le bon plan livrable ${where}` : `Voir les ${n} bons plans livrables ${where}`),
    rare: (n, where) => (n === 1 ? `Voir l’introuvable livrable ${where}` : `Voir les ${n} introuvables livrables ${where}`),
  };

  /* ───────────────────────── State (memory, mirrored in localStorage) ───────────────────────── */
  const STORE_KEY = 'dutyfreedeal-explo-a-arrivees';
  const offerIds = new Set(D.offers.map((o) => o.id));
  const state = {
    dest: D.countries[0] ? D.countries[0].code : 'FR',
    cart: [],
    favs: new Set(),
    filter: 'all',
    expanded: false,
    draft: '',
  };
  (function load() {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && D.country(saved.dest)) state.dest = saved.dest;
      if (saved && Array.isArray(saved.cart)) {
        state.cart = saved.cart
          .filter((l) => l && offerIds.has(l.id) && Number.isFinite(l.qty) && l.qty > 0)
          .map((l) => ({ id: l.id, qty: Math.min(99, Math.floor(l.qty)) }));
      }
      if (saved && Array.isArray(saved.favs)) state.favs = new Set(saved.favs.filter((id) => offerIds.has(id)));
    } catch (e) { /* storage unavailable: memory only */ }
  })();
  function save() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ dest: state.dest, cart: state.cart, favs: [...state.favs] }));
    } catch (e) { /* storage unavailable: memory only */ }
  }

  const offersHere = () => D.offersFor(state.dest);
  function findOffer(id) {
    const here = offersHere().find((o) => o.id === id);
    if (here) return here;
    const o = D.offers.find((x) => x.id === id);
    if (!o) return null;
    const v = D.vendor(o.vendorId);
    return { ...o, vendor: v, from: countryOf(v.country), to: countryOf(state.dest), shipping: v.shipping[state.dest] };
  }

  /* ───────────────────────── Component: split-flap board (palettes) ───────────────────────── */
  const Flaps = (() => {
    const SETS = {
      alpha: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digit: ' 0123456789',
      any: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    };
    const glyph = (ch) => `<span class="flap__glyph">${esc(ch.trim())}</span>`;
    const cellHTML = (ch) => `<span class="flap" data-ch="${esc(ch)}"><span class="flap__half flap__half--top">${glyph(ch)}</span><span class="flap__half flap__half--bottom">${glyph(ch)}</span><span class="flap__leaf flap__leaf--top">${glyph(ch)}<span class="flap__shade"></span></span><span class="flap__leaf flap__leaf--bottom">${glyph(ch)}<span class="flap__shade"></span></span></span>`;

    function fit(el, text) {
      const len = Number(el.dataset.len) || 0;
      const s = String(text ?? '').toUpperCase();
      if (!len) return s;
      return el.dataset.align === 'right' ? s.padStart(len, ' ').slice(-len) : s.padEnd(len, ' ').slice(0, len);
    }
    function parts(cell) {
      if (!cell._parts) {
        const [top, bottom, leafTop, leafBottom] = cell.children;
        cell._parts = {
          top, bottom, leafTop, leafBottom,
          gTop: top.firstChild, gBottom: bottom.firstChild,
          gLeafTop: leafTop.firstChild, gLeafBottom: leafBottom.firstChild,
          shadeTop: leafTop.lastChild, shadeBottom: leafBottom.lastChild,
        };
      }
      return cell._parts;
    }
    /* Stops any running flip and paints the resting character on every face. */
    function rest(cell) {
      const p = parts(cell);
      if (cell._tl) { cell._tl.kill(); cell._tl = null; }
      if (G) G.set([p.leafTop, p.leafBottom, p.shadeTop, p.shadeBottom], { clearProps: 'all' });
      else { p.leafTop.removeAttribute('style'); p.leafBottom.removeAttribute('style'); }
      const t = (cell.dataset.ch || ' ').trim();
      p.gTop.textContent = t; p.gBottom.textContent = t; p.gLeafTop.textContent = t; p.gLeafBottom.textContent = t;
    }
    /* The flap runs through the characters that precede the target, like a real drum. */
    function sequence(from, to, chars, n) {
      const target = chars.indexOf(to);
      if (target < 0) return [to];
      const seq = [];
      for (let k = n; k >= 1; k -= 1) seq.push(chars[(target - k + chars.length * 2) % chars.length]);
      seq.push(to);
      while (seq.length > 1 && seq[0] === from) seq.shift();
      return seq;
    }
    function flipCell(cell, to, chars, steps, step) {
      rest(cell);
      const p = parts(cell);
      const seq = sequence(cell.dataset.ch || ' ', to, chars, steps);
      const half = step / 2;
      const tl = G.timeline({ onComplete: () => { cell._tl = null; rest(cell); } });
      let current = cell.dataset.ch || ' ';
      seq.forEach((next) => {
        const a = current.trim();
        const b = next.trim();
        tl.call(() => {
          p.gTop.textContent = b;
          p.gLeafTop.textContent = a;
          p.gLeafBottom.textContent = b;
          p.gBottom.textContent = a;
          G.set(p.leafTop, { rotationX: 0, visibility: 'visible' });
          G.set(p.leafBottom, { rotationX: 90, visibility: 'visible' });
        });
        tl.to(p.leafTop, { rotationX: -90, duration: half, ease: 'power1.in' });
        tl.fromTo(p.shadeTop, { opacity: 0 }, { opacity: 0.6, duration: half, ease: 'power1.in', immediateRender: false }, '<');
        tl.to(p.leafBottom, { rotationX: 0, duration: half, ease: 'power2.out' });
        tl.fromTo(p.shadeBottom, { opacity: 0.6 }, { opacity: 0, duration: half, ease: 'power1.out', immediateRender: false }, '<');
        tl.call(() => {
          p.gBottom.textContent = b;
          cell.dataset.ch = next;
          G.set(p.leafTop, { visibility: 'hidden' });
        });
        current = next;
      });
      cell._tl = tl;
      return tl;
    }
    function mount(el, text, { len, set = 'any', align = 'left' } = {}) {
      el.dataset.len = String(len ?? String(text ?? '').length);
      el.dataset.set = set;
      el.dataset.align = align;
      el.dataset.value = String(text ?? '');
      el.innerHTML = Array.from(fit(el, text)).map(cellHTML).join('');
    }
    function set(el, text) {
      if (!el) return;
      const s = fit(el, text);
      el.dataset.value = String(text ?? '');
      Array.from(el.children).forEach((cell, i) => { cell.dataset.ch = s[i] ?? ' '; rest(cell); });
    }
    function flip(el, text, { delay = 0, stagger = 0.06, jitter = 0.07, step = 0.075, min = 3, max = 6, onlyChanged = false } = {}) {
      if (!el) return null;
      if (!canAnimate()) { set(el, text); return null; }
      const s = fit(el, text);
      const chars = SETS[el.dataset.set] || SETS.any;
      el.dataset.value = String(text ?? '');
      const tl = G.timeline({ delay });
      Array.from(el.children).forEach((cell, i) => {
        const to = s[i] ?? ' ';
        if (onlyChanged && cell.dataset.ch === to && !cell._tl) return;
        tl.add(flipCell(cell, to, chars, G.utils.random(min, max, 1), step), i * stagger + Math.random() * jitter);
      });
      return tl;
    }
    return { mount, set, flip };
  })();

  /* Mounts every [data-flap-text] placeholder of a scope, optionally blank (board before its update). */
  function mountFlaps(scope, { blank = false } = {}) {
    $$('[data-flap-text]', scope).forEach((el) => {
      const text = el.dataset.flapText;
      Flaps.mount(el, blank ? '' : text, {
        len: Number(el.dataset.len) || text.length,
        set: el.dataset.set || 'any',
        align: el.dataset.align || 'left',
      });
    });
  }

  /* ───────────────────────── Component: scrambled text (tableau qui se met à jour) ───────────────────────── */
  const UPPER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER_CHARS = 'abcdefghijklmnopqrstuvwxyz';
  const DIGIT_CHARS = '0123456789';
  /* Digits roll like a counter, words like letters on a drum. */
  const charsFor = (el, text) => (el.classList.contains('fx--num') || /^[\d\s,.+€\u202f\u00a0]+$/.test(text) ? DIGIT_CHARS : UPPER_CHARS);
  function scramble(el, text, { duration = 0.6, delay = 0, chars, reveal = 0.3 } = {}) {
    if (!el) return null;
    const finalText = text ?? el.textContent;
    if (!canAnimate() || !window.ScrambleTextPlugin) { el.textContent = finalText; return null; }
    G.killTweensOf(el);
    return G.to(el, {
      duration,
      delay,
      ease: 'none',
      scrambleText: { text: finalText, chars: chars || charsFor(el, finalText), revealDelay: duration * reveal, speed: 0.45 },
      onComplete: () => { el.textContent = finalText; },
    });
  }
  /* Visible animated copy + exact text for screen readers. */
  const fx = (text, cls = '') => `<span class="sr-only">${esc(text)}</span><span class="fx${cls ? ` ${cls}` : ''}" aria-hidden="true">${esc(text)}</span>`;
  /* Shipping always on its own line; only the amount is animated. */
  const shipFx = (o) => (o.mode === 'quote'
    ? fx(shippingLine(o))
    : `<span class="sr-only">${esc(shippingLine(o))}</span><span aria-hidden="true">+ <span class="fx fx--num">${esc(D.price(o.shipping))}</span> de livraison</span>`);
  /* Re-renders a block, then animates only what changed: flaps that differ, fields whose text differs. */
  function morph(container, html, { delay = 0, flapStep = 0.075 } = {}) {
    const oldFlaps = $$('[data-flap-text]', container).map((el) => el.dataset.value ?? el.dataset.flapText);
    const same = (a, b) => String(a ?? '').replace(/[\s\u00a0\u202f]+/g, ' ') === String(b ?? '').replace(/[\s\u00a0\u202f]+/g, ' ');
    const oldFx = $$('.fx', container).map((el) => el.textContent);
    container.innerHTML = html;
    $$('[data-flap-text]', container).forEach((el, k) => {
      const text = el.dataset.flapText;
      Flaps.mount(el, oldFlaps[k] ?? '', { len: text.length, set: el.dataset.set || 'any' });
      if ((oldFlaps[k] ?? '') !== text) Flaps.flip(el, text, { delay: delay + k * 0.08, step: flapStep });
    });
    let changed = 0;
    $$('.fx', container).forEach((el, k) => {
      if (same(oldFx[k], el.textContent)) return;
      scramble(el, el.textContent, { duration: 0.5, delay: delay + 0.04 + changed * 0.05 });
      changed += 1;
    });
  }

  /* ───────────────────────── Component: announcer and toast ───────────────────────── */
  let announceTimer = 0;
  function announce(message) {
    const el = $('[data-announcer]');
    if (!el) return;
    el.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { el.textContent = message; }, 80);
  }
  let toastTimer = 0;
  function toast(tag, title, meta = '') {
    const el = $('[data-toast]');
    if (!el) return;
    el.innerHTML = `<span class="toast__tag">${esc(tag)}</span><span class="toast__text"><strong>${esc(title)}</strong>${meta ? `<span class="toast__meta">${esc(meta)}</span>` : ''}</span>`;
    el.hidden = false;
    if (canAnimate()) G.fromTo(el, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.3, ease: 'power3.out', overwrite: true });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (canAnimate()) G.to(el, { x: 40, autoAlpha: 0, duration: 0.22, ease: 'power2.in', overwrite: true, onComplete: () => { el.hidden = true; } });
      else el.hidden = true;
    }, 3000);
  }

  /* ───────────────────────── Component: offer fragments ───────────────────────── */
  const routeHTML = (o, { ink = false } = {}) => {
    const cls = `flaps flaps--sm${ink ? ' flaps--ink' : ''}`;
    return `<span class="sr-only">${esc(sellerIn(o.from.code))}, livraison ${esc(inCountry(o.to.code))}</span><span class="route__codes" aria-hidden="true"><span class="${cls}" data-flap-text="${esc(o.from.iso3)}" data-set="alpha"></span><span class="route__arrow">${icon('arrow-right')}</span><span class="${cls}" data-flap-text="${esc(o.to.iso3)}" data-set="alpha"></span></span>`;
  };
  const sellerFlapHTML = (o, { ink = false } = {}) => `<span class="flaps flaps--sm${ink ? ' flaps--ink' : ''}" data-flap-text="${esc(o.from.iso3)}" data-set="alpha" aria-hidden="true"></span>`;
  const addButton = (o, variant = 'btn--signal') => `<button class="btn ${variant} add" type="button" data-add="${esc(o.id)}" aria-label="Ajouter au panier : ${esc(o.name)}, ${esc(o.vendor.name)}"><span class="add__label">${icon('cart')}<span>Ajouter<span class="add__more"> au panier</span></span></span><span class="add__done" aria-hidden="true">${icon('check')}Ajouté</span></button>`;
  const heartButton = (o, extra = '') => {
    const on = state.favs.has(o.id);
    return `<button class="heart${extra ? ` ${extra}` : ''}" type="button" aria-pressed="${on}" data-fav="${esc(o.id)}" aria-label="Favori : ${esc(o.name)}, ${esc(o.vendor.name)}">${icon(on ? 'heart-fill' : 'heart')}</button>`;
  };

  /* ───────────────────────── Section: static copy from the data ───────────────────────── */
  let sloganLines = [];
  function renderStatic() {
    $$('[data-demo-notice]').forEach((el) => { el.textContent = D.demoNotice; });
    $$('[data-nav]').forEach((el) => { el.textContent = D.nav[Number(el.dataset.nav)] || ''; });
    $('[data-pitch]').textContent = D.pitch;
    $('[data-footer-slogan]').textContent = D.slogan;
    const heroInput = $('#hero-q');
    $('#hdr-q').placeholder = heroInput.placeholder;
    const slogan = D.slogan;
    const cut = slogan.indexOf(',');
    const first = cut >= 0 ? slogan.slice(0, cut + 1) : slogan;
    const second = cut >= 0 ? slogan.slice(cut + 1).trim() : '';
    sloganLines = [first, second].filter(Boolean);
    const words = (line) => line.split(' ').map((w) => `<span class="sw">${esc(w)}</span>`).join(' ');
    $('[data-slogan]').innerHTML = `<span class="sr-only">${esc(slogan)}</span><span class="slogan__line slogan__line--1" aria-hidden="true">${words(first)}</span>${second ? `<span class="slogan__line slogan__line--2" aria-hidden="true">${words(second)}</span>` : ''}`;
  }

  /* The second slogan line spans the grid exactly, like a hanging sign; capped by viewport height. */
  function fitSlogan() {
    const h1 = $('[data-slogan]');
    const longest = sloganLines.reduce((a, b) => (b.length > a.length ? b : a), '');
    if (!h1 || !longest) return;
    h1.style.removeProperty('--slogan-size');
    if (window.innerWidth <= 760) return;
    const probe = 100;
    h1.style.setProperty('--slogan-size', `${probe}px`);
    const ruler = document.createElement('span');
    ruler.className = 'slogan__ruler';
    ruler.setAttribute('aria-hidden', 'true');
    ruler.textContent = longest;
    h1.appendChild(ruler);
    const width = ruler.getBoundingClientRect().width;
    ruler.remove();
    const available = h1.clientWidth;
    if (!width || !available) { h1.style.removeProperty('--slogan-size'); return; }
    const cap = Math.min(128, window.innerHeight * 0.134);
    const size = Math.max(40, Math.min(cap, (probe * available) / width - 0.5));
    h1.style.setProperty('--slogan-size', `${size.toFixed(2)}px`);
  }

  /* ───────────────────────── Section: destination labels everywhere ───────────────────────── */
  function renderDestText({ animate = false } = {}) {
    const c = countryOf(state.dest);
    const where = inCountry(state.dest);
    const swap = (el, text) => {
      if (!el || el.textContent === text) return;
      if (animate && !el.closest('.sr-only') && inViewport(el)) scramble(el, text, { duration: 0.5, chars: getComputedStyle(el).textTransform === 'uppercase' ? UPPER_CHARS : LOWER_CHARS });
      else el.textContent = text;
    };
    $$('[data-dest-in]').forEach((el) => swap(el, where));
    $$('[data-dest-name]').forEach((el) => swap(el, c.name));
    swap($('[data-hero-dest]'), c.name);
    $$('[data-dest-trigger]').forEach((btn) => {
      btn.setAttribute('aria-label', btn.classList.contains('dest-code')
        ? `Destination : ${c.name}. Changer de pays`
        : `Livraison : ${c.name}. Changer le pays de livraison`);
    });
  }
  function renderDestCodes({ animate = false } = {}) {
    const code = countryOf(state.dest).iso3;
    const hero = $('[data-flaps="dest-hero"]');
    const hdr = $('[data-flaps="dest-hdr"]');
    if (animate) {
      Flaps.flip(hero, code, { step: 0.09, min: 4, max: 6, stagger: 0.09, jitter: 0.08 });
      Flaps.flip(hdr, code, { step: 0.07, min: 3, max: 5, delay: 0.05 });
    } else {
      Flaps.set(hero, code);
      Flaps.set(hdr, code);
    }
  }

  /* ───────────────────────── Section: hero clock (real local time, one update per minute) ───────────────────────── */
  const clockFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function clockParts() {
    const parts = clockFormat.formatToParts(new Date());
    const get = (type) => (parts.find((p) => p.type === type) || {}).value || '00';
    return { h: get('hour'), m: get('minute') };
  }
  function renderClock(mode = 'set') {
    const { h, m } = clockParts();
    const hEl = $('[data-flaps="clock-h"]');
    const mEl = $('[data-flaps="clock-m"]');
    if (mode === 'set') { Flaps.set(hEl, h); Flaps.set(mEl, m); }
    else {
      const opts = { onlyChanged: mode === 'tick', step: 0.07, min: 2, max: 4 };
      Flaps.flip(hEl, h, opts);
      Flaps.flip(mEl, m, { ...opts, delay: 0.06 });
    }
    $('[data-clock-sr]').textContent = `heure locale ${h} h ${m}`;
  }
  function startClock() {
    Flaps.mount($('[data-flaps="clock-h"]'), '', { len: 2, set: 'digit' });
    Flaps.mount($('[data-flaps="clock-m"]'), '', { len: 2, set: 'digit' });
    renderClock('set');
    const now = new Date();
    const wait = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 40;
    setTimeout(() => {
      renderClock('tick');
      setInterval(() => renderClock('tick'), 60000);
    }, wait);
  }

  /* ───────────────────────── Section: hero shortcuts ───────────────────────── */
  const SHORTCUTS = [
    { label: 'Parfums', q: 'Parfum' },
    { label: 'Casques', q: 'Casque' },
    { label: 'Montres', q: 'Montre' },
    { label: 'Baskets', q: 'Baskets' },
    { rayon: 'kitchen' },
  ];
  function renderShortcuts() {
    $('[data-shortcuts]').innerHTML = SHORTCUTS.map((s) => {
      const dept = s.rayon ? D.department(s.rayon) : null;
      if (s.rayon && !dept) return '';
      const label = dept ? dept.short : s.label;
      const url = dept ? link.catalog({ category: dept.id }) : link.catalog({ q: s.q });
      return `<li><a class="shortcut" href="${url}">${esc(label)}${icon('arrow-right')}</a></li>`;
    }).join('');
  }

  /* ───────────────────────── Section: vitrine (three screens) ───────────────────────── */
  function screenHTML(o, i) {
    const v = o.vendor;
    const dept = D.department(o.rayon);
    return `<article class="screen__inner" aria-labelledby="screen-name-${i}">
      <div class="screen__band">
        <p class="route">${routeHTML(o)}<span class="route__label" aria-hidden="true">${esc(sellerIn(o.from.code))}</span></p>
        <span class="screen__rayon" aria-hidden="true">${esc(dept ? dept.short : o.rayonName)}</span>
      </div>
      <div class="screen__body">
        <a class="screen__photo" href="${link.product(o.id)}" tabindex="-1"><img src="${esc(o.image)}" alt="${esc(o.imageAlt)}" decoding="async"${i === 0 ? ' fetchpriority="high"' : ''}></a>
        <div class="screen__info">
          <h3 class="screen__name" id="screen-name-${i}"><a href="${link.product(o.id)}">${fx(o.name)}</a></h3>
          <p class="screen__vendor">${fx(v.name)}</p>
          <p class="screen__verif">${esc(verifLabel(v))}</p>
          <p class="screen__price">${fx(D.price(o.price), 'fx--num')}</p>
          <p class="screen__ship">${shipFx(o)}</p>
          <div class="screen__actions">${addButton(o)}${heartButton(o)}</div>
        </div>
      </div>
    </article>`;
  }
  function renderShowcase({ animate = false } = {}) {
    const list = D.showcaseFor(state.dest);
    const ul = $('[data-screens]');
    const total = offersHere().length;
    $('[data-screens-title]').textContent = `Vitrine · ${list.length} ${plural(list.length, 'offre', 'offres')} de vendeurs du monde entier, ${plural(list.length, 'livrable', 'livrables')} ${inCountry(state.dest)}`;
    $('[data-screens-all]').innerHTML = `Tableau des arrivées · ${total} ${plural(total, 'offre', 'offres')} ${icon('arrow-down-right')}`;
    const reuse = animate && canAnimate() && ul.children.length === list.length;
    if (!reuse) {
      ul.innerHTML = list.map((o, i) => `<li class="screen" data-id="${esc(o.id)}">${screenHTML(o, i)}</li>`).join('');
      mountFlaps(ul);
      return;
    }
    list.forEach((o, i) => {
      const li = ul.children[i];
      const changed = li.dataset.id !== o.id;
      const oldImage = $('.screen__photo img', li)?.getAttribute('src');
      li.dataset.id = o.id;
      const at = i * 0.12;
      morph(li, screenHTML(o, i), { delay: at });
      if (changed && oldImage !== o.image) {
        G.fromTo($('.screen__photo img', li), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, delay: at + 0.1, ease: 'power3.inOut' });
      }
    });
  }

  /* ───────────────────────── Section: repères ───────────────────────── */
  function reperesData() {
    const offers = offersHere();
    const vendors = D.vendors.filter((v) => v.deliveryTo.includes(state.dest));
    return [
      {
        num: offers.length,
        unit: plural(offers.length, 'offre', 'offres'),
        title: `Livrable ${inCountry(state.dest)}`,
        text: 'Le catalogue national réunit les offres du monde entier livrables dans votre pays.',
      },
      {
        num: vendors.length,
        unit: plural(vendors.length, 'vendeur', 'vendeurs'),
        title: 'Vendeurs vérifiés',
        text: 'Vérification avant activation : KYC pour les particuliers, KYB pour les entreprises. Procédure simulée dans la maquette.',
      },
      {
        num: 1,
        unit: 'paiement',
        title: 'Un panier, un paiement',
        text: 'Des offres de plusieurs vendeurs dans un seul panier, réglé une fois ; les expéditions sont organisées par vendeur. Paiement simulé.',
      },
    ];
  }
  const repereHTML = (r) => `<li class="repere">
      <div class="repere__inner">
        <div class="repere__num">
          <span class="flaps flaps--lg flaps--ink flaps--signal" data-flap-text="${pad2(r.num)}" data-set="digit" aria-hidden="true"></span>
          <span class="repere__unit"><span class="sr-only">${r.num} </span><span data-repere-unit>${esc(r.unit)}</span></span>
        </div>
        <h3 class="repere__title" data-repere-title>${esc(r.title)}</h3>
        <p class="repere__text">${esc(r.text)}</p>
      </div>
    </li>`;
  function renderReperes({ animate = false } = {}) {
    const items = reperesData();
    const ol = $('[data-reperes]');
    if (!animate || ol.children.length !== items.length) {
      ol.innerHTML = items.map(repereHTML).join('');
      mountFlaps(ol);
      return;
    }
    items.forEach((r, i) => {
      const li = ol.children[i];
      const flapsEl = $('[data-flap-text]', li);
      flapsEl.dataset.flapText = pad2(r.num);
      Flaps.flip(flapsEl, pad2(r.num), { delay: 0.1 + i * 0.1, onlyChanged: false });
      $('.repere__unit .sr-only', li).textContent = `${r.num} `;
      $('[data-repere-unit]', li).textContent = r.unit;
      const title = $('[data-repere-title]', li);
      if (title.textContent !== r.title) {
        if (inViewport(title)) scramble(title, r.title, { duration: 0.5, chars: UPPER_CHARS }); else title.textContent = r.title;
      }
    });
  }

  /* ───────────────────────── Section: tableau des arrivées ───────────────────────── */
  const BOARD_PAGE = 12;
  const FILTERS = [
    { id: 'all', label: 'Tout', test: () => true },
    { id: 'deals', label: D.collections.deals.name, test: (o) => o.collections.includes('deals') },
    { id: 'rare', label: D.collections.rare.name, test: (o) => o.collections.includes('rare') },
    { id: 'quote', label: 'Sur devis', test: (o) => o.mode === 'quote' },
  ];
  const minDays = (o) => {
    const m = /(\d+)/.exec(o.delivery || '');
    return o.mode === 'quote' || !m ? Infinity : Number(m[1]);
  };
  const sortForBoard = (list) => list.slice().sort((a, b) => {
    const da = minDays(a);
    const db = minDays(b);
    if (da !== db) return da - db;
    return a.price - b.price;
  });
  const boardOffers = () => {
    const f = FILTERS.find((x) => x.id === state.filter) || FILTERS[0];
    return sortForBoard(offersHere()).filter(f.test);
  };
  const splitDelay = (o) => {
    if (o.mode === 'quote') return ['À préciser dans le devis', 'sur devis'];
    const [main, tag] = String(o.delivery || '').split(' · ');
    return [main || '', tag || ''];
  };
  function rowHTML(o) {
    const v = o.vendor;
    const quote = o.mode === 'quote';
    const [delay, delayTag] = splitDelay(o);
    const label = `${o.name}, ${v.name}`;
    return `<tr class="arow" data-id="${esc(o.id)}">
      <td class="c-visual"><a class="thumb" href="${link.product(o.id)}" tabindex="-1"><img src="${esc(o.image)}" alt="${esc(o.imageAlt)}" loading="lazy" decoding="async"></a></td>
      <td class="c-from"><span class="sr-only">${esc(o.from.name)}</span>${sellerFlapHTML(o)}</td>
      <th scope="row" class="c-offer"><a class="arow__name" href="${link.product(o.id)}">${fx(o.name)}</a><span class="arow__rayon">${esc(o.rayonName)}</span></th>
      <td class="c-vendor"><span class="arow__vendor">${esc(v.name)}</span><span class="badge">${icon(v.verification === 'kyc' ? 'id-card' : 'storefront')}<span aria-hidden="true">${v.verification === 'kyc' ? 'KYC' : 'KYB'} · démo</span><span class="sr-only">vérifié ${v.verification === 'kyc' ? 'KYC' : 'KYB'}, procédure simulée</span></span></td>
      <td class="c-delay"><span class="arow__delay">${esc(delay)}</span>${delayTag ? `<span class="arow__tag">${esc(delayTag)}</span>` : ''}</td>
      <td class="c-price">${fx(D.price(o.price), 'fx--num')}</td>
      <td class="c-ship">${quote ? fx('Sur devis') : `<span class="sr-only">+ ${esc(D.price(o.shipping))} de livraison</span><span aria-hidden="true">+ <span class="fx fx--num">${esc(D.price(o.shipping))}</span></span>`}</td>
      <td class="c-status"><span class="status status--${quote ? 'quote' : 'ok'}">${fx(quote ? 'Sur devis' : 'Livrable')}</span></td>
      <td class="c-action">${quote
        ? `<a class="btn btn--row btn--row-quote" href="${link.product(o.id)}" aria-label="Demander un devis : ${esc(label)}">${icon('clipboard')}Devis</a>`
        : `<button class="btn btn--row btn--row-add add" type="button" data-add="${esc(o.id)}" aria-label="Ajouter au panier : ${esc(label)}"><span class="add__label">${icon('cart')}Ajouter</span><span class="add__done" aria-hidden="true">${icon('check')}Ajouté</span></button>`}</td>
    </tr>`;
  }
  function rowElement(o) {
    const holder = document.createElement('tbody');
    holder.innerHTML = rowHTML(o);
    return holder.firstElementChild;
  }
  const emptyRowHTML = () => {
    const f = FILTERS.find((x) => x.id === state.filter) || FILTERS[0];
    return `<tr class="board__empty-row"><td colspan="9" class="board__empty">Aucune ${f.id === 'all' ? 'offre' : `offre « ${esc(f.label)} »`} de démonstration livrable ${esc(inCountry(state.dest))} pour l’instant.</td></tr>`;
  };
  function renderFilters() {
    const here = offersHere();
    $('[data-filters]').innerHTML = FILTERS.map((f) => {
      const n = here.filter(f.test).length;
      return `<button class="segmented__btn" type="button" aria-pressed="${state.filter === f.id}" data-filter="${f.id}">${esc(f.label)}<span class="segmented__count" aria-hidden="true">${n}</span><span class="sr-only"> (${n})</span></button>`;
    }).join('');
  }
  function updateBoardMeta(list, { animate = false } = {}) {
    const n = list.length;
    const countEl = $('[data-flaps="board-count"]');
    if (animate) Flaps.flip(countEl, pad2(n), { step: 0.08, stagger: 0.08 }); else Flaps.set(countEl, pad2(n));
    const [one, many] = NOUNS[state.filter] || NOUNS.all;
    $('[data-board-count-label]').textContent = plural(n, one, many);
    $('[data-board-caption]').textContent = `Tableau des arrivées : ${countPhrase(n, state.filter, state.dest)}, une ligne par offre de vendeur, triées par délai indicatif.`;
    const more = $('[data-board-more]');
    more.hidden = n <= BOARD_PAGE;
    more.setAttribute('aria-expanded', String(state.expanded));
    more.innerHTML = state.expanded
      ? `Réduire le tableau ${icon('caret-down')}`
      : `Afficher les ${n} ${esc(plural(n, one, many))} ${icon('caret-down')}`;
    more.classList.toggle('is-open', state.expanded);
  }
  function refreshRow(tr, o, animate) {
    const cell = $('.c-ship', tr);
    if (o.mode === 'quote') return;
    const text = D.price(o.shipping);
    const visible = $('.fx', cell);
    const sr = $('.sr-only', cell);
    if (!visible || visible.textContent === text) return;
    sr.textContent = `+ ${text} de livraison`;
    if (animate && !tr.classList.contains('is-pending')) scramble(visible, text, { duration: 0.5, delay: 0.25 });
    else visible.textContent = text;
  }
  /* Signature n°2: a row updates like a board line (flaps, then scrambled values). */
  function revealRow(tr, delay = 0) {
    if (!canAnimate()) { tr.classList.remove('is-pending'); mountFlaps(tr); return null; }
    const tl = G.timeline({ delay });
    const img = $('.thumb img', tr);
    const quiet = $$('.arow__rayon, .arow__vendor, .badge, .arow__delay, .arow__tag, .status, .c-action > *', tr);
    if (img) tl.fromTo(img, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.32, ease: 'power2.out', immediateRender: false }, 0);
    tl.fromTo(quiet, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.025, immediateRender: false }, 0.08);
    tl.call(() => tr.classList.remove('is-pending'), null, 0);
    $$('[data-flap-text]', tr).forEach((el) => tl.add(Flaps.flip(el, el.dataset.flapText, { min: 3, max: 5, step: 0.07, stagger: 0.05 }), 0));
    $$('.fx', tr).forEach((el, i) => tl.add(scramble(el, el.textContent, { duration: 0.5 }), 0.02 + i * 0.03));
    return tl;
  }
  function renderBoard({ animate = false } = {}) {
    const list = boardOffers();
    const shown = state.expanded ? list : list.slice(0, BOARD_PAGE);
    const tbody = $('[data-board-body]');
    updateBoardMeta(list, { animate });
    if (!animate || !canAnimate() || !FLIP) {
      tbody.innerHTML = shown.length ? shown.map(rowHTML).join('') : emptyRowHTML();
      mountFlaps(tbody);
      return;
    }
    const rows = new Map($$('tr[data-id]', tbody).map((tr) => [tr.dataset.id, tr]));
    const nextIds = new Set(shown.map((o) => o.id));
    const leaving = [...rows.values()].filter((tr) => !nextIds.has(tr.dataset.id));
    const staying = shown.filter((o) => rows.has(o.id)).map((o) => rows.get(o.id));
    const tl = G.timeline();
    if (leaving.length) tl.to(leaving, { autoAlpha: 0, duration: 0.16, ease: 'power1.in' });
    tl.add(() => {
      const before = FLIP.getState(staying);
      leaving.forEach((tr) => tr.remove());
      $$('.board__empty-row', tbody).forEach((tr) => tr.remove());
      const entering = [];
      shown.forEach((o) => {
        let tr = rows.get(o.id);
        if (tr) refreshRow(tr, o, true);
        else {
          tr = rowElement(o);
          tr.classList.add('is-pending');
          mountFlaps(tr, { blank: true });
          entering.push(tr);
        }
        tbody.appendChild(tr);
      });
      if (!shown.length) tbody.innerHTML = emptyRowHTML();
      if (staying.length) FLIP.from(before, { duration: 0.5, ease: 'power2.inOut' });
      entering.forEach((tr, i) => revealRow(tr, 0.14 + i * 0.045));
    });
  }
  function setFilter(id) {
    if (id === state.filter || !FILTERS.some((f) => f.id === id)) return;
    state.filter = id;
    $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === id)));
    renderBoard({ animate: true });
    announce(`${countPhrase(boardOffers().length, id, state.dest)}.`);
  }
  function toggleBoardExpanded() {
    state.expanded = !state.expanded;
    renderBoard({ animate: true });
    if (!state.expanded) {
      const head = $('#arrivees');
      if (head.getBoundingClientRect().top < 0) head.scrollIntoView({ behavior: canAnimate() ? 'smooth' : 'auto', block: 'start' });
    }
    announce(state.expanded ? 'Tableau complet affiché.' : `Tableau réduit aux ${BOARD_PAGE} premières lignes.`);
  }

  /* ───────────────────────── Section: Bons plans | Introuvables ───────────────────────── */
  function pickFrom(pool, exclude, n) {
    const fresh = pool.filter((o) => !exclude.has(o.id));
    const reused = pool.filter((o) => exclude.has(o.id));
    const out = [];
    const take = (list, keep) => {
      list.forEach((o) => { if (out.length < n && !out.includes(o) && keep(o)) out.push(o); });
    };
    [fresh, reused].forEach((list) => {
      take(list, (o) => !out.some((p) => p.name === o.name || p.from.code === o.from.code));
      take(list, (o) => !out.some((p) => p.name === o.name));
      take(list, () => true);
    });
    return out;
  }
  function collectionPicks() {
    const here = offersHere();
    const exclude = new Set(D.showcaseFor(state.dest).map((o) => o.id));
    const pool = (kind) => here.filter((o) => o.mode === 'purchase' && o.stock > 0 && o.collections.includes(kind));
    const deals = pool('deals');
    const rare = pool('rare');
    const n = Math.min(4, deals.length, rare.length);
    return {
      deals: pickFrom(deals, exclude, n),
      rare: pickFrom(rare, exclude, n),
      totals: {
        deals: here.filter((o) => o.collections.includes('deals')).length,
        rare: here.filter((o) => o.collections.includes('rare')).length,
      },
    };
  }
  const cardHTML = (o, slot) => `<li class="card" data-id="${esc(o.id)}" data-slot="${slot}">
      <a class="card__photo" href="${link.product(o.id)}" tabindex="-1"><img src="${esc(o.image)}" alt="${esc(o.imageAlt)}" loading="lazy" decoding="async"></a>
      <div class="card__body">
        <p class="card__route"><span class="sr-only">${esc(sellerIn(o.from.code))}</span>${sellerFlapHTML(o, { ink: true })}<span class="card__route-label" aria-hidden="true">${esc(sellerIn(o.from.code))}</span></p>
        <h3 class="card__name"><a href="${link.product(o.id)}">${esc(o.name)}</a></h3>
        <p class="card__vendor">${esc(o.vendor.name)}</p>
        <p class="card__verif">${esc(verifLabel(o.vendor))}</p>
        <p class="card__price">${esc(D.price(o.price))}</p>
        <p class="card__ship">${esc(shippingLine(o))}</p>
        <div class="card__actions">${addButton(o, 'btn--black')}${heartButton(o, 'heart--light')}</div>
      </div>
    </li>`;
  function pickHTML(kind, offers, total) {
    const c = D.collections[kind];
    const id = kind === 'deals' ? 'bons-plans' : 'introuvables';
    return `<section class="pick on-signal pick--${kind}" id="${id}" aria-labelledby="${id}-title">
      <div class="pick__head"><span class="pick__picto" aria-hidden="true">${icon(kind === 'deals' ? 'tag' : 'binoculars')}</span><h2 class="pick__title" id="${id}-title">${esc(c.name)}</h2></div>
      <p class="pick__text">${esc(c.text)}</p>
      <ul class="pick__grid" role="list">${offers.map(cardHTML).join('')}</ul>
      <a class="pick__more" href="${link.catalog({ collection: kind })}">${esc(MORE_LINK[kind](total, inCountry(state.dest)))}${icon('arrow-right')}</a>
    </section>`;
  }
  function renderDuo({ animate = false } = {}) {
    const host = $('[data-duo]');
    const { deals, rare, totals } = collectionPicks();
    const html = `${pickHTML('deals', deals, totals.deals)}<div class="duo__rule" aria-hidden="true"></div>${pickHTML('rare', rare, totals.rare)}`;
    if (!animate || !canAnimate() || !host.children.length || !inViewport(host)) {
      host.innerHTML = html;
      mountFlaps(host);
      return;
    }
    const old = $$('.card', host);
    G.timeline()
      .to(old, { rotationX: 90, transformOrigin: '50% 0%', transformPerspective: 800, duration: 0.16, ease: 'power1.in', stagger: (i, el) => Number(el.dataset.slot) * 0.03 })
      .add(() => {
        host.innerHTML = html;
        mountFlaps(host);
        G.fromTo($$('.card', host), { rotationX: -90, transformOrigin: '50% 0%', transformPerspective: 800 }, {
          rotationX: 0, duration: 0.5, ease: 'power3.out', delay: (i, el) => Number(el.dataset.slot) * 0.08, clearProps: 'transform',
        });
      });
  }

  /* ───────────────────────── Section: 15 portes (tous les rayons) ───────────────────────── */
  const totalCategories = () => D.departments.reduce((sum, d) => sum + (d.categoryCount || 0), 0);
  function renderGates() {
    $('[data-gates-meta]').innerHTML = `<strong>${D.departments.length} rayons · ${totalCategories()} catégories</strong>, des parfums aux maisons préfabriquées, accessoires compris.`;
    $('[data-gates]').innerHTML = D.departments.map((d, i) => {
      const num = pad2(i + 1);
      const subs = d.subcategories.slice(0, 3);
      return `<li class="gate${i < 3 ? ' gate--big' : ''}">
        <a class="gate__link" href="${link.catalog({ category: d.id })}">
          <span class="gate__media">
            <img src="${esc(d.image)}" alt="${esc(d.imageAlt)}" loading="lazy" decoding="async">
            <span class="gate__plate">
              <span class="gate__num" aria-hidden="true"><span class="flaps flaps--gate flaps--ink flaps--signal" data-flap-text="${num}" data-set="digit"></span></span>
              <span class="gate__name">${esc(d.name)}</span>
              <span class="gate__arrow" aria-hidden="true">${icon('arrow-right')}</span>
            </span>
          </span>
          <span class="gate__caption"><span class="gate__subs">${subs.map(esc).join(' · ')}</span><span class="gate__count">${d.categoryCount} catégories</span></span>
        </a>
      </li>`;
    }).join('');
    mountFlaps($('[data-gates]'));
  }

  /* ───────────────────────── Section: gros biens sur devis ───────────────────────── */
  function quoteHTML(o) {
    const v = o.vendor;
    return `<article class="qcard on-light" data-id="${esc(o.id)}" aria-labelledby="q-${esc(o.id)}">
      <a class="qcard__photo" href="${link.product(o.id)}" tabindex="-1"><img src="${esc(o.image)}" alt="${esc(o.imageAlt)}" loading="lazy" decoding="async"></a>
      <div class="qcard__sheet">
        <p class="route">${routeHTML(o, { ink: true })}<span class="route__label route__label--light" aria-hidden="true">${esc(sellerIn(o.from.code))}</span></p>
        <h3 class="qcard__name" id="q-${esc(o.id)}"><a href="${link.product(o.id)}">${esc(o.name)}</a></h3>
        <p class="qcard__vendor">${esc(v.name)} · ${esc(verifLabel(v))}</p>
        <dl class="manifest">
          <div class="manifest__row"><dt>Prix indicatif</dt><dd class="manifest__price">${fx(D.price(o.price), 'fx--num')}</dd></div>
          <div class="manifest__row"><dt>Modalité</dt><dd>${fx('Demande de devis ou de réservation')}</dd></div>
          <div class="manifest__row"><dt>Acompte</dt><dd>${fx('Aucun (démonstration)')}</dd></div>
          <div class="manifest__row"><dt>Transport et délai</dt><dd>${fx('À préciser dans le devis')}</dd></div>
        </dl>
        <a class="btn btn--outline qcard__cta" href="${link.product(o.id)}">Demander un devis<span class="sr-only"> : ${esc(o.name)}, ${esc(v.name)}</span>${icon('arrow-right')}</a>
      </div>
    </article>`;
  }
  let quoteTriggers = [];
  /* At most two large cards, one per rayon when possible (car, prefab house); the link lists them all. */
  function quotePicks() {
    const all = offersHere().filter((o) => o.mode === 'quote');
    const picks = [];
    all.forEach((o) => { if (picks.length < 2 && !picks.some((p) => p.rayon === o.rayon)) picks.push(o); });
    all.forEach((o) => { if (picks.length < 2 && !picks.includes(o)) picks.push(o); });
    return { all, picks };
  }
  function renderQuotes({ animate = false } = {}) {
    const { all, picks: list } = quotePicks();
    const host = $('[data-quotes]');
    const section = host.closest('section');
    section.hidden = all.length === 0;
    const more = $('[data-quotes-all]');
    more.innerHTML = `${all.length === 1 ? `Voir l’offre sur devis livrable ${esc(inCountry(state.dest))}` : `Voir les ${all.length} offres sur devis livrables ${esc(inCountry(state.dest))}`} ${icon('arrow-right')}`;
    const sameShape = host.children.length === list.length;
    if (animate && canAnimate() && sameShape && inViewport(host)) {
      list.forEach((o, i) => {
        const card = host.children[i];
        const changed = card.dataset.id !== o.id;
        const oldImage = $('.qcard__photo img', card)?.getAttribute('src');
        const holder = document.createElement('div');
        holder.innerHTML = quoteHTML(o);
        const fresh = holder.firstElementChild;
        card.dataset.id = o.id;
        card.setAttribute('aria-labelledby', fresh.getAttribute('aria-labelledby'));
        morph(card, fresh.innerHTML, { delay: i * 0.1 });
        if (changed && oldImage !== o.image) G.fromTo($('.qcard__photo img', card), { clipPath: i % 2 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut' });
      });
      return;
    }
    quoteTriggers.forEach((t) => t.kill());
    quoteTriggers = [];
    host.innerHTML = list.map(quoteHTML).join('');
    mountFlaps(host);
    if (canAnimate() && ST && motion.scrollReady) revealQuotes();
  }

  /* ───────────────────────── Section: comment ça marche ───────────────────────── */
  const STEPS = [
    { title: 'Choisissez votre pays de livraison', text: 'Le catalogue s’adapte : seules les offres livrables dans votre pays s’affichent, quel que soit le pays du vendeur.' },
    { title: 'Comparez les offres, une fiche par vendeur', text: 'Même produit, vendeurs différents : chaque offre a sa fiche, son prix et sa livraison affichée à part.' },
    { title: 'Un panier, un paiement (simulé)', text: 'Réunissez des offres de plusieurs vendeurs dans un seul panier, réglé en une seule fois.' },
    { title: 'Chaque vendeur expédie sa commande', text: 'Chaque vendeur gère son stock et expédie ses commandes : une expédition par vendeur.' },
  ];
  const how = { stops: [] };
  function renderHow() {
    $('[data-how-steps]').innerHTML = STEPS.map((s, i) => `<li class="how__step">
        <span class="how__num" aria-hidden="true"><span class="flaps flaps--lg flaps--signal" data-flap-text="${i + 1}" data-set="digit"></span></span>
        <h3 class="how__step-title"><span class="sr-only">Étape ${i + 1} : </span>${esc(s.title)}</h3>
        <p class="how__step-text">${esc(s.text)}</p>
      </li>`).join('');
    mountFlaps($('[data-how-steps]'));
  }
  /* The arrow runs from the first number tile to the last, its head pointing into step 4. */
  function layoutHowArrow() {
    const track = $('[data-how-track]');
    const svg = $('[data-how-arrow]');
    const nums = $$('.how__num', track);
    if (!track || nums.length < 2 || getComputedStyle(svg).display === 'none') return;
    const box = track.getBoundingClientRect();
    const first = nums[0].getBoundingClientRect();
    const last = nums[nums.length - 1].getBoundingClientRect();
    const y = Math.round(first.top + first.height / 2 - box.top);
    const x0 = Math.round(first.right - box.left);
    const tip = Math.round(last.left - box.left - 22);
    svg.setAttribute('viewBox', `0 0 ${Math.round(box.width)} ${Math.round(box.height)}`);
    $('[data-how-line]').setAttribute('d', `M${x0} ${y} H${tip - 4}`);
    $('[data-how-head]').setAttribute('d', `M${tip - 24} ${y - 22} L${tip} ${y} L${tip - 24} ${y + 22}`);
    const span = Math.max(1, tip - x0);
    how.stops = nums.map((n, i) => {
      if (i === 0) return 0;
      if (i === nums.length - 1) return 1;
      const left = n.getBoundingClientRect().left - box.left;
      return Math.min(1, Math.max(0, (left - x0) / span));
    });
  }

  /* ───────────────────────── Section: footer and sources ───────────────────────── */
  const LICENSES = { 'Public domain': 'Domaine public', 'Generated for this prototype': 'Générée pour cette maquette' };
  const KINDS = { 'real-photograph': 'Photographie réelle', 'generated-illustration': 'Illustration générée' };
  function renderFooter() {
    const buy = [
      { label: D.nav[0], href: link.categories },
      { label: D.nav[1], href: link.catalog({ collection: 'deals' }) },
      { label: D.nav[2], href: link.catalog({ collection: 'rare' }) },
      { label: D.nav[3], href: link.orders },
      { label: 'Favoris', href: link.wishlist },
      { label: 'Panier', href: link.cart },
    ];
    $('[data-footer-buy]').innerHTML = buy.filter((b) => b.label).map((b) => `<li><a href="${b.href}">${esc(b.label)}</a></li>`).join('');
    $('[data-sources-count]').textContent = `${D.credits.length} ${plural(D.credits.length, 'visuel', 'visuels')}`;
    $('[data-sources-list]').innerHTML = D.credits.map((c) => {
      const license = LICENSES[c.license] || c.license;
      const kind = KINDS[c.kind] || '';
      return `<li class="source">
        <span class="source__label">${esc(c.label)}</span>
        <span class="source__meta">${esc([kind, c.author, license].filter(Boolean).join(' · '))}</span>
        ${c.source ? `<a class="source__link" href="${esc(c.source)}" target="_blank" rel="noopener">Source<span class="sr-only"> : ${esc(c.label)} (nouvel onglet)</span>${icon('arrow-up-right')}</a>` : ''}
      </li>`;
    }).join('');
  }

  /* ───────────────────────── Interaction: cart, favourites ───────────────────────── */
  const cartCount = () => state.cart.reduce((n, line) => n + line.qty, 0);
  function updateCart({ animate = false } = {}) {
    const n = cartCount();
    const el = $('[data-flaps="cart"]');
    const text = String(Math.min(99, n));
    if (animate) Flaps.flip(el, text, { min: 2, max: 4, step: 0.07, onlyChanged: true, stagger: 0.05 });
    else Flaps.set(el, text);
    $('[data-cart-link]').setAttribute('aria-label', `Panier, ${n} ${plural(n, 'article', 'articles')}`);
  }
  function addToCart(id, button) {
    const o = findOffer(id);
    if (!o || o.mode !== 'purchase') return;
    const line = state.cart.find((l) => l.id === id);
    if (line) line.qty = Math.min(99, line.qty + 1);
    else state.cart.push({ id, qty: 1 });
    save();
    updateCart({ animate: true });
    if (button) {
      button.classList.add('is-added');
      clearTimeout(button._addedTimer);
      button._addedTimer = setTimeout(() => button.classList.remove('is-added'), 1600);
    }
    toast('Ajouté', o.name, o.vendor.name);
    const n = cartCount();
    announce(`Ajouté au panier : ${o.name}, ${o.vendor.name}. Panier : ${n} ${plural(n, 'article', 'articles')}.`);
  }
  function updateFavs({ animate = false } = {}) {
    const n = state.favs.size;
    const pill = $('[data-fav-count]');
    pill.textContent = String(n);
    pill.classList.toggle('is-zero', n === 0);
    $('[data-fav-link]').setAttribute('aria-label', `Favoris, ${n} ${plural(n, 'offre', 'offres')}`);
    if (animate && canAnimate()) G.fromTo(pill, { rotationX: -90, transformPerspective: 160 }, { rotationX: 0, duration: 0.32, ease: 'back.out(2.4)' });
  }
  function toggleFav(id) {
    const o = findOffer(id);
    if (!o) return;
    const on = !state.favs.has(id);
    if (on) state.favs.add(id); else state.favs.delete(id);
    save();
    $$('[data-fav]').filter((b) => b.dataset.fav === id).forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = icon(on ? 'heart-fill' : 'heart');
    });
    updateFavs({ animate: true });
    announce(on ? `Ajouté aux favoris : ${o.name}, ${o.vendor.name}.` : `Retiré des favoris : ${o.name}, ${o.vendor.name}.`);
  }

  /* ───────────────────────── Interaction: destination menus (header and hero) ───────────────────────── */
  const menus = [];
  function createDestMenu(rootEl) {
    const trigger = $('[data-dest-trigger]', rootEl);
    const menu = $('[data-dest-menu]', rootEl);
    const items = () => $$('[role="menuitemradio"]', menu);
    function render() {
      menu.innerHTML = `<p class="dest-menu__head" aria-hidden="true">Pays de livraison · marchés exemples</p>${D.countries.map((c) => {
        const n = D.offersFor(c.code).length;
        return `<button class="dest-item" type="button" role="menuitemradio" aria-checked="${c.code === state.dest}" tabindex="-1" data-code="${esc(c.code)}"><span class="flaps flaps--sm" data-flap-text="${esc(c.iso3)}" data-set="alpha" aria-hidden="true"></span><span class="dest-item__name">${esc(c.name)}</span><span class="dest-item__count">${n} ${plural(n, 'offre', 'offres')}</span></button>`;
      }).join('')}`;
      mountFlaps(menu);
    }
    function open({ focus = 'checked' } = {}) {
      closeAllMenus(api);
      render();
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const list = items();
      const target = focus === 'last' ? list[list.length - 1] : (list.find((b) => b.getAttribute('aria-checked') === 'true') || list[0]);
      if (target) target.focus();
      if (canAnimate()) {
        G.fromTo(list, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, stagger: 0.035, ease: 'power2.out' });
        $$('[data-flap-text]', menu).forEach((el, i) => {
          Flaps.set(el, '');
          Flaps.flip(el, el.dataset.flapText, { delay: 0.03 + i * 0.035, min: 2, max: 3, step: 0.06, stagger: 0.03, jitter: 0.03 });
        });
      }
    }
    function close({ returnFocus = false } = {}) {
      if (menu.hidden) return;
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }
    const api = { open, close, isOpen: () => !menu.hidden, contains: (node) => rootEl.contains(node) };
    trigger.addEventListener('click', () => (api.isOpen() ? close() : open()));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); open({ focus: 'last' }); }
    });
    menu.addEventListener('keydown', (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      const move = (j) => { e.preventDefault(); list[(j + list.length) % list.length].focus(); };
      if (e.key === 'ArrowDown') move(i + 1);
      else if (e.key === 'ArrowUp') move(i - 1);
      else if (e.key === 'Home') move(0);
      else if (e.key === 'End') move(list.length - 1);
      else if (e.key === 'Escape') { e.preventDefault(); close({ returnFocus: true }); }
      else if (e.key === 'Tab') close();
    });
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[role="menuitemradio"]');
      if (!item) return;
      close({ returnFocus: true });
      setDestination(item.dataset.code);
    });
    menus.push(api);
    return api;
  }

  /* ───────────────────────── Interaction: Tous les rayons ───────────────────────── */
  const rayons = (() => {
    const trigger = $('[data-rayons-trigger]');
    const menu = $('[data-rayons-menu]');
    const list = $('[data-rayons-list]');
    const panel = $('[data-rayons-panel]');
    let returnTo = trigger;
    let active = null;
    const items = () => $$('.rm-item', list);
    function panelHTML(d, i) {
      const n = offersHere().filter((o) => o.rayon === d.id).length;
      const offersText = n
        ? `${n} ${plural(n, 'offre', 'offres')} de démonstration ${plural(n, 'livrable', 'livrables')} ${inCountry(state.dest)}`
        : `aucune offre de démonstration livrable ${inCountry(state.dest)} pour l’instant`;
      return `<div class="rm-panel">
        <div>
          <p class="rm-panel__gate">Porte ${pad2(i + 1)}</p>
          <p class="rm-panel__name">${esc(d.name)}</p>
          <p class="rm-panel__meta">${d.categoryCount} catégories · ${esc(offersText)}</p>
          <ul class="rm-panel__subs" role="list">${d.subcategories.map((s) => `<li><a href="${link.catalog({ category: d.id, q: s })}">${esc(s)}${icon('arrow-right')}</a></li>`).join('')}</ul>
          <a class="btn btn--signal rm-panel__cta" href="${link.catalog({ category: d.id })}">Voir tout le rayon<span class="sr-only"> ${esc(d.name)}</span>${icon('arrow-right')}</a>
        </div>
        <div class="rm-panel__thumb"><img src="${esc(d.thumb || d.image)}" alt="${esc(d.imageAlt)}" loading="lazy" decoding="async"></div>
      </div>`;
    }
    function setActive(id, { animate = false } = {}) {
      if (active === id && panel.firstElementChild) return;
      active = id;
      const i = D.departments.findIndex((d) => d.id === id);
      if (i < 0) return;
      items().forEach((it) => it.classList.toggle('is-active', it.dataset.rayon === id));
      panel.innerHTML = panelHTML(D.departments[i], i);
      if (animate && canAnimate()) G.fromTo(panel.firstElementChild, { autoAlpha: 0, x: 12 }, { autoAlpha: 1, x: 0, duration: 0.22, ease: 'power2.out' });
    }
    function focusItem(item) {
      items().forEach((it) => { it.tabIndex = it === item ? 0 : -1; });
      item.focus();
      setActive(item.dataset.rayon, { animate: true });
    }
    function render() {
      $('[data-rayons-meta]').textContent = `${D.departments.length} rayons · ${totalCategories()} catégories`;
      list.innerHTML = D.departments.map((d, i) => `<li><a class="rm-item" href="${link.catalog({ category: d.id })}" data-rayon="${esc(d.id)}" tabindex="${i === 0 ? 0 : -1}"><span class="flaps flaps--sm flaps--signal" data-flap-text="${pad2(i + 1)}" data-set="digit" aria-hidden="true"></span><span class="rm-item__name">${esc(d.name)}</span><span class="rm-item__arrow" aria-hidden="true">${icon('arrow-right')}</span></a></li>`).join('');
      mountFlaps(list);
      if (D.departments[0]) setActive(D.departments[0].id);
    }
    function open({ from = trigger, rayon = null } = {}) {
      closeAllMenus(api);
      returnTo = from;
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const target = items().find((it) => it.dataset.rayon === (rayon || active)) || items()[0];
      if (target) focusItem(target);
      if (canAnimate()) {
        const rows = items();
        G.fromTo(rows, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, stagger: 0.009, ease: 'power2.out' });
        $$('[data-flap-text]', list).forEach((el, i) => {
          Flaps.set(el, '00');
          Flaps.flip(el, el.dataset.flapText, { delay: i * 0.009, min: 2, max: 3, step: 0.05, stagger: 0.02, jitter: 0.02 });
        });
      }
    }
    function close({ returnFocus = false } = {}) {
      if (menu.hidden) return;
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus && returnTo) returnTo.focus();
    }
    const api = { open, close, render, refresh: () => { if (active) { const keep = active; active = null; setActive(keep); } }, isOpen: () => !menu.hidden, contains: (node) => menu.contains(node) || trigger.contains(node) };
    trigger.addEventListener('click', () => (api.isOpen() ? close() : open({ from: trigger })));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && !api.isOpen()) { e.preventDefault(); open({ from: trigger }); }
    });
    list.addEventListener('keydown', (e) => {
      const all = items();
      const i = all.indexOf(document.activeElement);
      if (i < 0) return;
      const go = (j) => { e.preventDefault(); focusItem(all[(j + all.length) % all.length]); };
      if (e.key === 'ArrowDown') go(i + 1);
      else if (e.key === 'ArrowUp') go(i - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(all.length - 1);
      else if (e.key === 'ArrowRight') {
        const firstLink = $('a', panel);
        if (firstLink) { e.preventDefault(); firstLink.focus(); }
      }
    });
    list.addEventListener('pointerover', (e) => {
      const item = e.target.closest('.rm-item');
      if (item) setActive(item.dataset.rayon, { animate: true });
    });
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        const current = items().find((it) => it.tabIndex === 0);
        if (current) { e.preventDefault(); current.focus(); }
      }
    });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close({ returnFocus: true }); }
    });
    $('[data-rayons-close]').addEventListener('click', () => close({ returnFocus: true }));
    menu.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !menu.contains(e.relatedTarget) && e.relatedTarget !== trigger) close();
    });
    menus.push(api);
    return api;
  })();

  function closeAllMenus(except = null) {
    menus.forEach((m) => { if (m !== except) m.close(); });
  }

  /* ───────────────────────── Interaction: destination change (signature n°1) ───────────────────────── */
  function setDestination(code) {
    if (code === state.dest || !D.country(code)) return;
    state.dest = code;
    save();
    const animate = canAnimate();
    renderDestCodes({ animate });
    renderDestText({ animate });
    renderClock(animate ? 'refresh' : 'set');
    renderShowcase({ animate });
    renderReperes({ animate });
    renderFilters();
    renderBoard({ animate });
    renderDuo({ animate });
    renderQuotes({ animate });
    rayons.refresh();
    if (ST && animate) setTimeout(() => ST.refresh(), 900);
    announce(`${countPhrase(offersHere().length, 'all', code)}.`);
  }

  /* ───────────────────────── Interaction: search, header, page-level delegation ───────────────────────── */
  function setupSearch() {
    const inputs = $$('[data-search-input]');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        state.draft = input.value;
        inputs.forEach((other) => { if (other !== input) other.value = input.value; });
      });
    });
    $$('[data-search-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = state.draft.trim();
        window.location.href = q ? link.catalog({ q }) : link.catalog();
      });
    });
  }

  function setupHeaderState() {
    const header = $('#site-header');
    const sentinel = document.createElement('div');
    sentinel.className = 'compact-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    $('.hero').prepend(sentinel);
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-compact', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe(sentinel);
    const field = $('.hero-search__field');
    const offset = Math.round(header.getBoundingClientRect().height);
    new IntersectionObserver(([entry]) => {
      root.classList.toggle('show-hdr-search', !entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight / 2);
    }, { rootMargin: `-${offset}px 0px 0px 0px` }).observe(field);
  }

  function scrollToTarget(target) {
    if (!target) return;
    target.scrollIntoView({ behavior: canAnimate() ? 'smooth' : 'auto', block: 'start' });
  }

  function setupDelegation() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { addToCart(add.dataset.add, add); return; }
      const fav = e.target.closest('[data-fav]');
      if (fav) { toggleFav(fav.dataset.fav); return; }
      const filter = e.target.closest('[data-filter]');
      if (filter) { setFilter(filter.dataset.filter); return; }
      if (e.target.closest('[data-board-more]')) { toggleBoardExpanded(); return; }
      const top = e.target.closest('[data-action="top"]');
      if (top) {
        e.preventDefault();
        closeAllMenus();
        window.scrollTo({ top: 0, behavior: canAnimate() ? 'smooth' : 'auto' });
        return;
      }
      if (e.target.closest('[data-open-sources]')) $('[data-sources]').open = true;
      if (e.target.closest('[data-open-rayons]')) {
        e.preventDefault();
        rayons.open({ from: e.target.closest('[data-open-rayons]') });
        return;
      }
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor && anchor.getAttribute('href').length > 1) {
        const target = document.getElementById(anchor.getAttribute('href').slice(1));
        if (target) {
          e.preventDefault();
          closeAllMenus();
          scrollToTarget(target);
          history.replaceState(null, '', anchor.getAttribute('href'));
          if (target.matches('[data-sources]')) $('summary', target).focus({ preventScroll: true });
        }
      }
    });
    document.addEventListener('pointerdown', (e) => {
      menus.forEach((m) => { if (m.isOpen() && !m.contains(e.target)) m.close(); });
    });
    $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.lang === 'fr') return;
      const message = 'Exploration disponible en français uniquement';
      toast('FR', message);
      announce(`${message}.`);
    }));
  }

  /* ───────────────────────── Motion (GSAP, only with prefers-reduced-motion: no-preference) ───────────────────────── */
  function introHero() {
    const sloganWords = $$('.slogan .sw');
    const screens = $$('.screen');
    const heroCode = $('[data-flaps="dest-hero"]');
    const hdrCode = $('[data-flaps="dest-hdr"]');
    const code = countryOf(state.dest).iso3;
    const { h, m } = clockParts();
    const screenFlaps = screens.map((s) => $$('[data-flap-text]', s));
    [heroCode, hdrCode].forEach((el) => Flaps.set(el, ''));
    Flaps.set($('[data-flaps="clock-h"]'), '');
    Flaps.set($('[data-flaps="clock-m"]'), '');
    screenFlaps.flat().forEach((el) => Flaps.set(el, ''));
    G.set(screens, { clipPath: 'inset(0% 0% 100% 0%)' });
    return () => {
      const tl = G.timeline();
      /* Each word keeps its slot while it resolves, like a board line; slots are released afterwards. */
      sloganWords.forEach((w) => { w.style.width = `${w.getBoundingClientRect().width}px`; });
      tl.call(() => root.classList.remove('intro'), null, 0);
      sloganWords.forEach((w, i) => tl.add(scramble(w, w.textContent, { duration: 0.6 + Math.random() * 0.2, chars: 'ABEFHIJKLNPRSTUVXYZ', reveal: 0.25 }), i * 0.06));
      tl.call(() => sloganWords.forEach((w) => w.style.removeProperty('width')), null, 1.25);
      tl.add(Flaps.flip(heroCode, code, { step: 0.09, min: 4, max: 6, stagger: 0.09 }), 0.25);
      tl.add(Flaps.flip(hdrCode, code, { step: 0.07, min: 3, max: 5 }), 0.4);
      tl.add(Flaps.flip($('[data-flaps="clock-h"]'), h, { step: 0.07, min: 3, max: 5 }), 0.3);
      tl.add(Flaps.flip($('[data-flaps="clock-m"]'), m, { step: 0.07, min: 3, max: 5 }), 0.38);
      tl.to(screens, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut', stagger: 0.12 }, 0.85);
      screens.forEach((s, i) => {
        const at = 1.05 + i * 0.12;
        screenFlaps[i].forEach((el, k) => tl.add(Flaps.flip(el, el.dataset.flapText, { step: 0.07 }), at + k * 0.1));
        const price = $('.screen__price .fx', s);
        if (price) tl.add(scramble(price, price.textContent, { duration: 0.5 }), at);
      });
      return tl;
    };
  }

  function revealReperes() {
    const inners = $$('.repere__inner');
    const nums = $$('.repere [data-flap-text]');
    nums.forEach((el) => Flaps.set(el, ''));
    G.set(inners, { y: -24, clipPath: 'inset(0% 0% 100% 0%)' });
    ST.create({
      trigger: '.reperes',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        G.to($$('.repere__inner'), { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.65, ease: 'power3.out', stagger: 0.12 });
        $$('.repere [data-flap-text]').forEach((el, i) => Flaps.flip(el, el.dataset.value || el.dataset.flapText, { delay: 0.3 + i * 0.12 }));
      },
    });
  }

  function revealBoard() {
    const rows = $$('[data-board-body] tr[data-id]');
    rows.forEach((tr) => { tr.classList.add('is-pending'); mountFlaps(tr, { blank: true }); });
    const countEl = $('[data-flaps="board-count"]');
    const value = countEl.dataset.value;
    Flaps.set(countEl, '');
    ST.create({ trigger: '.board__head', start: 'top 80%', once: true, onEnter: () => Flaps.flip(countEl, countEl.dataset.value || value, { step: 0.08, stagger: 0.1 }) });
    ST.batch(rows, {
      start: 'top 94%',
      once: true,
      interval: 0.06,
      batchMax: 12,
      onEnter: (batch) => batch.forEach((tr, i) => { if (tr.isConnected && tr.classList.contains('is-pending')) revealRow(tr, i * 0.045); }),
    });
  }

  function revealDuo() {
    const picks = $$('.pick');
    if (picks.length < 2) return;
    G.set(picks[0], { x: -56, autoAlpha: 0 });
    G.set(picks[1], { x: 56, autoAlpha: 0 });
    G.set($$('.card'), { rotationX: -90, transformOrigin: '50% 0%', transformPerspective: 800 });
    ST.create({
      trigger: '.duo',
      start: 'top 72%',
      once: true,
      onEnter: () => {
        const [left, right] = $$('.pick');
        const tl = G.timeline();
        tl.to([left, right], { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, 0);
        tl.to($$('.card'), { rotationX: 0, duration: 0.6, ease: 'power3.out', delay: (i, el) => 0.25 + Number(el.dataset.slot) * 0.08, clearProps: 'transform' }, 0);
      },
    });
  }

  function revealGates() {
    const gates = $$('.gate');
    G.set($$('.gate__plate'), { clipPath: 'inset(0% 0% 100% 0%)', y: -14 });
    gates.forEach((g) => Flaps.set($('[data-flap-text]', g), '00'));
    ST.batch(gates, {
      start: 'top 88%',
      once: true,
      interval: 0.1,
      batchMax: 4,
      onEnter: (batch) => {
        const tl = G.timeline();
        batch.forEach((g, i) => {
          tl.to($('.gate__plate', g), { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.5, ease: 'power3.out' }, i * 0.09);
          const num = $('[data-flap-text]', g);
          tl.add(Flaps.flip(num, num.dataset.flapText, { min: 3, max: 6, step: 0.07, stagger: 0.07 }), i * 0.09 + 0.32);
        });
      },
    });
  }

  function revealQuotes() {
    $$('.qcard').forEach((card, i) => {
      const img = $('.qcard__photo img', card);
      const from = i % 2 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
      /* Scroll-linked the first time; once the photo is fully in, it stays (no repeated motion). */
      const wipe = G.fromTo(img, { clipPath: from }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          end: 'top 38%',
          scrub: 0.6,
          onUpdate: (self) => {
            if (self.progress < 0.995) return;
            self.kill(false, true);
            G.to(wipe, { progress: 1, duration: 0.3, ease: 'power1.out' });
          },
        },
      });
      quoteTriggers.push(wipe.scrollTrigger);
      const values = $$('.manifest .fx', card);
      const flaps = $$('[data-flap-text]', card);
      flaps.forEach((el) => Flaps.set(el, ''));
      quoteTriggers.push(ST.create({
        trigger: card,
        start: 'top 68%',
        once: true,
        onEnter: () => {
          flaps.forEach((el, k) => Flaps.flip(el, el.dataset.flapText, { delay: k * 0.1 }));
          values.forEach((el, k) => scramble(el, el.textContent, { duration: 0.5, delay: 0.1 + k * 0.08 }));
        },
      }));
    });
  }

  function revealHow() {
    layoutHowArrow();
    const steps = $$('.how__step');
    const texts = steps.map((s) => [$('.how__step-title', s), $('.how__step-text', s)]);
    const nums = steps.map((s) => $('[data-flap-text]', s));
    nums.forEach((el) => Flaps.set(el, ''));
    G.set(texts.flat(), { autoAlpha: 0.18, y: 10 });
    const lit = new Set();
    const light = (i) => {
      if (lit.has(i) || !steps[i]) return;
      lit.add(i);
      Flaps.flip(nums[i], nums[i].dataset.flapText, { min: 4, max: 6, step: 0.08 });
      G.to(texts[i], { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.07 });
    };
    const line = $('[data-how-line]');
    const head = $('[data-how-head]');
    /* The route draws with the scroll the first time; once it reaches step 4 it stays drawn. */
    const tl = G.timeline({
      scrollTrigger: {
        trigger: '[data-how-track]',
        start: 'top 72%',
        end: 'bottom 62%',
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress * 1.15;
          how.stops.forEach((stop, i) => { if (progress >= stop - 0.02) light(i); });
          if (self.progress < 0.995) return;
          self.kill(false, true);
          G.to(tl, {
            progress: 1,
            duration: 0.35,
            ease: 'power1.out',
            onComplete: () => G.set([line, head], { clearProps: 'strokeDasharray,strokeDashoffset' }),
          });
          steps.forEach((s, i) => light(i));
        },
      },
    });
    tl.fromTo(line, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', ease: 'none', duration: 1 })
      .fromTo(head, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', ease: 'none', duration: 0.15 });
    ST.create({ trigger: '[data-how-track]', start: 'top 72%', once: true, onEnter: () => light(0) });
  }

  function setupMotion() {
    if (!G) { root.classList.remove('intro'); return; }
    if (ST) ST.addEventListener('refreshInit', layoutHowArrow);
    const mm = G.matchMedia();
    mm.add({ ok: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      motion.ok = !!ctx.conditions.ok;
      if (!motion.ok) { root.classList.remove('intro'); return undefined; }
      const startIntro = introHero();
      if (ST) {
        revealReperes();
        revealBoard();
        revealDuo();
        revealGates();
        revealQuotes();
        revealHow();
        motion.scrollReady = true;
      }
      fontsReady(900).then(() => {
        ctx.add(() => startIntro());
        if (ST) ST.refresh();
      });
      return () => {
        motion.ok = false;
        motion.scrollReady = false;
        root.classList.remove('intro');
        $$('tr.is-pending').forEach((tr) => { tr.classList.remove('is-pending'); mountFlaps(tr); });
        $$('[data-flap-text]').forEach((el) => Flaps.set(el, el.dataset.flapText));
        renderDestCodes();
        renderClock('set');
        updateCart();
        Flaps.set($('[data-flaps="board-count"]'), pad2(boardOffers().length));
      };
    });
  }

  /* ───────────────────────── Init ───────────────────────── */
  function init() {
    hydrateIcons();
    renderStatic();
    Flaps.mount($('[data-flaps="dest-hero"]'), countryOf(state.dest).iso3, { len: 3, set: 'alpha' });
    Flaps.mount($('[data-flaps="dest-hdr"]'), countryOf(state.dest).iso3, { len: 3, set: 'alpha' });
    Flaps.mount($('[data-flaps="cart"]'), String(Math.min(99, cartCount())), { len: 2, set: 'digit', align: 'right' });
    Flaps.mount($('[data-flaps="board-count"]'), pad2(boardOffers().length), { len: 2, set: 'digit' });
    renderDestText();
    startClock();
    renderShortcuts();
    renderShowcase();
    renderReperes();
    renderFilters();
    renderBoard();
    renderDuo();
    renderGates();
    renderQuotes();
    renderHow();
    layoutHowArrow();
    renderFooter();
    rayons.render();
    $$('[data-dest-root]').forEach(createDestMenu);
    updateCart();
    updateFavs();
    fitSlogan();
    fontsReady(3000).then(fitSlogan);
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitSlogan);
    let resizeTimer = 0;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(fitSlogan, 120); });
    setupSearch();
    setupHeaderState();
    setupDelegation();
    if ('ResizeObserver' in window && !ST) new ResizeObserver(() => layoutHowArrow()).observe($('[data-how-track]'));
    setupMotion();
  }

  init();
})();
