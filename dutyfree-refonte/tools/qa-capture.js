// Playwright CLI run-code script: npx playwright-cli -s=refonte run-code --filename=tools/qa-capture.js
// Loads every lazy image by scrolling, checks broken images and horizontal overflow, then captures
// the first viewport and the full page in slices into .playwright-cli/shots/.
async page => {
  const width = page.viewportSize().width;
  const route = await page.evaluate(() => (location.hash || '#/').replace(/^#\/?/, '').replace(/[^a-z0-9]+/gi, '-') || 'home');
  const dir = '.playwright-cli/shots';
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 500) {
    await page.evaluate(top => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(async () => {
    await Promise.all([...document.images].map(img => (img.complete ? null : new Promise(done => { img.onload = done; img.onerror = done; }))));
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const report = await page.evaluate(() => ({
    url: location.href,
    viewport: `${innerWidth}x${innerHeight}`,
    images: document.images.length,
    broken: [...document.images].filter(img => !img.naturalWidth).map(img => img.getAttribute('src')),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight
  }));
  await page.screenshot({ path: `${dir}/${route}-${width}-viewport.png` });
  const slices = [];
  for (let y = 0, i = 0; y < report.height; y += 1100, i++) {
    const path = `${dir}/${route}-${width}-part${i}.png`;
    await page.screenshot({ path, fullPage: true, clip: { x: 0, y, width, height: Math.min(1100, report.height - y) } });
    slices.push(path);
  }
  return { ...report, slices };
}
