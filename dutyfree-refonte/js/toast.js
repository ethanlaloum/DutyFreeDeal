import { esc, icon } from './core.js';

let timer;
let quietTimer;

/* Polite announcement for assistive technology, without a visible toast. */
export function announce(message, { quiet = false } = {}) {
  const region = document.getElementById(quiet ? 'live-quiet' : 'live');
  if (!region) return;
  clearTimeout(quietTimer);
  region.textContent = '';
  quietTimer = setTimeout(() => {
    region.textContent = message;
  }, 60);
}

/* Visible confirmation of an action, with an optional follow-up action. */
export function notify(message, { action, actionLabel, iconName = 'check-circle-fill' } = {}) {
  const host = document.getElementById('toast-region');
  if (!host) return;
  clearTimeout(timer);
  host.innerHTML = `<div class="toast">${icon(iconName)}<p>${esc(message)}</p>${action ? `<button type="button" class="btn btn--light btn--small" data-action="${esc(action)}">${esc(actionLabel)}</button>` : ''}</div>`;
  announce(message);
  const toast = host.firstElementChild;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      host.innerHTML = '';
    }, 5000);
  };
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', schedule);
  toast.addEventListener('focusin', () => clearTimeout(timer));
  toast.addEventListener('focusout', schedule);
  schedule();
}

export function clearToast() {
  const host = document.getElementById('toast-region');
  if (host) host.innerHTML = '';
}
