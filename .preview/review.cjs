const {Browser}=require('./cpv-cdp.cjs');
const fs=require('node:fs');
(async()=>{const b=await new Browser().open();try{
 await b.call('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
 await b.call('Network.enable');await b.call('Network.setBlockedURLs',{urls:['http://*','https://*']});
 await b.call('Page.navigate',{url:'file:///D:/Downloads/CPV/dist/reforming_vietnam_complete.html'});await b.call('Page.bringToFront');
 await b.wait('window.CPVApp',15000);
 console.log('START',JSON.stringify(await b.eval('({errors:CPVApp.getErrors(),world:CPVApp.world?.getStatus(),state:CPVApp.navigation.getState(),hidden:document.hidden})')));
 await b.eval('CPVApp.world.setQuality("low");CPVApp.world.setReducedMotion(true);CPVApp.world.setBeat(0);');
 for(const [id,beat] of [[1,0],[2,2],[3,1],[5,1],[7,2],[10,2],[11,0],[15,0]]){
  await b.eval(`CPVApp.navigation.goToScene(${id},${beat});`);await new Promise(r=>setTimeout(r,700));
  await b.shot('D:/Downloads/CPV/.preview/scene-'+id+'.png');
  console.log('SCENE',id,JSON.stringify(await b.eval('({errors:CPVApp.getErrors(),state:CPVApp.getWorldState(),body:document.querySelector("#content").innerText.substring(0,110)})')));
 }
 console.log('NETWORK',b.events.filter(e=>e.method==='Network.requestWillBeSent').map(e=>e.params.request.url));
}finally{b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
