import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createIntroScenes } from '../build/scenes-intro.mjs';
import { createSceneController } from '../build/scene-controller.mjs';
import { createRequire } from 'node:module';
import { createCameraRig } from '../build/camera-rig.mjs';
const THREE = createRequire(import.meta.url)('../build/vendor/three.cjs');
const data = JSON.parse(await readFile(new URL('../build/content.json', import.meta.url)));

function fixture(reduced = false) {
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  const portrait = Object.assign(new EventTarget(), { matches: false });
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const animations = [], elements = [];
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.style = {}; this.dataset = {}; this.attributes = {}; this.ownerDocument = doc; this.hidden = false; this.ownText = ''; elements.push(this); }
    set textContent(value) { this.ownText = value; this.children = []; }
    get textContent() { return this.ownText + this.children.map(node => node.textContent).join(''); }
    set className(value) { this.classes = new Set(value.split(' ')); }
    get className() { return [...(this.classes ?? [])].join(' '); }
    get classList() { return { toggle: (name, value) => value ? this.classes.add(name) : this.classes.delete(name), contains: name => this.classes.has(name) }; }
    setAttribute(key, value) { this.attributes[key] = String(value); if (key === 'id') this.id = value; if (key === 'class') this.className = value; }
    append(...nodes) { for (const node of nodes) { node.remove(); node.parentNode = this; this.children.push(node); } }
    replaceChildren(...nodes) { for (const child of this.children) child.parentNode = null; this.children = []; this.ownText = ''; this.append(...nodes); }
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(node => node !== this); this.parentNode = null; }
    animate(frames, options) {
      let reject;
      const animation = { frames, options, canceled: false, finished: new Promise((_, fail) => { reject = fail; }), cancel() { this.canceled = true; reject(new Error('canceled')); } };
      animations.push(animation); return animation;
    }
  }
  doc.createElement = tag => new Element(tag); doc.createElementNS = (_, tag) => new Element(tag);
  const win = { matchMedia: query => query.includes('reduced') ? motion : portrait }; doc.defaultView = win;
  const content = new Element('div');
  const intro = createIntroScenes({ data, content, document: doc, window: win });
  const modules = new Map(); intro.register({ registerScene: (id, module) => modules.set(id, module) });
  const find = id => elements.findLast(element => element.id === id);
  return { intro, modules, find, content, animations, motion, portrait, doc };
}
test('only two scenes register; opening identity and full approved question use both real beats', () => {
  const f = fixture(); assert.deepEqual([...f.modules.keys()], [1,2]);
  const scene = f.modules.get(1); scene.setup(); scene.activate(); scene.setBeat(0);
  assert.equal(f.find('intro-opening-heading').textContent, data.title);
  for (const member of data.members) assert.ok(f.content.textContent.includes(member));
  assert.ok(f.content.textContent.includes(data.topic));
  scene.setBeat(1);
  assert.equal(f.find('intro-opening-heading').textContent, 'How can reform make Vietnam’s political system work better for its people?');
  assert.equal(f.find('intro-scene-1').dataset.beat, '1');
  f.intro.destroy();
});
test('system encloses Party and institutions, excludes people, and preserves directed relationships', () => {
  const f = fixture(), scene = f.modules.get(2); scene.activate(); scene.setBeat(2);
  const boundary = f.find('intro-system-boundary');
  assert.ok(boundary.children.includes(f.find('intro-party')));
  assert.ok(boundary.children.includes(f.find('intro-state')));
  assert.ok(!boundary.children.includes(f.find('intro-people')));
  assert.equal(f.find('intro-people').parentNode.id, 'intro-institution-diagram');
  assert.match(f.find('intro-party').textContent, /part of the system/);
  assert.match(f.find('intro-state').textContent, /under the law/);
  assert.match(f.find('intro-front').textContent, /Vietnam Fatherland Front/);
  assert.match(f.find('intro-organizations').textContent, /Socio-political organisations/);
  assert.match(f.find('intro-people').textContent, /exercise their right to mastery/);
  const groups = f.find('intro-institution-connections').children.slice(1);
  assert.equal(groups[0].children.length, 3);
  assert.ok(groups[0].children.every(path => path.attributes.d.startsWith('M 550 115') && path.attributes['marker-end']));
  assert.equal(groups[2].children.length, 2);
  assert.ok(groups[2].children.every(path => path.attributes.d.startsWith('M 625 387')));
  f.intro.destroy();
});
test('progressive disclosure, reverse and direct entry are deterministic', () => {
  const f = fixture(), scene = f.modules.get(2); scene.activate();
  for (const beat of [2,0,1,2,1,0,2]) {
    scene.setBeat(beat);
    assert.equal(f.find('intro-system-heading').textContent, data.scenes[1].beats[beat].audience.heading);
    assert.equal(f.find('intro-state').hidden, beat < 1);
    assert.equal(f.find('intro-scene-2').dataset.beat, String(beat));
    assert.equal(f.find('intro-people').children.at(-1).hidden, beat < 2);
  }
  assert.throws(() => scene.setBeat(3), RangeError); f.intro.destroy();
});
test('actual T05 beat traversal, replay and rapid boundary changes leave one correct scene', () => {
  const f = fixture(), navigation = createSceneController(data); let active = null, abort = null;
  const sync = state => {
    abort?.abort(); abort = new AbortController();
    if (active !== state.sceneId) { f.modules.get(active)?.deactivate(); f.modules.get(state.sceneId)?.activate(); active = state.sceneId; }
    f.modules.get(state.sceneId)?.setBeat(state.beatIndex, { signal: abort.signal });
  };
  const unsubscribe = navigation.subscribe(sync); sync(navigation.getState());
  for (let i = 0; i < 4; i++) navigation.next();
  assert.equal(navigation.getState().sceneId, 2); assert.equal(navigation.getState().beatIndex, 2);
  navigation.replay(); assert.equal(f.find('intro-scene-2').dataset.beat, '2');
  navigation.previous(); navigation.goToScene(1,1); navigation.goToScene(2,0);
  const stale = [...f.animations]; navigation.goToScene(1,0);
  assert.equal(f.content.children.length, 1); assert.equal(f.content.children[0].id, 'intro-scene-1');
  assert.ok(stale.every(animation => animation.canceled));
  unsubscribe(); navigation.destroy(); f.intro.destroy();
});
test('beat abort, scene cleanup, reduced motion and hidden document cancel animation without losing meaning', () => {
  const f = fixture(), scene = f.modules.get(1); scene.activate();
  const abort = new AbortController(); scene.setBeat(1, { signal: abort.signal }); abort.abort();
  assert.ok(f.animations.every(animation => animation.canceled));
  scene.setBeat(1); f.motion.matches = true; f.motion.dispatchEvent(new Event('change'));
  assert.ok(f.animations.every(animation => animation.canceled));
  const before = f.animations.length; scene.setBeat(1); assert.equal(f.animations.length, before);
  assert.ok(f.content.textContent.includes('Vietnam’s political system'));
  scene.deactivate(); assert.equal(f.content.children.length,0);
  scene.activate(); scene.setBeat(0, { reducedMotion:true }); assert.equal(f.animations.length, before);
  f.intro.destroy(); assert.equal(f.content.children.length,0);
  f.motion.dispatchEvent(new Event('change')); f.doc.dispatchEvent(new Event('visibilitychange'));
  const reduced = fixture(true); reduced.modules.get(2).activate(); reduced.modules.get(2).setBeat(2);
  assert.equal(reduced.animations.length,0); assert.ok(reduced.content.textContent.includes('right to mastery')); reduced.intro.destroy();
});
test('engine-unavailable adapter preserves both views and releases scene elements on departure', () => {
  const f = fixture(); f.intro.renderFallback({ sceneId:2, beatIndex:2 });
  assert.equal(f.content.children[0].id, 'intro-scene-2');
  f.intro.renderFallback({ sceneId:1, beatIndex:1 }); assert.equal(f.content.children[0].id, 'intro-scene-1');
  f.intro.renderFallback({ sceneId:3, beatIndex:0 }); assert.equal(f.content.children.length,0);
  f.intro.destroy();
});
test('shared-engine disposal followed by bootstrap disposal is idempotent, including uninitialized scenes', () => {
  const f = fixture(); f.modules.get(1).activate(); f.modules.get(1).setBeat(0);
  for (const module of f.modules.values()) module.dispose();
  assert.doesNotThrow(() => { f.intro.destroy(); f.intro.destroy(); });
  assert.equal(f.content.children.length, 0);
  assert.ok(f.animations.every(animation => animation.canceled));
});
test('existing question network reuses resources and camera settles, cancels, and replays deterministically', () => {
  const f = fixture(), scene = f.modules.get(1), root = new THREE.Group(), camera = createCameraRig(THREE);
  const resources = [], abort = new AbortController();
  const ctx = { THREE, root, camera, mode:'webgl', own:resource => { resources.push(resource); return resource; }, signal:abort.signal };
  scene.setup(ctx); scene.activate(); scene.setBeat(1,ctx);
  assert.equal(root.children.length,1); const resourceCount = resources.length;
  assert.equal(root.children[0].children.length,2);
  const vertices=()=>Array.from(root.children[0].children[0].geometry.attributes.position.array);
  const seed=vertices();
  assert.ok(camera.isTransitioning()); camera.update(2100); assert.equal(camera.isTransitioning(),false);
  assert.notDeepEqual(vertices(),seed);
  scene.setBeat(1,ctx); camera.update(100); abort.abort(); assert.equal(camera.isTransitioning(),false);
  const next = { ...ctx, signal:new AbortController().signal };
  scene.setBeat(1,next); camera.update(2100); const question = camera.getPose(), finalVertices=vertices();
  scene.setBeat(1,next); camera.update(2100); assert.deepEqual(camera.getPose(),question);
  scene.update(.1,next); assert.deepEqual(vertices(),finalVertices);
  scene.setBeat(1,{ ...next,reducedMotion:true }); assert.equal(camera.isTransitioning(),false);
  assert.deepEqual(camera.getPose(),question); assert.equal(resources.length,resourceCount);
  scene.setBeat(1,{ ...next,reducedMotion:true }); assert.deepEqual(camera.getPose(),question);
  f.intro.destroy(); for (const resource of resources) resource.dispose();
});
test('the institutional transition starts at the opening network and restores each beat without stale morphs', () => {
  const f=fixture(), resources=[];
  const context=()=>({THREE,root:new THREE.Group(),camera:createCameraRig(THREE),mode:'webgl',signal:new AbortController().signal,own:r=>{resources.push(r);return r;}});
  const a=context(),b=context(),opening=f.modules.get(1),system=f.modules.get(2);
  const positions=c=>Array.from(c.root.children[0].children[0].geometry.attributes.position.array);
  opening.setup(a);opening.setBeat(1,{...a,reducedMotion:true});const network=positions(a);
  system.setup(b);system.setBeat(0,b);assert.deepEqual(positions(b),network);
  b.camera.update(2100);assert.notDeepEqual(positions(b),network);
  system.setBeat(2,b);b.camera.update(2100);const completed=positions(b),count=resources.length;
  system.setBeat(0,b);system.setBeat(2,b);b.camera.update(2100);assert.deepEqual(positions(b),completed);
  system.setBeat(1,b);b.camera.update(100);b.camera.setReducedMotion(true);
  const reduced=positions(b);system.setBeat(1,{...b,reducedMotion:true});assert.deepEqual(positions(b),reduced);
  assert.equal(resources.length,count);f.intro.destroy();for(const resource of resources)resource.dispose();
});
