const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const result={checks:[],inventory:[],errors:[]};const check=(ok,name)=>{result.checks.push({name,pass:!!ok});if(!ok)throw Error(name);};
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--allow-file-access-from-files']});
try{
 const p=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>result.errors.push(e.message));await p.route(/^https?:/,r=>r.abort());
 await p.goto(pathToFileURL(path.resolve('dist/reforming_vietnam_complete.html')).href);await p.waitForFunction(()=>window.CPVApp);
 const original=await p.evaluate(()=>JSON.stringify(CPVApp.getData()));
 const scenes=await p.evaluate(()=>CPVApp.getData().scenes.map(s=>({id:s.id,n:s.beats.length})));
 for(const size of ['desktop','portrait']){
  await p.setViewportSize(size==='desktop'?{width:1600,height:900}:{width:390,height:844});
  for(const s of scenes)for(let beat=0;beat<s.n;beat++){
   await p.evaluate(({id,beat})=>CPVApp.navigation.goToScene(id,beat),{id:s.id,beat});
   const audit=await p.evaluate(()=>{
    const missed=[];for(const root of ['content','scene-label','chapter-label','counter'].map(id=>document.getElementById(id)).filter(Boolean)){
     const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode,e=n.parentElement;if(/\d/.test(n.data)&&e.getClientRects().length&&!e.closest('.cinematic-number')&&getComputedStyle(e).visibility!=='hidden')missed.push(n.data);}
    }return {numbers:CPVApp.numbers.inventory(),missed,overflow:document.documentElement.scrollWidth>innerWidth,errors:CPVApp.getErrors()};
   });result.inventory.push({size,scene:s.id,beat,...audit});check(!audit.missed.length&&!audit.overflow&&!audit.errors.length&&audit.numbers.every(n=>n.progress===1),`${size} scene ${s.id} beat ${beat} coverage/final/overflow`);
  }
 }
 await p.setViewportSize({width:1600,height:900});await p.evaluate(()=>CPVApp.navigation.goToScene(4,0));await p.waitForTimeout(1000);await p.emulateMedia({reducedMotion:'no-preference'});
 await p.evaluate(()=>{CPVApp.numbers.setReducedMotion(false);CPVApp.world.pause();CPVApp.numbers.replay();CPVApp.numbers.pause();});
 const snapshot=()=>p.evaluate(()=>({text:document.getElementById('content').textContent,n:CPVApp.numbers.inventory(),rect:[...document.querySelectorAll('#content .cinematic-number')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})}));
 const start=await snapshot();check(start.n.some(n=>n.progress<1),'normal motion starts');await p.screenshot({path:path.join(__dirname,'evidence/start.png')});
 await p.evaluate(()=>new Promise(resolve=>{CPVApp.numbers.resume();setTimeout(()=>{CPVApp.numbers.pause();resolve();},350);}));const mid=await snapshot();await p.screenshot({path:path.join(__dirname,'evidence/middle.png')});
 fs.writeFileSync(path.join(__dirname,'motion-debug.json'),JSON.stringify({start,mid},null,2));check(mid.n.some(n=>n.progress>0&&n.progress<1),'intermediate motion sampled');
 await p.evaluate(()=>CPVApp.numbers.resume());await p.waitForTimeout(1100);const end=await snapshot();await p.screenshot({path:path.join(__dirname,'evidence/end.png')});
 check(end.n.every(n=>n.progress===1),'animation settles exactly');check(start.text===mid.text&&mid.text===end.text,'canonical text unchanged throughout animation');check(JSON.stringify(start.rect)===JSON.stringify(end.rect),'number geometry stable');
 await p.evaluate(()=>CPVApp.navigation.replay());check((await snapshot()).n.some(n=>n.progress<1),'replay restarts');
 await p.evaluate(()=>{CPVApp.navigation.next();CPVApp.navigation.previous();});check((await snapshot()).n.every(n=>n.progress===1),'previous snaps final');
 await p.evaluate(()=>{for(let i=0;i<20;i++){CPVApp.navigation.next();CPVApp.navigation.previous();}});await p.waitForTimeout(1200);check((await snapshot()).n.every(n=>n.progress===1),'rapid navigation stable');
 await p.evaluate(()=>{CPVApp.navigation.goToScene(5,1);CPVApp.world.pause();CPVApp.numbers.setProgress('restructuring',.5);});
 check((await snapshot()).n.some(n=>n.channel==='restructuring'&&n.progress===.5),'map progress drives 34');
 await p.evaluate(()=>CPVApp.numbers.setProgress('restructuring',1));check((await snapshot()).n.filter(n=>n.channel).every(n=>n.progress===1),'map final exact');
 for(const [id,answer]of [[11,'D'],[12,'A'],[13,'C'],[14,'B']]){
  await p.evaluate(id=>{CPVApp.navigation.goToScene(id,0);CPVApp.numbers.finish();},id);const before=await p.evaluate(()=>CPVApp.numbers.inventory().map(n=>n.text));
  await p.locator(`[data-quiz-option="${answer}"]`).click();check((await snapshot()).n.every(n=>n.progress===1),`quiz ${id} selection does not restart`);
  check(await p.locator('[data-quiz-explanation]').count()===0,`quiz ${id} explanation hidden`);
  await p.locator('[data-quiz-submit]').click();check(await p.locator(`[data-quiz-option="${answer}"].correct`).count()===1,`quiz ${id} correct`);
  check(!/\d/.test(await p.locator('[data-quiz-explanation]').textContent())||(await snapshot()).n.some(n=>n.progress<1),`quiz ${id} new explanation animates`);await p.locator('[data-quiz-reset]').click();
 }
 check(await p.evaluate(()=>JSON.stringify(CPVApp.getData()))===original,'academic data untouched');
 // Public API: formatting, decrement, updates, pause and cancellation.
 const api=await p.evaluate(async()=>{
  const el=document.createElement('span');document.body.append(el);
  const key=CPVApp.numbers.animate(el,{from:2000,to:1234.5,template:'$1,234.50%',duration:100});
  CPVApp.numbers.pause();const a=el.textContent;await new Promise(r=>setTimeout(r,120));const paused=CPVApp.numbers.inventory().find(n=>n.text===a).progress===0;
  CPVApp.numbers.resume();await new Promise(r=>setTimeout(r,180));const settled=el.textContent==='$1,234.50%'&&!el.classList.contains('cn-running');
  CPVApp.numbers.update(key,12.25,'12.25%');CPVApp.numbers.cancel(key);const cancelled=el.textContent==='12.25%'&&!el.classList.contains('cn-running');el.remove();return {paused,settled,cancelled};
 });check(api.paused&&api.settled&&api.cancelled,'countdown decimal grouping prefix suffix pause update cancel');
 check(result.errors.length===0,'no browser exceptions');
}finally{fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(result,null,2));await browser.close();}
console.log(JSON.stringify({passed:result.checks.filter(c=>c.pass).length,total:result.checks.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
