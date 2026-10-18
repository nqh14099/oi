import {createCitizenFigure} from './cinematic-citizen.mjs';
// Supporting architecture for the cinematic deck. These forms are illustrative;
// all institutional labels, dates, qualifications and sources belong to the DOM.
const GOLD = '#d9b67a', IVORY = '#eee2cb', NAVY = '#101a2b', CYAN = '#76d9e3';
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const t = clamp(value); return 1 - (1 - t) ** 3; };
const mix = (a, b, t) => a + (b - a) * t;

function createSupportingWorld(id, sceneData) {
  let T, root, own, transition = null, beat = 0, previous = null, aspect = 16 / 9, studio = null;
  const parts = {}, geometries = new Map(), materials = new Map();
  const geometry = (name, factory) => {
    if (!geometries.has(name)) geometries.set(name, own(factory()));
    return geometries.get(name);
  };
  const material = (name, color, options = {}) => {
    if (!materials.has(name)) materials.set(name, own(new T.MeshStandardMaterial({
      color, roughness: .52, metalness: .46, ...options
    })));
    return materials.get(name);
  };
  function mesh(shape, surface, position = [0, 0, 0], parent = root) {
    const item = new T.Mesh(own(shape), surface);
    item.position.set(...position); parent.add(item); return item;
  }
  function line(points, color = GOLD, opacity = .35, parent = root) {
    const item = new T.Line(own(new T.BufferGeometry().setFromPoints(points.map(p => new T.Vector3(...p)))),
      own(new T.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })));
    parent.add(item); return item;
  }
  function bar(from, to, width, surface, parent = root) {
    const a = new T.Vector3(...from), b = new T.Vector3(...to), delta = b.clone().sub(a);
    const item = new T.Mesh(geometry('unit-box', () => new T.BoxGeometry(1, 1, 1)), surface);
    item.position.copy(a).add(b).multiplyScalar(.5);
    item.scale.set(width, delta.length(), width);
    item.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
    parent.add(item); return item;
  }
  function pointsCloud(count, mapper, { size = 3, opacity = .45, color = GOLD } = {}) {
    const positions = [], seeds = [];
    for (let i = 0; i < count; i++) {
      const a = (Math.sin((i + 1) * 127.1) * 43758.5453) % 1;
      const b = (Math.sin((i + 1) * 269.5) * 31243.7581) % 1;
      const c = (Math.sin((i + 1) * 113.7) * 41984.7311) % 1;
      positions.push(...mapper(Math.abs(a), Math.abs(b), Math.abs(c), i));
      seeds.push(Math.abs(c));
    }
    const geo = own(new T.BufferGeometry());
    geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new T.Float32BufferAttribute(seeds, 1));
    const surface = own(new T.ShaderMaterial({
      uniforms: { uColor: { value: new T.Color(color) }, uSize: { value: size }, uOpacity: { value: opacity }, uLift: { value: 0 } },
      vertexShader: `attribute float aSeed; uniform float uSize,uLift; varying float vSeed;
        void main(){vSeed=aSeed;vec3 p=position;p.y+=uLift*(.25+aSeed*.7);
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=uSize*(.55+aSeed*.65);}`,
      fragmentShader: `uniform vec3 uColor;uniform float uOpacity;varying float vSeed;
        void main(){float r=length(gl_PointCoord-.5)*2.;float a=1.-smoothstep(.05,1.,r);
        gl_FragColor=vec4(uColor,uOpacity*a*a*(.45+vSeed*.55));}`,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending
    }));
    const cloud = new T.Points(geo, surface); root.add(cloud); return cloud;
  }

  // Match Scene 3 exactly: the same sculpted ivory citizen and open folder.
  // Existing beats control continuous-body walking deformation.
  function makeCitizen(){const figure=createCitizenFigure({THREE:T,own});root.add(figure.person);return figure;}

  // Local feathered contact pools: no opaque floor boundary or full-stage haze.
  function contactPool(position, width, depth, color = '#000000', opacity = .55) {
    const surface = own(new T.ShaderMaterial({
      uniforms:{uColor:{value:new T.Color(color)},uOpacity:{value:opacity}},
      vertexShader:'varying vec2 vUV;void main(){vUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec2 vUV;uniform vec3 uColor;uniform float uOpacity;void main(){float r=length((vUV-.5)*2.);float a=pow(1.-smoothstep(.08,1.,r),2.);gl_FragColor=vec4(uColor,a*uOpacity);}',
      transparent:true,depthWrite:false
    }));
    const pool=mesh(new T.PlaneGeometry(width,depth),surface,position);pool.rotation.x=-Math.PI/2;return pool;
  }

  function servicePosition(index) {
    const positions=[[-3.9,-2.65,2.4],[-.7,-2.65,.7],[2.7,-2.65,-1.4],[5.8,-2.65,-3.4]];
    const p=positions[index];return new T.Vector3(p[0],p[1],p[2]);
  }

  function buildScaffold() {
    parts.ribs = [];
    for (let j = 0; j < 3; j++) {
      const path = [];
      for (let i = 0; i <= 88; i++) {
        const t = i / 88, theta = mix(-Math.PI * .72, Math.PI * .72, t);
        path.push([3.55 + Math.cos(theta) * (3.55 + j * .13), Math.sin(theta) * (3.7 + j * .07), -3.5 - j * .4]);
      }
      const rib = line(path, j % 2 ? '#8d7957' : GOLD, j % 2 ? .08 : .17);
      parts.ribs.push(rib);
    }
    parts.dust = pointsCloud(140, (a, b, c) => [1 + a * 7.5, -4.5 + b * 9, -5 + c * 2], { size: 2.5, opacity: .32 });
    parts.sweep = line([[-9, -4.3, -1], [-3, -3.9, -2], [2, -3.4, -2.5], [8, -3.1, -3]], GOLD, .25);
  }

  function buildHistory() {
    // An archival folio is a material metaphor, not a facsimile of a source.
    parts.arches=[];parts.layers=[];
    const paper=material('archive-paper','#bdad91',{roughness:.94,metalness:0});
    const binding=material('archive-binding','#49252b',{roughness:.75,metalness:.08});
    const ink=material('archive-ink','#51483e',{roughness:1,metalness:0});
    for(let i=0;i<3;i++){
      const folio=new T.Group();folio.position.set(4.1+i*.24,.55-i*.15,-i*.5);folio.rotation.set(-.13,-.22,-.055+i*.035);root.add(folio);
      mesh(new T.BoxGeometry(3.7,4.6,.18),binding,[0,0,-.13],folio);
      mesh(new T.BoxGeometry(3.48,4.36,.10),paper,[.04,.04,0],folio);
      bar([-1.55,-2.08,.07],[-1.55,2.10,.07],.035,binding,folio);
      mesh(new T.BoxGeometry(1.32,.09,.012),binding,[-.55,1.52,.067],folio);
      for(let row=0;row<10;row++)mesh(new T.BoxGeometry(row%4===3?1.85:2.6,.025,.012),ink,[row%4===3?-.25:.12,1.04-row*.24,.067],folio);
      const seal=mesh(new T.TorusGeometry(.29,.018,8,40),material('archive-seal',GOLD,{metalness:.25,roughness:.6}),[.95,-1.64,.08],folio);
      parts.layers.push(folio);
    }
    contactPool([4,-2.12,-.4],6,3,'#000000',.48);
    parts.dust=pointsCloud(55,(a,b,c)=>[1+a*6,-2+b*5,-3-c*3],{opacity:.19,size:1.7});
  }

  function buildIntegrity() {
    const bronze=material('integrity-bronze','#9b7050',{metalness:.25,roughness:.57,emissive:'#3b2011',emissiveIntensity:.12});
    const profile=[new T.Vector2(0,-.22),new T.Vector2(.68,-.22),new T.Vector2(1.04,-.08),new T.Vector2(1.25,.26),new T.Vector2(1.15,.22),new T.Vector2(.75,.03),new T.Vector2(0,.03)];
    parts.base=mesh(new T.LatheGeometry(profile,64),bronze,[4.25,-1.75,0]);
    const rim=mesh(new T.TorusGeometry(1.23,.028,10,72),material('ember-rim',GOLD,{metalness:.25,roughness:.55,emissive:'#995421',emissiveIntensity:.3}),[4.25,-1.50,0]);rim.rotation.x=Math.PI/2;
    parts.flames=[];
    for(let j=0;j<7;j++){
      const positions=[],indices=[],height=2.9+(j%3)*.42;
      for(let y=0;y<=42;y++)for(let side=0;side<2;side++){
        const t=y/42,angle=j*.9+t*1.1,width=(1-t)*(.22+j*.012);
        const x=Math.sin(t*5+j*.7)*.35+(side?1:-1)*width;
        positions.push(4.25+x*Math.cos(angle),-1.47+t*height,Math.sin(angle)*x+.16*Math.cos(t*6+j));
      }
      for(let y=0;y<42;y++){const k=y*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
      const fire=mesh(geo,material('flame-'+j,j%2?'#b45624':'#e0ad59',{roughness:.75,metalness:0,emissive:j%2?'#8a3110':'#9f6021',emissiveIntensity:.42,side:T.DoubleSide,transparent:true,opacity:.66,depthWrite:false}));parts.flames.push(fire);
    }
    parts.embers=pointsCloud(140,(a,b,c)=>[4.25+(a-.5)*(1.7-b),-1.45+b*4.2,(c-.5)*.7],{opacity:.62,size:3});
    parts.arc=line([[3,-1.47,0],[5.5,-1.47,0]],GOLD,.25);
    contactPool([4.25,-2.03,0],4,2.6,'#000000',.42);
    const light=new T.PointLight('#e0a95f',5,9,2);light.position.set(4.25,-.3,2);root.add(light);
  }

  function buildServices() {
    parts.stations = []; parts.routes = [];
    const graphite=material('service-case-graphite','#59646a',{roughness:.6,metalness:.12});
    const paper=material('case-paper','#d2c7ae',{roughness:.85,metalness:0});
    const ink=material('case-ink','#6a939a',{roughness:1,metalness:0});
    const edge=material('service-case-edge','#478891',{roughness:.35,metalness:.3,emissive:'#214d54',emissiveIntensity:.25});
    function rounded(width,height,depth,radius,surface,position,parent){
      const shape=new T.Shape(),x=-width/2,y=-height/2,r=radius;
      shape.moveTo(x+r,y);shape.lineTo(x+width-r,y);shape.quadraticCurveTo(x+width,y,x+width,y+r);
      shape.lineTo(x+width,y+height-r);shape.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
      shape.lineTo(x+r,y+height);shape.quadraticCurveTo(x,y+height,x,y+height-r);
      shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
      const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:2,curveSegments:8,steps:1});geo.translate(0,0,-depth/2);
      return mesh(geo,surface,position,parent);
    }
    const pathSurface = progress => own(new T.ShaderMaterial({
      uniforms: { uProgress: { value: progress }, uOpacity: { value: 1 } },
      vertexShader: `varying float vAlong;varying vec3 vNormal;void main(){vAlong=uv.x;vNormal=normalMatrix*normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform float uProgress,uOpacity;varying float vAlong;varying vec3 vNormal;
        void main(){float arrived=1.-smoothstep(uProgress-.035,uProgress+.035,vAlong);
        vec3 c=mix(vec3(.055,.16,.22),vec3(.33,.76,.81),arrived);
        float rim=.45+.55*abs(normalize(vNormal).z);gl_FragColor=vec4(c*rim,(.48+arrived*.52)*uOpacity);}`,
      transparent: true, depthWrite: false
    }));
    const stationSurface = i => material('service-station-' + i, '#234052', {
      emissive: '#15404b', emissiveIntensity: .2, roughness: .28, metalness: .72
    });
    for (let i = 0; i < 4; i++) {
      const group = new T.Group(); group.name = 'Service station ' + (sceneData.visual?.steps?.[i] ?? i); root.add(group);
      const ring = mesh(new T.TorusGeometry(.43, .015, 8, 56), stationSurface(i), [0,.12,.55], group);ring.rotation.x=-Math.PI/2;
      const dot = mesh(new T.SphereGeometry(.035, 14, 8), material('service-dot-' + i, CYAN, { emissive: CYAN, emissiveIntensity: .35 }), [0,.14,.55], group);
      // Low bronze work surfaces leave the transaction, not the furniture, dominant.
      const desk=rounded(1.95,.14,1.30,.08,material('service-platform','#42332f',{roughness:.65,metalness:.27}),[0,.02,-.05],group);
      line([[-.91,.10,.58],[.91,.10,.58]],GOLD,.4,group);
      const prop=new T.Group();prop.name='Service step '+i;prop.position.set(0,1.15,-.12);prop.rotation.set(-.08,-.18,0);prop.scale.setScalar(1.90);group.add(prop);
      if(i===0){
        // Submit: a document being placed in a shallow receiving tray.
        rounded(.53,.74,.035,.018,paper,[0,.03,0],prop);
        mesh(new T.BoxGeometry(.10,.075,.012),edge,[-.15,.24,.05],prop);
        for(let row=0;row<4;row++)mesh(new T.BoxGeometry(row===3?.20:.34,.009,.008),ink,[row===3?-.07:0,.06-row*.09,.05],prop);
        rounded(.70,.10,.39,.025,graphite,[0,-.43,.025],prop);
      }else if(i===1){
        // Process: coordinated layers, rather than another copy of the same paper.
        for(let layer=0;layer<3;layer++){
          const card=new T.Group();card.position.set((layer-1)*.10,(layer-1)*.105,-layer*.10);prop.add(card);
          rounded(.68,.46,.045,.035,graphite,[0,0,0],card);
          rounded(.62,.40,.012,.025,edge,[0,0,-.031],card);
          for(let row=0;row<3;row++)mesh(new T.BoxGeometry(.33-row*.06,.014,.008),ink,[-.045,.08-row*.085,.05],card);
          mesh(new T.SphereGeometry(.023,10,8),paper,[.23,.11,.05],card);
        }
      }else if(i===2){
        // Track: a readable progress display with one location highlighted.
        rounded(.84,.65,.075,.045,graphite,[0,.04,0],prop);
        line([[-.28,-.02,.068],[.29,-.02,.068]],'#76d9e3',.65,prop);
        for(let step=0;step<4;step++)mesh(new T.SphereGeometry(step===2?.04:.026,12,8),step===2?edge:ink,[-.28+step*.19,-.02,.068],prop);
        for(let row=0;row<2;row++)mesh(new T.BoxGeometry(.45-row*.12,.014,.008),ink,[-.06,.19-row*.075,.068],prop);
        bar([0,-.30,-.02],[0,-.52,-.02],.055,graphite,prop);
      }else{
        // Receive: the completed document in a folded envelope.
        rounded(.77,.48,.05,.025,paper,[0,-.03,0],prop);
        line([[-.36,.17,.050],[0,-.05,.050],[.36,.17,.050]],'#5b7274',.8,prop);
        mesh(new T.TorusGeometry(.073,.018,7,24),edge,[0,-.04,.048],prop);
        rounded(.53,.47,.025,.012,paper,[0,.16,-.035],prop);
      }
      const position=servicePosition(i);group.position.copy(position);
      contactPool([position.x,position.y-.08,position.z],3.7,2.8);
      parts.stations.push({ group, ring, dot, prop, desk });
    }
    function makeRoute(from, to, help = false) {
      const a=from.clone().add(new T.Vector3(0,.14,.55));
      const b=to.clone().add(new T.Vector3(0,.14,.55));
      const middle=a.clone().lerp(b,.5);middle.z+=help?-.35:.48;
      const curve = new T.CatmullRomCurve3([a,middle,b]);
      const surface = pathSurface(0);
      const tube = mesh(new T.TubeGeometry(curve, 64, help ? .014 : .023, 7, false), surface);
      tube.name = help ? 'Connected in-person Help route' : 'Digital service route';
      parts.routes.push({ tube, surface, curve, help });
    }
    for (let i = 0; i < 3; i++) makeRoute(servicePosition(i),servicePosition(i+1));
    const helpPosition=new T.Vector3(-8.3,-2.65,-2.8);
    makeRoute(servicePosition(0),helpPosition,true);
    parts.help = new T.Group(); parts.help.name = 'Connected Help';parts.help.position.copy(helpPosition);root.add(parts.help);
    rounded(1.15,.1,.70,.04,graphite,[0,.9,0],parts.help);
    for(const side of [-1,1])bar([side*.45,.05,0],[side*.45,.9,0],.045,graphite,parts.help);
    mesh(new T.BoxGeometry(.40,.025,.3),paper,[.09,.98,0],parts.help).rotation.y=-.18;
    contactPool([helpPosition.x,-2.73,helpPosition.z],2.4,1.8);
    Object.assign(parts, makeCitizen());parts.person.scale.setScalar(1.02);
    parts.personShadow=contactPool([0,-2.70,0],2.3,1.8,'#000000',.8);
    // The same case crosses between steps; settled props continue to explain each action.
    parts.case=new T.Group();parts.case.name='Continuous application';root.add(parts.case);
    rounded(.56,.76,.035,.025,paper,[0,0,0],parts.case);
    for(let row=0;row<4;row++)mesh(new T.BoxGeometry(.34,.012,.008),ink,[0,.15-row*.10,.024],parts.case);
    mesh(new T.BoxGeometry(.08,.08,.009),edge,[-.13,.28,.025],parts.case);
    parts.transactionLight=new T.PointLight('#f0d5a9',3.2,7,2);root.add(parts.transactionLight);
    contactPool([.5,-2.78,-.5],20,16,'#29333b',.24);
    parts.dust = pointsCloud(34, (a, b, c) => [-6 + a * 13, -2 + b * 5, -6 + c*7], { color: IVORY, opacity: .16, size: 1.5 });
  }

  function buildResponsibility() {
    parts.links=[];parts.actions=[];
    parts.dust=pointsCloud(id===8?45:65,(a,b,c)=>[1+a*7,-3+b*6,-4-c*3],{opacity:.16,size:1.7});
    if(id===8)return;
    const paper=material('action-paper','#cbbda2',{roughness:.9,metalness:0});
    const ink=material('action-ink','#5c5145',{roughness:1,metalness:0});
    const cover=material('action-cover','#592b34',{roughness:.7,metalness:.12});
    const brass=material('action-brass',GOLD,{roughness:.42,metalness:.3});
    for(let i=0;i<3;i++){
      const g=new T.Group();g.position.set(4.6,.3,0);g.rotation.set(-.15,-.25,-.045);root.add(g);parts.actions.push(g);
      if(i===0){
        for(const side of [-1,1]){
          const leaf=new T.Group();leaf.position.x=side*1.03;leaf.rotation.y=side*-.18;g.add(leaf);
          mesh(new T.BoxGeometry(2.04,3.05,.15),cover,[0,0,-.10],leaf);
          mesh(new T.BoxGeometry(1.92,2.89,.11),paper,[0,0,0],leaf);
          for(let row=0;row<10;row++)mesh(new T.BoxGeometry(row%4===3?1.1:1.53,.025,.01),ink,[0,1.08-row*.23,.062],leaf);
        }
        bar([0,-1.55,.16],[0,1.55,.16],.035,brass,g);
      }else if(i===1){
        mesh(new T.BoxGeometry(4,3.15,.16),cover,[0,0,0],g);
        for(let col=0;col<3;col++){
          mesh(new T.BoxGeometry(.96,.055,.02),brass,[-1.24+col*1.24,1.13,.10],g);
          for(let row=0;row<2;row++){
            const x=-1.24+col*1.24,y=.45-row*1.0;
            mesh(new T.BoxGeometry(.96,.72,.08),paper,[x,y,.13],g);
            line([[x-.29,y,.18],[x-.08,y-.17,.18],[x+.29,y+.18,.18]],'#695133',.95,g);
          }
        }
      }else{
        mesh(new T.BoxGeometry(2.9,3.6,.12),cover,[0,0,-.09],g);
        mesh(new T.BoxGeometry(2.72,3.42,.09),paper,[0,0,0],g);
        for(let row=0;row<9;row++)mesh(new T.BoxGeometry(1.98,.03,.012),ink,[0,1.2-row*.27,.05],g);
        mesh(new T.TorusGeometry(.72,.075,12,64),brass,[.65,-.45,.45],g);
        bar([1.12,-1.0,.45],[1.65,-1.65,.45],.14,brass,g);
      }
    }
    contactPool([4.6,-2.1,0],6,3,'#000000',.5);
  }

  function buildVision() {
    parts.gates = [];
    const locations=[[-3.2,-1.25,2.2],[1.25,-.9,-3],[6.6,-.35,-9.5]];
    for (let i = 0; i < 3; i++) {
      const gate = new T.Group();gate.position.set(...locations[i]);gate.rotation.y=-.12;root.add(gate);
      gate.name = ['Implementation', '2030 development goal', '2045 long-term goal'][i];
      const body=material('horizon-body-'+i,i===0?'#816352':'#66574f',{roughness:.58,metalness:.28});
      const frame = material('gate-edge-' + i, GOLD, { emissive: '#70512c', emissiveIntensity: .12, metalness: .4, roughness: .48 });
      const width=[3.2,3.7,4.8][i],height=[3.6,4.5,5.6][i],base=-1.5;
      // Sculpted, open thresholds instead of three rectangular picture frames.
      const shoulder=height+base-width*.42;
      const curve=new T.CatmullRomCurve3([
        new T.Vector3(-width/2,base,0),new T.Vector3(-width/2,shoulder-.4,0),
        new T.Vector3(-width*.42,height+base-.25,0),new T.Vector3(-width*.12,height+base,.02),
        new T.Vector3(width*.22,height+base-.08,.06),new T.Vector3(width*.48,shoulder+.2,.08)
      ],false,'centripetal');
      mesh(new T.TubeGeometry(curve,80,i===0?.09:.065,12,false),body,[0,0,0],gate);
      const edgeCurve=curve.getPoints(80).map(p=>[p.x,p.y,p.z+.065]);line(edgeCurve,GOLD,.55,gate);
      if(i===0)bar([width*.48,base,.08],[width*.48,shoulder+.2,.08],.10,body,gate);
      const deck=mesh(new T.BoxGeometry(width+.25,.16,1.3),body,[0,base-.08,0],gate);
      for(let k=0;k<(i===0?3:1);k++){
        const step=mesh(new T.BoxGeometry(width+.25+k*.22,.045,.25),body,[0,base-.13-k*.055,.75+k*.25],gate);
        line([[-width/2,base-.10-k*.055,.9+k*.25],[width/2,base-.10-k*.055,.9+k*.25]],GOLD,.28,gate);
      }
      contactPool([locations[i][0],locations[i][1]+base-.3,locations[i][2]],width+3,4.5,'#000000',.58);
      parts.gates.push({ gate, frame,body,deck,width,height });
    }
    // A continuous, feather-light pair of rails binds the dates to one perspective.
    for(const offset of [-.78,.78]){
      const curve=new T.CatmullRomCurve3(locations.map(p=>new T.Vector3(p[0]+offset,p[1]-1.48,p[2])));
      line(curve.getPoints(80).map(p=>p.toArray()),GOLD,.24);
    }
    contactPool([1,-3,-4],25,24,'#2d2527',.2);
    parts.horizonLight=new T.PointLight('#e5c594',5,13,2);root.add(parts.horizonLight);
    parts.dust = pointsCloud(60, (a, b, c) => [-6+a*17,-2+b*6,-12+c*15], { opacity:.23,size:1.7 });
  }

  function cameraPose(index = 0, entering = false) {
    if ([4,6,9].includes(id)) return {projection:'perspective',position:[aspect<1.1?4.3:1.15,1.05,22],target:[aspect<1.1?4.3:0,.1,0],fov:26};
    if (id === 7) return {projection:'perspective',position:[.4+index*.38,4.1,14.7-index*.35+(aspect<1.1?9:0)],target:[.4+index*.18,-.15,-.5-index*.35],fov:45};
    if (id === 10) return {projection:'perspective',position:[.4+index*.60,3.0,17-index*.65+(aspect<1.1?6:0)],target:[.55+index*.3,.45,-2-index*.8],fov:43};
    return { projection: 'orthographic', position: [0, 0, 22], target: [0, 0, 0], orthoHeight: 10, zoom: 1 };
  }
  function apply(value, entry = 1, walking = 0) {
    beat = value;
    root.userData.cinematicWorld = { sceneId: id, beat: value, settled: !transition, illustration: true };
    if (id === 2) {
      parts.ribs.forEach((rib, i) => { rib.position.x = (1 - entry) * .30 + value * .035 * (i - 3); rib.material.opacity = (i % 2 ? .08 : .17) + value * .016; });
      parts.dust.material.uniforms.uLift.value = value * .08;
    } else if (id === 4) {
      parts.layers.forEach((layer,i)=>{const active=1-clamp(Math.abs(value-i));layer.position.z=-i*.25+active*.9;layer.position.x=4.1+(i-value)*.30;layer.rotation.z=-.055+(i-value)*.035;});
    } else if (id === 6) {
      parts.embers.material.uniforms.uLift.value = value * .33 + entry * .25;
      parts.embers.material.uniforms.uOpacity.value = .62 + value * .07;
      parts.arc.rotation.z = value * .035;
    } else if (id === 7) {
      parts.stations.forEach(({ group, ring, dot, prop }, i) => {
        group.position.copy(servicePosition(i));
        const active = clamp(1 - Math.abs(value - i));
        ring.material.emissiveIntensity = .10 + active * .45;
        ring.material.color.set(i <= value + .01 ? CYAN : '#234052');
        dot.scale.setScalar(.7 + active * .4);
        prop.position.y=1.05+active*.14;prop.scale.setScalar(1.55+active*.15);
      });
      parts.routes.forEach((route, i) => {
        route.surface.uniforms.uProgress.value = route.help ? .99 : clamp(value - i);
        route.surface.uniforms.uOpacity.value = route.help ? .40 : .8;
      });
      const section=Math.min(2,Math.floor(value)),fraction=clamp(value-section);
      const position=servicePosition(section).lerp(servicePosition(section+1),fraction);
      parts.person.position.copy(position).add(new T.Vector3(-1.85,.10,1.25));
      parts.person.rotation.y = .2+Math.sin(Math.PI*clamp(walking))*.34;
      parts.personShadow.position.set(parts.person.position.x,-2.70,parts.person.position.z);
      parts.case.position.copy(position).add(new T.Vector3(0,1.15+Math.sin(Math.PI*fraction)*.65,.24));
      parts.case.rotation.set(-.13,-.18+fraction*.12,-Math.sin(Math.PI*fraction)*.16);
      parts.case.visible=fraction>.025&&fraction<.975;
      parts.transactionLight.position.copy(position).add(new T.Vector3(-1,3,2));
      parts.limbs.forEach((limb, i) => { limb.rotation.x = Math.sin(walking * 18 + (i % 2) * Math.PI) * .15 * Math.sin(Math.PI * clamp(walking)); });
    } else if (id === 8 || id === 9) {
      parts.links.forEach((group, i) => { group.position.y = 3.75 - i * 2.2 - value * .11 + (1 - entry) * .15; });
      parts.actions?.forEach((object,i)=>{object.visible=i===Math.round(value);object.rotation.y=-.25+value*.06;});
    } else if (id === 10) {
      parts.gates.forEach(({ frame,body }, i) => {
        const active=clamp(1-Math.abs(value-i));frame.emissiveIntensity=.08+active*.32;
        body.color.set(i===0?'#816352':'#66574f').multiplyScalar(.65+active*.55);
      });
      const start=parts.gates[Math.min(1,Math.floor(value))].gate.position;
      const end=parts.gates[Math.min(2,Math.floor(value)+1)].gate.position;
      parts.horizonLight.position.copy(start).lerp(end,value-Math.min(1,Math.floor(value))).add(new T.Vector3(-.3,2.6,2));
    }
  }

  function fallback(g, ctx) {
    const { width, height } = ctx.size;
    g.save(); g.lineWidth = 1; g.strokeStyle = 'rgba(217,182,122,.2)';
    if (id === 7) {
      const y = height * .64, xs = [.25, .45, .65, .85].map(x => x * width);
      g.strokeStyle = CYAN; g.lineWidth = 2; g.globalAlpha = .72;
      g.beginPath(); g.moveTo(xs[0], y); g.lineTo(xs[3], y); g.stroke();
      g.beginPath(); g.moveTo(xs[0], y); g.bezierCurveTo(xs[0], height * .80, xs[1], height * .80, xs[1], height * .80); g.stroke();
      for (const x of xs) { g.beginPath(); g.arc(x, y, height * .018, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.arc(xs[1], height * .80, height * .014, 0, Math.PI * 2); g.stroke();
      const x = width * (.25 + beat * .2 - .065), feet = height * .83, scale = height * .09;
      g.globalAlpha = 1; g.fillStyle = '#9c9585';
      g.beginPath(); g.ellipse(x, feet - scale * 1.5, scale * .14, scale * .18, 0, 0, Math.PI * 2); g.fill();
      g.fillRect(x - scale * .15, feet - scale * 1.26, scale * .3, scale * .66);
      g.strokeStyle = '#9c9585'; g.lineWidth = scale * .12;
      for (const side of [-1, 1]) { g.beginPath(); g.moveTo(x + side * scale * .09, feet - scale * .66); g.lineTo(x + side * scale * .11, feet); g.stroke(); }
      g.fillStyle = '#a2947a'; g.fillRect(x + scale * .19, feet - scale * .9, scale * .16, scale * .24);
    } else if (id === 4 || id === 10) {
      for (let i = 0; i < 5; i++) {
        const inset = i * width * .016, x = width * .68, y = height * .45;
        g.globalAlpha = .75 - i * .10; g.beginPath();
        if (id === 4) { g.arc(x + inset * .25, y, width * .18 - inset, Math.PI, 0); g.lineTo(x + width * .18 - inset, height * .88); g.moveTo(x - width * .18 + inset, y); g.lineTo(x - width * .18 + inset, height * .88); }
        else g.rect(width * .47 + inset, height * .15 + i * height * .054, width * .38 - inset * 2, height * .67 - i * height * .073);
        g.stroke();
      }
    } else if (id === 6) {
      g.fillStyle = GOLD;
      for (let i = 0; i < 90; i++) { const x = width * (.59 + ((i * 47) % 107) / 107 * .30), y = height * (.14 + ((i * 31) % 101) / 101 * .69); g.globalAlpha = .13 + (i % 5) * .09; g.fillRect(x, y, 1.5 + i % 2, 1.5 + i % 2); }
    } else {
      for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(width * .83, height * (.24 + i * .12), width * (.16 + i * .014), height * .31, -.35, 0, Math.PI * 2); g.stroke(); }
    }
    g.restore();
  }

  const module = {
    get animated() { return Boolean(transition); },
    setup(ctx) {
      T = ctx.THREE; root = ctx.root; own = ctx.own; aspect = ctx.size.width / ctx.size.height;
      root.name = 'Cinematic supporting world ' + id;
      if (id === 2) buildScaffold();
      else if (id === 4) buildHistory();
      else if (id === 6) buildIntegrity();
      else if (id === 7) buildServices();
      else if (id === 8 || id === 9) buildResponsibility();
      else if (id === 10) buildVision();
    },
    activate(ctx) {
      previous = null; transition = null; aspect = ctx.size.width / ctx.size.height;
      if(id===7||id===10)root.position.y=id===7?1.15:1.45;
      ctx.setBackground({ color: null, fogNear: 24, fogFar: 85 });
      ctx.setLighting({ ambient: { color: '#c2c1d2', intensity: .72 },
        directional: { color: '#f2ddba', intensity: 1.8, position: [-3, 7, 8], castShadow: false },
        point: { color: id === 7 ? CYAN : '#d69c55', intensity: id === 7 ? 9 : 24, position: [5, 2, 5], distance: 32, decay: 2, castShadow: false } });
      if(id===7||id===10)ctx.setLighting({
        ambient:{color:'#c2bdc2',intensity:.85},
        directional:{color:'#f5dfbd',intensity:2.3,position:[-5,7,6],castShadow:false},
        point:{color:'#b4c2cf',intensity:12,position:[5,3,-5],distance:24,decay:2,castShadow:false}
      });
      ctx.camera.reset(cameraPose()); apply(0);
    },
    setBeat(index, ctx, meta = {}) {
      const target = Math.max(0, Math.min(sceneData.beats.length - 1, index));
      const backwards = previous !== null && target < previous;
      const continuous=id===7||id===10;
      const from = meta.replay ? Math.max(0, target - 1) : previous === null ? target : continuous?beat:previous;
      previous = target; aspect = ctx.size.width / ctx.size.height;
      const immediate = ctx.reducedMotion || ctx.mode !== 'webgl' || backwards;
      transition = immediate ? null : { from, to: target, elapsed: 0, duration: id === 7 ? 1.75 : id===10?1.9:1.25 };
      if(!continuous||immediate||meta.replay)ctx.camera.reset(cameraPose(immediate ? target : from, !immediate));
      if (immediate) apply(target);
      else {
        apply(from, 0);
        ctx.camera.moveTo(cameraPose(target), { duration: transition.duration * 1000, signal: ctx.signal,
          onComplete: () => { transition = null; apply(target); ctx.invalidate(); } });
      }
      ctx.invalidate();
    },
    update(dt, ctx) {
      const resized = aspect !== ctx.size.width / ctx.size.height;
      aspect = ctx.size.width / ctx.size.height;
      if (transition) {
        transition.elapsed = Math.min(transition.duration, transition.elapsed + dt);
        const t = transition.elapsed / transition.duration;
        apply(mix(transition.from, transition.to, ease(t)), ease(t), t);
        if (t >= 1) { const end = transition.to; transition = null; apply(end); }
      } else if (resized) {apply(beat);ctx.camera.reset(cameraPose(beat));}
    },
    render(ctx,renderer,scene,camera){
      // Local studio illumination; no external assets and no global environment leak.
      if(!studio && [4,6,7,9,10].includes(id)){
        const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
        const g=canvas.getContext('2d');g.fillStyle='#34303a';g.fillRect(0,0,512,256);
        const sky=g.createLinearGradient(0,0,0,256);sky.addColorStop(0,'#b6b4bc');sky.addColorStop(.48,'#514951');sky.addColorStop(1,'#171822');g.fillStyle=sky;g.fillRect(0,0,512,256);
        g.fillStyle='#e4d3b9';g.fillRect(48,24,110,85);g.fillStyle='#8c99aa';g.fillRect(325,52,65,120);
        const texture=new T.CanvasTexture(canvas);texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;
        const generator=new T.PMREMGenerator(renderer);studio=own(generator.fromEquirectangular(texture));texture.dispose();generator.dispose();
      }
      if(id===7){
        root.updateMatrixWorld(true);camera.updateMatrixWorld(true);
        const vector=new T.Vector3();
        document.querySelectorAll('.service-station').forEach((node,i)=>{
          if(!parts.stations[i])return;
          vector.set(0,3.12,-.12);parts.stations[i].group.localToWorld(vector);vector.project(camera);
          node.style.setProperty('--node-x',`${(vector.x*.5+.5)*100}%`);
          node.style.setProperty('--node-y',`${(-vector.y*.5+.5)*100}%`);
        });
        const help=document.querySelector('.service-help');
        if(help){vector.set(0,1.4,0);parts.help.localToWorld(vector);vector.project(camera);help.style.setProperty('--help-x',`${(vector.x*.5+.5)*100}%`);help.style.setProperty('--help-y',`${(-vector.y*.5+.5)*100}%`);}
      }
      if(id===10){
        root.updateMatrixWorld(true);camera.updateMatrixWorld(true);const vector=new T.Vector3();
        document.querySelectorAll('.horizon-stop').forEach((node,i)=>{
          const item=parts.gates[i];if(!item)return;
          vector.set(0,item.height-2.5,.15);item.gate.localToWorld(vector);vector.project(camera);
          node.style.setProperty('--horizon-x',`${(vector.x*.5+.5)*100}%`);
          node.style.setProperty('--horizon-y',`${(-vector.y*.5+.5)*100}%`);
        });
      }
      const oldEnvironment=scene.environment;
      try{if(studio)scene.environment=studio.texture;renderer.render(scene,camera);}finally{scene.environment=oldEnvironment;}
    },
    deactivate() { transition = null; },
    dispose() { transition = null; geometries.clear(); materials.clear(); },
    drawFallback: fallback
  };
  return module;
}

export function registerSupportingWorlds(world, { THREE, data } = {}) {
  if (!world?.registerScene || !THREE?.Group || !Array.isArray(data?.scenes)) throw new TypeError('Shared world, bundled THREE and presentation data are required');
  const modules = new Map();
  for (const id of [4, 6, 7, 8, 9, 10]) {
    const scene = data.scenes.find(item => item.id === id);
    if (!scene?.beats?.length) throw new RangeError('Supporting scene ' + id + ' is missing');
    const module = createSupportingWorld(id, scene); modules.set(id, module); world.registerScene(id, module);
  }
  return modules;
}
