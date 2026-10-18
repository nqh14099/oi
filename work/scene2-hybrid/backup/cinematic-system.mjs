/** Scene 2: an authored, static museum installation; forms are symbolic, not buildings or an organogram. */
export function createPoliticalSystemScene() {
  let T,root,own,studio=null,beat=0,lastSize='',meshCount=0;
  const groups={},surfaces={},anchors={};
  function solid(geometry,material,position,parent=root){const m=new T.Mesh(own(geometry),material);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;parent.add(m);meshCount++;return m;}
  function block(w,h,d,material,p,parent=root,r=.08){
    const s=new T.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,steps:1,curveSegments:8});g.translate(0,0,-d/2);return solid(g,material,p,parent);
  }
  function rail(points,width,material,parent=root){return solid(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,width,8,false),material,[0,0,0],parent);}
  function pedestal(name,p,w,d){const group=new T.Group();group.position.set(...p);root.add(group);groups[name]=group;
    block(w,.18,d,surfaces.basalt,[0,.05,0],group);block(w+.04,.035,d+.04,surfaces.brass,[0,.16,0],group);return group;}
  function human(x,z,scale=1){const g=new T.Group();g.position.set(x,.42,z);g.scale.setScalar(scale);groups.people.add(g);
    const profile=[[.25,0],[.35,.07],[.33,.55],[.28,.98],[.19,1.22],[.12,1.28]].map(([r,y])=>new T.Vector2(r,y));
    solid(new T.LatheGeometry(profile,40),surfaces.ivory,[0,0,0],g);
    solid(new T.SphereGeometry(.235,32,24),surfaces.ivory,[0,1.57,0],g);
    rail([[-.23,1.05,0],[-.42,.72,.04],[-.40,.44,.12]],.09,surfaces.ivory,g);
    rail([[.23,1.05,0],[.42,.72,.04],[.40,.44,.12]],.09,surfaces.ivory,g);
  }
  function camera(ctx){const portrait=ctx.size.width<ctx.size.height;ctx.camera.reset({projection:'perspective',position:portrait?[1,8,24]:[.8,6.8,23],target:portrait?[0,2,0]:[-1.5,2.4,0],fov:portrait?44:38});}
  function apply(ctx){
    for(const [name,g]of Object.entries(groups)){const active=beat===0?name==='party':beat===1?['state','front','organisations'].includes(name):name==='people';g.userData.active=active;}
    surfaces.wine.emissive.set(beat===0?'#2d080d':'#100307');surfaces.wine.emissiveIntensity=.28;
    surfaces.ivory.emissive.set(beat===2?'#302615':'#000000');surfaces.ivory.emissiveIntensity=.12;
    ctx.invalidate();
  }
  return {
    setup(ctx){T=ctx.THREE;root=ctx.root;own=ctx.own;
      const material=(key,color,params={})=>surfaces[key]=own(new T.MeshPhysicalMaterial({color,roughness:.34,metalness:.65,envMapIntensity:.8,...params}));
      material('basalt','#080b10',{roughness:.36,metalness:.65});material('brass','#b99a64',{roughness:.29,metalness:.88});
      material('wine','#631e31',{roughness:.28,metalness:.48,clearcoat:.6,clearcoatRoughness:.28});
      material('ivory','#e5dac3',{roughness:.35,metalness:.12,clearcoat:.25});
      material('glass','#b8c0cd',{roughness:.12,metalness:0,transmission:.78,thickness:.6,ior:1.45,transparent:false});

      // A museum installation: podiums connect a shared purpose, not invented reporting lines.
      const cyl=(r,h,m,p,parent=root)=>solid(new T.CylinderGeometry(r,r,h,96),m,p,parent);
      const ring=(r,y,parent=root)=>{const m=solid(new T.TorusGeometry(r,.025,8,128),surfaces.brass,[0,y,0],parent);m.rotation.x=Math.PI/2;return m;};
      const dais=(name,p,r)=>{const g=new T.Group();g.position.set(...p);root.add(g);groups[name]=g;cyl(r+.18,.14,surfaces.brass,[0,.02,0],g);cyl(r,.42,surfaces.basalt,[0,.28,0],g);cyl(r+.04,.055,surfaces.brass,[0,.51,0],g);ring(r-.08,.55,g);return g;};
      material('stone','#bba17a',{roughness:.38,metalness:.32});
      material('darkgold','#645033',{roughness:.36,metalness:.83});
      material('panel','#170e14',{roughness:.35,metalness:.45});
      material('veil','#a79375',{transparent:true,opacity:.075,transmission:0,depthWrite:false,side:T.DoubleSide,roughness:.18});
      // Reflective architectural floor and an enclosing wall with tall brass reveals.
      material('floor','#080b10',{roughness:.4,metalness:.45,envMapIntensity:.12});
      block(35,.18,30,surfaces.floor,[0,-.55,-3]);
      for(let i=-6;i<=6;i++){
        const x=i*2.1;block(1.94,12,.35,surfaces.panel,[x,5.2,-6.4]);
        block(.055,12,.06,surfaces.darkgold,[x-.97,5.2,-6.17]);
        block(.055,12,.06,surfaces.brass,[x+.97,5.2,-6.17]);
        if(i%2===0){const curtain=new T.PlaneGeometry(1.4,11,24,1),a=curtain.attributes.position;for(let j=0;j<a.count;j++)a.setZ(j,.15*Math.cos(a.getX(j)*19));curtain.computeVertexNormals();solid(curtain,surfaces.wine,[x,5,-5.95]);}
      }
      for(const r of [5.8,7.7,9.5]){ring(r,-.41);ring(r+.07,-.41);}
      const people=dais('people',[0,0,1.6],2.15);
      human(0,.42,1.02);human(-.66,.22,.86);human(.66,.2,.86);human(-1.04,-.45,1.08);human(1.02,-.5,1.04);
      // Thin glass wings, open at the front so the citizens remain unobscured.
      solid(new T.CylinderGeometry(1.95,1.95,2.5,80,1,true,Math.PI/2,Math.PI),surfaces.veil,[0,1.8,0],people);
      for(const x of [-1.93,1.93])rail([[x,.55,0],[x,3.02,0]],.015,surfaces.brass,people);
      // Generalised geographic silhouette, reused from the local map source; not a boundary exhibit.
      const mapGold=own(new T.MeshStandardMaterial({color:'#e6ac55',metalness:.55,roughness:.32,emissive:'#b16b1f',emissiveIntensity:.26}));
      const relief=new T.Group();relief.position.set(8.2,4,-5.7);relief.scale.setScalar(1.45);root.add(relief);
      for(const poly of SYSTEM_MAP){const shape=new T.Shape();poly.forEach(([x,y],i)=>{const px=(x-106)*.18,py=(y-16)*.18;i?shape.lineTo(px,py):shape.moveTo(px,py);});shape.closePath();solid(new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),mapGold,[0,0,0],relief);}
      // Suspended leadership banner. The emblem mask reuses the approved CPV contour.
      const party=new T.Group();party.position.set(0,0,-2.65);root.add(party);groups.party=party;
      const banner=new T.PlaneGeometry(3.5,3.55,48,32),a=banner.attributes.position;
      for(let j=0;j<a.count;j++){const x=a.getX(j),y=a.getY(j);a.setZ(j,.10*Math.sin(x*4.4)+.055*Math.cos(y*3+x));}banner.computeVertexNormals();
      solid(banner,surfaces.wine,[0,4.65,0],party);
      for(const x of [-1.8,1.8])rail([[x,2.84,.10],[x,6.5,.10]],.025,surfaces.brass,party);
      for(const y of [2.86,6.45])rail([[-1.91,y,.1],[0,y+.035,.1],[1.91,y,.1]],.035,surfaces.brass,party);
      for(const x of [-1.65,1.65])rail([[x,6.47,0],[x,10,-.4]],.012,surfaces.brass,party);
      for(const points of EMBLEM_CONTOURS){const shape=new T.Shape();points.forEach(([x,y],i)=>{const px=(x-.5)*3.6,py=(.5-y)*2.4;i?shape.lineTo(px,py):shape.moveTo(px,py);});shape.closePath();const m=solid(new T.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:12}),surfaces.brass,[0,5.38,.18],party);}
      // A classical civic building, an architectural metaphor rather than a named real building.
      const state=dais('state',[-4.25,0,-.1],1.6);
      for(let i=0;i<4;i++)block(2.7-i*.18,.12,1.65-i*.13,surfaces.stone,[0,.62+i*.12,.1],state);
      block(2.2,1.55,.8,surfaces.stone,[0,1.65,-.28],state);
      for(const x of [-.99,-.60,-.2,.2,.60,.99]){
        solid(new T.CylinderGeometry(.085,.12,1.4,24),surfaces.stone,[x,1.72,.48],state);
        block(.24,.12,.26,surfaces.brass,[x,2.45,.48],state);block(.22,.12,.24,surfaces.stone,[x,1.02,.48],state);
      }
      block(2.55,.18,1.45,surfaces.stone,[0,2.57,0],state);
      const pediment=new T.Shape();pediment.moveTo(-1.38,0);pediment.lineTo(0,.67);pediment.lineTo(1.38,0);pediment.closePath();
      solid(new T.ExtrudeGeometry(pediment,{depth:1.3,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:2}),surfaces.stone,[0,2.68,-.65],state);
      rail([[-1.4,2.7,.7],[0,3.36,.7],[1.4,2.7,.7]],.035,surfaces.brass,state);
      // Lotus sculpture denotes participation; it is not presented as an official institutional emblem.
      const front=dais('front',[4.1,0,-.65],1.45);
      for(let i=-2;i<=2;i++){
        const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.48,.52,-.48,1.15,0,1.7);shape.bezierCurveTo(.48,1.15,.48,.52,0,0);
        const petal=solid(new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.055,bevelThickness:.055,bevelSegments:3,curveSegments:24}),surfaces.brass,[i*.17,.75,Math.abs(i)*.12],front);petal.rotation.z=-i*.38;
      }
      cyl(.53,.12,surfaces.brass,[0,.66,0],front);
      const org=dais('organisations',[4.6,0,3.8],1.65);
      // Neutral reliefs avoid fabricating official organisation logos.
      for(let i=0;i<4;i++){const x=(i-1.5)*.68,z=.08*Math.abs(i-1.5);const m=solid(new T.CylinderGeometry(.33,.33,.10,48),surfaces.darkgold,[x,1.08,z],org);m.rotation.x=Math.PI/2;
        const rim=solid(new T.TorusGeometry(.31,.018,8,64),surfaces.brass,[x,1.08,z+.07],org);
        solid(new T.SphereGeometry(.07,16,12),surfaces.ivory,[x,1.17,z+.09],org);block(.14,.2,.07,surfaces.brass,[x,.99,z+.09],org,.06);
      }
      for(const side of [-1,1])rail([[side*1.7,3.15,-2.6],[side*3,2.8,-2],[side*4.2,.62,-.1]],.045,surfaces.brass);
      for(const x of [-4.25,4.1])rail([[x,.52,0],[x*.8,.47,1.6],[x*.4,.52,2.7],[0,.52,3.4]],.04,surfaces.brass);
      anchors.party=[0,4.15,-2.35];anchors.state=[-4.4,.35,1.4];anchors.front=[4.4,.4,.8];anchors.organisations=[4.6,.3,5.2];anchors.people=[0,.25,3.8];
      const key=own(new T.SpotLight('#ffe2b2',155,30,.65,.75,2));key.position.set(-5,8,5);key.target.position.set(0,0,0);root.add(key,key.target);
      const symbolLight=own(new T.PointLight('#ffd496',24,8,2));symbolLight.position.set(0,6,1);root.add(symbolLight);
      const rim=own(new T.DirectionalLight('#8797bf',1.9));rim.position.set(4,5,-5);root.add(rim);
    },
    activate(ctx){ctx.setBackground({color:'#070b12',fogNear:30,fogFar:65});ctx.setLighting({ambient:{color:'#b5b7cb',intensity:.35},directional:{color:'#ffe3b8',intensity:2.0,position:[-5,9,6],castShadow:true},point:{color:'#9f495e',intensity:20,position:[0,4,-4],distance:20}});camera(ctx);lastSize='';},
    setBeat(i,ctx){beat=i;apply(ctx);},
    render(ctx,renderer,scene,cameraObject){
      const size=ctx.size.width+':'+ctx.size.height;if(size!==lastSize){lastSize=size;camera(ctx);cameraObject=ctx.camera.camera;}
      if(!studio){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');g.fillStyle='#161b29';g.fillRect(0,0,512,256);g.fillStyle='#ead9bb';g.fillRect(45,28,85,125);g.fillStyle='#8496af';g.fillRect(320,30,40,150);g.fillStyle='#626c7c';g.fillRect(180,0,130,22);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer);studio=own(pm.fromEquirectangular(t));pm.dispose();t.dispose();}
      root.updateMatrixWorld(true);cameraObject.updateMatrixWorld(true);
      for(const [key,p]of Object.entries(anchors)){const el=document.querySelector(`[data-system-label="${key}"]`);if(!el)continue;const v=new T.Vector3(...p).project(cameraObject);el.style.setProperty('--sx',`${(v.x*.5+.5)*100}%`);el.style.setProperty('--sy',`${(-v.y*.5+.5)*100}%`);}
      const old=scene.environment;try{scene.environment=studio.texture;renderer.render(scene,cameraObject);}finally{scene.environment=old;}
    },
    drawFallback(g,ctx){g.fillStyle='#070b12';g.fillRect(0,0,ctx.size.width,ctx.size.height);},
    getState:()=>({beat,meshes:meshCount,staticComposition:true,environmentReady:!!studio}),
    dispose(){studio=null;}
  };
}
