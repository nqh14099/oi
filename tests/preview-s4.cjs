const { chromium } = require(process.env.PW || 'playwright-core'); const path = require('path'); const [file, out] = process.argv.slice(2);
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.setDefaultTimeout(200000); await p.goto('file://' + file); await p.waitForFunction(() => window.CPVApp?.world, null, { timeout: 120000 });
  const E = (f, a) => p.evaluate(f, a); const fr = n => E(k => new Promise(r => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  for (const bt of [0, 1, 2]) { await E(x => CPVApp.navigation.goToScene(4, x), bt); await fr(1); await E(() => { CPVApp.world.director.finish('qa'); window.__cpvArchive.formations.forEach(f => f.seek(1)); }); await fr(24); await p.screenshot({ path: path.join(out, `s4f-b${bt}.jpg`), type: 'jpeg', quality: 85 }); }
  console.log('errors', JSON.stringify(await E(() => CPVApp.getErrors()))); await b.close(); })();
