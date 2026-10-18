/** Development-time assembler: node build/assemble.mjs. No installed tooling required.
 * Explicit, closed module graph; unexpected import/export syntax fails compilation.
 * Future modules must be deliberately added here rather than guessed or fetched.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Script } from 'node:vm';
import { validatePresentation } from './validate-data.mjs';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const outputPath = resolve(projectRoot, 'dist/reforming_vietnam_political_system_3d.html');
const inputs = ['shell.html', 'style.css', 'content.json', 'vendor/three.cjs', 'vendor/THREE-LICENSE.txt',
  'scene-controller.mjs', 'input-controller.mjs', 'camera-rig.mjs', 'world.js', 'bootstrap.mjs', 'scenes-intro.mjs', 'scenes-intro.css', 'scene-one-intro.mjs'];
const slots = [
  ['style', 'app-style', '__CSS__'], ['script', 'presentation-data', '__DATA__'],
  ['script', 'three-runtime', '__THREE__'], ['script', 'world-engine', '__WORLD__'], ['script', 'app-runtime', '__APP__']
];
export async function readInputs(root = projectRoot) {
  return Object.fromEntries(await Promise.all(inputs.map(async name => {
    try { return [name, await readFile(resolve(root, 'build', name), 'utf8')]; }
    catch (error) { throw new Error(`Required input build/${name}: ${error.message}`); }
  })));
}
export function serializeData(data) {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, character =>
    `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
}
function inlineJS(source) {
  // HTML raw-text terminators must never appear, even inside JavaScript strings/comments.
  const safe = source.replace(/<\/script/gi, '<\\/script');
  new Script(safe);
  return safe;
}
function moduleBody(source, expectedExports, imports = []) {
  for (const statement of imports) {
    if (source.split(statement).length !== 2) throw new Error(`Expected exactly one dependency: ${statement}`);
    source = source.replace(statement, '');
  }
  const found = [];
  source = source.replace(/^export (function|const) (\w+)/gm, (_, type, name) => {
    found.push(name); return `${type} ${name}`;
  });
  if (found.join(',') !== expectedExports.join(',')) throw new Error(`Module exports changed: ${found.join(',')}`);
  new Script(source); // Remaining module syntax is an error, not a silent partial bundle.
  return source;
}
function namespace(name, source, exports, dependencies = '', argument = '') {
  return `const ${name} = (function(${dependencies}) {\n'use strict';\n${source}\nreturn Object.freeze({${exports.join(',')}});\n})(${argument});\n`;
}
export function validateHTML(html, expectedData) {
  const fail = message => { throw new Error(`Output validation: ${message}`); };
  if (!/^<!doctype html>/i.test(html) || !/<html\b[^>]*lang="en"/i.test(html) || !/<\/body>\s*<\/html>\s*$/i.test(html)) fail('invalid document structure');
  // Only generated template regions are examined for placeholders; editable strings may use underscores.
  const skeleton = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  if (/__[A-Z][A-Z0-9_]*__/.test(skeleton)) fail('unresolved template placeholder');
  if (/<(?:script|link|img|iframe|audio|video|source|object)\b[^>]*\b(?:src|href|data)\s*=/i.test(skeleton)) fail('external resource element');
  if (/<script\b[^>]*\b(?:src\s*=|type\s*=\s*["']module)/i.test(html)) fail('external or module script');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 4) fail('expected four inline script elements');
  const dataScript = scripts.find(([_, attrs]) => attrs.includes('id="presentation-data"') && attrs.includes('type="application/json"'));
  if (!dataScript) fail('missing embedded JSON');
  const embedded = JSON.parse(dataScript[2]);
  if (JSON.stringify(embedded) !== JSON.stringify(expectedData)) fail('embedded data differs');
  for (const id of ['three-runtime', 'world-engine', 'app-runtime']) {
    const script = scripts.find(([_, attrs]) => attrs.includes(`id="${id}"`));
    if (!script || !script[2].trim()) fail(`missing ${id}`);
    new Script(script[2], { filename: id });
  }
  if (!html.includes('const CPVThree =') || !html.includes('const CPVWorld =') || !html.includes('const CPVNavigation =') || !html.includes('const CPVInput =') || !html.includes('CPVBootstrap.startPresentation(')) fail('missing linked runtime');
  const css = html.match(/<style id="app-style">([\s\S]*?)<\/style>/)?.[1];
  if (!css || /@import\b/i.test(css)) fail('missing CSS or unbundled CSS resource');
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    if (!/^(data:|#)/i.test(match[2].trim())) fail('unbundled CSS resource');
  }
  const assets = new Set((embedded.assets ?? []).map(asset => asset.id));
  for (const scene of embedded.scenes) for (const beat of scene.beats) for (const object of beat.objects ?? []) {
    if (object.assetId && !assets.has(object.assetId)) fail(`unbundled asset ${object.assetId}`);
  }
  return { scenes: embedded.scenes.length, scripts: scripts.length, assets: assets.size };
}
export function assembleHTML(files) {
  for (const name of inputs) if (typeof files[name] !== 'string' || !files[name].trim()) throw new Error(`Missing or empty input: ${name}`);
  const data = JSON.parse(files['content.json']);
  const validation = validatePresentation(data);
  if (!validation.valid) throw new Error(`Content validation: ${validation.errors.join('; ')}`);
  const css = files['style.css'] + '\n' + files['scenes-intro.css'];
  if (/<\/style/i.test(css)) throw new Error('CSS contains a raw-text terminator');
  if (/\brequire\s*\(/.test(files['vendor/three.cjs'])) throw new Error('Vendored Three.js has an unresolved require dependency');
  const license = files['vendor/THREE-LICENSE.txt'];
  if (!license.includes('The MIT License') || license.includes('*/')) throw new Error('Unexpected Three.js license');
  const three = inlineJS(`const CPVThree = (function() {\n/*\n${license}\n*/\nconst module = { exports: {} };\n(function(module, exports) {\n${files['vendor/three.cjs']}\n})(module, module.exports);\nreturn module.exports;\n})();`);
  const camera = moduleBody(files['camera-rig.mjs'], ['createCameraRig']);
  const worldExports = ['WORLD_PALETTE', 'WORLD_QUALITY', 'WORLD_LIGHTING', 'createWorldMaterial', 'collectWorldResources', 'createWorldEngine'];
  const world = moduleBody(files['world.js'], worldExports, ["import { createCameraRig } from './camera-rig.mjs';"]);
  const worldBundle = inlineJS(namespace('CPVCamera', camera, ['createCameraRig']) + namespace('CPVWorld', 'const { createCameraRig } = cameraRig;\n' + world, worldExports, 'cameraRig', 'CPVCamera'));
  const navigation = moduleBody(files['scene-controller.mjs'], ['createSceneController']);
  const input = moduleBody(files['input-controller.mjs'], ['createInputController']);
  const bootstrap = moduleBody(files['bootstrap.mjs'], ['startPresentation']);
  const openingExports = ['emblemContains', 'flagSamples', 'createOpeningPrototype'];
  const opening = moduleBody(files['scene-one-intro.mjs'], openingExports);
  const intro = moduleBody(files['scenes-intro.mjs'], ['INTRO_VISUAL', 'createIntroScenes'], ["import { createOpeningPrototype } from './scene-one-intro.mjs';"]);
  const app = inlineJS(namespace('CPVNavigation', navigation, ['createSceneController']) + namespace('CPVInput', input, ['createInputController']) +
    namespace('CPVOpening', opening, openingExports) + namespace('CPVIntro', 'const { createOpeningPrototype } = opening;\n' + intro, ['INTRO_VISUAL', 'createIntroScenes'], 'opening', 'CPVOpening') + namespace('CPVBootstrap', bootstrap, ['startPresentation']) +
    'CPVBootstrap.startPresentation({ THREE: CPVThree, ...CPVNavigation, ...CPVInput, ...CPVWorld, ...CPVIntro });');
  const payloads = [css, serializeData(data), three, worldBundle, app];
  const template = files['shell.html'];
  const templateTokens = template.match(/__[A-Z][A-Z0-9_]*__/g) ?? [];
  if (templateTokens.length !== slots.length || templateTokens.some(token => !slots.some(slot => slot[2] === token))) throw new Error('Unknown or missing template placeholder');
  // Replace ONLY each expected tag's whole placeholder body; reject duplicate/misplaced tokens.
  for (const [index, [tag, id, token]] of slots.entries()) {
    if (template.split(token).length !== 2) throw new Error(`Template must contain exactly one ${token}`);
    const pattern = new RegExp(`(<${tag}\\b[^>]*\\bid="${id}"[^>]*>)${token}(</${tag}>)`, 'g');
    if ([...template.matchAll(pattern)].length !== 1) throw new Error(`Incorrect context for ${token}`);
  }
  // Single pass over the template prevents embedded user strings from becoming placeholders.
  const html = template.replace(/(<(?:script|style)\b[^>]*>)(__CSS__|__DATA__|__THREE__|__WORLD__|__APP__)(<\/(?:script|style)>)/g,
    (_, open, token, close) => open + payloads[slots.findIndex(slot => slot[2] === token)] + close);
  validateHTML(html, data);
  return html;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const html = assembleHTML(await readInputs());
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, 'utf8');
    console.log(`${outputPath}\n${Buffer.byteLength(html)} bytes (${(Buffer.byteLength(html) / 1048576).toFixed(3)} MiB)`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
