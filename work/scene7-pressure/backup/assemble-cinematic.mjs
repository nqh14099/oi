import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {validatePresentation} from './validate-data.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFile(resolve(root,'build',name),'utf8');
function bundle(name,source,names,bindings=''){
  source=source.replace(/^import [^\n]+\n/gm,'').replace(/^export (function|const) /gm,'$1 ');
  new Script(source);
  return `const ${name}=(()=>{${bindings}\n${source}\nreturn {${names.join(',')}};})();\n`;
}
const names=['cinematic-shell.html','cinematic.css','content.json','vendor/three.cjs','vendor/THREE-LICENSE.txt','camera-rig.mjs','world.js','scene-controller.mjs','input-controller.mjs','cinematic-flag.mjs','cinematic-citizen.mjs','cinematic-maze.mjs','restructure-scene.mjs','cinematic-worlds.mjs','cinematic-registration.mjs','cinematic-scenes.mjs','cinematic-runtime.mjs','cinematic-system.mjs','system-sculptures.mjs','cinematic-archives.mjs','cinematic-numbers.mjs','assets/vietnam-map-regions.json'];
const f=Object.fromEntries(await Promise.all(names.map(async n=>[n,await read(n)])));
const data=JSON.parse(f['content.json']),validation=validatePresentation(data);
if(!validation.valid)throw Error(validation.errors.join('; '));
const safeJSON=x=>JSON.stringify(x).replace(/[<>&\u2028\u2029]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
const three=`const CPVThree=(()=>{const module={exports:{}};/*${f['vendor/THREE-LICENSE.txt']}*/\n(function(module,exports){${f['vendor/three.cjs']}\n})(module,module.exports);return module.exports;})();`;
const world=bundle('CPVCamera',f['camera-rig.mjs'],['createCameraRig'])+bundle('CPVWorld',f['world.js'],['createWorldEngine'],'const {createCameraRig}=CPVCamera;');
const app=bundle('CPVNumbers',f['cinematic-numbers.mjs'],['createCinematicNumberAnimator'])+bundle('CPVNavigation',f['scene-controller.mjs'],['createSceneController'])+
  bundle('CPVInput',f['input-controller.mjs'],['createInputController'])+
  bundle('CPVFlag',f['cinematic-flag.mjs'],['createCinematicFlag','flagReference'])+
  bundle('CPVCitizen',f['cinematic-citizen.mjs'],['createCitizenFigure'])+
  bundle('CPVMaze',f['cinematic-maze.mjs'],['createMazeScene'],'const {createCitizenFigure}=CPVCitizen;')+
  bundle('CPVMap',f['restructure-scene.mjs'],['createRestructureScene'],`const MAP_REGIONS=${safeJSON(JSON.parse(f['assets/vietnam-map-regions.json']))};`)+
  bundle('CPVSupport',f['cinematic-worlds.mjs'],['registerSupportingWorlds'],'const {createCitizenFigure}=CPVCitizen;')+
  bundle('CPVArchives',f['cinematic-archives.mjs'],['createArchiveScene'])+
  bundle('CPVSystemSculptures',f['system-sculptures.mjs'],['createSystemSculptures'])+
  bundle('CPVSystem',f['cinematic-system.mjs'],['createPoliticalSystemScene'],`const {createSystemSculptures}=CPVSystemSculptures;const SYSTEM_HALL_PLATE="data:image/jpeg;base64,${(await readFile(resolve(root,'build/assets/scene2/hall-plate.jpg'))).toString('base64')}";const EMBLEM_CONTOURS=${f['cinematic-flag.mjs'].match(/const EMBLEM_CONTOURS = (.*);/)[1]};const SYSTEM_MAP=${safeJSON(JSON.parse(f['assets/vietnam-map-regions.json']).before.flatMap(r=>r.polys.map(p=>p[0])))};`)+
  bundle('CPVRegistration',f['cinematic-registration.mjs'],['registerCinematicWorld'],'const {createArchiveScene}=CPVArchives;const {createPoliticalSystemScene}=CPVSystem;const {createCinematicFlag,flagReference}=CPVFlag;const {createMazeScene}=CPVMaze;const {createRestructureScene}=CPVMap;const {registerSupportingWorlds}=CPVSupport;')+
  bundle('CPVViews',f['cinematic-scenes.mjs'],['createCinematicViews'])+
  bundle('CPVRuntime',f['cinematic-runtime.mjs'],['startCinematicPresentation'])+
  'CPVRuntime.startCinematicPresentation({THREE:CPVThree,...CPVNavigation,...CPVInput,...CPVWorld,...CPVRegistration,...CPVViews,...CPVNumbers});';
for(const [id,s]of Object.entries({three,world,app}))new Script(s,{filename:id});
const payloads={__CSS__:f['cinematic.css'],__DATA__:safeJSON(data),__THREE__:three,__WORLD__:world,__APP__:app};
let html=f['cinematic-shell.html'].replace(/__[A-Z]+__/g,t=>{if(!(t in payloads))throw Error('Unknown slot '+t);return t==='__CSS__'?payloads[t]:payloads[t].replace(/<\/script/gi,'<\\/script');});
if(/<script[^>]+src=|<link[^>]+href=|@import\b/i.test(html))throw Error('External dependency');
for(const s of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!s[1].includes('application/json'))new Script(s[2]);
await mkdir(resolve(root,'dist'),{recursive:true});
const output=resolve(root,'dist/reforming_vietnam_complete.html');await writeFile(output,html,'utf8');
console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),scenes:data.scenes.length,chapters:data.chapters.length,inlineScripts:4}));
