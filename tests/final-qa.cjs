// Final browser QA: node tests/final-qa.cjs <html> <outdir> [phases]
// phases: beats,transitions,navigation,archive,features,portrait (comma separated)
const { chromium } = require(process.env.PW || 'playwright-core');
const fs = require('fs'), path = require('path');
const [file, out, phaseArg = 'beats,transitions,navigation,archive,features,portrait'] = process.argv.slice(2);
const phases = new Set(phaseArg.split(','));
fs.mkdirSync(out, { recursive: true });
const results = []; const ok = (name, pass, detail = '') => { results.push({ name, pass: !!pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, detail); };
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'];
async function open(browser, { width = 1600, height = 900, reduced = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage(); const errors = []; page.setDefaultTimeout(300000);
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.route('**/*', r => /^(file|data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
  await page.goto('file://' + path.resolve(file));
  await page.waitForFunction(() => window.CPVApp?.world, null, { timeout: 90000 });
  if (process.env.SCALE) await page.evaluate(v => CPVApp.world.setRenderScale(v), +process.env.SCALE);
  return { context, page, errors };
}
const st = page => page.evaluate(() => { const n = CPVApp.navigation.getState(), w = CPVApp.world.getStatus(); return { scene: n.sceneId, beat: n.beatIndex, active: w.activeSceneId, mode: w.mode, tr: w.transition, dom: document.getElementById('content').dataset.sceneId, appErrors: CPVApp.getErrors().length }; });
const frames = (page, n = 2) => page.evaluate(k => new Promise(r => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
// CPU (SwiftShader) frames take seconds, and the engine clamps dt to 50 ms, so hand-offs are
// completed by seeking to 100% — this verifies lifecycle/end-state, not real-time duration.
async function settle(page, ms = 600) {
  await frames(page, 1);
  for (let k = 0; k < 40; k++) { const s = await st(page); if (!s.tr.active) break; await page.evaluate(() => CPVApp.world.director.seek(1)); await frames(page, 1); }
  await page.waitForTimeout(ms); await frames(page, 1);
}
const shot = (page, name) => page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 82 });
async function goto(page, scene, beat = 0) { await page.evaluate(([s, b]) => CPVApp.navigation.goToScene(s, b), [scene, beat]); await settle(page, 300); }
// camera-relative motion probe: project a fixed world point of each scene root with the live camera
const camProbe = page => page.evaluate(() => { const c = CPVApp.world.camera.camera; return { p: c.position.toArray().map(v => +v.toFixed(3)), q: c.quaternion.toArray().map(v => +v.toFixed(4)) }; });

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ARGS });
  const { page, errors, context } = await open(browser);
  const s0 = await st(page); ok('webgl2 renderer active (not fallback)', s0.mode === 'webgl', s0.mode);
  const counts = await page.evaluate(() => { const d = JSON.parse(document.getElementById('presentation-data').textContent); return { scenes: d.scenes.length, beats: d.scenes.reduce((n, s) => n + s.beats.length, 0), s8: JSON.stringify(d.scenes[7]).includes('Phạm') }; });
  ok('15 scenes / 37 beats in data', counts.scenes === 15 && counts.beats === 37, JSON.stringify(counts));

  if (phases.has('beats')) {
    await page.waitForTimeout(6500); await shot(page, 'beat-s01-b0');
    let n = 1, mism = [];
    for (let i = 0; i < 40; i++) {
      const before = await st(page);
      await page.evaluate(() => CPVApp.navigation.next()); await settle(page, 300); await frames(page, 2);
      const s = await st(page); if (s.scene === before.scene && s.beat === before.beat) break;
      if (s.active !== s.scene || String(s.scene) !== s.dom) mism.push(`${s.scene}/${s.active}/${s.dom}`);
      await shot(page, `beat-s${String(s.scene).padStart(2, '0')}-b${s.beat}`); n++;
    }
    ok('all beats reachable with Next and captured', n === 37, `${n} beats`);
    ok('scene root, world and DOM agree on every beat', mism.length === 0, mism.join(' '));
    const roster = await page.evaluate(() => { CPVApp.navigation.goToScene(8); return document.querySelector('#content').textContent; });
    ok('Scene 8 shows no roster / member names', !/Phạm Tiến Mạnh|Nguyễn Tuấn Hưng|Peeters|Nguyễn Quang Huy/.test(roster));
  }

  if (phases.has('transitions')) {
    const pairs = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [14, 15], [3, 2]];
    const report = [];
    for (const [a, b] of pairs) {
      const beats = await page.evaluate(id => CPVApp.navigation.getState() && JSON.parse(document.getElementById('presentation-data').textContent).scenes.find(s => s.id === id).beats.length, a);
      await goto(page, a, b > a ? beats - 1 : 0); await page.waitForTimeout(b === 2 ? 2500 : 600); await frames(page, 2);
      await page.evaluate(() => { CPVApp.world.director.pauseClock(true); });
      await page.evaluate(([x, y]) => y > x ? CPVApp.navigation.next() : CPVApp.navigation.previous(), [a, b]);
      const frames = [];
      for (const p of [0, .25, .5, .75]) {
        await page.evaluate(v => CPVApp.world.director.seek(v), p); await frames(page, 2);
        const s = await st(page); const cam = await camProbe(page);
        await shot(page, `tr-${a}-${b}-${String(p * 100).padStart(3, '0')}`); frames.push({ p, phase: s.tr.phase, key: s.tr.key, cam });
      }
      await page.evaluate(() => { CPVApp.world.director.pauseClock(false); CPVApp.world.director.seek(1); }); await frames(page, 3);
      const end = await st(page); await shot(page, `tr-${a}-${b}-100`); frames.push({ p: 1, phase: end.tr.phase, cam: await camProbe(page) });
      const live = frames.slice(0, 4).every(f => f.key === `${a}>${b}`);
      report.push({ pair: `${a}>${b}`, live, endIdle: !end.tr.active, end: { scene: end.scene, active: end.active }, frames });
      ok(`transition ${a}>${b}: live hand-off sampled 0/25/50/75/100`, live && !end.tr.active && end.active === b, frames.map(f => f.phase).join(','));
    }
    fs.writeFileSync(path.join(out, 'transitions.json'), JSON.stringify(report, null, 1));
  }

  if (phases.has('navigation')) {
    const seq = async (label, ids) => { for (const id of ids) { await page.evaluate(i => CPVApp.navigation.goToScene(i), id); await settle(page, 200); }
      const s = await st(page); ok(`sequence ${label}`, s.scene === ids[ids.length - 1] && s.active === s.scene && !s.tr.active && s.dom === String(s.scene), JSON.stringify({ scene: s.scene, active: s.active })); };
    await seq('1→2→3', [1, 2, 3]); await seq('3→2→1', [3, 2, 1]); await seq('5→6→7', [5, 6, 7]); await seq('7→8→9', [7, 8, 9]);
    await seq('jump 1→10', [1, 10]); await seq('jump 10→2', [10, 2]);
    await goto(page, 2, 0);
    for (let i = 0; i < 9; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(90); }
    await settle(page, 400); let s = await st(page); ok('rapid Next ×9 (interrupting hand-offs) ends in a defined state', s.active === s.scene && !s.tr.active && s.dom === String(s.scene), JSON.stringify({ scene: s.scene, beat: s.beat }));
    for (let i = 0; i < 9; i++) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(90); }
    await settle(page, 400); s = await st(page); ok('rapid Previous ×9 returns consistently', s.active === s.scene && !s.tr.active, JSON.stringify({ scene: s.scene, beat: s.beat }));
    await goto(page, 1, 1); await page.waitForTimeout(1500); await page.evaluate(() => CPVApp.navigation.next()); await page.waitForTimeout(500);
    await page.setViewportSize({ width: 1280, height: 720 }); await page.waitForTimeout(500); await page.setViewportSize({ width: 1600, height: 900 });
    await settle(page, 600); s = await st(page); const status = await page.evaluate(() => CPVApp.world.getStatus());
    ok('resize during camera hand-off keeps state + size', s.scene === 2 && s.active === 2 && status.width === 1600, `${status.width}x${status.height}`);
    await shot(page, 'nav-after-resize-s2');
    const p1 = await camProbe(page); await page.keyboard.press('r'); await page.waitForTimeout(300); await settle(page, 2500); const p2 = await camProbe(page);
    ok('replay returns to the same deterministic end pose', p1.p.every((v, i) => Math.abs(v - p2.p[i]) < .05), JSON.stringify([p1.p, p2.p]));
    await goto(page, 2, 0); await page.waitForTimeout(2500); const b0 = await camProbe(page);
    await page.evaluate(() => CPVApp.navigation.next()); await frames(page, 3); const mid = await camProbe(page); await frames(page, 30); const b1 = await camProbe(page);
    const dist = (x, y) => Math.hypot(...x.p.map((v, i) => v - y.p[i]));
    ok('Scene 2 beat change moves the camera continuously (intermediate pose)', dist(b0, mid) > 1e-3 && dist(mid, b1) > 1e-3, JSON.stringify({ b0: b0.p, mid: mid.p, b1: b1.p }));
  }

  if (phases.has('audio')) {
    await page.evaluate(() => document.querySelector('[data-action="mute"]').click()); await page.waitForTimeout(1500);
    const a1 = await page.evaluate(() => ({ text: document.querySelector('[data-action="mute"]').textContent, state: CPVApp.getAudioState?.() }));
    await page.evaluate(() => document.querySelector('[data-action="mute"]').click()); await page.waitForTimeout(800);
    const a2 = await page.evaluate(() => ({ text: document.querySelector('[data-action="mute"]').textContent, state: CPVApp.getAudioState?.() }));
    ok('audio mute/unmute via Sound button', a1.text !== a2.text, JSON.stringify([a1, a2]).slice(0, 300));
  }
  if (phases.has('archive')) {
    await goto(page, 3, 5); await page.waitForTimeout(800);
    await page.evaluate(() => CPVApp.navigation.next()); await settle(page, 200);
    // formation frames: seek the focused volume's formation
    const frames = [];
    for (const p of [0, .25, .5, .75, 1]) {
      await page.evaluate(v => { const m = CPVApp.world; const st = CPVApp.getWorldState?.(); }, p);
      const ok2 = await page.evaluate(v => { const mods = window.__cpvArchive; if (!mods) return false; mods.formations.forEach(f => f.seek(v)); CPVApp.world.invalidate(); return true; }, p);
      await page.waitForTimeout(500); await shot(page, `formation-${String(p * 100).padStart(3, '0')}`); frames.push(ok2);
    }
    ok('ModelFormation seekable 0/25/50/75/100 on the archive volumes', frames.every(Boolean));
    await page.evaluate(() => window.__cpvArchive.formations.forEach(f => f.seek(1)));
    await page.waitForTimeout(2500); await shot(page, 'archive-beat0');
    const before = await st(page);
    await page.mouse.move(1180, 560); await page.waitForTimeout(300); await page.mouse.click(1180, 560); await page.waitForTimeout(1800);
    const sel = await page.evaluate(() => window.__cpvArchive.getState());
    const after = await st(page);
    ok('book selection is optional and does not change the beat', after.scene === 4 && after.beat === before.beat, JSON.stringify({ selected: sel.selected, orbit: sel.orbit }));
    await shot(page, 'archive-selected');
    ok('orbit gallery attached and running', sel.orbit.attached && sel.orbit.tiles === 12, JSON.stringify(sel.orbit));
    await page.evaluate(() => CPVApp.navigation.next()); await settle(page, 1800); await shot(page, 'archive-beat1');
    await page.evaluate(() => CPVApp.navigation.next()); await settle(page, 1800); await shot(page, 'archive-beat2');
    await page.evaluate(() => CPVApp.navigation.next()); await settle(page, 500); let s = await st(page); ok('Scene 4 → Scene 5 continues', s.scene === 5 && s.active === 5);
    await page.evaluate(() => CPVApp.navigation.previous()); await settle(page, 500); s = await st(page); ok('Scene 5 → back to Scene 4 (last beat)', s.scene === 4 && s.beat === 2 && s.active === 4);
  }

  if (phases.has('features')) {
    await goto(page, 11, 0); await page.waitForTimeout(700);
    await page.click('[data-quiz-option="B"]').catch(() => {}); await page.waitForTimeout(200);
    await page.click('[data-quiz-submit]').catch(() => {}); await page.waitForTimeout(900);
    const quiz = await page.evaluate(() => ({ submitted: !!document.querySelector('.quiz-submitted'), explanation: !!document.querySelector('[data-quiz-explanation]'), result: document.querySelector('.quiz-result')?.textContent }));
    ok('quiz select + submit + explanation', quiz.submitted && quiz.explanation, JSON.stringify(quiz)); await shot(page, 'quiz-11-submitted');
    await page.keyboard.press('m'); await page.waitForTimeout(400); const snd = await page.evaluate(() => document.querySelector('[data-action="mute"]')?.textContent);
    await page.keyboard.press('m'); await page.waitForTimeout(200); const snd2 = await page.evaluate(() => document.querySelector('[data-action="mute"]')?.textContent);
    ok('audio mute/unmute toggles', snd !== snd2, `${snd} → ${snd2}`);
    const exp = await page.evaluate(async () => { const f = CPVApp.exportHTML; if (typeof f !== 'function') return { ok: false }; const r = await f({ download: false }); const text = typeof r === 'string' ? r : (r?.html || ''); return { ok: text.length > 1e6, len: text.length, type: typeof r }; }).catch(e => ({ ok: false, e: String(e) }));
    ok('Export HTML produces a self-contained document', exp.ok, JSON.stringify(exp));
    const rm = await open(browser, { reduced: true });
    await rm.page.evaluate(() => CPVApp.navigation.goToScene(2)); await rm.page.waitForTimeout(400); const r = await st(rm.page);
    ok('reduced-motion: no animated hand-off, immediate defined state', !r.tr.active && r.active === 2, JSON.stringify(r.tr.phase)); await rm.context.close();
  }

  if (phases.has('portrait')) {
    const pt = await open(browser, { width: 390, height: 844 });
    for (const id of [1, 4, 7, 8]) { await pt.page.evaluate(i => CPVApp.navigation.goToScene(i), id); await settle(pt.page, 2500);
      const over = await pt.page.evaluate(() => document.documentElement.scrollWidth - innerWidth); await pt.page.screenshot({ path: path.join(out, `portrait-s${id}.jpg`), type: 'jpeg', quality: 75 });
      ok(`portrait 390×844 Scene ${id} without horizontal overflow`, over <= 1, `overflow ${over}`); }
    if (pt.errors.length) errors.push(...pt.errors.map(e => 'portrait ' + e)); await pt.context.close();
  }
  const appErrs = await page.evaluate(() => CPVApp.getErrors());
  ok('no page/console errors', errors.length === 0, errors.slice(0, 8).join(' | '));
  ok('no presentation runtime errors', !appErrs?.length, JSON.stringify(appErrs).slice(0, 600));
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ results, errors }, null, 1));
  console.log(`SUMMARY ${results.filter(r => r.pass).length}/${results.length} passed`);
  await browser.close();
})().catch(e => { console.error('QA crashed', e); process.exit(1); });
