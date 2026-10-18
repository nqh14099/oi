/** Independent Three.js archive collection. Covers are original illustrations, not source-document facsimiles. */
export function createArchiveScene(sceneData) {
  let T,root,own,studio,beat=0,sizeKey='';const books=[],textures=[];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function canvasTexture(c,color=true){const t=own(new T.CanvasTexture(c));if(color)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;textures.push(t);return t;}
  function cover(index,existing=null){
    const c=existing?.image||document.createElement('canvas');c.width=1024;c.height=1536;const g=c.getContext('2d');
    const bg=['#dfd1b2','#582b36','#24333c'][index],ink=['#46392b','#e3cf9c','#e0cda3'][index],gold=['#8b7046','#b69a63','#b29b70'][index];
    g.fillStyle=bg;g.fillRect(0,0,1024,1536);
    let seed=2017+index;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    // Minute deterministic paper/cloth fibres, never a photographic claim.
    for(let i=0;i<65000;i++){g.fillStyle=rnd()>.5?'rgba(255,244,208,.06)':'rgba(20,12,9,.07)';const x=rnd()*1024,y=rnd()*1536;g.fillRect(x,y,index===0?1:3,index===0?2:1);}
    const shade=g.createLinearGradient(0,0,1024,0);shade.addColorStop(0,'#00000050');shade.addColorStop(.045,'#00000008');shade.addColorStop(.075,'#ffffff12');shade.addColorStop(.1,'#00000000');shade.addColorStop(.96,'#00000000');shade.addColorStop(1,'#0000001a');g.fillStyle=shade;g.fillRect(0,0,1024,1536);
    g.strokeStyle=gold;g.lineWidth=3;g.strokeRect(65,60,899,1416);g.lineWidth=1;g.strokeRect(78,73,873,1390);
    for(const [x,y,sx,sy]of [[90,85,1,1],[935,85,-1,1],[90,1450,1,-1],[935,1450,-1,-1]]){g.save();g.translate(x,y);g.scale(sx,sy);g.beginPath();g.moveTo(0,45);g.lineTo(0,0);g.lineTo(45,0);g.moveTo(8,28);g.quadraticCurveTo(28,28,28,8);g.stroke();g.restore();}
    g.textAlign='center';g.fillStyle=ink;g.font='23px Georgia';g.fillText('THE ARCHIVES OF REFORM',520,145);
    const heading=sceneData.beats[index].audience.heading.replace(/^\d{4}\s*·\s*/,'');
    g.font=`${index===0?112:78}px Georgia`;
    const lines=[];let line='';for(const word of heading.split(/\s+/)){const next=line?line+' '+word:word;if(line&&g.measureText(next).width>820){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
    lines.forEach((line,i)=>g.fillText(line,520,285+i*Math.min(94,170/Math.max(1,lines.length-1)),820));
    g.strokeStyle=gold;g.beginPath();g.moveTo(330,450);g.lineTo(710,450);g.stroke();g.save();g.translate(520,450);g.rotate(Math.PI/4);g.fillStyle=gold;g.fillRect(-5,-5,10,10);g.restore();
    // Original copperplate-style drawings: renewal of livelihoods, an ordered framework, and connected communities.
    g.save();g.beginPath();g.rect(140,520,760,650);g.clip();g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=1.7;
    if(index===0){
      g.beginPath();g.arc(520,690,118,Math.PI,0);g.stroke();
      for(let i=0;i<39;i++){const a=Math.PI+i*Math.PI/38;g.beginPath();g.moveTo(520+Math.cos(a)*132,690+Math.sin(a)*132);g.lineTo(520+Math.cos(a)*161,690+Math.sin(a)*161);g.stroke();}
      for(let j=0;j<30;j++){g.beginPath();for(let x=100;x<=940;x+=8){const y=725+j*14+Math.sin(x*.007+j*.07)*(24+j*1.3);if(x===100)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();}
      for(let k=0;k<7;k++){const x=220+k*97;g.beginPath();g.moveTo(x,1110);g.quadraticCurveTo(x+15,980,x+45,899);g.stroke();for(let j=0;j<8;j++){const y=935+j*16;g.beginPath();g.ellipse(x+28-j*1.5,y,14,4,-.7,0,Math.PI*2);g.stroke();}}
    }else if(index===1){
      for(let k=0;k<5;k++){const x=230+k*120,y=700+k*8;g.strokeRect(x,y,74,360-k*8);for(let n=0;n<9;n++){g.beginPath();g.moveTo(x+8+n*7,y+18);g.lineTo(x+8+n*7,1048);g.stroke();}g.strokeRect(x-10,y-18,94,18);g.strokeRect(x-14,1060,102,20);}
      g.beginPath();g.moveTo(170,675);g.lineTo(510,540);g.lineTo(850,675);g.closePath();g.stroke();for(let j=0;j<12;j++){g.beginPath();g.moveTo(180+j*11,670-j*3);g.lineTo(840-j*11,670-j*3);g.stroke();}
      for(let j=0;j<7;j++)g.strokeRect(170-j*7,1080+j*11,680+j*14,11);
    }else{
      for(let j=0;j<24;j++){g.beginPath();for(let x=110;x<930;x+=6){const y=985+j*8+Math.sin(x*.023+j*.4)*5;if(x===110)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();}
      g.lineWidth=3;g.beginPath();g.moveTo(140,950);g.bezierCurveTo(280,740,730,740,890,950);g.moveTo(150,985);g.bezierCurveTo(310,810,710,810,880,985);g.stroke();
      for(let j=0;j<=28;j++){const x=150+j*26,y=820+Math.pow((x-520)/370,2)*130;g.beginPath();g.moveTo(x,y-48);g.lineTo(x,y);g.stroke();}
      for(const x of [170,280,650,760]){g.strokeRect(x,700,76,110);g.beginPath();g.moveTo(x-12,700);g.lineTo(x+38,652);g.lineTo(x+88,700);g.stroke();for(let j=0;j<3;j++)g.strokeRect(x+12+j*19,726,11,28);}
      for(let j=0;j<12;j++){g.beginPath();g.moveTo(180,600+j*7);g.lineTo(850,600+j*7);g.stroke();}
    }
    g.restore();g.textAlign='center';g.fillStyle=ink;g.font='104px Georgia';g.fillText(sceneData.beats[index].label,520,1315);
    g.font='19px Georgia';g.fillText('VIETNAM · POLITICAL DEVELOPMENT',520,1390);if(existing){existing.needsUpdate=true;return existing;}return canvasTexture(c);
  }
  function box(w,h,d,material,p,parent){const m=new T.Mesh(own(new T.BoxGeometry(w,h,d)),material);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function pose(ctx){const mobile=ctx.size.width<ctx.size.height;ctx.camera.reset({projection:'perspective',position:mobile?[.25,1.4,20]:[.2,1.35,15.9],target:[0,.2,0],fov:mobile?39:35});}
  function arrange(ctx){
    const others=books.filter((_,i)=>i!==beat);
    books[beat].pivot.position.set(0,.0,1.25);books[beat].pivot.rotation.set(-.035,-.10,-.018);books[beat].pivot.scale.setScalar(1);
    others.forEach((b,i)=>{b.pivot.position.set(i===0?-3.2:3.2,-.10,-.22);b.pivot.rotation.set(-.045,i===0?.20:-.26,i===0?.105:-.09);b.pivot.scale.setScalar(.92);});
    ctx.invalidate();
  }
  return {setup(ctx){T=ctx.THREE;root=ctx.root;own=ctx.own;
    const paperCanvas=document.createElement('canvas');paperCanvas.width=256;paperCanvas.height=512;const g=paperCanvas.getContext('2d');g.fillStyle='#e2d6bc';g.fillRect(0,0,256,512);for(let y=0;y<512;y+=3){g.fillStyle=y%9?'#cabea5':'#aa9a7f';g.fillRect(0,y,256,1);}const pages=own(new T.MeshStandardMaterial({map:canvasTexture(paperCanvas),roughness:.92,metalness:0}));
    const grain=document.createElement('canvas');grain.width=grain.height=256;const gg=grain.getContext('2d'),img=gg.createImageData(256,256);let s=27;for(let i=0;i<img.data.length;i+=4){s=(Math.imul(s,1664525)+1013904223)>>>0;const v=110+(s>>>25);img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;}gg.putImageData(img,0,0);const bump=canvasTexture(grain,false);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(5,7);
    for(let i=0;i<3;i++){
      const pivot=new T.Group();root.add(pivot);const book={pivot,index:i,cover:null};books.push(book);
      const cloth=own(new T.MeshStandardMaterial({color:['#8c7252','#4e2430','#1b2b35'][i],roughness:.76,bumpMap:bump,bumpScale:.015,metalness:.04}));
      box(3.02,4.48,.48,pages,[.055,0,0],pivot);box(3.24,4.72,.085,cloth,[0,0,-.29],pivot);
      const hinge=new T.Group();hinge.position.set(-1.62,0,.29);pivot.add(hinge);book.cover=hinge;
      box(3.24,4.72,.085,cloth,[1.62,0,0],hinge);
      const face=own(new T.MeshStandardMaterial({map:cover(i),roughness:.76,metalness:.03,bumpMap:bump,bumpScale:.008}));
      book.face=face;book.signature=sceneData.beats[i].label+'|'+sceneData.beats[i].audience.heading;
      const print=new T.Mesh(own(new T.PlaneGeometry(3.22,4.70)),face);print.position.set(1.62,0,.044);hinge.add(print);
      const spine=new T.Mesh(own(new T.CylinderGeometry(.31,.31,4.72,28,1,false,Math.PI,Math.PI)),cloth);spine.position.set(-1.52,0,0);pivot.add(spine);
      const brass=own(new T.MeshStandardMaterial({color:'#a48a57',metalness:.8,roughness:.4}));
      for(const y of [-1.98,-1.83,1.83,1.98])box(.10,.025,.59,brass,[-1.58,y,0],pivot);
      // Independent page edge sheets preserve a readable thickness in grazing light.
      for(let j=0;j<9;j++)box(2.98,.013,.014,pages,[.055,-2.24+j*.003,-.20+j*.05],pivot);
    }
    // Feathered receiving plane, avoiding a visible rectangular stage under the books.
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sg=shadowCanvas.getContext('2d'),grad=sg.createRadialGradient(64,64,2,64,64,64);grad.addColorStop(0,'rgba(0,0,0,.65)');grad.addColorStop(1,'rgba(0,0,0,0)');sg.fillStyle=grad;sg.fillRect(0,0,128,128);
    const shadowMat=own(new T.MeshBasicMaterial({map:canvasTexture(shadowCanvas),transparent:true,depthWrite:false}));for(const x of [-3.2,0,3.2]){const m=new T.Mesh(own(new T.PlaneGeometry(4.8,3.5)),shadowMat);m.rotation.x=-Math.PI/2;m.position.set(x,-2.55,.4);root.add(m);}
    const rim=new T.DirectionalLight('#c4cedd',1.15);rim.position.set(5,4,-3);root.add(rim);
    },activate(ctx){ctx.setBackground({color:'#0c0c11',fogNear:35,fogFar:70});ctx.setLighting({ambient:{color:'#eee0cc',intensity:.60},directional:{color:'#ffeed8',intensity:2.1,position:[-4,7,8],castShadow:true},point:{color:'#b88857',intensity:12,position:[4,1,5],distance:20}});pose(ctx);sizeKey='';},
    setBeat(i,ctx){beat=i;arrange(ctx);},
    render(ctx,renderer,scene,camera){const key=ctx.size.width+':'+ctx.size.height;if(key!==sizeKey){sizeKey=key;pose(ctx);camera=ctx.camera.camera;}
      for(const book of books){const b=sceneData.beats[book.index],signature=b.label+'|'+b.audience.heading;if(signature!==book.signature){cover(book.index,book.face.map);book.signature=signature;}}
      if(!studio){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');g.fillStyle='#33303a';g.fillRect(0,0,512,256);g.fillStyle='#d8c7ac';g.fillRect(35,20,120,120);g.fillStyle='#9ca7b8';g.fillRect(340,35,50,105);const t=new T.CanvasTexture(c);t.mapping=T.EquirectangularReflectionMapping;t.colorSpace=T.SRGBColorSpace;const gen=new T.PMREMGenerator(renderer);studio=own(gen.fromEquirectangular(t));t.dispose();gen.dispose();for(const t of textures)t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
      const old=scene.environment;try{scene.environment=studio.texture;renderer.render(scene,camera);}finally{scene.environment=old;}
    },drawFallback(g,ctx){g.fillStyle='#0c0c11';g.fillRect(0,0,ctx.size.width,ctx.size.height);},
    getState:()=>({beat,selectedYear:sceneData.beats[beat].label,books:books.length,coverResolution:[1024,1536],staticComposition:true,environmentReady:!!studio}),dispose(){studio=null;}
  };
}
