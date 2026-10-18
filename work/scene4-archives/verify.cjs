const fs=require('fs'),path=require('path'),crypto=require('crypto');const{chromium}=require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const checks=[],errors=[];function check(ok,name){checks.push({name,pass:!!ok});if(!ok)throw Error(name);}
(async()=>{const b=await chromium.launch({executablePath:'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///D:/Downloads/CPV/dist/reforming_vietnam_complete.html');await p.waitForFunction(()=>window.CPVApp);
 const data=await p.evaluate(()=>CPVApp.getData());check(data.scenes.length===15&&data.scenes.reduce((n,s)=>n+s.beats.length,0)===37,'15 scenes and 37 beats');check(JSON.stringify(data)===JSON.stringify(JSON.parse(fs.readFileSync('build/content.json','utf8'))),'academic data unchanged');
 await p.evaluate(()=>CPVApp.navigation.goToScene(4,0));await p.locator('#viewport').focus();
 for(let i=0;i<3;i++){if(i)await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);
  check(await p.evaluate(i=>CPVApp.getWorldState()[4].selectedYear===['1986','2017','2025'][i]&&CPVApp.navigation.getState().beatIndex===i,i),`beat ${i} selected book and navigation`);
  check(await p.evaluate(()=>CPVApp.world.getStatus().mode==='webgl'&&document.getElementById('world').getContext('webgl2') instanceof WebGL2RenderingContext),`beat ${i} actual WebGL2`);
  check(await p.locator('.archive-year').textContent()===['1986','2017','2025'][i],`beat ${i} visible year`);
  await p.keyboard.press('r');check(await p.evaluate(i=>CPVApp.getWorldState()[4].beat===i&&CPVApp.navigation.getState().beatIndex===i,i),`beat ${i} replay deterministic`);
 }
 await p.keyboard.press('ArrowLeft');check(await p.evaluate(()=>CPVApp.getWorldState()[4].selectedYear==='2017'),'Previous book');await p.keyboard.press('ArrowLeft');await p.keyboard.press('ArrowLeft');check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===3),'Previous boundary');await p.keyboard.press('ArrowRight');check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===4),'Next boundary');
 await p.evaluate(()=>{CPVApp.navigation.goToScene(4,2);CPVApp.navigation.next();});check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===5),'next into existing map');
 check(errors.length===0&&await p.evaluate(()=>CPVApp.getErrors().length===0),'no app or browser errors');
 const sourceHash=crypto.createHash('sha256').update(fs.readFileSync('landing-pages/bestsellers-book-showcase.html')).digest('hex');check(sourceHash==='5315520b8a04dcd183bc5bce192fe120329826a91304986beda8537c18294843','reference HTML unchanged');
}finally{await b.close();fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify({checks,errors},null,2));}console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length}));})().catch(e=>{console.error(e);process.exitCode=1;});
