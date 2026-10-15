'use strict';

// Keep the original selects as the source of truth for forms and existing change handlers.
window.dropdownUI = (() => {
  const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  const searchIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>';
  const flags = {'United States':'🇺🇸',France:'🇫🇷','United Kingdom':'🇬🇧','United Arab Emirates':'🇦🇪',Canada:'🇨🇦',Italy:'🇮🇹',Japan:'🇯🇵',Germany:'🇩🇪',Switzerland:'🇨🇭',Portugal:'🇵🇹',Denmark:'🇩🇰','South Korea':'🇰🇷',China:'🇨🇳',Other:'🌐'};
  let controllers = [];
  let sequence = 0;
  const text = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = label => label.replace(/[\u{1F1E6}-\u{1F1FF}]/gu,'').trim();
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function closeAll() { controllers.forEach(c => c.close()); }
  function mount(root = document) {
    controllers = controllers.filter(c => c.select.isConnected);
    root.querySelectorAll('select:not([data-custom-select])').forEach(select => {
      if (typeof HTMLElement.prototype.showPopover !== 'function') return;
      select.dataset.customSelect = 'true';
      const key = select.id || `select-${++sequence}`;
      const isDelivery = ['destination','summary-destination'].includes(select.id);
      const isCountry = isDelivery || select.id === 'vendor-country';
      const compact = select.id === 'destination';
      const label = select.getAttribute('aria-label') || select.labels[0]?.textContent.trim() || 'Choose an option';
      const options = [...select.options].filter(o => o.value !== '' && !o.disabled).map(o => ({value:o.value,label:clean(o.textContent),flag:isCountry ? flags[clean(o.textContent)] || '🌐' : ''}));
      const wrapper = document.createElement('div');
      wrapper.className = `custom-select${compact?' custom-select--compact':''}${isCountry?' custom-select--country':''}`;
      select.before(wrapper);
      wrapper.append(select);
      select.classList.add('select-native');
      select.tabIndex = -1;
      select.setAttribute('aria-hidden','true');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'select-trigger';
      button.id = `${key}-trigger`;
      button.setAttribute('aria-label',label);
      button.setAttribute('aria-haspopup','listbox');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-controls',`${key}-options`);
      button.disabled = select.disabled;
      const panel = document.createElement('div');
      panel.className = `select-popover${isCountry?' select-popover--country':''}`;
      panel.id = `${key}-popover`;
      panel.setAttribute('popover','auto');
      panel.innerHTML = `${isCountry?`<div class="select-panel-head"><span>${isDelivery?'DELIVERY DESTINATION':'CHOOSE YOUR COUNTRY'}</span>${isDelivery?'<small>Prices shown in USD</small>':''}</div><div class="select-search">${searchIcon}<input type="search" placeholder="Search a country…" aria-label="Search a country" autocomplete="off" spellcheck="false"></div>`:''}<div class="select-options" id="${key}-options" role="listbox" aria-label="${text(label)}"></div>${isDelivery?'<div class="select-panel-foot">Shipping & tax estimates update automatically.</div>':''}`;
      wrapper.append(button,panel);
      const list = panel.querySelector('.select-options');
      const search = panel.querySelector('input');
      if(search)search.setAttribute('aria-controls',`${key}-options`);
      let highlighted = -1;
      let matching = options;
      let lastTyped = '';
      let typedAt = 0;
      const opened = () => panel.matches(':popover-open');
      function sync() {
        const current = options.find(o => o.value === select.value);
        const display = current?.label || select.selectedOptions[0]?.textContent || 'Choose an option';
        button.innerHTML = `${current?.flag?`<span class="select-flag" aria-hidden="true">${current.flag}</span>`:''}<span class="select-value" id="${key}-value">${text(display)}</span><span class="select-chevron">${chevron}</span>`;
        button.setAttribute('aria-describedby',`${key}-value`);
        button.classList.toggle('is-placeholder',!select.value);
        button.removeAttribute('aria-invalid');
      }
      function draw() {
        matching = options.filter(o => normalize(o.label).includes(normalize(search?.value || '')));
        highlighted = matching.findIndex(o => o.value === select.value);
        list.innerHTML = matching.length ? matching.map((o,i) => `<button type="button" role="option" tabindex="-1" id="${key}-option-${i}" class="select-option${o.value===select.value?' is-selected':''}" aria-selected="${o.value===select.value}" data-index="${i}">${o.flag?`<span class="select-option-flag" aria-hidden="true">${o.flag}</span>`:''}<span>${text(o.label)}</span><span class="select-option-check">${o.value===select.value?check:''}</span></button>`).join('') : '<p class="select-empty" role="status">No country found. Try another search.</p>';
        mark();
      }
      function mark() {
        [...list.querySelectorAll('.select-option')].forEach((o,i) => o.classList.toggle('is-highlighted',i===highlighted));
        const active = list.querySelector('.is-highlighted');
        if (search) { if(active) search.setAttribute('aria-activedescendant',active.id); else search.removeAttribute('aria-activedescendant'); }
      }
      function position() {
        if (!opened()) return;
        const rect = button.getBoundingClientRect();
        const width = Math.min(isCountry?Math.max(rect.width,320):Math.max(rect.width,230),window.innerWidth-24);
        const height = Math.min(panel.scrollHeight,window.innerHeight-24);
        const roomBelow = window.innerHeight-rect.bottom-12;
        const below = roomBelow>=height || roomBelow>=rect.top-12;
        panel.style.width = `${width}px`;
        panel.style.left = `${Math.max(12,Math.min(compact?rect.right-width:rect.left,window.innerWidth-width-12))}px`;
        panel.style.top = `${Math.max(12,below?rect.bottom+10:rect.top-height-10)}px`;
        panel.style.maxHeight = `${Math.max(100,below?roomBelow-10:rect.top-22)}px`;
      }
      function close(focus=false) { if(opened())panel.hidePopover(); if(focus&&button.isConnected)button.focus({preventScroll:true}); }
      function open(keyboard=false) {
        closeAll();
        if(search)search.value='';
        draw();
        panel.showPopover();
        position();
        if(search)search.focus({preventScroll:true});
        else if(keyboard)list.querySelectorAll('.select-option')[Math.max(0,highlighted)]?.focus({preventScroll:true});
      }
      function choose(index) {
        const option=matching[index]; if(!option)return;
        const changed=select.value!==option.value;
        select.value=option.value;
        close();sync();
        if(changed)select.dispatchEvent(new Event('change',{bubbles:true}));
        const replacement=document.getElementById(`${key}-trigger`);
        (replacement||button).focus({preventScroll:true});
      }
      button.addEventListener('click',e => {e.preventDefault();opened()?close():open();});
      button.addEventListener('keydown',e => {
        if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open(true);}
      });
      panel.addEventListener('toggle',e => {button.setAttribute('aria-expanded',String(e.newState==='open'));});
      search?.addEventListener('input',() => {draw();position();});
      list.addEventListener('click',e => {const option=e.target.closest('[data-index]');if(option){e.preventDefault();choose(Number(option.dataset.index));}});
      panel.addEventListener('keydown',e => {
        if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}
        if(e.key==='Tab'){close();return;}
        if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
          e.preventDefault();
          if(!matching.length)return;
          if(e.key==='Home')highlighted=0;
          else if(e.key==='End')highlighted=matching.length-1;
          else highlighted=highlighted<0?(e.key==='ArrowDown'?0:matching.length-1):(highlighted+(e.key==='ArrowDown'?1:-1)+matching.length)%matching.length;
          mark();
          const active=list.querySelectorAll('.select-option')[highlighted];
          if(!search)active.focus({preventScroll:true});
          active.scrollIntoView({block:'nearest'});
        } else if(e.key==='Enter'||(e.key===' '&&!search)) {e.preventDefault();choose(highlighted<0?0:highlighted);}
        else if(!search&&e.key.length===1){const now=Date.now();lastTyped=(now-typedAt<600?lastTyped:'')+e.key;typedAt=now;highlighted=matching.findIndex(o=>normalize(o.label).startsWith(normalize(lastTyped)));mark();list.querySelectorAll('.select-option')[highlighted]?.focus({preventScroll:true});}
      });
      select.addEventListener('change',sync);
      select.addEventListener('focus',() => button.focus());
      select.addEventListener('invalid',e => {e.preventDefault();button.setAttribute('aria-invalid','true');button.focus();});
      [...select.labels].forEach(labelElement => {if(labelElement.htmlFor===select.id)labelElement.addEventListener('click',e=>{e.preventDefault();button.focus();});});
      controllers.push({select,close,position});
      sync();draw();
    });
  }
  window.addEventListener('resize',() => controllers.forEach(c=>c.position()));
  document.addEventListener('scroll',e => {if(!e.target.closest?.('.select-popover'))controllers.forEach(c=>c.position());},true);
  return {mount,closeAll};
})();
