// Scene 3: a spatial procedural network. Thin screen-space ribbons, never tubes.
export function createMazeScene({onSettled=()=>{}}={}) {
 let T,root,own,person,limbs,beat=0,reform=0,entry=0,clock=0,transition=null,disposed=false;
 const paths=[],stations=[],papers=[],dots=[];
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const start=[[-3,1.7,.4],[-.5,3.4,-.8],[2,.9,1],[4.5,2.8,-.6]];
 const finish=[[-3,2,0],[-.5,2,0],[2,2,0],[4.5,2,0]];
 const names=['Reception','Review','Approval','Result'];
 const vertex=`attribute vec3 aNext;attribute float aSide,aAlong;uniform vec2 uViewport;uniform float uWidth;varying float vSide,vAlong;
 void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);vec4 q=projectionMatrix*modelViewMatrix*vec4(aNext,1.);vec2 d=(q.xy/q.w-p.xy/p.w)*uViewport;d=normalize(d+vec2(.00001));p.xy+=vec2(-d.y,d.x)*aSide*uWidth/uViewport*p.w;gl_Position=p;vSide=aSide;vAlong=aAlong;}`;
 const fragment=`uniform float uReform,uPrimary,uTime,uOpacity;varying float vSide,vAlong;
 void main(){float pulse=pow(max(0.,1.-abs(vAlong-fract(uTime*.19))/.11),2.);float a=abs(vSide);float core=1.-smoothstep(.11,.32,a);float halo=exp(-7.*a*a)*.17;float green=smoothstep(vAlong*.30,.40+vAlong*.30,uReform);vec3 red=vec3(.85,.075,.16);vec3 color=mix(red,vec3(.30,.65,.43),green*uPrimary);color=mix(color,vec3(.92,.73,.44),pulse*.38);float fade=mix(1.,.035,smoothstep(.1,.88,uReform)*(1.-uPrimary));gl_FragColor=vec4(color,(core*.8+halo)*uOpacity*fade*(.72+.28*pulse));}`;
 function basic(color,extra={}){return own(new T.MeshStandardMaterial({color,roughness:.95,metalness:0,...extra}));}
 function mesh(geo,mat,pos,parent=root){const m=new T.Mesh(own(geo),mat);m.position.set(...pos);parent.add(m);return m;}
 function textureLabel(text,index){const c=document.createElement('canvas');c.width=512;c.height=160;const g=c.getContext('2d');g.fillStyle='#b59664';g.font='23px Georgia';g.fillText('0'+(index+1),26,40);g.fillStyle='#e5dbc7';g.font='42px Georgia';g.fillText(text,26,104);g.strokeStyle='#78613d';g.lineWidth=1;g.beginPath();g.moveTo(26,137);g.lineTo(300,137);g.stroke();const t=own(new T.CanvasTexture(c));t.colorSpace=T.SRGBColorSpace;return t;}
 function spriteTexture(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),a=g.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,'rgba(255,239,199,1)');a.addColorStop(.12,'rgba(255,230,179,.8)');a.addColorStop(.36,'rgba(223,178,101,.12)');a.addColorStop(1,'rgba(223,178,101,0)');g.fillStyle=a;g.fillRect(0,0,64,64);return own(new T.CanvasTexture(c));}
 function makePerson(){const g=new T.Group();g.name='citizen';g.userData.characterId='citizen';root.add(g);
 const m=own(new T.ShaderMaterial({vertexShader:`varying vec3 vN,vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 vN,vV;void main(){float rim=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.8);float lit=max(0.,dot(normalize(vN),normalize(vec3(-.7,1.,.5))));gl_FragColor=vec4(vec3(.055,.065,.082)+vec3(.24,.22,.17)*lit+vec3(.50,.43,.30)*rim*.7,1.);}`}));
 const torso=mesh(new T.CylinderGeometry(.22,.31,.92,20),m,[0,1.14,0],g);torso.scale.z=.6;
 const head=mesh(new T.SphereGeometry(.18,20,16),m,[0,1.89,-.01],g);head.scale.set(.87,1.18,.91);
 mesh(new T.CylinderGeometry(.075,.08,.18,10),m,[0,1.65,0],g);
 limbs=[];for(const x of [-.14,.14]){const p=new T.Group();p.position.set(x,.72,0);g.add(p);mesh(new T.CapsuleGeometry(.079,.53,4,10),m,[0,-.31,0],p);limbs.push(p);}
 for(const x of [-.29,.29]){const p=new T.Group();p.position.set(x,1.49,0);p.rotation.z=-Math.sign(x)*.08;g.add(p);mesh(new T.CapsuleGeometry(.067,.57,4,10),m,[0,-.30,0],p);limbs.push(p);}
 mesh(new T.BoxGeometry(.25,.34,.015),basic('#a2947a'),[.34,.85,-.11],g);g.scale.setScalar(.87);return g;}
 function makePath(from,to,via,primary,index){const a=new T.CatmullRomCurve3([start[from],...via,start[to]].map(p=>new T.Vector3(...p))).getPoints(96);
 const p=finish[from],q=finish[to],middle=[(p[0]+q[0])/2,2.10+(primary?0:.1*index),0];const b=new T.CatmullRomCurve3([p,middle,q].map(p=>new T.Vector3(...p))).getPoints(96);
 const positions=new Float32Array(97*6),next=new Float32Array(97*6),side=[],along=[],indices=[];for(let i=0;i<=96;i++){side.push(-1,1);along.push(i/96,i/96);if(i<96){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}}
 const geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('aNext',new T.BufferAttribute(next,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('aSide',new T.Float32BufferAttribute(side,1));geo.setAttribute('aAlong',new T.Float32BufferAttribute(along,1));geo.setIndex(indices);
 const uniforms={uViewport:{value:new T.Vector2(1600,900)},uWidth:{value:7},uReform:{value:0},uPrimary:{value:primary?1:0},uTime:{value:index*.27},uOpacity:{value:primary?1:.66}};
 const m=own(new T.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,side:T.DoubleSide}));const line=new T.Mesh(geo,m);line.frustumCulled=false;line.name='Thin light route '+names[from]+' to '+names[to];root.add(line);paths.push({a,b,positions,next,geo,uniforms,index,from,to,primary});}
 function apply(ctx,value){reform=value;for(const path of paths){const t=smooth(value);for(let i=0;i<=96;i++){const p=path.a[i].clone().lerp(path.b[i],t),j=Math.min(96,i+1),n=path.a[j].clone().lerp(path.b[j],t);if(i===96)n.copy(p).multiplyScalar(2).sub(path.a[95].clone().lerp(path.b[95],t));for(let k=0;k<2;k++){p.toArray(path.positions,i*6+k*3);n.toArray(path.next,i*6+k*3);}}path.geo.attributes.position.needsUpdate=true;path.geo.attributes.aNext.needsUpdate=true;path.uniforms.uReform.value=value;}
 stations.forEach((s,i)=>s.position.fromArray(start[i]).lerp(new T.Vector3(...finish[i]),smooth(value)));
 person.position.set(-4.35+smooth((value-.55)/.45)*.8,0,1.5-entry*.5);person.rotation.y=-.35;
 papers.forEach((p,i)=>{p.position.copy(stations[i+1].position);p.position.y-=.57;});ctx.invalidate();}
 function pose(ctx,wide=false){const narrow=ctx.size.width/ctx.size.height<1;return {position:narrow?[.5,4.8,29]:[.2,4.5,wide?15.4:14.5],target:[.5,1.8,0],fov:narrow?47:40};}
 const module={get animated(){return Boolean(transition);},setup(ctx){T=ctx.THREE;root=ctx.root;own=ctx.own;ctx.setBackground({color:'#070b13',fogNear:25,fogFar:60});ctx.setLighting({ambient:{color:'#b1b6c6',intensity:.45},directional:{color:'#edd6ad',intensity:1.1,position:[-3,7,4],castShadow:false},point:{color:'#c38457',intensity:5,position:[0,4,2],distance:18}});
 const dotTexture=spriteTexture();names.forEach((name,i)=>{const g=new T.Group();root.add(g);stations.push(g);const spr=new T.Sprite(own(new T.SpriteMaterial({map:dotTexture,color:'#edcf8e',transparent:true,depthWrite:false,blending:T.AdditiveBlending})));spr.scale.set(.32,.32,1);g.add(spr);const label=new T.Sprite(own(new T.SpriteMaterial({map:textureLabel(name,i),transparent:true,depthWrite:false})));label.scale.set(3.0,.94,1);label.position.set(1.15,.65,0);g.add(label);});
 person=makePerson();const paperMat=basic('#766e60');for(let i=0;i<3;i++){const g=new T.Group();root.add(g);papers.push(g);for(let j=0;j<3;j++){const p=mesh(new T.BoxGeometry(.42,.014,.29),paperMat,[j*.024,j*.034,0],g);p.rotation.y=j*.11;}}
 makePath(0,1,[[-1.9,3.7,.8],[.8,1.4,1.7],[-1.4,.9,-.5]],true,0);
 makePath(1,2,[[2.5,3.9,.6],[3.6,1.6,-1],[-1.2,1.4,1.3]],true,1);
 makePath(2,3,[[3.1,.1,1],[5.1,1.1,.3],[.7,3.1,-.6]],true,2);
 makePath(1,0,[[.2,4.8,-1.3],[-3.4,4.3,-.4],[-2.1,1.1,1.6]],false,3);
 makePath(2,1,[[4.4,2.5,1.8],[1.4,4.6,.4],[-1,1.7,-1]],false,4);
 makePath(3,1,[[5.7,3.8,-1.1],[2.7,4.3,-.8],[1.1,.4,1.5]],false,5);
 makePath(0,2,[[-2.2,.3,.5],[.2,.1,1],[3.2,3.4,-.9]],false,6);
 makePath(2,0,[[.4,2.7,1.8],[-2,4.2,.2],[-3.9,2.7,-.4]],false,7);
 makePath(1,1,[[1.1,3.8,.5],[2.3,2.3,1.3],[-.8,2.3,1]],false,8);
 const pos=[],seed=[];let n=812;for(let i=0;i<105;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;const x=n/4294967296;n=(Math.imul(n,1664525)+1013904223)>>>0;const y=n/4294967296;pos.push((x-.5)*24,(y-.4)*13,-2-i%11);seed.push(.2+(i%7)*.045);}
 const geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('aLight',new T.Float32BufferAttribute(seed,1));const m=own(new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:`attribute float aLight;varying float vL;void main(){vL=aLight;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=1.5;}`,fragmentShader:`varying float vL;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(.85,.86,.88,(1.-smoothstep(.05,.5,r))*vL);}`}));root.add(new T.Points(geo,m));apply(ctx,0);
 },activate(ctx){ctx.camera.reset(pose(ctx));},setBeat(index,ctx,meta={}){beat=index;clock=0;entry=index===0?0:1;const target=index>=2?1:0;if(index===0){apply(ctx,0);transition={kind:'enter',duration:2.3,from:0};}else if(index===1){apply(ctx,0);transition={kind:'trace',duration:3,from:0};}else if(index===2){if(meta.replay)apply(ctx,0);transition={kind:'reform',duration:4.6,from:reform};}else{transition=null;apply(ctx,1);}ctx.camera.moveTo(pose(ctx,index>=2),{duration:1800,signal:ctx.signal});if(ctx.reducedMotion||ctx.mode!=='webgl'){transition=null;entry=1;apply(ctx,target);onSettled(beat);}},update(dt,ctx){if(!transition||disposed)return;clock+=dt;const t=smooth(clock/transition.duration);if(transition.kind==='reform')apply(ctx,transition.from+(1-transition.from)*t);else if(transition.kind==='enter'){entry=t;apply(ctx,0);}for(const p of paths)p.uniforms.uTime.value=clock+p.index*.27;const step=Math.sin(clock*6)*.1*Math.sin(t*Math.PI);limbs[0].rotation.x=step;limbs[1].rotation.x=-step;if(t===1){transition=null;limbs.forEach(l=>l.rotation.x=0);onSettled(beat);}ctx.invalidate();},deactivate(){transition=null;},dispose(){transition=null;disposed=true;},drawFallback(g,ctx){const w=ctx.size.width,h=ctx.size.height;g.save();g.scale(w/1600,h/900);g.fillStyle='#070b13';g.fillRect(0,0,1600,900);g.lineWidth=1.5;g.strokeStyle=beat<2?'#96364b':'#77ae88';g.beginPath();g.moveTo(460,410);if(beat<2)g.bezierCurveTo(1250,60,350,700,1280,400);else g.lineTo(1280,410);g.stroke();g.font='24px Georgia';g.fillStyle='#dfd3bd';names.forEach((name,i)=>{g.fillText(name,420+i*235,360);g.beginPath();g.arc(460+i*235,410,3,0,7);g.fill();});g.fillStyle='#8c877d';g.beginPath();g.ellipse(350,460,11,15,0,0,7);g.fill();g.fillRect(340,480,20,65);g.restore();},getState:()=>({beat,reform,entry,animating:Boolean(transition),citizenId:'citizen',paths:paths.length,tubes:0,stations:names,disposed})};
 // Keep ribbon thickness stable after a resize, including while the scene holds.
 const setup=module.setup;module.setup=ctx=>{setup(ctx);for(const p of paths){p.uniforms.uViewport.value.set(ctx.size.width,ctx.size.height);}root.traverse(o=>{if(o.material?.uniforms?.uViewport)o.onBeforeRender=(renderer)=>{const s=renderer.getSize(new T.Vector2());o.material.uniforms.uViewport.value.copy(s);};});};
 return module;
}


