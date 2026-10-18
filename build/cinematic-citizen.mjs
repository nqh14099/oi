// Shared sculpted citizen. Procedural geometry keeps the model self-contained.
export function createCitizenFigure({THREE:T,own,paperMaterial}={}){
 const person=new T.Group();person.name='citizen';person.userData.characterId='citizen';person.userData.design='ivory-reader';
 const skin=own(new T.MeshPhysicalMaterial({color:'#e5e5d8',roughness:.48,metalness:0,clearcoat:.12,clearcoatRoughness:.55,emissive:'#e5e1d2',emissiveIntensity:.025}));
 // A broad cool fill shapes the ivory material without brightening the surrounding scene.
 function studioFill(shader){shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
 float citizenSoftKey=.35+.65*max(0.,dot(normalize(normal),normalize(vec3(.45,.80,.90))));
 outgoingLight+=diffuseColor.rgb*vec3(.13,.22,.24)*pow(citizenSoftKey,1.4);
 #include <opaque_fragment>`);}
 skin.onBeforeCompile=studioFill;skin.customProgramCacheKey=()=> 'citizen-ivory-studio-v1';
 const ink=own(new T.MeshStandardMaterial({color:'#13222a',roughness:.34,metalness:0}));
 const cover=own(new T.MeshStandardMaterial({color:'#718985',roughness:.72,metalness:0,side:T.DoubleSide}));
 const paper=paperMaterial??own(new T.MeshStandardMaterial({color:'#eef0df',roughness:.86,metalness:0,side:T.DoubleSide}));
 function add(geometry,material,position=[0,0,0],parent=person){const mesh=new T.Mesh(own(geometry),material);mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 const blend=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
 function ellipsoid(x,y,z,cx,cy,cz,rx,ry,rz){x-=cx;y-=cy;z-=cz;const k0=Math.hypot(x/rx,y/ry,z/rz),k1=Math.hypot(x/(rx*rx),y/(ry*ry),z/(rz*rz));return k1>1e-9?k0*(k0-1)/k1:-Math.min(rx,ry,rz);}
 const arms=[];
 for(const side of [-1,1]){
  const curve=new T.CatmullRomCurve3([new T.Vector3(side*.30,.97,.015),new T.Vector3(side*.43,.81,.025),new T.Vector3(side*.475,.63,.16),new T.Vector3(side*.40,.62,.40)]).getPoints(7);
  for(let i=0;i<7;i++){const a=curve[i],d=curve[i+1].clone().sub(a);arms.push({x:a.x,y:a.y,z:a.z,dx:d.x,dy:d.y,dz:d.z,l:d.lengthSq(),r:.113-i*.001});}
 }
 function field(x,y,z){
  let d=ellipsoid(x,y,z,0,.66,-.02,.345,.48,.265);d=blend(d,ellipsoid(x,y,z,0,.47,0,.385,.30,.295),.12);
  for(const side of [-1,1])d=blend(d,ellipsoid(x,y,z,side*.205,.28,.04,.185,.30,.23),.075);
  for(const a of arms){const px=x-a.x,py=y-a.y,pz=z-a.z,t=Math.max(0,Math.min(1,(px*a.dx+py*a.dy+pz*a.dz)/a.l));d=blend(d,Math.hypot(px-t*a.dx,py-t*a.dy,pz-t*a.dz)-a.r,.055);}
  return Math.max(d,.018-y);
 }
 // Marching tetrahedra plus analytical-field normals avoid visible capsule joints.
 function sculptBody(){
  const nx=44,ny=48,nz=34,min=[-.63,0,-.37],max=[.63,1.20,.56],dx=(max[0]-min[0])/nx,dy=(max[1]-min[1])/ny,dz=(max[2]-min[2])/nz;
  const at=(x,y,z)=>(z*(ny+1)+y)*(nx+1)+x,values=new Float32Array((nx+1)*(ny+1)*(nz+1));
  for(let z=0;z<=nz;z++)for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++)values[at(x,y,z)]=field(min[0]+x*dx,min[1]+y*dy,min[2]+z*dz);
  const offsets=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tetrahedra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],vertices=[],normals=[],eps=.001;
  function gradient(p){const [x,y,z]=p,n=[field(x+eps,y,z)-field(x-eps,y,z),field(x,y+eps,z)-field(x,y-eps,z),field(x,y,z+eps)-field(x,y,z-eps)],length=Math.hypot(...n)||1;return n.map(v=>v/length);}
  function triangle(a,b,c){const na=gradient(a),nb=gradient(b),nc=gradient(c),ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]);const cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];if(cross.reduce((sum,v,i)=>sum+v*na[i],0)<0){vertices.push(...a,...c,...b);normals.push(...na,...nc,...nb);}else{vertices.push(...a,...b,...c);normals.push(...na,...nb,...nc);}}
  for(let z=0;z<nz;z++)for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
   const v=offsets.map(([a,b,c])=>values[at(x+a,y+b,z+c)]);if(v.every(a=>a>=0)||v.every(a=>a<0))continue;
   const p=offsets.map(([a,b,c])=>[min[0]+(x+a)*dx,min[1]+(y+b)*dy,min[2]+(z+c)*dz]);const cut=(a,b)=>{const t=v[a]/(v[a]-v[b]);return p[a].map((n,i)=>n+(p[b][i]-n)*t);};
   for(const tetra of tetrahedra){const inside=tetra.filter(i=>v[i]<0),outside=tetra.filter(i=>v[i]>=0);if(inside.length===1)triangle(...outside.map(i=>cut(inside[0],i)));else if(inside.length===3)triangle(...inside.map(i=>cut(outside[0],i)));else if(inside.length===2){const a=cut(inside[0],outside[0]),b=cut(inside[0],outside[1]),c=cut(inside[1],outside[0]),d=cut(inside[1],outside[1]);triangle(a,b,c);triangle(b,d,c);}}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.computeBoundingSphere();return geo;
 }
 // Retain the walk-controller API; the continuous mesh deforms instead of exposing joints.
 const limbs=Array.from({length:4},(_,i)=>{const pivot=new T.Object3D();pivot.name='citizen-gait-'+i;person.add(pivot);return pivot;});
 const gait={value:new T.Vector2()},bodyMaterial=own(skin.clone());
 bodyMaterial.onBeforeCompile=shader=>{studioFill(shader);shader.uniforms.uCitizenGait=gait;shader.vertexShader='uniform vec2 uCitizenGait;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 float legWeight=1.-smoothstep(.14,.48,position.y);float footSide=smoothstep(-.04,.04,position.x);float angle=mix(uCitizenGait.x,uCitizenGait.y,footSide)*legWeight;
 vec2 foot=vec2(transformed.y-.42,transformed.z);transformed.y=.42+cos(angle)*foot.x-sin(angle)*foot.y;transformed.z=sin(angle)*foot.x+cos(angle)*foot.y;`);};
 bodyMaterial.customProgramCacheKey=()=> 'citizen-soft-gait-v1';
 const body=add(sculptBody(),bodyMaterial);body.name='Continuous sculpted body';body.onBeforeRender=()=>gait.value.set(limbs[0].rotation.x,limbs[1].rotation.x);
 const headCenter=1.57,rx=.68,ry=.61,rz=.52,signed=(v,p)=>Math.sign(v)*Math.pow(Math.abs(v),p);
 const headGeometry=new T.SphereGeometry(1,80,56),position=headGeometry.attributes.position;
 for(let i=0;i<position.count;i++)position.setXYZ(i,signed(position.getX(i),.90)*rx,signed(position.getY(i),.94)*ry,signed(position.getZ(i),.92)*rz);
 headGeometry.computeVertexNormals();const head=add(headGeometry,skin,[0,headCenter,.015]);head.name='Rounded ivory head';
 function faceZ(x,y){const a=Math.pow(Math.abs(x/rx),1/.90),b=Math.pow(Math.abs((y-headCenter)/ry),1/.94);return .015+rz*Math.pow(Math.sqrt(Math.max(.001,1-a*a-b*b)),.92);}
 function patch(cx,cy,sx,sy,material){const vertices=[cx,cy,faceZ(cx,cy)+.003],indices=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,x=cx+Math.cos(a)*sx,y=cy+Math.sin(a)*sy;vertices.push(x,y,faceZ(x,y)+.003);if(i<48)indices.push(0,i+1,i+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return add(geo,material);}
 for(const side of [-1,1]){const eye=patch(side*.285,1.40,.033,.051,ink);eye.name=side<0?'Left eye':'Right eye';const blush=own(new T.MeshStandardMaterial({color:'#d19b91',roughness:.9,transparent:true,opacity:.42,depthWrite:false}));patch(side*.33,1.265,.057,.029,blush);}
 const smile=new T.Shape();smile.moveTo(-.020,0);smile.quadraticCurveTo(0,-.005,.020,0);smile.quadraticCurveTo(.017,-.018,0,-.018);smile.quadraticCurveTo(-.017,-.018,-.020,0);
 const mouthGeo=new T.ShapeGeometry(smile,16),mouthPos=mouthGeo.attributes.position;
 for(let i=0;i<mouthPos.count;i++){const x=mouthPos.getX(i),y=mouthPos.getY(i)+1.25;mouthPos.setXYZ(i,x,y,faceZ(x,y)+.004);}mouthGeo.computeVertexNormals();add(mouthGeo,ink);
 const folder=new T.Group();folder.name='Open application folder';person.add(folder);
 function leaf(side,layer,isCover=false){const columns=16,rows=6,positions=[],indices=[];for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){const u=column/columns,v=row/rows,x=side*u*(isCover?.44:.422),curl=Math.sin(u*Math.PI)*.012*(isCover?0:1);positions.push(x,.82+.145*u-.34*v+layer*.009+curl,.38-.15*u+.12*v-layer*.006);}for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){const k=row*(columns+1)+column;indices.push(k,k+columns+1,k+1,k+1,k+columns+1,k+columns+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return add(geo,isCover?cover:paper,[0,0,0],folder);}
 for(const side of [-1,1]){leaf(side,0,true);for(let layer=1;layer<=4;layer++)leaf(side,layer);const edge=new T.CatmullRomCurve3([new T.Vector3(0,.48,.50),new T.Vector3(side*.22,.553,.425),new T.Vector3(side*.44,.625,.35)]);add(new T.TubeGeometry(edge,20,.010,8,false),cover,[0,0,0],folder);}
 const spine=new T.CatmullRomCurve3([new T.Vector3(0,.482,.505),new T.Vector3(0,.65,.445),new T.Vector3(0,.825,.385)]);add(new T.TubeGeometry(spine,16,.009,8,false),cover,[0,0,0],folder);
 const shadow=own(new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 vUV;void main(){vUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUV;void main(){float r=length((vUV-.5)*vec2(1.,1.25));float a=exp(-r*r*21.)*(1.-smoothstep(.36,.5,r));gl_FragColor=vec4(.003,.007,.012,a*.52);}' }));
 const contact=add(new T.PlaneGeometry(1.6,1.05),shadow,[0,.009,.02]);contact.rotation.x=-Math.PI/2;contact.castShadow=false;
 return {person,limbs};
}
