/** Scenes 1–2, source-backed DOM/SVG on T07 lifecycle hooks.
 * Art direction controls: INTRO_VISUAL + .intro-* CSS tokens/layers.
 * No scene timers, new renderer, private notes, or asynchronous state writes.
 */
import { createOpeningPrototype } from './scene-one-intro.mjs';
export const INTRO_VISUAL = Object.freeze({ duration:2100, revealDuration:1100,
  easing:'cubic-bezier(0.16,1,0.3,1)', strands:20, samples:48 });

// Open radial ribbons carve an empty reading pocket. The same samples become
// institutional orbits; all endpoints are deterministic, including direct entry.
function networkPose(scene,beat) {
  const points=[], lines=[], centers=[[-.0,1.55,0],[-4.05,-.15,0],[0,-.15,0],[4.05,-.15,0],[0,-2.65,0]];
  for(let strand=0;strand<INTRO_VISUAL.strands;strand++) {
    const side=strand%2 ? 1 : -1, tier=Math.floor(strand/2), phase=tier*.18;
    for(let sample=0;sample<INTRO_VISUAL.samples;sample++) {
      const t=sample/(INTRO_VISUAL.samples-1), a=(-.42+t*3.84)+phase*.13;
      const radius=1+Math.sin(t*Math.PI)*.075;
      let p=[side*Math.cos(a)*(6.3+tier*.22)*radius,Math.sin(a)*(3.35+tier*.09),Math.sin(t*5.6+phase)*1.8+(tier%3-1)*.65];
      if(tier>=7) p[1]=-Math.sin(a)*(3.05+tier*.08)-.5;
      if(scene===1 && beat===1) p=[p[0]*1.04,p[1]*.97,p[2]-.3];
      if(scene===2) {
        const group=strand%5, c=centers[group], angle=t*Math.PI*2+Math.floor(strand/5)*.15;
        const ready=group===0 || (group<4 ? beat>=1 : beat>=2);
        const halo=[c[0]+Math.cos(angle)*(group===0?2.75:group===4?2.3:1.75),c[1]+Math.sin(angle)*(group===4?.98:.7),Math.sin(angle*2+phase)*.32];
        p=ready ? halo : [p[0]*1.04,p[1],p[2]-1.5];
      }
      points.push(...p);
      if(sample) lines.push(...points.slice(points.length-6,points.length-3),...p);
    }
  }
  return {points,lines};
}

export function createIntroScenes({ data, content, document: doc = content.ownerDocument, window: win = doc.defaultView }) {
  const ns = 'http://www.w3.org/2000/svg';
  const motion = win.matchMedia('(prefers-reduced-motion:reduce)');
  const portrait = win.matchMedia('(orientation:portrait)');
  const records = new Map();
  const html = (tag, className, text = '') => {
    const node = doc.createElement(tag); node.className = className; node.textContent = text; return node;
  };
  const svg = (tag, attributes = {}) => {
    const node = doc.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    return node;
  };
  function lifetime(record) {
    record.animations = new Set(); record.removeAbort = null;
    record.cancel = () => {
      record.removeAbort?.(); record.removeAbort = null;
      for (const animation of record.animations) animation.cancel();
      record.animations.clear();
    };
    const stop = () => { if (doc.hidden || motion.matches) record.cancel(); };
    doc.addEventListener('visibilitychange', stop); motion.addEventListener('change', stop);
    record.dispose = () => {
      record.cancel(); record.section.remove();
      doc.removeEventListener('visibilitychange', stop); motion.removeEventListener('change', stop);
      record.removeResize?.();
    };
  }
  function animate(record, node, keyframes, duration, ctx) {
    if (doc.hidden || motion.matches || ctx?.reducedMotion || ctx?.signal?.aborted || !node.animate) return;
    const animation = node.animate(keyframes, { duration, easing: INTRO_VISUAL.easing });
    record.animations.add(animation);
    animation.finished.then(() => record.animations.delete(animation), () => record.animations.delete(animation));
  }
  function bindBeat(record, ctx) {
    record.cancel();
    if (ctx?.signal) {
      const cancel = () => record.cancel();
      ctx.signal.addEventListener('abort', cancel, { once: true });
      record.removeAbort = () => ctx.signal.removeEventListener('abort', cancel);
    }
  }
  function setupDepth(record,ctx) {
    if(!ctx?.THREE || !ctx.root || record.depth) return;
    const T=ctx.THREE, pose=networkPose(record.scene.id,0), count=pose.points.length/3;
    const geometry=ctx.own(new T.BufferGeometry());
    geometry.setAttribute('position',new T.Float32BufferAttribute(pose.points,3));
    const colors=[], sizes=[];
    for(let i=0;i<count;i++) { const strength=.42+((i*17)%37)/60; colors.push(strength,strength*.76,strength*.39); sizes.push(i%47===0?.8:.18+(i%7)*.055); }
    geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3)); geometry.setAttribute('size',new T.Float32BufferAttribute(sizes,1));
    const material=ctx.own(new T.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,
      vertexShader:'attribute float size; varying vec3 tone; void main(){tone=color; vec4 p=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*p; gl_PointSize=clamp(size*170.0/-p.z,1.0,12.0);}',
      fragmentShader:'varying vec3 tone; void main(){float r=length(gl_PointCoord-vec2(.5));float a=1.0-smoothstep(.08,.5,r);if(a<.02)discard;gl_FragColor=vec4(tone,a*.86);}' }));
    const particles=new T.Points(geometry,material); particles.frustumCulled=false;
    const threadsGeometry=ctx.own(new T.BufferGeometry()); threadsGeometry.setAttribute('position',new T.Float32BufferAttribute(pose.lines,3));
    const threads=new T.LineSegments(threadsGeometry,ctx.own(new T.LineBasicMaterial({color:0xb68f52,transparent:true,opacity:.23,depthWrite:false}))); threads.frustumCulled=false;
    record.depth=new T.Group(); record.depth.name='Emergence into structure'; record.depth.add(particles,threads);ctx.root.add(record.depth);
    Object.assign(record,{particleGeometry:geometry,threadsGeometry,particles,threads});
  }
  function applyPose(record,fraction) {
    if(!record.particleGeometry) return;
    for(const [key,geometry] of [['points',record.particleGeometry],['lines',record.threadsGeometry]]) {
      const buffer=geometry.attributes.position;
      for(let i=0;i<buffer.array.length;i++) {
        const lag=(Math.floor(i/3)%48)/48*.16, t=Math.max(0,Math.min(1,(fraction-lag)/(1-lag))), ease=1-(1-t)**3;
        buffer.array[i]=record.from[key][i]+(record.to[key][i]-record.from[key][i])*ease;
      }
      buffer.needsUpdate=true;
    }
  }
  function cameraBeat(record,index,ctx) {
    const id=record.scene.id;
    record.to=networkPose(id,index);
    record.from=index ? networkPose(id,index-1) : id===2 ? networkPose(1,1) : {
      points:record.to.points.map((v,i)=>v*.025+([-4.3,2.8,0][i%3])),
      lines:record.to.lines.map((v,i)=>v*.025+([-4.3,2.8,0][i%3]))
    };
    const still=motion.matches || ctx?.reducedMotion || doc.hidden || portrait.matches || ctx?.mode!=='webgl';
    record.motionElapsed=still ? INTRO_VISUAL.duration : 0; applyPose(record,still?1:0);
    record.section.dataset.renderer=ctx?.mode==='webgl'?'webgl':'fallback';
    if(!ctx?.camera) return;
    const end={position:[0,0,12],target:[0,0,0]};
    ctx.camera.reset(still?end:{position:[index?.2:-.3,.1,13.2],target:[0,0,0]});
    ctx.camera.moveTo(end,{duration:still?0:INTRO_VISUAL.duration,signal:ctx.signal,onComplete:()=>{if(!ctx.signal?.aborted)applyPose(record,1);}});
  }
  function createNetwork(record) {
    const network=svg('svg',{id:'intro-network-'+record.scene.id,class:'intro-network',viewBox:'0 0 1600 900','aria-hidden':'true'});
    const paths=[];
    for(let i=0;i<INTRO_VISUAL.strands;i++) { const path=svg('path',{class:'intro-ribbon'});paths.push(path);network.append(path); }
    record.section.append(network); Object.assign(record,{network,paths});
    const resize=()=>network.setAttribute('viewBox',portrait.matches?'0 60 1600 780':'0 0 1600 900');
    resize();portrait.addEventListener('change',resize);record.removeResize=()=>portrait.removeEventListener('change',resize);
  }
  function fallbackPose(record,index) {
    const pose=networkPose(record.scene.id,index).points;
    record.paths.forEach((path,strand)=>{
      const coordinates=[];
      for(let s=0;s<INTRO_VISUAL.samples;s++) {const i=(strand*INTRO_VISUAL.samples+s)*3,scale=1086.4/(12-pose[i+2]);coordinates.push((s?'L':'M')+(800+pose[i]*scale).toFixed(1)+' '+(450-pose[i+1]*scale).toFixed(1));}
      path.setAttribute('d',coordinates.join(' '));
    });
  }
  function setupOpening(record) {
    const section=html('section','scene intro-opening');section.id='intro-scene-1';record.section=section;
    createNetwork(record);
    const copy=html('div','intro-opening-copy'),heading=html('h1','intro-heading');heading.id='intro-opening-heading';
    const body=html('p','intro-opening-body'),subtitle=html('p','intro-course',record.scene.subtitle),members=html('p','intro-members');
    for(const member of data.members) members.append(html('span','intro-member',member));
    copy.append(heading,body,subtitle,members);section.append(copy);
    // Two near filaments graze the pocket's edges and the title/metadata gap.
    const foreground=svg('svg',{class:'intro-foreground',viewBox:'0 0 1600 900','aria-hidden':'true'});
    foreground.append(svg('path',{d:'M -80 240 C 90 460 175 508 390 512 C 760 514 1080 510 1270 534 C 1480 560 1600 650 1700 720'}),svg('path',{d:'M 1700 140 C 1440 280 1480 420 1360 515'}));
    section.append(foreground);Object.assign(record,{heading,body,subtitle,members,foreground});lifetime(record);
    record.opening = createOpeningPrototype({ record, document:doc, window:win, motion, portrait });
  }
  function openingBeat(record,index,ctx) {
    bindBeat(record,ctx);const audience=record.scene.beats[index].audience;
    record.section.dataset.beat=String(index);
    record.heading.textContent=index===1?audience.heading.replace('the system','Vietnam’s political system'):audience.heading;
    record.body.textContent=audience.body;record.body.hidden=!audience.body;
    record.subtitle.hidden=index!==0;record.members.hidden=index!==0;
    record.foreground.children[0].setAttribute('d',index===0?'M -80 240 C 90 460 175 508 390 512 C 760 514 1080 510 1270 534 C 1480 560 1600 650 1700 720':'M -80 240 C 90 465 175 548 390 549 C 760 551 1080 548 1270 561 C 1480 580 1600 650 1700 720');
    fallbackPose(record,index);
    animate(record,record.heading,[{opacity:.35,transform:'translateY(16px)'},{opacity:1,transform:'none'}],INTRO_VISUAL.revealDuration,ctx);
    animate(record,record.network,[{opacity:.08},{opacity:1}],INTRO_VISUAL.duration,ctx);
  }
  function setupSystem(record) {
    const section = html('section', 'scene intro-system'); section.id = 'intro-scene-2';
    const copy = html('div', 'intro-system-copy');
    const part = html('p', 'intro-part', record.scene.subtitle);
    const heading = html('h2', 'intro-heading'); heading.id = 'intro-system-heading';
    const body = html('p', 'intro-system-body'); copy.append(part, heading, body);
    const figure = html('figure', 'intro-institutions'); figure.id = 'intro-institution-diagram';
    figure.setAttribute('aria-label', record.scene.title);
    const connections = svg('svg', { id: 'intro-institution-connections', class: 'intro-connections', viewBox: '0 0 1100 520', 'aria-hidden': 'true' });
    const defs = svg('defs'), marker = svg('marker', { id: 'intro-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
    marker.append(svg('path', { d: 'M 1 1 L 9 5 L 1 9', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 })); defs.append(marker); connections.append(defs);
    const leadership = svg('g', { class: 'intro-leadership-links' });
    for (const x of [190, 550, 910]) leadership.append(svg('path', { d: `M 550 115 V 137 H ${x} V 160`, 'marker-end': 'url(#intro-arrow)' }));
    const management = svg('g', { class: 'intro-management-links' });
    management.append(svg('path', { d: 'M 190 270 C 190 350 420 315 475 387', 'marker-end': 'url(#intro-arrow)' }));
    const participation = svg('g', { class: 'intro-participation-links' });
    for (const x of [550, 910]) participation.append(svg('path', { d: `M 625 387 C 680 325 ${x} 335 ${x} 270`, 'marker-end': 'url(#intro-arrow)' }));
    connections.append(leadership, management, participation);
    const envelope = html('div', 'intro-system-boundary'); envelope.id = 'intro-system-boundary';
    const caption = html('p', 'intro-boundary-label', 'Political system');
    const node = (id, className, title, role) => {
      const element = html('div', `intro-institution ${className}`); element.id = id;
      element.append(html('p', 'intro-institution-name', title), html('p', 'intro-institution-role', role));
      envelope.append(element); return element;
    };
    envelope.append(caption);
    const party = node('intro-party', 'intro-party', record.scene.beats[0].audience.keys[0], `${record.scene.beats[0].label} · part of the system`);
    const [stateLabel, frontLabel, organizationsLabel] = record.scene.beats[1].audience.keys;
    const state = node('intro-state', 'intro-state', stateLabel, 'Management under the law');
    const front = node('intro-front', 'intro-front', frontLabel, 'Distinct roles');
    const organizations = node('intro-organizations', 'intro-organizations', organizationsLabel, 'Distinct roles');
    const people = html('div', 'intro-people'); people.id = 'intro-people';
    const peopleIcon = svg('svg', { viewBox: '0 0 100 70', 'aria-hidden': 'true', class: 'intro-people-icon' });
    for (const [x, y, r] of [[25, 23, 7], [75, 23, 7], [50, 15, 10]]) peopleIcon.append(svg('circle', { cx:x, cy:y, r }));
    peopleIcon.append(svg('path', { d: 'M 10 60 Q 10 36 25 36 Q 34 36 37 45 M 90 60 Q 90 36 75 36 Q 66 36 63 45 M 30 65 Q 30 31 50 31 Q 70 31 70 65' }));
    people.append(peopleIcon, html('p', 'intro-people-title', 'The people'));
    const mastery = html('p', 'intro-people-mastery', 'The people exercise their right to mastery.'); people.append(mastery);
    const key = html('p', 'intro-relationship-key');
    for (const [i, term] of record.scene.beats[2].audience.keys.entries()) key.append(html('span', `intro-role-${i}`, term));
    copy.append(key);
    figure.append(connections, envelope, people); section.append(copy, figure);
    Object.assign(record, { section, heading, body, party, state, front, organizations, people, mastery, leadership, management, participation, key });
    createNetwork(record);
    lifetime(record);
  }
  function systemBeat(record, index, ctx) {
    bindBeat(record, ctx);
    const audience = record.scene.beats[index].audience;
    record.section.dataset.beat = String(index);
    record.heading.textContent = audience.heading; record.body.textContent = audience.body; fallbackPose(record,index);
    for (const node of [record.state, record.front, record.organizations]) node.hidden = index < 1;
    record.leadership.style.display = index < 1 ? 'none' : '';
    record.management.style.display = index < 1 ? 'none' : '';
    record.participation.style.display = index < 2 ? 'none' : '';
    record.key.hidden = index < 1; record.mastery.hidden = index < 2;
    for (const [node, active] of [[record.party,index === 0], [record.state,index === 1], [record.front,index === 1], [record.organizations,index === 1], [record.people,index === 2]]) node.classList.toggle('is-emphasized', active);
    const reveal = index === 0 ? record.party : index === 1 ? record.state : record.people;
    animate(record, reveal, [{ opacity: 0.55, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], 900, ctx);
  }
  for (const id of [1, 2]) {
    const scene = data.scenes.find(scene => scene.id === id);
    if (!scene) throw new Error(`Intro scene ${id} missing`);
    const record = { scene, section: null };
    const module = Object.freeze({
      setup(ctx) { if (!record.section) (id === 1 ? setupOpening : setupSystem)(record); if(id===2) setupDepth(record, ctx); },
      activate() { module.setup(); content.replaceChildren(record.section); },
      setBeat(index, ctx) {
        if (!Number.isInteger(index) || index < 0 || index >= scene.beats.length) throw new RangeError(`Intro scene ${id}: invalid beat ${index}`);
        module.setup(ctx);
        if(id===1 && index===0) { record.opening.start(ctx); return; }
        record.opening?.stop(); setupDepth(record, ctx);
        (id === 1 ? openingBeat : systemBeat)(record, index, ctx); cameraBeat(record, index, ctx);
      },
      update(dt,ctx) {
        if(!record.section) return;
        if(record.opening?.active) { record.opening.update(dt,ctx); return; }
        record.section.dataset.renderer=ctx.mode;
        record.motionElapsed=Math.min(INTRO_VISUAL.duration,record.motionElapsed+dt*1000);
        applyPose(record,ctx.reducedMotion || !ctx.camera.isTransitioning()?1:record.motionElapsed/INTRO_VISUAL.duration);
      },
      get animated() { return record.opening?.animated ?? false; },
      drawFallback() { if(record.opening?.active) record.opening.fallback(); else if(record.section) record.section.dataset.renderer='fallback'; },
      deactivate() { record.opening?.stop(); record.cancel?.(); record.section?.remove(); },
      dispose() {
        if (!record.section) return;
        record.opening?.destroy(); record.opening=null;
        record.dispose?.(); record.section = null; record.dispose = null; record.depth = null;
      }
    });
    records.set(id, { record, module });
  }
  let fallbackActive = null;
  return Object.freeze({
    has: id => records.has(id),
    register(world) { for (const [id, entry] of records) world.registerScene(id, entry.module); },
    // Identical scene hooks remain available if shared-engine initialization itself fails.
    renderFallback(state) {
      if (fallbackActive !== state.sceneId) records.get(fallbackActive)?.module.deactivate();
      fallbackActive = state.sceneId;
      const entry = records.get(state.sceneId); if (!entry) return;
      entry.module.activate(); entry.module.setBeat(state.beatIndex, { reducedMotion: motion.matches });
    },
    destroy() { for (const entry of records.values()) entry.module.dispose(); fallbackActive = null; }
  });
}
