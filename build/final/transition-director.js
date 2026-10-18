// CPV Cinematic Transition Director — shared scene hand-off for the single world engine.
// Lifecycle per scene change: prepare → enter → animate → hold → exit → cleanup.
//  * prepare : the outgoing record is NOT torn down; its root moves into a private
//              hand-off THREE.Scene with cloned lights/fog and its own camera rig.
//  * enter   : the incoming scene activates normally on the shared rig.
//  * animate : both scenes keep rendering live 3D every frame. The outgoing scene is
//              rendered into a linear HDR target with its own exit camera move; the
//              incoming camera gets an additive enter move (dolly / orbit / crane) that
//              decays to exactly the module's own pose. A per-pair mask composites them.
//  * hold    : at progress 1 the incoming camera equals the module pose (no offset).
//  * exit    : the outgoing record receives its deferred 'deactivate' hook.
//  * cleanup : outgoing root is detached, aborts fired, render target kept for reuse.
// This is real-time compositing of two live 3D renders, not a single physical camera
// shot; the report states that explicitly. Beat changes inside one scene are smoothed
// by a pose blend so modules that 'reset' the camera never produce a position jump.
function createTransitionDirector({ THREE, createCameraRig, invalidate, report = () => {} }) {
  const ease = {
    inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    out: t => 1 - Math.pow(1 - t, 4),
    in: t => t * t * t,
    smooth: t => t * t * t * (t * (t * 6 - 15) + 10)
  };
  const clamp01 = v => Math.max(0, Math.min(1, v));
  // Styles: 0 iris · 1 portal · 2 paper · 3 light-lines · 4 frame · 5 branches · 6 horizon · 7 ui
  const PAIRS = {
    '1>2': { name: 'Party emblem match', style: 0, duration: 2.6, center: [.5, .5], exit: { dolly: 1.45, orbit: 5, crane: .04 }, enter: { dolly: .30, orbit: -7, crane: -.02 } },
    '2>3': { name: 'Institution to experience', style: 1, duration: 2.2, center: [.5, .56], exit: { dolly: .52, orbit: -3 }, enter: { dolly: .58, orbit: 6, crane: .03 } },
    '3>4': { name: 'Procedure to history', style: 2, duration: 2.0, dir: [1, .18], exit: { dolly: .78, orbit: 4 }, enter: { dolly: 1.32, crane: .08 } },
    '4>5': { name: 'History into restructuring', style: 4, duration: 2.0, rect: [.5, .52, .2, .5], exit: { dolly: .62 }, enter: { dolly: 1.45, orbit: -5 } },
    '5>6': { name: 'Structure to accountability', style: 3, duration: 2.1, exit: { dolly: .82, crane: .12 }, enter: { dolly: 1.6, crane: -.05 } },
    '6>7': { name: 'Glass to documentary', style: 4, duration: 1.8, rect: [.5, .46, .18, .24], exit: { dolly: .42 }, enter: { dolly: 1.18 } },
    '7>8': { name: 'The human handoff', style: 4, duration: 1.7, rect: [.478, .578, .3875, .405], exit: { dolly: .9 }, enter: { dolly: 1.1 } },
    '8>9': { name: 'Question to commitment', style: 5, duration: 1.8, exit: { dolly: .9 }, enter: { dolly: 1.25 } },
    '9>10': { name: 'Action into future', style: 6, duration: 1.8, center: [.5, .58], exit: { dolly: .85 }, enter: { dolly: 1.55, crane: .05 } },
    '10>11': { name: 'Enter the quiz', style: 7, duration: 1.15, dir: [1, -.35], exit: { dolly: .9 }, enter: { dolly: 1.08 } },
    '11>12': { name: 'Quiz system', style: 7, duration: .95, dir: [1, -.35], exit: {}, enter: {} },
    '12>13': { name: 'Quiz system', style: 7, duration: .95, dir: [1, -.35], exit: {}, enter: {} },
    '13>14': { name: 'Quiz system', style: 7, duration: .95, dir: [1, -.35], exit: {}, enter: {} },
    '14>15': { name: 'Solemn close', style: 0, duration: 2.2, center: [.5, .5], exit: { dolly: .86 }, enter: { dolly: 1.35, orbit: 4 } }
  };
  const JUMP = { name: 'Direct jump', style: 2, duration: 1.45, dir: [.9, -.4], exit: { dolly: .8 }, enter: { dolly: 1.3 } };
  function pairConfig(fromId, toId) {
    if (PAIRS[`${fromId}>${toId}`]) return { ...PAIRS[`${fromId}>${toId}`], reverse: false, key: `${fromId}>${toId}` };
    if (PAIRS[`${toId}>${fromId}`]) {
      const p = PAIRS[`${toId}>${fromId}`];
      // Backward travel mirrors the authored camera language: the incoming scene now
      // plays the old exit move in reverse and the outgoing scene retreats.
      return { ...p, exit: { dolly: 1 / (p.enter.dolly || 1), orbit: -(p.enter.orbit || 0), crane: -(p.enter.crane || 0) },
        enter: { dolly: 1 / (p.exit.dolly || 1), orbit: -(p.exit.orbit || 0), crane: -(p.exit.crane || 0) },
        dir: p.dir ? [-p.dir[0], -p.dir[1]] : undefined, reverse: true, key: `${fromId}>${toId}` };
    }
    return { ...JUMP, reverse: toId < fromId, key: `${fromId}>${toId}` };
  }

  let renderer = null, rt = null, quad = null, size = { width: 1, height: 1 }, dpr = 1;
  let handoff = null, blend = null, lastState = null, completed = 0, effective = null;
  const history = [];
  const tmp = { p: new THREE.Vector3(), t: new THREE.Vector3(), f: new THREE.Vector3(), q: new THREE.Quaternion() };

  const VERT = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const FRAG = `varying vec2 vUv;uniform sampler2D tOut;uniform float uP,uStyle,uAspect,uTone,uExposure,uTime,uRev;
uniform vec2 uCenter,uDir;uniform vec4 uRect;uniform vec3 uRim;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vnoise(p);p*=2.03;a*=.5;}return v;}
vec3 cpvRRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
vec3 cpvACES(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));
 const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));
 c*=uExposure/.6;c=I*c;c=cpvRRT(c);c=O*c;return clamp(c,0.,1.);}
float sdBox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){
 vec2 uv=vUv,a=vec2(uAspect,1.);float p=uP,m=0.,edge=1e3,w=.006;vec2 warp=vec2(0.);
 if(uStyle<.5){ // iris from a matched anchor
  float d=length((uv-uCenter)*a);vec2 far2=max(uCenter,1.-uCenter)*a;float R=p*p*(3.-2.*p)*(length(far2)+.04);m=smoothstep(R+w,R-w,d);edge=d-R;warp=normalize((uv-uCenter)*a+1e-5)*.018*exp(-pow(edge/.06,2.))*(1.-p);
 }else if(uStyle<1.5){ // portal / doorway that the camera passes through
  vec2 q=(uv-uCenter)*a;float g=pow(p,1.35);vec2 b=mix(vec2(.035,.07),vec2((max(uCenter.x,1.-uCenter.x))*uAspect+.03,max(uCenter.y,1.-uCenter.y)+.06),g);float sd=sdBox(q-vec2(0.,mix(-.03,0.,g)),b,mix(.03,.0,g));
  m=smoothstep(w,-w,sd);edge=sd;
 }else if(uStyle<2.5){ // torn paper / archival page reveal
  vec2 dir=normalize(uDir);float s=dot((uv-.5)*a,dir)/(.5*abs(dir.x)*uAspect+.5*abs(dir.y))*.5+.5;
  float n=(fbm(uv*a*7.+uTime*.05)-.5)*.16+(fbm(uv*a*38.)-.5)*.03;float e=p*1.32-.16+n;m=smoothstep(e+w,e-w,s);edge=s-e;
 }else if(uStyle<3.5){ // geographic lines become light lines
  float rows=46.;float k=floor(uv.y*rows);float t0=h21(vec2(k,3.1))*.38;float lp=clamp((p-t0)/.62,0.,1.);float head=lp*1.12-.06;
  float x=uRev>.5?1.-uv.x:uv.x;m=step(x,head);edge=(x-head)*.6;w=.0015;
 }else if(uStyle<4.5){ // a frame from the old scene grows into the new full frame
  float g=pow(p,1.25);vec2 c=mix(uRect.xy,vec2(.5),g);vec2 b=mix(uRect.zw*.5,vec2(.52),g);float sd=sdBox((uv-c)*a,b*a,mix(.012,0.,g));m=smoothstep(w,-w,sd);edge=sd;
 }else if(uStyle<5.5){ // three branches
  float col=floor(uv.x*3.);float t=p*1.45-abs(col-1.)*.22-(col==1.?0.:.06);float y=1.-uv.y;float n=(fbm(vec2(uv.x*14.,uTime*.1))-.5)*.05;
  m=smoothstep(t+w+n,t-w+n,y);edge=y-t-n;
 }else if(uStyle<6.5){ // horizon slit opening along time
  float hh=pow(p,1.4)*.62;float d=abs(uv.y-uCenter.y)-hh*(1.+.08*sin(uv.x*6.283+uTime));m=smoothstep(w,-w,d);edge=d;
 }else{ // unified quiz UI sweep
  vec2 dir=normalize(uDir);float s=dot((uv-.5)*a,dir)/(.5*abs(dir.x)*uAspect+.5*abs(dir.y))*.5+.5;float e=ease(p);
  m=smoothstep(e*1.2-.1+w,e*1.2-.1-w,s);edge=s-(e*1.2-.1);
 }
 vec4 o=texture2D(tOut,uv+warp);vec3 col=o.rgb;if(uTone>.5)col=cpvACES(col);col=col+vec3(.0196,.0235,.0353)*(1.-o.a);
 float out_=1.-m;float near=exp(-pow(edge/.012,2.));float glow=exp(-pow(edge/.045,2.))*.55+near;
 float life=smoothstep(0.,.08,p)*smoothstep(1.,.86,p);
 if(uStyle>1.5&&uStyle<2.5){col*=mix(1.,.55,smoothstep(.06,0.,edge)*step(0.,edge));col=mix(col,vec3(.42,.27,.13),.35*smoothstep(.05,0.,edge)*step(0.,edge));}
 vec3 rim=uRim*glow*life*(uStyle>6.5?.35:1.);
 gl_FragColor=vec4(col*out_+rim,clamp(out_+dot(rim,vec3(.2))*.0,0.,1.));
 #include <colorspace_fragment>
}`;
  const FRAG_FINAL = FRAG.replace('float e=ease(p);', 'float e=p*p*(3.-2.*p);');
  function ensure(r) {
    if (renderer === r && quad) return;
    renderer = r;
    rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, depthBuffer: true, samples: Math.min(4, r.capabilities.maxSamples || 0) });
    rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG_FINAL, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      uniforms: { tOut: { value: rt.texture }, uP: { value: 0 }, uStyle: { value: 0 }, uAspect: { value: 16 / 9 }, uTone: { value: 1 }, uExposure: { value: 1 },
        uTime: { value: 0 }, uRev: { value: 0 }, uCenter: { value: new THREE.Vector2(.5, .5) }, uDir: { value: new THREE.Vector2(1, 0) },
        uRect: { value: new THREE.Vector4(.5, .5, .2, .2) }, uRim: { value: new THREE.Color('#e8c98e') } } });
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    quad = { scene, camera, material };
    resizeTarget();
  }
  function resizeTarget() {
    if (!rt) return;
    rt.setSize(Math.max(2, Math.round(size.width * dpr)), Math.max(2, Math.round(size.height * dpr)));
  }
  // Effective camera = module pose + director layer. Captured for interruption so a new
  // hand-off starts from exactly the frame the audience was seeing.
  function poseOf(cam) {
    cam.updateMatrixWorld(true);
    cam.getWorldDirection(tmp.f);
    return { position: cam.position.toArray(), quaternion: cam.quaternion.toArray(), forward: tmp.f.toArray(), fov: cam.fov ?? 45 };
  }
  function cloneLights(source, target) {
    for (const light of Object.values(source)) {
      const copy = light.clone(); copy.castShadow = false; target.add(copy);
    }
  }
  function cameraLayer(cam, rig, move, k) {
    // Additive move around the module's look target. k = 1 → full offset, 0 → none.
    if (!move || k <= 1e-4) return null;
    const pose = rig.getPose();
    const pos = tmp.p.copy(cam.position), target = tmp.t.fromArray(pose.target);
    const dist = Math.max(.001, pos.distanceTo(target));
    cam.getWorldDirection(tmp.f);
    const look = tmp.f.clone().multiplyScalar(dist).add(pos);
    const saved = { p: cam.position.clone(), q: cam.quaternion.clone(), fov: cam.fov, zoom: cam.zoom };
    const offset = pos.clone().sub(look);
    const dolly = 1 + ((move.dolly ?? 1) - 1) * k;
    offset.multiplyScalar(dolly);
    if (move.orbit) offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(move.orbit) * k);
    cam.position.copy(look).add(offset);
    if (move.crane) cam.position.y += move.crane * dist * k;
    cam.lookAt(look);
    if (cam.isOrthographicCamera && move.dolly) { cam.zoom = saved.zoom / dolly; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld(true);
    return () => { cam.position.copy(saved.p); cam.quaternion.copy(saved.q); cam.zoom = saved.zoom; cam.fov = saved.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true); };
  }
  function blendLayer(cam) {
    if (!blend) return null;
    const k = 1 - ease.inOut(clamp01(blend.t / blend.duration));
    if (k <= 1e-4) return null;
    const saved = { p: cam.position.clone(), q: cam.quaternion.clone() };
    cam.position.lerpVectors(cam.position, blend.from.p, k);
    cam.quaternion.slerp(blend.from.q, k);
    cam.updateMatrixWorld(true);
    return () => { cam.position.copy(saved.p); cam.quaternion.copy(saved.q); cam.updateMatrixWorld(true); };
  }
  const api = {
    configure(r, nextSize, pixelRatio) { size = { ...nextSize }; dpr = pixelRatio || 1; if (r) ensure(r); resizeTarget(); handoff?.rig.resize(size.width, size.height); },
    get busy() { return Boolean(handoff || blend); },
    // prepare: hand the outgoing record to the director instead of destroying it.
    capture(record, { world, lights, mainCamera, contextFor, hookFn, fromId, toId, disabled }) {
      if (disabled || !renderer || !record) return false;
      if (handoff) api.finish('interrupted');
      try {
        const scene = new THREE.Scene();
        scene.background = world.background?.clone?.() ?? null;
        scene.fog = world.fog ? world.fog.clone() : null;
        scene.environment = world.environment ?? null;
        cloneLights(lights, scene);
        const rig = createCameraRig(THREE, invalidate);
        const cam = mainCamera.camera;
        const pose = mainCamera.getPose();
        rig.resize(size.width, size.height);
        // Start the outgoing camera at the exact effective frame (including any layer).
        const eff = poseOf(cam);
        const dist = Math.hypot(...pose.position.map((v, i) => v - pose.target[i])) || 10;
        rig.reset({ ...pose, position: eff.position, target: eff.position.map((v, i) => v + eff.forward[i] * dist) });
        scene.add(record.root);
        const config = pairConfig(fromId, toId);
        handoff = { record, scene, rig, config, t: 0, phase: 'prepare', fromId, toId, contextFor, hookFn, custom: typeof record.module.render === 'function', startPose: rig.getPose() };
        history.push({ key: config.key, name: config.name, style: config.style, reverse: config.reverse, startedAt: performance.now() });
        if (history.length > 40) history.shift();
        document.body.style.setProperty('--handoff-p', '0'); document.body.classList.add('cpv-handoff');
        document.body.style.setProperty('--handoff-ms', `${Math.round(config.duration * 1000)}ms`);
        document.body.dataset.handoff = config.key;
        handoff.phase = 'enter';
        invalidate();
        return true;
      } catch (error) { report(error); handoff = null; return false; }
    },
    beatBlend(cam, duration = 1.15) {
      if (!cam) return;
      if (handoff && handoff.phase !== 'hold') return; // the scene hand-off owns the camera
      blend = { from: { p: cam.position.clone(), q: cam.quaternion.clone() }, t: 0, duration };
      invalidate();
    },
    cancelBlend() { blend = null; },
    tick(dt) {
      if (blend) { blend.t += dt; if (blend.t >= blend.duration) blend = null; }
      if (!handoff) return;
      const h = handoff;
      if (!api.frozen) h.t += dt;
      h.phase = h.t >= h.config.duration ? 'hold' : 'animate';
      // keep the outgoing world alive: its own update on its own camera
      const ctx = h.contextFor(h.record, h.rig, h.scene);
      try { h.hookFn(h.record, 'update', dt, ctx); h.rig.update(dt * 1000); } catch (error) { report(error); }
      if (h.phase === 'hold') api.finish('complete');
      invalidate();
    },
    // Applies blend + enter layers to the incoming camera for the current frame.
    applyCamera(mainCamera) {
      const cam = mainCamera.camera, undo = [];
      if (handoff) {
        const k = 1 - ease.inOut(clamp01(handoff.t / handoff.config.duration));
        const r = cameraLayer(cam, mainCamera, handoff.config.enter, k); if (r) undo.push(r);
      }
      const b = blendLayer(cam); if (b) undo.push(b);
      effective = cam.position.toArray().map(v => +v.toFixed(4));
      return () => { while (undo.length) undo.pop()(); };
    },
    renderOutgoing() {
      if (!handoff || !renderer) return;
      const h = handoff, cam = h.rig.camera, k = ease.in(clamp01(h.t / h.config.duration));
      const undo = cameraLayer(cam, h.rig, h.config.exit, k);
      const old = renderer.getRenderTarget(), clear = renderer.getClearAlpha();
      try {
        renderer.setRenderTarget(rt); renderer.setClearAlpha(0); renderer.clear(true, true, true);
        const ctx = h.contextFor(h.record, h.rig, h.scene);
        if (h.custom) h.hookFn(h.record, 'render', ctx, renderer, h.scene, cam);
        else renderer.render(h.scene, cam);
      } catch (error) { report(error); }
      finally { renderer.setRenderTarget(old); renderer.setClearAlpha(clear); undo?.(); }
    },
    composite(time = 0) {
      if (!handoff || !quad) return;
      const h = handoff, c = h.config, u = quad.material.uniforms;
      u.uP.value = ease.inOut(clamp01(h.t / c.duration)); u.uStyle.value = c.style; u.uAspect.value = size.width / size.height;
      u.uTone.value = h.custom ? 0 : 1; u.uExposure.value = renderer.toneMappingExposure; u.uTime.value = time; u.uRev.value = c.reverse ? 1 : 0;
      u.uCenter.value.set(...(c.center || [.5, .5])); u.uDir.value.set(...(c.dir || [1, 0]));
      if (c.rect) u.uRect.value.set(c.rect[0], 1 - c.rect[1], c.rect[2], c.rect[3]);
      u.uRim.value.set(c.style === 3 ? '#ff8a6a' : c.style === 6 ? '#bfe9ef' : '#e8c98e');
      const autoClear = renderer.autoClear;
      try { renderer.autoClear = false; renderer.setRenderTarget(null); renderer.render(quad.scene, quad.camera); }
      finally { renderer.autoClear = autoClear; }
      document.body.style.setProperty('--handoff-p', u.uP.value.toFixed(3));
      lastState = { key: c.key, progress: u.uP.value, raw: clamp01(h.t / c.duration), phase: h.phase };
    },
    // exit + cleanup
    finish(reason = 'complete') {
      const h = handoff; if (!h) return;
      handoff = null;
      h.phase = 'exit';
      try {
        h.record.root.removeFromParent();
        h.hookFn(h.record, 'deactivate', h.contextFor(h.record, h.rig, h.scene));
        h.record.beatAbort?.abort('deactivated'); h.record.activationAbort?.abort('deactivated');
        for (const child of [...h.scene.children]) if (child.isLight) { h.scene.remove(child); child.dispose?.(); }
      } catch (error) { report(error); }
      h.phase = 'cleanup';
      completed++;
      const last = history[history.length - 1]; if (last) { last.endedBy = reason; last.endedAt = performance.now(); }
      document.body.classList.remove('cpv-handoff'); delete document.body.dataset.handoff; document.body.style.setProperty('--handoff-p', '1');
      invalidate();
    },
    seek(progress) { if (handoff) { handoff.t = clamp01(progress) * handoff.config.duration; invalidate(); } },
    pauseClock(value) { api.frozen = Boolean(value); },
    getState: () => Object.freeze({ active: Boolean(handoff), phase: handoff?.phase ?? 'idle', key: handoff?.config.key ?? null,
      name: handoff?.config.name ?? null, progress: handoff ? clamp01(handoff.t / handoff.config.duration) : 1, blending: Boolean(blend),
      completed, last: lastState, effective, history: history.slice(-12) }),
    pairs: PAIRS,
    dispose() { if (handoff) api.finish('disposed'); rt?.dispose(); quad?.material.dispose(); quad = null; rt = null; renderer = null; }
  };
  return api;
}
