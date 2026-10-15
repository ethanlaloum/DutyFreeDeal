/*
 * DutyFreeDeal · Exploration C « Laissez-passer »
 * Accueil rendu depuis window.DFD (../shared/catalog.js, lecture seule) : aucun contenu métier en dur.
 *
 * 0 Outils · 1 Générateurs (guillochis, tampons, microtexte, MRZ) · 2 Icônes · 3 État ·
 * 4 Données dérivées · 5 Composants · 6 Sections · 7 Interactions · 8 Mouvement · 9 Démarrage
 */
(() => {
  'use strict';

  const D = window.DFD;
  if (!D) return;

  /* =====================================================================
     0. Outils
     ===================================================================== */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NB = ' ';
  const NNB = ' ';
  const TAU = Math.PI * 2;
  const hash = (text) => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  const stable = (key, min, max) => min + ((hash(String(key)) % 10007) / 10006) * (max - min);
  const pad2 = (n) => String(n).padStart(2, '0');
  const upper = (text) => String(text).toLocaleUpperCase('fr-FR');
  const plural = (n, one, many) => (n > 1 ? many : one);
  const motionAllowed = () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const gsapReady = () => typeof window.gsap !== 'undefined';
  const animate = () => gsapReady() && motionAllowed();
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /** Grammaire des pays (prépositions). Repli honnête si un nouveau pays apparaît dans les données. */
  const PREPOSITION = { FR: 'en', ES: 'en', US: 'aux', MX: 'au' };
  const inCountry = (code) => {
    const c = D.country(code);
    if (!c) return '';
    return PREPOSITION[code] ? `${PREPOSITION[code]}${NB}${c.name}` : `(${c.name})`;
  };
  const sellerIn = (code) => {
    const c = D.country(code);
    if (!c) return '';
    return PREPOSITION[code] ? `Vendeur ${inCountry(code)}` : `Pays du vendeur${NB}: ${c.name}`;
  };
  const listFr = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`);
  const route = (o) => `${o.from.iso3}${NB}→${NB}${o.to.iso3}`;
  const productHref = (o) => `../../#/product/${encodeURIComponent(o.id)}`;
  const catalogHref = (params) => `../../#/catalog${params ? `?${params}` : ''}`;

  /* =====================================================================
     1. Générateurs
     ===================================================================== */

  /**
   * Guillochis : courbes paramétriques exactes (hypotrochoïdes, épitrochoïdes, anneaux sinusoïdaux),
   * converties en Bézier cubiques d’Hermite à partir des dérivées : traits nets et légers.
   */
  const Guilloche = (() => {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const num = (n) => String(Math.round(n * 10) / 10);
    const turn = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

    function curvePath(fn, t0, t1, segments, scale = 1) {
      const h = (t1 - t0) / segments;
      const eps = h * 1e-3;
      const at = (t) => { const p = fn(t); return [p[0] * scale, p[1] * scale]; };
      const slope = (t) => { const a = at(t - eps); const b = at(t + eps); return [(b[0] - a[0]) / (2 * eps), (b[1] - a[1]) / (2 * eps)]; };
      let p0 = at(t0);
      let d0 = slope(t0);
      let out = `M${num(p0[0])} ${num(p0[1])}`;
      for (let i = 1; i <= segments; i += 1) {
        const t = t0 + i * h;
        const p1 = at(t);
        const d1 = slope(t);
        out += `C${num(p0[0] + (d0[0] * h) / 3)} ${num(p0[1] + (d0[1] * h) / 3)} ${num(p1[0] - (d1[0] * h) / 3)} ${num(p1[1] - (d1[1] * h) / 3)} ${num(p1[0])} ${num(p1[1])}`;
        p0 = p1;
        d0 = d1;
      }
      return out;
    }

    /** Familles de courbes, en coordonnées normalisées (rayon 1). */
    const FAMILIES = {
      /* Bande tressée : anneaux sinusoïdaux déphasés. */
      band: ({ r, amp, waves, count }) => Array.from({ length: count }, (_, i) => {
        const phase = (TAU * i) / count;
        return { fn: (t) => { const rr = r + amp * Math.sin(waves * t + phase); return [rr * Math.cos(t), rr * Math.sin(t)]; }, t1: TAU, seg: waves * 6 };
      }),
      /* Dentelle : épitrochoïdes allongées qui bouclent. */
      lace: ({ r, loop, n, count }) => Array.from({ length: count }, (_, j) => {
        const b = r / (n + 1);
        const a = n * b;
        const k = (a + b) / b;
        const rot = ((TAU / n) * j) / count;
        return { fn: (t) => turn([(a + b) * Math.cos(t) - loop * Math.cos(k * t), (a + b) * Math.sin(t) - loop * Math.sin(k * t)], rot), t1: TAU, seg: n * 10 };
      }),
      /* Étoile : hypotrochoïde fermée. */
      star: ({ r, R, rr, d, count, spin = 0 }) => Array.from({ length: count }, (_, j) => {
        const g = gcd(R, rr);
        const q = (R - rr) / rr;
        const s = r / (R - rr + d);
        return { fn: (t) => turn([s * ((R - rr) * Math.cos(t) + d * Math.cos(q * t)), s * ((R - rr) * Math.sin(t) - d * Math.sin(q * t))], spin * j), t1: TAU * (rr / g), seg: (R / g) * 12 };
      }),
      /* Entrelacs : épitrochoïde à grandes boucles. */
      epi: ({ r, R, rr, d, count, spin = 0 }) => Array.from({ length: count }, (_, j) => {
        const g = gcd(R, rr);
        const q = (R + rr) / rr;
        const s = r / (R + rr + d);
        return { fn: (t) => turn([s * ((R + rr) * Math.cos(t) - d * Math.cos(q * t)), s * ((R + rr) * Math.sin(t) - d * Math.sin(q * t))], spin * j), t1: TAU * (rr / g), seg: (R / g) * 14 };
      })
    };

    /** Rosace : superposition de familles. `ink` choisit la classe de couleur (a, b). */
    function rosace(layers, { size = 1000, stroke = 1, className = 'rosace' } = {}) {
      const half = size / 2;
      const paths = [];
      layers.forEach((layer) => {
        FAMILIES[layer.type](layer).forEach((c) => {
          paths.push(`<path class="g-${layer.ink || 'a'}" d="${curvePath(c.fn, 0, c.t1, c.seg, half)}"/>`);
        });
      });
      return `<svg class="${className}" viewBox="${-half} ${-half} ${size} ${size}" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths.join('')}</svg>`;
    }

    const svgTile = (w, h, stroke, paths) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke="#000" stroke-width="${stroke}">${paths.map((d) => `<path d="${d}"/>`).join('')}</svg>`;

    /** Bande d’ondes raccordable horizontalement (filets, bordure d’en-tête). */
    function waveTile({ w, h, count, amp, stroke = 0.6, second = null }) {
      const paths = [];
      for (let i = 0; i < count; i += 1) {
        const ph = (TAU * i) / count;
        const fn = (t) => [t, h / 2 + amp * Math.sin((TAU * t) / w + ph) + (second ? second.amp * Math.sin((TAU * second.periods * t) / w + ph * second.k) : 0)];
        paths.push(curvePath(fn, 0, w, 8 * (second ? second.periods : 1)));
      }
      return svgTile(w, h, stroke, paths);
    }

    /** Fond de papier : ondes à phase glissante, raccordables dans les deux sens. */
    function flowTile({ w, h, rows, amp, stroke = 0.6 }) {
      const dy = h / rows;
      const paths = [];
      for (let i = -2; i <= rows + 1; i += 1) {
        const y0 = dy * (i + 0.5);
        const ph = (TAU * i) / rows;
        paths.push(curvePath((t) => [t, y0 + amp * Math.sin((TAU * t) / w + ph)], 0, w, 8));
      }
      return svgTile(w, h, stroke, paths);
    }

    /** Filet de sécurité : deux familles d’ondes en opposition de phase. */
    function netTile({ w, h, rows, amp, periods = 2, stroke = 0.55 }) {
      const dy = h / rows;
      const paths = [];
      for (let i = -2; i <= rows + 1; i += 1) {
        const y0 = dy * i;
        paths.push(curvePath((t) => [t, y0 + amp * Math.sin((TAU * periods * t) / w)], 0, w, periods * 8));
        paths.push(curvePath((t) => [t, y0 + dy / 2 + amp * Math.sin((TAU * periods * t) / w + Math.PI)], 0, w, periods * 8));
      }
      return svgTile(w, h, stroke, paths);
    }

    /**
     * Cadre guilloché en neuf tranches (border-image) : une corde d’ondes entre deux filets,
     * des rosettes aux angles. `band` = épaisseur, `period` = longueur d’un motif raccordable.
     */
    function frameImage({ band = 8, period = 16, count = 3, amp = 2.2, stroke = 0.55, rule = 0.5, second = null, color = '#000' }) {
      const size = band * 2 + period;
      const mid = band / 2;
      const wave = (t, ph) => amp * Math.sin((TAU * t) / period + ph) + (second ? second.amp * Math.sin((TAU * second.periods * t) / period + ph * second.k) : 0);
      const seg = 8 * (second ? second.periods : 1);
      const paths = [];
      for (let i = 0; i < count; i += 1) {
        const ph = (TAU * i) / count;
        paths.push(curvePath((t) => [band + t, mid + wave(t, ph)], 0, period, seg));
        paths.push(curvePath((t) => [band + t, band + period + mid + wave(t, ph)], 0, period, seg));
        paths.push(curvePath((t) => [mid + wave(t, ph), band + t], 0, period, seg));
        paths.push(curvePath((t) => [band + period + mid + wave(t, ph), band + t], 0, period, seg));
      }
      const r1 = rule / 2;
      const r2 = band - rule / 2;
      const rules = [
        `M0 ${r1}H${size}`, `M0 ${r2}H${size}`, `M0 ${size - r1}H${size}`, `M0 ${size - r2}H${size}`,
        `M${r1} 0V${size}`, `M${r2} 0V${size}`, `M${size - r1} 0V${size}`, `M${size - r2} 0V${size}`
      ];
      const knot = (cx, cy) => curvePath((t) => { const rr = band * 0.36 * (0.5 + 0.5 * Math.abs(Math.cos(2 * t))); return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)]; }, 0, TAU, 32);
      const corners = [[mid, mid], [size - mid, mid], [mid, size - mid], [size - mid, size - mid]].map(([x, y]) => knot(x, y));
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" stroke="${color}" stroke-width="${stroke}">`
        + `<rect x="0" y="0" width="${band}" height="${band}" fill="${color}" fill-opacity="0"/>`
        + paths.map((d) => `<path d="${d}"/>`).join('')
        + rules.map((d) => `<path d="${d}" stroke-width="${rule}"/>`).join('')
        + corners.map((d) => `<path d="${d}"/>`).join('')
        + '</svg>';
    }

    const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    const colored = (svg, color, opacity) => svg.replace('stroke="#000"', `stroke="${color}" stroke-opacity="${opacity}"`);

    return { rosace, waveTile, flowTile, netTile, frameImage, uri, colored };
  })();

  /** Rosaces de la direction : couverture, logo, quatrième de couverture, sceau. */
  const ROSACES = {
    cover: [
      { type: 'band', r: 0.95, amp: 0.04, waves: 72, count: 5, ink: 'b' },
      { type: 'lace', r: 0.83, loop: 0.045, n: 40, count: 2, ink: 'a' },
      { type: 'epi', r: 0.69, R: 20, rr: 3, d: 5, count: 2, spin: Math.PI / 20, ink: 'b' },
      { type: 'band', r: 0.43, amp: 0.035, waves: 36, count: 3, ink: 'a' },
      { type: 'star', r: 0.33, R: 24, rr: 7, d: 6, count: 2, spin: Math.PI / 24, ink: 'b' }
    ],
    logo: [
      { type: 'band', r: 0.9, amp: 0.08, waves: 12, count: 2, ink: 'a' },
      { type: 'star', r: 0.62, R: 10, rr: 3, d: 2.4, count: 1, ink: 'a' }
    ],
    back: [
      { type: 'band', r: 0.94, amp: 0.05, waves: 60, count: 5, ink: 'b' },
      { type: 'lace', r: 0.8, loop: 0.06, n: 36, count: 2, ink: 'a' },
      { type: 'epi', r: 0.62, R: 18, rr: 5, d: 6, count: 2, spin: Math.PI / 18, ink: 'b' },
      { type: 'star', r: 0.4, R: 30, rr: 11, d: 9, count: 2, spin: Math.PI / 30, ink: 'a' }
    ],
    seal: [
      { type: 'band', r: 0.96, amp: 0.022, waves: 90, count: 3, ink: 'a' },
      { type: 'epi', r: 0.6, R: 24, rr: 5, d: 6, count: 2, spin: Math.PI / 24, ink: 'a' },
      { type: 'star', r: 0.34, R: 18, rr: 7, d: 5, count: 2, spin: Math.PI / 18, ink: 'a' }
    ],
    rondel: [
      { type: 'band', r: 0.92, amp: 0.06, waves: 24, count: 3, ink: 'a' },
      { type: 'star', r: 0.66, R: 16, rr: 5, d: 4, count: 1, ink: 'a' }
    ]
  };

  /**
   * Tampons encreurs SVG : rond, rectangle à double cadre, ovale. Texte circulaire par textPath,
   * encre imparfaite (déplacement léger, grain, densité inégale) via filtres partagés. Toujours décoratifs.
   */
  const Stamp = (() => {
    let uid = 0;
    const INKS = [
      { seed: 3, warpF: 0.035, warp: 2.2, grainF: 0.34, grainK: 12, grainT: 0.7, blotF: 0.012, blotK: 1.5, blotT: 1.08 },
      { seed: 11, warpF: 0.04, warp: 2.6, grainF: 0.3, grainK: 11, grainT: 0.69, blotF: 0.016, blotK: 1.7, blotT: 1.04 },
      { seed: 23, warpF: 0.03, warp: 2, grainF: 0.38, grainK: 12, grainT: 0.71, blotF: 0.01, blotK: 1.4, blotT: 1.1 },
      { seed: 37, warpF: 0.045, warp: 2.4, grainF: 0.32, grainK: 11, grainT: 0.7, blotF: 0.014, blotK: 1.6, blotT: 1.06 }
    ];

    function defs() {
      return INKS.map((v, i) => `
        <filter id="ink-${i}" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="${v.warpF}" numOctaves="2" seed="${v.seed}" result="warp"/>
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="${v.warp}" xChannelSelector="R" yChannelSelector="G" result="rough"/>
          <feTurbulence type="fractalNoise" baseFrequency="${v.grainF}" numOctaves="2" seed="${v.seed + 7}" result="grain"/>
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-v.grainK} 0 0 0 ${v.grainK * v.grainT}" result="grainMask"/>
          <feComposite in="rough" in2="grainMask" operator="in" result="grained"/>
          <feTurbulence type="fractalNoise" baseFrequency="${v.blotF}" numOctaves="3" seed="${v.seed + 13}" result="blot"/>
          <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-v.blotK} 0 0 0 ${v.blotK * v.blotT}" result="blotMask"/>
          <feComposite in="grained" in2="blotMask" operator="in"/>
        </filter>`).join('');
    }

    const fit = (text, arc, base, ratio = 0.7) => Math.min(base, arc / Math.max(1, text.length * ratio));
    const txt = (x, y, size, text, extra = '') => `<text x="${x}" y="${y}" font-size="${size.toFixed(2)}" text-anchor="middle" ${extra}>${esc(text)}</text>`;
    const onPath = (id, d, size, text) => `<path id="${id}" d="${d}" fill="none" stroke="none"/><text font-size="${size.toFixed(2)}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(text)}</textPath></text>`;

    function round({ top = '', bottom = '', center = '', sub = '', rosette = false }) {
      const id = `stp${uid += 1}`;
      const topR = 70.5;
      const botR = 81.5;
      const topArc = `M ${100 - topR} 100 A ${topR} ${topR} 0 0 1 ${100 + topR} 100`;
      const botArc = `M ${100 - botR} 100 A ${botR} ${botR} 0 0 0 ${100 + botR} 100`;
      const core = rosette
        ? `<g transform="translate(100 100) scale(0.56)" fill="none" stroke="currentColor" stroke-width="2.2">${Guilloche.rosace(ROSACES.rondel, { size: 200, stroke: 2.2, className: 'stamp__rosette' }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`
        : `${txt(100, sub ? 104 : 113, fit(center, 96, 34, 0.62), center, 'letter-spacing="2"')}${sub ? txt(100, 128, 14, sub, 'letter-spacing="1.5"') : ''}`;
      return `<svg class="stamp stamp--round" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <g filter="url(#ink-${hash(top + center) % INKS.length})" fill="currentColor" stroke="currentColor" font-family="IBM Plex Mono, monospace" font-weight="600" letter-spacing="1.2">
          <circle cx="100" cy="100" r="95" fill="none" stroke-width="4.6"/>
          <circle cx="100" cy="100" r="88.5" fill="none" stroke-width="1.4"/>
          <circle cx="100" cy="100" r="62" fill="none" stroke-width="1.4"/>
          <g stroke="none">
            ${onPath(`${id}t`, topArc, fit(top, Math.PI * topR * 0.92, 14.5), top)}
            ${bottom ? onPath(`${id}b`, botArc, fit(bottom, Math.PI * botR * 0.8, 14.5), bottom) : ''}
            <circle cx="22.5" cy="100" r="2.6"/><circle cx="177.5" cy="100" r="2.6"/>
            ${core}
          </g>
        </g>
      </svg>`;
    }

    function rect({ lines = [] }) {
      return `<svg class="stamp stamp--rect" viewBox="0 0 260 130" aria-hidden="true" focusable="false">
        <g filter="url(#ink-${hash(lines.map((l) => l.text).join()) % INKS.length})" fill="currentColor" stroke="currentColor" font-family="IBM Plex Mono, monospace" font-weight="600">
          <rect x="4" y="4" width="252" height="122" fill="none" stroke-width="4.6"/>
          <rect x="11.5" y="11.5" width="237" height="107" fill="none" stroke-width="1.4"/>
          <g stroke="none">${lines.map((l) => txt(130, l.y, fit(l.text, 220, l.size, 0.66), l.text, `letter-spacing="${l.ls ?? 1.2}"`)).join('')}</g>
        </g>
      </svg>`;
    }

    function oval({ top = '', center = '', sub = '', bottom = '' }) {
      const id = `sto${uid += 1}`;
      const arc = (rx, ry, under) => `M ${140 - rx} 80 A ${rx} ${ry} 0 0 ${under ? 0 : 1} ${140 + rx} 80`;
      return `<svg class="stamp stamp--oval" viewBox="0 0 280 160" aria-hidden="true" focusable="false">
        <g filter="url(#ink-${hash(top + center) % INKS.length})" fill="currentColor" stroke="currentColor" font-family="IBM Plex Mono, monospace" font-weight="600" letter-spacing="1.2">
          <ellipse cx="140" cy="80" rx="135" ry="75" fill="none" stroke-width="4.6"/>
          <ellipse cx="140" cy="80" rx="128" ry="68" fill="none" stroke-width="1.4"/>
          <line x1="48" y1="58" x2="232" y2="58" stroke-width="1.4"/>
          <line x1="48" y1="106" x2="232" y2="106" stroke-width="1.4"/>
          <g stroke="none">
            ${onPath(`${id}t`, arc(112, 54, false), fit(top, 250, 13.5), top)}
            ${onPath(`${id}b`, arc(120, 62, true), fit(bottom, 250, 13.5), bottom)}
            ${txt(140, 84, fit(center, 170, 21, 0.64), center, 'letter-spacing="1.6"')}
            ${txt(140, 99, fit(sub, 170, 11.5, 0.66), sub, 'letter-spacing="1.2"')}
          </g>
        </g>
      </svg>`;
    }

    const make = ({ shape = 'round', ...rest }) => ({ round, rect, oval }[shape])(rest);
    return { defs, make };
  })();

  /** Microtexte : ligne continue utilisée comme filet (décorative). */
  const microtext = (count = 48) => `${Array.from({ length: count }, () => 'DUTYFREEDEAL').join('·')}`;

  /** Zone de lecture automatique calculée depuis les données (décorative, aria-hidden). */
  const MRZ = (() => {
    const clean = (text) => upper(String(text).normalize('NFD').replace(/[̀-ͯ]/g, '')).replace(/[^A-Z0-9]+/g, '<').replace(/^<+|<+$/g, '');
    const fill = (line, len) => (line + '<'.repeat(Math.max(0, len - line.length))).slice(0, Math.max(len, line.length));
    function lines(dest) {
      const country = D.country(dest);
      const tail = D.slogan.includes(',') ? D.slogan.split(',').slice(1).join(',') : D.slogan;
      const list = D.offersFor(dest);
      const showcase = D.showcaseFor(dest).map((o) => o.from.iso3);
      const sellers = [...new Set(list.map((o) => o.from.iso3))];
      const ordered = [...new Set([...showcase, ...sellers.filter((c) => c !== country.iso3), ...sellers])];
      const l1 = `P<${country.iso3}<DUTYFREEDEAL<<${clean(tail)}`;
      const l2 = `${list.length}<OFFRES<LIVRABLES<<${ordered.join('<')}`;
      const len = Math.max(54, l1.length, l2.length);
      return [fill(l1, len), fill(l2, len)];
    }
    return { lines };
  })();

  /* =====================================================================
     2. Icônes (Phosphor, MIT, copiées en ligne)
     ===================================================================== */

  const ICONS = {
    search: 'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
    heart: 'M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z',
    heartFill: 'M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z',
    bag: 'M236,69.4A16.13,16.13,0,0,0,223.92,64H176a48,48,0,0,0-96,0H32.08a16.13,16.13,0,0,0-12,5.4,16,16,0,0,0-3.92,12.48l14.26,120a16,16,0,0,0,16,14.12H209.67a16,16,0,0,0,16-14.12l14.26-120A16,16,0,0,0,236,69.4ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm81.76,168a.13.13,0,0,1-.09,0H46.25L32.08,80H224Z',
    caret: 'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z',
    arrow: 'M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z',
    close: 'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
    plus: 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
    check: 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z'
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="${ICONS[name]}" fill="currentColor"/></svg>`;

  /* =====================================================================
     3. État et stockage
     ===================================================================== */

  const STORE_KEY = 'dutyfreedeal-explo-c-laissez-passer';
  const state = {
    dest: 'FR',
    cart: {},
    favs: new Set(),
    filter: { collection: 'all', country: 'all' },
    albumOpen: false,
    coverOpen: false,
    heroSearchVisible: true
  };

  function loadState() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
      if (!saved) return;
      if (saved.dest && D.country(saved.dest)) state.dest = saved.dest;
      if (saved.cart && typeof saved.cart === 'object') {
        Object.entries(saved.cart).forEach(([id, qty]) => { if (D.offers.some((o) => o.id === id) && qty > 0) state.cart[id] = Math.min(99, qty | 0); });
      }
      if (Array.isArray(saved.favs)) saved.favs.filter((id) => D.offers.some((o) => o.id === id)).forEach((id) => state.favs.add(id));
    } catch (error) { /* stockage indisponible : l’état reste en mémoire */ }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ dest: state.dest, cart: state.cart, favs: [...state.favs] }));
    } catch (error) { /* stockage indisponible */ }
  }

  const cartCount = () => Object.values(state.cart).reduce((sum, n) => sum + n, 0);

  /* =====================================================================
     4. Données dérivées
     ===================================================================== */

  const offersHere = () => D.offersFor(state.dest);
  const destName = () => D.country(state.dest).name;
  const modelKey = (o) => o.image;
  const INKS = ['violet', 'teal', 'vermillion', 'ultramarine', 'cover'];
  const ALBUM_CAP = 16;
  const VISA_INKS = ['teal', 'ultramarine', 'cover'];

  /** Sélection variée : modèles et pays de vendeurs différents en priorité. */
  function pickVaried(list, count, exclude = new Set()) {
    const out = [];
    const models = new Set();
    const countries = new Set();
    const passes = [
      (o) => !models.has(modelKey(o)) && !countries.has(o.from.code),
      (o) => !models.has(modelKey(o)),
      () => true
    ];
    passes.forEach((accept) => {
      list.forEach((o) => {
        if (out.length >= count || out.includes(o) || exclude.has(o.id) || !accept(o)) return;
        out.push(o);
        models.add(modelKey(o));
        countries.add(o.from.code);
      });
    });
    return out;
  }

  /**
   * Ordre de l’album : un modèle par rayon et par tour (achat direct d’abord, pays de vendeur variés),
   * puis les autres vendeurs des mêmes modèles. La première planche montre ainsi l’étendue du catalogue.
   */
  function albumOrder(offers) {
    const country = (o) => D.vendor(o.vendorId).country;
    const models = new Map();
    offers.forEach((o) => { if (!models.has(o.image)) models.set(o.image, []); models.get(o.image).push(o); });
    const byRayon = new Map(D.departments.map((d) => [d.id, []]));
    models.forEach((group) => {
      if (!byRayon.has(group[0].rayon)) byRayon.set(group[0].rayon, []);
      byRayon.get(group[0].rayon).push(group);
    });
    byRayon.forEach((groups) => groups.sort((a, b) => (a[0].mode === 'quote') - (b[0].mode === 'quote')));
    const used = new Map();
    const firsts = [];
    const rest = [];
    for (let round = 0, more = true; more; round += 1) {
      more = false;
      byRayon.forEach((groups) => {
        const group = groups[round];
        if (!group) return;
        more = true;
        const pick = [...group].sort((a, b) => (used.get(country(a)) || 0) - (used.get(country(b)) || 0))[0];
        used.set(country(pick), (used.get(country(pick)) || 0) + 1);
        firsts.push(pick);
        rest.push(...group.filter((o) => o !== pick));
      });
    }
    return [...firsts, ...rest];
  }

  function collectionOffers(key) {
    return offersHere().filter((o) => o.collections.includes(key));
  }

  /** Trois offres par sélection : achat direct, rayons et pays variés, sans répéter les modèles de la vitrine. */
  function selection(key) {
    const showcase = D.showcaseFor(state.dest);
    const ids = new Set(showcase.map((o) => o.id));
    const models = new Set(showcase.map((o) => o.image));
    const purchasable = albumOrder(collectionOffers(key).filter((o) => o.mode === 'purchase' && o.stock > 0));
    const fresh = purchasable.filter((o) => !models.has(o.image));
    return pickVaried(fresh.length >= 3 ? fresh : purchasable, 3, ids);
  }

  function sellerCountries(list) {
    return [...new Set(list.map((o) => o.from.code))];
  }

  function quoteOffers() {
    const seen = new Set();
    return offersHere().filter((o) => o.mode === 'quote').filter((o) => (seen.has(o.rayon) ? false : seen.add(o.rayon))).slice(0, 2);
  }

  const inkStyle = (ink) => `--ink-c: var(--${ink}); --frame: var(--frame-${ink})`;
  const offersLabel = (n) => `${n}${NB}${plural(n, 'offre livrable', 'offres livrables')}`;

  /* =====================================================================
     5. Composants (gabarits HTML)
     ===================================================================== */

  function priceHtml(amount, cls = '') {
    const p = D.priceParts(amount);
    return `<span class="price ${cls}"><span class="price__whole">${esc(p.whole)}</span><span class="price__sep">,</span><span class="price__cents">${esc(p.cents)}</span><span class="price__cur">${NNB}${esc(p.currency)}</span></span>`;
  }

  const shippingText = (o) => `+${NB}${D.price(o.shipping)} de livraison`;
  const offerLabel = (o) => `${o.name}, ${o.vendor.name}`;

  function favButton(o, cls = '') {
    const on = state.favs.has(o.id);
    return `<button type="button" class="fav ${cls}" data-fav="${esc(o.id)}" aria-pressed="${on}" aria-label="Favori${NB}: ${esc(offerLabel(o))}">${icon('heart', 'fav__off')}${icon('heartFill', 'fav__on')}</button>`;
  }

  function addButton(o, { cls = 'btn btn--ink', label = 'Ajouter', full = false } = {}) {
    if (o.mode === 'quote') {
      return `<a class="${cls}" href="${productHref(o)}" aria-label="Demander un devis${NB}: ${esc(offerLabel(o))}">Demander un devis</a>`;
    }
    const name = full ? label : `${label} au panier`;
    return `<button type="button" class="${cls}" data-add="${esc(o.id)}" aria-label="${esc(name)}${NB}: ${esc(offerLabel(o))}">${icon('plus')}<span>${esc(label)}</span></button>`;
  }

  function photo(o, { lazy = true, cutout = false } = {}) {
    const cut = cutout && o.cutout;
    return `<img src="${esc(cut ? o.cutout : o.image)}" alt="${esc(o.imageAlt)}" ${cut ? 'data-cut' : 'data-fit'} ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
  }

  /** Cadrage : une photo aux proportions extrêmes est montée entière (contain) au lieu d’être recadrée. */
  function fitPhoto(img) {
    const apply = () => {
      if (!img.naturalWidth) return;
      const box = img.parentElement.getBoundingClientRect();
      const frame = Number(img.parentElement.dataset.ratio) || (box.height ? box.width / box.height : 0);
      if (!frame) return;
      const ratio = (img.naturalWidth / img.naturalHeight) / frame;
      img.classList.toggle('is-mounted', ratio < 0.72 || ratio > 1.65);
    };
    if (img.complete) apply(); else img.addEventListener('load', apply, { once: true });
  }

  function initPhotoFit(root = document) {
    $$('img[data-fit]', root).forEach(fitPhoto);
  }

  function sellerStamp(o) {
    return Stamp.make({ shape: 'round', top: upper(`Vendeur · ${o.from.name}`), bottom: 'DUTYFREEDEAL', center: o.from.iso3, sub: `→${NB}${o.to.iso3}` });
  }

  /** Page-visa de la vitrine. */
  function visaInner(o, i) {
    const rot = stable(`visa-${o.id}`, -12, 12).toFixed(1);
    return `
      <article class="visa__page" aria-labelledby="visa-name-${i}">
        <span class="visa__frame" aria-hidden="true"></span>
        <p class="visa__top"><span>Offre N°${NB}${pad2(i + 1)}</span><span class="visa__route" data-route>${esc(route(o))}</span></p>
        <a class="visa__photo" href="${productHref(o)}" tabindex="-1">${photo(o, { lazy: false, cutout: true })}</a>
        <span class="visa__stamp" data-stamp data-rot="${rot}" style="--rot:${rot}deg" aria-hidden="true">${sellerStamp(o)}</span>
        <h3 class="visa__name" id="visa-name-${i}"><a href="${productHref(o)}">${esc(o.name)}</a></h3>
        <p class="visa__vendor">${esc(o.vendor.name)} <span class="visa__kind">${o.vendor.type === 'business' ? 'Entreprise' : 'Particulier'} · ${esc(upper(o.vendor.verification))}</span></p>
        <p class="visa__seller" data-seller>${esc(sellerIn(o.from.code))}</p>
        <div class="visa__buy">
          ${priceHtml(o.price, 'price--face')}
          ${favButton(o)}
        </div>
        <p class="visa__ship" data-ship>${esc(shippingText(o))}</p>
        ${addButton(o, { cls: 'btn btn--action visa__add', label: 'Ajouter au panier', full: true })}
      </article>`;
  }

  /** Ligne d’une double page (Bons plans, Introuvables). */
  function lotHtml(o) {
    return `
      <li class="lot" data-offer="${esc(o.id)}" data-flip-id="lot-${esc(o.id)}">
        <a class="lot__thumb" href="${productHref(o)}" tabindex="-1" data-ratio="1">${photo(o, { cutout: true })}</a>
        <div class="lot__main">
          <h3 class="lot__name"><a href="${productHref(o)}">${esc(o.name)}</a></h3>
          <p class="lot__vendor">${esc(o.vendor.name)}</p>
          <p class="lot__seller"><span class="lot__route">${esc(route(o))}</span> ${esc(sellerIn(o.from.code))}</p>
        </div>
        <div class="lot__buy">
          ${priceHtml(o.price, 'price--lot')}
          <p class="lot__ship">${esc(shippingText(o))}</p>
          <div class="lot__actions">${favButton(o)}${addButton(o)}</div>
        </div>
      </li>`;
  }

  /** Timbre de l’album (toutes les offres livrables). */
  function timbreHtml(o) {
    const ink = o.collections.includes('rare') ? 'violet' : 'teal';
    const quote = o.mode === 'quote';
    return `
      <li class="timbre" data-offer="${esc(o.id)}" data-flip-id="timbre-${esc(o.id)}" data-col="${esc(o.collections.join(' '))}" data-country="${esc(o.from.code)}" data-rot="${stable(`timbre-${o.id}`, -2, 2).toFixed(2)}" style="${inkStyle(ink)}">
        <article class="timbre__paper" aria-labelledby="timbre-${esc(o.id)}">
          <span class="timbre__sheen" aria-hidden="true"></span>
          <div class="timbre__visual">
            <a class="timbre__photo" href="${productHref(o)}" tabindex="-1" data-ratio="1.3333">${photo(o, { cutout: true })}</a>
            <p class="timbre__value">${quote ? '<span class="timbre__hint">Prix indicatif</span>' : ''}${priceHtml(o.price, 'price--face')}</p>
            <p class="timbre__edge" aria-hidden="true">Vendeur · ${esc(o.from.name)}</p>
          </div>
          <p class="timbre__col">${esc(o.collections.map((c) => D.collections[c]?.name || c).join(' · '))}</p>
          <h3 class="timbre__name" id="timbre-${esc(o.id)}"><a href="${productHref(o)}">${esc(o.name)}</a></h3>
          <p class="timbre__vendor">${esc(o.vendor.name)}</p>
          <p class="timbre__seller" data-seller>${esc(sellerIn(o.from.code))} · <span data-route>${esc(route(o))}</span></p>
          <p class="timbre__ship" data-ship>${esc(quote ? o.delivery : shippingText(o))}</p>
          <div class="timbre__actions">${favButton(o)}${addButton(o)}</div>
        </article>
      </li>`;
  }

  /** Carte de rayon (page de visa). */
  function rayonHtml(d, i) {
    const ink = INKS[i % INKS.length];
    const big = i < 3;
    const rot = stable(`rayon-${d.id}`, -12, 12).toFixed(1);
    return `
      <li class="rayon ${big ? 'rayon--lg' : ''}" data-rayon="${esc(d.id)}" style="${inkStyle(ink)}">
        <a class="rayon__link" href="${catalogHref(`category=${encodeURIComponent(d.id)}`)}">
          <span class="rayon__frame" aria-hidden="true"></span>
          <span class="rayon__media">
            <img src="${esc(d.image)}" alt="${esc(d.imageAlt)}" loading="lazy" decoding="async">
            <span class="rayon__tint" aria-hidden="true"></span>
          </span>
          <span class="rayon__no" aria-hidden="true">N°${NB}${pad2(i + 1)}</span>
          <div class="rayon__body">
            <h3 class="rayon__name">${esc(d.name)}</h3>
            <p class="rayon__subs">${esc(d.subcategories.slice(0, 3).join(' · '))}</p>
            <p class="rayon__meta"><span>${d.categoryCount}${NB}catégories</span><span data-rayon-count></span></p>
          </div>
          <span class="rayon__stamp" data-stamp data-rot="${rot}" style="--rot:${rot}deg" aria-hidden="true">${Stamp.make({ shape: 'round', top: upper(`Rayon N° ${pad2(i + 1)}`), bottom: 'DUTYFREEDEAL', center: pad2(i + 1) })}</span>
        </a>
      </li>`;
  }

  /** Certificat d’un gros bien sur demande. */
  function certificateHtml(o, i) {
    return `
      <article class="cert" data-offer="${esc(o.id)}" aria-labelledby="cert-name-${i}">
        <span class="cert__border" aria-hidden="true"></span>
        <div class="cert__inner">
          <p class="cert__kicker"><span>Demande N°${NB}${pad2(i + 1)}</span><span>${esc(route(o))}</span></p>
          <h3 class="cert__name" id="cert-name-${i}"><a href="${productHref(o)}">${esc(o.name)}</a></h3>
          <a class="cert__photo" href="${productHref(o)}" tabindex="-1">${photo(o)}</a>
          <dl class="cert__fields">
            <div><dt>Prix indicatif</dt><dd>${priceHtml(o.price, 'price--cert')}</dd></div>
            ${[['Modalité', 'Demande de devis ou de réservation'], ['Acompte', 'Aucun, démonstration'], ['Livraison', o.delivery], ['Vendeur', o.vendor.name], ['Pays du vendeur', o.from.name]]
              .map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd><span class="sr-only">${esc(dd)}</span><span data-fill aria-hidden="true">${esc(dd)}</span></dd></div>`).join('')}
          </dl>
          <a class="btn btn--action cert__cta" href="${productHref(o)}" aria-label="Demander un devis${NB}: ${esc(offerLabel(o))}">Demander un devis ${icon('arrow')}</a>
        </div>
        <span class="cert__seal" data-stamp data-rot="${stable(`cert-${o.id}`, -12, 12).toFixed(1)}" aria-hidden="true">${Stamp.make({ shape: 'round', top: 'SUR DEMANDE · SANS PAIEMENT', bottom: 'DÉMONSTRATION', rosette: true })}</span>
      </article>`;
  }

  /* =====================================================================
     6. Sections
     ===================================================================== */

  function installPatterns() {
    const root = document.documentElement;
    const set = (name, svg) => root.style.setProperty(name, Guilloche.uri(svg));
    set('--pat-rope', Guilloche.waveTile({ w: 18, h: 6, count: 3, amp: 2.1, stroke: 0.6 }));
    set('--pat-ribbon', Guilloche.waveTile({ w: 96, h: 28, count: 10, amp: 9, stroke: 0.6, second: { amp: 3, periods: 3, k: 2 } }));
    set('--pat-net', Guilloche.netTile({ w: 120, h: 40, rows: 4, amp: 7, periods: 2 }));
    const flow = Guilloche.flowTile({ w: 120, h: 96, rows: 24, amp: 6, stroke: 0.6 });
    set('--pat-flow', flow);
    set('--paper-flow', Guilloche.colored(flow, cssVar('--teal') || '#0E6F6A', 0.075));
    set('--cover-flow', Guilloche.colored(flow, cssVar('--rose') || '#F4C6CC', 0.06));
    ['violet', 'teal', 'vermillion', 'ultramarine', 'cover'].forEach((ink) => {
      set(`--frame-${ink}`, Guilloche.frameImage({ band: 8, period: 16, count: 3, amp: 2.1, color: cssVar(`--${ink}`) }));
    });
    set('--frame-cert', Guilloche.frameImage({ band: 18, period: 36, count: 6, amp: 5.2, stroke: 0.6, rule: 0.7, second: { amp: 1.6, periods: 3, k: 2 }, color: cssVar('--cover') }));
  }

  function renderDataText() {
    $$('[data-bind="demo"]').forEach((el) => { el.textContent = D.demoNotice; });
    $$('[data-bind="pitch"]').forEach((el) => { el.textContent = D.pitch; });
    const [a, ...rest] = D.slogan.split(',');
    const slogan = $('#slogan');
    const visual = rest.length
      ? `<span class="slogan__a">${esc(a)},</span> <span class="slogan__b">${esc(rest.join(',').trim())}</span>`
      : `<span class="slogan__a">${esc(D.slogan)}</span>`;
    slogan.innerHTML = `<span class="sr-only">${esc(D.slogan)}</span><span class="slogan__vis" aria-hidden="true">${visual}</span>`;
    $$('[data-nav]').forEach((el) => { el.textContent = D.nav[Number(el.dataset.nav)] || el.textContent; });
    ['deals', 'rare'].forEach((key) => {
      $$(`[data-col-name="${key}"]`).forEach((el) => { el.textContent = D.collections[key].name; });
      $$(`[data-col-text="${key}"]`).forEach((el) => { el.textContent = D.collections[key].text; });
    });
    $$('.microtext').forEach((el) => { el.textContent = microtext(); });
  }

  function renderGenerated() {
    $('#ink-defs').innerHTML = Stamp.defs();
    $$('[data-rosace]').forEach((el) => {
      const kind = el.dataset.rosace;
      const opts = { cover: { stroke: 1 }, logo: { size: 100, stroke: 3.4 }, back: { stroke: 1 }, seal: { stroke: 1.15 } }[kind] || {};
      el.innerHTML = Guilloche.rosace(ROSACES[kind], opts);
    });
  }

  function renderDestinationMenu() {
    const list = $('#dest-list');
    list.innerHTML = D.countries.map((c) => `
      <li role="option" id="dest-opt-${esc(c.code)}" data-code="${esc(c.code)}" aria-selected="${c.code === state.dest}">
        <span class="dest__iso">${esc(c.iso3)}</span>
        <span class="dest__name">${esc(c.name)}</span>
        <span class="dest__n">${D.offersFor(c.code).length}${NB}offres</span>
        ${icon('check', 'dest__check')}
      </li>`).join('');
  }

  function renderSommaire() {
    $('#sommaire-tabs').innerHTML = D.departments.map((d, i) => `
      <button type="button" role="tab" id="tab-${esc(d.id)}" data-dept="${esc(d.id)}" aria-controls="sommaire-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
        <span class="sommaire__no">N°${NB}${pad2(i + 1)}</span><span class="sommaire__nm">${esc(d.name)}</span>
      </button>`).join('');
    showSommairePanel(D.departments[0].id);
  }

  function showSommairePanel(id) {
    const d = D.department(id);
    const i = D.departments.indexOf(d);
    const count = offersHere().filter((o) => o.rayon === id).length;
    const panel = $('#sommaire-panel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.style.setProperty('--ink-c', `var(--${INKS[i % INKS.length]})`);
    panel.innerHTML = `
      <div class="sommaire__media"><img src="${esc(d.image)}" alt="${esc(d.imageAlt)}" width="1200" height="800" decoding="async"></div>
      <p class="sommaire__kicker">Rayon N°${NB}${pad2(i + 1)} · ${d.categoryCount}${NB}catégories</p>
      <p class="sommaire__title">${esc(d.name)}</p>
      <ul class="sommaire__subs">${d.subcategories.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <p class="sommaire__count">${count ? `${esc(offersLabel(count))} ${esc(inCountry(state.dest))}` : `Aucune offre exemple livrable ${esc(inCountry(state.dest))} pour l’instant.`}</p>
      <a class="sommaire__all" href="${catalogHref(`category=${encodeURIComponent(d.id)}`)}">Voir tout le rayon ${icon('arrow')}</a>`;
  }

  function renderShowcase() {
    const list = D.showcaseFor(state.dest);
    $$('.visa').forEach((li, i) => {
      const o = list[i];
      li.hidden = !o;
      if (!o) return;
      li.dataset.offer = o.id;
      li.setAttribute('style', inkStyle(VISA_INKS[i % VISA_INKS.length]));
      li.innerHTML = visaInner(o, i);
    });
    $('#vitrine-title').textContent = `${plural(sellerCountries(list).length, 'Vendeur', 'Vendeurs')} ${listFr(sellerCountries(list).map(inCountry))}`;
  }

  /** Mise à jour en place (même offre) : route, livraison, pays du vendeur, tampon. */
  function refreshShowcaseInPlace() {
    const list = D.showcaseFor(state.dest);
    let sameOffers = true;
    $$('.visa').forEach((li, i) => { if (!list[i] || li.dataset.offer !== list[i].id) sameOffers = false; });
    if (!sameOffers) { renderShowcase(); return true; }
    $$('.visa').forEach((li, i) => {
      const o = list[i];
      $('[data-route]', li).textContent = route(o);
      $('[data-ship]', li).textContent = shippingText(o);
      $('[data-stamp]', li).innerHTML = sellerStamp(o);
    });
    return false;
  }

  function destinationRepere() {
    const list = offersHere();
    return {
      stamp: Stamp.make({ shape: 'round', top: upper(`Livrable ${inCountry(state.dest)}`), bottom: 'DUTYFREEDEAL', center: D.country(state.dest).iso3 }),
      ink: 'violet',
      title: `Livrable ${inCountry(state.dest)}`,
      text: `Le catalogue national réunit les offres du monde entier livrables chez vous${NB}: ${offersLabel(list.length).replace('livrables', 'de démonstration')}, de vendeurs ${listFr(sellerCountries(list).map(inCountry))}.`
    };
  }

  function updateDestinationRepere() {
    const it = destinationRepere();
    const item = $('.repere--1');
    $('[data-stamp]', item).innerHTML = it.stamp;
    $('.repere__title', item).textContent = it.title;
    $('.repere__text', item).textContent = it.text;
  }

  function renderReperes() {
    const items = [
      destinationRepere(),
      {
        stamp: Stamp.make({ shape: 'rect', lines: [{ text: 'VENDEURS VÉRIFIÉS', size: 19, y: 50 }, { text: 'KYC · KYB', size: 30, y: 87, ls: 3 }, { text: 'AVANT ACTIVATION · DÉMO', size: 11.5, y: 107 }] }),
        ink: 'teal',
        title: 'Vendeurs vérifiés',
        text: `Vérification avant activation${NB}: KYC pour les particuliers, KYB pour les entreprises. Procédure simulée dans la maquette.`
      },
      {
        stamp: Stamp.make({ shape: 'oval', top: 'UN PANIER · UN PAIEMENT', center: 'EXPÉDITIONS', sub: 'ORGANISÉES PAR VENDEUR', bottom: 'PAIEMENT SIMULÉ · DÉMO' }),
        ink: 'vermillion',
        title: 'Un panier, un paiement',
        text: 'Un seul panier et un seul paiement pour plusieurs vendeurs, puis des expéditions organisées par vendeur. Paiement simulé dans la maquette.'
      }
    ];
    $('#reperes-list').innerHTML = items.map((it, i) => `
      <li class="repere repere--${i + 1}" style="${inkStyle(it.ink)}">
        <span class="repere__stamp" data-stamp data-rot="${-6}" aria-hidden="true">${it.stamp}</span>
        <h3 class="repere__title">${esc(it.title)}</h3>
        <p class="repere__text">${esc(it.text)}</p>
      </li>`).join('');
  }

  function renderSpread() {
    ['deals', 'rare'].forEach((key) => {
      const picks = selection(key);
      const total = collectionOffers(key).length;
      const leaf = $(`[data-leaf="${key}"]`);
      $('.leaf__list', leaf).innerHTML = picks.length
        ? picks.map(lotHtml).join('')
        : `<li class="leaf__empty">Aucune offre exemple de cette sélection n’est livrable ${esc(inCountry(state.dest))}.</li>`;
      const more = $('.leaf__more', leaf);
      const name = D.collections[key].name.toLocaleLowerCase('fr-FR');
      more.innerHTML = `<span>Voir ${total > 1 ? `les ${total}` : 'le'} ${esc(total > 1 ? name : name.replace(/s\b/g, ''))} ${esc(plural(total, 'livrable', 'livrables'))} ${esc(inCountry(state.dest))}</span>${icon('arrow')}`;
      more.hidden = total === 0;
      initPhotoFit(leaf);
    });
  }

  function renderAlbum({ build = false } = {}) {
    const grid = $('#album-grid');
    if (build) grid.innerHTML = albumOrder(D.offers).map((o) => timbreHtml({ ...o, vendor: D.vendor(o.vendorId), from: D.country(D.vendor(o.vendorId).country), to: D.country(state.dest), shipping: D.vendor(o.vendorId).shipping[state.dest] ?? 0 })).join('');
    const here = new Map(offersHere().map((o) => [o.id, o]));
    $$('.timbre', grid).forEach((li) => {
      const o = here.get(li.dataset.offer);
      li.dataset.here = o ? '1' : '0';
      if (!o) return;
      $('[data-route]', li).textContent = route(o);
      $('[data-ship]', li).textContent = o.mode === 'quote' ? o.delivery : shippingText(o);
    });
    renderFilters();
    applyFilter();
    const list = offersHere();
    $('#album-lead').textContent = `${offersLabel(list.length).replace('livrables', 'de démonstration')}, proposées par des vendeurs ${listFr(sellerCountries(list).map(inCountry))}. Le pays indiqué est celui du vendeur.`;
  }

  function renderFilters() {
    const list = offersHere();
    const f = state.filter;
    const countIf = (col, country) => list.filter((o) => (col === 'all' || o.collections.includes(col)) && (country === 'all' || o.from.code === country)).length;
    if (f.country !== 'all' && !list.some((o) => o.from.code === f.country)) f.country = 'all';
    const colButtons = [['all', 'Tout'], ['deals', D.collections.deals.name], ['rare', D.collections.rare.name]]
      .map(([key, label]) => `<button type="button" class="chip" data-f-col="${key}" aria-pressed="${f.collection === key}">${esc(label)} <span class="chip__n">${countIf(key, f.country)}</span></button>`).join('');
    const countryButtons = [['all', 'Tous'], ...sellerCountries(list).map((code) => [code, D.country(code).name])]
      .map(([key, label]) => `<button type="button" class="chip" data-f-country="${key}" aria-pressed="${f.country === key}">${esc(label)} <span class="chip__n">${countIf(f.collection, key)}</span></button>`).join('');
    $('#filter-col').innerHTML = colButtons;
    $('#filter-country').innerHTML = countryButtons;
  }

  /** Filtre l’album puis plafonne à une planche de ALBUM_CAP timbres tant qu’elle n’est pas dépliée. */
  function applyFilter() {
    const f = state.filter;
    let matching = 0;
    $$('#album-grid .timbre').forEach((li) => {
      const ok = li.dataset.here === '1'
        && (f.collection === 'all' || li.dataset.col.split(' ').includes(f.collection))
        && (f.country === 'all' || li.dataset.country === f.country);
      li.hidden = !ok || (!state.albumOpen && matching >= ALBUM_CAP);
      if (ok) matching += 1;
    });
    $('#album-empty').hidden = matching > 0;
    const more = $('#album-more');
    more.hidden = matching <= ALBUM_CAP;
    more.setAttribute('aria-expanded', String(state.albumOpen));
    $('span', more).textContent = state.albumOpen ? 'Replier la planche' : `Afficher les ${matching}${NB}offres`;
    $('#album-shown').textContent = matching > ALBUM_CAP && !state.albumOpen ? `${ALBUM_CAP} offres sur ${matching} affichées` : '';
    return { matching, shown: state.albumOpen ? matching : Math.min(matching, ALBUM_CAP) };
  }

  function renderRayons() {
    $('#rayons-grid').innerHTML = D.departments.map(rayonHtml).join('');
    $('#rayons-count').textContent = String(D.departments.length);
    updateRayonCounts();
  }

  function updateRayonCounts() {
    const list = offersHere();
    $$('.rayon').forEach((li) => {
      const n = list.filter((o) => o.rayon === li.dataset.rayon).length;
      $('[data-rayon-count]', li).textContent = n ? offersLabel(n) : 'Aucune offre exemple';
      li.classList.toggle('rayon--empty', n === 0);
    });
  }

  function renderCertificates() {
    const list = quoteOffers();
    $('#biens-grid').innerHTML = list.length
      ? list.map(certificateHtml).join('')
      : `<p class="biens__empty">Aucun gros bien de démonstration n’est livrable ${esc(inCountry(state.dest))} pour l’instant.</p>`;
  }

  function renderVendorSeal() {
    const seal = $('#seal-engrave');
    const ring = 'VENDEUR VÉRIFIÉ · KYC · KYB · DÉMO · VENDEUR VÉRIFIÉ · KYC · KYB · DÉMO ·';
    seal.innerHTML = `
      ${Guilloche.rosace(ROSACES.seal, { stroke: 1.2, className: 'seal__rosace' })}
      <svg class="seal__ring" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
        <path id="seal-ring-path" d="M 200 200 m -168 0 a 168 168 0 1 1 336 0 a 168 168 0 1 1 -336 0" fill="none"/>
        <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" stroke-width="2.4"/>
        <circle cx="200" cy="200" r="183" fill="none" stroke="currentColor" stroke-width="0.9"/>
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" stroke-width="0.9"/>
        <text font-family="IBM Plex Mono, monospace" font-weight="600" font-size="17" letter-spacing="3.1" fill="currentColor"><textPath href="#seal-ring-path" startOffset="0">${esc(ring)}</textPath></text>
      </svg>`;
  }

  function renderCredits() {
    $('#credits-list').innerHTML = D.credits.map((c) => `
      <li>
        <span class="credit__label">${esc(c.label)}</span>
        <span class="credit__meta">${esc(c.author)} · ${c.licenseUrl ? `<a href="${esc(c.licenseUrl)}" rel="noopener license" target="_blank">${esc(c.license)}<span class="sr-only"> (licence, nouvel onglet)</span></a>` : esc(c.license)}</span>
        ${c.source ? `<a class="credit__src" href="${esc(c.source)}" rel="noopener" target="_blank">Source<span class="sr-only">${NB}: ${esc(c.label)} (nouvel onglet)</span></a>` : '<span class="credit__src credit__src--none">Illustration générée pour la maquette</span>'}
      </li>`).join('');
    $('#credits-count').textContent = String(D.credits.length);
  }

  function renderMrz({ scramble = false } = {}) {
    const [l1, l2] = MRZ.lines(state.dest);
    $$('[data-mrz]').forEach((box) => {
      const lines = $$('.mrz__line', box);
      [l1, l2].forEach((text, i) => {
        const el = lines[i];
        if (!el) return;
        if (scramble && animate() && window.ScrambleTextPlugin) {
          gsap.to(el, { duration: 1.1, delay: i * 0.12, scrambleText: { text, chars: '<ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', speed: 0.6, revealDelay: 0.25 }, ease: 'none' });
        } else {
          el.textContent = text;
        }
      });
    });
  }

  function updateDestinationLabels() {
    const c = D.country(state.dest);
    $$('[data-dest-in]').forEach((el) => { el.textContent = inCountry(state.dest); });
    $$('[data-dest-name]').forEach((el) => { el.textContent = c.name; });
    $$('[data-dest-iso]').forEach((el) => { el.textContent = c.iso3; });
    $$('#dest-list [role="option"]').forEach((opt) => opt.setAttribute('aria-selected', String(opt.dataset.code === state.dest)));
    $('#dest-btn').setAttribute('aria-label', `Livraison${NB}: ${c.name}. Changer le pays de livraison`);
  }

  function updateCounters({ bump = null } = {}) {
    const favN = state.favs.size;
    const cartN = cartCount();
    $('[data-fav-count]').textContent = String(favN);
    $('[data-cart-count]').textContent = String(cartN);
    $('#fav-link').setAttribute('aria-label', `Favoris, ${favN}${NB}${plural(favN, 'offre', 'offres')}`);
    $('#cart-link').setAttribute('aria-label', `Panier, ${cartN}${NB}${plural(cartN, 'article', 'articles')}`);
    if (bump && animate()) {
      gsap.fromTo(bump, { scale: 1 }, { keyframes: [{ scale: 1.45, duration: 0.14, ease: 'power2.out' }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }] });
    }
  }

  /* =====================================================================
     7. Interactions
     ===================================================================== */

  const live = (message) => {
    const region = $('#live');
    region.textContent = '';
    window.setTimeout(() => { region.textContent = message; }, 40);
  };

  /** Notifications papier à bord guilloché. */
  const Toast = (() => {
    function show(html, { timeout = 4800 } = {}) {
      const host = $('#toasts');
      const el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = `<span class="toast__rule" aria-hidden="true"></span><div class="toast__body">${html}</div><button type="button" class="toast__close" aria-label="Fermer la notification">${icon('close')}</button>`;
      host.appendChild(el);
      while (host.children.length > 3) host.firstElementChild.remove();
      let timer = window.setTimeout(close, timeout);
      function close() {
        window.clearTimeout(timer);
        if (animate()) gsap.to(el, { autoAlpha: 0, y: 12, duration: 0.25, ease: 'power2.in', onComplete: () => el.remove() });
        else el.remove();
      }
      el.close = close;
      el.addEventListener('mouseenter', () => window.clearTimeout(timer));
      el.addEventListener('focusin', () => window.clearTimeout(timer));
      el.addEventListener('mouseleave', () => { timer = window.setTimeout(close, 2400); });
      $('.toast__close', el).addEventListener('click', close);
      if (animate()) gsap.from(el, { y: 24, rotation: -1.5, autoAlpha: 0, duration: 0.5, ease: 'expo.out' });
      return el;
    }
    function clear() {
      $$('#toasts .toast').forEach((el) => el.remove());
    }
    return { show, clear };
  })();

  /* --- Recherche : deux champs, un seul brouillon --- */
  function initSearch() {
    const inputs = $$('[data-search] input[type="search"]');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        inputs.forEach((other) => { if (other !== input) other.value = input.value; });
      });
    });
    $$('[data-search]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const q = $('input[type="search"]', form).value.trim();
        window.location.href = q ? catalogHref(`q=${encodeURIComponent(q)}`) : catalogHref('');
      });
    });
  }

  function setHeaderSearch() {
    const show = !state.heroSearchVisible || state.coverOpen;
    const header = $('.masthead');
    if (header.classList.contains('has-search') === show) return;
    header.classList.toggle('has-search', show);
    const form = $('#hsearch');
    form.toggleAttribute('inert', !show);
    if (show && animate()) gsap.fromTo(form, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'expo.out', overwrite: true, clearProps: 'transform,opacity' });
    else if (gsapReady()) gsap.set(form, { clearProps: 'transform,opacity' });
  }

  function initHeaderObservers() {
    const hero = $('#msearch');
    const io = new IntersectionObserver(([entry]) => {
      state.heroSearchVisible = entry.isIntersecting;
      setHeaderSearch();
    }, { rootMargin: `-${Math.round($('.masthead').offsetHeight)}px 0px 0px 0px`, threshold: 0.35 });
    io.observe(hero);
    const sentinel = $('#top-sentinel');
    new IntersectionObserver(([entry]) => {
      $('.masthead').classList.toggle('is-compact', !entry.isIntersecting);
    }).observe(sentinel);
  }

  /* --- Menus : fermeture commune --- */
  const Menus = (() => {
    let open = null;
    function register(menu) {
      menu.close = (restore = true) => {
        menu.hide();
        if (restore) (menu.returnTo || menu.trigger).focus({ preventScroll: true });
        menu.returnTo = null;
        if (open === menu) open = null;
      };
      return menu;
    }
    function setOpen(menu) {
      if (open && open !== menu) open.close(false);
      open = menu;
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && open) { event.preventDefault(); open.close(true); }
    });
    document.addEventListener('pointerdown', (event) => {
      if (!open || open.root.contains(event.target) || open.trigger.contains(event.target)) return;
      if (open.returnTo && open.returnTo.contains(event.target)) return;
      open.close(false);
    });
    return { register, setOpen, current: () => open };
  })();

  /* --- Destination --- */
  function initDestination() {
    const btn = $('#dest-btn');
    const list = $('#dest-list');
    const options = () => $$('[role="option"]', list);
    let active = 0;
    const menu = Menus.register({
      trigger: btn,
      root: list,
      hide() {
        list.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        list.removeAttribute('aria-activedescendant');
      }
    });
    function activate(i) {
      const opts = options();
      active = (i + opts.length) % opts.length;
      opts.forEach((o, k) => o.classList.toggle('is-active', k === active));
      list.setAttribute('aria-activedescendant', opts[active].id);
    }
    function openMenu() {
      Menus.setOpen(menu);
      list.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      activate(Math.max(0, options().findIndex((o) => o.dataset.code === state.dest)));
      list.focus({ preventScroll: true });
      if (animate()) gsap.fromTo(list, { y: -8, rotationX: -10, opacity: 0, transformOrigin: '50% 0%', transformPerspective: 800 }, { y: 0, rotationX: 0, opacity: 1, duration: 0.35, ease: 'expo.out' });
    }
    function choose(i) {
      const code = options()[i].dataset.code;
      menu.close(true);
      setDestination(code);
    }
    btn.addEventListener('click', () => (list.hidden ? openMenu() : menu.close(true)));
    btn.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openMenu(); }
    });
    list.addEventListener('keydown', (event) => {
      const keys = { ArrowDown: () => activate(active + 1), ArrowUp: () => activate(active - 1), Home: () => activate(0), End: () => activate(options().length - 1), Enter: () => choose(active), ' ': () => choose(active) };
      if (keys[event.key]) { event.preventDefault(); keys[event.key](); }
      if (event.key === 'Tab') menu.close(false);
    });
    list.addEventListener('click', (event) => {
      const opt = event.target.closest('[role="option"]');
      if (opt) choose(options().indexOf(opt));
    });
    list.addEventListener('pointermove', (event) => {
      const opt = event.target.closest('[role="option"]');
      if (opt) activate(options().indexOf(opt));
    });
  }

  function setDestination(code) {
    if (code === state.dest || !D.country(code)) return;
    const flipState = Motion.capture();
    state.dest = code;
    saveState();
    updateDestinationLabels();
    const swapped = refreshShowcaseInPlace();
    $('#vitrine-title').textContent = `${plural(sellerCountries(D.showcaseFor(code)).length, 'Vendeur', 'Vendeurs')} ${listFr(sellerCountries(D.showcaseFor(code)).map(inCountry))}`;
    updateDestinationRepere();
    renderSpread();
    renderAlbum();
    updateRayonCounts();
    renderCertificates();
    Motion.armCertificates();
    renderDestinationMenu();
    const tab = $('#sommaire-tabs [aria-selected="true"]');
    if (tab) showSommairePanel(tab.dataset.dept);
    renderMrz({ scramble: true });
    Cart.render();
    Motion.afterDestination(flipState, { swapped });
    const n = offersHere().length;
    live(`${offersLabel(n)} ${inCountry(code)}`);
  }

  /* --- Langue --- */
  function initLanguage() {
    $$('.lang button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        Toast.show('<p>Exploration disponible en français uniquement.</p>');
      });
    });
  }

  /* --- Favoris et panier --- */
  function initOffersActions() {
    document.addEventListener('click', (event) => {
      const fav = event.target.closest('[data-fav]');
      if (fav) {
        const id = fav.dataset.fav;
        const on = !state.favs.has(id);
        if (on) state.favs.add(id); else state.favs.delete(id);
        saveState();
        $$(`[data-fav="${CSS.escape(id)}"]`).forEach((b) => b.setAttribute('aria-pressed', String(on)));
        updateCounters({ bump: $('[data-fav-count]') });
        if (animate()) gsap.fromTo($$('.fav__on', fav), { scale: on ? 0.4 : 1 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' });
        const o = D.offers.find((x) => x.id === id);
        live(`${on ? 'Ajouté aux favoris' : 'Retiré des favoris'}${NB}: ${o.name}`);
        return;
      }
      const add = event.target.closest('[data-add]');
      if (add) {
        const id = add.dataset.add;
        const o = offersHere().find((x) => x.id === id) || D.offers.find((x) => x.id === id);
        state.cart[id] = (state.cart[id] || 0) + 1;
        saveState();
        updateCounters({ bump: $('[data-cart-count]') });
        Motion.stampAdded(add.closest('.visa__page, .lot, .timbre__paper') || add);
        const vendor = o.vendor || D.vendor(o.vendorId);
        Cart.render();
        Toast.show(`<p><strong>Ajouté au panier</strong> ${esc(o.name)} · ${esc(vendor.name)}</p><button type="button" class="toast__action" data-open-cart>Voir le panier ${icon('arrow')}</button>`);
      }
    });
  }

  /* --- Panier local : un seul panier, articles groupés par vendeur, livraison à part --- */
  const Cart = (() => {
    const btn = () => $('#cart-link');
    const panel = () => $('#cart-panel');
    let menu = null;

    function lines() {
      const here = new Map(offersHere().map((o) => [o.id, o]));
      return Object.entries(state.cart).map(([id, qty]) => {
        const base = D.offers.find((o) => o.id === id);
        if (!base) return null;
        const vendor = D.vendor(base.vendorId);
        return { id, qty, offer: here.get(id) || { ...base, vendor, from: D.country(vendor.country), to: D.country(state.dest) }, deliverable: here.has(id) };
      }).filter(Boolean);
    }

    function render() {
      const all = lines();
      const groups = new Map();
      all.forEach((line) => {
        const key = line.offer.vendorId;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(line);
      });
      const ok = all.filter((l) => l.deliverable);
      const shippedVendors = [...new Set(ok.map((l) => l.offer.vendorId))];
      const itemsTotal = ok.reduce((sum, l) => sum + l.offer.price * l.qty, 0);
      const shipTotal = shippedVendors.reduce((sum, v) => sum + (D.vendor(v).shipping[state.dest] || 0), 0);
      const count = all.reduce((n, l) => n + l.qty, 0);
      $('#cart-meta').textContent = count
        ? `${count}${NB}${plural(count, 'article', 'articles')} · ${shippedVendors.length}${NB}${plural(shippedVendors.length, 'expédition', 'expéditions')} · livraison ${inCountry(state.dest)}`
        : `Livraison ${inCountry(state.dest)}`;
      if (!all.length) {
        $('#cart-body').innerHTML = `<p class="cart__empty">Votre panier est vide. Ajoutez une offre depuis la vitrine ou la planche des offres.</p>`;
        $('#cart-foot').innerHTML = '';
        return;
      }
      const groupHtml = [...groups.entries()].map(([vendorId, group]) => {
        const v = D.vendor(vendorId);
        const from = D.country(v.country);
        const deliverable = group.some((l) => l.deliverable);
        return `
          <section class="cart__group" aria-label="${esc(v.name)}">
            <p class="cart__vendor"><span class="cart__vname">${esc(v.name)}</span><span class="cart__route">${esc(sellerIn(v.country))} · ${esc(from.iso3)}${NB}→${NB}${esc(D.country(state.dest).iso3)}</span></p>
            <ul class="cart__items">${group.map((l) => `
              <li class="cart__item">
                <a class="cart__thumb" href="${productHref(l.offer)}" tabindex="-1" data-ratio="1">${photo(l.offer, { cutout: true })}</a>
                <div class="cart__info">
                  <a class="cart__name" href="${productHref(l.offer)}">${esc(l.offer.name)}</a>
                  <span class="cart__qty">Quantité${NB}: ${l.qty}</span>
                  ${l.deliverable ? '' : `<span class="cart__warn">Non livrable ${esc(inCountry(state.dest))} : retirez l’article ou changez de pays.</span>`}
                </div>
                <div class="cart__amount">
                  <span class="cart__price">${esc(D.price(l.offer.price * l.qty))}</span>
                  <button type="button" class="cart__remove" data-remove="${esc(l.id)}" aria-label="Retirer ${esc(l.offer.name)} du panier">Retirer</button>
                </div>
              </li>`).join('')}
            </ul>
            ${deliverable ? `<p class="cart__ship">+${NB}${esc(D.price(v.shipping[state.dest] || 0))} de livraison, expédiée par ce vendeur</p>` : ''}
          </section>`;
      }).join('');
      $('#cart-body').innerHTML = groupHtml;
      $('#cart-foot').innerHTML = `
        <dl class="cart__totals">
          <div><dt>Articles</dt><dd>${esc(D.price(itemsTotal))}</dd></div>
          <div><dt>Livraison, ${shippedVendors.length}${NB}${plural(shippedVendors.length, 'expédition', 'expéditions')}</dt><dd>${esc(D.price(shipTotal))}</dd></div>
          <div class="cart__total"><dt>Total</dt><dd>${priceHtml(itemsTotal + shipTotal, 'price--cart')}</dd></div>
        </dl>
        <p class="cart__note">Un seul paiement pour tous les vendeurs, puis une expédition par vendeur. Paiement simulé, frais de livraison de démonstration.</p>
        <a class="btn btn--action cart__cta" href="../../#/checkout">Passer commande ${icon('arrow')}</a>`;
      initPhotoFit(panel());
    }

    function open(opener) {
      const returnTo = opener && opener !== btn() && !opener.closest('.toasts') ? opener : null;
      render();
      Toast.clear();
      Menus.setOpen(menu);
      menu.returnTo = returnTo;
      panel().hidden = false;
      btn().setAttribute('aria-expanded', 'true');
      $('#cart-title').focus({ preventScroll: true });
      if (animate()) gsap.fromTo(panel(), { rotationX: -9, y: -12, opacity: 0, transformOrigin: '50% 0%', transformPerspective: 900 }, { rotationX: 0, y: 0, opacity: 1, duration: 0.45, ease: 'expo.out' });
    }

    function init() {
      menu = Menus.register({
        trigger: btn(),
        root: panel(),
        hide() {
          panel().hidden = true;
          btn().setAttribute('aria-expanded', 'false');
        }
      });
      btn().addEventListener('click', () => (panel().hidden ? open(btn()) : menu.close(true)));
      $('#cart-close').addEventListener('click', () => menu.close(true));
      document.addEventListener('click', (event) => {
        const opener = event.target.closest('[data-open-cart]');
        if (opener) { event.preventDefault(); open(opener); }
      });
      panel().addEventListener('click', (event) => {
        const rm = event.target.closest('[data-remove]');
        if (!rm) return;
        const id = rm.dataset.remove;
        const name = D.offers.find((o) => o.id === id)?.name || '';
        delete state.cart[id];
        saveState();
        updateCounters({ bump: $('[data-cart-count]') });
        render();
        $('#cart-title').focus({ preventScroll: true });
        live(`Retiré du panier${NB}: ${name}`);
      });
      panel().addEventListener('focusout', (event) => {
        const to = event.relatedTarget;
        if (!panel().hidden && to && !panel().contains(to) && to !== btn() && !to.closest('.toasts')) menu.close(false);
      });
    }

    return { init, render };
  })();

  /* --- Sommaire « Tous les rayons » --- */
  function initSommaire() {
    const trigger = $('#rayons-btn');
    const root = $('#sommaire');
    const tabs = () => $$('[role="tab"]', root);
    const menu = Menus.register({
      trigger,
      root,
      hide() {
        root.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
    function select(tab, focus = true) {
      tabs().forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      showSommairePanel(tab.dataset.dept);
      if (focus) tab.focus({ preventScroll: true });
    }
    function openMenu() {
      Menus.setOpen(menu);
      root.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const current = $('[aria-selected="true"]', root) || tabs()[0];
      current.focus({ preventScroll: true });
      if (animate()) {
        gsap.fromTo($('.sommaire__page', root), { rotationX: 8, y: -14, opacity: 0, transformOrigin: '50% 0%' }, { rotationX: 0, y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
        gsap.fromTo(tabs(), { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.018, ease: 'power2.out', delay: 0.05 });
      }
    }
    trigger.addEventListener('click', () => (root.hidden ? openMenu() : menu.close(true)));
    trigger.addEventListener('keydown', (event) => { if (event.key === 'ArrowDown') { event.preventDefault(); openMenu(); } });
    $('#sommaire-close').addEventListener('click', () => menu.close(true));
    root.addEventListener('keydown', (event) => {
      const list = tabs();
      const i = list.indexOf(document.activeElement);
      if (i < 0) return;
      const go = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[event.key];
      if (go !== undefined) { event.preventDefault(); select(list[(go + list.length) % list.length]); }
      if (event.key === 'ArrowRight') { event.preventDefault(); $('.sommaire__all', root).focus(); }
    });
    root.addEventListener('click', (event) => { const tab = event.target.closest('[role="tab"]'); if (tab) select(tab); });
    root.addEventListener('pointerover', (event) => { const tab = event.target.closest('[role="tab"]'); if (tab && tab.getAttribute('aria-selected') !== 'true') select(tab, false); });
    root.addEventListener('focusout', (event) => {
      if (!root.hidden && event.relatedTarget && !root.contains(event.relatedTarget) && event.relatedTarget !== trigger) menu.close(false);
    });
  }

  /* --- Filtres de l’album --- */
  function initFilters() {
    $('#album-filters').addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-f-col], button[data-f-country]');
      if (!btn) return;
      const flipState = Motion.capture();
      if (btn.dataset.fCol) state.filter.collection = btn.dataset.fCol;
      if (btn.dataset.fCountry) state.filter.country = btn.dataset.fCountry;
      const focusKey = btn.dataset.fCol ? `[data-f-col="${btn.dataset.fCol}"]` : `[data-f-country="${btn.dataset.fCountry}"]`;
      renderFilters();
      const { matching, shown } = applyFilter();
      $(focusKey).focus({ preventScroll: true });
      Motion.afterFilter(flipState);
      live(shown < matching
        ? `${matching}${NB}${plural(matching, 'offre correspond', 'offres correspondent')}, ${shown} affichées`
        : `${matching}${NB}${plural(matching, 'offre affichée', 'offres affichées')}`);
    });
    $('#album-more').addEventListener('click', () => {
      const btn = $('#album-more');
      const wasShown = new Set($$('#album-grid .timbre:not([hidden])'));
      const offset = btn.getBoundingClientRect().top;
      const keep = window.scrollY;
      state.albumOpen = !state.albumOpen;
      const { matching, shown } = applyFilter();
      if (state.albumOpen) {
        window.scrollTo({ top: keep, behavior: 'instant' });
        Motion.poseLater($$('#album-grid .timbre:not([hidden])').filter((el) => !wasShown.has(el)));
        window.scrollTo({ top: keep, behavior: 'instant' });
        live(`${shown}${NB}${plural(shown, 'offre affichée', 'offres affichées')}`);
      } else {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        window.scrollTo({ top: btn.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' });
        live(`${shown} offres sur ${matching} affichées`);
      }
    });
  }

  /* --- Liens internes --- */
  function initLinks() {
    $$('[data-home]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: motionAllowed() ? 'smooth' : 'auto' });
        if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
      });
    });
    $$('a[href^="#"]:not([href="#sources"]):not([data-home])').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        event.preventDefault();
        const offset = $('.masthead').offsetHeight - 12;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: motionAllowed() ? 'smooth' : 'auto' });
        window.history.replaceState(null, '', `#${target.id}`);
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
    $$('a[href="#sources"]').forEach((link) => {
      link.addEventListener('click', () => {
        const details = $('#sources');
        details.open = true;
        window.setTimeout(() => $('summary', details).focus({ preventScroll: true }), 30);
      });
    });
  }

  /* =====================================================================
     8. Mouvement (GSAP) : uniquement avec prefers-reduced-motion: no-preference
     ===================================================================== */

  const Motion = (() => {
    let stageTrigger = null;

    function strike(el, { shake = null, from = 1.6, delay = 0 } = {}) {
      const rot = parseFloat(el.dataset.rot || '-6');
      const tl = gsap.timeline({ delay });
      tl.fromTo(el, { scale: from, rotation: rot - 8, autoAlpha: 0 }, { scale: 1, rotation: rot, autoAlpha: 0.92, duration: 0.22, ease: 'power4.in', immediateRender: true });
      if (shake) tl.to(shake, { keyframes: [{ y: 1.8, duration: 0.035 }, { y: -0.9, duration: 0.05 }, { y: 0, duration: 0.08 }], ease: 'none' });
      return tl;
    }

    function capture() {
      if (!animate() || !window.Flip) return null;
      return Flip.getState('.lot, .timbre');
    }

    function flipFrom(flipState) {
      if (!flipState) return;
      Flip.from(flipState, {
        targets: '.lot, .timbre',
        duration: 0.7,
        ease: 'expo.inOut',
        prune: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.86, rotation: (i) => (i % 2 ? 2.5 : -2.5) }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'expo.out', stagger: 0.03, delay: 0.15 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.86, duration: 0.3, ease: 'power2.in' }),
        onComplete: () => ScrollTrigger.refresh()
      });
    }

    function revealAllTimbres() {
      if (!gsapReady()) return;
      const fold = window.innerHeight;
      gsap.set($$('.timbre').filter((el) => el.hidden || el.getBoundingClientRect().top < fold), { clearProps: 'opacity,visibility,transform' });
    }

    /** Timbres révélés après coup : posés au défilement, comme ceux de la première planche. */
    function poseLater(els) {
      if (!els.length) return;
      if (!animate()) { if (window.ScrollTrigger) ScrollTrigger.refresh(); return; }
      gsap.set(els, { autoAlpha: 0, y: 34, rotation: (i, el) => Number(el.dataset.rot) * 2.2 });
      ScrollTrigger.batch(els, {
        start: 'top 92%',
        once: true,
        interval: 0.08,
        batchMax: 4,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, overwrite: 'auto' })
      });
      ScrollTrigger.refresh();
    }

    function afterFilter(flipState) {
      revealAllTimbres();
      flipFrom(flipState);
      if (!flipState && window.ScrollTrigger) ScrollTrigger.refresh();
    }

    function afterDestination(flipState, { swapped }) {
      if (!animate()) { if (window.ScrollTrigger) ScrollTrigger.refresh(); return; }
      revealAllTimbres();
      flipFrom(flipState);
      const stamps = $$('.visa [data-stamp]');
      if (swapped) gsap.from($$('.visa__page'), { autoAlpha: 0, y: 18, rotationY: -12, duration: 0.6, stagger: 0.06, ease: 'expo.out' });
      stamps.forEach((s, i) => strike(s, { delay: 0.12 + i * 0.1, shake: s.closest('.visa__page') }));
      gsap.from($$('.visa [data-ship], .visa [data-route]'), { y: 6, autoAlpha: 0, duration: 0.5, stagger: 0.05, delay: 0.2, ease: 'expo.out' });
      const repere = $('.repere--1 [data-stamp]');
      if (Number(gsap.getProperty(repere, 'opacity')) > 0.5) strike(repere, { delay: 0.2 });
      gsap.from('.rayon [data-rayon-count]', { autoAlpha: 0, y: 6, duration: 0.4, stagger: 0.02 });
    }

    function stampAdded(card) {
      if (!card || !card.isConnected) return;
      const mark = document.createElement('span');
      mark.className = 'added-stamp';
      mark.setAttribute('aria-hidden', 'true');
      mark.dataset.rot = String(stable(`${card.dataset?.offer || ''}${Date.now() % 7}`, -14, 10).toFixed(1));
      mark.innerHTML = Stamp.make({ shape: 'rect', lines: [{ text: 'AJOUTÉ', size: 40, y: 80, ls: 6 }] });
      card.appendChild(mark);
      if (!animate()) { window.setTimeout(() => mark.remove(), 1400); return; }
      strike(mark, { shake: card })
        .to(mark, { autoAlpha: 0, duration: 0.5, delay: 1.1, ease: 'power1.in' })
        .add(() => mark.remove());
    }

    function headerVisibleHeight() {
      const header = $('.masthead');
      return header.getBoundingClientRect().bottom > 0 ? Math.round(header.offsetHeight - parseFloat(getComputedStyle(header).getPropertyValue('--sticky-shift') || '0')) : 0;
    }

    function offsetWithin(el, ancestor) {
      let x = 0;
      let y = 0;
      let node = el;
      while (node && node !== ancestor) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
      return { x, y };
    }

    /* Moment n° 1 : la couverture s’ouvre, l’éventail se redresse et s’étale. */
    function buildStage() {
      const passport = $('.passport');
      const stage = $('.passport__stage');
      const cover = $('.cover');
      const pages = $$('.visa:not([hidden])');
      const head = $('.under__head');
      passport.classList.add('is-staged');
      const fan = [-7, 0, 6];
      const fanGeom = () => {
        const mrz = $('.cover__mrz');
        const anchor = offsetWithin(mrz, stage).y + mrz.offsetHeight + Math.min(22, window.innerHeight * 0.02);
        const w = pages[0].offsetWidth;
        const centerX = stage.offsetWidth / 2;
        return pages.map((p, i) => {
          const pos = offsetWithin(p, stage);
          const targetCenter = centerX + (i - (pages.length - 1) / 2) * w * 0.66;
          return { x: targetCenter - (pos.x + p.offsetWidth / 2), y: anchor - pos.y + (i === 1 ? -14 : 0), r: fan[i] ?? 0 };
        });
      };
      let geom = fanGeom();
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'stage',
          trigger: stage,
          start: () => `top ${headerVisibleHeight()}`,
          end: () => `+=${Math.round(window.innerHeight * 1.45)}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => { gsap.set(pages, { clearProps: 'transform' }); geom = fanGeom(); },
          onUpdate: (self) => {
            const open = self.progress > 0.16;
            if (open !== state.coverOpen) { state.coverOpen = open; setHeaderSearch(); }
            cover.classList.toggle('is-away', self.progress > 0.56);
          }
        }
      });
      tl.fromTo(cover, { rotationY: 0 }, { rotationY: -95, duration: 0.46, ease: 'power1.in' }, 0)
        .to(cover, { rotationY: -165, duration: 0.1 }, 0.46)
        .fromTo('.cover__shade', { opacity: 0 }, { opacity: 0.7, duration: 0.44, ease: 'power1.in' }, 0)
        .fromTo('.cover__rosace svg', { rotation: 0 }, { rotation: 40, duration: 0.46 }, 0)
        .fromTo(head, { y: 40 }, { y: 0, duration: 0.5, ease: 'power1.out' }, 0.08)
        .fromTo(pages, {
          x: (i) => geom[i].x, y: (i) => geom[i].y, rotation: (i) => geom[i].r, scale: 0.92
        }, {
          x: 0, y: 0, rotation: 0, scale: 1, duration: 0.68, ease: 'power2.inOut', stagger: 0.035
        }, 0.06)
        .to({}, { duration: 0.19 });
      stageTrigger = tl.scrollTrigger;

      /* Clavier : un élément focalisé reste lisible (couverture refermée, ou pages à plat). */
      const byKeyboard = (event) => event.target instanceof Element && event.target.matches(':focus-visible');
      cover.addEventListener('focusin', (event) => {
        if (byKeyboard(event) && stageTrigger && stageTrigger.progress > 0.08) window.scrollTo({ top: stageTrigger.start, behavior: 'instant' });
      });
      $('.fan').addEventListener('focusin', (event) => {
        if (byKeyboard(event) && stageTrigger && stageTrigger.progress < 0.98) window.scrollTo({ top: stageTrigger.end, behavior: 'instant' });
      });

      return () => {
        passport.classList.remove('is-staged');
        state.coverOpen = false;
        setHeaderSearch();
        stageTrigger = null;
      };
    }

    /* Chorégraphie d’arrivée : rosace dessinée, slogan, recherche, éventail, tampons, MRZ. */
    function intro() {
      const slogan = $('#slogan');
      const visual = $('.slogan__vis', slogan);
      gsap.set(visual, { autoAlpha: 0 });
      gsap.set(['.cover__pitch', '.msearch', '.cover__mrz'], { autoAlpha: 0, y: 16 });
      gsap.set('.visa__page', { yPercent: 34, autoAlpha: 0 });
      gsap.set('.visa [data-stamp]', { autoAlpha: 0 });
      const paths = $$('.cover__rosace path');
      gsap.set(paths, { drawSVG: '0%' });

      const run = () => {
        const parts = $$('.slogan__a, .slogan__b', slogan);
        const split = SplitText.create(parts, { type: 'lines', mask: 'lines', linesClass: 'sl-line', aria: 'none' });
        gsap.set(visual, { autoAlpha: 1 });
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.to(paths, { drawSVG: '100%', duration: 0.64, stagger: 0.08, ease: 'power2.inOut' }, 0)
          .from(split.lines, { yPercent: 108, duration: 0.9, stagger: 0.12 }, 0.12)
          .to('.cover__pitch', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.42)
          .to('.msearch', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.52)
          .to('.cover__mrz', { autoAlpha: 1, y: 0, duration: 0.6 }, 0.7)
          .add(() => renderMrz({ scramble: true }), 0.72)
          .to('.visa__page', { yPercent: 0, autoAlpha: 1, duration: 1.05, stagger: 0.09 }, 0.66);
        $$('.visa [data-stamp]').forEach((s, i) => tl.add(strike(s, { shake: s.closest('.visa__page') }), 1.3 + i * 0.14));
        tl.add(() => split.revert());
      };
      const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      let started = false;
      const start = () => { if (!started) { started = true; run(); } };
      fontsReady.then(start);
      window.setTimeout(start, 1400);
    }

    /* Repères frappés un par un. */
    function reperes() {
      let lastStrike = -1;
      $$('.repere').forEach((item) => {
        const stamp = $('[data-stamp]', item);
        stamp.dataset.rot = '-6';
        gsap.set(stamp, { autoAlpha: 0 });
        gsap.set($$('.repere__title, .repere__text', item), { autoAlpha: 0, y: 14 });
        ScrollTrigger.create({
          trigger: item,
          start: 'top 78%',
          once: true,
          onEnter: () => {
            const now = gsap.ticker.time;
            const delay = Math.max(0, lastStrike + 0.3 - now);
            lastStrike = now + delay;
            gsap.fromTo(stamp, { scale: 1.6, rotation: -14, autoAlpha: 0 }, { scale: 1, rotation: -6, autoAlpha: 0.92, duration: 0.22, delay, ease: 'power4.in' });
            gsap.to($('.reperes__sheet'), { keyframes: [{ y: 1.6, duration: 0.035, delay: delay + 0.22 }, { y: -0.8, duration: 0.05 }, { y: 0, duration: 0.08 }], ease: 'none' });
            gsap.to($$('.repere__title, .repere__text', item), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, delay: delay + 0.26, ease: 'expo.out' });
          }
        });
      });
    }

    /* Double page : les deux pages s’ouvrent depuis la reliure. */
    function spread() {
      const leaves = $$('.leaf');
      gsap.fromTo(leaves, {
        rotationY: (i) => (i ? -25 : 25),
        transformOrigin: (i) => (i ? '0% 50%' : '100% 50%')
      }, {
        rotationY: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.spread__book', start: 'top 82%', once: true }
      });
    }

    /* Album : les timbres sont posés par lots, puis se redressent. */
    function album() {
      gsap.set('.timbre:not([hidden])', { autoAlpha: 0, y: 34, rotation: (i, el) => Number(el.dataset.rot) * 2.2 });
      ScrollTrigger.batch('.timbre', {
        start: 'top 90%',
        once: true,
        interval: 0.08,
        batchMax: 4,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, overwrite: 'auto' })
      });
    }

    /* Rayons : la carte arrive, son tampon frappe dans le coin. */
    function rayons() {
      gsap.set('.rayon', { autoAlpha: 0, y: 40 });
      gsap.set('.rayon [data-stamp]', { autoAlpha: 0 });
      ScrollTrigger.batch('.rayon', {
        start: 'top 88%',
        once: true,
        interval: 0.1,
        batchMax: 4,
        onEnter: (els) => {
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 });
          els.forEach((el, i) => strike($('[data-stamp]', el), { delay: 0.45 + i * 0.1 }));
        }
      });
    }

    /* Certificats : le sceau frappe, les champs se remplissent. */
    let certTriggers = [];
    function certificates() {
      certTriggers.forEach((t) => t.kill());
      certTriggers = [];
      return $$('.cert').map((cert) => {
        const seal = $('[data-stamp]', cert);
        const fields = $$('[data-fill]', cert).map((dd) => ({ dd, text: dd.textContent }));
        gsap.set(seal, { autoAlpha: 0 });
        gsap.set(fields.map((f) => f.dd), { autoAlpha: 0 });
        let played = false;
        const play = () => {
          if (played) return;
          played = true;
          strike(seal, { shake: cert, delay: 0.1 });
          fields.forEach(({ dd, text }, i) => {
            dd.textContent = '';
            gsap.set(dd, { autoAlpha: 1, delay: 0.25 + i * 0.14 });
            gsap.to(dd, { duration: Math.min(1.1, 0.35 + text.length * 0.018), delay: 0.25 + i * 0.14, scrambleText: { text, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.8 }, ease: 'none' });
          });
        };
        certTriggers.push(ScrollTrigger.create({ trigger: cert, start: 'top 75%', once: true, onEnter: play }));
        return { cert, play };
      });
    }

    /* Après un changement de pays, les certificats sont reconstruits : on réarme puis on joue ceux déjà atteints. */
    function armCertificates() {
      if (!animate() || !window.ScrollTrigger) return;
      const items = certificates();
      ScrollTrigger.refresh();
      items.forEach(({ cert, play }) => { if (cert.getBoundingClientRect().top < window.innerHeight * 0.75) play(); });
    }

    /* Sceau holographique : réagit au pointeur et au défilement. */
    function hologram() {
      const holo = $('.seal__holo');
      const engrave = $('.seal__rosace');
      const spin = gsap.quickTo(holo, 'rotation', { duration: 0.9, ease: 'power3' });
      const tiltX = gsap.quickTo('.seal', 'rotationX', { duration: 0.8, ease: 'power3' });
      const tiltY = gsap.quickTo('.seal', 'rotationY', { duration: 0.8, ease: 'power3' });
      const section = $('.vendre');
      const onMove = (event) => {
        const r = $('.seal').getBoundingClientRect();
        const dx = (event.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (event.clientY - (r.top + r.height / 2)) / r.height;
        spin(Math.atan2(dy, dx) * (180 / Math.PI));
        tiltX(gsap.utils.clamp(-10, 10, -dy * 14));
        tiltY(gsap.utils.clamp(-10, 10, dx * 14));
      };
      const onLeave = () => { tiltX(0); tiltY(0); };
      section.addEventListener('pointermove', onMove);
      section.addEventListener('pointerleave', onLeave);
      gsap.fromTo(engrave, { rotation: -20 }, { rotation: 20, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      gsap.fromTo('.seal__hue', { rotation: 0 }, { rotation: 140, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      return () => {
        section.removeEventListener('pointermove', onMove);
        section.removeEventListener('pointerleave', onLeave);
      };
    }

    /* Quatrième de couverture : la rosace se dessine à l’arrivée. */
    function backcover() {
      const paths = $$('.backcover__rosace path');
      gsap.set(paths, { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.backcover',
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(paths, { drawSVG: '100%', duration: 1.1, stagger: 0.08, ease: 'power2.inOut' })
      });
    }

    function init() {
      if (!gsapReady()) {
        document.documentElement.classList.remove('motion-ok');
        return;
      }
      const plugins = [window.ScrollTrigger, window.SplitText, window.ScrambleTextPlugin, window.DrawSVGPlugin, window.Flip].filter(Boolean);
      gsap.registerPlugin(...plugins);
      const mm = gsap.matchMedia();
      mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 1000px)' }, (ctx) => {
        const { motion, wide } = ctx.conditions;
        if (!motion) return undefined;
        const cleanups = [];
        if (wide) cleanups.push(buildStage());
        intro();
        reperes();
        spread();
        album();
        rayons();
        certificates();
        cleanups.push(hologram());
        backcover();
        return () => cleanups.forEach((fn) => fn && fn());
      });
      const refresh = () => ScrollTrigger.refresh();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
      window.addEventListener('load', refresh, { once: true });
    }

    return { init, capture, afterFilter, afterDestination, stampAdded, armCertificates, poseLater };
  })();

  /* =====================================================================
     9. Démarrage
     ===================================================================== */

  function boot() {
    loadState();
    installPatterns();
    renderGenerated();
    renderDataText();
    renderDestinationMenu();
    updateDestinationLabels();
    renderShowcase();
    renderMrz();
    renderReperes();
    renderSpread();
    renderAlbum({ build: true });
    renderRayons();
    initPhotoFit();
    renderCertificates();
    renderVendorSeal();
    renderCredits();
    renderSommaire();
    updateCounters();
    initSearch();
    initDestination();
    initLanguage();
    initOffersActions();
    initSommaire();
    Cart.init();
    initFilters();
    initLinks();
    initHeaderObservers();
    $('#hsearch').toggleAttribute('inert', true);
    Motion.init();
  }

  boot();
})();
