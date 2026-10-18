import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const { chromium }=require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.dirname(fileURLToPath(import.meta.url));
const candidate=path.resolve(process.argv[2]||path.join(out,'candidate.html'));
const url=pathToFileURL(candidate).href;
const checks=[],errors=[],requests=[],timing=[];
const check=(ok,name,detail)=>{checks.push({name,pass:!!ok,...(detail===undefined?{}:{detail})});if(!ok)throw new Error(name);};
const frameSelector='[data-pressure-frame], [data-frame-id], .pressure-frame';
fs.mkdirSync(path.join(out,'after'),{recursive:true});
const launch={executablePath:'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--allow-file-access-from-files']};
const browser=await chromium.launch(launch);
function watch(page){page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});}
async function ready(page,target=url){watch(page);await page.goto(target);await page.waitForFunction(()=>window.CPVApp?.views?.getPressureState);}
async function navigate(page,beat){await page.evaluate(b=>CPVApp.navigation.goToScene(7,b),beat);}
async function settled(page){
 await page.waitForTimeout(100);
 await page.waitForFunction(()=>{const s=CPVApp.views.getPressureState();return s&&s.running===false;},{},{timeout:20000});
 await page.waitForTimeout(100);
}
async function snapshot(page){return page.evaluate(selector=>[...document.querySelectorAll(selector)].map((el,index)=>{const b=el.getBoundingClientRect(),s=getComputedStyle(el);return {id:el.dataset.pressureFrame||el.dataset.frameId||el.id||String(index),x:+b.x.toFixed(2),y:+b.y.toFixed(2),width:+b.width.toFixed(2),height:+b.height.toFixed(2),opacity:+s.opacity,transform:s.transform};}),frameSelector);}
function samePose(a,b,tolerance=.5){return a.length===b.length&&a.every((x,i)=>x.id===b[i].id&&['x','y','width','height','opacity'].every(k=>Math.abs(x[k]-b[i][k])<=tolerance));}
try{
 const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'no-preference',offline:true});
 const page=await context.newPage();await ready(page);await navigate(page,0);await settled(page);
 const data=await page.evaluate(()=>CPVApp.getData());
 check(data.scenes.length===15&&data.scenes.find(s=>s.id===7).beats.length===4,'15 scenes; Scene 7 has four beats');
 check(await page.locator(frameSelector).count()===8,'eight independently rendered frames');
 check(await page.evaluate(()=>getComputedStyle(document.getElementById('world')).visibility==='hidden'||getComputedStyle(document.getElementById('world')).display==='none'),'Scene 7 has no visible Three.js layer');
 await page.evaluate(selector=>{window.__pressureFrameRefs=[...document.querySelectorAll(selector)];},frameSelector);
 const poses=[];
 for(let beat=0;beat<4;beat++){
  if(beat){await page.evaluate(()=>CPVApp.navigation.next());await settled(page);}
  check(await page.evaluate(b=>CPVApp.navigation.getState().sceneId===7&&CPVApp.navigation.getState().beatIndex===b,beat),`navigation reaches beat ${beat}`);
  check(await page.evaluate(selector=>[...document.querySelectorAll(selector)].every((el,i)=>el===window.__pressureFrameRefs[i]),frameSelector),`beat ${beat} preserves exact DOM frame identities`);
  poses[beat]=await snapshot(page);await page.waitForTimeout(280);
  check(samePose(poses[beat],await snapshot(page)),`beat ${beat} settles into a stable presenter hold`);
  await page.screenshot({path:path.join(out,'after',`desktop-${beat}.png`)});
 }
 await navigate(page,1);await settled(page);check(samePose(poses[1],await snapshot(page)),'direct jump to overloaded beat is deterministic');
 await page.evaluate(()=>CPVApp.navigation.replay());await settled(page);check(samePose(poses[1],await snapshot(page)),'replay returns to the same overloaded hold');
 await page.evaluate(()=>CPVApp.navigation.previous());await settled(page);check(samePose(poses[0],await snapshot(page)),'Previous returns to baseline hold');
 await page.evaluate(()=>CPVApp.navigation.next());await page.waitForTimeout(1000);
 const continuity=await page.evaluate(selector=>{const read=()=>[...document.querySelectorAll(selector)].map(el=>{const b=el.getBoundingClientRect();return [b.x,b.y,b.width,b.height];});const before=read();const refs=[...document.querySelectorAll(selector)];CPVApp.navigation.next();const after=read();return {before,after,same:[...document.querySelectorAll(selector)].every((el,i)=>el===refs[i]),delta:Math.max(...before.flatMap((b,i)=>b.map((v,j)=>Math.abs(v-after[i][j]))))};},frameSelector);
 check(continuity.same&&continuity.delta<1,'interrupted Beat 1 → 2 preserves visible positions before next RAF',continuity.delta);
 await settled(page);check(samePose(poses[2],await snapshot(page)),'interrupted restructuring still reaches canonical end state');
 await page.evaluate(()=>{CPVApp.navigation.goToScene(7,1);CPVApp.navigation.goToScene(7,2);CPVApp.navigation.goToScene(7,0);CPVApp.navigation.goToScene(7,3);});await settled(page);
 check(samePose(poses[3],await snapshot(page)),'rapid beat requests settle at the latest destination');
 await page.evaluate(()=>CPVApp.navigation.goToScene(8,0));await page.waitForTimeout(120);
 check(await page.locator(frameSelector).count()===0,'scene exit removes pressure DOM');
 await navigate(page,2);await settled(page);check(samePose(poses[2],await snapshot(page)),'Scene 7 re-entry reconstructs correct beat');
 await page.locator('#viewport').focus();await page.keyboard.press('m');
 check(await page.evaluate(()=>CPVApp.getAudioState().muted===false),'user gesture unmutes existing audio controller');
 await page.keyboard.press('m');check(await page.evaluate(()=>CPVApp.getAudioState().muted===true),'mute state is restored');
 const exportPath=path.join(out,'export-check.html');fs.writeFileSync(exportPath,await page.evaluate(()=>CPVApp.exportHTML()));
 const exported=await context.newPage();await ready(exported,pathToFileURL(exportPath).href);await navigate(exported,2);await settled(exported);
 check(await exported.locator(frameSelector).count()===8,'exported self-contained HTML renders Scene 7 offline');await exported.close();
 check(requests.length===0,'candidate and export make no HTTP requests',requests);
 const reduced=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce',offline:true});
 const rp=await reduced.newPage();await ready(rp);
 for(let beat=0;beat<4;beat++){await navigate(rp,beat);await rp.waitForTimeout(100);const s=await rp.evaluate(()=>CPVApp.views.getPressureState());check(s.running===false,`reduced motion beat ${beat} immediately static`);const a=await snapshot(rp);await rp.waitForTimeout(160);check(samePose(a,await snapshot(rp)),`reduced motion beat ${beat} remains static`);}
 await rp.setViewportSize({width:390,height:844});
 for(let beat=0;beat<4;beat++){await navigate(rp,beat);await rp.waitForTimeout(200);check(await rp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`portrait beat ${beat} has no horizontal overflow`);await rp.screenshot({path:path.join(out,'after',`portrait-${beat}.png`),fullPage:true});}
 check(errors.length===0&&await page.evaluate(()=>CPVApp.getErrors().length===0),'no page or app errors',errors);
 await context.close();await reduced.close();

 // Playwright records the actual browser frames continuously, not a montage of stills.
 const videoContext=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'no-preference',offline:true,recordVideo:{dir:path.join(out,'capture'),size:{width:1600,height:900}}});
 const vp=await videoContext.newPage();await ready(vp);const recordingStart=Date.now();
 for(let beat=0;beat<4;beat++){timing.push({beat,atMs:Date.now()-recordingStart});await navigate(vp,beat);await settled(vp);await vp.waitForTimeout(beat===1?650:450);}
 const video=vp.video();await videoContext.close();await video.saveAs(path.join(out,'scene7-breaking-point.webm'));
 fs.writeFileSync(path.join(out,'capture-timing.json'),JSON.stringify(timing,null,2));
 check(fs.statSync(path.join(out,'scene7-breaking-point.webm')).size>10000,'continuous browser recording saved');
}catch(error){errors.push(error.stack||String(error));process.exitCode=1;}
finally{await browser.close();fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({candidate,checks,errors,networkRequests:requests,recordingTimeline:timing},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,errors},null,2));}
