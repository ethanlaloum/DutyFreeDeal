/* Seller pages: becoming a seller (public page), then the seller workspace: overview, offers and stock, shipments.
 * Every verification, status and figure is simulated from the demonstration data kept in this browser. */
import {
  state, save, label, esc, icon, plural, money, moneyRound, number, dateText, countries, countryName, countryIn, countryAt,
  sellerIn, categories, vendors, vendor, vendorName, vendorState, allProducts, product, isHidden, stock, isQuote, shipping,
  modelKey, cutout, productHref, catalogHref, department, sellerOffers, editOffer, createOffer, addApplication,
  applicationStatusLabel, applicationStatusTone, SHIPMENT_STEPS, shipmentLabel, advanceShipment
} from '../core.js';
import { offerImage, thumb, chip, demoTag, notice, emptyState, table, statCard, shipmentSteps } from '../ui/components.js';
import { workspace } from '../ui/workspace.js';
import { openPanel } from '../ui/header.js';
import { setDialogError } from '../ui/feedback.js';
import { revealNow, motionOK } from '../ui/motion.js';
import { BRANDED } from '../art.js';
import { CREDITS } from '../credits.js';

/* ---------- Shared helpers ---------- */

/* Captions of product images (CONTRACT section 4): the car and the house are generated illustrations, every other
 * model is a photograph; product, seller and price stay fictional either way. */
const GENERATED = new Set(CREDITS.filter((c) => c.kind === 'generated-illustration').map((c) => c.key));
const imageKind = (key) => (GENERATED.has(key) ? 'Generated illustration' : 'Illustrative photograph');

const currentVendor = () => vendor(state.selectedVendor) || vendors[0];
const DEMO_SUFFIX = /\s*·\s*Demo$/;
const shortName = (v) => vendorName(v).replace(DEMO_SUFFIX, '');
/** A seller's name inside a heading: the "· Demo" suffix stays, set as a soft qualifier. Escaped. */
const nameHtml = (v) => (DEMO_SUFFIX.test(vendorName(v)) ? `${esc(shortName(v))} <span class="sel-demo">${esc('· Demo')}</span>` : esc(vendorName(v)));
const typeText = (v) => (v.type === 'individual' ? 'Individual' : 'Business');
const checkText = (v) => (v.type === 'individual' ? 'KYC' : 'KYB');
const suspended = (v) => vendorState(v.id) === 'paused';
/**
 * Status of an example seller account: verified like an approved application (same words), unless suspended in the
 * back office. Tones follow the back office's seller accounts: a steady verified account stays neutral, a suspension
 * is flagged.
 */
const accountChip = (v) => (suspended(v) ? chip('Suspended · simulation', 'danger') : chip(applicationStatusLabel('verified'), 'neutral'));
const isCreated = (p) => state.extraProducts.some((x) => x.id === p.id);
const deptName = (p) => label(department(p.category)?.name);
const journey = (p) => (isQuote(p) ? 'Quote or reservation' : 'Direct purchase');
const priceText = (p) => (isQuote(p) ? moneyRound(p.price) : money(p.price));
/** "France", "France and Spain", "France, Spain and Mexico". */
const andList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] || '');
/** "1 example unit", "1,250 example units": the number formatted, joined with a no-break space like plural(). */
const count = (n, one, many) => `${number(n)}\u00a0${n === 1 ? one : many}`;

/* Large goods (cars, prefabricated houses) go through a quote or reservation request: no payment, no delivery fee. */
const QUOTE_PRICE_HELP = 'No delivery fee: transport and timing are set in the quotation.';
/** Models sold as large goods in the catalog (the car, the house): an offer illustrated by one of them is a quote offer. */
const largeModels = () => new Set(allProducts().filter((p) => !isCreated(p) && isQuote(p)).map(modelKey));

/** Offers of a seller: the ones created in this browser first (newest first), then the catalog ones. */
const offersOf = (v) => {
  const list = sellerOffers(v.id);
  return [...list.filter(isCreated).reverse(), ...list.filter((p) => !isCreated(p))];
};

/** Every order containing a shipment of this seller, most recent first. */
const shipmentsOf = (vendorId) => state.orders
  .map((o) => ({ o, s: (o.shipments || []).find((x) => x.vendorId === vendorId) }))
  .filter((x) => x.s)
  .sort((a, b) => String(b.o.date).localeCompare(String(a.o.date)));

const NEXT = { pending: 'preparing', preparing: 'shipped', shipped: 'delivered' };
/* Same tones as the buyer's My orders and the back office. */
const TONE = { pending: 'neutral', preparing: 'info', shipped: 'info', delivered: 'success' };

/** Blocks of the page that are on screen, to replay their entrance after an in-place change. */
function revealVisible(main, selector = '[data-reveal]') {
  revealNow([...main.querySelectorAll(selector)].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }));
}

/** Text input with a visible label; validation is ours, so `required` is expressed with aria-required. */
function textInput({ id, name, text, value = '', mode = '', type = 'text', help = '', full = false }) {
  const describe = [help ? `${id}-help` : '', `${id}-error`].filter(Boolean).join(' ');
  return `<div class="field${full ? ' field--full' : ''}">
    <label for="${id}"><span data-sel-label>${esc(text)}</span> <span aria-hidden="true">*</span></label>
    <input class="input" id="${id}" name="${name}" type="${type}" value="${esc(value)}"${mode ? ` inputmode="${mode}"` : ''} autocomplete="off" spellcheck="false" aria-required="true" aria-describedby="${describe}">
    ${help ? `<p class="help" id="${id}-help">${esc(help)}</p>` : ''}
    <p class="sel-error" id="${id}-error" hidden></p>
  </div>`;
}

/** Shows or clears the inline error of a field (text, icon and aria-invalid; never color alone). */
function setFieldError(root, id, message = '') {
  if (!id) return;
  const input = root.querySelector(`#${id}`);
  const box = root.querySelector(`#${id}-error`);
  if (input) {
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
  if (box) {
    box.hidden = !message;
    box.innerHTML = message ? `${icon('warning')}<span>${esc(message)}</span>` : '';
  }
}

/** Short name of a checked control in an error summary: its visible label, or `data-sel-name` (a long checkbox label). */
const fieldName = (root, el) => {
  const text = root.querySelector(`label[for="${el.id}"] [data-sel-label]`) || root.querySelector(`label[for="${el.id}"]`);
  return el.dataset.selName || text?.textContent.replace(/\*\s*$/, '').trim() || '';
};

/**
 * One wording for the error summary of every seller form, listing the fields that are still flagged:
 * "Check this field: Offer name." or "Check 2 fields: Product price in euros and Units in stock." ('' when none).
 */
function summaryOf(root) {
  const names = [...root.querySelectorAll('[aria-invalid="true"]')].map((el) => fieldName(root, el)).filter(Boolean);
  if (!names.length) return '';
  return names.length === 1 ? `Check this field: ${names[0]}.` : `Check ${names.length} fields: ${andList(names)}.`;
}

/**
 * Checks of a form, as [field id, error message or false]: every error is shown next to its field,
 * the first invalid field takes the focus, and the summary for the dialog's alert is returned ('' when valid).
 */
function reportErrors(form, checks) {
  checks.forEach(([id, message]) => setFieldError(form, id, message || ''));
  const first = checks.find(([, message]) => message);
  if (!first) return '';
  form.querySelector(`#${first[0]}`)?.focus();
  return summaryOf(form) || 'Check the flagged fields.';
}

/** Amount typed in euros: "129", "129.90", "1,299.00". Returns null when it is not a positive amount. */
function parsePrice(raw) {
  let s = String(raw || '').replace(/[€\s ]/g, '');
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Math.round(Number(s) * 100) / 100;
  return n > 0 && n <= 1000000 ? n : null;
}

/** Whole number of units from 0 to 100,000, or null. */
function parseUnits(raw) {
  const s = String(raw || '').replace(/[\s, ]/g, '');
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n <= 100000 ? n : null;
}

/* ---------- Become a vendor (public page) ---------- */

let submitted = null;

const VERIFY = {
  individual: {
    kicker: 'KYC verification · individual',
    title: (c) => `Selling as an individual ${countryAt(c)}`,
    lead: 'KYC, “know your customer”, confirms who is selling before any offer goes live.',
    covers: ['The identity of the person who sells'],
    open: []
  },
  business: {
    kicker: 'KYB verification · business',
    title: (c) => `Selling as a business ${countryAt(c)}`,
    lead: 'KYB, “know your business”, confirms which business is selling before any offer goes live.',
    covers: ['The business that sells', 'Its representatives and owners'],
    open: []
  }
};

const NAME_LABEL = { individual: 'Fictional name', business: 'Fictional business name' };
const NAME_ERROR = { individual: 'Enter a fictional name.', business: 'Enter a fictional business name.' };

const EXAMPLES = {
  individual: { FR: ['Claire Example', 'claire@example.com'], ES: ['Lucia Example', 'lucia@example.com'], US: ['Jordan Example', 'jordan@example.com'], MX: ['Mateo Example', 'mateo@example.com'] },
  business: { FR: ['Example Workshop', 'contact@example.com'], ES: ['Example Trading', 'hello@example.com'], US: ['Example Goods Co.', 'sales@example.com'], MX: ['Example Imports', 'shop@example.com'] }
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function infoHtml(type, country) {
  const t = VERIFY[type] || VERIFY.individual;
  return `<p class="sel-info-kicker">${icon('shield')}<span>${esc(t.kicker)}</span></p>
    <h3 class="title-s sel-info-title">${esc(t.title(country))}</h3>
    <p class="sel-info-lead">${esc(t.lead)}</p>
    <h4 class="sel-info-h">${esc('What it covers')}</h4>
    <ul class="sel-info-list" role="list">
      ${t.covers.map((c) => `<li>${icon('check')}<span>${esc(c)}</span></li>`).join('')}
      ${t.open.map((c) => `<li class="is-open">${icon('idCard')}<span>${esc(c)}</span></li>`).join('')}
      <li>${icon('check')}<span>${esc('The bank account that receives the payouts')}</span></li>
    </ul>
    <h4 class="sel-info-h">${esc(`For a seller ${countryAt(country)}`)}</h4>
    <p class="sel-info-text">${esc('Documents, enhanced checks and verification times follow the rules of the seller’s country, applied by the payment provider.')}</p>
    <div class="sel-info-foot">
      <p class="sel-info-lock">${icon('lock')}<span>${esc('No identity document, bank number or company document is requested.')}</span></p>
      <p class="sel-info-sim">${demoTag('Simulated')}<span>${esc('Nothing is checked or sent in this prototype.')}</span></p>
    </div>`;
}

/** The example listing of the hero: one offer, its price, and its seller's delivery fee for each destination. */
function listingCard() {
  const p = ['leather-boots-costa', 'moka-pot-costa', 'mechanical-keyboard-costa'].map(product).find((x) => x && cutout(modelKey(x)))
    || allProducts().find((x) => x.mode === 'purchase' && cutout(modelKey(x)));
  if (!p) return '';
  const v = vendor(p.vendorId);
  const rows = countries.map((c) => {
    const on = v.deliveryTo.includes(c.code);
    return `<li${on ? '' : ' class="is-off"'}><span>${esc(label(c.name))}${c.code === v.country ? `<small>${esc('Seller country')}</small>` : ''}</span>`
      + `<span class="sel-num">${esc(on ? `+ ${money(shipping(v.id, c.code))}` : 'Not delivered')}</span></li>`;
  }).join('');
  return `<figure class="sel-listing" data-enter>
    <div class="offer-media sel-listing-media" data-cut>${offerImage(p, { sizes: '(max-width: 900px) 70vw, 400px', lazy: false, priority: true })}</div>
    <div class="sel-listing-body">
      <div class="sel-listing-top">
        <div><p class="sel-listing-name">${esc(label(p.name))}</p><p class="sel-listing-seller">${esc(`${sellerIn(v.country)} · ${vendorName(v)}`)}</p></div>
        <p class="price sel-listing-price">${esc(money(p.price))}</p>
      </div>
      <p class="sel-listing-label">${esc('Delivery, shipped by the seller')}</p>
      <ul class="sel-listing-dest" role="list">${rows}</ul>
    </div>
    <figcaption class="sel-listing-note">${esc(`${imageKind(modelKey(p))} · fictional product, seller, price and delivery fees`)}</figcaption>
  </figure>`;
}

function hero() {
  return `<section class="sel-hero surface-dark" aria-labelledby="sel-title">
    <div class="wrap sel-hero-grid">
      <div class="sel-hero-copy">
        <h1 class="display sel-hero-title" id="sel-title" tabindex="-1" data-enter><span class="sel-line">${esc('Sell beyond your country.')}</span> <span class="sel-line sel-line--soft">${esc('Become a vendor')}</span></h1>
        <p class="sel-hero-lead" data-enter>${esc('For individuals and businesses: list your new products for buyers in other countries, after a verification adapted to your country. You keep your stock and ship your own orders.')}</p>
        <div class="sel-hero-actions" data-enter>
          <a class="btn btn--primary" href="#sel-apply">${esc('Start an example application')}</a>
          <a class="btn btn--secondary" href="#/seller">${esc('Open the seller workspace')}</a>
        </div>
        <p class="sel-hero-note" data-enter>${icon('info')}<span>${esc('Verification and approval are simulated in this prototype.')}</span></p>
      </div>
      ${listingCard()}
    </div>
  </section>`;
}

/* Each step reads as one run-in sentence, like the facts of the home page. */
const STEPS = [
  ['Seller profile.', 'You sell as an individual or as a business, from your seller country.'],
  ['KYC or KYB verification.', 'Your identity for an individual, your business for a company, and the bank account that receives your payouts.'],
  ['Approval.', 'A simulated approval in the back office. Then you publish your offers, manage your stock and ship your orders.']
];

function steps() {
  return `<section class="sel-steps surface-light" aria-labelledby="sel-steps-title">
    <div class="wrap">
      <div class="section-head section-head--split sel-steps-head">
        <h2 class="title-xl" id="sel-steps-title" data-reveal>${esc('Verified first.')} <span class="soft">${esc('Then you sell.')}</span></h2>
        <p class="lead" data-reveal>${esc('Every seller is verified before listing anything, with checks adapted to the seller’s country. Each step is simulated in this prototype.')}</p>
      </div>
      <ol class="sel-step-list" role="list">
        ${STEPS.map(([title, text], i) => `<li class="sel-step" data-reveal>
          <span class="sel-step-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="sel-step-title"><span class="sr-only">${esc(`Step ${i + 1}: `)}</span>${esc(title)}</h3> <p>${esc(text)}</p>
        </li>`).join('')}
      </ol>
    </div>
  </section>`;
}

function applicationForm() {
  const country = state.country;
  return `<form class="card surface-light sel-form" data-form="onboarding" novalidate aria-labelledby="sel-apply" data-reveal>
    <fieldset class="sel-fieldset">
      <legend class="sel-legend">${esc('You sell as')}</legend>
      <div class="sel-choices">
        ${[['individual', 'user', 'Individual', 'KYC · identity verification'], ['business', 'buildings', 'Business', 'KYB · business verification']].map(([value, ic, title, sub], i) => `<label class="sel-choice">
          <input type="radio" name="type" value="${value}"${i === 0 ? ' checked' : ''}>
          <span class="sel-choice-icon" aria-hidden="true">${icon(ic)}</span>
          <span class="sel-choice-text"><strong>${esc(title)}</strong><span>${esc(sub)}</span></span>
          <span class="sel-choice-mark" aria-hidden="true">${icon('check')}</span>
        </label>`).join('')}
      </div>
    </fieldset>
    <fieldset class="sel-fieldset" aria-describedby="sel-country-help">
      <legend class="sel-legend">${esc('Seller country')}</legend>
      <div class="sel-pills">
        ${countries.map((c) => `<label class="sel-pill"><input type="radio" name="country" value="${esc(c.code)}"${c.code === country ? ' checked' : ''}><span>${esc(label(c.name))}</span></label>`).join('')}
      </div>
      <p class="help sel-fieldset-help" id="sel-country-help">${esc('The country you sell and ship from sets the verification rules. These four are examples: the platform will accept sellers from every country.')}</p>
    </fieldset>
    <div class="form-grid">
      ${textInput({ id: 'sel-name', name: 'sellerName', text: NAME_LABEL.individual })}
      ${textInput({ id: 'sel-email', name: 'sellerEmail', text: 'Fictional email', type: 'email', help: 'An example address, such as name@example.com.' })}
    </div>
    <div class="sel-consent">
      <label class="check"><input type="checkbox" name="fictional" id="sel-fictional" aria-required="true" aria-describedby="sel-fictional-error" data-sel-name="${esc('Fictional details')}"><span>${esc('I am using fictional details to simulate this application')} <span aria-hidden="true">*</span></span></label>
      <p class="sel-error" id="sel-fictional-error" hidden></p>
    </div>
    <p class="form-error sel-form-error" hidden data-sel-summary></p>
    <div class="sel-form-actions">
      <button class="btn btn--quiet" type="button" data-sel-fill>${icon('pencil')}${esc('Fill in an example')}</button>
      <button class="btn btn--primary" type="submit">${esc('Submit the example application')}</button>
    </div>
  </form>`;
}

function confirmation(a) {
  const kyc = a.type === 'business' ? 'Business · KYB' : 'Individual · KYC';
  return `<div class="card surface-light sel-done" data-reveal data-sel-done>
    <div class="sel-done-head">${chip(applicationStatusLabel(a.status), applicationStatusTone(a.status))}</div>
    <h3 class="title-m sel-done-title" id="sel-done-title" tabindex="-1">${esc(`Application saved for ${a.name}`)}</h3>
    <p class="sel-done-text">${esc('It now waits in the back office, where you can simulate its approval. Nothing was sent: no message, no document.')}</p>
    <dl class="sel-dl">
      <div><dt>${esc('Reference')}</dt><dd>${esc(a.id)}</dd></div>
      <div><dt>${esc('You sell as')}</dt><dd>${esc(kyc)}</dd></div>
      <div><dt>${esc('Seller country')}</dt><dd>${esc(countryName(a.country))}</dd></div>
      <div><dt>${esc('Fictional email')}</dt><dd>${esc(a.email)}</dd></div>
      <div><dt>${esc('Date')}</dt><dd>${esc(dateText(a.date))}</dd></div>
    </dl>
    <div class="sel-done-actions">
      <a class="btn btn--primary" href="#/admin/vendors">${esc('Open the back office')}</a>
      <a class="btn btn--secondary" href="#/seller">${esc('Open the seller workspace')}</a>
      <button class="btn btn--quiet" type="button" data-sel-again>${esc('Start another application')}</button>
    </div>
    <p class="sel-done-foot">${esc('The seller workspace runs on example seller accounts.')}</p>
  </div>`;
}

function application() {
  /* The saved application as the back office sees it (its status included). */
  const a = submitted ? state.applications.find((x) => x.id === submitted.id) || null : null;
  const others = state.applications.length - (a ? 1 : 0);
  return `<section class="sel-apply surface-studio" aria-labelledby="sel-apply">
    <div class="wrap">
      <div class="section-head">
        <div>
          <h2 class="title-xl" id="sel-apply" data-reveal>${esc('Your application,')} <span class="soft">${esc('with fictional details.')}</span></h2>
          <p class="lead" data-reveal>${esc('It stays in this browser and appears in the back office, where its approval is simulated.')}</p>
        </div>
      </div>
      <div class="sel-apply-grid">
        <div class="sel-apply-main">${a ? confirmation(a) : applicationForm()}</div>
        <aside class="sel-apply-aside" aria-label="${esc('About the verification')}">
          <div class="card surface-light sel-info" data-reveal data-sel-info>${infoHtml(a ? a.type : 'individual', a ? a.country : state.country)}</div>
          ${others > 0 ? `<p class="sel-prior" data-reveal>${esc(`${others === 1 ? 'One other simulated application is' : `${others} other simulated applications are`} saved in this browser.`)} <a href="#/admin/vendors">${esc(others === 1 ? 'See it in the back office' : 'See them in the back office')}</a></p>` : ''}
        </aside>
      </div>
    </div>
  </section>`;
}

function sell(ctx) {
  if (ctx.reason === 'route') submitted = null;
  return {
    title: 'Become a vendor · DutyFreeDeal',
    surface: 'light',
    html: hero() + steps() + application(),
    mount: (main) => mountSell(main, ctx)
  };
}

function readApplication(form) {
  const type = form.querySelector('input[name="type"]:checked')?.value === 'business' ? 'business' : 'individual';
  const picked = form.querySelector('input[name="country"]:checked')?.value;
  return {
    type,
    country: countries.some((c) => c.code === picked) ? picked : state.country,
    name: form.querySelector('[name="sellerName"]').value.trim().replace(/\s+/g, ' '),
    email: form.querySelector('[name="sellerEmail"]').value.trim(),
    fictional: form.querySelector('[name="fictional"]').checked
  };
}

function mountSell(main, ctx) {
  const form = main.querySelector('form[data-form="onboarding"]');
  const info = main.querySelector('[data-sel-info]');
  const summary = () => form?.querySelector('[data-sel-summary]');

  /**
   * The error summary lists the fields that are still invalid. It is an alert only when the form is submitted;
   * while the user corrects the fields it updates silently, so typing is not interrupted.
   */
  const refreshSummary = (announceIt = false) => {
    const box = summary();
    const text = summaryOf(form);
    if (announceIt) box.setAttribute('role', 'alert');
    else box.removeAttribute('role');
    box.hidden = !text;
    box.textContent = text;
  };

  let shown = '';
  const sync = (announceIt) => {
    if (!form) return;
    const { type, country } = readApplication(form);
    const key = `${type}:${country}`;
    if (key === shown) return;
    shown = key;
    info.innerHTML = infoHtml(type, country);
    form.querySelector('label[for="sel-name"] [data-sel-label]').textContent = NAME_LABEL[type];
    if (form.querySelector('#sel-name[aria-invalid="true"]')) {
      setFieldError(form, 'sel-name', NAME_ERROR[type]);
      refreshSummary();
    }
    if (announceIt) ctx.announce(`${VERIFY[type].kicker}. ${VERIFY[type].title(country)}.`);
  };

  const onInput = (event) => {
    const t = event.target;
    if (t.name === 'type' || t.name === 'country') sync(true);
    if (t.id && t.getAttribute('aria-invalid') === 'true' && (t.type === 'checkbox' ? t.checked : t.value.trim())) {
      setFieldError(form, t.id);
      refreshSummary();
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const data = readApplication(form);
    const errors = [];
    if (data.name.length < 2) errors.push(['sel-name', NAME_ERROR[data.type]]);
    if (!data.email) errors.push(['sel-email', 'Enter a fictional email address.']);
    else if (!EMAIL.test(data.email)) errors.push(['sel-email', 'Enter an email address in the format name@example.com.']);
    if (!data.fictional) errors.push(['sel-fictional', 'Confirm that you are using fictional details.']);
    ['sel-name', 'sel-email', 'sel-fictional'].forEach((id) => setFieldError(form, id, errors.find((e) => e[0] === id)?.[1] || ''));
    refreshSummary(true);
    if (errors.length) {
      form.querySelector(`#${errors[0][0]}`).focus();
      return;
    }
    submitted = addApplication({ type: data.type, country: data.country, name: data.name, email: data.email });
    ctx.toast('Example application saved · simulation');
    ctx.rerender().then(() => {
      const card = main.querySelector('[data-sel-done]');
      const title = main.querySelector('#sel-done-title');
      if (!card || !title) return;
      const top = card.getBoundingClientRect().top;
      if (top < 84 || top > window.innerHeight * 0.6) card.scrollIntoView({ block: 'start', behavior: motionOK() ? 'smooth' : 'auto' });
      title.focus({ preventScroll: true });
      revealNow([card]);
    });
  };

  const onClick = (event) => {
    if (event.target.closest('[data-sel-again]')) {
      submitted = null;
      ctx.rerender().then(() => {
        const field = main.querySelector('form[data-form="onboarding"] input[name="type"]:checked');
        field?.focus({ preventScroll: true });
        field?.closest('form')?.scrollIntoView({ block: 'start', behavior: motionOK() ? 'smooth' : 'auto' });
      });
      return;
    }
    if (form && event.target.closest('[data-sel-fill]')) {
      const { type, country } = readApplication(form);
      const [name, email] = EXAMPLES[type][country] || EXAMPLES[type].FR;
      form.querySelector('[name="sellerName"]').value = name;
      form.querySelector('[name="sellerEmail"]').value = email;
      setFieldError(form, 'sel-name');
      setFieldError(form, 'sel-email');
      if (!summary().hidden) refreshSummary();
      ctx.announce(`Example details filled in: ${name}, ${email}.`);
    }
  };

  main.addEventListener('click', onClick);
  if (form) {
    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    form.addEventListener('submit', onSubmit);
    sync(false);
  }
  return () => {
    main.removeEventListener('click', onClick);
    if (form) {
      form.removeEventListener('input', onInput);
      form.removeEventListener('change', onInput);
      form.removeEventListener('submit', onSubmit);
    }
  };
}

/* ---------- Seller workspace: layout, example account switcher ---------- */

function accountSwitcher(v) {
  const groups = countries.map((c) => {
    const list = vendors.filter((x) => x.country === c.code);
    return list.length ? `<optgroup label="${esc(sellerIn(c.code))}">${list.map((x) => `<option value="${esc(x.id)}"${x.id === v.id ? ' selected' : ''}>${esc(vendorName(x))}</option>`).join('')}</optgroup>` : '';
  }).join('');
  return `<div class="sel-account">
    <label class="sel-account-label" for="sel-account">${esc('Example seller account')}</label>
    <select class="select" id="sel-account" aria-describedby="sel-account-desc">${groups}</select>
    <p class="sel-account-desc" id="sel-account-desc"><span>${esc(sellerIn(v.country))}</span><span>${esc(`${typeText(v)} · ${checkText(v)} verification, simulated`)}</span></p>
    ${suspended(v) ? accountChip(v) : ''}
  </div>`;
}

/**
 * A page of the seller workspace. `title` is HTML (escaped by the caller). `rescue(main)` names the control to focus
 * when an in-place update removed the focused one (for example after a change of delivery country).
 */
function workspacePage(ctx, { name, title, lead, actions = '', body, mount, rescue = () => null }) {
  const v = currentVendor();
  return {
    title: `${name} · DutyFreeDeal`,
    surface: 'studio',
    html: workspace({ kind: 'seller', title, lead: esc(lead), actions, aside: accountSwitcher(v), body }),
    mount(main) {
      const onChange = (event) => {
        if (event.target.id !== 'sel-account') return;
        const next = vendor(event.target.value);
        if (!next || next.id === state.selectedVendor) return;
        state.selectedVendor = next.id;
        save();
        ctx.announce(`Example seller account: ${vendorName(next)}.`);
        ctx.rerender().then(() => revealVisible(main, '.ws-main [data-reveal]'));
      };
      main.addEventListener('change', onChange);
      const more = mount ? mount(main) : null;
      const frame = ctx.reason === 'state' ? requestAnimationFrame(() => {
        const at = document.activeElement;
        if ((at && at !== document.body) || document.querySelector('.dialog-backdrop')) return;
        (rescue(main) || main.querySelector('h1'))?.focus({ preventScroll: true });
      }) : 0;
      return () => {
        cancelAnimationFrame(frame);
        main.removeEventListener('change', onChange);
        if (more) more();
      };
    }
  };
}

/* ---------- Dashboard ---------- */

/* Four of the open decisions, numbered as in the back office's list. */
const RULES = [
  ['02', 'Commission', 'What does “15% net of the global price” cover, product only or with delivery, and who pays the payment fees?'],
  ['03', 'Seller membership', 'Is it mandatory, what does it cost, when is it paid, and does it differ for individuals and businesses?'],
  ['04', 'Late shipping penalty', 'A late shipment already lets the buyer cancel free of charge. Is a financial penalty added, and how much?'],
  ['05', 'Large goods payment', 'After a quote, does the payment go through DutyFreeDeal, or does the seller collect it?']
];

function tile(p) {
  const key = modelKey(p);
  const units = stock(p);
  const facts = [isQuote(p) ? 'Indicative' : '', units ? `${count(units, 'unit', 'units')} in stock` : 'Out of stock'].filter(Boolean).join(' · ');
  return `<li class="sel-tile">
    <a class="offer-media sel-tile-media" href="${productHref(p)}" tabindex="-1" aria-hidden="true"${cutout(key) ? ' data-cut' : ''}>${offerImage(p, { sizes: '(max-width: 900px) 45vw, 220px' })}</a>
    <h3 class="sel-tile-name"><a href="${productHref(p)}">${esc(label(p.name))}</a></h3>
    <p class="sel-tile-meta"><span class="price">${esc(priceText(p))}</span><span>${esc(facts)}</span></p>
    ${isHidden(p) ? `<p class="sel-tile-flag">${chip('Hidden by moderation', 'warning')}</p>` : ''}
  </li>`;
}

/** Four offers for the overview: the ones created here first, then studio cut-outs without a visible brand. */
function previewOffers(offers) {
  const rank = (p) => (isCreated(p) ? 0 : !cutout(modelKey(p)) ? 3 : BRANDED.has(modelKey(p)) ? 2 : 1);
  return offers.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).slice(0, 4).map((x) => x.p);
}

function dashboard(ctx) {
  const v = currentVendor();
  const offers = offersOf(v);
  const hidden = offers.filter(isHidden).length;
  const units = offers.reduce((sum, p) => sum + stock(p), 0);
  const ships = shipmentsOf(v.id);
  const toPrepare = ships.filter(({ s }) => s.status === 'pending' || s.status === 'preparing').length;
  const off = suspended(v);
  const quotes = offers.filter(isQuote).length;
  const allQuote = offers.length > 0 && quotes === offers.length;

  const destinations = countries.map((c) => {
    const on = v.deliveryTo.includes(c.code);
    const fee = !on ? 'Not delivered' : allQuote ? 'In the quotation' : `+ ${money(shipping(v.id, c.code))}`;
    return `<li${on ? '' : ' class="is-off"'}><span class="sel-dest-name">${esc(label(c.name))}${c.code === v.country ? `<small>${esc('Seller country')}</small>` : ''}</span>`
      + `<span class="sel-num">${esc(fee)}</span></li>`;
  }).join('');
  const destNote = allQuote
    ? 'Large goods: transport and timing are specified in each quotation.'
    : `Example delivery fee for one shipment. Buyers see it on its own line, after the product price.${quotes ? ' Quote offers: transport in the quotation.' : ''}`;

  const offersHint = !offers.length ? 'No offer yet'
    : off ? 'Hidden from the shop while suspended'
      : hidden === offers.length ? (offers.length === 1 ? 'Hidden by moderation' : 'All hidden by moderation')
        : hidden ? `${number(offers.length - hidden)} published · ${number(hidden)} hidden by moderation`
          : offers.length === 1 ? 'Published in the shop' : 'All published in the shop';
  const shipHint = ships.length ? `Out of ${plural(ships.length, 'shipment', 'shipments')} in simulated orders`
    : allQuote ? 'Quote offers create requests, not shipments' : 'No simulated order yet';

  const body = `
    ${off ? `<div class="sel-alert" data-reveal>${notice(`${esc('This example account is suspended in the back office: its offers are hidden from the shop and cannot be bought.')} <a class="sel-inline-link" href="#/admin/vendors">${esc('Reactivate it in Sellers and verification')}</a>`, 'warning')}</div>` : ''}
    <div class="stats sel-stats" data-reveal>
      ${statCard(number(offers.length), offers.length === 1 ? 'Offer of this seller' : 'Offers of this seller', offersHint)}
      ${statCard(number(units), units === 1 ? 'Example unit in stock' : 'Example units in stock', offers.length ? `Across ${count(offers.length, 'offer', 'offers')}, managed by you` : 'Create an offer to add stock')}
      ${statCard(number(toPrepare), toPrepare === 1 ? 'Shipment to prepare' : 'Shipments to prepare', shipHint)}
    </div>
    <div class="card-grid sel-cards">
      <section class="card surface-light sel-card" aria-labelledby="sel-acc-title" data-reveal>
        <div class="card-head"><h2 class="title-s" id="sel-acc-title">${esc('My seller account')}</h2>${accountChip(v)}</div>
        <dl class="sel-dl">
          <div><dt>${esc('Seller')}</dt><dd>${esc(vendorName(v))}</dd></div>
          <div><dt>${esc('Seller country')}</dt><dd>${esc(countryName(v.country))}</dd></div>
          <div><dt>${esc('Seller type')}</dt><dd>${esc(typeText(v))}</dd></div>
          <div><dt>${esc('Verification')}</dt><dd>${esc(v.type === 'individual' ? 'KYC · identity, simulated' : 'KYB · business, simulated')}</dd></div>
          <div><dt>${esc('Bank verification')}</dt><dd>${esc('By the payment provider, simulated')}</dd></div>
        </dl>
        <a class="more sel-card-more" href="#/sell">${esc('How verification works')}${icon('arrow')}</a>
      </section>
      <section class="card surface-light sel-card" aria-labelledby="sel-dest-title" data-reveal>
        <div class="card-head"><h2 class="title-s" id="sel-dest-title">${esc('My destinations')}</h2><span class="sel-head-note">${esc(`${v.deliveryTo.length} of ${countries.length} example countries`)}</span></div>
        <ul class="sel-dest" role="list">${destinations}</ul>
        <p class="sel-card-note">${esc(destNote)}</p>
      </section>
    </div>
    <section class="card surface-light sel-offers" aria-labelledby="sel-offers-title" data-reveal>
      <div class="card-head"><h2 class="title-s" id="sel-offers-title">${esc('My offers')}</h2>
        <a class="more" href="#/seller/inventory">${esc(offers.length > 4 ? `See all ${offers.length} offers and their stock` : 'Manage offers and stock')}${icon('arrow')}</a></div>
      ${offers.length ? `<ul class="sel-tiles" role="list">${previewOffers(offers).map(tile).join('')}</ul>` : `<p class="empty-note">${esc('No offer yet. Create an example offer in My offers and stock.')}</p>`}
    </section>
    <section class="card surface-light sel-rules" aria-labelledby="sel-rules-title" data-reveal>
      <div class="card-head">
        <div><h2 class="title-s" id="sel-rules-title">${esc('Rules still open')}</h2>
          <p class="sel-card-lead">${esc('Open questions, numbered as in the back office. Nothing is calculated in this prototype.')}</p></div>
        <a class="more" href="#/admin/settings">${esc('See every open decision')}${icon('arrow')}</a>
      </div>
      <ul class="sel-rule-list" role="list">
        ${RULES.map(([num, title, question]) => `<li class="sel-rule"><span class="sel-rule-num" aria-hidden="true">${esc(num)}</span><div><h3>${esc(title)}</h3><p>${esc(question)}</p></div></li>`).join('')}
      </ul>
    </section>`;

  return workspacePage(ctx, {
    name: 'Seller workspace',
    title: `${esc('Hello,')} ${nameHtml(v)}`,
    lead: 'You manage your stock and prepare your shipments. Figures come from this demonstration catalog and its orders.',
    body
  });
}

/* ---------- Offers and stock ---------- */

/** The models of the catalog, one per image (photographs, and the generated car and house), to illustrate an example offer. */
function photographedModels() {
  const found = new Map();
  for (const p of allProducts()) {
    if (isCreated(p)) continue;
    const key = modelKey(p);
    if (key && !found.has(key)) found.set(key, { key, name: label(p.name), dept: p.category, image: p.image });
  }
  return [...found.values()];
}

/** Note and buttons at the end of both dialogs. Cancel closes through the documented ctx.closeDialog(). */
const dialogActions = (submit) => `<div class="form-actions sel-dialog-actions"><p class="sel-dialog-note">${icon('info')}<span>${esc('Local change, visible immediately in the shop.')}</span></p>
  <button class="btn btn--secondary" type="button" data-sel-cancel>${esc('Cancel')}</button><button class="btn btn--primary" type="submit">${esc(submit)}</button></div>`;

/**
 * Cancel button; typing in a flagged field clears its error, and the dialog's error (shared setDialogError) then lists
 * only the fields still flagged, as the onboarding form does, and disappears with the last one.
 */
function bindDialog(ctx, root) {
  const form = root?.querySelector('form');
  if (!form) return;
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-sel-cancel]')) ctx.closeDialog();
  });
  form.addEventListener('input', (event) => {
    const t = event.target;
    if (t.getAttribute('aria-invalid') !== 'true' || !String(t.value).trim()) return;
    setFieldError(form, t.id);
    setDialogError(summaryOf(form));
  });
}

function openEdit(ctx, id) {
  const v = currentVendor();
  const p = product(id);
  if (!p || p.vendorId !== v.id) return;
  const name = label(p.name);
  const quote = isQuote(p);
  const priceLabel = quote ? 'Indicative price in euros' : 'Product price in euros';
  const root = ctx.openDialog({
    title: esc(`Edit ${name}`),
    size: 'm',
    body: `<div class="sel-dialog sel-dialog--edit">
      <div class="sel-dialog-offer">${thumb(p, 'thumb--l')}<div><p class="sel-dialog-name">${esc(name)}</p><p class="sel-dialog-sub">${esc(`${journey(p)} · ${deptName(p)}`)}</p></div></div>
      <div class="form-grid">
        ${textInput({ id: 'sel-edit-price', name: 'price', text: priceLabel, value: Number(p.price).toFixed(2), mode: 'decimal', help: quote ? QUOTE_PRICE_HELP : 'Delivery stays separate, with your fee for each destination.' })}
        ${textInput({ id: 'sel-edit-stock', name: 'stock', text: 'Units in stock', value: String(stock(p)), mode: 'numeric', help: 'Example stock, managed by you.' })}
      </div>
      ${dialogActions('Apply changes')}
    </div>`,
    onSubmit(values, form) {
      const price = parsePrice(values.price);
      const units = parseUnits(values.stock);
      const problem = reportErrors(form, [
        ['sel-edit-price', price === null && `Enter an amount greater than 0, for example ${quote ? '24900' : '129.90'}.`],
        ['sel-edit-stock', units === null && 'Enter a whole number of units, from 0 to 100,000.']
      ]);
      if (problem) return problem;
      if (!editOffer(p.id, { price, stock: units })) return 'This offer could not be updated.';
      ctx.toast(`Offer updated: ${name}`);
      ctx.rerender();
      return undefined;
    }
  });
  bindDialog(ctx, root);
}

function openCreate(ctx) {
  const v = currentVendor();
  const models = photographedModels();
  const large = largeModels();
  const own = sellerOffers(v.id)[0];
  const dept = department(own?.category)?.id || categories[0].id;
  /* Suggested illustration of a department: a model without a visible brand when there is one. */
  const suggest = (id) => models.find((m) => m.dept === id && cutout(m.key) && !BRANDED.has(m.key))
    || models.find((m) => m.dept === id && !BRANDED.has(m.key)) || models.find((m) => m.dept === id);
  const first = suggest(dept) || models[0];
  const forcedAtStart = large.has(first.key);
  const modelOptions = categories.map((c) => {
    const list = models.filter((m) => m.dept === c.id);
    return list.length ? `<optgroup label="${esc(label(c.name))}">${list.map((m) => `<option value="${esc(m.key)}"${m.key === first.key ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</optgroup>` : '';
  }).join('');
  const preview = (m) => offerImage(m, { sizes: '220px', lazy: false });
  const modeHelp = (forced) => (forced
    ? 'Cars and prefabricated houses go through a request only: no payment, no deposit, no confirmed reservation.'
    : 'Quote or reservation is for large goods: no payment, no deposit and no confirmed reservation.');
  const priceLabel = (quote) => (quote ? 'Indicative price in euros' : 'Product price in euros');
  const priceHelp = (quote) => (quote ? 'Transport and timing are set in the quotation.' : 'Delivery is shown separately.');

  const root = ctx.openDialog({
    title: esc('Create an example offer'),
    size: 'l',
    body: `<div class="sel-dialog sel-dialog--create">
      <p class="sel-dialog-lead">${esc(`A new listing with fictional details, sold by ${vendorName(v)}. New products only.`)}</p>
      <div class="sel-create">
        <figure class="sel-create-preview">
          <div class="offer-media sel-create-media"${cutout(first.key) ? ' data-cut' : ''} data-sel-preview>${preview(first)}</div>
          <figcaption class="sel-create-caption"><span data-sel-caption>${esc(first.name)}</span>
            <small id="sel-new-image-help"><span data-sel-kind>${esc(imageKind(first.key))}</span><span class="sr-only"> · </span><span class="sel-create-note">${esc('fictional product, seller and price')}</span></small></figcaption>
        </figure>
        <div class="sel-create-fields">
          ${textInput({ id: 'sel-new-name', name: 'name', text: 'Offer name' })}
          <div class="field"><label for="sel-new-dept">${esc('Department')}</label>
            <select class="select" id="sel-new-dept" name="category">${categories.map((c) => `<option value="${esc(c.id)}"${c.id === dept ? ' selected' : ''}>${esc(label(c.name))}</option>`).join('')}</select></div>
          <div class="field"><label for="sel-new-image">${esc('Illustration')}</label>
            <select class="select" id="sel-new-image" name="image" aria-describedby="sel-new-image-help">${modelOptions}</select></div>
        </div>
      </div>
      <div class="sel-create-more">
        <fieldset class="sel-fieldset sel-journey" aria-describedby="sel-new-mode-help">
          <legend class="sel-legend">${esc('Journey')}</legend>
          <div class="sel-pills">
            <label class="sel-pill"><input type="radio" name="mode" value="purchase"${forcedAtStart ? ' disabled' : ' checked'}><span>${esc('Direct purchase')}</span></label>
            <label class="sel-pill"><input type="radio" name="mode" value="quote"${forcedAtStart ? ' checked' : ''}><span>${esc('Quote or reservation')}</span></label>
          </div>
          <p class="help sel-fieldset-help" id="sel-new-mode-help" data-sel-mode-help>${esc(modeHelp(forcedAtStart))}</p>
        </fieldset>
        <div class="form-grid">
          ${textInput({ id: 'sel-new-price', name: 'price', text: priceLabel(forcedAtStart), mode: 'decimal', help: priceHelp(forcedAtStart) })}
          ${textInput({ id: 'sel-new-stock', name: 'stock', text: 'Example stock', mode: 'numeric', help: 'Units you hold and ship.' })}
        </div>
      </div>
      ${dialogActions('Create the offer')}
    </div>`,
    onSubmit(values, form) {
      const name = String(values.name || '').replace(/\s+/g, ' ').trim();
      const model = models.find((m) => m.key === values.image);
      const mode = values.mode === 'quote' ? 'quote' : 'purchase';
      const price = parsePrice(values.price);
      const units = parseUnits(values.stock);
      const problem = reportErrors(form, [
        ['sel-new-name', (name.length < 2 || name.length > 80) && 'Enter an offer name of 2 to 80 characters.'],
        ['sel-new-dept', !department(values.category) && 'Choose a department.'],
        ['sel-new-image', !model && 'Choose an illustration.'],
        ['sel-new-price', price === null && `Enter an amount greater than 0, for example ${mode === 'quote' ? '24900' : '49.90'}.`],
        ['sel-new-stock', units === null && 'Enter a whole number of units, from 0 to 100,000.']
      ]);
      if (problem) return problem;
      if (large.has(model.key) && mode !== 'quote') {
        form.querySelector('input[name="mode"][value="quote"]')?.focus();
        return 'Cars and prefabricated houses go through a quote or reservation request: choose Quote or reservation.';
      }
      /* The shared helper states the delivery of the new offer: a parcel time, or transport in the quotation. */
      const p = createOffer({ vendorId: v.id, name, category: values.category, mode, price, stock: units, image: `./assets/photos/${model.key}.webp` });
      if (!p) return 'The offer could not be created. Check the fields.';
      ctx.toast(`Example offer created: ${name}`);
      ctx.rerender();
      return undefined;
    }
  });
  if (!root) return;

  let picked = false;
  let wanted = 'purchase';
  let kind = imageKind(first.key);
  const radio = (value) => root.querySelector(`input[name="mode"][value="${value}"]`);
  /**
   * Shows a model in the preview with its caption, which is also the description of the Illustration select.
   * Returns the kind of image ("Generated illustration.") when it changed, for the announcement, or ''.
   */
  const show = (key) => {
    const m = models.find((x) => x.key === key);
    if (!m) return '';
    const box = root.querySelector('[data-sel-preview]');
    box.innerHTML = preview(m);
    box.toggleAttribute('data-cut', Boolean(cutout(m.key)));
    root.querySelector('[data-sel-caption]').textContent = m.name;
    root.querySelector('[data-sel-kind]').textContent = imageKind(m.key);
    const before = kind;
    kind = imageKind(m.key);
    return kind === before ? '' : `${kind}.`;
  };
  /** Price label and help follow the journey; a large good forces the quote journey. Returns the journey if it changed. */
  const syncJourney = () => {
    const forced = large.has(root.querySelector('[name="image"]').value);
    const before = radio('quote').checked ? 'quote' : 'purchase';
    radio('purchase').disabled = forced;
    radio(forced || wanted === 'quote' ? 'quote' : 'purchase').checked = true;
    const quote = radio('quote').checked;
    root.querySelector('[data-sel-mode-help]').textContent = modeHelp(forced);
    root.querySelector('label[for="sel-new-price"] [data-sel-label]').textContent = priceLabel(quote);
    root.querySelector('#sel-new-price-help').textContent = priceHelp(quote);
    const after = quote ? 'quote' : 'purchase';
    return after === before ? '' : after;
  };
  const journeyText = (mode) => (mode === 'quote'
    ? ' Journey: Quote or reservation, as for every car and prefabricated house.'
    : ' Journey: Direct purchase.');

  root.addEventListener('change', (event) => {
    const t = event.target;
    if (t.name === 'mode') {
      wanted = t.value === 'quote' ? 'quote' : 'purchase';
      syncJourney();
    } else if (t.name === 'image') {
      picked = true;
      const said = show(t.value);
      const changed = syncJourney();
      const text = `${said}${changed ? journeyText(changed) : ''}`.trim();
      if (text) ctx.announce(text);
    } else if (t.name === 'category' && !picked) {
      const m = suggest(t.value);
      if (!m) return;
      root.querySelector('[name="image"]').value = m.key;
      const said = show(m.key);
      const changed = syncJourney();
      ctx.announce(`Illustration changed to ${m.name}.${said ? ` ${said}` : ''}${changed ? journeyText(changed) : ''}`);
    }
  });
  bindDialog(ctx, root);
}

function inventory(ctx) {
  const v = currentVendor();
  const offers = offersOf(v);
  const off = suspended(v);
  const hidden = offers.filter(isHidden).length;
  const quotes = offers.filter(isQuote).length;
  const units = offers.reduce((sum, p) => sum + stock(p), 0);
  /* A suspended seller's offers read "Seller suspended", as in the back office's offer moderation; the alert above says
   * they are hidden. Same tones as the moderation table: published is the steady state (neutral), exceptions are flagged. */
  const visibility = (p) => (isHidden(p) ? chip('Hidden by moderation', 'warning') : off ? chip('Seller suspended', 'danger') : chip('Published', 'neutral'));
  const createBtn = `<button class="btn btn--primary" type="button" id="sel-create" data-action="sel-create">${icon('plus')}${esc('Create an example offer')}</button>`;

  /* The department under the name; an offer created here says so on its own line. "New" is stated once, in the summary. */
  const rows = offers.map((p) => {
    const name = label(p.name);
    const created = isCreated(p) ? `<span class="cell-sub">${esc('Created in this browser')}</span>` : '';
    return [
      `<div class="cell-main sel-offer-cell">${thumb(p)}<div class="sel-offer-text"><a class="sel-offer-name" href="${productHref(p)}">${esc(name)}</a><span class="cell-sub">${esc(deptName(p))}</span>${created}</div></div>`,
      `<span class="price">${esc(priceText(p))}</span>${isQuote(p) ? `<span class="cell-sub">${esc('Indicative')}</span>` : ''}`,
      stock(p) ? `<span class="sel-num">${esc(number(stock(p)))}</span>` : chip('Out of stock', 'warning'),
      esc(journey(p)),
      visibility(p),
      `<div class="cell-actions"><button class="pill" type="button" data-action="sel-edit" data-id="${esc(p.id)}">${icon('pencil')}${esc('Edit')}<span class="sr-only"> ${esc(name)}</span></button></div>`
    ];
  });

  const published = off ? 'hidden while the seller is suspended'
    : hidden === offers.length ? (offers.length === 1 ? 'hidden by moderation' : 'all hidden by moderation')
      : hidden ? `${number(offers.length - hidden)} published, ${number(hidden)} hidden by moderation` : (offers.length === 1 ? 'published' : 'all published');
  const summary = [plural(offers.length, 'offer', 'offers'), published, `${count(units, 'example unit', 'example units')} in stock`, 'new products only'].join(' · ');
  const lead = !quotes
    ? 'Each offer is its own listing in the shop. You set its product price and your example stock; delivery is shown separately, with your fee for each destination.'
    : quotes === offers.length
      ? 'Each offer is its own listing in the shop. You set its indicative price and your example stock; transport and timing are specified in each quotation.'
      : 'Each offer is its own listing in the shop. You set its price and your example stock; delivery is shown separately, with your fee for each destination, and in the quotation for large goods.';

  const body = offers.length ? `
    ${off ? `<div class="sel-alert" data-reveal>${notice(`${esc('This example account is suspended: its offers are hidden from the shop until it is reactivated.')} <a class="sel-inline-link" href="#/admin/vendors">${esc('Reactivate it in Sellers and verification')}</a>`, 'warning')}</div>` : ''}
    <section class="card surface-light sel-inv" aria-labelledby="sel-inv-title" data-reveal>
      <div class="card-head"><div><h2 class="title-s" id="sel-inv-title">${esc('Offers of')} ${nameHtml(v)}</h2><p class="sel-card-lead">${esc(summary)}</p></div></div>
      ${table(['Offer', 'Product price', 'Example stock', 'Journey', 'Visibility', `<span class="sr-only">${esc('Actions')}</span>`], rows, { caption: `Offers of ${vendorName(v)}`, cls: 'sel-inv-table' })}
    </section>
    <div class="sel-foot-note" data-reveal>${notice(`${esc('Local change, visible immediately in the shop. Visibility is decided by')} <a class="sel-inline-link" href="#/admin/products">${esc('offer moderation')}</a> ${esc('in the back office.')}`, 'info')}</div>`
    : emptyState({
      iconName: 'package',
      title: esc('No offer yet'),
      text: esc(`Create an example offer for ${vendorName(v)}: it appears at once in the shop for the destinations this seller delivers to.`),
      actions: createBtn
    });

  return workspacePage(ctx, {
    name: 'My offers and stock · Seller workspace',
    title: esc('My offers and stock'),
    lead,
    actions: offers.length ? createBtn : '',
    body,
    rescue: (main) => main.querySelector('#sel-create'),
    mount(main) {
      const onClick = (event) => {
        const t = event.target.closest('[data-action]');
        if (!t || !main.contains(t)) return;
        if (t.dataset.action === 'sel-edit') openEdit(ctx, t.dataset.id);
        else if (t.dataset.action === 'sel-create') openCreate(ctx);
      };
      main.addEventListener('click', onClick);
      return () => main.removeEventListener('click', onClick);
    }
  });
}

/* ---------- Shipments ---------- */

function shipmentCard(o, s) {
  const items = Array.isArray(s.items) ? s.items : [];
  const products = items.reduce((sum, it) => sum + Number(it.price) * Number(it.qty), 0);
  const next = NEXT[s.status];
  const c = o.contact || {};
  const sellers = (o.shipments || []).length;
  const place = [c.city, countryName(o.country)].filter(Boolean).join(', ');
  return `<li data-reveal><article class="card surface-light sel-ship" aria-labelledby="sel-ship-${esc(o.id)}">
    <div class="sel-ship-head">
      <div>
        <p class="sel-ship-kicker">${esc(`${dateText(o.date)} · Delivery ${countryIn(o.country)}`)}</p>
        <h3 class="title-s sel-ship-title" id="sel-ship-${esc(o.id)}" tabindex="-1">${esc(`Order ${o.id}`)}</h3>
      </div>
      <div class="sel-ship-status">
        ${chip(shipmentLabel(s.status), TONE[s.status] || 'neutral')}
        ${next ? `<button class="btn btn--secondary btn--small" type="button" data-action="sel-advance" data-id="${esc(o.id)}">${esc(`Simulate “${shipmentLabel(next)}”`)}<span class="sr-only">${esc(` for order ${o.id}`)}</span></button>` : ''}
      </div>
    </div>
    ${shipmentSteps(s.status, { name: `Shipment progress, order ${o.id}, simulated` })}
    <div class="sel-ship-body">
      <div>
        <ul class="sel-items" role="list">${items.map((it) => `<li class="sel-item">${thumb({ image: it.image }, 'thumb--l')}`
          + `<span class="sel-item-text"><a href="${productHref({ id: it.id })}">${esc(label(it.name))}</a><span class="cell-sub">${esc(`Quantity ${it.qty} · ${money(it.price)} each`)}</span></span>`
          + `<span class="price">${esc(money(Number(it.price) * Number(it.qty)))}</span></li>`).join('')}</ul>
        <div class="totals sel-ship-totals">
          <div><span>${esc('Products')}</span><span>${esc(money(products))}</span></div>
          <div><span>${esc(`Delivery ${countryIn(o.country)}, shipped by you`)}</span><span>${esc(`+ ${money(s.shipping)}`)}</span></div>
        </div>
      </div>
      <dl class="sel-facts">
        <div><dt>${esc('Fictional customer')}</dt><dd>${esc(c.name || 'Not given')}${place ? `<span class="cell-sub">${esc(place)}</span>` : ''}</dd></div>
        <div><dt>${esc('Payment')}</dt><dd>${esc(sellers > 1 ? `One payment for ${sellers} sellers` : 'One payment')}<span class="cell-sub">${esc('Simulated, nothing charged')}</span></dd></div>
        <div><dt>${esc('Your part')}</dt><dd>${esc(sellers > 1 ? 'You ship your items; each seller ships their own part.' : 'You ship the whole order.')}</dd></div>
      </dl>
    </div>
  </article></li>`;
}

/** Why this seller has no shipment yet, and the one next step that can create one in this demonstration. */
function emptyShipments(v) {
  const offers = offersOf(v);
  const direct = offers.filter((p) => !isQuote(p));
  const orderable = direct.filter((p) => !isHidden(p) && stock(p) > 0);
  const link = (href, text, primary = false) => `<a class="btn btn--${primary ? 'primary' : 'secondary'}" href="${href}">${esc(text)}</a>`;
  const empty = (text, actions = '') => emptyState({ iconName: 'truck', title: esc('No shipment for this seller yet'), text: esc(text), actions });

  if (!offers.length) {
    return empty('Shipments come from orders placed in the shop, and this seller has no offer yet. Create an example offer, then order it in the shop.',
      link('#/seller/inventory', 'Open My offers and stock', true));
  }
  if (!direct.length) {
    return empty('This seller’s offers are large goods on quote or reservation request: no order, no payment and no shipment in this demonstration. Requests appear in the back office.',
      link('#/admin/requests', 'See the requests in the back office', true) + link('#/seller/inventory', 'See my offers'));
  }
  if (suspended(v)) {
    return empty(`This example account is suspended in the back office, so its offers cannot be ordered.${orderable.length ? ' Reactivate it, then order one of its offers in the shop: the shipment appears here.' : ''}`,
      link('#/admin/vendors', 'Reactivate in the back office', true));
  }
  if (!v.deliveryTo.length) return empty('This example seller does not deliver to any example country yet, so its offers cannot be ordered.');
  if (!orderable.length) {
    /* Nothing can be ordered: the direct-purchase offers are hidden by moderation, or visible but out of stock. */
    const hidden = direct.some(isHidden);
    const visible = direct.some((p) => !isHidden(p));
    const one = direct.length === 1;
    const why = hidden && visible ? 'each one is hidden by moderation or out of example stock'
      : `${one ? 'it is' : 'they are'} ${hidden ? 'hidden by moderation' : 'out of example stock'}`;
    const fix = hidden && visible ? 'Publish one again in the back office or add example stock'
      : hidden ? `Publish ${one ? 'it' : 'one'} again in the back office` : 'Add example stock';
    const then = one || (hidden && !visible) ? 'then order it in the shop' : 'then order one in the shop';
    return empty(`${one ? 'This seller’s only direct-purchase offer cannot be ordered' : 'None of this seller’s direct-purchase offers can be ordered'}: ${why}. ${fix}, ${then}.`,
      hidden && !visible ? link('#/admin/products', 'Open offer moderation', true)
        : link('#/seller/inventory', 'Add example stock', true) + (hidden ? link('#/admin/products', 'Open offer moderation') : ''));
  }
  if (!v.deliveryTo.includes(state.country)) {
    const places = v.deliveryTo.map((code) => countryIn(code).replace(/^to /, ''));
    return empty(`Shipments come from orders placed in the shop. This seller delivers to ${andList(places)}, not ${countryIn(state.country)}: change the delivery country first, then order one of its offers.`,
      `<button class="btn btn--primary" type="button" id="sel-dest" aria-controls="panel-dest" aria-expanded="false" data-sel-dest>${icon('globe')}${esc('Change the delivery country')}</button>`);
  }
  return empty('Shipments come from orders placed in the shop: add one of this seller’s offers to the cart, then place the example order at checkout.',
    link(catalogHref({ q: shortName(v) }), 'See this seller’s offers', true));
}

function shipments(ctx) {
  const v = currentVendor();
  const list = shipmentsOf(v.id);
  const counts = SHIPMENT_STEPS.map((st) => [st, list.filter(({ s }) => s.status === st).length]).filter(([, n]) => n);
  const byStatus = counts.map(([st, n]) => `${number(n)} ${shipmentLabel(st).toLowerCase()}`).join(' · ');
  const body = list.length ? `
    <div class="sel-ships-head" data-reveal>
      <h2 class="title-m">${esc(plural(list.length, 'simulated shipment', 'simulated shipments'))}</h2>
      <p class="sel-card-lead">${esc(`${byStatus}. Most recent first.`)}</p>
    </div>
    <ul class="sel-ships" role="list">${list.map(({ o, s }) => shipmentCard(o, s)).join('')}</ul>
    <div class="sel-foot-note" data-reveal>${notice(esc('A late shipment lets the buyer cancel free of charge and counts against the seller. Whether a financial penalty is added is still open.'), 'clock')}</div>`
    : emptyShipments(v);

  return workspacePage(ctx, {
    name: 'My shipments · Seller workspace',
    title: esc('My shipments'),
    lead: 'The buyer pays once for the whole cart; each seller prepares and ships their own part. Here, you follow yours.',
    body,
    rescue: (main) => main.querySelector('#sel-dest, .empty-actions .btn, [data-action="sel-advance"]'),
    mount(main) {
      const onClick = (event) => {
        const dest = event.target.closest('[data-sel-dest]');
        if (dest) {
          openPanel('dest', dest);
          return;
        }
        const t = event.target.closest('[data-action="sel-advance"]');
        if (!t || !main.contains(t)) return;
        const id = t.dataset.id;
        const seller = currentVendor();
        if (!advanceShipment(id, seller.id)) return;
        const s = state.orders.find((o) => o.id === id)?.shipments.find((x) => x.vendorId === seller.id);
        /* "· simulation", as every simulated status of the site (and the back office's toast for the same shipment). */
        ctx.toast(`Order ${id}: ${shipmentLabel(s?.status)} · simulation`, s?.status === 'delivered' ? 'checkCircle' : 'truck');
        ctx.rerender().then(() => {
          if (!main.querySelector(`[data-action="sel-advance"][data-id="${CSS.escape(id)}"]`)) document.getElementById(`sel-ship-${id}`)?.focus({ preventScroll: true });
        });
      };
      main.addEventListener('click', onClick);
      return () => main.removeEventListener('click', onClick);
    }
  });
}

export const views = { sell, dashboard, inventory, shipments };
