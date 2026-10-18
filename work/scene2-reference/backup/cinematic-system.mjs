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
  function camera(ctx){const portrait=ctx.size.width<ctx.size.height;ctx.camera.reset({projection:'perspective',position:portrait?[8.5,9.5,23.5]:[6.6,7.6,19.5],target:[0,.9,0],fov:portrait?38:35});}
  function apply(ctx){
    for(const [name,g]of Object.entries(groups)){const active=beat===0?name==='party':beat===1?['state','front','organisations'].includes(name):name==='people';g.userData.active=active;}
    surfaces.wine.emissive.set(beat===0?'#2d080d':'#100307');surfaces.wine.emissiveIntensity=.28;
    surfaces.ivory.emissive.set(beat===2?'#302615':'#000000');surfaces.ivory.emissiveIntensity=.12;
    ctx.invalidate();
  }
  return {
    setup(ctx){T=ctx.THREE;root=ctx.root;own=ctx.own;
      const material=(key,color,params={})=>surfaces[key]=own(new T.MeshPhysicalMaterial({color,roughness:.34,metalness:.65,envMapIntensity:.8,...params}));
      material('basalt','#151b26',{roughness:.53,metalness:.34});material('brass','#b99a64',{roughness:.29,metalness:.88});
      material('wine','#631e31',{roughness:.28,metalness:.48,clearcoat:.6,clearcoatRoughness:.28});
      material('ivory','#e5dac3',{roughness:.35,metalness:.12,clearcoat:.25});
      material('glass','#b8c0cd',{roughness:.12,metalness:0,transmission:.78,thickness:.6,ior:1.45,transparent:false});
      // A single oblique exhibition ground binds the institutions spatially, without arrows of authority.
      block(11.8,.32,7.3,surfaces.basalt,[0,-.35,0]);block(11.86,.04,7.36,surfaces.brass,[0,-.49,0]);
      const party=pedestal('party',[-.4,0,-2.1],2.3,1.5);
      // A folded wine-red monolith with a brass reveal: leadership as an organising presence.
      const blade=block(1.75,3.15,.4,surfaces.wine,[-.28,1.80,0],party);blade.rotation.z=-.075;
      const fold=block(.58,3.15,.38,surfaces.wine,[.84,1.80,.30],party);fold.rotation.y=-.75;
      rail([[-1.01,.25,.26],[-1.12,2.85,.26],[-.86,3.38,.26],[.53,3.38,.26],[1.04,3.05,.57]],.035,surfaces.brass,party);
      const state=pedestal('state',[-3.65,0,.1],2.25,1.8);
      for(const x of [-.74,0,.74]){block(.25,1.72,.75,surfaces.brass,[x,1.16,0],state);block(.35,.1,.85,surfaces.brass,[x,.30,0],state);}
      block(2.05,.25,1.0,surfaces.basalt,[0,2.12,0],state);block(2.12,.05,1.06,surfaces.brass,[0,2.27,0],state);
      const front=pedestal('front',[3.15,0,-1.40],1.95,1.55);
      // Open, interlocking bent members: participation, not an ornamental ring.
      for(let i=0;i<3;i++){const x=(i-1)*.5;rail([[x,.25,.3],[x-.3,1.35,-.08],[x+.15,2.3,-.25],[x+.55,2.35,.18],[x+.72,1.05,.48]],.105,i===1?surfaces.wine:surfaces.brass,front);}
      const organisations=pedestal('organisations',[3.85,0,2.05],2.1,1.65);
      for(let i=0;i<3;i++){const x=(i-1)*.53,h=[1.15,1.72,1.35][i];block(.34,h,.63,surfaces.glass,[x,.26+h/2,(i-1)*.2],organisations);block(.05,h,.68,surfaces.brass,[x-.20,.26+h/2,(i-1)*.2],organisations);}
      pedestal('people',[-.15,0,1.5],2.7,2.0);human(0,.15,1.12);human(-.75,-.27,.8);human(.75,-.27,.8);
      // Ground-level conduits convey common connection only; no invented directed reporting chain.
      for(const p of [[-.4,0,-2.1],[-3.65,0,.1],[3.15,0,-1.4],[3.85,0,2.05]])rail([[p[0],-.12,p[2]],[p[0]*.72,-.12,p[2]*.62],[0,-.12,1.0]],.018,surfaces.brass);
      anchors.party=[-.4,3.8,-2.1];anchors.state=[-4.1,2.65,.1];anchors.front=[3.35,2.95,-1.4];anchors.organisations=[4.35,.15,3.1];anchors.people=[-.2,.25,3.05];
      const key=own(new T.SpotLight('#ffe2b2',155,30,.65,.75,2));key.position.set(-5,8,5);key.target.position.set(0,0,0);root.add(key,key.target);
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
