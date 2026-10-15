import { t, label, esc, icon, normalize, categories, visibleProducts, vendor, vendorName, countryName, money, go, findCategory } from './core.js';
import { announce } from './toast.js';

/* One shared draft for every search field, so typing is never lost during minor actions. */
export const drafts = { q: '' };

const catalogHash = q => `#/catalog${q ? `?q=${encodeURIComponent(q)}` : ''}`;

function highlight(text, q) {
  const source = String(text);
  const n = normalize(source);
  const i = q ? n.indexOf(q) : -1;
  if (i < 0) return esc(source);
  return `${esc(source.slice(0, i))}<mark>${esc(source.slice(i, i + q.length))}</mark>${esc(source.slice(i + q.length))}`;
}

/* Matches only the active language, so every suggestion visibly contains what was typed. */
function categoryMatches(q) {
  const found = [];
  const walk = (nodes, trail) => {
    for (const node of nodes) {
      const path = [...trail, node];
      const name = normalize(label(node.name));
      const words = name.split(/[\s,'’-]+/);
      if (name.includes(q)) found.push({ node, path, starts: words.some(w => w.startsWith(q)) });
      if (node.children) walk(node.children, path);
    }
  };
  walk(categories, []);
  return found
    .sort((a, b) => Number(b.starts) - Number(a.starts) || a.path.length - b.path.length)
    .slice(0, 3);
}

function offerMatches(q) {
  return visibleProducts()
    .map(p => {
      const v = vendor(p.vendorId);
      const name = normalize(label(p.name));
      const pathNames = (p.path || []).map(id => label(findCategory(id)?.node.name || ''));
      const hay = normalize([label(p.name), vendorName(v), countryName(v?.country), ...pathNames].join(' '));
      const score = name.startsWith(q) ? 3 : name.includes(q) ? 2 : hay.includes(q) ? 1 : 0;
      return { p, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .slice(0, 4)
    .map(m => m.p);
}

export function suggestions(raw) {
  const q = normalize(raw);
  if (!q) return [];
  const items = [];
  const cats = categoryMatches(q);
  if (cats.length) {
    items.push({ group: t('suggestCategories') });
    for (const c of cats) {
      const trail = c.path.slice(0, -1).map(n => label(n.name)).join(' › ');
      items.push({
        href: `#/catalog?category=${encodeURIComponent(c.node.id)}`,
        html: `${icon(c.path.length === 1 ? 'squares-four' : 'caret-right')}<span><span>${highlight(label(c.node.name), q)}</span>${trail ? `<br><span class="suggest-path">${esc(trail)}</span>` : ''}</span>`
      });
    }
  }
  const offers = offerMatches(q);
  if (offers.length) {
    items.push({ group: t('suggestOffers') });
    for (const p of offers) {
      items.push({
        href: `#/product/${encodeURIComponent(p.id)}`,
        html: `<img class="suggest-thumb" src="${esc(p.image)}" alt="" loading="lazy"><span><span>${highlight(label(p.name), q)}</span><br><span class="suggest-path">${esc(vendorName(vendor(p.vendorId)))}, ${esc(countryName(vendor(p.vendorId)?.country))}</span></span><span class="suggest-meta">${esc(money(p.price))}</span>`
      });
    }
  }
  items.push({ href: catalogHash(raw.trim()), html: `${icon('magnifying-glass')}<span>${esc(t('suggestAll', { q: raw.trim() }))}</span>`, all: true });
  return items;
}

/* ---------- Combobox behaviour ---------- */
const listFor = input => document.getElementById(input.getAttribute('aria-controls'));

export function closeSuggest(input) {
  const list = listFor(input);
  if (!list) return;
  list.hidden = true;
  list.innerHTML = '';
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
}

export function closeAllSuggest(except) {
  document.querySelectorAll('.search-input[aria-expanded="true"]').forEach(input => {
    if (input !== except) closeSuggest(input);
  });
}

export function openSuggest(input) {
  const list = listFor(input);
  if (!list) return;
  const items = suggestions(input.value);
  if (!items.length) {
    closeSuggest(input);
    return;
  }
  let index = 0;
  list.innerHTML = items
    .map(item => {
      if (item.group) return `<div class="suggest-group" role="presentation">${esc(item.group)}</div>`;
      const id = `${list.id}-opt-${index++}`;
      return `<div class="suggest-option ${item.all ? 'suggest-all' : ''}" role="option" id="${id}" aria-selected="false" data-href="${esc(item.href)}">${item.html}</div>`;
    })
    .join('');
  const field = input.closest('.search-field') || input;
  const room = window.innerHeight - field.getBoundingClientRect().bottom - 20;
  list.style.maxHeight = `${Math.max(220, Math.min(room, 520))}px`;
  list.hidden = false;
  input.setAttribute('aria-expanded', 'true');
  input.removeAttribute('aria-activedescendant');
  announce(t('suggestCount', { n: index }), { quiet: true });
}

function moveActive(input, step) {
  const list = listFor(input);
  if (!list || list.hidden) {
    openSuggest(input);
    return;
  }
  const options = [...list.querySelectorAll('[role="option"]')];
  if (!options.length) return;
  const current = options.findIndex(o => o.getAttribute('aria-selected') === 'true');
  const next = current === -1 ? (step > 0 ? 0 : options.length - 1) : (current + step + options.length) % options.length;
  options.forEach((o, i) => o.setAttribute('aria-selected', String(i === next)));
  input.setAttribute('aria-activedescendant', options[next].id);
  options[next].scrollIntoView({ block: 'nearest' });
}

export function syncDrafts(source) {
  drafts.q = source.value;
  document.querySelectorAll('.search-input').forEach(input => {
    if (input !== source && input.value !== source.value) input.value = source.value;
  });
  document.querySelectorAll('.search-clear').forEach(btn => {
    btn.hidden = !drafts.q;
  });
}

export function submitSearch(input) {
  const q = input.value.trim();
  closeSuggest(input);
  go(catalogHash(q));
}

export function onSearchKeydown(event) {
  const input = event.target;
  if (!input.classList?.contains('search-input')) return false;
  const list = listFor(input);
  const open = list && !list.hidden;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    moveActive(input, 1);
    return true;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    moveActive(input, -1);
    return true;
  }
  if (event.key === 'Enter') {
    const active = open && list.querySelector('[aria-selected="true"]');
    if (active) {
      event.preventDefault();
      closeSuggest(input);
      go(active.dataset.href);
      return true;
    }
    return false;
  }
  if (event.key === 'Escape' && open) {
    event.preventDefault();
    event.stopPropagation();
    closeSuggest(input);
    return true;
  }
  return false;
}

export function searchFieldHTML({ scope, placeholder, label: labelHTML, submitLabel, visibleLabel = false }) {
  const id = `q-${scope}`;
  return `<form class="search search--${scope}" role="search" data-search="${scope}" novalidate>
    <label class="${visibleLabel ? 'search-label' : 'sr-only'}" for="${id}">${labelHTML}</label>
    <div class="search-field">
      ${icon('magnifying-glass')}
      <input id="${id}" class="search-input" type="search" name="q" value="${esc(drafts.q)}" placeholder="${esc(placeholder)}" autocomplete="off" spellcheck="false" enterkeyhint="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list">
      <button type="button" class="search-clear" data-action="clear-search" aria-label="${esc(t('searchClear'))}" ${drafts.q ? '' : 'hidden'}>${icon('x')}</button>
      ${scope === 'cover'
        ? `<button class="btn btn--primary search-submit" type="submit">${esc(submitLabel)}</button>`
        : `<button class="search-submit" type="submit" aria-label="${esc(submitLabel)}">${icon('magnifying-glass')}</button>`}
    </div>
    <div class="suggest" id="${id}-list" role="listbox" aria-label="${esc(t('searchLabelHeader'))}" hidden></div>
  </form>`;
}

