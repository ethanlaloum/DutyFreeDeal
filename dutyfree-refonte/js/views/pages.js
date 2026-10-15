import { state, t, label, esc, icon, categories, product, vendor, vendorName, countryName, totalCategoryNodes } from '../core.js';
import { offerCard, emptyState } from '../components.js';
import { CREDITS } from '../credits.js';

const page = (inner, cls = '') => `<div class="container page ${cls}">${inner}</div>`;
const head = (title, lead = '') => `<div class="page-head"><h1 tabindex="-1">${esc(title)}</h1>${lead ? `<p class="page-lead">${lead}</p>` : ''}</div>`;

export function wishlistView() {
  const list = state.favorites.map(product).filter(Boolean);
  if (!list.length) {
    return page(`${head(t('wishlistTitle'))}${emptyState({
      iconName: 'heart',
      title: t('wishlistEmptyTitle'),
      text: esc(t('wishlistEmptyText')),
      actions: `<a class="btn btn--primary" href="#/catalog?collection=deals">${esc(t('deals'))}</a><a class="btn btn--secondary" href="#/catalog?collection=rare">${esc(t('rare'))}</a>`
    })}`);
  }
  return page(`${head(t('wishlistTitle'))}<div class="offer-grid">${list.map(offerCard).join('')}</div>`);
}

export function ordersView() {
  const requests = state.requests.map(r => ({ ...r, p: product(r.productId) })).filter(r => r.p);
  const requestsBlock = requests.length
    ? `<section class="requests" aria-labelledby="requests-title"><h2 id="requests-title">${esc(t('requestsTitle'))}</h2>
        <ul class="others-list" role="list">${requests.map(r => `<li class="others-row">
          <div><a class="others-name" href="#/product/${encodeURIComponent(r.p.id)}">${esc(label(r.p.name))}</a><p class="meta">${esc(vendorName(vendor(r.p.vendorId)))}, ${esc(r.kind === 'reservation' ? t('quoteTypeReservation') : t('quoteTypeQuote'))}, ${esc(countryName(r.country))}</p></div>
          <div class="meta tabular">${esc(r.id)}</div>
          <div class="meta">${esc(new Intl.DateTimeFormat(state.lang === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.createdAt)))}</div>
        </li>`).join('')}</ul>
        <p class="notice">${icon('info')}<span>${esc(t('quoteNotice'))}</span></p>
      </section>`
    : '';
  return page(`${head(t('ordersTitle'))}${emptyState({
    iconName: 'package',
    title: t('ordersEmptyTitle'),
    text: esc(t('ordersEmptyText')),
    actions: `<a class="btn btn--secondary" href="#/">${esc(t('backHome'))}</a>`
  })}${requestsBlock}`);
}

export function placeholderView(kind) {
  const map = {
    checkout: ['checkoutTitle', 'checkoutText'],
    sell: ['sellTitle', 'sellText'],
    seller: ['sellerSpaceTitle', 'sellerSpaceText'],
    admin: ['adminTitle', 'adminText']
  };
  const [title, text] = map[kind];
  return page(`${head(t(title))}<div class="placeholder">
      <span class="tag">${icon('clock')}${esc(t('nextStep'))}</span>
      <p>${esc(t(text))}</p>
      <a class="btn btn--primary" href="#/">${esc(t('backHome'))}</a>
    </div>`);
}

/* Provenance records stay verbatim in assets/CREDITS.json; only their display drops dash separators. */
const plain = text => String(text || '').replace(/\s*[\u2013\u2014]\s*/g, ', ');

export function creditsView() {
  const real = CREDITS.filter(c => c.kind === 'real-photograph');
  const generated = CREDITS.filter(c => c.kind !== 'real-photograph');
  const realRows = real.map(c => `<tr>
      <td><img src="./${esc(c.path)}" alt="" loading="lazy"></td>
      <td>${esc(plain(c.label))}</td>
      <td>${esc(c.author)}</td>
      <td>${c.license_url ? `<a href="${esc(c.license_url)}" rel="noopener" target="_blank">${esc(c.license)}</a>` : esc(c.license)}</td>
      <td><a href="${esc(c.source_page)}" rel="noopener" target="_blank">Wikimedia Commons${icon('arrow-up-right')}</a></td>
    </tr>`).join('');
  const genRows = generated.map(c => `<tr>
      <td><img src="./${esc(c.path)}" alt="" loading="lazy"></td>
      <td>${esc(plain(c.label))}</td>
      <td>${esc(c.author)}</td>
      <td>${esc(c.license)}</td>
      <td class="meta">${esc(plain(c.credit))}</td>
    </tr>`).join('');
  const headRow = last => `<tr><th scope="col"><span class="sr-only">${esc(t('creditsFile'))}</span></th><th scope="col">${esc(t('creditsFile'))}</th><th scope="col">${esc(t('creditsAuthor'))}</th><th scope="col">${esc(t('creditsLicence'))}</th><th scope="col">${esc(last)}</th></tr>`;
  return page(`${head(t('creditsTitle'), esc(t('creditsIntro')))}
    <section class="credits-block"><h2>${esc(t('creditsReal'))}</h2><div class="table-wrap"><table class="credits-table"><thead>${headRow(t('creditsSource'))}</thead><tbody>${realRows}</tbody></table></div></section>
    <section class="credits-block"><h2>${esc(t('creditsGenerated'))}</h2><div class="table-wrap"><table class="credits-table"><thead>${headRow(t('creditsSource'))}</thead><tbody>${genRows}</tbody></table></div></section>
    <section class="credits-block"><h2>${esc(t('creditsTools'))}</h2>
      <ul class="credits-tools" role="list">
        <li><strong>Archivo</strong>, Omnibus-Type, SIL Open Font License 1.1 (assets/fonts/ARCHIVO-OFL.txt)</li>
        <li><strong>Phosphor Icons</strong>, Helena Zhang et Tobias Fried, MIT License</li>
      </ul>
    </section>`, 'credits-page');
}

export function treeView() {
  const n = totalCategoryNodes() - categories.length;
  const link = node => `<a href="#/catalog?category=${encodeURIComponent(node.id)}">${esc(label(node.name))}</a>`;
  return page(`${head(t('treeTitle'), esc(t('treeText', { n })))}
    <div class="tree">${categories.map(c => `<section class="tree-dept">
      <h2>${link(c)}</h2>
      ${(c.children || []).map(ch => `<div class="tree-group"><h3>${link(ch)}</h3><ul role="list">${(ch.children || []).map(leaf => `<li>${link(leaf)}</li>`).join('')}</ul></div>`).join('')}
    </section>`).join('')}</div>`, 'tree-page');
}

export function notFoundView() {
  return page(`${head(t('notFoundTitle'), esc(t('notFoundText')))}<a class="btn btn--primary" href="#/">${esc(t('backHome'))}</a>`);
}
