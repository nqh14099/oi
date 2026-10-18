const {Browser}=require('./cpv-cdp.cjs');const fs=require('node:fs');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await new Browser().open();let assertions=0;
const check=(value,message)=>{if(!value)throw Error(message);assertions++;};
try{
 await b.call('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await b.call('Network.enable');await b.call('Network.setBlockedURLs',{urls:['http://*','https://*']});
 await b.call('Page.navigate',{url:'file:///D:/Downloads/CPV/dist/reforming_vietnam_complete.html'});await b.call('Page.bringToFront');await b.wait('window.CPVApp');
 await b.eval('document.querySelector("[data-action=settings]").click();document.getElementById("setting-quality").value="low";document.getElementById("setting-quality").dispatchEvent(new Event("change"));document.getElementById("setting-motion").checked=true;document.getElementById("setting-motion").dispatchEvent(new Event("change"));');
 await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
 const sceneData=await b.eval('CPVApp.getData().scenes.map(s=>({id:s.id,beats:s.beats.length}))');
 for(const s of sceneData){for(let beat=0;beat<s.beats;beat++){
   await b.eval(`CPVApp.navigation.goToScene(${s.id},${beat});`);
   check(await b.eval(`CPVApp.navigation.getState().sceneId===${s.id}&&CPVApp.navigation.getState().beatIndex===${beat}&&CPVApp.world.getStatus().activeSceneId===${s.id}`),'scene/beat mismatch');
  }}
 check(await b.eval('document.querySelector("#content").textContent.trim()==="Thank you for listening"'),'outro');
 for(const id of [3,4,6,7,8,9]){
  const beat=id===3?1:id===7?2:0;await b.eval(`CPVApp.navigation.goToScene(${id},${beat});`);await delay(150);await b.shot(`D:/Downloads/CPV/.preview/final-${id}.png`);
 }
 for(const [id,answer]of [[11,'D'],[12,'A'],[13,'C'],[14,'B']]){
  await b.eval(`CPVApp.navigation.goToScene(${id},0)`);
  check(await b.eval('document.querySelectorAll("[data-quiz-option]").length===4&&!document.querySelector("[data-quiz-explanation]")'),'quiz hidden');
  await b.eval(`document.querySelector('[data-quiz-option="${answer}"]').click()`);
  check(await b.eval('!document.querySelector("[data-quiz-explanation]")'),'answer revealed on selection');
  await b.eval('document.querySelector("[data-quiz-submit]").click()');
  check(await b.eval(`document.querySelector('.quiz-option.correct').dataset.quizOption==='${answer}'&&!!document.querySelector('[data-quiz-explanation]')&&CPVApp.navigation.getState().sceneId===${id}`),'submitted answer');
  if(id===14)await b.shot('D:/Downloads/CPV/.preview/quiz-explained.png');
  await b.eval('document.querySelector("[data-quiz-reset]").click()');
  check(await b.eval('!document.querySelector("[data-quiz-explanation]")&&!CPVApp.getQuizState().selected'),'quiz reset');
 }
 await b.eval('CPVApp.navigation.goToScene(3,0)');
 await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space'});await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space'});
 check(await b.eval('CPVApp.navigation.getState().beatIndex===1'),'keyboard next');
 await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'r',code:'KeyR'});await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'r',code:'KeyR'});
 check(await b.eval('CPVApp.navigation.getState().beatIndex===1'),'replay');
 await b.eval('CPVApp.navigation.goToScene(4,0);CPVApp.navigation.previous()');
 check(await b.eval('CPVApp.navigation.getState().sceneId===3&&CPVApp.navigation.getState().beatIndex===5'),'previous boundary');
 await b.eval('CPVApp.navigation.goToScene(4,0);document.querySelector("[data-action=editor]").click()');
 const before=await b.eval('CPVApp.getData().scenes[3].beats[0].audience.heading');
 await b.eval('document.querySelector("#panel-content textarea").value="Edited heading";document.querySelector("#editor-apply").click()');
 check(await b.eval('CPVApp.getData().scenes[3].beats[0].audience.heading==="Edited heading"'),'edit applied');
 await b.eval('document.querySelector("[data-editor-undo]").click()');
 check(await b.eval(`CPVApp.getData().scenes[3].beats[0].audience.heading===${JSON.stringify(before)}`),'undo');
 await b.eval('document.querySelector("[data-editor-redo]").click()');
 check(await b.eval('CPVApp.getData().scenes[3].beats[0].audience.heading==="Edited heading"'),'redo');
 const exported=await b.eval('CPVApp.exportHTML()');fs.writeFileSync('D:/Downloads/CPV/.preview/export-test.html',exported);
 check(exported.includes('Edited heading'),'export edit');
 await b.eval('document.querySelector("[data-editor-undo]").click()');
 await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
 await b.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await b.eval('CPVApp.world.resize()');
 for(const id of [1,2,3,5,7,11,15]){
  await b.eval(`CPVApp.navigation.goToScene(${id},0);scrollTo(0,0)`);await delay(80);
  check(await b.eval('document.documentElement.scrollWidth<=innerWidth'),'portrait horizontal overflow scene '+id);
  if([3,7,11].includes(id))await b.shot(`D:/Downloads/CPV/.preview/portrait-${id}.png`);
 }
 check((await b.eval('CPVApp.getErrors()')).length===0,'runtime errors');
 check(b.events.filter(e=>e.method==='Network.requestWillBeSent').every(e=>e.params.request.url.startsWith('file:')),'network requests');
 console.log(JSON.stringify({assertions,errors:await b.eval('CPVApp.getErrors()'),allBeats:sceneData.reduce((s,x)=>s+x.beats,0),exportBytes:exported.length,portrait:'390px',network:'file only'}));
 await b.call('Page.navigate',{url:'file:///D:/Downloads/CPV/.preview/export-test.html'});await b.call('Page.bringToFront');await b.wait('window.CPVApp');
 check(await b.eval('CPVApp.getData().scenes[3].beats[0].audience.heading==="Edited heading"&&CPVApp.getErrors().length===0'),'export opens');
 console.log('EXPORT REOPEN PASS');
}finally{b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
