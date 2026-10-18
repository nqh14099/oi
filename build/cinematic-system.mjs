/** Scene 2 hybrid exhibition. The empty hall is an authored environment plate;
 * all five subjects, podiums, bridges, shadows and their reflections are real geometry.
 * Fixed camera registration is intentional; no free-orbit/parallax is claimed. */
export function createPoliticalSystemScene() {
  let T,root,own,ctxRef,beat=0,studio=null,plate=null,plateImage=null,plateReady=false,lastSize='',sculptures=null;
  let floor,reflection=null,reflectionCamera,reflectionMatrix,reflectionCount=0,meshCount=0;
  const surfaces={},extras=[],crop={x:1,y:1,ox:0,oy:0};
  const make=(g,m,p,parent=root)=>{const o=new T.Mesh(own(g),m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);meshCount++;return o;};
  function texture(kind){
    const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d'),im=g.createImageData(512,512);let seed=27;
    const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const i=(y*512+x)*4,n=rnd();let v;
      if(kind==='weave')v=128+(x%3===0?22:0)+(y%3===0?-18:0)+(n-.5)*15;
      else if(kind==='brush')v=145+Math.sin(y*2.8)*10+(n-.5)*20;
      else{const vein=Math.abs(Math.sin(x*.028+y*.018+Math.sin(y*.023)*1.9+Math.sin(x*.017)*.9));v=35+Math.pow(vein,32)*95+(n-.5)*9;}
      im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;
    }g.putImageData(im,0,0);const t=own(new T.CanvasTexture(c));t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='weave'?3:2,kind==='weave'?4:2);t.anisotropy=4;return t;
  }
  function materials(){
    const brush=texture('brush'),weave=texture('weave'),stone=texture('stone');
    const mat=(name,color,params={})=>surfaces[name]=own(new T.MeshPhysicalMaterial({color,roughness:.36,metalness:.1,envMapIntensity:1,...params}));
    mat('brass','#d0a66a',{metalness:.96,roughness:.53,roughnessMap:brush,bumpMap:brush,bumpScale:.002,clearcoat:.12});
    mat('darkgold','#977047',{metalness:.93,roughness:.34,bumpMap:brush,bumpScale:.002});
    mat('basalt','#15171d',{metalness:.25,roughness:.24,bumpMap:stone,bumpScale:.018,clearcoat:.65,clearcoatRoughness:.22});
    mat('panel','#141015',{roughness:.35,metalness:.3,bumpMap:stone,bumpScale:.008});
    mat('wine','#57111e',{metalness:0,roughness:.78,bumpMap:weave,bumpScale:.007,sheen:1,sheenColor:new T.Color('#a73d42'),sheenRoughness:.65,side:T.DoubleSide});
    mat('ivory','#dfcba5',{roughness:.46,metalness:0,bumpMap:stone,bumpScale:.0015});
    mat('stone','#c7b291',{roughness:.53,metalness:0,bumpMap:stone,bumpScale:.003});
    mat('glass','#aab1ba',{roughness:.16,metalness:.08,transparent:true,opacity:.15,depthWrite:false,side:T.DoubleSide});
    surfaces.veil=surfaces.glass;
  }
  function rail(points,r=.03,parent=root,material=surfaces.brass){return make(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),64,r,8,false),material,[0,0,0],parent);}
  function platformRing(radius,y,parent=root){const m=make(new T.TorusGeometry(radius,.032,10,160),surfaces.brass,[0,y,0],parent);m.rotation.x=Math.PI/2;return m;}
  function environment(){
    // Only near-field elements need geometry. The plate supplies the distant architecture.
    for(const r of [6.2,8.0]){platformRing(r,-.16);platformRing(r+.12,-.16);}
    for(const side of [-1,1]){
      rail([[side*1.65,3.65,-2.65],[side*3.1,3.26,-2.0],[side*4.3,.65,-.25]],.065);
      rail([[side*1.65,3.77,-2.65],[side*3.1,3.38,-2.0],[side*4.3,.77,-.25]],.018);
      rail([[side*4.3,.54,.2],[side*3.7,.5,1.65],[side*2.6,.55,2.8],[0,.55,3.95]],.055);
    }
    // Raised bronze inner wall grounds the citizens and establishes contact with the glass.
    for(const x of [-1.45,1.45])rail([[x,.62,3.0],[x,.62,2.7]],.035);
    // Generalised source outline: a sculptural decorative map, never administrative evidence.
    const mapGroup=new T.Group();mapGroup.position.set(7.5,4.05,-5.65);mapGroup.scale.setScalar(1.52);root.add(mapGroup);
    for(const poly of SYSTEM_MAP){const sh=new T.Shape();poly.forEach(([x,y],i)=>i?sh.lineTo((x-106)*.18,(y-16)*.18):sh.moveTo((x-106)*.18,(y-16)*.18));sh.closePath();make(new T.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:false}),surfaces.darkgold,[0,0,0],mapGroup);}
    const frame=new T.Group();frame.position.set(7.5,4.05,-5.8);root.add(frame);
    for(const x of [-1.3,1.3])rail([[x,-2.0,0],[x,2.0,0]],.022,frame);
    for(const y of [-2,2])rail([[-1.3,y,0],[1.3,y,0]],.022,frame);
  }
  function contact(){
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gradient=g.createRadialGradient(64,64,12,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.7)');gradient.addColorStop(.65,'rgba(0,0,0,.4)');gradient.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gradient;g.fillRect(0,0,128,128);
    const t=own(new T.CanvasTexture(c)),m=own(new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:.65}));
    for(const [x,z,r]of [[0,1.6,2.6],[-4.25,-.1,2.15],[4.1,-.65,1.8],[4.6,3.8,2.05]]){const o=make(new T.PlaneGeometry(r*2,r*2),m,[x,-.325,z]);o.rotation.x=-Math.PI/2;o.castShadow=false;}
  }
  function floorGeometry(){
    reflectionMatrix=new T.Matrix4();
    const uniforms={uPlate:{value:null},uReflection:{value:null},uMatrix:{value:reflectionMatrix},uResolution:{value:new T.Vector2(1600,900)},uCrop:{value:new T.Vector4(1,1,0,0)},uReady:{value:0},uReflect:{value:0}};
    const material=own(new T.ShaderMaterial({uniforms,vertexShader:`varying vec4 vReflection;uniform mat4 uMatrix;void main(){vec4 w=modelMatrix*vec4(position,1.);vReflection=uMatrix*w;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader:`uniform sampler2D uPlate;uniform sampler2D uReflection;uniform vec2 uResolution;uniform vec4 uCrop;uniform float uReady,uReflect;varying vec4 vReflection;
      #include <tonemapping_pars_fragment>
      #include <colorspace_pars_fragment>
      void main(){vec2 uv=gl_FragCoord.xy/uResolution;vec2 p=uv*uCrop.xy+uCrop.zw;vec3 base=mix(vec3(.009,.009,.012),texture2D(uPlate,p).rgb,uReady);vec2 q=vReflection.xy/vReflection.w;vec3 reflected=texture2D(uReflection,q).rgb;reflected+=texture2D(uReflection,q+vec2(.0015,.0007)).rgb;reflected+=texture2D(uReflection,q-vec2(.0015,.0007)).rgb;reflected/=3.;float valid=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);gl_FragColor=vec4(base+reflected*.30*valid*uReflect,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,depthWrite:true}));
    floor=make(new T.PlaneGeometry(90,100),material,[0,-.35,-10]);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
    contact();
  }
  function lighting(ctx){
    ctx.setLighting({ambient:{color:'#c1a88c',intensity:.22},directional:{color:'#ffdfb3',intensity:2.1,position:[-3.5,8,5],castShadow:true},point:{color:'#f8b979',intensity:25,position:[3.5,3,-1],distance:16}});
    const dir=ctx.lights.directional;Object.assign(dir.shadow.camera,{left:-9,right:9,top:10,bottom:-6,near:.5,far:40});dir.shadow.camera.updateProjectionMatrix();dir.shadow.bias=-.00025;dir.shadow.normalBias=.025;
  }
  function camera(ctx){const portrait=ctx.size.width<ctx.size.height;ctx.camera.reset({projection:'perspective',position:portrait?[.3,8.2,24]:[.35,5.35,20.25],target:portrait?[.6,3,0]:[-1.4,3.05,0],fov:portrait?45:40});}
  function cropPlate(ctx){const a=ctx.size.width/ctx.size.height,ratio=16/9;crop.x=Math.min(1,a/ratio);crop.y=Math.min(1,ratio/a);crop.ox=(1-crop.x)/2;crop.oy=(1-crop.y)/2;if(plate){plate.repeat.set(crop.x,crop.y);plate.offset.set(crop.ox,crop.oy);plate.updateMatrix();}floor.material.uniforms.uCrop.value.set(crop.x,crop.y,crop.ox,crop.oy);}
  function highlights(ctx){for(const [name,g]of Object.entries(sculptures.groups)){g.userData.active=beat===0?name==='party':beat===1?['state','front','organisations'].includes(name):name==='people';}ctx.invalidate();}
  function ibl(renderer){
    // Broad studio sources with hall-coloured returns. No bright flat ambient blanket.
    const room=new T.Scene(),geometries=[],mats=[];room.background=new T.Color('#393029');
    const card=(p,s,color,intensity)=>{const g=new T.PlaneGeometry(...s),m=new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide});geometries.push(g);mats.push(m);const o=new T.Mesh(g,m);o.position.set(...p);o.lookAt(0,2,0);room.add(o);};
    card([0,4,11],[18,12],'#ead9bb',2.0);card([-5,7,6],[5,5],'#ffe2b7',4);card([5,4,-3],[2,7],'#ffb96a',3);card([1,9,0],[9,2],'#fce3c1',2.8);card([-4,1,-5],[2,5],'#67252b',.8);card([6,3,7],[3,4],'#8396a9',.7);
    const pm=new T.PMREMGenerator(renderer);const rt=own(pm.fromScene(room,.04,.1,50));pm.dispose();geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());return rt;
  }
  return {
    setup(ctx){T=ctx.THREE;root=ctx.root;own=ctx.own;ctxRef=ctx;materials();
      sculptures=createSystemSculptures({THREE:T,root,own,materials:surfaces,emblemContours:EMBLEM_CONTOURS});
      sculptures.groups.party.scale.set(1.28,1.35,1.05);sculptures.groups.party.position.y=.1;
      sculptures.groups.state.scale.setScalar(1.05);
      sculptures.groups.front.scale.setScalar(1.08);
      meshCount=sculptures.meshCount;environment();floorGeometry();
      const add=(type,color,intensity,p,target)=>{const l=own(type==='spot'?new T.SpotLight(color,intensity,26,.65,.8,2):new T.DirectionalLight(color,intensity));l.position.set(...p);if(target){l.target.position.set(...target);root.add(l.target);}root.add(l);extras.push(l);return l;};
      add('spot','#ffd198',210,[-3,9,5],[0,1,0]);add('directional','#f8bf76',2.4,[4,5,-4]);add('directional','#b0bdc8',.38,[-5,4,7]);
      plateImage=new Image();plate=own(new T.Texture(plateImage));plate.colorSpace=T.SRGBColorSpace;
      plateImage.onload=()=>{plateReady=true;plate.needsUpdate=true;floor.material.uniforms.uPlate.value=plate;floor.material.uniforms.uReady.value=1;if(ctxRef?.isCurrent())ctxRef.invalidate();};plateImage.onerror=()=>{plateReady=false;};plateImage.src=SYSTEM_HALL_PLATE;
    },
    activate(ctx){ctxRef=ctx;ctx.setBackground({color:'#08090d'});lighting(ctx);camera(ctx);lastSize='';},
    setBeat(i,ctx){beat=i;highlights(ctx);},
    render(ctx,renderer,scene,cameraObject){
      const size=ctx.size.width+':'+ctx.size.height;if(size!==lastSize){lastSize=size;camera(ctx);cameraObject=ctx.camera.camera;cropPlate(ctx);}
      if(!studio)studio=ibl(renderer);
      root.updateMatrixWorld(true);cameraObject.updateMatrixWorld(true);
      for(const [key,point]of Object.entries(sculptures.anchors)){const el=document.querySelector('[data-system-label="'+key+'"]');if(!el)continue;const v=new T.Vector3(...point).project(cameraObject);el.style.setProperty('--sx',((v.x*.5+.5)*100)+'%');el.style.setProperty('--sy',((-v.y*.5+.5)*100)+'%');}
      const old={environment:scene.environment,background:scene.background,exposure:renderer.toneMappingExposure,target:renderer.getRenderTarget(),shadow:renderer.shadowMap.autoUpdate};
      try{
        scene.environment=studio.texture;scene.background=plateReady?plate:old.background;renderer.toneMappingExposure=.92;
        const drawing=new T.Vector2();renderer.getDrawingBufferSize(drawing);floor.material.uniforms.uResolution.value.copy(drawing);
        // Planar reflection: real object transforms remain reflected, including future animation.
        if(ctx.quality==='high'){
          const w=Math.min(1024,Math.round(ctx.size.width*.65)),h=Math.max(128,Math.round(w*ctx.size.height/ctx.size.width));
          if(!reflection){reflection=own(new T.WebGLRenderTarget(w,h,{depthBuffer:true}));reflectionCamera=cameraObject.clone();}else if(reflection.width!==w||reflection.height!==h)reflection.setSize(w,h);
          reflectionCamera.copy(cameraObject);const direction=cameraObject.getWorldDirection(new T.Vector3()),target=cameraObject.position.clone().add(direction);reflectionCamera.position.y=-.70-cameraObject.position.y;target.y=-.70-target.y;reflectionCamera.up.copy(cameraObject.up);reflectionCamera.up.y*=-1;reflectionCamera.lookAt(target);reflectionCamera.updateMatrixWorld();
          reflectionMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(reflectionCamera.projectionMatrix).multiply(reflectionCamera.matrixWorldInverse);
          floor.visible=false;scene.background=new T.Color('#000000');renderer.setRenderTarget(reflection);renderer.clear();renderer.render(scene,reflectionCamera);reflectionCount++;floor.visible=true;renderer.setRenderTarget(old.target);scene.background=plateReady?plate:old.background;
          floor.material.uniforms.uReflection.value=reflection.texture;floor.material.uniforms.uReflect.value=1;renderer.shadowMap.autoUpdate=false;
        }else floor.material.uniforms.uReflect.value=0;
        renderer.render(scene,cameraObject);
      }finally{floor.visible=true;scene.environment=old.environment;scene.background=old.background;renderer.toneMappingExposure=old.exposure;renderer.shadowMap.autoUpdate=old.shadow;renderer.setRenderTarget(old.target);}
    },
    deactivate(){ctxRef=null;},
    drawFallback(g,ctx){g.fillStyle='#08090d';g.fillRect(0,0,ctx.size.width,ctx.size.height);if(plateReady)g.drawImage(plateImage,0,0,ctx.size.width,ctx.size.height);},
    getState:()=>({beat,meshes:meshCount,staticComposition:true,environmentReady:!!studio,plateReady,reflectionCount,hybrid:true,groups:sculptures?Object.keys(sculptures.groups):[],freeCamera:false}),
    dispose(){ctxRef=null;if(plateImage){plateImage.onload=plateImage.onerror=null;}studio=null;reflection=null;}
  };
}
