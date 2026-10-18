/** Decorative motion only: canonical text remains selectable, accessible and exportable. */
export function numberFormat(value, template) {
  const match = String(template).match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(.*?)$/);
  if (!match) return String(template);
  const [,prefix,raw,suffix]=match, decimals=(raw.split('.')[1]||'').length;
  let [whole,fraction]=Math.abs(value).toFixed(decimals).split('.');
  if (/^0\d/.test(raw)) whole=whole.padStart(raw.split('.')[0].length,'0');
  if(raw.includes(','))whole=whole.replace(/\B(?=(\d{3})+(?!\d))/g,',');
  return prefix+(value<0?'-':'')+whole+(fraction!==undefined?'.'+fraction:'')+suffix;
}
export function numberEase(t) { t=Math.max(0,Math.min(1,t));return 1-Math.pow(1-t,3); }
export function createCinematicNumberAnimator({roots=[],reducedMotion=false,now=()=>performance.now()}={}) {
  const records=new Map(), sinks=new Set();
  let scene=null,beat=0,raf=0,pausedAt=null,dead=false,serial=0;
  function paint(r,p) {
    r.progress=Math.max(0,Math.min(1,p));
    const eased=r.ease(r.progress);r.current=r.from+(r.to-r.from)*eased;
    if(r.draw){r.draw(r.progress);return;}
    if(!r.element?.isConnected)return;
    r.element.classList.toggle('cn-running',r.progress<1);
    if(r.mode==='count')r.overlay.dataset.display=r.progress===1?r.text:numberFormat(r.current,r.text);
    else r.digits.forEach((digit,i)=>{
      const local=Math.max(0,Math.min(1,(r.progress-i*.035)/(1-i*.035)));
      digit.style.transform=`translateY(${(1-numberEase(local))*105}%)`;
      digit.style.opacity=String(Math.min(1,local*5));
    });
  }
  function active(){return [...records.values(),...sinks].filter(r=>r.scene===scene&&r.progress<1);}
  function tick() {
    raf=0;if(dead||pausedAt!==null)return;
    const time=now();
    for(const r of active())if(!r.channel)paint(r,(time-r.start)/r.duration);
    if(active().some(r=>!r.channel))raf=requestAnimationFrame(tick);
  }
  function schedule(){if(!raf&&!dead&&pausedAt===null)raf=requestAnimationFrame(tick);}
  function start(r,snap=false){r.start=now();paint(r,reducedMotion||snap?1:0);schedule();}
  function mount(element,text,options={}) {
    const canonical=document.createElement('span');canonical.className='cn-value';canonical.textContent=text;
    const overlay=document.createElement('span');overlay.className='cn-motion';overlay.setAttribute('aria-hidden','true');
    const r={scene,text,element,overlay,digits:[],from:0,to:Number(text.replace(/[^\d.]/g,'')),mode:'odometer',duration:850,ease:numberEase,...options};
    element.classList.add('cinematic-number');element.replaceChildren(canonical,overlay);
    if(r.mode==='count')overlay.classList.add('cn-count');
    else for(const char of text){const digit=document.createElement('span');digit.dataset.digit=char;overlay.append(digit);r.digits.push(digit);}
    return r;
  }
  function present(state,event={}) {
    if(dead)return;
    const changed=scene!==state.sceneId,replay=event.type==='replay';
    if(changed){for(const r of records.values())paint(r,1);records.clear();}
    scene=state.sceneId;beat=state.beatIndex;
    const snap=event.reason==='previous';
    if(changed||replay)for(const r of sinks)if(r.scene===scene)start(r,snap);
    const occurrences=new Map();
    for(const root of roots.filter(Boolean)) {
      // Unwrap surviving nodes before scanning; occurrence keys keep ongoing motion stable.
      for(const el of root.querySelectorAll('.cinematic-number'))el.replaceWith(document.createTextNode(el.querySelector('.cn-value').textContent));
      root.normalize();
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),texts=[];
      while(walker.nextNode()){
        const node=walker.currentNode,parent=node.parentElement;
        if(!/\d/.test(node.data)||!parent||parent.closest('script,style,textarea,input,select,[contenteditable],.cinematic-number'))continue;
        if(!parent.getClientRects().length||getComputedStyle(parent).visibility==='hidden')continue;
        texts.push(node);
      }
      for(const node of texts){
        const parent=node.parentElement,fragment=document.createDocumentFragment();let end=0;
        for(const match of node.data.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g)){
          fragment.append(node.data.slice(end,match.index));end=match.index+match[0].length;
          const el=document.createElement('span'),text=match[0];fragment.append(el);
          const semanticClass=String(parent.className?.baseVal??parent.className).split(/\s+/).filter(c=>c&&!['current','active','complete','selected','correct','incorrect','is-active'].includes(c)).join(' ');
          const base=[root.id,semanticClass,text].join('|');
          const nth=occurrences.get(base)||0;occurrences.set(base,nth+1);const key=base+'|'+nth;
          const count=!!parent.closest('.restructure-numbers,.restructure-legend,.service-evidence')&&Number(text)<1000;
          const channel=scene===5&&beat===1&&parent.closest('.number-after')?'restructuring':null;
          const old=records.get(key),r=mount(el,text,{mode:count?'count':'odometer',channel,duration:count?1200:850});
          records.set(key,r);
          if(old&&!replay&&!changed){r.start=old.start;paint(r,snap?1:old.progress);}
          else start(r,snap);
          if(channel&&!old?.channel)start(r,snap);
        }
        fragment.append(node.data.slice(end));node.replaceWith(fragment);
      }
    }
    for(const [key,r]of records)if(!r.element.isConnected)records.delete(key);
    schedule();
  }
  function finish(){for(const r of active())paint(r,1);cancelAnimationFrame(raf);raf=0;}
  const api={present,finish,
    setProgress(channel,p){if(dead||pausedAt!==null)return;for(const r of records.values())if(r.channel===channel&&r.scene===scene)paint(r,reducedMotion?1:p);},
    registerSink({sceneId,text,draw,duration=850}){const r={scene:sceneId,text,draw,duration,ease:numberEase,from:0,to:0,progress:1};sinks.add(r);if(sceneId===scene)start(r);return()=>sinks.delete(r);},
    animate(element,{to,from=0,template=String(to),...options}={}){const key='manual-'+serial++,r=mount(element,template,{from,to,mode:'count',...options});records.set(key,r);start(r);return key;},
    update(key,to,template=String(to)){const old=records.get(key);if(!old)return;const r=mount(old.element,template,{from:old.current,to,mode:old.mode,duration:old.duration,ease:old.ease});records.set(key,r);start(r);},
    replay(){for(const r of active())start(r);for(const r of records.values())if(r.scene===scene)start(r);for(const r of sinks)if(r.scene===scene)start(r);},
    cancel(key){const r=records.get(key);if(r){paint(r,1);records.delete(key);}},
    pause(){if(pausedAt===null)pausedAt=now();cancelAnimationFrame(raf);raf=0;},
    resume(){if(pausedAt===null)return;const delta=now()-pausedAt;for(const r of [...records.values(),...sinks])r.start+=delta;pausedAt=null;schedule();},
    setReducedMotion(value){reducedMotion=!!value;if(value)finish();},
    inventory(){return [...records.values(),...sinks].filter(r=>r.scene===scene).map(r=>({text:r.text,mode:r.mode||'canvas-reveal',progress:r.progress,channel:r.channel||null,kind:r.draw?'canvas':'DOM'}));},
    destroy(){finish();dead=true;records.clear();sinks.clear();}
  };return api;
}
