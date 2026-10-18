// Measures real frame cost per scene under the current browser (SwiftShader here).
const { chromium } = require(process.env.PW || 'playwright-core');
(async () => {
  const [file, w = '1600', h = '900', quality = 'high'] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  page.setDefaultTimeout(240000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + file); await page.waitForFunction(() => window.CPVApp?.world, null, { timeout: 90000 });
  await page.evaluate(q => CPVApp.world.setQuality(q), quality); await page.evaluate(s => CPVApp.world.setRenderScale(s), +(process.env.SCALE||1));
  console.log('keys', await page.evaluate(() => Object.keys(CPVApp).join(',')));
  for (const id of (process.env.IDS||'1,2,3,4,5,6,7,8,9,10,11,15').split(',').map(Number)) {
    const t0 = Date.now();
    await page.evaluate(i => CPVApp.navigation.goToScene(i), id);
    const ms = await page.evaluate(() => new Promise(res => { let n = 0; const s = performance.now(); const f = () => { if (++n >= 4) res((performance.now() - s) / 4); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
    await page.evaluate(() => CPVApp.world.director.finish('probe'));
    const ms2 = await page.evaluate(() => new Promise(res => { let n = 0; const s = performance.now(); const f = () => { if (++n >= 3) res((performance.now() - s) / 3); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
    console.log(`scene ${id}: handoff frame ${ms.toFixed(0)} ms, settled frame ${ms2.toFixed(0)} ms, wall ${Date.now() - t0} ms`);
  }
  console.log('errors', errors.slice(0, 5));
  await browser.close();
})();
