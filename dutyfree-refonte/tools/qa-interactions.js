// Playwright CLI run-code script: npx playwright-cli -s=refonte run-code --filename=tools/qa-interactions.js
// Exercises the home page interactions and returns a list of checks; screenshots land in .playwright-cli/shots/.
async page => {
  const shots = '.playwright-cli/shots';
  const width = page.viewportSize().width;
  const checks = [];
  const check = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail: String(detail) });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('http://127.0.0.1:4181/#/');
  await page.evaluate(() => { localStorage.removeItem('dutyfreedeal-refonte-v1'); });
  await page.reload();
  await page.waitForSelector('.cover-title');

  // 1. Cover search with suggestions and keyboard
  const cover = page.locator('#q-cover');
  await cover.click();
  await cover.pressSequentially('par', { delay: 30 });
  await page.waitForTimeout(150);
  const options = await page.locator('#q-cover-list [role="option"]').count();
  check('Suggestions shown for "par"', options >= 3, `${options} options`);
  await cover.press('ArrowDown');
  const active = await cover.getAttribute('aria-activedescendant');
  check('ArrowDown sets aria-activedescendant', active && active.startsWith('q-cover-list-opt'), active);
  await page.screenshot({ path: `${shots}/state-${width}-suggestions.png` });
  await cover.press('Escape');
  check('Escape closes suggestions', await page.locator('#q-cover-list').isHidden());
  check('Draft kept after Escape', (await cover.inputValue()) === 'par');

  // 2. Destination change keeps the draft and moves focus back to the control
  await page.locator('#destination-btn').click();
  await page.waitForTimeout(120);
  check('Destination popover opens', await page.locator('#destination-pop').isVisible());
  const counts = await page.locator('.country-count').allTextContents();
  check('Countries show deliverable counts before switching', counts.length === 4 && counts.every(c => /\d|Aucune/.test(c)), counts.join(' | '));
  await page.screenshot({ path: `${shots}/state-${width}-destination.png` });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  check('Destination now Spain', (await page.locator('#destination-btn .setting-value').textContent()).includes('Espagne'));
  check('Cover search label follows destination', (await page.locator('.search--cover .search-label').textContent()).includes('en Espagne'));
  check('Draft kept after destination change', (await page.locator('#q-cover').inputValue()) === 'par');
  check('Focus returned to destination control', await page.evaluate(() => document.activeElement?.id === 'destination-btn'));
  const live = await page.locator('#live').textContent();
  check('Destination change announced', live.includes('Espagne'), live);
  const origins = await page.locator('.legend .route-visual').allTextContents();
  check('Showcase offers deliver to Spain', origins.length === 3, origins.join(' | '));

  // 3. Language: EN, idempotent second click, draft kept
  await page.locator('[data-action="set-lang"][data-lang="en"]').click();
  await page.waitForTimeout(150);
  check('Language switched to English', (await page.locator('html').getAttribute('lang')) === 'en' && (await page.locator('.cover-title').textContent()).includes('without going'));
  check('Delivery country unchanged by language', (await page.locator('#destination-btn .setting-value').textContent()).includes('Spain'));
  check('Draft kept after language change', (await page.locator('#q-cover').inputValue()) === 'par');
  check('Focus kept on the EN button', await page.evaluate(() => document.activeElement?.dataset?.lang === 'en'));
  const before = await page.locator('main').innerHTML();
  await page.locator('[data-action="set-lang"][data-lang="en"]').click();
  check('Clicking the active language changes nothing', before === (await page.locator('main').innerHTML()));
  await page.screenshot({ path: `${shots}/state-${width}-english.png` });
  await page.locator('[data-action="set-lang"][data-lang="fr"]').click();
  await page.locator('#destination-btn').click();
  await page.locator('#country-FR').click();
  await page.waitForTimeout(150);

  // 4. Departments menu: keyboard, filter, Escape
  await page.locator('#rayons-btn').click();
  await page.waitForTimeout(150);
  check('Departments menu opens with 15 departments', (await page.locator('.rayon-option').count()) === 15);
  check('Focus on the active department', await page.evaluate(() => document.activeElement?.classList.contains('rayon-option')));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const current = await page.locator('.rayon-option[aria-current="true"]').textContent();
  check('ArrowDown changes the active department', current.trim().length > 0, current.trim());
  await page.screenshot({ path: `${shots}/state-${width}-rayons-menu.png` });
  await page.locator('#rayons-filter').fill('parf');
  await page.waitForTimeout(100);
  const filtered = await page.locator('.rayon-option').allTextContents();
  check('Filter narrows departments', filtered.length >= 1 && filtered.length < 15, filtered.map(s => s.trim()).join(' | '));
  await page.screenshot({ path: `${shots}/state-${width}-rayons-filter.png` });
  await page.keyboard.press('Escape');
  check('Escape closes the menu', await page.locator('#rayons-menu').isHidden());
  check('Focus back on the menu button', await page.evaluate(() => document.activeElement?.id === 'rayons-btn'));

  // 5. Cart: add from the showcase, toast, drawer grouped by seller
  await page.locator('.legend [data-action="add"]').first().click();
  await page.locator('.legend [data-action="add"]').nth(1).click();
  await page.waitForTimeout(150);
  check('Cart badge shows 2', (await page.locator('[data-badge="cart"]').textContent()) === '2');
  check('Toast offers to view the cart', await page.locator('.toast [data-action="open-cart"]').isVisible());
  check('Draft kept after adding to cart', (await page.locator('#q-cover').inputValue()) === 'par');
  await page.screenshot({ path: `${shots}/state-${width}-toast.png` });
  await page.locator('.toast [data-action="open-cart"]').click();
  await page.waitForTimeout(400);
  check('Drawer opens', await page.locator('#cart-drawer').isVisible());
  check('Drawer groups by seller', (await page.locator('#cart-drawer .shipment').count()) === 2);
  await page.screenshot({ path: `${shots}/state-${width}-cart.png` });
  await page.locator('#cart-drawer [data-action="qty"][data-step="1"]').first().click();
  check('Quantity increases', (await page.locator('#cart-drawer .qty output').first().textContent()) === '2');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  check('Escape closes the drawer', !(await page.locator('#cart-drawer').isVisible()));

  // 6. Favourite
  const fav = page.locator('.promises [data-action="favorite"]').first();
  await fav.click();
  check('Favourite pressed', (await fav.getAttribute('aria-pressed')) === 'true');
  check('Favourites badge shows 1', (await page.locator('[data-badge="favorites"]').textContent()) === '1');

  // 7. Header search appears once the cover search scrolls away, with the same draft
  check('Header search hidden at top of home', (await page.locator('.site-header').getAttribute('data-search')) === 'hidden');
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(400);
  check('Header search visible after scrolling', (await page.locator('.site-header').getAttribute('data-search')) === 'visible');
  check('Header search mirrors the draft', (await page.locator('#q-header').inputValue()) === 'par');
  await page.screenshot({ path: `${shots}/state-${width}-scrolled.png` });

  // 8. Quote request for large goods
  await page.locator('.large [data-action="quote"]').first().scrollIntoViewIfNeeded();
  await page.locator('.large [data-action="quote"]').first().click();
  await page.waitForTimeout(300);
  check('Quote dialog opens', await page.locator('#quote-dialog').isVisible());
  await page.locator('#quote-dialog button[type="submit"]').click();
  check('Empty submit shows errors', await page.locator('#quote-name-error').isVisible());
  await page.screenshot({ path: `${shots}/state-${width}-quote-errors.png` });
  await page.locator('#quote-name').fill('Camille Testeur');
  await page.locator('#quote-email').fill('camille@exemple.fr');
  await page.locator('#quote-dialog button[type="submit"]').click();
  await page.waitForTimeout(150);
  check('Request saved locally', (await page.locator('#quote-dialog .quote-done').textContent()).includes('DEM-'));
  await page.locator('#quote-dialog .modal-actions .btn').click();
  await page.waitForTimeout(150);
  check('Focus back on the quote button', await page.evaluate(() => document.activeElement?.dataset?.action === 'quote'));

  // 9. Logo returns to the top of home
  await page.locator('.wordmark').first().click();
  await page.waitForTimeout(900);
  check('Logo scrolls back to the top', (await page.evaluate(() => window.scrollY)) < 5);

  // 10. Search submit opens results
  await page.locator('#q-cover').fill('casque');
  await page.locator('#q-cover').press('Enter');
  await page.waitForTimeout(300);
  check('Search opens results', page.url().includes('#/catalog?q=casque') && (await page.locator('.offer-card').count()) > 0, page.url());

  const storage = await page.evaluate(() => Object.keys(localStorage));
  check('Own storage key only', storage.includes('dutyfreedeal-refonte-v1') && !storage.includes('dutyfreedeal-candidate-v3'), storage.join(','));
  check('No console or page errors', errors.length === 0, errors.join(' | '));
  return { passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok), total: checks.length, checks: checks.map(c => `${c.ok ? 'OK ' : 'NO '} ${c.name}${c.detail ? ` (${c.detail})` : ''}`) };
}
