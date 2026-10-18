// Standalone inspection page. Existing presentation assembler/runtime stay intact.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>readFile(new URL(name,import.meta.url),'utf8');
const [three,license,reference,flag,runtime,template,svg]=await Promise.all(['vendor/three.cjs','vendor/THREE-LICENSE.txt','scene-one-intro.mjs','particle-flag.mjs','flag-prototype.mjs','flag-prototype.html','assets/party-flag-reference.svg'].map(read));
const moduleBody=(s,imports=[])=>{for(const statement of imports){if(s.split(statement).length!==2)throw new Error('Unexpected prototype dependency');s=s.replace(statement,'');}s=s.replace(/^export (function|const) /gm,'$1 ');new Script(s);return s;};
const ref=moduleBody(reference),cloth=moduleBody(flag,["import { emblemContains } from './scene-one-intro.mjs';"]),app=moduleBody(runtime,["import { createParticleFlag } from './particle-flag.mjs';"]);
const bundle=`'use strict';const THREE=(function(){/*${license}*/const module={exports:{}};(function(module,exports){${three}\n})(module,module.exports);return module.exports;})();
const flagReference=(function(){${ref}\nreturn {emblemContains};})();
const cloth=(function(){const {emblemContains}=flagReference;${cloth}\nreturn {createParticleFlag};})();
(function(){const {createParticleFlag}=cloth;${app}\nstartFlagPrototype(THREE);})();`;
new Script(bundle);const html=template.replace('__RUNTIME__',()=>bundle.replace(/<\/script/gi,'<\\/script')).replace('__FALLBACK__',()=>`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
if(/__[A-Z]+__/.test(html.replace(/<script>[\s\S]*?<\/script>/,'').replace(/src="[^"]*"/,'')))throw new Error('Unresolved prototype slot');
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});const out=new URL('../dist/particle_flag_prototype.html',import.meta.url);await writeFile(out,html);console.log(fileURLToPath(out)+'\n'+Buffer.byteLength(html)+' bytes');
