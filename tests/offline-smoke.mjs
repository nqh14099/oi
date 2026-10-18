/** Real Edge file:// smoke test, no server/dependencies. Run AFTER assemble.mjs.
 * The artifact first opens with normal file security. A separate file:// harness
 * uses --allow-file-access-from-files only to inspect its iframe for automation.
 * HTTP(S) is blocked by an unreachable proxy plus DNS mapping; page resource
 * entries are also checked. Screenshots/reports live in an OS temporary folder.
 */
import { spawnSync } from 'node:child_process';
import { access, readFile, writeFile, copyFile, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { outputPath } from '../build/assemble.mjs';

const edge = process.env.CPV_EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
try { await access(edge); await access(outputPath); }
catch (error) { console.log(`UNVERIFIED: browser or built artifact unavailable: ${error.message}`); process.exit(2); }
const directory = await mkdtemp(join(tmpdir(), 'cpv-t08-smoke-'));
const artifactURL = pathToFileURL(outputPath).href;
const copiedPath = join(directory, 'standalone.html');
await copyFile(outputPath, copiedPath);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
if (hash(await readFile(copiedPath)) !== hash(await readFile(outputPath))) throw new Error('Isolated artifact copy differs');
const common = ['--headless=new', '--no-first-run', '--disable-background-networking', '--disable-component-update',
  '--window-size=1600,900', '--force-device-scale-factor=1', '--proxy-server=http://127.0.0.1:9',
  '--host-resolver-rules=MAP * ~NOTFOUND', '--dump-dom', '--virtual-time-budget=3000'];
const softwareGL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
function launch(name, url, flags = []) {
  const result = spawnSync(edge, [...common, `--user-data-dir=${join(directory, `${name}-profile`)}`, ...flags, url],
    { encoding: 'utf8', windowsHide: true, timeout: 30000, maxBuffer: 8 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${name}: ${result.error?.message ?? `browser exit ${result.status}`}`);
  return result.stdout;
}
const direct = launch('direct', artifactURL, [...softwareGL, `--screenshot=${join(directory, 'direct.png')}`]);
if (!direct.includes('data-presentation-ready="true"') || !direct.includes('data-beat-id="s01-b01"')) throw new Error('Actual file failed its direct file:// boot');
function harnessHTML(url, expectFallback) {
  const config = JSON.stringify({ url, expectFallback }).replaceAll('<', '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8"><title>T08 test harness</title></head>
  <body style="margin:0"><iframe id="frame" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe><pre id="smoke-results"></pre>
  <script>
  const config = ${config}, report = { checks: [], failures: [], loads: [] };
  const frame = document.getElementById('frame'); let count = 0;
  function check(name, valid) { (valid ? report.checks : report.failures).push(name); }
  function inspect() {
    const win = frame.contentWindow, doc = win.document, app = win.CPVApp;
    check('file protocol', win.location.protocol === 'file:');
    check('bootstrap ready', doc.documentElement.dataset.presentationReady === 'true' && !!app);
    if (!app) throw new Error('Missing CPVApp');
    check('no runtime errors', app.getErrors().length === 0);
    const data = JSON.parse(doc.getElementById('presentation-data').textContent);
    check('15 scenes / 8 chapters', data.scenes.length === 15 && data.chapters.length === 8);
    check('initial state and text', app.navigation.getState().sceneId === 1 && app.navigation.getState().beatIndex === 0 && doc.querySelector('#content h1').textContent === data.title);
    const rect = doc.getElementById('stage').getBoundingClientRect(), heading = doc.querySelector('#content h1').getBoundingClientRect();
    check('CSS stage is proportional and visible', rect.width > 0 && rect.height > 0 && Math.abs(rect.width / rect.height - 16/9) < 0.01);
    check('initial heading inside stage', heading.left >= rect.left && heading.right <= rect.right + 1 && heading.top >= rect.top && heading.bottom <= rect.bottom);
    // Virtual time does not consistently advance Chromium's CSS opacity transition.
    // Check the enabled display state here; inspect direct.png for actual appearance.
    check('implemented scene or diagnostic mode is identified', app.implementedSceneIds?.includes(1)
      ? !!doc.getElementById('intro-scene-1')
      : [...doc.querySelectorAll('#controls span')].some(node => node.textContent === 'T08 diagnostic view') && doc.body.classList.contains('show-controls'));
    doc.querySelector('[data-action="next"]').click();
    check('button next consumes beat', app.navigation.getState().beatIndex === 1 && doc.getElementById('content').dataset.beatId === 's01-b02');
    doc.querySelector('[data-action="next"]').click();
    check('button next advances scene', app.navigation.getState().sceneId === 2 && app.navigation.getState().beatIndex === 0);
    doc.querySelector('[data-action="prev"]').click();
    check('button previous reverses boundary', app.navigation.getState().sceneId === 1 && app.navigation.getState().beatIndex === 1);
    doc.body.focus();
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key:'ArrowLeft', bubbles:true, cancelable:true }));
    check('keyboard previous', app.navigation.getState().beatIndex === 0);
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key:' ', bubbles:true, cancelable:true }));
    check('keyboard next', app.navigation.getState().beatIndex === 1);
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key:'r', bubbles:true, cancelable:true }));
    check('replay preserves position', app.navigation.getState().beatIndex === 1);
    app.navigation.goToScene(11);
    check('quiz answers and scripts remain private', !doc.getElementById('content').textContent.includes(data.scenes[10].quiz.assessment.explanation) && !doc.getElementById('content').textContent.includes(data.scenes[10].beats[0].presenter.script));
    app.navigation.goToScene(15);
    check('thank-you-only ending', doc.getElementById('content').textContent === 'Thank you for listening' && doc.getElementById('source-line').textContent === '' && doc.getElementById('scene-label').textContent === '');
    app.navigation.goToScene(1);
    check('Three namespace initialized', app.threeRevision === '180' && app.world && app.world.camera.perspective.isPerspectiveCamera);
    const status = app.world.getStatus();
    check('expected renderer mode', status.mode === (config.expectFallback ? 'fallback' : 'webgl'));
    if (config.expectFallback) check('2D fallback visible with DOM content', win.getComputedStyle(doc.getElementById('fallback')).display === 'block' && doc.querySelector('#content h1')?.textContent === data.title);
    else check('WebGL2 real context', !!doc.getElementById('world').getContext('webgl2'));
    check('no unresolved slots', ![...doc.querySelectorAll('style,script')].some(node => /^__[A-Z]+__$/.test(node.textContent.trim())));
    const resources = win.performance.getEntriesByType('resource').map(entry => entry.name);
    check('no asset/network requests', resources.length === 0);
    check('no external script/style/asset elements', !doc.querySelector('script[src],link[href],img[src],audio[src],video[src]'));
    report.loads.push({ mode:status.mode, resources, errors:app.getErrors(), viewport:[win.innerWidth,win.innerHeight], stage:[rect.width,rect.height] });
    if (count === 2) {
      app.destroy();
      const snapshot = app.navigation.getState();
      doc.dispatchEvent(new win.KeyboardEvent('keydown', {key:'ArrowRight',bubbles:true,cancelable:true}));
      check('cleanup is terminal', app.navigation.getState() === snapshot && app.world.getStatus().destroyed && !app.input.isEnabled());
    }
  }
  frame.onload = () => { setTimeout(() => {
    try { count++; inspect(); if(count === 1) { frame.src = config.url + '?reopen=1'; return; } }
    catch (error) { report.failures.push(String(error.stack ?? error)); }
    document.getElementById('smoke-results').textContent = JSON.stringify(report);
    document.documentElement.dataset.smokeDone = 'true';
  }, 80); };
  frame.src = config.url;
  </script></body></html>`;
}
const reports = { directFileBoot: 'PASS', isolatedCopyHash: 'PASS', directory };
for (const [name, url, fallback] of [['webgl', artifactURL, false], ['fallback', pathToFileURL(copiedPath).href, true]]) {
  const harness = join(directory, `${name}-harness.html`);
  await writeFile(harness, harnessHTML(url, fallback));
  const dom = launch(name, pathToFileURL(harness).href, ['--allow-file-access-from-files', ...(fallback ? ['--disable-webgl'] : softwareGL)]);
  const encoded = dom.match(/<pre id="smoke-results">([\s\S]*?)<\/pre>/)?.[1];
  if (!dom.includes('data-smoke-done="true"') || !encoded) throw new Error(`${name}: browser harness did not finish`);
  const report = JSON.parse(encoded.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'));
  reports[name] = report;
  await writeFile(join(directory, `${name}-report.json`), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(reports, null, 2));
if (Object.values(reports).some(report => report?.failures?.length)) process.exitCode = 1;
