const fs=require('fs'),path=require('path');const{chromium}=require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const checks=[],errors=[];const check=(pass,name)=>{checks.push({name,pass:!!pass});if(!pass)throw Error(name);};
(async()=>{const b=await chromium.launch({executablePath:'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{const p=await b.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///D:/Downloads/CPV/dist/reforming_vietnam_complete.html');await p.waitForFunction(()=>window.CPVApp);
const data=await p.evaluate(()=>CPVApp.getData());check(data.scenes.length===15&&data.scenes.reduce((n,s)=>n+s.beats.length,0)===37&&data.scenes[1].beats.length===3,'15 scenes / 37 beats / 3 Scene 2 beats');
const source=JSON.parse(fs.readFileSync('build/content.json','utf8'));check(JSON.stringify(data)===JSON.stringify(source),'academic data unchanged');
await p.evaluate(()=>CPVApp.navigation.goToScene(2,0));await p.locator('#viewport').focus();
for(let i=0;i<3;i++){
 if(i)await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);
 check(await p.evaluate(i=>CPVApp.navigation.getState().beatIndex===i&&CPVApp.getWorldState()[2].beat===i,i),`beat ${i} navigation and world agree`);
 check(await p.evaluate(()=>CPVApp.world.getStatus().mode==='webgl'&&document.getElementById('world').getContext('webgl2') instanceof WebGL2RenderingContext),'actual WebGL2 context');
 const overlaps=await p.evaluate(()=>{const els=[...document.querySelectorAll('.system-heading,.system-label,.system-explanation,.system-note')];const bad=[];for(let a=0;a<els.length;a++)for(let b=a+1;b<els.length;b++){const x=els[a].getBoundingClientRect(),y=els[b].getBoundingClientRect();if(Math.min(x.right,y.right)>Math.max(x.left,y.left)+1&&Math.min(x.bottom,y.bottom)>Math.max(x.top,y.top)+1)bad.push([els[a].className,els[b].className]);}return bad;});if(overlaps.length)console.log(overlaps);check(overlaps.length===0,`beat ${i} label boxes do not overlap`);
 await p.keyboard.press('r');check(await p.evaluate(i=>CPVApp.navigation.getState().beatIndex===i,i),`beat ${i} replay preserves position`);
}
await p.keyboard.press('ArrowLeft');check(await p.evaluate(()=>CPVApp.navigation.getState().beatIndex===1),'Previous reverses beat');await p.keyboard.press('ArrowLeft');await p.keyboard.press('ArrowLeft');check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===1),'Previous crosses boundary');await p.keyboard.press('ArrowRight');check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===2),'Next reenters Scene 2');
await p.evaluate(()=>{CPVApp.navigation.goToScene(2,2);CPVApp.navigation.next();});check(await p.evaluate(()=>CPVApp.navigation.getState().sceneId===3),'Next exits to existing Scene 3');
check(errors.length===0&&await p.evaluate(()=>CPVApp.getErrors().length===0),'no app or browser errors');
}finally{await b.close();fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify({checks,errors},null,2));}console.log(JSON.stringify({pass:checks.filter(x=>x.pass).length,total:checks.length}));})().catch(e=>{console.error(e);process.exitCode=1;});
