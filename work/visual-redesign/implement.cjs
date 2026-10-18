const fs=require('node:fs');
const file='build/cinematic-worlds.mjs';let s=fs.readFileSync(file,'utf8');
function block(start,end,text){const a=s.indexOf(start),b=s.indexOf(end,a);if(a<0||b<0)throw Error(start);s=s.slice(0,a)+text+'\n\n'+s.slice(b);}
block('  function buildHistory()', '  function buildIntegrity()', `  function buildHistory() {
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
  }`);
block('  function buildIntegrity()', '  function buildServices()', `  function buildIntegrity() {
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
  }`);
block('  function buildResponsibility()', '  function buildVision()', `  function buildResponsibility() {
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
  }`);
s=s.replace("parts.arches.forEach((arch, i) => { arch.position.x = 3.75 + i * mix(.21, .09, clamp(value / 2)); arch.rotation.y = -.13 + value * .035; arch.scale.y = mix(.96, 1, entry); });\n      parts.layers.forEach((layer, i) => { layer.visible = value > .05; layer.scale.x = .56 + clamp(value) * .44; layer.position.y = -3.2 + i * mix(1.55, 1.05, clamp(value - 1)); layer.position.x = 4 + (1 - clamp(value)) * (i - 1) * .7; });", "parts.layers.forEach((layer,i)=>{const active=1-clamp(Math.abs(value-i));layer.position.z=-i*.25+active*.9;layer.position.x=4.1+(i-value)*.30;layer.rotation.z=-.055+(i-value)*.035;});");
s=s.replace('parts.leaves?.forEach((leaf, i) => { leaf.rotation.y = .16 + clamp(value - i) * .1; });','parts.actions?.forEach((object,i)=>{object.visible=i===Math.round(value);object.rotation.y=-.25+value*.06;});');
s=s.replace('parts.person.scale.setScalar(1.25)','parts.person.scale.setScalar(1.02)').replace('new T.Vector3(-1.85,.10,2.8)','new T.Vector3(-1.85,.10,1.25)').replace('vector.set(0,2.6,-.12)','vector.set(0,3.12,-.12)').replace('prop.scale.setScalar(1.65)','prop.scale.setScalar(1.90)');
s=s.replace("mesh(new T.TubeGeometry(curve,80,i===0?.085:.055,8,false)","mesh(new T.TubeGeometry(curve,80,i===0?.15:.11,12,false)");
s=s.replace("new T.BoxGeometry(width+.25,.09,1.3)","new T.BoxGeometry(width+.25,.16,1.3)");
fs.writeFileSync(file,s);
// Remove disconnected SVG flame; the bowl and flame now share true 3D space.
const views='build/cinematic-scenes.mjs';let v=fs.readFileSync(views,'utf8');v=v.replace(/<svg class="integrity-flame"[\s\S]*?<\/svg>/,'');
v=v.replace('<div class="commitment-numeral" aria-hidden="true">${String(i + 1).padStart(2, \'0\')}</div>','');
fs.writeFileSync(views,v);
