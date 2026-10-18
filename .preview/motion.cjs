const {Browser}=require('./cpv-cdp.cjs');const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await new Browser().open();try{
 await b.call('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await b.call('Page.navigate',{url:'file:///D:/Downloads/CPV/dist/reforming_vietnam_complete.html'});await b.call('Page.bringToFront');await b.wait('window.CPVApp');
 await b.eval('CPVApp.world.setQuality("low");CPVApp.navigation.goToScene(3,0)');
 await delay(1500);await b.shot('D:/Downloads/CPV/.preview/maze-enter.png');
 await b.eval('CPVApp.navigation.goToScene(3,2)');await delay(1700);await b.shot('D:/Downloads/CPV/.preview/maze-transform.png');
 console.log('REFORM MID',JSON.stringify(await b.eval('({state:CPVApp.getWorldState()[3],camera:CPVApp.world.camera.getPose()})')));
 await b.wait('CPVApp.getWorldState()[3].reform===1',20000);await b.shot('D:/Downloads/CPV/.preview/maze-clear.png');
 await b.eval('CPVApp.navigation.goToScene(7,0)');await delay(1600);await b.shot('D:/Downloads/CPV/.preview/service-start.png');
 await b.eval('CPVApp.navigation.next()');await delay(450);await b.shot('D:/Downloads/CPV/.preview/service-middle.png');
 await delay(1500);await b.shot('D:/Downloads/CPV/.preview/service-process.png');
 let assertions=0;const check=(value,label)=>{if(!value)throw Error(label);assertions++;};
 check(await b.eval('CPVApp.getErrors().length===0'),'render errors');
 check(await b.eval('CPVApp.getWorldState()[3].tubes===9'),'volumetric cables');
 await b.eval('CPVApp.world.setReducedMotion(true);CPVApp.navigation.goToScene(3,2)');
 check(await b.eval('CPVApp.getWorldState()[3].reform===1&&!CPVApp.getWorldState()[3].animating'),'reduced reform');
 await b.eval('CPVApp.navigation.previous()');
 check(await b.eval('CPVApp.getWorldState()[3].reform===0'),'reverse reform');
 await b.eval('CPVApp.navigation.goToScene(7,3)');await delay(150);
 check(await b.eval('CPVApp.navigation.getState().beatIndex===3&&document.querySelectorAll(".service-station").length===4'),'four service stages');
 check(await b.eval('(()=>{const r=document.querySelector(".service-help").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;})()'),'desktop help placement');
 await b.shot('D:/Downloads/CPV/.preview/service-final.png');
 await b.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await b.eval('CPVApp.world.resize()');
 for(const id of [3,7]){await b.eval(`CPVApp.navigation.goToScene(${id},0)`);await delay(200);check(await b.eval('document.documentElement.scrollWidth<=innerWidth'),'portrait overflow');await b.shot(`D:/Downloads/CPV/.preview/portrait-${id}.png`);}
 console.log('GRAPHICS CHECKS',assertions);
 console.log('FINAL',JSON.stringify(await b.eval('({errors:CPVApp.getErrors(),navigation:CPVApp.navigation.getState(),camera:CPVApp.world.camera.getPose()})')));
}finally{b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
