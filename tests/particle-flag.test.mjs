import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {clothAt,makeFlagAttributes,createParticleFlag,FLAG_QUALITY} from '../build/particle-flag.mjs';
import {emblemContains} from '../build/scene-one-intro.mjs';
const THREE=createRequire(import.meta.url)('../build/vendor/three.cjs');
test('the pole boundary stays fixed at top, middle and bottom across wind cycles',()=>{
 for(const v of [0,.25,.5,.75,1])for(const t of [0,1,2,3,7,31]){
  const p=clothAt(0,v,t),fixed=clothAt(0,v,0);assert.ok(p.every((n,i)=>Math.abs(n-fixed[i])<1e-12));
 }
});
test('free-edge folds vary in depth and shape without reversing the fabric horizontally',()=>{
 assert.ok(Math.abs(clothAt(1,.4,0)[2]-clothAt(1,.4,1)[2])>.25);
 for(const t of [0,1,2,3,12])for(const v of [0,.5,1]){
  let previous=-Infinity;for(let i=0;i<=100;i++){const p=clothAt(i/100,v,t);assert.ok(p.every(Number.isFinite));assert.ok(p[0]>previous);assert.ok(Math.abs(p[2])<.77);previous=p[0];}
 }
});
test('structured sampling is seeded, progressive and avoids invalid surface coordinates',()=>{
 const a=makeFlagAttributes(600),b=makeFlagAttributes(1200);assert.deepEqual(makeFlagAttributes(600),a);
 for(const [key,values] of Object.entries(a))assert.deepEqual(b[key].slice(0,values.length),values);
 assert.ok(a.aUV.every(v=>v>=0&&v<=1));assert.ok(a.aSize.some(v=>v>2));assert.ok(a.aBrightness.some(v=>v<.5));
});
test('gold particles match the existing emblem mask, not an independent floating logo',()=>{
 const a=makeFlagAttributes(2400);let gold=0;for(let i=0;i<a.aRegion.length;i++){const [u,v]=a.aUV.slice(i*2,i*2+2);if(a.aRegion[i]===1){gold++;assert.ok(emblemContains(u,v));}}
 assert.ok(gold>220);assert.throws(()=>makeFlagAttributes(0),RangeError);
});
test('GPU field and clock are shared by mesh, fine particles, glow and sparse drift',()=>{
 const f=createParticleFlag(THREE);const children=f.group.children;
 assert.equal(children.length,4);assert.ok(children[0].isMesh);assert.ok(children.slice(1).every(c=>c.isPoints));
 for(const child of children){assert.match(child.material.vertexShader,/vec3 cloth\(vec2 uv,float t\)/);assert.equal(child.material.uniforms.uTime,f.uniforms.uTime);}
 const buffer=f.geometry.attributes.position.array;f.setTime(2);assert.equal(f.uniforms.uTime.value,2);assert.equal(f.geometry.attributes.position.array,buffer);
 f.setGlow(false);assert.equal(f.uniforms.uGlow.value,0);f.setGlow(true);assert.ok(f.uniforms.uGlow.value>0);f.dispose();
});
test('quality changes reuse geometry; invalid calls fail safely and cleanup is idempotent',()=>{
 const f=createParticleFlag(THREE);const buffer=f.geometry.attributes.aUV.array;
 for(const [quality,count] of Object.entries(FLAG_QUALITY)){f.setQuality(quality);assert.equal(f.geometry.drawRange.count,count);assert.equal(f.geometry.attributes.aUV.array,buffer);}
 assert.throws(()=>f.setQuality('unknown'),RangeError);assert.throws(()=>f.setTime(-1),RangeError);
 let disposals=0;f.geometry.addEventListener('dispose',()=>disposals++);f.dispose();f.dispose();assert.equal(disposals,1);assert.equal(f.disposed,true);assert.equal(f.group.children.length,0);
});
