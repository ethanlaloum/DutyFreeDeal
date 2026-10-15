/* Home sky: a gradient drawn in WebGL behind the dark chapters of the home page (hero, departments, large goods).
 * Several styles are on trial; a small "Background" bar on the home switches between them and remembers the choice.
 * Every style moves slowly by itself and answers the pointer, always eased over most of a second.
 * Without WebGL the CSS gradient of .sky stays; with reduced motion the gradient is a still image. */

const HEADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uHold;
uniform float uScroll;
uniform vec4 uCalm;
uniform float uBase;
uniform float uTop;

const vec3 CYAN = vec3(0.18, 0.77, 1.0);
const vec3 VIOLET = vec3(0.48, 0.36, 1.0);
const vec3 ROSE = vec3(1.0, 0.30, 0.43);
const vec3 AMBER = vec3(1.0, 0.62, 0.26);
const vec3 NIGHT = vec3(0.035, 0.035, 0.05);

vec2 hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p = mat2(1.6, -1.2, 1.2, 1.6) * p + 5.7;
    amp *= 0.5;
  }
  return sum;
}

/* Softens what lies behind the hero title and pitch, so the white text keeps its contrast (main() does the same under the header). */
float calm(vec2 p, float k) {
  vec2 e = vec2((p.x - uCalm.x) / uCalm.z, (p.y - uCalm.y - uScroll) / uCalm.w);
  return 1.0 - k * exp(-dot(e, e));
}

/* The brand hues across 0..1: cyan, violet, rose, amber. */
vec3 hues(float h) {
  h = clamp(h, 0.0, 1.0) * 3.0;
  vec3 c = mix(CYAN, VIOLET, smoothstep(0.0, 1.0, h));
  c = mix(c, ROSE, smoothstep(1.0, 2.0, h));
  return mix(c, AMBER, smoothstep(2.0, 3.0, h));
}
`;

const FOOTER = `
void main() {
  vec2 p = vec2((gl_FragCoord.x / uRes.x - 0.5) * uRes.x / uRes.y, gl_FragCoord.y / uRes.y - 0.5);
  vec3 col = shade(p);
  col *= 1.0 - 0.45 * smoothstep(uTop - 0.08, uTop + 0.01, p.y - uScroll);
  col += hash2(gl_FragCoord.xy + floor(fract(uTime) * 60.0)).x * 0.5 / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* Each style: a name for the trial bar, the resolution it is drawn at (soft fields need little) and its colour field. */
export const SKY_STYLES = [
  {
    id: 'mesh',
    name: 'Mesh',
    scale: 0.5,
    /* A flowing field of the four brand colours; the pointer stirs the paint around itself and drags it along. */
    glsl: `
vec3 shade(vec2 p) {
  float t = uTime * 0.045;
  vec2 m = p - uMouse;
  float r2 = dot(m, m);
  float a = uHold * 1.1 * exp(-r2 / 0.06);
  float ca = cos(a);
  float sa = sin(a);
  vec2 q = uMouse + mat2(ca, sa, -sa, ca) * m;
  q -= uVel * 0.05 * exp(-r2 / 0.05);
  q.y -= uScroll * 0.3;
  q += 0.45 * vec2(fbm(q * 0.8 + vec2(t, -0.7 * t)), fbm(q * 0.8 + vec2(-0.6 * t, t) + 3.7));
  vec3 col = vec3(0.16, 0.1, 0.42);
  col = mix(col, VIOLET, smoothstep(-0.3, 0.3, noise(q * 1.1 + vec2(1.3 * t, 0.0))));
  col = mix(col, CYAN, 0.9 * smoothstep(-0.05, 0.3, noise(q * 0.9 + vec2(-t, 0.5 * t) + 2.0)));
  col = mix(col, ROSE, 0.85 * smoothstep(0.06, 0.4, noise(q * 1.2 + vec2(0.7 * t, -t) + 5.3)));
  col = mix(col, AMBER, 0.8 * smoothstep(0.14, 0.42, noise(q + vec2(0.0, 0.9 * t) + 8.1)));
  float top = smoothstep(-0.6, 0.4, p.y + uScroll * 0.6);
  col = mix(vec3(0.05, 0.04, 0.12), col, mix(0.28, 0.92, top));
  return col * calm(p, 0.4);
}`
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    scale: 0.5,
    /* Night, and one large soft light that follows the pointer; its colour changes across the screen. */
    glsl: `
vec3 shade(vec2 p) {
  float hw = 0.5 * uRes.x / uRes.y;
  vec2 rest = vec2(0.3 * sin(uTime * 0.05), 0.3 + 0.04 * sin(uTime * 0.083));
  vec2 c = mix(rest, uMouse, uHold);
  float side = 0.5 + 0.5 * clamp(c.x / hw, -1.0, 1.0);
  vec2 d = (p - c) * vec2(0.85, 1.1);
  float r2 = dot(d, d);
  vec3 col = mix(vec3(0.03, 0.03, 0.05), vec3(0.07, 0.055, 0.15), smoothstep(-0.5, 0.5, p.y));
  col += hues(side) * (0.5 * exp(-r2 / 0.17) + 0.16 * exp(-r2 / 0.025));
  vec2 d2 = p - vec2(-0.75 * c.x, 0.46);
  col += hues(1.0 - side) * 0.16 * exp(-dot(d2, d2) / 0.22);
  return col * calm(p, 0.25);
}`
  },
  {
    id: 'prism',
    name: 'Prism',
    scale: 0.5,
    /* A wide ring of spectral light around the slogan, slowly turning; it brightens on the side of the pointer. */
    glsl: `
vec3 cyclic(float h) {
  h = fract(h) * 6.0;
  vec3 c = mix(CYAN, VIOLET, smoothstep(0.0, 1.0, h));
  c = mix(c, ROSE, smoothstep(1.0, 2.0, h));
  c = mix(c, AMBER, smoothstep(2.0, 3.0, h));
  c = mix(c, ROSE, smoothstep(3.0, 4.0, h));
  c = mix(c, VIOLET, smoothstep(4.0, 5.0, h));
  return mix(c, CYAN, smoothstep(5.0, 6.0, h));
}

vec3 shade(vec2 p) {
  vec2 c = vec2(uCalm.x, uCalm.y + uScroll - 0.06);
  c += (uMouse - c) * 0.07 * uHold;
  vec2 d = (p - c) * vec2(0.58, 1.18);
  float r = length(d);
  float ang = atan(d.y, d.x + 1e-4);
  vec2 dm = (uMouse - c) * vec2(0.58, 1.18);
  float facing = 0.5 + 0.5 * cos(ang - atan(dm.y, dm.x + 1e-4));
  float k = (r - 0.37) / 0.15;
  float ring = exp(-k * k);
  float wob = 0.06 * fbm(vec2(cos(ang), sin(ang)) * 1.5 + uTime * 0.05);
  vec3 hue = cyclic(ang / 6.2832 + uTime * 0.012 + wob);
  float lift = mix(1.0, 0.45 + 1.1 * facing * facing, uHold);
  vec3 col = mix(NIGHT, vec3(0.045, 0.04, 0.085), smoothstep(-0.5, 0.5, p.y));
  col += hue * ring * 0.6 * lift;
  col += hue * 0.07 * exp(-r * r / 0.4);
  return col;
}`
  },
  {
    id: 'horizon',
    name: 'Horizon',
    scale: 0.6,
    /* Dawn over a curved horizon under the search; the brightest point of the dawn follows the pointer. */
    glsl: `
vec3 shade(vec2 p) {
  float hy = uBase + 0.03 + uScroll * 0.55;
  float sx = mix(0.3 * sin(uTime * 0.04), uMouse.x, uHold);
  float R = 3.0;
  vec2 cc = vec2(0.06 * sx, hy - R);
  float dist = length(p - cc) - R;
  float dx = p.x - sx;
  float sun = exp(-dx * dx / 0.2);
  vec3 hue = mix(mix(VIOLET, CYAN, 0.35), mix(ROSE, AMBER, 0.4), sun);
  float up = max(dist, 0.0);
  vec3 col = mix(vec3(0.03, 0.03, 0.06), vec3(0.1, 0.07, 0.22), exp(-up / 0.45));
  col += hue * (0.16 + 0.55 * sun) * exp(-up / 0.11);
  col += hue * 0.25 * (0.3 + 0.7 * sun) * exp(-up / 0.03);
  if (dist < 0.0) col = mix(vec3(0.018, 0.018, 0.026), hue * 0.1, exp(dist / 0.06));
  col += mix(hue, vec3(1.0), 0.4) * (0.12 + 0.88 * sun) * exp(-dist * dist / 0.000025);
  return col * calm(p, 0.2);
}`
  },
  {
    id: 'velvet',
    name: 'Velvet',
    scale: 1,
    /* A deep diagonal dusk, indigo to rose to amber, with film grain; the light pool and the angle lean toward the pointer. */
    glsl: `
vec3 shade(vec2 p) {
  float hw = 0.5 * uRes.x / uRes.y;
  vec2 lean = (uMouse - vec2(0.0, 0.1)) * uHold;
  vec2 dir = normalize(vec2(1.0, -0.85) + lean * 0.35);
  vec2 q = p - vec2(0.0, uScroll * 0.2);
  float g = 0.5 + 0.5 * dot(q, dir) / (hw * abs(dir.x) + 0.5 * abs(dir.y));
  g += 0.1 * fbm(p * 1.3 + vec2(uTime * 0.012, -uTime * 0.008));
  vec3 col = mix(vec3(0.06, 0.045, 0.17), vec3(0.2, 0.09, 0.4), smoothstep(0.0, 0.42, g));
  col = mix(col, vec3(0.45, 0.1, 0.26), smoothstep(0.38, 0.74, g));
  col = mix(col, vec3(0.62, 0.3, 0.12), smoothstep(0.72, 1.05, g));
  vec2 d = p - mix(vec2(-0.35, 0.4), uMouse, uHold * 0.8);
  col *= (0.5 + 0.8 * exp(-dot(d, d) / 0.3)) * calm(p, 0.3);
  return col + hash2(gl_FragCoord.xy).x * 0.03;
}`
  },
  { id: 'black', name: 'Black', scale: 0, glsl: '' }
];

const KEY = 'dutyfreedeal-studio-sky';
const STILL = 42;
const UNIFORMS = ['uRes', 'uTime', 'uMouse', 'uVel', 'uHold', 'uScroll', 'uCalm', 'uBase', 'uTop'];

const born = performance.now();
const s = { mx: 0, my: 0.2, tx: 0, ty: 0.2, vx: 0, vy: 0, tvx: 0, tvy: 0, hold: 0, holdTo: 0, moved: 0 };
const layout = { calm: [0, 0.2, 0.6, 0.12], base: -0.15, top: 0.38 };
let engine = null;

function readStyle() {
  try {
    const id = localStorage.getItem(KEY);
    if (SKY_STYLES.some((style) => style.id === id)) return id;
  } catch { /* storage unavailable: the first style */ }
  return SKY_STYLES[0].id;
}

function saveStyle(id) {
  try { localStorage.setItem(KEY, id); } catch { /* the choice lasts for this visit only */ }
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) || gl.isContextLost()) return shader;
  console.error(gl.getShaderInfoLog(shader));
  return null;
}

function program(style) {
  const { gl, programs } = engine;
  if (programs.has(style.id)) return programs.get(style.id);
  const vs = compile(gl, gl.VERTEX_SHADER, 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }');
  const fs = compile(gl, gl.FRAGMENT_SHADER, HEADER + style.glsl + FOOTER);
  let entry = null;
  if (vs && fs) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'a');
    gl.linkProgram(prog);
    if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      entry = { prog, u: Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(prog, name)])) };
    } else console.error(gl.getProgramInfoLog(prog));
  }
  programs.set(style.id, entry);
  return entry;
}

function prepare(gl) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

/** The canvas, its context and compiled styles outlive a page render, so a change on the home does not restart the sky. */
function createEngine() {
  const canvas = document.createElement('canvas');
  canvas.className = 'sky-canvas';
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return null;
  prepare(gl);
  const e = { canvas, gl, programs: new Map(), lost: false, resume: null };
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    e.lost = true;
    canvas.classList.remove('is-on');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    e.programs.clear();
    prepare(gl);
    e.lost = false;
    e.resume?.();
  });
  return e;
}

function draw(style, time) {
  const { canvas, gl } = engine;
  const entry = program(style);
  if (!entry) {
    canvas.classList.remove('is-on');
    return;
  }
  const { prog, u } = entry;
  gl.useProgram(prog);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(u.uRes, canvas.width, canvas.height);
  gl.uniform1f(u.uTime, time % 10000);
  gl.uniform2f(u.uMouse, s.mx, s.my);
  gl.uniform2f(u.uVel, s.vx, s.vy);
  gl.uniform1f(u.uHold, s.hold);
  gl.uniform1f(u.uScroll, window.scrollY / window.innerHeight);
  gl.uniform4f(u.uCalm, ...layout.calm);
  gl.uniform1f(u.uBase, layout.base);
  gl.uniform1f(u.uTop, layout.top);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  canvas.classList.add('is-on');
}

function step(dt) {
  const ease = (tau) => 1 - Math.exp(-dt / tau);
  s.mx += (s.tx - s.mx) * ease(0.6);
  s.my += (s.ty - s.my) * ease(0.6);
  s.vx += (s.tvx - s.vx) * ease(0.3);
  s.vy += (s.tvy - s.vy) * ease(0.3);
  s.tvx *= Math.exp(-dt / 0.15);
  s.tvy *= Math.exp(-dt / 0.15);
  s.hold += (s.holdTo - s.hold) * ease(1);
}

/** Positions of the hero text, of the bottom of the hero and of the header, in sky units, as if the page were at the top. */
function measure() {
  const H = window.innerHeight;
  const title = document.querySelector('#main .hero h1');
  const pitch = document.querySelector('#main .hero-pitch');
  const hero = document.querySelector('#main .hero');
  if (!title || !hero) return;
  /* Tight bounds of the text itself: the lines are blocks as wide as the page. */
  const box = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let r = null;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const t = range.getBoundingClientRect();
      r = r ? { left: Math.min(r.left, t.left), right: Math.max(r.right, t.right), top: Math.min(r.top, t.top), bottom: Math.max(r.bottom, t.bottom) } : t;
    }
    return r || el.getBoundingClientRect();
  };
  const a = box(title);
  const b = pitch ? box(pitch) : a;
  const y = window.scrollY;
  const top = Math.min(a.top, b.top) + y;
  const bottom = Math.max(a.bottom, b.bottom) + y;
  const left = Math.min(a.left, b.left);
  const right = Math.max(a.right, b.right);
  layout.calm = [((left + right) / 2 - window.innerWidth / 2) / H, 0.5 - (top + bottom) / 2 / H, ((right - left) / 2 / H) * 1.1, ((bottom - top) / 2 / H) * 1.7];
  layout.base = 0.5 - (hero.getBoundingClientRect().bottom + y) / H;
  const header = document.querySelector('.site-header');
  if (header) layout.top = 0.5 - (header.getBoundingClientRect().bottom + y) / H;
}

/** Markup of the trial bar that switches between the styles. */
export function skySwitch() {
  const current = readStyle();
  return `<div class="sky-test" role="group" aria-label="Background trial" data-sky-test>
    <span class="sky-test-label" aria-hidden="true">Background</span>
    ${SKY_STYLES.map((style) => `<button type="button" data-sky-style="${style.id}" aria-pressed="${style.id === current}">${style.name}</button>`).join('')}
  </div>`;
}

/** Starts the sky inside `host` (the .sky layer of the home page), wires the trial bar, and returns the function that stops both. */
export function mountSky(host, bar) {
  if (!host) return () => {};
  let style = SKY_STYLES.find((item) => item.id === readStyle());
  host.dataset.style = style.id;
  if (!engine) engine = createEngine();
  const canvas = engine?.canvas;
  if (canvas) host.append(canvas);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const windows = new Set();
  let raf = 0;
  let last = 0;

  const live = () => Boolean(engine) && !engine.lost && style.scale > 0;
  const fit = () => {
    const w = Math.max(1, Math.round(window.innerWidth * style.scale));
    const h = Math.max(1, Math.round(window.innerHeight * style.scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    if (last && dt < 1 / 75) return;
    last = now;
    step(dt);
    draw(style, (now - born) / 1000);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };
  const resume = () => {
    if (!live()) {
      stop();
      return;
    }
    fit();
    if (reduce.matches) {
      stop();
      Object.assign(s, { hold: 0, holdTo: 0, vx: 0, vy: 0, tvx: 0, tvy: 0 });
      draw(style, STILL);
    } else if (!raf && windows.size) raf = requestAnimationFrame(tick);
  };
  if (engine) engine.resume = resume;

  const choose = (id) => {
    const next = SKY_STYLES.find((item) => item.id === id);
    if (!next || next === style) return;
    style = next;
    host.dataset.style = id;
    saveStyle(id);
    bar?.querySelectorAll('[data-sky-style]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.skyStyle === id)));
    stop();
    resume();
  };
  const onBar = (event) => {
    const button = event.target.closest('[data-sky-style]');
    if (button) choose(button.dataset.skyStyle);
  };

  const onMove = (event) => {
    if (event.pointerType === 'touch' || reduce.matches) return;
    const H = window.innerHeight;
    const x = (event.clientX - window.innerWidth / 2) / H;
    const y = 0.5 - event.clientY / H;
    const now = performance.now();
    if (s.hold < 0.05) {
      s.mx = x;
      s.my = y;
    } else if (s.moved) {
      const dt = Math.max(8, now - s.moved) / 1000;
      const k = Math.min(1, 3 / (Math.hypot(x - s.tx, y - s.ty) / dt || 1));
      s.tvx = ((x - s.tx) / dt) * k;
      s.tvy = ((y - s.ty) / dt) * k;
    }
    Object.assign(s, { tx: x, ty: y, holdTo: 1, moved: now });
  };
  const onLeave = () => Object.assign(s, { holdTo: 0, moved: 0 });
  const onResize = () => {
    measure();
    if (raf) fit();
    else resume();
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? windows.add(entry.target) : windows.delete(entry.target)));
    if (windows.size) resume();
    else stop();
  });
  document.querySelectorAll('#main .is-sky').forEach((el) => io.observe(el));

  measure();
  document.fonts?.ready.then(measure);
  bar?.addEventListener('click', onBar);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
  window.addEventListener('resize', onResize);
  reduce.addEventListener('change', resume);
  resume();

  return () => {
    stop();
    io.disconnect();
    bar?.removeEventListener('click', onBar);
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onLeave);
    window.removeEventListener('resize', onResize);
    reduce.removeEventListener('change', resume);
    if (engine) engine.resume = null;
    canvas?.remove();
  };
}
