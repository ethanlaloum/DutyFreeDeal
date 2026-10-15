/* Notifications, screen-reader announcements and the modal dialog. */
import { esc, icon } from '../core.js';

/* ---------- Toast and live region ---------- */

let toastTimer = 0;

export function toast(message, iconName = 'check') {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.innerHTML = `${icon(iconName)}<span>${esc(message)}</span>`;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
}

/** Polite announcement for assistive technologies, without visual change. */
export function announce(message) {
  const live = document.querySelector('[data-live]');
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => { live.textContent = message; });
}

/* ---------- Dialog ---------- */

let current = null;

const focusables = (root) => [...root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
  .filter((el) => el.getClientRects().length > 0);

/**
 * Opens a modal dialog. `body` is HTML. With `onSubmit`, the body is wrapped in a form whose values
 * (an object from FormData, trimmed) are passed to it; returning a string shows it as an error and keeps the dialog open.
 */
export function openDialog({ title, body, onSubmit = null, size = 'm', onClose = null }) {
  closeDialog(false);
  const opener = document.activeElement;
  const root = document.createElement('div');
  root.className = 'dialog-backdrop';
  root.innerHTML = `<div class="dialog dialog--${size} surface-light" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <div class="dialog-head"><h2 class="title-s" id="dialog-title">${title}</h2>
      <button class="close-btn" type="button" data-dialog-close aria-label="${esc('Close')}">${icon('close')}</button></div>
    ${onSubmit ? `<form class="dialog-body" novalidate><p class="form-error dialog-error" role="alert" hidden data-dialog-error></p>${body}</form>` : `<div class="dialog-body">${body}</div>`}
  </div>`;
  document.body.appendChild(root);
  document.body.classList.add('has-dialog');
  for (const el of document.querySelectorAll('body > :not(.dialog-backdrop):not(script)')) el.setAttribute('inert', '');
  const dialog = root.querySelector('.dialog');
  const close = () => closeDialog(true);
  /* preventDefault keeps the browser from moving focus to the page after the backdrop disappears. */
  root.addEventListener('mousedown', (event) => {
    if (event.target !== root) return;
    event.preventDefault();
    close();
  });
  root.querySelectorAll('[data-dialog-close]').forEach((b) => b.addEventListener('click', close));
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
    if (event.key === 'Tab') {
      const list = focusables(dialog);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  if (onSubmit) {
    const form = root.querySelector('form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const error = form.querySelector('[data-dialog-error]');
      if (!form.checkValidity()) {
        const invalid = form.querySelector(':invalid');
        error.hidden = false;
        const name = invalid?.labels?.[0]?.textContent.replace(/\*\s*$/, '').trim() || '';
        error.textContent = invalid?.validationMessage ? `${name ? `${name}: ` : ''}${invalid.validationMessage}` : 'Complete the required fields.';
        invalid?.focus();
        return;
      }
      const values = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      const result = onSubmit(values, form);
      if (typeof result === 'string' && result) {
        error.hidden = false;
        error.textContent = result;
        return;
      }
      if (result !== false) closeDialog(true);
    });
  }
  current = { root, opener, onClose };
  requestAnimationFrame(() => (focusables(dialog.querySelector('.dialog-body'))[0] || dialog.querySelector('[data-dialog-close]')).focus());
  return root;
}

export function closeDialog(restoreFocus = true) {
  if (!current) return;
  const { root, opener, onClose } = current;
  current = null;
  root.remove();
  document.body.classList.remove('has-dialog');
  for (const el of document.querySelectorAll('[inert]')) el.removeAttribute('inert');
  if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
  if (onClose) onClose();
}

export const dialogOpen = () => Boolean(current);

/** Shows, updates or clears (empty message) the error at the top of the open dialog's form. */
export function setDialogError(message = '') {
  const error = current?.root.querySelector('[data-dialog-error]');
  if (!error) return;
  error.hidden = !message;
  error.textContent = message;
}
