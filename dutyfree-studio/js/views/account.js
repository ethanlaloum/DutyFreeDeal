/* Example customer account: sign in, create an account, signed-in summary.
 * Simulated: any email and password are accepted, the password is never kept, nothing is checked or sent.
 * Only the name and email stay in this browser, to fill in the checkout. */
import { state, esc, icon, signIn, firstName, countryName } from '../core.js';
import { notice, demoTag } from '../ui/components.js';
import { refreshHeaderCounts } from '../ui/header.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* The same fictional customers as the checkout examples, by delivery country. */
const EXAMPLES = {
  FR: { name: 'Camille Durand', email: 'camille.durand@example.com' },
  ES: { name: 'Lucia Romero', email: 'lucia.romero@example.com' },
  US: { name: 'Jordan Ellis', email: 'jordan.ellis@example.com' },
  MX: { name: 'Sofia Navarro', email: 'sofia.navarro@example.com' }
};

/** Page to return to after signing in; only pages of this site, never the sign-in page itself. */
const nextHash = (params) => {
  const next = params.get('next') || '';
  return /^#\/(?!sign-in\b)/.test(next) ? next : '#/';
};

const modeHref = (mode, params) => {
  const q = new URLSearchParams();
  if (mode === 'create') q.set('mode', 'create');
  if (params.get('next')) q.set('next', params.get('next'));
  return `#/sign-in${q.toString() ? `?${q}` : ''}`;
};

/** "jordan.ellis@example.com" gives "Jordan Ellis" when signing in without a known name. */
const nameFromEmail = (email) => email.split('@')[0].split(/[._-]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

function input({ id, name, text, type = 'text', help = '' }) {
  const describe = [help ? `${id}-help` : '', `${id}-error`].filter(Boolean).join(' ');
  const control = `<input class="input" id="${id}" name="${name}" type="${type}" autocomplete="off" spellcheck="false" aria-required="true" aria-describedby="${describe}">`;
  return `<div class="field">
    <label for="${id}">${esc(text)} <span aria-hidden="true">*</span></label>
    ${type === 'password' ? `<div class="acc-pass">${control}<button class="acc-reveal" type="button" aria-pressed="false" aria-controls="${id}" data-acc-reveal>${icon('eye')}<span class="sr-only">${esc('Show password')}</span></button></div>` : control}
    ${help ? `<p class="help" id="${id}-help">${esc(help)}</p>` : ''}
    <p class="acc-error" id="${id}-error" hidden></p>
  </div>`;
}

function form(mode) {
  const create = mode === 'create';
  return `<form class="acc-form" data-form="${mode}" novalidate aria-label="${esc(create ? 'Create an account' : 'Sign in')}">
    ${create ? input({ id: 'acc-name', name: 'name', text: 'Fictional full name' }) : ''}
    ${input({ id: 'acc-email', name: 'email', text: create ? 'Fictional email' : 'Email', type: 'email', help: create ? 'An example address, such as name@example.com.' : '' })}
    ${input({ id: 'acc-password', name: 'password', text: 'Password', type: 'password', help: create ? 'At least 8 characters. It is not stored.' : 'Any password works in this prototype. It is not stored.' })}
    ${create ? `<div class="acc-consent">
      <label class="check"><input type="checkbox" name="fictional" id="acc-fictional" aria-required="true" aria-describedby="acc-fictional-error"><span>${esc('I am using fictional details to simulate this account')} <span aria-hidden="true">*</span></span></label>
      <p class="acc-error" id="acc-fictional-error" hidden></p>
    </div>` : ''}
    <p class="form-error acc-summary" role="alert" hidden data-acc-summary></p>
    <button class="btn btn--primary btn--block" type="submit">${esc(create ? 'Create the example account' : 'Sign in')}</button>
    <button class="btn btn--quiet acc-fill" type="button" data-acc-fill>${icon('pencil')}${esc('Fill in an example')}</button>
  </form>`;
}

function signedIn(params) {
  const a = state.account;
  return `<div class="acc-card card" data-enter>
    <div class="acc-who">
      <span class="acc-avatar" aria-hidden="true">${icon('user')}</span>
      <div><p class="acc-who-name">${esc(a.name || firstName(a))}</p><p class="acc-who-mail">${esc(a.email)}</p></div>
      ${demoTag('Example account')}
    </div>
    <ul class="acc-links" role="list">
      <li><a href="#/orders">${icon('receipt')}<span>${esc('My orders and requests')}</span>${icon('caretRight')}</a></li>
      <li><a href="#/wishlist">${icon('heart')}<span>${esc('My saved offers')}</span>${icon('caretRight')}</a></li>
      <li><a href="#/cart">${icon('bag')}<span>${esc('My cart')}</span>${icon('caretRight')}</a></li>
    </ul>
    <div class="acc-actions">
      <a class="btn btn--primary" href="${esc(nextHash(params))}">${esc('Continue shopping')}</a>
      <button class="btn btn--secondary" type="button" data-sign-out>${esc('Sign out')}</button>
    </div>
  </div>`;
}

function signInPage(ctx) {
  const mode = ctx.params.get('mode') === 'create' ? 'create' : 'signin';
  const create = mode === 'create';
  const a = state.account;
  const [title, soft] = a ? ['You’re signed in.', `Hello, ${firstName(a)}.`] : create ? ['Create an account.', 'For individual buyers.'] : ['Sign in.', 'Check out faster.'];
  const html = `<section class="acc" aria-labelledby="acc-title">
    <div class="hero-light acc-light" aria-hidden="true"></div>
    <div class="wrap acc-wrap">
      <div class="acc-head">
        <p class="eyebrow" data-enter>${esc('DutyFreeDeal account')}</p>
        <h1 class="title-xl" id="acc-title" tabindex="-1" data-enter>${esc(title)} <span class="soft">${esc(soft)}</span></h1>
      </div>
      ${a ? signedIn(ctx.params) : `<div class="acc-card card" data-enter>
        <nav class="acc-switch" aria-label="${esc('Account')}">
          <a href="${modeHref('signin', ctx.params)}"${create ? '' : ' aria-current="page"'}>${esc('Sign in')}</a>
          <a href="${modeHref('create', ctx.params)}"${create ? ' aria-current="page"' : ''}>${esc('Create an account')}</a>
        </nav>
        ${form(mode)}
      </div>`}
      <div class="acc-note" data-enter>${notice(esc('Simulated account: nothing is checked, the password is never kept, and nothing is sent. Only the name and email stay in this browser, to fill in the checkout.'), 'lock')}</div>
      <p class="acc-seller" data-enter>${esc(create ? 'Customer accounts are for individuals. Individuals and businesses who want to sell apply separately, after a verification.' : 'Selling on DutyFreeDeal?')}
        <a class="more" href="#/sell">${esc('Become a seller')}${icon('arrow')}</a></p>
    </div>
  </section>`;
  return {
    title: `${a ? 'Your account' : create ? 'Create an account' : 'Sign in'} · DutyFreeDeal`,
    surface: 'dark',
    html,
    mount: (main) => mountSignIn(main, ctx, mode)
  };
}

/* ---------- Form behaviour ---------- */

const LABELS = { 'acc-name': 'Full name', 'acc-email': 'Email', 'acc-password': 'Password', 'acc-fictional': 'Fictional details' };

function check(form, mode) {
  const v = (name) => form.elements[name]?.value.trim() || '';
  const out = {};
  if (mode === 'create' && !v('name')) out['acc-name'] = 'Enter a fictional full name.';
  if (!v('email')) out['acc-email'] = mode === 'create' ? 'Enter a fictional email address.' : 'Enter your email address.';
  else if (!EMAIL.test(v('email'))) out['acc-email'] = 'Enter an email address in the format name@example.com.';
  const pass = form.elements.password?.value || '';
  if (!pass) out['acc-password'] = 'Enter a password.';
  else if (mode === 'create' && pass.length < 8) out['acc-password'] = 'Use at least 8 characters.';
  if (mode === 'create' && !form.elements.fictional?.checked) out['acc-fictional'] = 'Confirm that you are using fictional details.';
  return out;
}

/** Shows or clears the inline error of a field (text, icon and aria-invalid; never color alone). */
function paint(form, id, message = '') {
  const el = form.querySelector(`#${id}`);
  const box = form.querySelector(`#${id}-error`);
  if (el) {
    if (message) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }
  if (box) {
    box.hidden = !message;
    box.innerHTML = message ? `${icon('warning')}<span>${esc(message)}</span>` : '';
  }
}

function mountSignIn(main, ctx, mode) {
  const form = main.querySelector('form.acc-form');
  if (!form) return null;
  const summary = form.querySelector('[data-acc-summary]');
  const refreshSummary = () => {
    const bad = [...form.querySelectorAll('[aria-invalid="true"]')].map((el) => LABELS[el.id]).filter(Boolean);
    summary.hidden = !bad.length;
    summary.textContent = bad.length ? `Check ${bad.length === 1 ? 'this field' : 'these fields'}: ${bad.join(', ')}.` : '';
  };

  const onClick = (event) => {
    const t = event.target.closest('button');
    if (!t || !form.contains(t)) return;
    if (t.hasAttribute('data-acc-reveal')) {
      const field = form.querySelector(`#${t.getAttribute('aria-controls')}`);
      const show = field.type === 'password';
      field.type = show ? 'text' : 'password';
      t.setAttribute('aria-pressed', String(show));
      t.innerHTML = `${icon(show ? 'eyeSlash' : 'eye')}<span class="sr-only">${esc('Show password')}</span>`;
      return;
    }
    if (t.hasAttribute('data-acc-fill')) {
      const example = EXAMPLES[state.country] || EXAMPLES.FR;
      if (form.elements.name) form.elements.name.value = example.name;
      form.elements.email.value = example.email;
      form.elements.password.value = 'example-password';
      if (form.elements.fictional) form.elements.fictional.checked = true;
      Object.keys(LABELS).forEach((id) => paint(form, id));
      refreshSummary();
      ctx.toast(`Example details filled in for ${countryName(state.country)}`, 'pencil');
    }
  };

  /* Once a field has been flagged, its message follows what is typed. */
  const onInput = (event) => {
    const el = event.target;
    if (el.getAttribute('aria-invalid') !== 'true') return;
    paint(form, el.id, check(form, mode)[el.id] || '');
    refreshSummary();
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const errors = check(form, mode);
    Object.keys(LABELS).forEach((id) => paint(form, id, errors[id] || ''));
    refreshSummary();
    const first = Object.keys(LABELS).find((id) => errors[id]);
    if (first) {
      form.querySelector(`#${first}`)?.focus();
      return;
    }
    const email = form.elements.email.value.trim();
    const name = form.elements.name?.value.trim() || nameFromEmail(email);
    form.elements.password.value = '';
    signIn({ name, email });
    refreshHeaderCounts();
    ctx.toast(mode === 'create' ? `Example account created: ${firstName()}` : `Signed in as ${firstName()} · simulation`, 'user');
    ctx.go(nextHash(ctx.params));
  };

  form.addEventListener('click', onClick);
  form.addEventListener('input', onInput);
  form.addEventListener('change', onInput);
  form.addEventListener('submit', onSubmit);
  return () => {
    form.removeEventListener('click', onClick);
    form.removeEventListener('input', onInput);
    form.removeEventListener('change', onInput);
    form.removeEventListener('submit', onSubmit);
  };
}

export const views = { signIn: signInPage };
