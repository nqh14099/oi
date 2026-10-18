import { emblemContains } from './scene-one-intro.mjs';

// The approved, source-derived emblem mask is shared with the existing opening.
// Choreography: video-shotcraft depth-layer-moves / multiplane (0.35 / 0.7 / 1.4).
// Borrow depth hierarchy and a steady readable subject, not its marketing layout.
export const FLAG_QUALITY = Object.freeze({ high:42000, medium:22000, low:9000 });
export const FLAG_DIMENSIONS = Object.freeze({ width:5.8, height:5.8*2/3, top:2.45 });
const TAU=Math.PI*2, fract=n=>n-Math.floor(n);

// CPU counterpart for bounds/tests; runtime vertices use the identical GLSL field.
export function clothAt(u,v,t) {
  const e=u**1.1, gust=.90+.10*Math.sin(t*.47);
  const phase=TAU*(1.15*u-.20*t)+1.05*v+.12*Math.sin(TAU*v);
  const second=TAU*(2.10*u-.31*t)+1.1*v;
  const wrinkle=TAU*(3.65*u-1.25*v-.16*t)+.45*Math.sin(TAU*(.55*v-.12*t));
  return [5.8*u-.14*u*u*(1-Math.cos(phase)),
    2.45-v*(5.8*2/3)-.12*u*u+e*.085*Math.sin(TAU*(.85*u-.18*t)+.25*v),
    e*gust*(.48*Math.sin(phase)+.12*Math.sin(second)+.13*Math.sin(wrinkle)+.036*Math.sin(TAU*(5.4*u+2.1*v-.15*t)))];
}

export function makeFlagAttributes(count=FLAG_QUALITY.high) {
  if(!Number.isInteger(count)||count<1)throw new RangeError('particle count must be positive');
  let seed=0xC0F1; // fixed distribution, never frame-dependent randomness
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const a={position:[],aUV:[],aSeed:[],aSize:[],aBrightness:[],aRegion:[],aPhase:[]};
  for(let i=0;i<count;i++){
    let u=fract(.5+i*.754877666+(random()-.5)*.009),v=fract(.5+i*.569840296+(random()-.5)*.009);
    let edge=false;
    if(i%11===0){edge=true;const side=i%4,q=random();[u,v]=side===0?[q,.0007]:side===1?[.9993,q]:side===2?[q,.9993]:[.0007,q];}
    else if(i%5===0){const x=.235+random()*.46,y=.172+random()*.61;if(emblemContains(x,y)){u=x;v=y;}}
    const gold=emblemContains(u,v),r=random();
    a.position.push(...clothAt(u,v,0));a.aUV.push(u,v);a.aSeed.push(random());a.aPhase.push(random()*TAU);
    a.aRegion.push(gold?1:edge?2:r>.993?3:0);
    a.aSize.push(gold?1.65+random()*.65:r>.975?2.2+random()*.8:1.05+random()*.65);
    a.aBrightness.push(r>.975?1.30:r>.78?.85:.35+random()*.3);
  }
  return a;
}

const clothGLSL=`
vec3 cloth(vec2 uv,float t){
 float u=uv.x,v=uv.y,e=pow(u,1.1),gust=.90+.10*sin(t*.47);
 float phase=6.28318530718*(1.15*u-.20*t)+1.05*v+.12*sin(6.28318530718*v);
 float second=6.28318530718*(2.10*u-.31*t)+1.1*v;
 float wrinkle=6.28318530718*(3.65*u-1.25*v-.16*t)+.45*sin(6.28318530718*(.55*v-.12*t));
 return vec3(5.8*u-.14*u*u*(1.-cos(phase)),
 2.45-v*(5.8*2./3.)-.12*u*u+e*.085*sin(6.28318530718*(.85*u-.18*t)+.25*v),
 e*gust*(.48*sin(phase)+.12*sin(second)+.13*sin(wrinkle)+.036*sin(6.28318530718*(5.4*u+2.1*v-.15*t))));
}
vec3 clothNormal(vec2 uv,float t){float h=.0015;vec3 p=cloth(uv,t);
 return normalize(cross(cloth(uv+vec2(0.,h),t)-p,cloth(uv+vec2(h,0.),t)-p));}
// A grazing key creates traveling fold shadows, rather than frontal flat fill.
float illumination(vec3 n,vec2 uv,float t){
 float key=.14+.86*pow(max(dot(n,normalize(vec3(-.95,.55,.90))),0.),1.6);
 // Stylized local fold occlusion: grain and backing share the same traveling
 // wrinkle field. Troughs remain dark while a narrow crest catches the key.
 float wrinkle=6.28318530718*(3.65*uv.x-1.25*uv.y-.16*t)+.45*sin(6.28318530718*(.55*uv.y-.12*t));
 return key*(.24+.76*smoothstep(-.65,.45,sin(wrinkle)));
}
`;
const outputGLSL=`
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
`;
const meshVertex=`uniform float uTime;varying vec2 vUV;varying vec3 vNormal;
${clothGLSL}
void main(){vUV=vec2(uv.x,1.-uv.y);vec3 p=cloth(vUV,uTime);vNormal=normalize(normalMatrix*clothNormal(vUV,uTime));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const meshFragment=`uniform sampler2D uMask;uniform float uTime;uniform vec3 uRedShadow,uRed,uRedLight,uGold;varying vec2 vUV;varying vec3 vNormal;
${clothGLSL}
void main(){float l=illumination(normalize(vNormal),vUV,uTime);float emblem=texture2D(uMask,vUV).r;
 vec3 red=mix(uRedShadow,uRed,pow(l,.85))+uRedLight*.16*pow(l,4.);
 // The backing only connects the grains; the emblem is read primarily in light.
 vec3 gold=uGold*(.18+.42*l);vec3 color=mix(red,gold,emblem);
 gl_FragColor=vec4(color,mix(.32,.28,emblem));${outputGLSL}}`;
const particleVertex=`attribute vec2 aUV;attribute float aSeed,aSize,aBrightness,aRegion,aPhase;
uniform float uTime,uPixels,uHalo,uDrift;varying float vLight,vBrightness,vRegion,vHalo,vFade;
${clothGLSL}
void main(){vec3 n=clothNormal(aUV,uTime),p=cloth(aUV,uTime)+n*.004;vFade=1.;
 if(uDrift>.5){float life=fract(uTime*.08+aSeed);p+=vec3(.48*life,.07*sin(aPhase)*life,.28*life);
  vFade=smoothstep(0.,.18,life)*(1.-smoothstep(.5,1.,life));}
 vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;
 gl_PointSize=clamp(aSize*uPixels*8.7/-view.z*(uHalo>.5?4.2:1.),.65,16.);
 vLight=illumination(normalize(normalMatrix*n),aUV,uTime);vBrightness=aBrightness;vRegion=aRegion;vHalo=uHalo;
}`;
const particleFragment=`uniform vec3 uRedShadow,uRed,uRedLight,uGold,uChampagne;uniform float uGlow;
varying float vLight,vBrightness,vRegion,vHalo,vFade;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;
 bool gold=vRegion>.5&&vRegion<1.5;
 vec3 color=gold?uGold*(1.15+1.15*vLight):mix(uRed,uRedLight,pow(vLight,.80))*(.80+.75*vLight);
 if(vRegion>2.5)color=uChampagne;
 float core=1.-smoothstep(.045,.19,r),halo=1.-smoothstep(.12,.50,r);
 float alpha=(core*.90+halo*.10)*(.28+.72*vLight);
 if(vHalo>.5){float selected=gold?.62:vRegion>1.5?.18:pow(vLight,4.)*.14;
  alpha=exp(-18.*r*r)*selected*vBrightness*uGlow*(.30+.70*vLight);}
 else color*=.75+vBrightness*.62;
 gl_FragColor=vec4(color,alpha*vFade);${outputGLSL}}`;

export function createParticleFlag(THREE,{quality='medium'}={}) {
  if(!Object.hasOwn(FLAG_QUALITY,quality))throw new RangeError('unknown flag quality');
  const owned=new Set(),own=o=>(owned.add(o),o),group=new THREE.Group();group.name='Continuous particle cloth';
  const attrs=makeFlagAttributes(),geometry=own(new THREE.BufferGeometry());
  for(const [key,values] of Object.entries(attrs))geometry.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='position'?3:key==='aUV'?2:1));
  geometry.setDrawRange(0,FLAG_QUALITY[quality]);
  const colors={uRedShadow:{value:new THREE.Color('#250713')},uRed:{value:new THREE.Color('#BB263E')},
    uRedLight:{value:new THREE.Color('#F75B65')},uGold:{value:new THREE.Color('#EAAF53')},uChampagne:{value:new THREE.Color('#EACD8E')}};
  const common={...colors,uTime:{value:0},uPixels:{value:1},uGlow:{value:.85}};
  // A local procedural mask sampled from the existing vector; no fetched image.
  const width=768,height=512,pixels=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4,value=emblemContains((x+.5)/width,(y+.5)/height)?255:0;
    pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;
  }
  const mask=own(new THREE.DataTexture(pixels,width,height,THREE.RGBAFormat));mask.magFilter=THREE.LinearFilter;mask.minFilter=THREE.LinearFilter;mask.needsUpdate=true;
  const clothGeometry=own(new THREE.PlaneGeometry(5.8,5.8*2/3,144,96));
  const body=own(new THREE.ShaderMaterial({uniforms:{...common,uMask:{value:mask}},vertexShader:meshVertex,fragmentShader:meshFragment,
    transparent:true,side:THREE.DoubleSide,depthWrite:false}));
  const fabric=new THREE.Mesh(clothGeometry,body);fabric.frustumCulled=false;fabric.renderOrder=1;group.add(fabric);
  const pointMaterial=(halo,drift=false)=>own(new THREE.ShaderMaterial({uniforms:{...common,uHalo:{value:halo?1:0},uDrift:{value:drift?1:0}},vertexShader:particleVertex,fragmentShader:particleFragment,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  // Halo follows the backing in draw order: transparent fabric must not dim it.
  const glow=new THREE.Points(geometry,pointMaterial(true));glow.renderOrder=2;glow.frustumCulled=false;
  const points=new THREE.Points(geometry,pointMaterial(false));points.renderOrder=3;points.frustumCulled=false;group.add(glow,points);
  const driftGeometry=own(new THREE.BufferGeometry());
  for(const key of Object.keys(attrs)){
    const components=key==='position'?3:key==='aUV'?2:1,values=[];
    for(let i=0;i<24;i++){
      const u=.985,v=(i+.5)/24;
      if(key==='position')values.push(...clothAt(u,v,0));else if(key==='aUV')values.push(u,v);
      else if(key==='aRegion')values.push(3);else values.push(attrs[key][i]);
    }
    driftGeometry.setAttribute(key,new THREE.Float32BufferAttribute(values,components));
  }
  const drift=new THREE.Points(driftGeometry,pointMaterial(false,true));drift.renderOrder=2;drift.frustumCulled=false;group.add(drift);
  let destroyed=false,currentQuality=quality;
  return Object.freeze({group,uniforms:common,geometry,mask,
    setTime(time){if(!Number.isFinite(time)||time<0)throw new RangeError('time must be nonnegative');if(!destroyed)common.uTime.value=time;},
    setPixels(value){if(!destroyed)common.uPixels.value=value;},
    setGlow(value){if(!destroyed)common.uGlow.value=value?.85:0;},
    setQuality(value){if(!Object.hasOwn(FLAG_QUALITY,value))throw new RangeError('unknown flag quality');if(!destroyed){currentQuality=value;geometry.setDrawRange(0,FLAG_QUALITY[value]);}},
    get quality(){return currentQuality;},get disposed(){return destroyed;},
    dispose(){if(destroyed)return;destroyed=true;group.removeFromParent();for(const resource of owned)resource.dispose();group.clear();owned.clear();}
  });
}
