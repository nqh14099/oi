// One renderer, authored worlds, deterministic beat positions. No independent RAF.
function createFlagHero() {
  let T, flag, wordmark, clock=0, beat=0, ctxRef, targets, post, lastSize='', lastHeading='', disposed=false;
  const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
  const kfLandscape = [
    { t: 0.0, eye: [0.72, 0.46, 1.45], aim: [1.70, 0.65, -0.25], fov: 42 },
    { t: 1.0, eye: [0.92, 0.52, 1.72], aim: [1.66, 0.66, -0.22], fov: 41 },
    { t: 2.4, eye: [1.38, 0.70, 2.15], aim: [1.56, 0.68, -0.19], fov: 40 },
    { t: 4.2, eye: [1.25, 0.70, 2.48], aim: [1.48, 0.68, -0.18], fov: 39 }
  ];
  const kfPortrait = [
    { t: 0.0, eye: [1.10, 0.55, 1.85], aim: [1.50, 0.65, -0.15], fov: 48 },
    { t: 1.8, eye: [1.35, 0.68, 2.30], aim: [1.45, 0.68, -0.15], fov: 46 },
    { t: 4.2, eye: [1.35, 0.72, 2.75], aim: [1.38, 0.70, -0.15], fov: 45 }
  ];

  function evalCameraPath(kfs, time) {
    if (time <= kfs[0].t) return kfs[0];
    if (time >= kfs[kfs.length - 1].t) {
      const last = kfs[kfs.length - 1];
      const dt = time - last.t;
      const driftX = Math.sin(dt * 0.4) * 0.012;
      const driftY = Math.cos(dt * 0.35) * 0.008;
      return {
        eye: [last.eye[0] + driftX, last.eye[1] + driftY, last.eye[2]],
        aim: [last.aim[0] + driftX * 0.5, last.aim[1] + driftY * 0.5, last.aim[2]],
        fov: last.fov
      };
    }
    let i = 0;
    while (i < kfs.length - 1 && kfs[i + 1].t < time) i++;
    const k1 = kfs[i], k2 = kfs[i + 1];
    const u = (time - k1.t) / (k2.t - k1.t);
    const s = u * u * (3 - 2 * u);
    return {
      eye: k1.eye.map((v, idx) => v + (k2.eye[idx] - v) * s),
      aim: k1.aim.map((v, idx) => v + (k2.aim[idx] - v) * s),
      fov: k1.fov + (k2.fov - k1.fov) * s
    };
  }

  function pose(ctx) {
    if (typeof window !== 'undefined' && window._scene1ObliqueProof) {
      ctx.camera.reset({ position: [0.75, 0.45, 1.58], target: [1.52, 0.65, -0.22], fov: 42 });
      return;
    }
    const portrait = ctx.size.width < ctx.size.height;
    const camTime = ctx.reducedMotion ? 5.0 : clock;
    const kfs = portrait ? kfPortrait : kfLandscape;
    const { eye, aim, fov } = evalCameraPath(kfs, camTime);
    if (beat === 1) { eye[2] += 0.35; aim[0] -= 0.10; }
    ctx.camera.reset({ position: eye, target: aim, fov });
    document.body.style.setProperty('--hero-reveal', String(ctx.reducedMotion ? 1 : Math.max(0, Math.min(1, (camTime - 1.2) / 2.8))));
  }
  function makePost(ctx,renderer) {
    const type=renderer.getContext().getExtension('EXT_color_buffer_float')?T.HalfFloatType:T.UnsignedByteType;
    const target=depth=>ctx.own(new T.WebGLRenderTarget(1,1,{type,depthBuffer:depth}));
    targets={linear:target(true),a:target(false),b:target(false),wideA:target(false),wideB:target(false)};
    targets.linear.texture.colorSpace=T.LinearSRGBColorSpace;
    const vertex=`varying vec2 vUV;void main(){vUV=uv;gl_Position=vec4(position.xy,0.,1.);}`;
    const blur=ctx.own(new T.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,
      uniforms:{tInput:{value:null},uStep:{value:new T.Vector2()},uExtract:{value:2}},vertexShader:vertex,
      fragmentShader:`varying vec2 vUV;uniform sampler2D tInput;uniform vec2 uStep;uniform float uExtract;
      vec3 light(vec2 p){vec3 c=texture2D(tInput,p).rgb;float peak=max(c.r,max(c.g,c.b));return c*mix(1.,smoothstep(.32,1.10,peak),min(1.,uExtract));}
      void main(){if(uExtract>1.5){vec3 sum=vec3(0.);for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)sum+=light(vUV+vec2(float(x),float(y))*uStep);gl_FragColor=vec4(sum/9.,1.);return;}
      vec3 c=light(vUV)*.227027;c+=light(vUV+uStep*1.384615)*.316216;c+=light(vUV-uStep*1.384615)*.316216;c+=light(vUV+uStep*3.230769)*.070270;c+=light(vUV-uStep*3.230769)*.070270;gl_FragColor=vec4(c,1.);}`}));
    const composite=ctx.own(new T.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,
      uniforms:{tColor:{value:targets.linear.texture},tBloom:{value:targets.a.texture},tWide:{value:targets.wideB.texture},uGlow:flag.uniforms.uGlow},vertexShader:vertex,
      fragmentShader:`varying vec2 vUV;uniform sampler2D tColor,tBloom,tWide;uniform float uGlow;
      vec3 film(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
      void main(){vec3 c=texture2D(tColor,vUV).rgb+(texture2D(tBloom,vUV).rgb*1.12+texture2D(tWide,vUV).rgb*.20)*uGlow;
      float vignette=1.-.30*smoothstep(.25,.85,length((vUV-.5)*vec2(1.,.75)));gl_FragColor=vec4(film(c*.95)*vignette,1.);
      #include <colorspace_fragment>
      }`}));
    const plane=ctx.own(new T.PlaneGeometry(2,2)),camera=new T.OrthographicCamera(-1,1,1,-1,0,1);
    const blurScene=new T.Scene(),outScene=new T.Scene();blurScene.add(new T.Mesh(plane,blur));outScene.add(new T.Mesh(plane,composite));
    post={blur,composite,blurScene,outScene,camera};
  }
  return {
    get animated(){return !disposed;},
    setup(ctx){T=ctx.THREE;ctxRef=ctx;
      flag=createCinematicFlag(T,{quality:ctx.quality==='low'?'low':'high'});
      flag.group.position.set(-0.65,0.45,0);flag.group.rotation.y=-0.22;flag.group.scale.set(1.22,1.22,1.22);
      ctx.root.add(flag.group);
      wordmark=createParticleWordmark(T,{stageWidth:1600,stageHeight:900});
      wordmark.attachTo(flag.group);
      const positions=[];let seed=7281;for(let i=0;i<150;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed/4294967296;seed=(Math.imul(seed,1664525)+1013904223)>>>0;positions.push((x-.5)*24,(seed/4294967296-.5)*14,-3-i%12);}
      ctx.root.add(new T.Points(ctx.own(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3))),ctx.own(new T.PointsMaterial({color:'#cbd3df',size:.018,opacity:.28,transparent:true,depthWrite:false}))));
    },
    activate(ctx){clock=0;ctx.setBackground({color:'#040710',fogNear:60,fogFar:120});ctx.setLighting({ambient:{intensity:.2},directional:{intensity:0},point:{intensity:0}});pose(ctx);},
    setBeat(i,ctx,meta={}){beat=i;if(i===0||meta.replay)clock=0;else clock=Math.max(clock,4.4);flag.uniforms.uShotGain.value=i===1?.65:1;flag.setTime(ctx.reducedMotion?4.8:clock);wordmark?.update(clock,0,beat,ctx.reducedMotion);pose(ctx);ctx.invalidate();},
    update(dt,ctx){clock+=dt;pose(ctx);flag.setTime(clock);wordmark?.update(clock,dt,beat,ctx.reducedMotion);ctx.invalidate();},
    render(ctx,renderer,scene,camera){
      if(!post)makePost(ctx,renderer);
      const key=`${ctx.size.width}:${ctx.size.height}:${renderer.getPixelRatio()}:${ctx.quality}`;
      if(key!==lastSize){lastSize=key;const w=ctx.size.width,h=ctx.size.height,dpr=renderer.getPixelRatio();targets.linear.setSize(Math.round(w*dpr),Math.round(h*dpr));
        targets.a.setSize(Math.max(1,Math.round(w/2)),Math.max(1,Math.round(h/2)));targets.b.setSize(targets.a.width,targets.a.height);
        targets.wideA.setSize(Math.max(1,Math.round(w/8)),Math.max(1,Math.round(h/8)));targets.wideB.setSize(targets.wideA.width,targets.wideA.height);
        flag.setPixels((h/900)*dpr);flag.setQuality(ctx.quality==='low'?'low':'high');
        wordmark?.resize(w,h,dpr);pose(ctx);
      }
      if(beat===0&&wordmark&&typeof document!=='undefined'){
        const headingEl=document.querySelector('#content .cover-title');
        const hText=headingEl?headingEl.textContent.trim():'';
        if(hText&&hText!==lastHeading){lastHeading=hText;wordmark.setHeading(hText);}
      }
      const old=renderer.getRenderTarget();
      try{
        renderer.setRenderTarget(targets.linear);renderer.render(scene,camera);
        const u=post.blur.uniforms;
        const pass=(source,to,x,y,extract)=>{u.tInput.value=source.texture;u.uStep.value.set(x,y);u.uExtract.value=extract;renderer.setRenderTarget(to);renderer.render(post.blurScene,post.camera);};
        pass(targets.linear,targets.a,1.25/targets.linear.width,1.25/targets.linear.height,2);
        pass(targets.a,targets.b,1/targets.a.width,0,0);pass(targets.b,targets.a,0,1/targets.a.height,0);
        pass(targets.a,targets.wideA,1/targets.wideA.width,0,0);pass(targets.wideA,targets.wideB,0,1/targets.wideB.height,0);
        renderer.setRenderTarget(old);renderer.render(post.outScene,post.camera);
      }finally{renderer.setRenderTarget(old);}
    },
    deactivate(){document.body.style.setProperty('--hero-reveal','1');},
    dispose(){disposed=true;flag?.dispose();wordmark?.dispose();post=null;targets=null;ctxRef=null;},
    drawFallback(g,ctx){const w=ctx.size.width,h=ctx.size.height;g.save();g.fillStyle='#040710';g.fillRect(0,0,w,h);let seed=61;
      for(let i=0;i<12500;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const u=seed/4294967296;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=seed/4294967296;
        const gold=flagReference.emblemContains(u,v);g.fillStyle=gold?'#dca85f':'#841d30';g.globalAlpha=gold?.72:.24;
        g.fillRect(w*(.40+u*.55),h*(.15+v*.54)+Math.sin(u*9+v*3)*h*.025,gold?1.8:1.1,gold?1.8:1.1);
      }g.restore();document.body.style.setProperty('--hero-reveal','1');},
    setTime(t){if(Number.isFinite(t)){clock=t;pose(ctxRef);flag.setTime(clock);wordmark?.update(clock,0,beat,ctxRef?.reducedMotion??false);ctxRef?.invalidate?.();}},
    getState:()=>({beat,time:clock,particlesOnly:true,particles:(flag?.geometry?.attributes?.position?.count??0)+(wordmark?20000:0),disposed})
  };
}

function restoreEnvironment(module,lighting,color='#070b13'){
  const activate=module.activate;
  module.activate=ctx=>{ctx.setBackground({color,fogNear:40,fogFar:80});ctx.setLighting(lighting);activate?.(ctx);};
  return module;
}

function createQuietWorld(outro=false){
  return {setup(ctx){if(outro)return;const T=ctx.THREE,positions=[];
    for(let i=0;i<90;i++)positions.push(Math.sin(i*127.1)*12,Math.cos(i*49.4)*7,-i%10-4);
    ctx.root.add(new T.Points(ctx.own(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3))),ctx.own(new T.PointsMaterial({color:'#c2b79f',size:.015,transparent:true,opacity:.22}))));},
    activate(ctx){ctx.setBackground({color:null,fogNear:50,fogFar:90});ctx.camera.reset({position:[0,0,14],target:[0,0,0],fov:42});},setBeat(){},
    drawFallback(g,ctx){g.fillStyle=outro?'#130c14':'#0d1018';g.fillRect(0,0,ctx.size.width,ctx.size.height);}};
}

export function registerCinematicWorld(world,{THREE,data,numbers}){
  const modules=registerSupportingWorlds(world,{THREE,data});
  const politicalSystem=createPoliticalSystemScene();world.registerScene(2,politicalSystem);modules.set(2,politicalSystem);
  const archives=createArchiveScene(data.scenes.find(s=>s.id===4));world.registerScene(4,archives);modules.set(4,archives);
  const flag=createFlagHero();world.registerScene(1,flag);modules.set(1,flag);
  const maze=restoreEnvironment(createMazeScene({numbers}),{ambient:{color:'#8b91a6',intensity:.45},directional:{color:'#edd6ad',intensity:1.0,position:[-3,7,4],castShadow:false},point:{color:'#c38457',intensity:4,position:[0,4,2],distance:18}},'#040711');
  const mazeSetup=maze.setup,mazeBeat=maze.setBeat,mazeUpdate=maze.update,mazeActivate=maze.activate;
  const mazeContext=ctx=>Object.assign({},ctx,{camera:{
    reset:p=>ctx.camera.reset({...p,target:[0.3,1.3,0]}),
    moveTo:(p,options)=>ctx.camera.moveTo({...p,position:ctx.navigationState?.beatIndex===1?[0.6,4.0,14.6]:p.position,target:[0.3,1.3,0]},options)
  }});
  maze.setup=ctx=>{mazeSetup(ctx);};
  maze.activate=ctx=>{mazeActivate(mazeContext(ctx));};
  maze.setBeat=(i,ctx,meta)=>{mazeBeat(i,mazeContext(ctx),meta);};
  maze.update=(dt,ctx)=>{mazeUpdate(dt,mazeContext(ctx));};
  world.registerScene(3,maze);modules.set(3,maze);
  const map=restoreEnvironment(createRestructureScene({onProgress:({progress})=>numbers?.setProgress('restructuring',progress)}),{ambient:{color:'#c9cbd7',intensity:1},directional:{color:'#ffdeb1',intensity:2.4,position:[-5,8,10],castShadow:false},point:{color:'#bd9352',intensity:35,position:[4,-1,5],distance:20,decay:2}});
  const mapSetup=map.setup;
  map.setup=ctx=>{mapSetup(ctx);ctx.root.children[0].position.x=3.0;};
  world.registerScene(5,map);modules.set(5,map);
  for(const id of [11,12,13,14,15])world.registerScene(id,createQuietWorld(id===15));
  return {get:(id)=>modules.get(id),getState:()=>Object.fromEntries([...modules].map(([id,module])=>[id,module.getState?.()??{}])),destroy(){modules.clear();}};
}
