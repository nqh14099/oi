import { createParticleFlag } from './particle-flag.mjs';

export function startFlagPrototype(THREE,{document:doc=document,window:win=window}={}) {
  const canvas=doc.getElementById('flag-canvas'),stage=doc.getElementById('flag-stage');
  const pauseButton=doc.getElementById('flag-pause'),qualityInput=doc.getElementById('flag-quality'),glowInput=doc.getElementById('flag-glow');
  const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners=[],resources=new Set(),errors=[];
  const listen=(target,type,fn)=>{target.addEventListener(type,fn);listeners.push(()=>target.removeEventListener(type,fn));};
  const own=resource=>(resources.add(resource),resource);
  let renderer,flag,scene,camera,frame=null,last=null,time=0,paused=false,destroyed=false,dirty=true;
  const pointer={x:0,y:0,sx:0,sy:0};
  const report=error=>{errors.push(String(error.message??error));doc.getElementById('flag-notice').textContent=errors.at(-1);};
  function dispose(){
    if(destroyed)return;destroyed=true;if(frame!==null)win.cancelAnimationFrame(frame);frame=null;
    for(const remove of listeners)remove();motion.removeEventListener('change',onMotion);
    flag?.dispose();for(const resource of resources)resource.dispose?.();resources.clear();renderer?.dispose();
  }
  function schedule(){if(!destroyed&&!doc.hidden&&frame===null)frame=win.requestAnimationFrame(tick);}
  function invalidate(){dirty=true;schedule();}
  function synchronizeControl(){pauseButton.textContent=paused?'Tiếp tục':'Tạm dừng';pauseButton.setAttribute('aria-pressed',String(paused));}
  function setPaused(value){paused=Boolean(value);last=null;synchronizeControl();invalidate();}
  function onMotion(){last=null;if(motion.matches){Object.assign(pointer,{x:0,y:0,sx:0,sy:0});}invalidate();}
  function resize(){
    const rect=stage.getBoundingClientRect();const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height));
    renderer.setPixelRatio(Math.min(win.devicePixelRatio||1,1.75));renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();flag.setPixels(height/900*renderer.getPixelRatio());invalidate();
  }
  function tick(stamp){
    frame=null;if(destroyed||doc.hidden)return;
    const dt=last===null?0:Math.max(0,(stamp-last)/1000);last=stamp;
    if(!paused&&!motion.matches)time+=dt;
    const alpha=1-Math.exp(-5*Math.min(dt,.1));
    pointer.sx+=(pointer.x-pointer.sx)*alpha;pointer.sy+=(pointer.y-pointer.sy)*alpha;
    const settled=Math.abs(pointer.x-pointer.sx)+Math.abs(pointer.y-pointer.sy)<.001;
    // Stable lookAt; depth response grows near the observer, not separate rotations.
    const yaw=pointer.sx*Math.PI/60,pitch=pointer.sy*Math.PI/90;
    camera.position.set(.25+8.7*Math.sin(yaw),.10+8.7*Math.sin(pitch),8.7*Math.cos(yaw));camera.lookAt(0,0,0);
    flag.setTime(time);renderer.render(scene,camera);dirty=false;
    canvas.dataset.time=time.toFixed(4);
    if((!paused&&!motion.matches)||!settled||dirty)schedule();else last=null;
  }
  try {
    const context=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'});
    if(!context)throw new Error('WebGL2 unavailable');
    renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
    scene=new THREE.Scene();scene.background=new THREE.Color('#02050B');camera=new THREE.PerspectiveCamera(42,16/9,.1,100);
    flag=createParticleFlag(THREE,{quality:'medium'});flag.group.position.x=-1.15;flag.group.rotation.y=-.06;scene.add(flag.group);
    const backdrop=new THREE.Mesh(own(new THREE.PlaneGeometry(2,2)),own(new THREE.ShaderMaterial({depthWrite:false,depthTest:false,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}',
      fragmentShader:`varying vec2 vUv;void main(){vec2 p=(vUv-vec2(.67,.55))*vec2(1.78,1.);
       vec3 col=vec3(.0006,.0012,.0033)+vec3(.0015,.004,.009)*exp(-dot(p,p)*3.4);
       gl_FragColor=vec4(col,1.);
       #include <tonemapping_fragment>
       #include <colorspace_fragment>
      }`})));backdrop.frustumCulled=false;backdrop.renderOrder=-100;scene.add(backdrop);
    // Source-recipe depth hierarchy: distant stars at 0.35, cloth at 0.7,
    // a few nearby drifting particles at 1.4. Physical camera projection supplies
    // the actual parallax; foreground noise never substitutes for readable cloth.
    let seed=9368;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const starGeometry=own(new THREE.BufferGeometry()),positions=[],sizes=[],brightness=[];
    for(let i=0;i<480;i++){positions.push((random()-.5)*38,(random()-.5)*22,-3-random()*19);sizes.push(.6+random()**4*1.8);brightness.push(.12+random()**7*.58);}
    starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));starGeometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));starGeometry.setAttribute('aBrightness',new THREE.Float32BufferAttribute(brightness,1));
    const starMaterial=own(new THREE.ShaderMaterial({uniforms:{uPixels:flag.uniforms.uPixels},transparent:true,depthWrite:false,
      vertexShader:'attribute float aSize,aBrightness;uniform float uPixels;varying float vAlpha;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*uPixels*16./-p.z,.65,4.);vAlpha=aBrightness;}',
      fragmentShader:`varying float vAlpha;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(.60,.68,.77,(1.-smoothstep(.03,.5,r))*vAlpha);
       #include <tonemapping_fragment>
       #include <colorspace_fragment>
      }`}));const stars=new THREE.Points(starGeometry,starMaterial);stars.frustumCulled=false;scene.add(stars);
    const poleGeometry=own(new THREE.CylinderGeometry(.013,.020,5.90,12)),poleMaterial=own(new THREE.MeshStandardMaterial({color:'#4E4541',roughness:.46,metalness:.76}));
    const pole=new THREE.Mesh(poleGeometry,poleMaterial);pole.position.set(-1.15,0,0);scene.add(pole);
    scene.add(new THREE.AmbientLight('#BDC9E0',.6));const light=new THREE.DirectionalLight('#EACD8E',2.6);light.position.set(-3,5,6);scene.add(light);
    listen(pauseButton,'click',()=>setPaused(!paused));
    listen(qualityInput,'change',()=>{flag.setQuality(qualityInput.value);invalidate();});
    listen(glowInput,'change',()=>{flag.setGlow(glowInput.checked);invalidate();});
    listen(stage,'pointermove',event=>{
      if(motion.matches||event.pointerType==='touch')return;const r=stage.getBoundingClientRect();
      pointer.x=Math.max(-1,Math.min(1,(event.clientX-r.left)/r.width*2-1));pointer.y=Math.max(-1,Math.min(1,1-(event.clientY-r.top)/r.height*2));invalidate();
    });listen(stage,'pointerleave',()=>{pointer.x=pointer.y=0;invalidate();});
    listen(doc,'visibilitychange',()=>{last=null;if(doc.hidden){if(frame!==null)win.cancelAnimationFrame(frame);frame=null;}else invalidate();});
    listen(win,'resize',resize);listen(win,'pagehide',event=>{if(event.persisted)setPaused(true);else dispose();});
    listen(canvas,'webglcontextlost',event=>{event.preventDefault();report('Mất kết nối đồ họa. Mở lại bản xem thử.');dispose();});
    motion.addEventListener('change',onMotion);resize();synchronizeControl();
    const api=Object.freeze({
      pause:()=>setPaused(true),resume:()=>setPaused(false),
      captureAt(value){if(!Number.isFinite(value)||value<0)throw new RangeError('time must be nonnegative');time=value;setPaused(true);},
      setPointer(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))throw new TypeError('pointer coordinates');if(!motion.matches){pointer.x=Math.max(-1,Math.min(1,x));pointer.y=Math.max(-1,Math.min(1,y));invalidate();}},
      setQuality(value){flag.setQuality(value);qualityInput.value=value;invalidate();},
      setGlow(value){glowInput.checked=Boolean(value);flag.setGlow(value);invalidate();},
      getState:()=>({time,paused,reducedMotion:motion.matches,destroyed,quality:flag.quality,particles:flag.geometry.drawRange.count,
        camera:camera.position.toArray(),pointer:{...pointer},errors:[...errors],drawCalls:renderer.info.render.calls}),destroy:dispose
    });win.CPVFlagPrototype=api;doc.documentElement.dataset.flagReady='true';return api;
  }catch(error){dispose();report(error);doc.getElementById('flag-static').hidden=false;canvas.hidden=true;doc.getElementById('flag-controls').hidden=true;doc.documentElement.dataset.flagReady='fallback';return null;}
}
