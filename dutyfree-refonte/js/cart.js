import {
  state, save, t, label, esc, icon, money, price, product, vendorName, countryName, countryTo,
  cartGroups, cartTotals, cartCount, lineIssue, stock, purchasable, deliverableTo
} from './core.js';
import { notify, announce } from './toast.js';
import { updateBadges } from './header.js';

let opener = null;

function drawer() {
  return document.getElementById('cart-drawer');
}

function lineHTML(line) {
  const p = line.p;
  const name = label(p.name);
  const issue = lineIssue(line);
  const max = Math.min(stock(p), 99);
  return `<li class="cart-line" data-line="${esc(p.id)}">
    <img src="${esc(p.image)}" alt="" loading="lazy">
    <div>
      <p class="cart-line-name"><a href="#/product/${encodeURIComponent(p.id)}" data-action="close-cart-link">${esc(name)}</a></p>
      <p class="meta">${esc(money(p.price))}</p>
      ${issue ? `<p class="field-error">${icon('warning')} ${esc(issue)}</p>` : ''}
      <div class="cart-line-controls">
        <div class="qty" role="group" aria-label="${esc(t('qtyLabel'))}">
          <button type="button" data-action="qty" data-id="${esc(p.id)}" data-step="-1" aria-label="${esc(t('qtyDecrease', { name }))}" ${line.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button>
          <output aria-live="polite">${line.qty}</output>
          <button type="button" data-action="qty" data-id="${esc(p.id)}" data-step="1" aria-label="${esc(t('qtyIncrease', { name }))}" ${line.qty >= max ? 'disabled' : ''}>${icon('plus')}</button>
        </div>
        <button type="button" class="line-remove" data-action="remove" data-id="${esc(p.id)}" aria-label="${esc(t('removeFor', { name }))}">${esc(t('remove'))}</button>
      </div>
    </div>
    <p class="cart-line-total">${esc(money(p.price * line.qty))}</p>
  </li>`;
}

function bodyHTML() {
  const groups = cartGroups();
  if (!groups.length) {
    return `<div class="drawer-body"><div class="empty">${icon('shopping-bag')}<h2>${esc(t('cartEmptyTitle'))}</h2><p>${esc(t('cartEmptyText'))}</p></div></div>`;
  }
  const totals = cartTotals();
  const blocked = groups.some(g => g.lines.some(lineIssue));
  return `<div class="drawer-body">
      <p class="drawer-intro">${esc(t('cartIntro', { n: groups.length }))}</p>
      ${groups.map(g => `<section class="shipment" aria-label="${esc(t('shippedBy', { name: vendorName(g.v) }))}">
        <div class="shipment-head">
          <div>
            <h3>${icon('storefront')}${esc(t('shippedBy', { name: vendorName(g.v) }))}</h3>
            <p class="route"><span>${esc(countryName(g.v.country))}</span>${g.v.country !== state.country ? `${icon('arrow-right')}<span>${esc(countryName(state.country))}</span>` : ''}</p>
          </div>
        </div>
        <ul class="list-reset" role="list">${g.lines.map(lineHTML).join('')}</ul>
        <p class="shipment-cost"><span>${esc(t('shipmentDelivery', { country: countryTo(state.country) }))}</span><span>${g.lines.some(l => deliverableTo(l.p)) ? esc(money(g.v.shipping?.[state.country] ?? 0)) : '-'}</span></p>
      </section>`).join('')}
    </div>
    <div class="drawer-foot">
      <dl class="totals">
        <div><dt>${esc(t('subtotal'))}</dt><dd>${esc(money(totals.subtotal))}</dd></div>
        <div><dt>${esc(t('delivery'))}</dt><dd>${esc(money(totals.delivery))}</dd></div>
        <div class="totals-sum"><dt>${esc(t('total'))}</dt><dd>${price(totals.total, 'm')}</dd></div>
      </dl>
      <p class="meta drawer-rule">${esc(t('deliveryRule'))}</p>
      ${blocked ? `<p class="field-error">${esc(t('checkoutBlocked'))}</p>` : ''}
      <a class="btn btn--primary btn--large drawer-checkout ${blocked ? 'is-disabled' : ''}" href="#/checkout" data-action="close-cart-link" ${blocked ? 'aria-disabled="true" tabindex="-1"' : ''}>${esc(t('checkout'))}${icon('arrow-right')}</a>
    </div>`;
}

export function renderCart() {
  const d = drawer();
  if (!d) return;
  d.innerHTML = `<div class="drawer-head">
      <h2 id="cart-title">${esc(t('cartTitle'))} <span class="drawer-count">(${cartCount()})</span></h2>
      <button type="button" class="close-btn" data-action="close-cart" aria-label="${esc(t('cartClose'))}">${icon('x')}</button>
    </div>
    ${bodyHTML()}`;
}

export function openCart(trigger) {
  const d = drawer();
  if (!d) return;
  opener = trigger || document.activeElement;
  renderCart();
  if (!d.open) d.showModal();
  document.body.classList.add('is-locked');
  d.querySelector('.close-btn')?.focus();
}

export function closeCart() {
  const d = drawer();
  if (!d?.open) return;
  d.close();
}

export function onCartClosed() {
  document.body.classList.remove('is-locked');
  if (opener && document.contains(opener)) opener.focus();
  opener = null;
}

export function addToCart(id, trigger) {
  const p = product(id);
  if (!p || !purchasable(p)) return;
  const line = state.cart.find(l => l.id === id);
  if (line && line.qty >= stock(p)) {
    notify(t('stockReached'), { iconName: 'info' });
    return;
  }
  if (line) line.qty += 1;
  else state.cart.push({ id, qty: 1 });
  save();
  updateBadges({ bump: 'cart' });
  const qty = state.cart.find(l => l.id === id).qty;
  if (trigger?.classList.contains('btn')) {
    const original = trigger.innerHTML;
    trigger.classList.add('is-done');
    trigger.innerHTML = `${icon('check')}${esc(t('addedShort'))}`;
    setTimeout(() => {
      if (!document.contains(trigger)) return;
      trigger.classList.remove('is-done');
      trigger.innerHTML = original;
    }, 1400);
  }
  notify(qty > 1 ? t('addedMore', { name: label(p.name), qty }) : t('added', { name: label(p.name) }), { action: 'open-cart', actionLabel: t('viewCart') });
}

export function changeQty(id, step) {
  const line = state.cart.find(l => l.id === id);
  const p = product(id);
  if (!line || !p) return;
  line.qty = Math.max(1, Math.min(line.qty + step, Math.min(stock(p), 99)));
  save();
  updateBadges();
  renderCart();
  drawer()?.querySelector(`[data-action="qty"][data-id="${CSS.escape(id)}"][data-step="${step}"]:not(:disabled)`)?.focus() ||
    drawer()?.querySelector(`[data-line="${CSS.escape(id)}"] output`)?.closest('.qty')?.querySelector('button:not(:disabled)')?.focus();
}

export function removeLine(id) {
  const index = state.cart.findIndex(l => l.id === id);
  if (index < 0) return;
  state.cart.splice(index, 1);
  save();
  updateBadges();
  renderCart();
  announce(t('removed'));
  const d = drawer();
  (d?.querySelector('.line-remove') || d?.querySelector('.close-btn'))?.focus();
}

