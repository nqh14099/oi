// Preview captures for Scenes 1, 2, 4, 9 (two+ beats each) + Scene 1→2 emblem match morph.
const { chromium } = require(process.env.PW || 'playwright-core'); const fs = require('fs'), path = require('path');
const [file, out] = process.argv.slice(2); const log = []; const rec = x => { log.push(x); fs.writeFileSync(path.join(out, 'preview.json'), JSON.stringify(log, null, 1)); };
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await b.newPage({ viewport: { width: 1600, height: 900 } }); page.setDefaultTimeout(300000); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); await page.goto('file://' + file); await page.waitForFunction(() => window.CPVApp?.world, null, { timeout: 120000 });
  const E = (f, a) => page.evaluate(f, a); const frames = n => E(k => new Promise(r => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  const go = async (s, bt, n) => { await E(([x, y]) => CPVApp.navigation.goToScene(x, y), [s, bt]); await frames(1); await E(() => CPVApp.world.director.finish('qa')); await frames(n); };
  const snap = async (name) => { await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 85 }); rec({ name, t: Date.now(), framing: await E(() => CPVApp.world.director.getState().framing), cam: await E(() => CPVApp.world.director.getState().effective) }); };
  for (const [s, bt, n] of [[1, 0, 10], [1, 1, 10], [4, 0, 10], [4, 1, 10], [4, 2, 10], [9, 0, 14], [9, 1, 14], [9, 2, 14], [2, 0, 4], [2, 2, 8]]) { await go(s, bt, n); await snap(`s${s}-b${bt}`); }
  await go(1, 1, 4); await E(() => CPVApp.world.director.pauseClock(true)); await E(() => CPVApp.navigation.next());
  for (const p of [.3, .5, .7]) { await E(v => CPVApp.world.director.seek(v), p); await frames(2); await snap(`tr12-${p * 100}`); }
  rec({ errors, appErrors: await E(() => CPVApp.getErrors()), status: await E(() => CPVApp.world.getStatus().mode) }); await b.close();
})().catch(e => { rec({ crash: e.message }); process.exit(1); });
