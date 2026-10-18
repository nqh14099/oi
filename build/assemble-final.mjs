// Final integration assembler.
// Base: other ai/reforming_vietnam_scene6_hall_v11.html (3D maze v10 + Hall v11 + people rig).
// Merged from build/: approved content.json (Scene 7 "The system can't stay still"),
// Scene 1 living-cloth particle wordmark (CPVFlag/CPVWordmark/createFlagHero), Scene 7
// pressure documentary (GSAP + Flip), runtime/views pressure hooks.
// New: CPVTransitionDirector (world engine), CPVModelFormation, Reform Archive (Scene 4),
// Scene 8 documentary moment, Scene 9 branches. Originals are never modified.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rd = p => readFile(resolve(root, p), 'utf8');
const log = (...a) => console.log('[assemble]', ...a);
const must = (cond, msg) => { if (!cond) throw new Error('assemble: ' + msg); };
const safeJSON = x => JSON.stringify(x).replace(/[<>&\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
function bundle(name, source, names, bindings = '') {
  source = source.replace(/^import [^\n]+\n/gm, '').replace(/^export (function|const) /gm, '$1 ');
  new Script(source);
  return `const ${name}=(()=>{${bindings}\n${source}\nreturn {${names.join(',')}};})();\n`;
}
function replaceOnce(text, find, repl, label) {
  const i = text.indexOf(find); must(i >= 0, `patch target missing: ${label}`);
  must(text.indexOf(find, i + find.length) < 0 || label.endsWith('*'), `patch target not unique: ${label}`);
  return text.slice(0, i) + repl + text.slice(i + find.length);
}
function moduleSpan(js, name) {
  const start = js.indexOf(`const ${name}=`); must(start >= 0, `module ${name} missing`);
  let end = js.indexOf('\nconst CPV', start + 10); if (end < 0) end = js.indexOf('\nCPVRuntime.startCinematicPresentation', start);
  // keep trailing comments that belong to the next module
  return [start, end];
}
function replaceModule(js, name, code) { const [s, e] = moduleSpan(js, name); return js.slice(0, s) + code.trimEnd() + js.slice(e); }
function insertBefore(js, name, code) { const [s] = moduleSpan(js, name); return js.slice(0, s) + code + js.slice(s); }

let html = await rd('other ai/reforming_vietnam_scene6_hall_v11.html');
const sizeIn = html.length;
const tag = id => { const re = new RegExp(`(<script id="${id}"[^>]*>)([\\s\\S]*?)(</script>)`); const m = html.match(re); must(m, 'script ' + id); return m; };

// ---------- 1. approved content ----------
const content = JSON.parse(await rd('build/content.json'));
must(content.scenes.length === 15 && content.scenes.reduce((n, s) => n + s.beats.length, 0) === 37, '15 scenes / 37 beats');
{ const m = tag('presentation-data'); html = html.replace(m[0], m[1] + safeJSON(content) + m[3]); }

// ---------- 2. world engine + director ----------
{
  const m = tag('world-engine'); let w = m[2];
  const director = await rd('build/final/transition-director.js');
  w = replaceOnce(w, 'function createWorldEngine(', director + '\nfunction createWorldEngine(', 'director insert');
  w = replaceOnce(w, `  function deactivate() {
    const token = ++generation, old = active; active = null;
    if (old) {`, `  function handoffContext(record, rig, scene) {
    const base = context(record, record.activationAbort?.signal), c = {};
    for (const key of Object.keys(base)) c[key] = base[key];
    Object.assign(c, { camera: rig, scene, isCurrent: () => false, setLighting() {}, setBackground() {} });
    return Object.freeze(c);
  }
  function deactivate(handoffTo = null) {
    const token = ++generation, old = active; active = null;
    if (old && handoffTo !== null && director.capture(old, { world, lights, mainCamera: camera, contextFor: handoffContext, hookFn: hook,
      fromId: old.id, toId: handoffTo, disabled: reduced || mode !== 'webgl' || doc.hidden || paused })) { /* outgoing scene stays live until cleanup */ }
    else if (old) {`, 'deactivate');
  w = replaceOnce(w, `      const token = deactivate();
      if (token !== generation || destroyed) return false;
      camera.reset();`, `      const token = deactivate(id);
      if (token !== generation || destroyed) return false;
      camera.reset(); justActivated = true;`, 'activateScene');
  w = replaceOnce(w, `      camera.cancel('beat-change');
      if (token !== generation || destroyed) return false;`, `      if (justActivated) justActivated = false; else if (mode === 'webgl' && !reduced) director.beatBlend(camera.camera);
      camera.cancel('beat-change');
      if (token !== generation || destroyed) return false;`, 'setBeat');
  w = replaceOnce(w, `        if (typeof active?.module.render === 'function') {
          hook(active, 'render', context(active), renderer, world, camera.camera);
        } else renderer.render(world, camera.camera);`, `        director.tick(dt);
        director.renderOutgoing();
        const restoreCamera = director.applyCamera(camera);
        try {
          if (typeof active?.module.render === 'function') {
            hook(active, 'render', context(active), renderer, world, camera.camera);
          } else renderer.render(world, camera.camera);
        } finally { restoreCamera(); }
        director.composite(time / 1000);`, 'frame render');
  w = w.split('active?.module.animated || camera.isTransitioning()').join('active?.module.animated || camera.isTransitioning() || director.busy');
  w = replaceOnce(w, `const visibility = () => { if (doc.hidden) cancelFrame(); else invalidate(); };`,
    `const visibility = () => { if (doc.hidden) { director.finish('hidden'); director.cancelBlend(); cancelFrame(); } else invalidate(); };`, 'visibility');
  w = replaceOnce(w, `const contextLost = event => { event.preventDefault();`, `const contextLost = event => { event.preventDefault(); director.finish('context-lost');`, 'contextLost');
  w = replaceOnce(w, `renderer?.setSize(size.width, size.height, false); camera.resize(size.width, size.height);`,
    `renderer?.setSize(size.width, size.height, false); camera.resize(size.width, size.height); director.configure(renderer, size, renderer?.getPixelRatio?.() ?? 1);`, 'resize');
  w = replaceOnce(w, `setReducedMotion(value) { if (destroyed) return; reduced = Boolean(value);`, `setReducedMotion(value) { if (destroyed) return; reduced = Boolean(value); if (reduced) { director.finish('reduced-motion'); director.cancelBlend(); }`, 'reduced');
  w = replaceOnce(w, `    disposeScene(id) {
      const record = records.get(id); if (!record) return false;`, `    disposeScene(id) {
      const record = records.get(id); if (!record) return false;
      if (director.getState().active) director.finish('dispose');`, 'disposeScene');
  w = replaceOnce(w, `      destroyed = true;
      paused = true; cancelFrame();`, `      destroyed = true; director.dispose();
      paused = true; cancelFrame();`, 'destroy');
  w = replaceOnce(w, `    get camera() { return camera; },`, `    get camera() { return camera; },
    get director() { return director; },`, 'api director');
  w = replaceOnce(w, `activeSceneId: active?.id ?? null,`, `activeSceneId: active?.id ?? null, transition: director.getState(),`, 'status');
  // director instance lives beside the renderer state
  w = replaceOnce(w, `  let renderer = null, world = null, camera = null, lights = null, fallback = null, active = null;`,
    `  let renderer = null, world = null, camera = null, lights = null, fallback = null, active = null, justActivated = false;
  const director = createTransitionDirector({ THREE, createCameraRig, invalidate: () => invalidate(), report: error => report(error) });`, 'director instance');
  // test-only render scale (CPU/SwiftShader QA); default 1 keeps full presentation quality
  w = replaceOnce(w, `renderer.setPixelRatio(Math.min(Math.max(1, win.devicePixelRatio || 1), preset.pixelRatio));`,
    `renderer.setPixelRatio(Math.min(Math.max(1, win.devicePixelRatio || 1), preset.pixelRatio) * renderScale);`, 'render scale');
  w = replaceOnce(w, `    get director() { return director; },`, `    get director() { return director; },
    setRenderScale(value) { renderScale = Math.max(.25, Math.min(1, Number(value) || 1)); configureQuality(); api.resize(); },`, 'render scale api');
  w = w.replace('active = null, justActivated = false;', 'active = null, justActivated = false, renderScale = 1;');
  new Script(w, { filename: 'world-engine' });
  html = html.replace(m[0], m[1] + w + m[3]);
}

// ---------- 3. app runtime ----------
{
  const m = tag('app-runtime'); let js = m[2];
  const b = n => rd('build/' + n);
  // shared local assets (code-native SVG placeholders, labelled IMAGE PLACEHOLDER)
  const manifest = JSON.parse(await b('assets/scene7/manifest.json'));
  const svg = {}; for (const item of manifest.items) svg[item.id] = 'data:image/svg+xml;base64,' + Buffer.from(await rd(item.file)).toString('base64');
  const pressureAssets = manifest.items.map(i => ({ id: i.id, caption: i.caption, subject: i.subject, url: svg[i.id] }));
  const assets = `const CPVAssets=Object.freeze({scene7:${safeJSON(svg)},manifest:${safeJSON(manifest.items.map(({ id, caption, kind, placeholder, claim, credit }) => ({ id, caption, kind, placeholder, claim, credit })))}});\n`;
  js = assets + js;
  // Scene 1 newest living-cloth particle wordmark
  js = replaceModule(js, 'CPVFlag', bundle('CPVFlag', await b('cinematic-flag.mjs'), ['createCinematicFlag', 'flagReference']));
  js = insertBefore(js, 'CPVCitizen', bundle('CPVWordmark', await b('cinematic-wordmark.mjs'), ['createParticleWordmark']));
  // reusable model formation
  const formation = (await rd('build/final/model-formation.mjs')).replace(/^export const CPVModelFormation[^\n]*\n/m, '');
  js = insertBefore(js, 'CPVArchives', bundle('CPVModelFormation', formation, ['createModelFormation', 'create:(T,o)=>createModelFormation(T,o)']));
  // Scene 4 Reform Archive replaces the static archive collection
  js = replaceModule(js, 'CPVArchives', bundle('CPVArchives', await rd('build/final/reform-archive.mjs'), ['createArchiveScene', 'ARCHIVE_VOLUMES', 'ARCHIVE_SLOTS']));
  // Hall: respect the caller's render target (needed for live hand-off rendering)
  {
    const [s, e] = moduleSpan(js, 'CPVHall'); let hall = js.slice(s, e);
    const before = (hall.match(/setRenderTarget\(null\)/g) || []).length;
    hall = hall.replace(/render\(ctx,renderer,scene,camera\)\{/, 'render(ctx,renderer,scene,camera){const __outT=renderer.getRenderTarget();').replace(/setRenderTarget\(null\)/g, 'setRenderTarget(__outT)');
    must(before >= 2 && hall.includes('__outT=renderer'), 'hall render target patch'); js = js.slice(0, s) + hall + js.slice(e); log('hall render-target patches', before);
  }
  // Registration: newest Scene 1 hero + archive options
  {
    const reg = await b('cinematic-registration.mjs');
    const hero = reg.slice(reg.indexOf('function createFlagHero'), reg.indexOf('function restoreEnvironment'));
    const [s, e] = moduleSpan(js, 'CPVRegistration'); let r = js.slice(s, e);
    r = r.slice(0, r.indexOf('function createFlagHero')) + hero + r.slice(r.indexOf('function restoreEnvironment'));
    r = replaceOnce(r, 'const {createMazeScene}=CPVMaze;', 'const {createParticleWordmark}=CPVWordmark;const {createMazeScene}=CPVMaze;', 'wordmark binding');
    r = replaceOnce(r, 'createArchiveScene(data.scenes.find(s=>s.id===4))', 'createArchiveScene(data.scenes.find(s=>s.id===4),{assets:CPVAssets.scene7,createFormation:CPVModelFormation.createModelFormation})', 'archive options');
    r = replaceOnce(r, 'world.registerScene(4,archives);', 'world.registerScene(4,archives);window.__cpvArchive=archives;', 'archive handle');
    new Script(r); js = js.slice(0, s) + r + js.slice(e);
  }
  // Scene 7 pressure documentary (GSAP Flip) + build runtime/views hooks
  js = insertBefore(js, 'CPVViews', bundle('CPVPressure', await b('cinematic-pressure.mjs'), ['createPressureScene'], `const PRESSURE_ASSETS=${safeJSON(pressureAssets)};`));
  let views = bundle('CPVViews', await b('cinematic-scenes.mjs'), ['createCinematicViews'], 'const {createPressureScene}=CPVPressure;const {ARCHIVE_VOLUMES}=CPVArchives;');
  const v11Integrity = (m[2].match(/function integrity\(scene, beat, i\) \{[\s\S]*?\n\}\n/) || [])[0];
  must(v11Integrity && v11Integrity.includes('hall-tagline'), 'v11 integrity view');
  const viewPatch = v11Integrity + await rd('build/final/views-patch.js');
  // integrity (Hall v11 title) + archive + documentary moment + branches
  views = views.replace(/function integrity\(scene, beat, i\) \{[\s\S]*?\n\}\n/, '').replace(/function history\(scene, beat, i\) \{[\s\S]*?\n\}\n/, '')
    .replace(/function students\(scene, beat, i, data\) \{[\s\S]*?\n\}\n/, '').replace(/function responsibility\(scene, beat, i\) \{[\s\S]*?\n\}\n/, '');
  views = replaceOnce(views, 'function createCinematicViews(', viewPatch + '\nfunction createCinematicViews(', 'views patch');
  new Script(views); must(/function integrity/.test(views) && /function history/.test(views) && /function students/.test(views), 'views functions');
  js = replaceModule(js, 'CPVViews', views);
  js = replaceModule(js, 'CPVRuntime', bundle('CPVRuntime', await b('cinematic-runtime.mjs'), ['startCinematicPresentation']));
  new Script(js, { filename: 'app-runtime' });
  html = html.replace(m[0], () => m[1] + js.replace(/<\/script/g, '<\\/script') + m[3]);
  // GSAP + Flip (standard no-charge GSAP licence, bundled locally) before the app
  const gsap = (await b('vendor/gsap.min.js')) + '\n' + (await b('vendor/Flip.min.js'));
  html = html.replace('<script id="app-runtime">', () => `<script id="gsap-runtime">${gsap.replace(/<\/script/g, '<\\/script')}\nwindow.gsap&&window.Flip&&gsap.registerPlugin(Flip);</script>\n<script id="app-runtime">`);
}

// ---------- 4. styles ----------
{
  const css = (await rd('build/cinematic-pressure.css')) + '\n' + (await rd('build/final/final.css'));
  html = html.replace('</head>', () => `<style id="final-integration-style">${css}</style>\n</head>`);
}
html = html.replace(/<title>[^<]*<\/title>/, '<title>Reforming Vietnam’s Political System</title>');
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const name of ['reforming_monday_prensent.html', 'reforming_vietnam_final.html']) await writeFile(resolve(root, name), html, 'utf8');
log(JSON.stringify({ bytesIn: sizeIn, bytesOut: html.length, scenes: content.scenes.length, beats: content.scenes.reduce((n, s) => n + s.beats.length, 0) }));
