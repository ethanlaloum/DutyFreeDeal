/* About this prototype, sources and licenses; not found and error pages. */
import { esc, icon } from '../core.js';
import { CREDITS } from '../credits.js';
import { pageHead, emptyState, table, demoTag } from '../ui/components.js';

function credits() {
  const photos = CREDITS.filter((c) => c.kind === 'real-photograph');
  const generated = CREDITS.filter((c) => c.kind !== 'real-photograph');
  const link = (href, text) => (href ? `<a class="table-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}${icon('external')}<span class="sr-only"> (opens in a new tab)</span></a>` : esc(text));
  const rows = (list) => list.map((c) => [
    `<span class="cell-main">${esc(c.label)}</span>`,
    esc(c.author),
    link(c.licenseUrl, c.license === 'Generated for this prototype' ? 'Generated for this prototype' : c.license),
    c.source ? link(c.source, 'Wikimedia Commons') : '<span class="muted">—</span>'
  ]);
  const html = `<div class="page wrap info-page">
    ${pageHead({
      crumbs: [['Home', '#/'], ['About this prototype', '']],
      title: 'About this prototype',
      lead: esc('DutyFreeDeal is a global consumer marketplace with two equal promises: advantageous prices, and access to products that are hard to find in your country.'),
      meta: demoTag('Demonstration prototype')
    })}
    <div class="info-grid">
      <section class="card" aria-labelledby="simulated-title" data-reveal>
        <h2 class="title-s" id="simulated-title">What is simulated</h2>
        <p>All products, sellers, prices, stock levels, delivery times, verifications and statuses are examples. France, Spain, the United States and Mexico illustrate browsing by delivery destination; they are not a confirmed list of launch countries. Prices are example amounts in euros for every market.</p>
        <p>No payment, identity document, bank detail or message is ever transmitted. Demonstration data is kept only in this browser, when its storage is available.</p>
      </section>
      <section class="card" aria-labelledby="open-title" data-reveal>
        <h2 class="title-s" id="open-title">What remains to be defined</h2>
        <p>The source of the price advantage, the commission and seller membership, country-specific seller checks, shipping commitments, customer support, returns and currencies are still open decisions. The prototype calculates no commission, fee or penalty, and makes no claim about taxes or customs.</p>
        <a class="more" href="#/admin/settings">See the open decisions${icon('arrow')}</a>
      </section>
    </div>
    <section class="section" aria-labelledby="credits-title">
      <div class="section-head"><div>
        <h2 class="title-m" id="credits-title" data-reveal>Sources and licenses</h2>
        <p class="lead" data-reveal>Real photographs from Wikimedia Commons, used as illustrations: the products, sellers and prices attached to them are fictional, and no photograph describes a real commercial reference. Products are cut out automatically with an Apple Vision subject mask, without other retouching, except the perfume bottle, whose glass was made translucent by hand. Cut-outs of photographs licensed CC BY-SA are shared under the same license.</p>
      </div></div>
      <div class="card" data-reveal>
        <h3 class="title-s">Photographs</h3>
        ${table(['Visual', 'Author', 'License', 'Source'], rows(photos), { caption: 'Photographs, authors, licenses and sources' })}
      </div>
      <div class="card" data-reveal>
        <h3 class="title-s">Generated illustrations</h3>
        ${table(['Visual', 'Author', 'License', 'Source'], rows(generated), { caption: 'Generated illustrations' })}
      </div>
      <p class="muted small info-fonts" data-reveal>Typeface: Switzer by the Indian Type Foundry, free license from Fontshare. Icons: Phosphor Icons, MIT License.</p>
    </section>
  </div>`;
  return { title: 'About this prototype · DutyFreeDeal', html };
}

function notFound() {
  return {
    title: 'Page not found · DutyFreeDeal',
    html: `<div class="page wrap">${pageHead({ title: 'This page does not exist' })}${emptyState({
      iconName: 'question',
      title: 'Nothing here',
      text: 'The address may be incomplete. Return to the home page or explore the departments.',
      actions: '<a class="btn btn--primary" href="#/">Back to home</a><a class="btn btn--secondary" href="#/categories">All departments</a>'
    })}</div>`
  };
}

function broken() {
  return {
    title: 'Page unavailable · DutyFreeDeal',
    html: `<div class="page wrap">${pageHead({ title: 'This page could not be displayed' })}${emptyState({
      iconName: 'warning',
      title: 'Something went wrong',
      text: 'This page of the prototype failed to load. Reload the page or return to the home page.',
      actions: '<a class="btn btn--primary" href="#/">Back to home</a>'
    })}</div>`
  };
}

export const views = { credits, notFound, broken };
