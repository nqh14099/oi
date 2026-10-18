export function startMazePrototype(THREE, data, {createWorldEngine,createSceneController,createInputController,createMazeScene}) {
  const sceneData=data.scenes.find(s=>s.id===3),errors=[],listeners=[];
  const $=id=>document.getElementById(id),listen=(el,event,fn)=>{el.addEventListener(event,fn);listeners.push(()=>el.removeEventListener(event,fn));};
  const navigation=createSceneController(data),scene=createMazeScene();
  const world=createWorldEngine({THREE,canvas:$('view'),fallbackCanvas:$('fallback'),navigation,onError:e=>{errors.push(String(e));$('error').textContent='Đang dùng chế độ minh họa dự phòng.';}});
  world.registerScene(3,scene);world.initialize();navigation.goToScene(3,0);
  const controls={getState:navigation.getState,next:()=>{if(navigation.getState().beatIndex<5)navigation.next();},previous:()=>{if(navigation.getState().beatIndex>0)navigation.previous();},replay:navigation.replay};
  const input=createInputController(controls,$('stage'));
  sceneData.beats.forEach((b,i)=>{const button=document.createElement('button');button.textContent=String(i+1);button.title=b.label;button.setAttribute('aria-label',b.label);listen(button,'click',()=>navigation.goToScene(3,i));$('steps').append(button);});
  function sync(){const i=navigation.getState().beatIndex,b=sceneData.beats[i];$('heading').textContent=b.audience.heading;$('body').textContent=b.audience.body;
    $('previous').disabled=i===0;$('next').disabled=i===5;$('next').textContent=['Follow the application','Apply Reform','Why reform?','Clear responsibility','Capacity to adapt','End of scene'][i];
    [...$('steps').children].forEach((el,k)=>{if(i===k)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    $('drivers').hidden=i<3;[...$('drivers').children].forEach((el,k)=>el.classList.toggle('active',k===i-3));
  }
  const unsub=navigation.subscribe(sync);sync();
  listen($('next'),'click',controls.next);listen($('previous'),'click',controls.previous);listen($('replay'),'click',controls.replay);
  listen($('quality'),'change',()=>world.setQuality($('quality').value));
  const media=matchMedia('(prefers-reduced-motion:reduce)');$('reduced').checked=media.matches;
  const reduce=value=>{world.setReducedMotion(value);$('reduced').checked=value;world.setBeat(navigation.getState().beatIndex);};
  listen($('reduced'),'change',()=>reduce($('reduced').checked));listen(media,'change',e=>reduce(e.matches));
  let destroyed=false;function destroy(){if(destroyed)return;destroyed=true;input.destroy();unsub();for(const remove of listeners)remove();world.destroy();navigation.destroy();}
  listen(window,'pagehide',e=>{if(e.persisted)world.pause();else destroy();});listen(window,'pageshow',e=>{if(e.persisted)world.resume();});
  window.CPVMaze=Object.freeze({next:controls.next,previous:controls.previous,replay:controls.replay,goToBeat:i=>navigation.goToScene(3,i),setReducedMotion:reduce,
    getState:()=>({navigation:navigation.getState(),visual:scene.getState(),world:world.getStatus(),errors:[...errors],destroyed}),destroy});
  document.documentElement.dataset.mazeReady='true';
}
