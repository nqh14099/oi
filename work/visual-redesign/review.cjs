const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.argv[2]||'before',out=path.join(__dirname,phase);
const file=path.resolve(process.argv[3]||'dist/reforming_vietnam_political_system_3d.html');
const result={file,phase,states:[],errors:[],consoleErrors:[],requests:[]};
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--allow-file-access-from-files']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
 page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});
 await page.route(/^https?:/,r=>{result.requests.push(r.request().url());return r.abort();});
 await page.goto(pathToFileURL(file).href,{timeout:120000});await page.waitForFunction(()=>window.CPVApp,{timeout:120000});
 const scenes=await page.evaluate(()=>CPVApp.getData().scenes.map(s=>({id:s.id,beats:s.beats.length})));
 for(const size of ['desktop','portrait']){
  await page.setViewportSize(size==='desktop'?{width:1600,height:900}:{width:390,height:844});
  for(const s of scenes){
   for(let beat=0;beat<(size==='desktop'?s.beats:1);beat++){
    await page.evaluate(({id,beat})=>{CPVApp.world.resume();CPVApp.navigation.goToScene(id,beat);}, {id:s.id,beat});
    await page.waitForTimeout(160);
    const state=await page.evaluate(()=>({navigation:CPVApp.navigation.getState(),world:CPVApp.world.getStatus(),overflow:document.documentElement.scrollWidth>innerWidth,errors:CPVApp.getErrors()}));
    result.states.push({size,scene:s.id,beat,...state});
    if(beat===0||[3,4,5,6,7,9,10].includes(s.id)&&beat===s.beats-1){
     await page.screenshot({path:path.join(out,`${size}-${s.id}-${beat}.png`),fullPage:size==='portrait',timeout:120000});
    }
   }
   fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2));
   console.log(`${phase} ${size} scene ${s.id}`);
  }
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
