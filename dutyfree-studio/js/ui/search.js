/* Search fields with suggestions (departments, categories, offers), shared draft, keyboard combobox. */
import { label, esc, icon, normalize, categories, shopOffers, vendor, vendorName, countryName, money, productHref, catalogHref, go, plural } from '../core.js';
import { thumb } from './components.js';
import { announce } from './feedback.js';

/* One draft for every search field, so that typing is never lost during minor actions. */
export const drafts = { q: '' };

function highlight(text, q) {
  const source = String(text);
  const i = q ? normalize(source).indexOf(q) : -1;
  if (i < 0) return esc(source);
  return `${esc(source.slice(0, i))}<mark>${esc(source.slice(i, i + q.length))}</mark>${esc(source.slice(i + q.length))}`;
}

function categoryMatches(q) {
  const found = [];
  const walk = (nodes, trail) => {
    for (const node of nodes) {
      const path = [...trail, node];
      const name = normalize(label(node.name));
      if (name.includes(q)) found.push({ node, path, starts: name.split(/[\s,'’-]+/).some((w) => w.startsWith(q)) });
      if (node.children) walk(node.children, path);
    }
  };
  walk(categories, []);
  return found.sort((a, b) => Number(b.starts) - Number(a.starts) || a.path.length - b.path.length).slice(0, 3);
}

function offerMatches(q) {
  return shopOffers()
    .map((p) => {
      const v = vendor(p.vendorId);
      const name = normalize(label(p.name));
      const hay = normalize([label(p.name), vendorName(v), countryName(v.country)].join(' '));
      return { p, score: name.startsWith(q) ? 3 : name.includes(q) ? 2 : hay.includes(q) ? 1 : 0 };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .slice(0, 4)
    .map((m) => m.p);
}

function suggestions(raw) {
  const q = normalize(raw);
  if (!q) return [];
  const items = [];
  const cats = categoryMatches(q);
  if (cats.length) {
    items.push({ group: 'Departments and categories' });
    for (const c of cats) {
      const trail = c.path.slice(0, -1).map((n) => label(n.name)).join(' › ');
      items.push({ href: catalogHref({ category: c.node.id }), html: `${icon(c.path.length === 1 ? 'squares' : 'caretRight', 'suggest-icon')}<span><span>${highlight(label(c.node.name), q)}</span>${trail ? `<span class="suggest-sub">${esc(trail)}</span>` : ''}</span>` });
    }
  }
  const offers = offerMatches(q);
  if (offers.length) {
    items.push({ group: 'Offers' });
    for (const p of offers) {
      const v = vendor(p.vendorId);
      items.push({ href: productHref(p), html: `${thumb(p, 'thumb--s')}<span><span>${highlight(label(p.name), q)}</span><span class="suggest-sub">${esc(vendorName(v))}</span></span><span class="suggest-price">${esc(money(p.price))}</span>` });
    }
  }
  items.push({ href: catalogHref({ q: raw.trim() }), all: true, html: `${icon('search', 'suggest-icon')}<span>${esc(`See all results for “${raw.trim()}”`)}</span>` });
  return items;
}

/** Markup of a search field. `kind` is "hero" or "header". */
export function searchForm(kind, { labelText = '', placeholder = '', button = true } = {}) {
  const id = `q-${kind}`;
  return `<form class="search search--${kind}" role="search" data-search="${kind}" aria-label="${esc(kind === 'hero' ? 'Main search' : 'Search')}">
    ${labelText ? `<label class="search-label" for="${id}">${labelText}</label>` : `<label class="sr-only" for="${id}">${esc('Search for an offer, a department or a category')}</label>`}
    <div class="search-field">
      ${icon('search', 'search-icon')}
      <input class="search-input" id="${id}" name="q" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list"
        autocomplete="off" maxlength="150" placeholder="${esc(placeholder || 'Search')}" value="${esc(drafts.q)}" data-q>
      ${button ? `<button class="${kind === 'hero' ? 'btn btn--primary' : 'search-go'}" type="submit"${kind === 'hero' ? '' : ` aria-label="${esc('Search')}"`}>${kind === 'hero' ? esc('Search') : icon('arrow')}</button>` : ''}
    </div>
    <div class="suggest" id="${id}-list" role="listbox" aria-label="${esc('Suggestions')}" hidden></div>
  </form>`;
}

const listFor = (input) => document.getElementById(input.getAttribute('aria-controls'));

export function closeSuggest(input) {
  const list = listFor(input);
  if (!list) return;
  list.hidden = true;
  list.innerHTML = '';
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
}

export const closeAllSuggest = (except) => document.querySelectorAll('.search-input[aria-expanded="true"]').forEach((i) => { if (i !== except) closeSuggest(i); });

function openSuggest(input) {
  const list = listFor(input);
  if (!list) return;
  const items = suggestions(input.value);
  if (!items.length) {
    closeSuggest(input);
    return;
  }
  let index = 0;
  list.innerHTML = items.map((item) => {
    if (item.group) return `<div class="suggest-group" role="presentation">${esc(item.group)}</div>`;
    return `<div class="suggest-option${item.all ? ' suggest-all' : ''}" role="option" id="${list.id}-${index++}" aria-selected="false" data-href="${esc(item.href)}">${item.html}</div>`;
  }).join('');
  list.hidden = false;
  input.setAttribute('aria-expanded', 'true');
  input.removeAttribute('aria-activedescendant');
  announce(`${plural(index, 'suggestion', 'suggestions')}`);
}

function move(input, step) {
  const list = listFor(input);
  if (!list || list.hidden) {
    openSuggest(input);
    return;
  }
  const options = [...list.querySelectorAll('[role="option"]')];
  if (!options.length) return;
  const currentId = input.getAttribute('aria-activedescendant');
  let i = options.findIndex((o) => o.id === currentId);
  i = i < 0 ? (step > 0 ? 0 : options.length - 1) : (i + step + options.length) % options.length;
  options.forEach((o, j) => o.setAttribute('aria-selected', String(j === i)));
  input.setAttribute('aria-activedescendant', options[i].id);
  options[i].scrollIntoView({ block: 'nearest' });
}

/** Wires every search field once; fields re-rendered later are handled by delegation. */
export function bindSearch() {
  document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-q]');
    if (!input) return;
    drafts.q = input.value;
    document.querySelectorAll('[data-q]').forEach((other) => { if (other !== input) other.value = input.value; });
    openSuggest(input);
  });
  document.addEventListener('keydown', (event) => {
    const input = event.target.closest('[data-q]');
    if (!input) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(input, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Escape' && input.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      event.stopPropagation();
      closeSuggest(input);
    } else if (event.key === 'Enter') {
      const active = input.getAttribute('aria-activedescendant');
      if (active) {
        event.preventDefault();
        const option = document.getElementById(active);
        closeSuggest(input);
        if (option) go(option.dataset.href);
      }
    }
  });
  document.addEventListener('mousedown', (event) => {
    const option = event.target.closest('.suggest-option');
    if (option) {
      event.preventDefault();
      const input = option.closest('form')?.querySelector('[data-q]');
      if (input) closeSuggest(input);
      go(option.dataset.href);
      return;
    }
    if (!event.target.closest('.search')) closeAllSuggest();
  });
  document.addEventListener('focusout', (event) => {
    const input = event.target.closest?.('[data-q]');
    if (input && !input.closest('form').contains(event.relatedTarget)) setTimeout(() => closeSuggest(input), 120);
  });
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-search]');
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector('[data-q]');
    const q = input.value.trim();
    closeSuggest(input);
    if (!q) {
      input.focus();
      return;
    }
    drafts.q = q;
    go(catalogHref({ q }));
  });
}

export function syncDrafts() {
  document.querySelectorAll('[data-q]').forEach((input) => { if (input.value !== drafts.q) input.value = drafts.q; });
}

