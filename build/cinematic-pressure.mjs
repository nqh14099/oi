// Scene 7: persistent editorial frames, causal pressure, then a continuous FLIP reorganisation.
// PRESSURE_ASSETS is embedded by assemble-cinematic; all movement is presenter-triggered.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rect = (x,y,width,height,rotation=0,opacity=1) => ({x,y,width,height,rotation,opacity});
const LAYOUTS = [
  [rect(610,155,590,426,-2),rect(1190,115,300,215,4),rect(1115,520,350,230,-3),rect(1600,380,360,260,10,0),rect(670,970,350,260,-12,0),rect(980,-350,330,230,9,0),rect(1670,620,320,210,-9,0),rect(900,990,300,220,8,0)],
  [rect(730,175,365,265,-7),rect(1090,135,295,215,8),rect(1050,465,330,225,-8),rect(855,365,315,220,5),rect(615,485,335,245,-6),rect(1170,325,300,210,12),rect(800,638,295,165,4),rect(1200,600,265,175,-3)],
  [rect(105,340,326,208),rect(457,340,326,208),rect(809,340,326,208),rect(1161,340,326,208),rect(105,586,326,185),rect(457,586,326,185),rect(809,586,326,185),rect(1161,586,326,185)],
  [rect(105,345,230,158),rect(105,548,230,158),rect(1190,345,295,170),rect(455,338,620,365),rect(1190,560,295,145),rect(425,744,235,115),rect(694,744,235,115),rect(963,744,235,115)]
];
const STAGE_NAMES = ['A changing Vietnam','The breaking point','Reform the framework','Built to respond'];
let registered = false;

export function createPressureScene({root,playCue=()=>{}}) {
  const gsap = window.gsap, Flip = window.Flip;
  if(!gsap || !Flip) throw new Error('Scene 7 requires the bundled GSAP and Flip runtimes.');
  if(!registered){gsap.registerPlugin(Flip);registered=true;}
  let section,board,frames=[],surfaces=[],paths=[],copy,heading,body,keys,echo,bottleneck,guide,stamp;
  let timeline=null,flipTween=null,observer=null,currentBeat=-1,sceneData=null,version=0,paused=false,reduced=false,portrait=false,phase='unmounted',destroyed=false;
  const flow={strain:0,order:0,people:0,opacity:0};
  const media=window.matchMedia('(max-width: 700px) and (orientation: portrait)');
  const num=(node,property)=>Number(gsap.getProperty(node,property))||0;
  const geometry=node=>({x:num(node,'x'),y:num(node,'y'),width:node.offsetWidth*num(node,'scaleX'),height:node.offsetHeight*num(node,'scaleY'),rotation:num(node,'rotation'),opacity:num(node,'opacity')});
  function mount(){
    root.innerHTML=`<section class="scene pressure-scene" aria-label="The system can’t stay still"><div class="pressure-board">
      <div class="pressure-kicker">THE SYSTEM CAN’T STAY STILL <span>07 / A LIVING STRUCTURE</span></div>
      <svg class="pressure-connections" viewBox="0 0 1600 900" aria-hidden="true"><defs><linearGradient id="pressure-gold"><stop stop-color="#7b5632"/><stop offset=".55" stop-color="#e0bf7d"/><stop offset="1" stop-color="#80603c"/></linearGradient></defs>
        ${PRESSURE_ASSETS.map((a,i)=>`<path class="pressure-link" data-link="${i}"/>`).join('')}
        <path class="pressure-guide" d="M90 565H1510" pathLength="1"/><path class="pressure-bottleneck" d="M1065 235h35v440h-35M1150 235h-35v440h35"/>
      </svg>
      <div class="pressure-images">${PRESSURE_ASSETS.map((a,i)=>`<figure class="pressure-frame" data-pressure-id="${esc(a.id)}" data-flip-id="pressure-${esc(a.id)}" style="z-index:${i+2}"><div class="pressure-surface"><img src="${a.url}" alt="${esc(a.subject)} — illustrative image placeholder" draggable="false"/><div class="pressure-tint"></div><span class="pressure-placeholder">IMAGE PLACEHOLDER</span><figcaption><span class="pressure-index">${String(i+1).padStart(2,'0')}</span>${esc(a.caption)}</figcaption></div></figure>`).join('')}</div>
      <div class="pressure-copy"><div class="pressure-section-label"></div><h2 class="pressure-title" data-editable="heading"></h2><p class="pressure-body" data-editable="body"></p><div class="pressure-evidence"></div></div>
      <div class="pressure-echo" aria-hidden="true">Society<br/>is changing.</div>
      <div class="pressure-strain-label" aria-hidden="true"><span></span>COMPETING FOR SPACE</div>
      <div class="pressure-bottom"><span class="pressure-meaning">Visual metaphor · Not a simulation of real-world performance</span><span class="pressure-hold">PRESENTER-CONTROLLED</span></div>
    </div></section>`;
    section=root.querySelector('.pressure-scene');board=section.querySelector('.pressure-board');frames=[...section.querySelectorAll('.pressure-frame')];surfaces=frames.map(n=>n.firstElementChild);paths=[...section.querySelectorAll('.pressure-link')];
    copy=section.querySelector('.pressure-copy');heading=section.querySelector('.pressure-title');body=section.querySelector('.pressure-body');keys=section.querySelector('.pressure-evidence');echo=section.querySelector('.pressure-echo');bottleneck=section.querySelector('.pressure-bottleneck');guide=section.querySelector('.pressure-guide');stamp=section.querySelector('.pressure-strain-label');
    observer=new ResizeObserver(resize);observer.observe(root);media.addEventListener('change',resize);resize();
  }
  function resize(){
    if(!section)return;
    const changed=portrait!==media.matches;portrait=media.matches;
    board.style.transform=portrait?'none':`scale(${root.getBoundingClientRect().width/1600})`;
    if(changed && currentBeat>=0){cancel();canonical(currentBeat);phase='static';}
  }
  function text(scene,beat){
    const audience=scene.beats[beat].audience;
    heading.textContent=audience.heading;body.textContent=audience.body||'';
    keys.innerHTML=(audience.keys||[]).map(k=>`<span>${esc(k)}</span>`).join('');
    section.querySelector('.pressure-section-label').textContent=STAGE_NAMES[beat];
    section.dataset.pressureBeat=String(beat);
    frames.forEach((f,i)=>{const shown=beat>0||i<3;f.setAttribute('aria-hidden',String(!shown));});
  }
  function place(index){
    frames.forEach((f,i)=>gsap.set(f,{...LAYOUTS[index][i],scale:1,skewX:0,skewY:0,transformOrigin:'0 0'}));
    gsap.set(surfaces,{x:0,y:0,rotation:0,scaleX:1,scaleY:1,clipPath:'inset(0% 0% 0% 0%)'});
  }
  function canonical(index){
    if(!section)return;place(index);
    gsap.set([copy,heading,body,keys],{opacity:1,x:0,y:0,scale:1,clearProps:'clipPath'});
    gsap.set(echo,{opacity:0,x:0,scaleX:1});gsap.set(guide,{strokeDashoffset:index>=2?0:1,opacity:index>=2?.85:0});
    gsap.set(bottleneck,{opacity:index===1?.9:0});gsap.set(stamp,{opacity:index===1?1:0});
    Object.assign(flow,{strain:index===1?1:0,order:index>=2?1:0,people:index===3?1:0,opacity:1});syncPaths();
  }
  function cancel(){
    version++;timeline?.kill();flipTween?.kill();timeline=flipTween=null;
    if(!section)return;
    Flip.killFlipsOf(frames,false);
    // Preserve the actual interpolated image geometry before the next capture.
    frames.forEach(f=>{const g=geometry(f);gsap.killTweensOf(f);gsap.set(f,{...g,scale:1});});
    gsap.killTweensOf([...surfaces,copy,heading,body,keys,echo,guide,bottleneck,stamp,flow]);
  }
  function syncPaths(){
    if(!section || portrait)return;
    const centres=frames.map(f=>{const g=geometry(f),r=g.rotation*Math.PI/180;return {x:g.x+g.width*.5*Math.cos(r)-g.height*.5*Math.sin(r),y:g.y+g.width*.5*Math.sin(r)+g.height*.5*Math.cos(r),opacity:g.opacity};});
    const h=centres[3];
    paths.forEach((p,i)=>{
      const a=centres[i],b=centres[(i+1)%8];
      const ordered={x: a.x,y:i<4?565:565};
      const targetX=ordered.x+(h.x-ordered.x)*flow.people,targetY=ordered.y+(h.y-ordered.y)*flow.people;
      const endX=b.x+(targetX-b.x)*flow.order,endY=b.y+(targetY-b.y)*flow.order;
      const tug=(i%2===0?1:-1)*(40+170*flow.strain);
      const c1x=a.x+(1108-a.x)*flow.strain+((a.x+endX)*.5-a.x)*(1-flow.strain);
      const c2x=endX+(1108-endX)*flow.strain;
      p.setAttribute('d',`M${a.x.toFixed(1)},${a.y.toFixed(1)} C${c1x.toFixed(1)},${(a.y+tug*(1-flow.order)).toFixed(1)} ${c2x.toFixed(1)},${(endY-tug*(1-flow.order)).toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`);
      p.style.opacity=String(flow.opacity*a.opacity*(.45+.4*flow.strain));
      p.style.stroke=flow.strain>.4?'#bb5d62':'#bca471';
    });
  }
  function makeTimeline(name){
    const ownVersion=version;phase=name;
    timeline=gsap.timeline({paused:true,defaults:{ease:'power3.out'},onUpdate:syncPaths,onComplete:()=>{if(ownVersion!==version)return;canonical(currentBeat);phase='hold';}});
    return timeline;
  }
  function cue(tl,time,type,strength){const ownVersion=version;tl.call(()=>{if(ownVersion===version&&!paused&&!reduced&&!portrait)playCue(type,strength);},[],time);}
  function revealCopy(tl,at,duration=.5){
    gsap.set([heading,body,keys],{opacity:0,y:22});
    tl.to(heading,{opacity:1,y:0,duration},at).to([body,keys],{opacity:1,y:0,duration:.45,stagger:.09},at+.16);
  }
  function opening(){
    place(0);Object.assign(flow,{opacity:0,strain:0,order:0,people:0});
    gsap.set([bottleneck,stamp,echo],{opacity:0});gsap.set(guide,{opacity:.65,strokeDashoffset:1});
    gsap.set(frames.slice(0,3),{opacity:0});gsap.set(surfaces[0],{clipPath:'inset(49.8% 0% 49.8% 0%)'});
    const tl=makeTimeline('opening');tl.to(guide,{strokeDashoffset:0,duration:.55},0).to(frames[0],{opacity:1,duration:.01},.4).to(surfaces[0],{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'power3.inOut'},.4);
    [1,2].forEach((i)=>tl.fromTo(frames[i],{x:LAYOUTS[0][i].x+70,y:LAYOUTS[0][i].y+40,rotation:LAYOUTS[0][i].rotation+4},{...LAYOUTS[0][i],duration:1.1,ease:'power3.out'},.65+i*.18));
    tl.to(flow,{opacity:1,duration:.8},1.1).to(guide,{opacity:0,duration:.5},1.5);revealCopy(tl,.5,.7);tl.to({}, {duration:.3},2);cue(tl,.45,'tick',.35);
  }
  function recoil(tl,index,time,dx,dy,rotation=2){
    const surface=surfaces[index];
    tl.to(surface,{x:dx,y:dy,rotation,scaleX:.945,scaleY:.97,duration:.085,ease:'power2.in'},time)
      .to(surface,{x:-dx*.22,y:-dy*.18,rotation:-rotation*.3,scaleX:1.018,scaleY:1.012,duration:.18,ease:'power2.out'},time+.085)
      .to(surface,{x:0,y:0,rotation:0,scaleX:1,scaleY:1,duration:.32,ease:'elastic.out(1,0.4)'},time+.265);
  }
  function pressure(){
    const tl=makeTimeline('pressure');
    gsap.set([heading,body,keys],{opacity:0});gsap.set(echo,{opacity:1,x:0,scaleX:1});gsap.set([bottleneck,stamp],{opacity:0});
    tl.to(guide,{opacity:0,duration:.15},0).to(flow,{order:0,people:0,opacity:1,strain:1,duration:2.35,ease:'power2.in'},0);
    // Each tuple is an incoming demand, its entry time, flight duration, and displaced neighbours.
    const arrivals=[{i:3,t:.18,d:.45,v:[0,2],dx:-34,dy:-14},{i:4,t:.76,d:.38,v:[0,3],dx:25,dy:-18},{i:5,t:1.22,d:.32,v:[1,3],dx:-28,dy:18},{i:6,t:1.56,d:.28,v:[4,2],dx:21,dy:-22},{i:7,t:1.80,d:.26,v:[2,5],dx:-25,dy:-14}];
    const shifts=[
      [[0,rect(660,158,475,340,-4)],[2,rect(1150,555,300,205,-5)]],
      [[0,rect(718,170,397,285,-6)],[3,rect(855,355,330,235,7)]],
      [[1,LAYOUTS[1][1]],[3,LAYOUTS[1][3]]],
      [[4,LAYOUTS[1][4]],[0,LAYOUTS[1][0]]],
      [[2,LAYOUTS[1][2]],[5,LAYOUTS[1][5]]]
    ];
    arrivals.forEach((a,k)=>{
      const impact=a.t+a.d, f=frames[a.i];
      tl.set(f,{opacity:1},a.t).to(f,{...LAYOUTS[1][a.i],duration:a.d,ease:'power3.in'},a.t);
      shifts[k].forEach(([i,target])=>tl.to(frames[i],{...target,duration:.46,ease:'back.out(1.25)'},impact-.045));
      a.v.forEach((i,j)=>recoil(tl,i,impact+j*.035,a.dx,a.dy,j?-2:2));
      tl.to(echo,{x:-k*2,scaleX:1-(k+1)*.025,duration:.16,ease:'power2.inOut'},impact);
      cue(tl,a.t,'tick',.4+k*.1);cue(tl,impact,k>1?'impact':'click',.55+k*.1);
    });
    tl.to([bottleneck,stamp],{opacity:1,duration:.25},1.65);
    // Two short, local failed attempts at expansion; never shake the viewport or the question.
    tl.to(surfaces[3],{scaleX:1.07,x:9,duration:.15,ease:'power2.out'},1.45).to(surfaces[3],{scaleX:.97,x:-10,duration:.1,ease:'power2.in'},1.63).to(surfaces[3],{scaleX:1,x:0,duration:.27},1.75);
    tl.to(surfaces[2],{x:7,y:-3,duration:.045},2.13).to(surfaces[2],{x:-4,y:2,duration:.055},2.175).to(surfaces[2],{x:0,y:0,duration:.16},2.23);
    tl.to(surfaces,{x:0,y:0,rotation:0,scaleX:1,scaleY:1,duration:.12},2.57);
    tl.addLabel('peak',2.70).call(()=>{phase='freeze';},[],2.70);
    // Exactly 0.4 seconds with no visual or audio changes at the bottleneck.
    tl.to(echo,{opacity:0,duration:.16},3.10).call(()=>{phase='question';},[],3.10);
    revealCopy(tl,3.12,.48);tl.to({}, {duration:.12},3.75);
  }
  function reorganise(target,duration){
    const tl=makeTimeline(target===2?'restructure':'people');
    gsap.set(echo,{opacity:0});
    const capture=Flip.getState(frames,{props:'opacity'});
    // No DOM replacement, opacity wipe, or change of image identity. FLIP inverts back to capture immediately.
    frames.forEach((f,i)=>gsap.set(f,{...LAYOUTS[target][i],scale:1}));
    flipTween=Flip.from(capture,{duration,scale:false,absolute:false,paused:true,ease:target===2?'power3.inOut':'power2.inOut',stagger:target===2?.055:.025,prune:false});
    tl.add(flipTween,.32);flipTween.paused(false);
    gsap.set(guide,{strokeDashoffset:1,opacity:.9});tl.to(guide,{strokeDashoffset:0,duration:.8,ease:'power2.inOut'},0);
    tl.to([bottleneck,stamp],{opacity:0,duration:.45},.4).to(flow,{strain:0,order:1,people:target===3?1:0,opacity:1,duration:duration+.3,ease:'power2.inOut'},.1);
    if(target===2){
      [3,5,2,4].forEach((i,k)=>{recoil(tl,i,.12+k*.075,k%2?8:-8,3,1.1);cue(tl,.18+k*.09,'click',.35);});
      // Small settling corrections on the surface, independent of the continuous outer FLIP.
      [0,1,2,3,4,5,6,7].forEach((i)=>tl.fromTo(surfaces[i],{y:i%2?-5:5},{y:0,duration:.4,ease:'power2.out',immediateRender:false},1.95+i*.04));
    }
    revealCopy(tl,.55,.65);cue(tl,.65,'tick',.3);
  }
  function returnTo(target){
    const tl=makeTimeline('return');const capture=Flip.getState(frames,{props:'opacity'});
    frames.forEach((f,i)=>gsap.set(f,{...LAYOUTS[target][i],scale:1}));
    flipTween=Flip.from(capture,{duration:.8,scale:false,paused:true,ease:'power2.inOut'});tl.add(flipTween,0);flipTween.paused(false);
    tl.to(flow,{strain:target===1?1:0,order:target>=2?1:0,people:target===3?1:0,opacity:1,duration:.8},0);
    tl.to([bottleneck,stamp],{opacity:target===1?1:0,duration:.45},0);gsap.set(echo,{opacity:0});revealCopy(tl,.1,.35);
  }
  function present(scene,beat,event={},options={}){
    if(destroyed)return;const entering=!section;
    if(entering)mount();
    const previous=currentBeat;sceneData=scene;reduced=!!options.reducedMotion;
    text(scene,beat);
    if(previous===beat&&!entering&&event?.type!=='replay'&&event?.reason!=='replay'){return;}
    cancel();currentBeat=beat;
    if(reduced||portrait){canonical(beat);phase='static';return;}
    const replay=event?.type==='replay'||event?.reason==='replay';
    if(entering||replay){place(beat===0?0:beat-1);Object.assign(flow,{opacity:1,strain:beat===2?1:0,order:beat===3?1:0,people:0});}
    if(beat===0 && (entering||replay))opening();
    else if(beat===1 && (previous===0||entering||replay))pressure();
    else if(beat===2 && (previous<2||entering||replay))reorganise(2,2.45);
    else if(beat===3 && (previous<3||entering||replay))reorganise(3,1.95);
    else returnTo(beat);
    syncPaths();if(!paused)timeline.play(0);
  }
  function unmount(){cancel();observer?.disconnect();observer=null;media.removeEventListener('change',resize);section?.remove();section=board=null;frames=surfaces=paths=[];currentBeat=-1;phase='unmounted';paused=false;}
  return {present,unmount,
    pause(){paused=true;timeline?.pause();},
    resume(){paused=false;if(!reduced&&!portrait)timeline?.resume();},
    setReducedMotion(value){reduced=!!value;if(section&&reduced){cancel();canonical(currentBeat);phase='static';}},
    getState(){return {beat:currentBeat,phase,version,paused,reduced,portrait,playing:!!timeline?.isActive(),time:timeline?.time()||0,duration:timeline?.duration()||0,frames:frames.map((f,i)=>({id:PRESSURE_ASSETS[i].id,...geometry(f)}))};},
    destroy(){unmount();destroyed=true;}
  };
}
