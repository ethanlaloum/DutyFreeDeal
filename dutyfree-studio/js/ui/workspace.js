/* Layout of the seller workspace and of the back office: side navigation, page heading, content. */
import { esc, icon, route } from '../core.js';
import { pageHead, demoTag } from './components.js';

const LINKS = {
  seller: () => [
    ['/seller', 'Overview', 'chart'],
    ['/seller/inventory', 'My offers and stock', 'package'],
    ['/seller/orders', 'My shipments', 'truck'],
    ['/sell', 'Registration and verification', 'idCard']
  ],
  admin: () => [
    ['/admin', 'Overview', 'chart'],
    ['/admin/vendors', 'Sellers and verification', 'shield'],
    ['/admin/products', 'Offer moderation', 'package'],
    ['/admin/orders', 'Orders and shipments', 'receipt'],
    ['/admin/requests', 'Quotes and reservations', 'envelope'],
    ['/admin/settings', 'Open decisions', 'listChecks']
  ]
};

/**
 * Workspace page. `kind` is "seller" or "admin"; `aside` is extra content under the navigation
 * (for example the example seller account switcher); `body` is the page content.
 */
export function workspace({ kind, title, lead = '', actions = '', aside = '', body }) {
  const current = route().path;
  const admin = kind === 'admin';
  return `<div class="workspace wrap">
    <aside class="ws-side" aria-label="${esc(admin ? 'Back office' : 'Seller workspace')}">
      <div class="ws-brand">${demoTag('Demonstration mode')}<p class="ws-title">${esc(admin ? 'Back office' : 'Seller workspace')}</p></div>
      <nav class="ws-nav" aria-label="${esc(admin ? 'Back office navigation' : 'Seller workspace navigation')}">
        <ul role="list">${LINKS[kind]().map(([href, text, ic]) => `<li><a href="#${href}"${current === href ? ' aria-current="page"' : ''}>${icon(ic)}<span>${esc(text)}</span></a></li>`).join('')}</ul>
      </nav>
      ${aside}
      <a class="ws-back" href="#/">${icon('arrowLeft')}<span>${esc('Back to the shop')}</span></a>
    </aside>
    <div class="ws-main">
      ${pageHead({ eyebrow: esc('Local demonstration data'), title, lead, actions })}
      ${body}
    </div>
  </div>`;
}
