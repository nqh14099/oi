import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {Script} from 'node:vm';
const names=['vendor/three.cjs','vendor/THREE-LICENSE.txt','camera-rig.mjs','world.js','scene-controller.mjs','input-controller.mjs','restructure-scene.mjs','restructure-prototype.mjs','restructure-prototype.html','content.json','assets/vietnam-map-regions.json'];
const texts=await Promise.all(names.map(n=>readFile(new URL(n,import.meta.url),'utf8'))),files=Object.fromEntries(names.map((n,i)=>[n,texts[i]]));
const body=(name,imports=[])=>{let s=files[name];for(const statement of imports){if(!s.includes(statement))throw new Error('Missing dependency '+statement);s=s.replace(statement,'');}s=s.replace(/^export (function|const) /gm,'$1 ');new Script(s);return s;};
const ns=(name,file,exports,imports=[])=>`const ${name}=(()=>{${body(file,imports)}\nreturn {${exports}};})();\n`;
let runtime=`'use strict';const THREE=(()=>{/*${files['vendor/THREE-LICENSE.txt']}*/const module={exports:{}};(function(module,exports){${files['vendor/three.cjs']}\n})(module,module.exports);return module.exports;})();\n`;
runtime+='const MAP_REGIONS='+files['assets/vietnam-map-regions.json']+';';
runtime+=ns('cameraModule','camera-rig.mjs','createCameraRig');runtime+='const {createCameraRig}=cameraModule;\n';
runtime+=ns('worldModule','world.js','createWorldEngine',["import { createCameraRig } from './camera-rig.mjs';"]);
runtime+=ns('navModule','scene-controller.mjs','createSceneController')+ns('inputModule','input-controller.mjs','createInputController')+ns('restructureModule','restructure-scene.mjs','createRestructureScene');
runtime+=body('restructure-prototype.mjs')+`\nstartRestructurePrototype(THREE,${JSON.stringify(JSON.parse(files['content.json'])).replace(/</g,'\\u003c')},{...worldModule,...navModule,...inputModule,...restructureModule});`;
new Script(runtime);const html=files['restructure-prototype.html'].replace('__RUNTIME__',()=>runtime.replace(/<\/script/gi,'<\\/script'));
if(/<(?:script|img|iframe)[^>]+src=|<link[^>]+href=/i.test(html.slice(0,html.indexOf('<script>'))))throw new Error('Unexpected network dependency');
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});await writeFile(new URL('../dist/restructuring_63_to_34.html',import.meta.url),html);console.log('Created dist/restructuring_63_to_34.html (offline, Scene 5 only)');



