import { state, save, t, label, esc, icon, product, vendor, vendorName, countryName, countries, price, uid } from './core.js';
import { announce } from './toast.js';

let opener = null;
const dialog = () => document.getElementById('quote-dialog');

function formHTML(p) {
  const v = vendor(p.vendorId);
  const deliverable = countries.filter(c => v.deliveryTo.includes(c.code));
  return `<form class="modal-form" data-form="quote" data-id="${esc(p.id)}" novalidate>
    <div class="drawer-head">
      <h2 id="quote-title">${esc(t('quoteTitle'))}</h2>
      <button type="button" class="close-btn" data-action="close-quote" aria-label="${esc(t('close'))}">${icon('x')}</button>
    </div>
    <div class="modal-body">
      <div class="modal-summary">
        <img src="${esc(p.image)}" alt="">
        <div><strong>${esc(label(p.name))}</strong><span class="meta">${esc(vendorName(v))}, ${esc(countryName(v.country))}</span><br>${price(p.price, 'm', { round: true })}</div>
      </div>
      <fieldset class="field">
        <legend>${esc(t('quoteType'))}</legend>
        <div class="choice-row">
          <label class="choice"><input type="radio" name="kind" value="quote" checked>${esc(t('quoteTypeQuote'))}</label>
          <label class="choice"><input type="radio" name="kind" value="reservation">${esc(t('quoteTypeReservation'))}</label>
        </div>
      </fieldset>
      <div class="field">
        <label for="quote-name">${esc(t('quoteName'))}</label>
        <input class="input" id="quote-name" name="name" autocomplete="name" required aria-describedby="quote-name-error">
        <p class="field-error" id="quote-name-error" hidden></p>
      </div>
      <div class="field">
        <label for="quote-email">${esc(t('quoteEmail'))}</label>
        <input class="input" id="quote-email" name="email" type="email" autocomplete="email" required aria-describedby="quote-email-error">
        <p class="field-error" id="quote-email-error" hidden></p>
      </div>
      <div class="field">
        <label for="quote-country">${esc(t('quoteDestination'))}</label>
        <select class="select" id="quote-country" name="country">
          ${deliverable.map(c => `<option value="${c.code}" ${c.code === state.country ? 'selected' : ''}>${esc(label(c.name))}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="quote-message">${esc(t('quoteMessage'))}</label>
        <textarea class="textarea" id="quote-message" name="message" aria-describedby="quote-message-hint"></textarea>
        <p class="field-hint" id="quote-message-hint">${esc(t('quoteMessageHint'))}</p>
      </div>
    </div>
    <div class="modal-actions">
      <p class="modal-note">${icon('info')}<span>${esc(t('quoteNotice'))}</span></p>
      <button type="button" class="btn btn--secondary" data-action="close-quote">${esc(t('cancel'))}</button>
      <button type="submit" class="btn btn--primary">${esc(t('quoteSend'))}</button>
    </div>
  </form>`;
}

export function openQuote(id, trigger) {
  const p = product(id);
  const d = dialog();
  if (!p || !d) return;
  opener = trigger || document.activeElement;
  d.innerHTML = formHTML(p);
  if (!d.open) d.showModal();
  document.body.classList.add('is-locked');
  d.querySelector('#quote-name')?.focus();
}

export function closeQuote() {
  const d = dialog();
  if (d?.open) d.close();
}

export function onQuoteClosed() {
  document.body.classList.remove('is-locked');
  if (opener && document.contains(opener)) opener.focus();
  opener = null;
}

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (error) {
    error.hidden = !message;
    error.textContent = message;
  }
}

export function submitQuote(form) {
  const name = form.elements.name;
  const email = form.elements.email;
  const nameError = name.value.trim() ? '' : t('errName');
  const emailError = !email.value.trim() ? t('errEmailMissing') : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? '' : t('errEmail');
  setError(name, nameError);
  setError(email, emailError);
  if (nameError || emailError) {
    (nameError ? name : email).focus();
    return;
  }
  const ref = uid('DEM');
  state.requests.push({
    id: ref,
    productId: form.dataset.id,
    kind: form.elements.kind.value,
    country: form.elements.country.value,
    createdAt: new Date().toISOString()
  });
  save();
  const d = dialog();
  d.innerHTML = `<div class="drawer-head">
      <h2 id="quote-title">${esc(t('quoteDoneTitle'))}</h2>
      <button type="button" class="close-btn" data-action="close-quote" aria-label="${esc(t('close'))}">${icon('x')}</button>
    </div>
    <div class="modal-body">
      <p class="quote-done">${icon('check-circle-fill')}<span>${esc(t('quoteDoneText', { ref }))}</span></p>
    </div>
    <div class="modal-actions"><button type="button" class="btn btn--primary" data-action="close-quote">${esc(t('close'))}</button></div>`;
  d.querySelector('.modal-actions .btn')?.focus();
  announce(t('quoteDoneTitle'));
}
