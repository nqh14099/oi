import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {createCameraRig} from '../build/camera-rig.mjs';
import {createOpeningPrototype,flagSamples,emblemContains} from '../build/scene-one-intro.mjs';
const THREE=createRequire(import.meta.url)('../build/vendor/three.cjs');
const data=JSON.parse(await readFile(new URL('../build/content.json',import.meta.url)));
function fixture({reduced=false,quality='high',mode='webgl'}={}){
 let clock=0,invalidations=0;const doc=Object.assign(new EventTarget(),{hidden:false});
 class Element {constructor(){this.children=[];this.style={};this.dataset={};this.classes=new Set();this.ownText='';}
 set className(v){this.classes=new Set(v.split(' '));}get classList(){return {toggle:(n,v)=>v?this.classes.add(n):this.classes.delete(n)}}
 set textContent(v){this.children=[];this.ownText=v;}get textContent(){return this.ownText+this.children.map(c=>c.textContent).join('')}
 append(...c){this.children.push(...c)}remove(){}setAttribute(k,v){this[k]=v}getBoundingClientRect(){return {left:0,top:0,width:1600,height:900}}}
 doc.createElement=()=>new Element();doc.createElementNS=()=>new Element();
 const motion=Object.assign(new EventTarget(),{matches:reduced}),portrait=Object.assign(new EventTarget(),{matches:false});
 const record={scene:data.scenes[0],section:new Element(),heading:new Element(),body:new Element(),subtitle:new Element(),members:new Element(),depth:new THREE.Group(),cancel(){}};
 const root=new THREE.Group(),resources=[],camera=createCameraRig(THREE),controller=new AbortController();
 const ctx={THREE,root,camera,quality,mode,reducedMotion:reduced,size:{width:1600,height:900},signal:controller.signal,own:r=>(resources.push(r),r),invalidate:()=>invalidations++};
 const proto=createOpeningPrototype({record,document:doc,window:{devicePixelRatio:1},motion,portrait,now:()=>clock});
 return {record,proto,root,resources,camera,ctx,controller,doc,motion,setTime:t=>clock=t,get invalidations(){return invalidations}};
}
test('seeded particle attributes and source-derived emblem remain deterministic',()=>{
 const a=flagSamples(6000),b=flagSamples(6000);assert.deepEqual(a,b);assert.equal(a.aTarget.length,18000);
 assert.ok(a.aRegion.filter(x=>x===1).length>400);assert.ok(a.aRegion.filter(x=>x===0).length>4000);
 assert.ok(emblemContains(.46,.37));assert.equal(emblemContains(.05,.05),false);
 for(const key of Object.keys(a))assert.ok(a[key].every(Number.isFinite));
});
test('one three-second clock drives GPU/DOM and stops without updating buffers',()=>{
 const f=fixture();f.proto.start(f.ctx);assert.equal(f.record.heading.textContent,data.title);
 assert.equal(f.root.children.length,1);assert.equal(f.root.children[0].children.length,3);
 const particles=f.root.children[0].children[1],buffer=particles.geometry.attributes.position.array,uniforms=particles.material.uniforms;
 for(const ms of [250,750,1050,1350,1750,2250,3000]){f.setTime(ms);f.proto.update(.05,f.ctx);assert.equal(uniforms.uTime.value,ms/1000);assert.equal(particles.geometry.attributes.position.array,buffer);}
 assert.equal(f.proto.animated,false);assert.equal(f.record.section.dataset.introTime,'3.000');
 f.setTime(12000);f.proto.update(.05,f.ctx);assert.equal(uniforms.uTime.value,3);assert.deepEqual(f.camera.getPose().position,[0,0,8.2]);f.proto.destroy();
});
test('hidden time is excluded, replay reuses resources and resets the same seed',()=>{
 const f=fixture();f.proto.start(f.ctx);const count=f.resources.length;
 f.setTime(250);f.proto.update(.05,f.ctx);f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));
 f.setTime(2250);f.doc.hidden=false;f.doc.dispatchEvent(new Event('visibilitychange'));f.proto.update(.05,f.ctx);assert.equal(f.record.section.dataset.introTime,'0.250');
 f.setTime(2750);f.proto.update(.05,f.ctx);assert.equal(f.record.section.dataset.introTime,'0.750');
 f.proto.start(f.ctx);assert.equal(f.record.section.dataset.introTime,'0.000');assert.equal(f.resources.length,count);f.controller.abort();assert.equal(f.proto.animated,false);f.proto.destroy();
});
test('low quality/reduced motion retain final information; fallback never schedules itself indefinitely',()=>{
 const f=fixture({reduced:true,quality:'low'});f.proto.start(f.ctx);assert.equal(f.proto.animated,false);
 assert.equal(f.root.children[0].children[1].geometry.drawRange.count,6000);assert.equal(f.record.section.dataset.introTime,'3.000');
 const before=f.invalidations;f.proto.fallback();f.proto.fallback();assert.equal(f.invalidations,before);f.proto.destroy();
 const fallback=fixture({mode:'fallback'});fallback.proto.start(fallback.ctx);assert.equal(fallback.record.heading.textContent,data.title);assert.equal(fallback.record.section.dataset.renderer,'fallback');fallback.proto.destroy();
});
test('pointer response is damped, bounded, independent of timeline and disabled under reduced motion',()=>{
 const f=fixture();f.proto.start(f.ctx);f.setTime(3000);f.proto.update(.05,f.ctx);
 const event=Object.assign(new Event('pointermove'),{clientX:1600,clientY:0,pointerType:'mouse'});f.doc.dispatchEvent(event);
 for(let i=0;i<40;i++)f.proto.update(.05,f.ctx);
 const p=f.camera.getPose().position;assert.ok(p[0]>0&&p[0]<.58);assert.ok(p[1]>0&&p[1]<.37);assert.equal(f.record.section.dataset.introTime,'3.000');
 f.motion.matches=true;f.motion.dispatchEvent(new Event('change'));assert.deepEqual(f.camera.getPose().position,[0,0,8.2]);
 f.proto.destroy();const n=f.invalidations;f.doc.dispatchEvent(event);f.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(f.invalidations,n);
});
