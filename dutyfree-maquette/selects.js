'use strict';

// The native select remains the source of truth for forms, validation and app events.
window.DFDDropdowns = (() => {
  const controllers = new Map();
  const supported = typeof HTMLElement.prototype.showPopover === 'function';
  const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  const searchIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>';
  let sequence = 0;
  let pendingFocus = null;
  let positionFrame = 0;
  const t = (fr, en) => document.documentElement.lang.startsWith('fr') ? fr : en;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const flag = code => /^[A-Z]{2}$/.test(code) ? [...code].map(character => String.fromCodePoint(127397 + character.charCodeAt(0))).join('') : '';

  function cleanup() {
    controllers.forEach((controller, select) => {
      if (!select.isConnected) {
        controller.dispose();
        controllers.delete(select);
      }
    });
  }

  function closeAll() {
    cleanup();
    controllers.forEach(controller => controller.close());
  }

  function mount(root = document) {
    if (!supported) return false;
    cleanup();
    const selects = [...root.querySelectorAll('select')];
    if (root.matches?.('select')) selects.unshift(root);
    selects.forEach(select => {
      if (select.multiple || select.size > 1 || select.hidden) return;
      if (controllers.has(select)) {
        controllers.get(select).sync();
        return;
      }
      const stem = select.id || select.dataset.change || `${select.form?.dataset.form || 'field'}-${select.name || ++sequence}`;
      const baseKey = `dfd-select-${stem.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      let key = baseKey;
      let duplicate = 1;
      while (document.getElementById(`${key}-trigger`)) key = `${baseKey}-${++duplicate}`;
      const delivery = select.dataset.change === 'country';
      const country = delivery || select.id === 'origin-filter' || /country/.test(select.id || select.name);
      const compact = delivery;
      const searchable = country || select.options.length >= 8;
      const originalLabel = [...select.labels].map(label => label.textContent.trim()).join(' ');
      const labelText = () => {
        const references = (select.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)?.textContent.trim()).filter(Boolean).join(' ');
        return select.getAttribute('aria-label') || references || originalLabel || t('Choisir une option', 'Choose an option');
      };
      const wrapper = document.createElement('div');
      wrapper.className = `dfd-select${compact ? ' dfd-select--compact' : ''}${country ? ' dfd-select--country' : ''}${searchable ? ' dfd-select--searchable' : ''}`;
      select.before(wrapper);
      wrapper.append(select);
      select.classList.add('dfd-select-native');
      select.tabIndex = -1;
      select.setAttribute('aria-hidden', 'true');

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.id = `${key}-trigger`;
      trigger.className = 'dfd-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', `${key}-options`);
      const panel = document.createElement('div');
      panel.id = `${key}-popover`;
      panel.className = `dfd-select-popover${country ? ' dfd-select-popover--country' : ''}${searchable ? ' dfd-select-popover--searchable' : ''}`;
      panel.setAttribute('popover', 'auto');
      const heading = delivery ? t('Destination de livraison', 'Delivery destination') : labelText().replace(/\s*\*$/, '');
      panel.innerHTML = `<div class="dfd-select-heading"><strong>${escape(heading)}</strong></div>${searchable ? `<div class="dfd-select-search">${searchIcon}<input type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${key}-options" autocomplete="off" spellcheck="false" placeholder="${escape(country ? t('Rechercher un pays…', 'Search for a country…') : t('Rechercher une option…', 'Search for an option…'))}" aria-label="${escape(country ? t('Rechercher un pays', 'Search for a country') : t('Rechercher une option', 'Search for an option'))}"></div>` : ''}<div class="dfd-select-options" id="${key}-options" role="listbox" aria-label="${escape(labelText())}"></div>${delivery ? `<div class="dfd-select-foot">${t('Les offres s’adaptent à votre pays de livraison.', 'Offers adapt to your delivery country.')}</div>` : ''}`;
      wrapper.append(trigger, panel);
      const list = panel.querySelector('.dfd-select-options');
      const search = panel.querySelector('input');
      let matching = [];
      let highlighted = -1;
      let typed = '';
      let typedAt = 0;
      const opened = () => panel.matches(':popover-open');
      const enabledIndexes = () => matching.reduce((indexes, option, index) => option.disabled ? indexes : [...indexes, index], []);

      function sync() {
        const selected = select.selectedOptions[0];
        const display = selected?.textContent.trim() || t('Choisir une option', 'Choose an option');
        const selectedFlag = country && selected ? flag(selected.value) : '';
        trigger.innerHTML = `${selectedFlag ? `<span class="dfd-select-flag" aria-hidden="true">${selectedFlag}</span>` : ''}<span class="dfd-select-value" id="${key}-value">${escape(display)}</span><span class="dfd-select-chevron">${chevron}</span>`;
        trigger.disabled = select.disabled;
        trigger.setAttribute('aria-label', `${labelText()} : ${display}`);
        const description = select.getAttribute('aria-describedby');
        if (description) trigger.setAttribute('aria-describedby', description);
        else trigger.removeAttribute('aria-describedby');
        if (select.required) trigger.setAttribute('aria-required', 'true');
        else trigger.removeAttribute('aria-required');
        const placeholder = !selected || (selected.value === '' && (select.required || selected.disabled));
        trigger.classList.toggle('is-placeholder', placeholder);
        if (select.getAttribute('aria-invalid') === 'true') {
          trigger.setAttribute('aria-invalid', 'true');
          trigger.classList.add('is-invalid');
        } else if (select.validity.valid) {
          trigger.removeAttribute('aria-invalid');
          trigger.classList.remove('is-invalid');
          trigger.removeAttribute('title');
        }
      }

      function draw() {
        const query = normalize(search?.value || '');
        matching = [...select.options].filter(option => normalize(option.textContent).includes(query)).map(option => ({
          index: option.index,
          label: option.textContent.trim(),
          value: option.value,
          disabled: option.disabled || (option.parentElement.tagName === 'OPTGROUP' && option.parentElement.disabled)
        }));
        highlighted = matching.findIndex(option => option.index === select.selectedIndex && !option.disabled);
        if (highlighted < 0) highlighted = enabledIndexes()[0] ?? -1;
        list.innerHTML = matching.length ? matching.map((option, index) => `<button type="button" role="option" tabindex="-1" id="${key}-option-${option.index}" class="dfd-select-option${option.index === select.selectedIndex ? ' is-selected' : ''}" aria-selected="${option.index === select.selectedIndex}" ${option.disabled ? 'disabled aria-disabled="true"' : ''} data-index="${index}">${country && flag(option.value) ? `<span class="dfd-select-flag" aria-hidden="true">${flag(option.value)}</span>` : ''}<span>${escape(option.label)}</span><span class="dfd-select-check" aria-hidden="true">${option.index === select.selectedIndex ? check : ''}</span></button>`).join('') : `<p class="dfd-select-empty" role="status">${country ? t('Aucun pays trouvé. Essayez une autre recherche.', 'No country found. Try another search.') : t('Aucune option trouvée. Essayez une autre recherche.', 'No option found. Try another search.')}</p>`;
        mark();
      }

      function mark(scroll = false) {
        [...list.querySelectorAll('.dfd-select-option')].forEach((option, index) => {
          option.classList.toggle('is-highlighted', index === highlighted);
          option.tabIndex = !search && opened() && index === highlighted ? 0 : -1;
        });
        const active = list.querySelector('.is-highlighted');
        if (search) {
          if (active && opened()) search.setAttribute('aria-activedescendant', active.id);
          else search.removeAttribute('aria-activedescendant');
        }
        if (scroll && active) active.scrollIntoView({block: 'nearest'});
      }

      function position() {
        if (!opened() || !trigger.isConnected) return;
        const margin = 12;
        const gap = 8;
        const rect = trigger.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) {close(); return;}
        const width = Math.min(Math.max(rect.width, country ? 320 : 250), viewportWidth - margin * 2);
        panel.style.width = `${width}px`;
        panel.style.maxHeight = `${Math.max(60, viewportHeight - margin * 2)}px`;
        const desiredHeight = Math.min(panel.scrollHeight, 440);
        const below = Math.max(0, viewportHeight - rect.bottom - gap - margin);
        const above = Math.max(0, rect.top - gap - margin);
        const openBelow = below >= desiredHeight || below >= above;
        const height = Math.min(desiredHeight, openBelow ? below : above);
        panel.style.maxHeight = `${Math.max(60, height)}px`;
        panel.style.left = `${Math.max(margin, Math.min(compact ? rect.right - width : rect.left, viewportWidth - width - margin))}px`;
        panel.style.top = `${Math.max(margin, Math.min(openBelow ? rect.bottom + gap : rect.top - height - gap, viewportHeight - height - margin))}px`;
      }

      function close(restore = false) {
        if (opened()) panel.hidePopover();
        trigger.setAttribute('aria-expanded', 'false');
        search?.setAttribute('aria-expanded', 'false');
        mark();
        if (restore && trigger.isConnected) trigger.focus({preventScroll: true});
      }

      function open(last = false) {
        if (trigger.disabled) return;
        closeAll();
        typed = '';
        if (search) search.value = '';
        draw();
        panel.style.visibility = 'hidden';
        panel.showPopover();
        trigger.setAttribute('aria-expanded', 'true');
        search?.setAttribute('aria-expanded', 'true');
        if (last && !matching.some(option => option.index === select.selectedIndex && !option.disabled)) highlighted = enabledIndexes().at(-1) ?? -1;
        position();
        panel.style.visibility = '';
        mark(true);
        if (search) search.focus({preventScroll: true});
        else list.querySelector('.is-highlighted')?.focus({preventScroll: true});
      }

      function choose(index) {
        const option = matching[index];
        if (!option || option.disabled) return;
        const changed = select.selectedIndex !== option.index;
        select.selectedIndex = option.index;
        close();
        sync();
        const previousHash = location.hash;
        pendingFocus = {id: trigger.id, until: Date.now() + 1500};
        if (changed) select.dispatchEvent(new Event('change', {bubbles: true}));
        const replacement = document.getElementById(trigger.id);
        if (replacement) replacement.focus({preventScroll: true});
        if (!changed || (select.isConnected && location.hash === previousHash)) pendingFocus = null;
      }

      trigger.addEventListener('click', event => {
        event.preventDefault();
        opened() ? close(true) : open();
      });
      trigger.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          open(event.key === 'ArrowUp');
        }
      });
      panel.addEventListener('toggle', event => {
        const isOpen = event.newState === 'open';
        trigger.setAttribute('aria-expanded', String(isOpen));
        search?.setAttribute('aria-expanded', String(isOpen));
        mark();
      });
      search?.addEventListener('input', () => {draw(); position();});
      list.addEventListener('click', event => {
        const option = event.target.closest('[data-index]');
        if (option && list.contains(option)) {event.preventDefault(); choose(Number(option.dataset.index));}
      });
      list.addEventListener('pointermove', event => {
        const option = event.target.closest('[data-index]');
        if (option && !option.disabled) {highlighted = Number(option.dataset.index); mark();}
      });
      panel.addEventListener('keydown', event => {
        if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); close(true); return;}
        if (event.key === 'Tab') {
          // Move from the trigger's normal place in the form, then let the browser advance.
          close(true);
          return;
        }
        const indexes = enabledIndexes();
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          if (!indexes.length) return;
          const current = indexes.indexOf(highlighted);
          if (event.key === 'Home') highlighted = indexes[0];
          else if (event.key === 'End') highlighted = indexes.at(-1);
          else highlighted = indexes[(current + (event.key === 'ArrowDown' ? 1 : -1) + indexes.length) % indexes.length];
          mark(true);
          if (!search) list.querySelector('.is-highlighted')?.focus({preventScroll: true});
        } else if (event.key === 'Enter' || (event.key === ' ' && !search)) {
          event.preventDefault();
          choose(highlighted);
        } else if (!search && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const now = Date.now();
          typed = now - typedAt < 700 ? typed + event.key : event.key;
          typedAt = now;
          const repeated = [...typed].every(character => normalize(character) === normalize(typed[0]));
          const query = normalize(repeated ? event.key : typed);
          const start = repeated ? indexes.indexOf(highlighted) + 1 : 0;
          const ordered = indexes.slice(start).concat(indexes.slice(0, start));
          const match = ordered.find(index => normalize(matching[index].label).startsWith(query));
          if (match !== undefined) {highlighted = match; mark(true); list.querySelector('.is-highlighted')?.focus({preventScroll: true});}
        }
      });
      const onChange = () => {sync(); if (opened()) draw();};
      const onFocus = () => trigger.focus({preventScroll: true});
      const onInvalid = event => {
        event.preventDefault();
        trigger.setAttribute('aria-invalid', 'true');
        trigger.classList.add('is-invalid');
        trigger.title = select.validationMessage;
        trigger.focus({preventScroll: true});
      };
      select.addEventListener('change', onChange);
      select.addEventListener('focus', onFocus);
      select.addEventListener('invalid', onInvalid);
      const observer = new MutationObserver(() => {sync(); if (opened()) {draw(); position();}});
      observer.observe(select, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'required', 'selected', 'label', 'value', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid']});
      controllers.set(select, {select, trigger, sync, close, position, dispose() {
        close();
        observer.disconnect();
        select.removeEventListener('change', onChange);
        select.removeEventListener('focus', onFocus);
        select.removeEventListener('invalid', onInvalid);
      }});
      sync();
      draw();
    });
    if (pendingFocus) {
      if (Date.now() > pendingFocus.until) pendingFocus = null;
      else {
        const replacement = document.getElementById(pendingFocus.id);
        if (replacement) {replacement.focus({preventScroll: true}); pendingFocus = null; return true;}
      }
    }
    return false;
  }

  function reposition() {
    if (positionFrame) return;
    positionFrame = requestAnimationFrame(() => {
      positionFrame = 0;
      cleanup();
      controllers.forEach(controller => controller.position());
    });
  }
  window.addEventListener('resize', reposition);
  document.addEventListener('scroll', event => {
    if (!event.target.closest?.('.dfd-select-popover')) reposition();
  }, true);
  document.addEventListener('click', event => {
    const label = event.target.closest('label');
    if (!label || event.target.closest('.dfd-select') || event.target.closest('a,button,input')) return;
    const controller = controllers.get(label.control);
    if (controller) {event.preventDefault(); controller.trigger.focus({preventScroll: true});}
  });
  document.addEventListener('reset', event => {
    setTimeout(() => controllers.forEach(controller => {
      if (controller.select.form === event.target) {controller.close(); controller.sync();}
    }), 0);
  });
  return {mount, closeAll};
})();
