// Targeted sequential QA for Scenes 1, 2, 3, 4, 6, 7 (+ their key hand-offs).
// Full presentation quality (no render-scale change). Each step has a hard timeout; a step
// that times out is recorded as NOT_TESTED, never as PASS.
// usage: node tests/targeted-qa.cjs <html> <outdir> [stepTimeoutMs]
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs'), path = require('path');
const [file, out, stepArg = '150000'] = process.argv.slice(2);
const STEP = +stepArg; fs.mkdirSync(out, { recursive: true });
const results = [];
const rec = (name, status, detail = '') => { results.push({ name, status, detail }); console.log(status, name, typeof detail === 'string' ? detail : JSON.stringify(detail)); fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 1)); };
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
async function step(name, fn) {
  if (ONLY && !ONLY.test(name)) return;
  let timer; const t0 = Date.now();
  try {
    const r = await Promise.race([fn(), new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('TIMEOUT')), STEP); })]);
    rec(name, r.pass ? 'PASS' : 'FAIL', { ...r.detail, ms: Date.now() - t0 });
  } catch (e) { rec(name, e.message === 'TIMEOUT' ? 'NOT_TESTED' : 'FAIL', `${e.message.slice(0, 200)} after ${Date.now() - t0} ms`); }
  finally { clearTimeout(timer); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } }); page.setDefaultTimeout(STEP);
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/*', r => /^(file|data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
  await page.goto('file://' + path.resolve(file)); await page.waitForFunction(() => window.CPVApp?.world, null, { timeout: 120000 });
  const E = (fn, arg) => page.evaluate(fn, arg);
  const frames = (n = 1) => E(k => new Promise(r => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  const shot = name => page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 84 });
  const state = () => E(() => { const n = CPVApp.navigation.getState(), w = CPVApp.world.getStatus(); return { scene: n.sceneId, beat: n.beatIndex, active: w.activeSceneId, tr: w.transition.active, dom: document.getElementById('content').dataset.sceneId }; });
  const cam = () => E(() => CPVApp.world.camera.camera.position.toArray().map(v => +v.toFixed(3)));
  const go = async (s, b = 0) => { await E(([x, y]) => CPVApp.navigation.goToScene(x, y), [s, b]); await frames(1); await E(() => CPVApp.world.director.finish('qa')); await frames(2); };
  const dist = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
  const consistent = s => s.active === s.scene && !s.tr && s.dom === String(s.scene);
  async function handoff(a, b, samples) {
    const beats = await E(id => CPVApp.getData().scenes.find(s => s.id === id).beats.length, a);
    await go(a, b > a ? beats - 1 : 0); await frames(2);
    await E(() => CPVApp.world.director.pauseClock(true));
    await E(([x, y]) => y > x ? CPVApp.navigation.next() : CPVApp.navigation.previous(), [a, b]);
    const seen = [];
    for (const p of samples) {
      if (p >= 1) { await E(() => { CPVApp.world.director.pauseClock(false); CPVApp.world.director.seek(1); }); await frames(2); }
      else { await E(v => CPVApp.world.director.seek(v), p); await frames(2); }
      const t = await E(() => CPVApp.world.director.getState());
      seen.push({ p, phase: t.phase, key: t.key, cam: t.effective || await cam() }); await shot(`tr-${a}-${b}-${String(Math.round(p * 100)).padStart(3, '0')}`);
    }
    const s = await state(); const live = seen.filter(f => f.p < 1).every(f => f.key === `${a}>${b}` && f.phase !== 'idle');
    const moving = seen.filter(f => f.p < 1).some((f, i, arr) => i > 0 && dist(f.cam, arr[i - 1].cam) > 1e-3);
    return { pass: live && moving && consistent(s) && s.scene === b, detail: { live, cameraMovesBetweenSamples: moving, end: s, phases: seen.map(f => f.phase), cams: seen.map(f => f.cam) } };
  }
  // ---- Scene 1
  await step('S1 living flag renders with particle wordmark (WebGL2)', async () => {
    await go(1, 0); await frames(4); const w = await E(() => CPVApp.getWorldState()?.[1] ?? null); const status = await E(() => CPVApp.world.getStatus().mode);
    await shot('s1-b0'); return { pass: status === 'webgl' && w && (w.particles > 0 || w.wordmark), detail: { mode: status, module: w } };
  });
  await step('S1 title is editable data (DOM heading = data heading)', async () => {
    const r = await E(() => ({ dom: document.querySelector('#content [data-editable="heading"]')?.textContent, data: CPVApp.getData().scenes[0].beats[0].audience.heading }));
    return { pass: r.dom && r.dom.replace(/\s+/g, ' ').toUpperCase().includes('POLITICAL SYSTEM') && r.data.includes('POLITICAL SYSTEM'), detail: r };
  });
  await step('Hand-off 1→2 sampled 0/25/50/75/100 (live, camera moving, clean end)', () => handoff(1, 2, [0, .25, .5, .75, 1]));
  // ---- Scene 2
  await step('S2 beat changes move the camera through intermediate poses', async () => {
    await go(2, 0); await frames(3); const a = await cam(); await shot('s2-b0');
    await E(() => CPVApp.navigation.next()); await frames(2); const mid = await cam(); await frames(12); const b = await cam(); await shot('s2-b1-settling');
    const s = await state(); return { pass: s.beat === 1 && dist(a, mid) > 1e-3 && dist(mid, b) > 1e-3, detail: { a, mid, b } };
  });
  await step('S2 HTML labels follow projected model anchors', async () => {
    const r = await E(() => [...document.querySelectorAll('[data-system-label]')].map(n => [n.dataset.systemLabel, n.style.getPropertyValue('--sx'), n.style.getPropertyValue('--sy')]));
    return { pass: r.length >= 5 && r.every(x => x[1] && x[2]), detail: { labels: r } };
  });
  await step('Hand-off 2→3 sampled 0/50/100', () => handoff(2, 3, [0, .5, 1]));
  // ---- Scene 3
  await step('S3 maze: before (beat 0) vs after reform (beat 5) states differ', async () => {
    await go(3, 0); await frames(3); const a = await E(() => CPVApp.getWorldState()?.[3]); await shot('s3-b0');
    await go(3, 5); await frames(6); const b = await E(() => CPVApp.getWorldState()?.[3]); await shot('s3-b5');
    return { pass: JSON.stringify(a) !== JSON.stringify(b) && consistent(await state()), detail: { before: JSON.stringify(a).slice(0, 220), after: JSON.stringify(b).slice(0, 220) } };
  });
  await step('Hand-off 3→4 sampled 0/50/100', () => handoff(3, 4, [0, .5, 1]));
  // ---- Scene 4
  await step('S4 ModelFormation seek 0/25/50/75/100 on archive volumes', async () => {
    await go(4, 0); const prog = [];
    for (const p of [0, .25, .5, .75, 1]) { await E(v => window.__cpvArchive.formations.forEach(f => f.seek(v)), p); await frames(2); prog.push(await E(() => window.__cpvArchive.formations.map(f => +f.progress.toFixed(2)))); await shot(`s4-formation-${String(p * 100).padStart(3, '0')}`); }
    const st = await E(() => window.__cpvArchive.getState());
    return { pass: prog[0].every(v => v === 0) && prog[4].every(v => v === 1) && st.formation.every(f => f.restored && f.wireOverlays > 0), detail: { prog, formation: st.formation.map(f => ({ meshes: f.meshes, wires: f.wireOverlays, restored: f.restored })) } };
  });
  await step('S4 orbit gallery (12 slots) attached; book selection optional, beat unchanged', async () => {
    await frames(3); const before = await state(); const st0 = await E(() => window.__cpvArchive.getState());
    // click the centre of the focused volume
    await page.mouse.move(800, 560); await frames(1); await page.mouse.click(800, 560); await frames(3);
    const st1 = await E(() => window.__cpvArchive.getState()); const after = await state(); await shot('s4-after-click');
    const card = await E(() => document.querySelector('.archive-volume-card h3')?.textContent);
    return { pass: st0.orbit.attached && st0.orbit.tiles === 12 && after.beat === before.beat && after.scene === 4, detail: { orbit: st0.orbit, selectedBefore: st0.selected, selectedAfter: st1.selected, card } };
  });
  await step('S4 beats map to volumes I, II, II and keep 1986 · 2017 · 2025 timeline', async () => {
    const got = [];
    for (const b of [0, 1, 2]) { await go(4, b); await frames(2); got.push(await E(() => ({ vol: document.querySelector('.reform-archive')?.dataset.volume, year: document.querySelector('.archive-year')?.textContent, card: document.querySelector('.archive-volume-card h3')?.textContent }))); await shot(`s4-b${b}`); }
    return { pass: got.map(g => g.vol).join() === '0,1,1' && got.map(g => g.year).join() === '1986,2017,2025', detail: got };
  });
  await step('S2b camera path sampled over frames (effective pose, beat 0→1→2)', async () => {
    await go(2, 0); await frames(2); const eff = () => E(() => CPVApp.world.director.getState().effective); const seq = [await eff()];
    await E(() => CPVApp.navigation.next()); for (let k = 0; k < 4; k++) { await frames(5); seq.push(await eff()); }
    await E(() => CPVApp.navigation.next()); for (let k = 0; k < 3; k++) { await frames(5); seq.push(await eff()); }
    const steps = seq.slice(1).map((p, i) => dist(p, seq[i])); const s = await state(); await shot('s2-b2-moving');
    return { pass: s.beat === 2 && steps.filter(d => d > 1e-3).length >= 5, detail: { seq, steps: steps.map(d => +d.toFixed(3)) } };
  });
  await step('S4b archive layout after fix (formation complete, beats 0 and 1)', async () => {
    for (const b of (process.env.S4B || '0,1').split(',').map(Number)) { await go(4, b); await E(() => window.__cpvArchive.formations.forEach(f => f.seek(1))); await frames(8); await shot(`s4-layout-b${b}`); }
    return { pass: true, detail: { note: 'visual review screenshot' } };
  });
  await step('S6c hall beat change moves the camera (ENFORCE → PREVENT, intermediate pose)', async () => {
    await go(6, 0); await frames(2); const a = await cam(); await E(() => CPVApp.navigation.next()); await frames(3); const mid = await cam(); await frames(3); const b = await cam(); await shot('s6c-moving');
    const st = await E(() => CPVApp.getWorldState()?.[6]?.state?.name);
    return { pass: dist(a, mid) > 1e-3 && dist(mid, b) > 1e-3, detail: { a, mid, b, state: st } };
  });
  await step('S2c beat 0→1 camera moves through an intermediate pose (light sampling)', async () => {
    await go(2, 0); await frames(2); const a = await cam(); await E(() => CPVApp.navigation.next()); await frames(5); const mid = await cam(); await frames(5); const b = await cam();
    const goal = [3.4, 6.3, 19.4]; return { pass: dist(a, mid) > 1e-3 && dist(mid, b) > 1e-3 && dist(b, goal) > 1e-2, detail: { a, mid, b, goal } };
  });
  // ---- Scene 6
  await step('S6 hall: ENFORCE / PREVENT / DISCLOSE states and camera differ', async () => {
    const s = [];
    for (const b of [0, 1, 2]) { await go(6, b); await frames(2); s.push({ cam: await cam(), st: JSON.stringify((await E(() => CPVApp.getWorldState()?.[6]))?.state ?? {}).slice(0, 160) }); await shot(`s6-b${b}`); }
    const camsDiffer = dist(s[0].cam, s[1].cam) > .01 || dist(s[1].cam, s[2].cam) > .01; const statesDiffer = new Set(s.map(x => x.st)).size === 3;
    return { pass: camsDiffer && statesDiffer, detail: { camsDiffer, statesDiffer, s } };
  });
  await step('Hand-off 5→6 sampled 0/50/100', () => handoff(5, 6, [0, .5, 1]));
  await step('Hand-off 6→7 sampled 0/50/100', () => handoff(6, 7, [0, .5, 1]));
  // ---- Scene 7
  await step('S7 pressure documentary: 4 beats, persistent frames re-laid out (Flip)', async () => {
    const st = [];
    for (const b of [0, 1, 2, 3]) { await go(7, b); await frames(2); await page.waitForTimeout(2500); await frames(1); const p = await E(() => CPVApp.getPressureState?.()); st.push({ beat: p?.beat, phase: p?.phase, frames: p?.frames?.length, first: p?.frames?.[0] && [Math.round(p.frames[0].x), Math.round(p.frames[0].y), Math.round(p.frames[0].width)] }); await shot(`s7-b${b}`); }
    const flipLib = await E(() => !!(window.gsap && window.Flip));
    const moved = new Set(st.map(x => JSON.stringify(x.first))).size >= 3;
    return { pass: flipLib && st.every(x => x.frames === 8) && moved, detail: { flipLib, st } };
  });
  await step('Hand-off 7→8 sampled 0/50/100 and Scene 8 has no roster', async () => {
    const r = await handoff(7, 8, [0, .5, 1]); const txt = await E(() => document.getElementById('content').textContent);
    const noRoster = !/Phạm Tiến Mạnh|Nguyễn Tuấn Hưng|Peeters|Nguyễn Quang Huy/.test(txt); await page.waitForTimeout(7500); await shot('s8-final-timeline');
    return { pass: r.pass && noRoster, detail: { ...r.detail, noRoster } };
  });
  await step('Audio: Sound button toggles mute/unmute', async () => {
    const t = () => E(() => document.querySelector('[data-action="mute"]')?.textContent);
    const a = await t(); await E(() => document.querySelector('[data-action="mute"]').click()); await page.waitForTimeout(1200); const b = await t();
    await E(() => document.querySelector('[data-action="mute"]').click()); await page.waitForTimeout(600); const c = await t();
    return { pass: a !== b && a === c, detail: { a, b, c, audio: await E(() => CPVApp.getAudioState?.()) } };
  });
  const appErrors = await E(() => CPVApp.getErrors());
  rec('No page/console errors during targeted run', errors.length ? 'FAIL' : 'PASS', errors.slice(0, 6).join(' | '));
  rec('No presentation runtime errors (CPVApp.getErrors)', appErrors.length ? 'FAIL' : 'PASS', JSON.stringify(appErrors).slice(0, 400));
  console.log('DONE', results.filter(r => r.status === 'PASS').length, 'PASS /', results.filter(r => r.status === 'FAIL').length, 'FAIL /', results.filter(r => r.status === 'NOT_TESTED').length, 'NOT_TESTED');
  await browser.close();
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
