/** Scoped real Edge file:// tests for T09A; no server or installed dependencies. */
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { outputPath } from '../build/assemble.mjs';
const edge = process.env.CPV_EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
try { await access(edge); await access(outputPath); } catch (error) { console.log(`UNVERIFIED: ${error.message}`); process.exit(2); }
const directory = await mkdtemp(join(tmpdir(), 'cpv-t09a-'));
const variants = [
  ['title',1600,900,1,0], ['question',1600,900,1,1], ['system',1600,900,2,2],
  ['leadership',1600,900,2,0], ['roles',1600,900,2,1],
  ['projector',1920,1080,1,1], ['laptop',1366,768,2,2],
  ['landscape',960,540,2,2], ['portrait',390,844,2,2],
  ['reduced',1600,900,2,2,true], ['fallback',1600,900,2,2,false,true]
  ,['inside-mid',1600,900,1,0],['inside-low',1600,900,1,0],['inside-portrait',390,844,1,0],
  ['inside-landscape',960,540,1,0],['inside-reduced',1600,900,1,1,true],['inside-fallback',1600,900,1,0,false,true]
];
function harness(config) {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#08080d">
  <iframe id="frame" style="border:0;position:absolute;top:0;left:0;width:${config.width}px;height:${config.height}px"></iframe><pre id="report" hidden></pre>
  <script>
  const config = ${JSON.stringify(config)}, results = { checks:[],failures:[] };
  const check = (name, valid) => (valid ? results.checks : results.failures).push(name);
  const frame = document.getElementById('frame');
  frame.onload = () => { setTimeout(() => { try {
    const win = frame.contentWindow, doc = win.document, app = win.CPVApp;
    check('file boot', win.location.protocol === 'file:' && doc.documentElement.dataset.presentationReady === 'true');
    if (!app) throw new Error('Bootstrap missing');
    const data = JSON.parse(doc.getElementById('presentation-data').textContent);
    check('shared engine mode', app.world.getStatus().mode === (config.fallback ? 'fallback' : 'webgl'));
    check('actual viewport', win.innerWidth === config.width && win.innerHeight === config.height);
    check('initial identity and membership', doc.getElementById('intro-opening-heading').textContent === data.title && data.members.every(member => doc.getElementById('content').textContent.includes(member)));
    for (const [id,beat] of [[1,0],[1,1],[2,0],[2,1],[2,2]]) {
      app.navigation.goToScene(id,beat);
      check('scene/beat '+id+':'+beat, doc.querySelectorAll('#content > section').length === 1 && doc.getElementById('intro-scene-'+id)?.dataset.beat === String(beat) && app.world.getStatus().activeSceneId === id);
      if (id === 2) check('disclosure '+beat, doc.getElementById('intro-state').hidden === (beat < 1));
    }
    check('full central question', (() => {app.navigation.goToScene(1,1);return doc.getElementById('intro-opening-heading').textContent === 'How can reform make Vietnam’s political system work better for its people?';})());
    doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    check('next across boundary', app.navigation.getState().sceneId === 2 && app.navigation.getState().beatIndex === 0);
    doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));
    check('previous across boundary', app.navigation.getState().sceneId === 1 && app.navigation.getState().beatIndex === 1);
    doc.querySelector('[data-action="next"]').click();
    check('on-screen navigation', app.navigation.getState().sceneId === 2);
    for(let i=0;i<20;i++) app.navigation.goToScene(i%2+1,i%2 ? 2 : 1);
    app.navigation.goToScene(2,2);
    const before = doc.getElementById('intro-scene-2').outerHTML;
    app.navigation.replay();
    check('replay final DOM is deterministic', doc.getElementById('intro-scene-2').outerHTML === before && app.navigation.getState().beatIndex === 2);
    check('rapid navigation cancels stale elements', !doc.getElementById('intro-scene-1') && doc.querySelectorAll('#intro-scene-2').length === 1);
    check('Party inside institutions / people separate', doc.getElementById('intro-system-boundary').contains(doc.getElementById('intro-party')) && !doc.getElementById('intro-system-boundary').contains(doc.getElementById('intro-people')));
    check('institution labels', data.scenes[1].beats[1].audience.keys.every(label => doc.getElementById('intro-institution-diagram').textContent.includes(label)));
    check('mastery and state-management language', doc.getElementById('intro-people').textContent.includes('right to mastery') && doc.getElementById('intro-state').textContent.includes('under the law'));
    app.navigation.goToScene(3,0);
    check('departure cleanup', !doc.getElementById('intro-scene-2') && !doc.getElementById('intro-scene-1') && app.world.getStatus().activeSceneId === null);
    app.navigation.previous(); check('return restores last beat', app.navigation.getState().sceneId === 2 && doc.getElementById('intro-scene-2').dataset.beat === '2');
    app.navigation.goToScene(config.scene,config.beat);
    if(config.low) { app.world.setQuality('low'); check('low quality preserved',app.world.getStatus().quality==='low'); }
    check('no network or neighboring asset loads', win.performance.getEntriesByType('resource').length === 0);
    check('runtime errors', app.getErrors().length === 0);
    if(config.reduced) check('reduced motion has meaning without animations', win.matchMedia('(prefers-reduced-motion:reduce)').matches && doc.getAnimations().filter(animation => animation.effect?.target?.closest?.('#content')).length === 0 && (config.scene===1 ? doc.getElementById('intro-opening-heading').textContent.includes('Vietnam’s') : doc.getElementById('intro-people').textContent.includes('mastery')));
    setTimeout(() => {
      // Sample the scene camera at an explicit time; virtual browser time does not
      // guarantee RAF cadence. Natural completion/cancellation is covered in unit tests.
      app.world.camera.update(config.intermediate ? 950 : 5000); app.world.invalidate();
      if(!config.intermediate) check('finite camera settles',!app.world.camera.isTransitioning());
      const stage = doc.getElementById('stage').getBoundingClientRect();
      const nodes = [...doc.querySelectorAll(config.scene === 1 ? '#intro-opening-heading,.intro-course,.intro-member,.intro-opening-body' : '#intro-system-heading,.intro-part,.intro-institution-name,.intro-institution-role,.intro-people-title,.intro-people-mastery')].filter(node => win.getComputedStyle(node).display !== 'none' && !node.closest('[hidden]'));
      check('no horizontal overflow', doc.documentElement.scrollWidth <= win.innerWidth+1);
      check('labels inside stage', nodes.every(node => {const box=node.getBoundingClientRect();return box.left>=stage.left-1 && box.right<=stage.right+1 && box.top>=stage.top-1 && box.bottom<=stage.bottom+1;}));
      if(config.width<config.height) check('portrait uses natural reading layout', stage.height>=config.height && win.getComputedStyle(doc.getElementById('stage')).transform==='none' && win.getComputedStyle(doc.getElementById('content')).position==='relative');
      else check('proportional reference stage', Math.abs(stage.width/stage.height-16/9)<.01);
      if(config.scene===2 && config.width>config.height){
        const party=doc.getElementById('intro-party').getBoundingClientRect();
        const institutions=[doc.getElementById('intro-state'),doc.getElementById('intro-front'),doc.getElementById('intro-organizations')];
        const boundary=doc.getElementById('intro-system-boundary').getBoundingClientRect();
        check('institution tiers do not overlap', institutions.filter(node=>!node.hidden).every(node=>node.getBoundingClientRect().top>=party.bottom));
        check('institution labels remain inside their boundary', institutions.every(node=>node.getBoundingClientRect().bottom<=boundary.bottom));
      }
      results.viewport=[win.innerWidth,win.innerHeight];results.stage=[stage.width,stage.height];results.errors=app.getErrors();
      doc.getAnimations().forEach(animation => animation.finish());
      document.getElementById('report').textContent=JSON.stringify(results);document.documentElement.dataset.done='true';
    },1250);
  } catch(error) { results.failures.push(String(error.stack??error));document.getElementById('report').textContent=JSON.stringify(results);document.documentElement.dataset.done='true'; } },80); };
  frame.src=${JSON.stringify(pathToFileURL(outputPath).href)};
  </script></body></html>`;
}
let failures = 0;
for (const [name,width,height,scene,beat,reduced=false,fallback=false] of variants) {
  if (process.argv.length > 2 && !process.argv.slice(2).includes(name)) continue;
  const page = join(directory, `${name}.html`); await writeFile(page, harness({width,height,scene,beat,reduced,fallback,low:name==='inside-low',intermediate:name==='inside-mid'}));
  const screenshot = join(directory, `${name}.png`);
  const result = spawnSync(edge, ['--headless=new','--no-first-run','--disable-background-networking',
    '--allow-file-access-from-files','--proxy-server=http://127.0.0.1:9','--host-resolver-rules=MAP * ~NOTFOUND',
    `--user-data-dir=${join(directory,name+'-profile')}`,`--window-size=${width<height?414:Math.max(1680,width+80)},${Math.max(1100,height+200)}`,
    '--force-device-scale-factor=1','--virtual-time-budget=3500','--dump-dom',`--screenshot=${screenshot}`,
    ...(fallback ? ['--disable-webgl'] : ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']),
    ...(reduced ? ['--force-prefers-reduced-motion=reduce'] : []),pathToFileURL(page).href],
    {encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:2*1024*1024});
  if(result.error || result.status!==0) throw new Error(`${name}: ${result.error?.message??result.stderr}`);
  const encoded = result.stdout.match(/<pre id="report"[^>]*>([\s\S]*?)<\/pre>/)?.[1];
  if(!encoded || !result.stdout.includes('data-done="true"')) {
    await writeFile(join(directory, name+'-debug.html'), result.stdout);
    throw new Error(`${name}: smoke did not finish; inspect ${directory}`);
  }
  const report = JSON.parse(encoded.replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'));
  await writeFile(join(directory,name+'-report.json'),JSON.stringify(report,null,2));
  failures += report.failures.length;
  console.log(JSON.stringify({name,pass:report.checks.length,failures:report.failures,viewport:report.viewport,stage:report.stage}));
}
console.log(`Screenshots/reports: ${directory}`); if(failures) process.exitCode=1;
