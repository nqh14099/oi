/** Scene 2 authored exhibition sculptures. Political roles are supplied by the DOM,
 * not inferred from the decorative architecture. All five subjects are independent groups. */
export function createSystemSculptures({THREE:T,root,own,materials:M,emblemContours=[]}) {
  const groups={},anchors={},geometry=new Map();let meshCount=0;
  const cached=(key,make)=>{if(!geometry.has(key))geometry.set(key,own(make()));return geometry.get(key);};
  const mesh=(g,m,p=[0,0,0],parent=root,s=null)=>{const o=new T.Mesh(g,m);o.position.set(...p);if(s)o.scale.set(...s);o.castShadow=true;o.receiveShadow=true;parent.add(o);meshCount++;return o;};
  const box=(w,h,d,m,p,parent)=>mesh(cached('box',()=>new T.BoxGeometry(1,1,1)),m,p,parent,[w,h,d]);
  const sphere=(r,m,p,parent,s=[1,1,1])=>mesh(cached('sphere',()=>new T.SphereGeometry(1,24,18)),m,p,parent,s.map(x=>x*r));
  const cylinder=(r,h,m,p,parent,rTop=r,n=64)=>mesh(cached('cylinder:'+n,()=>new T.CylinderGeometry(1,1,1,n)),m,p,parent,[r,h,r]);
  const tube=(points,r,m,parent=root,segments=40)=>mesh(own(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,r,8,false)),m,[0,0,0],parent);
  const ring=(r,y,m,parent,thickness=.025)=>{const o=mesh(own(new T.TorusGeometry(r,thickness,8,96)),m,[0,y,0],parent);o.rotation.x=Math.PI/2;return o;};
  const group=(name,p)=>{const g=new T.Group();g.name='political-system-'+name;g.position.set(...p);root.add(g);groups[name]=g;return g;};
  function dais(name,p,r){const g=group(name,p);
    cylinder(r+.20,.11,M.darkgold,[0,.015,0],g);cylinder(r+.13,.085,M.brass,[0,.105,0],g);
    cylinder(r,.34,M.basalt,[0,.31,0],g);cylinder(r+.035,.065,M.brass,[0,.51,0],g);
    cylinder(r-.04,.06,M.panel,[0,.565,0],g);ring(r-.09,.603,M.brass,g,.018);
    // Thin fluted bronze reveals on the podium skirts catch the local key light.
    for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;box(.018,.22,.018,M.darkgold,[Math.sin(a)*(r+.003),.31,Math.cos(a)*(r+.003)],g);}
    return g;
  }
  const people=dais('people',[0,0,1.6],2.15);
  function limb(a,b,r1,r2,material,parent){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);
    const key=`limb:${r1}:${r2}`;const geo=cached(key,()=>new T.CylinderGeometry(r2,r1,1,18));
    const o=mesh(geo,material,av.clone().add(bv).multiplyScalar(.5).toArray(),parent,[1,delta.length(),1]);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;
  }
  function person(x,z,height,rotation,material,feminine=false){const g=new T.Group();g.position.set(x,.62,z);g.rotation.y=rotation;g.scale.setScalar(height/2.24);people.add(g);
    // Adult sculptural proportions: seven-and-a-half head heights, articulated shoulders,
    // a small oval cranium and separate weight-bearing legs rather than toy-like cylinders.
    const torsoProfile=(feminine?[[.19,.83],[.23,.98],[.19,1.18],[.255,1.47],[.25,1.60],[.16,1.67]]:[[.19,.83],[.245,.94],[.23,1.12],[.29,1.50],[.32,1.58],[.17,1.69]]).map(([r,y])=>new T.Vector2(r,y));
    const torso=mesh(own(new T.LatheGeometry(torsoProfile,32)),material,[0,0,0],g);torso.scale.z=.66;
    limb([-.11,.85,0],[-.13,.43,.012],.115,.095,material,g);limb([-.13,.43,.012],[-.14,.075,.045],.085,.06,material,g);
    limb([.11,.85,0],[.14,.43,-.025],.115,.095,material,g);limb([.14,.43,-.025],[.15,.075,.015],.085,.06,material,g);
    sphere(.105,material,[-.14,.055,.09],g,[.72,.55,1.65]);sphere(.105,material,[.15,.055,.06],g,[.72,.55,1.65]);
    cylinder(.075,.16,material,[0,1.72,0],g,undefined,24);
    sphere(.19,material,[0,1.985,.015],g,[.79,1.20,.84]);
    // A restrained nose plane makes the head orientation legible without a literal portrait.
    sphere(.035,material,[0,1.985,.162],g,[.62,1.2,1]);
    const sl=feminine?.245:.30;
    limb([-sl,1.52,0],[-sl-.085,1.18,.02],.085,.07,material,g);limb([-sl-.085,1.18,.02],[-sl-.055,.90,.075],.065,.045,material,g);
    limb([sl,1.52,0],[sl+.09,1.18,-.015],.085,.07,material,g);limb([sl+.09,1.18,-.015],[sl+.065,.91,.035],.065,.045,material,g);
    sphere(.063,material,[-sl-.055,.88,.075],g,[.70,1.22,.75]);sphere(.063,material,[sl+.065,.89,.035],g,[.70,1.22,.75]);
    return g;
  }
  const stone2=own(M.ivory.clone());stone2.color.set('#b9aa90');stone2.roughness=.48;stone2.metalness=.14;
  person(-.88,-.40,2.08,-.12,stone2);person(.83,-.43,2.12,.11,stone2,true);
  person(-.56,.40,1.91,-.04,M.ivory,true);person(.57,.40,1.93,.08,M.ivory);person(0,.67,2.10,0,M.ivory);
  // A glass arc leaves the audience side open, preserving the silhouettes and the faces.
  mesh(own(new T.CylinderGeometry(1.99,1.99,2.75,96,1,true,Math.PI/2,Math.PI)),M.veil,[0,1.97,0],people);
  for(const x of [-1.99,1.99])tube([[x,.62,0],[x,3.34,0]],.012,M.brass,people,8);
  const glassRim=mesh(own(new T.TorusGeometry(1.99,.014,8,96,Math.PI)),M.brass,[0,3.34,0],people);glassRim.rotation.x=Math.PI/2;glassRim.rotation.z=Math.PI/2;

  const party=group('party',[0,0,-2.65]);
  const clothGeo=own(new T.BoxGeometry(3.58,3.57,.085,72,56,1));
  const clothPosition=clothGeo.attributes.position;
  const fold=(x,y)=>.082*Math.sin(x*5.1+.27*y)+.038*Math.sin(x*10.9-.31*y)+.11*Math.pow(x/1.79,2);
  for(let i=0;i<clothPosition.count;i++){const x=clothPosition.getX(i),y=clothPosition.getY(i);const sag=.15*(1-Math.pow(x/1.79,2));clothPosition.setXYZ(i,x,y-sag*(.65+.35*Math.sin(y*.8)),clothPosition.getZ(i)+fold(x,y));}
  clothGeo.computeVertexNormals();mesh(clothGeo,M.wine,[0,4.65,0],party);
  // Physical bronze edging follows the cloth's folds. Fine stitch lines remain geometry,
  // so they acquire the same shadows and perspective as the banner itself.
  for(const x of [-1.75,1.75]){const pts=[];for(let i=0;i<=24;i++){const y=-1.73+i*3.46/24;pts.push([x,y+4.65-.01,fold(x,y)+.068]);}tube(pts,.016,M.brass,party);}
  for(const y of [-1.73,1.73]){const pts=[];for(let i=0;i<=36;i++){const x=-1.75+i*3.5/36;pts.push([x,y+4.65-.15*(1-Math.pow(x/1.79,2))*(.65+.35*Math.sin(y*.8)),fold(x,y)+.067]);}tube(pts,.021,M.brass,party);}
  const rod=cylinder(.038,3.96,M.brass,[0,6.5,.055],party,undefined,24);rod.rotation.z=Math.PI/2;
  for(const x of [-1.99,1.99])sphere(.067,M.brass,[x,6.5,.055],party);
  for(const x of [-1.67,1.67])tube([[x,6.52,.05],[x,10.2,-.32]],.012,M.darkgold,party,8);
  // The contours are supplied from the previously approved CPV SVG; no invented emblem.
  for(const points of emblemContours){const shape=new T.Shape();points.forEach(([x,y],i)=>{const px=(x-.5)*3.6,py=(.5-y)*2.4;i?shape.lineTo(px,py):shape.moveTo(px,py);});shape.closePath();
    mesh(own(new T.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelSize:.016,bevelThickness:.016,bevelSegments:3,curveSegments:24})),[M.brass,M.darkgold],[0,5.42,.225],party);}
  // An inset plaque-sized lower bar gives the typography an architectural anchor.
  box(1.73,.035,.048,M.darkgold,[0,4.05,.19],party);

  const state=dais('state',[-4.25,0,-.1],1.76);
  // A symbolic Vietnamese civic palace: pitched roofs, a two-storey French-colonial
  // facade, paired arched openings, projecting central bay and shaded verandas.
  // It is deliberately not identified as a particular government building.
  const wall=M.stone,trim=M.ivory,roof=M.wine;
  for(let i=0;i<5;i++)box(3.18-i*.17,.075,1.76-i*.14,wall,[0,.64+i*.075,.12+i*.025],state);
  box(2.90,1.53,1.16,wall,[0,1.72,-.12],state);
  box(1.03,1.80,1.40,wall,[0,1.855,.0],state);
  for(const x of [-1.16,1.16])box(.61,1.67,1.32,wall,[x,1.79,-.09],state);
  for(const y of [1.01,1.73,2.48]){box(3.09,.09,1.36,trim,[0,y,-.04],state);box(3.20,.035,1.44,M.darkgold,[0,y+.055,-.04],state);}
  box(1.20,.12,1.52,trim,[0,2.77,.0],state);box(1.29,.045,1.62,M.brass,[0,2.85,0],state);
  // Raised quoins and narrow pilasters give each bay real shadow-producing depth.
  for(const x of [-1.48,-.84,-.53,.53,.84,1.48]){
    box(.10,1.39,.12,trim,[x,1.75,.61],state);
    box(.16,.085,.18,trim,[x,1.10,.63],state);box(.18,.10,.20,trim,[x,2.40,.63],state);
  }
  function opening(x,y,w,h,z,arch=true){
    const s=new T.Shape(),bottom=-h/2,top=h/2,r=w/2;
    s.moveTo(-r,bottom);s.lineTo(r,bottom);s.lineTo(r,top-r);if(arch)s.absarc(0,top-r,r,0,Math.PI,false);else s.lineTo(-r,top);s.lineTo(-r,bottom);
    mesh(own(new T.ExtrudeGeometry(s,{depth:.035,bevelEnabled:false,curveSegments:18})),M.panel,[x,y,z],state);
    const pts=[[-r,bottom],[r,bottom],[r,top-r]];if(arch){for(let j=0;j<=12;j++){const a=j*Math.PI/12;pts.push([Math.cos(a)*r,top-r+Math.sin(a)*r]);}}else pts.push([r,top],[-r,top]);pts.push([-r,bottom]);
    tube(pts.map(([a,b])=>[a+x,b+y,z+.04]),.022,M.darkgold,state,28);
    box(.018,h-.055,.024,M.brass,[x,y-.01,z+.055],state);box(w-.04,.018,.024,M.brass,[x,y-.04,z+.055],state);
    box(w+.11,.055,.14,trim,[x,y-h/2-.025,z+.045],state);
  }
  for(const x of [-1.16,-.69,.69,1.16]){opening(x,1.36,.27,.52,.635);opening(x,2.08,.28,.48,.635);}
  opening(0,1.40,.48,.85,.73);opening(0,2.24,.46,.50,.73);
  // Central entry canopy with coupled small columns and an upstairs balcony.
  for(const x of [-.48,.48]){cylinder(.055,.77,trim,[x,1.40,.90],state,undefined,20);cylinder(.085,.075,M.brass,[x,1.80,.90],state,undefined,20);}
  box(1.16,.085,.56,trim,[0,1.85,.80],state);box(1.22,.035,.63,M.darkgold,[0,1.91,.81],state);
  for(let i=-4;i<=4;i++)cylinder(.015,.24,trim,[i*.115,2.07,1.06],state,undefined,12);
  box(1.08,.035,.045,M.brass,[0,2.20,1.06],state);
  function hippedRoof(w,d,h,p){const verts=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*.28,h,0,w*.28,h,0];
    const g=own(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex([0,4,5,0,5,1,1,5,2,2,5,4,2,4,3,3,4,0,3,0,1,3,1,2]);g.computeVertexNormals();return mesh(g,roof,p,state);}
  hippedRoof(3.28,1.58,.49,[0,2.57,-.06]);hippedRoof(1.36,1.77,.44,[0,2.87,.02]);
  for(const x of [-1.16,1.16]){box(.30,.15,.24,wall,[x,3.08,-.12],state);hippedRoof(.39,.34,.13,[x,3.16,-.12]);}
  // Central pediment, ornament and roof finials are deliberately civic, not official emblems.
  const ped=new T.Shape();ped.moveTo(-.65,0);ped.lineTo(0,.35);ped.lineTo(.65,0);ped.closePath();mesh(own(new T.ExtrudeGeometry(ped,{depth:.12,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2})),wall,[0,2.83,.79],state);
  tube([[-.67,2.85,.95],[0,3.20,.95],[.67,2.85,.95]],.025,M.brass,state,24);
  const clock=mesh(own(new T.CircleGeometry(.105,32)),M.ivory,[0,2.96,.935],state);clock.castShadow=false;
  tube([[0,2.96,.95],[0,3.027,.95]],.008,M.darkgold,state,4);tube([[0,2.96,.95],[.05,2.94,.95]],.008,M.darkgold,state,4);
  for(const x of [-1.45,1.45])sphere(.043,M.brass,[x,2.72,.60],state);
  // Wall returns and side windows are visible in the oblique camera view.
  for(const side of [-1,1])for(const z of [-.47,.02]){const o=box(.025,.43,.25,M.panel,[side*1.457,1.37,z],state);box(.04,.04,.32,trim,[side*1.475,1.10,z],state);}

  const front=dais('front',[4.1,0,-.65],1.45);
  // A botanical lotus sculpture, not a representation of the official Front emblem.
  const bowlProfile=[[0,.62],[.42,.62],[.48,.69],[.38,.82],[.27,.91],[0,.94]].map(([r,y])=>new T.Vector2(r,y));
  mesh(own(new T.LatheGeometry(bowlProfile,64)),M.darkgold,[0,0,0],front);ring(.45,.70,M.brass,front,.025);
  function petal(x,z,angle,height,width,mat){const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(-width*.75,height*.29,-width*.59,height*.67,0,height);s.bezierCurveTo(width*.59,height*.67,width*.75,height*.29,0,0);
    const geo=own(new T.ExtrudeGeometry(s,{depth:.085,bevelEnabled:true,bevelSize:.035,bevelThickness:.03,bevelSegments:3,curveSegments:26}));
    const v=geo.attributes.position;for(let i=0;i<v.count;i++){const y=v.getY(i)/height;v.setZ(i,v.getZ(i)+.23*y*y+.055*Math.sin(y*Math.PI));}geo.computeVertexNormals();
    const o=mesh(geo,[mat,M.darkgold],[x,.84,z],front);o.rotation.z=angle;
    const vein=tube([[0,.08,.12],[0,height*.48,.17],[0,height*.86,.27]],.012,M.brass,o,20);vein.castShadow=false;
    return o;
  }
  petal(-.10,-.12,.53,1.72,.49,M.darkgold);petal(.10,-.12,-.53,1.72,.49,M.darkgold);
  petal(-.10,.02,.76,1.47,.48,M.brass);petal(.10,.02,-.76,1.47,.48,M.brass);
  petal(-.035,.12,.32,1.80,.47,M.brass);petal(.035,.12,-.32,1.80,.47,M.brass);
  petal(0,.27,0,1.95,.52,M.brass);
  petal(-.13,.26,1.10,1.11,.46,M.darkgold);petal(.13,.26,-1.10,1.11,.46,M.darkgold);

  const org=dais('organisations',[4.6,0,3.8],1.72);
  const medallionHeights=[1.18,1.36,1.31,1.15];
  for(let i=0;i<4;i++){
    const g=new T.Group();g.position.set((i-1.5)*.74,medallionHeights[i],.11*Math.abs(i-1.5));g.rotation.y=(i-1.5)*-.10;org.add(g);
    const disk=cylinder(.365,.095,M.darkgold,[0,0,0],g);disk.rotation.x=Math.PI/2;
    const inset=cylinder(.326,.014,M.panel,[0,0,.055],g);inset.rotation.x=Math.PI/2;
    mesh(own(new T.TorusGeometry(.341,.021,8,64)),M.brass,[0,0,.065],g);
    mesh(own(new T.TorusGeometry(.300,.007,6,64)),M.darkgold,[0,0,.070],g);
    cylinder(.17,.11,M.brass,[0,-medallionHeights[i]+.66,0],g);box(.075,.28,.085,M.darkgold,[0,-.40,0],g);
    // Four distinct neutral reliefs: a book, a collective, a sprig and a woven link.
    if(i===0){for(const sign of [-1,1]){const p=box(.17,.25,.027,M.brass,[sign*.089,0,.09],g);p.rotation.y=sign*.18;for(let j=-1;j<=1;j++)box(.115,.009,.013,M.ivory,[sign*.09,j*.055,.112],g);}tube([[0,-.14,.13],[0,.12,.13]],.009,M.ivory,g,4);}
    if(i===1){for(const x of [-.15,0,.15]){sphere(.044,M.brass,[x,.085-(x? .025:0),.10],g,[1,1, .45]);const p=box(.085,.14,.035,M.brass,[x,-.035,.09],g);p.rotation.z=-x*.35;}}
    if(i===2){tube([[0,-.20,.095],[.015,-.04,.095],[0,.17,.095]],.011,M.brass,g,18);for(let j=0;j<4;j++){const sign=j%2?1:-1;const leaf=sphere(.065,M.brass,[sign*.07,-.10+j*.065,.10],g,[1.1,.52,.28]);leaf.rotation.z=sign*.50;}}
    if(i===3){for(const sign of [-1,1]){const loop=mesh(own(new T.TorusGeometry(.11,.025,8,40)),M.brass,[sign*.075,sign*.035,.105],g);loop.scale.y=1.4;loop.rotation.z=-.65;}}
  }
  anchors.party=[0,4.15,-2.35];anchors.state=[-4.4,.35,1.4];anchors.front=[4.4,.4,.8];anchors.organisations=[4.6,.3,5.2];anchors.people=[0,.25,3.8];
  const bounds=new T.Box3();
  for(const g of Object.values(groups)){g.updateWorldMatrix(true,true);bounds.expandByObject(g);}
  return {groups,anchors,meshCount,extents:{min:bounds.min.toArray(),max:bounds.max.toArray()},geometryCount:geometry.size};
}
