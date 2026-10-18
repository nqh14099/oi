const fs=require('fs'),path=require('path');const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=__dirname,checks=[],errors=[];const check=(ok,name)=>{checks.push({name,pass:!!ok});if(!ok)throw Error(name);};
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--allow-file-access-from-files']});
 const context=await b.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce',acceptDownloads:true});
 try{
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(path.resolve('dist/reforming_vietnam_complete.html')).href);await p.waitForFunction(()=>window.CPVApp);
 await p.evaluate(()=>CPVApp.navigation.goToScene(3,0));await p.locator('#viewport').focus();
 await p.keyboard.press('ArrowLeft');check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===2&&CPVApp.navigation.getState().beatIndex===2),'keyboard reverse boundary');
 await p.keyboard.press('Space');check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===3&&CPVApp.navigation.getState().beatIndex===0),'keyboard next boundary');
 await p.keyboard.press('r');check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===3&&CPVApp.navigation.getState().beatIndex===0),'replay position');
 for(const [id,answer]of [[11,'D'],[12,'A'],[13,'C'],[14,'B']]){
  await p.evaluate(id=>CPVApp.navigation.goToScene(id,0),id);
  check(await p.locator('[data-quiz-option]').count()===4&&await p.locator('[data-quiz-explanation]').count()===0,`quiz ${id} four options, answer hidden`);
  await p.locator(`[data-quiz-option="${answer}"]`).click();check(await p.locator('[data-quiz-explanation]').count()===0,`quiz ${id} no premature explanation`);
  await p.locator('[data-quiz-submit]').click();check(await p.locator(`[data-quiz-option="${answer}"].correct`).count()===1&&await p.locator('[data-quiz-explanation]').count()===1,`quiz ${id} correct explanation`);
  check(await p.evaluate(id=>CPVApp.navigation.getState().sceneId===id,id),`quiz ${id} no auto advance`);
  await p.screenshot({path:path.join(out,'evidence',`quiz-${id}-submitted.png`)});
  await p.locator('[data-quiz-reset]').click();check(await p.locator('[data-quiz-explanation]').count()===0,`quiz ${id} reset`);
 }
 await p.locator('[data-quiz-option="A"]').click();await p.locator('[data-quiz-submit]').click();check(await p.locator('[data-quiz-option="A"].incorrect').count()===1,'wrong answer state');
 await p.evaluate(()=>CPVApp.navigation.goToScene(4,0));await p.locator('#viewport').focus();await p.keyboard.press('e');
 const original=await p.locator('#edit-heading').inputValue();await p.locator('#edit-heading').fill('Temporary editor verification');await p.locator('#editor-apply').click();
 check(await p.evaluate(()=>CPVApp.getData().scenes[3].beats[0].audience.heading==='Temporary editor verification'),'editor apply');
 await p.locator('[data-editor-undo]').click();check(await p.locator('#edit-heading').inputValue()===original,'editor undo');
 await p.locator('[data-editor-redo]').click();check(await p.locator('#edit-heading').inputValue()==='Temporary editor verification','editor redo');
 await p.reload();await p.waitForFunction(()=>window.CPVApp);check(await p.evaluate(()=>CPVApp.getData().scenes[3].beats[0].audience.heading==='Temporary editor verification'),'localStorage restores actual edit');
 await p.evaluate(()=>CPVApp.navigation.goToScene(4,0));await p.locator('#viewport').focus();await p.keyboard.press('e');
 const downloadPromise=p.waitForEvent('download');await p.locator('#editor-export').click();const download=await downloadPromise;const exportedPath=path.join(out,'export-check.html');await download.saveAs(exportedPath);check(fs.statSync(exportedPath).size>2000000,'HTML download');
 await p.keyboard.press('Escape');await p.locator('#viewport').focus();const popupPromise=p.waitForEvent('popup');await p.keyboard.press('n');const notes=await popupPromise;await notes.waitForLoadState();check(await notes.locator('#notes-script').textContent()!=='','presenter notes open');await notes.close();
 await p.locator('#viewport').focus();await p.keyboard.press('m');check(await p.evaluate(()=>CPVApp.getAudioState().muted===false),'audio toggle on');await p.keyboard.press('m');check(await p.evaluate(()=>CPVApp.getAudioState().muted===true),'audio toggle off');
 await p.goto(pathToFileURL(exportedPath).href);await p.waitForFunction(()=>window.CPVApp);check(await p.evaluate(()=>CPVApp.getData().scenes[3].beats[0].audience.heading==='Temporary editor verification'),'export reopens with edit');
 await p.evaluate(()=>CPVApp.world.pause());
 const roundTrip=await p.evaluate(()=>{let states=0;for(const s of CPVApp.getData().scenes)for(let i=0;i<s.beats.length;i++){CPVApp.navigation.goToScene(s.id,i);const n=CPVApp.navigation.getState();if(n.sceneId!==s.id||n.beatIndex!==i)throw Error('navigation mismatch');states++;}return {states,errors:CPVApp.getErrors(),closing:document.querySelector('#content').textContent.trim()};});
 check(roundTrip.states===37&&roundTrip.errors.length===0,'export all 37 beats');check(roundTrip.closing==='Thank you for listening','closing exact phrase');
 const fallback=await context.newPage();await fallback.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:orig.call(this,type,...args);};});
 await fallback.goto(pathToFileURL(path.resolve('dist/reforming_vietnam_complete.html')).href);await fallback.waitForFunction(()=>window.CPVApp);check(await fallback.evaluate(()=>CPVApp.world.getStatus().mode!=='webgl'&&CPVApp.getErrors().length===0),'2D fallback starts without WebGL');await fallback.close();
 check(errors.length===0,'no page exceptions');
 }finally{fs.writeFileSync(path.join(out,'interaction-results.json'),JSON.stringify({checks,errors},null,2));await b.close();}
 console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,errors}));
})().catch(e=>{console.error(e);process.exitCode=1;});
