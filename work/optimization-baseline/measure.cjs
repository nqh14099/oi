const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const {chromium} = require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source = path.resolve('dist/reforming_vietnam_political_system_3d.html');
const out = __dirname;
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
(async () => {
 const html = fs.readFileSync(source, 'utf8');
 const report = {source, sha256: hash(html), environment:'Chromium headless, SwiftShader software GL; no hardware FPS claim', blocks:{}, scenes:[], errors:[], externalRequests:[]};
 for (const id of ['three-runtime','presentation-data']) {
  const block=html.match(new RegExp('<script\\b[^>]*id=["\x27]'+id+'["\x27][^>]*>([\\s\\S]*?)<\\/script>'))[1];
  report.blocks[id]={bytes:Buffer.byteLength(block),sha256:hash(block)};
 }
 const browser=await chromium.launch({executablePath:'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--allow-file-access-from-files']});
 try {
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.route(/^https?:/,r=>{report.externalRequests.push(r.request().url());return r.abort();});
 await page.addInitScript(()=>{
  window.__measure={longTasks:[],draws:0,frames:[]};
  new PerformanceObserver(list=>window.__measure.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
  for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype])for(const key of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){
   if(!Object.prototype.hasOwnProperty.call(proto,key))continue;
   const orig=proto[key];proto[key]=function(...args){window.__measure.draws++;return orig.apply(this,args);};
  }
  const raf=window.requestAnimationFrame;
  window.requestAnimationFrame=function(fn){return raf.call(window,t=>{const before=window.__measure.draws;fn(t);const count=window.__measure.draws-before;if(count)window.__measure.frames.push(count);});};
 });
 await page.goto(pathToFileURL(source).href,{timeout:120000});
 await page.waitForFunction(()=>window.CPVApp,{timeout:120000});
 await page.waitForTimeout(1500);
 report.startup=await page.evaluate(()=>({longTasks:__measure.longTasks.slice(),status:CPVApp.world.getStatus(),maxDrawCalls:Math.max(0,...__measure.frames)}));
 const scenes=await page.evaluate(()=>CPVApp.getData().scenes.map(s=>({id:s.id,beats:s.beats.length})));
 report.sceneCount=scenes.length;report.beatCount=scenes.reduce((n,s)=>n+s.beats,0);
 for(const scene of scenes){
  const timing=await page.evaluate(id=>{__measure.frames=[];__measure.longTasks=[];const start=performance.now();CPVApp.navigation.goToScene(id,0);return performance.now()-start;},scene.id);
  await page.waitForTimeout(1000);
  const stats=await page.evaluate(()=>({maxDrawCalls:Math.max(0,...__measure.frames),longTasks:__measure.longTasks.slice(),status:CPVApp.world.getStatus()}));
  await page.screenshot({path:path.join(out,`scene-${scene.id}.png`),timeout:120000});
  report.scenes.push({...scene,firstNavigationMs:timing,...stats});
  fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({scene:scene.id,ms:timing,draws:stats.maxDrawCalls}));
  const reference={3:1804,7:1722,5:242}[scene.id];
  if(reference && Math.abs(timing/reference-1)>.3){
   report.stopBeforeOptimization=true;
   report.stopReason=`Scene ${scene.id} first-navigation deviation exceeds 30%`;
   report.comparisons=[{metric:`scene ${scene.id} first navigation ms`,baseline:reference,current:timing,deviationPercent:100*(timing/reference-1)}];
   report.complete=false;
   report.sourceUnchanged=hash(fs.readFileSync(source))===report.sha256;
   report.appErrors=await page.evaluate(()=>CPVApp.getErrors());
   fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify(report,null,2));
   return;
  }
 }
 report.appErrors=await page.evaluate(()=>CPVApp.getErrors());
 const largest=Math.max(0,...report.startup.longTasks.map(t=>t.duration));
 report.comparisons=[{metric:'startup largest long task',baseline:5212,current:largest},...[ [3,1804],[7,1722],[5,242] ].map(([id,baseline])=>({metric:`scene ${id} first navigation ms`,baseline,current:report.scenes.find(s=>s.id===id)?.firstNavigationMs})),...[[5,303],[7,91],[3,46],[4,37]].map(([id,baseline])=>({metric:`scene ${id} draw calls`,baseline,current:report.scenes.find(s=>s.id===id)?.maxDrawCalls}))].map(x=>({...x,deviationPercent:100*(x.current-x.baseline)/x.baseline}));
 report.stopBeforeOptimization=report.comparisons.some(x=>Math.abs(x.deviationPercent)>30);
 report.sourceUnchanged=hash(fs.readFileSync(source))===report.sha256;
 fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({comparisons:report.comparisons,stop:report.stopBeforeOptimization,errors:report.errors,sourceUnchanged:report.sourceUnchanged},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
