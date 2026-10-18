import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createWorldEngine, createWorldMaterial } from '../build/world.js';
import { createCameraRig } from '../build/camera-rig.mjs';
import { createSceneController } from '../build/scene-controller.mjs';
const require = createRequire(import.meta.url), THREE = require('../build/vendor/three.cjs');
const content = JSON.parse(readFileSync(new URL('../build/content.json', import.meta.url), 'utf8'));
class Target extends EventTarget {
  callbacks = new Map();
  addEventListener(type, fn, options) { if (!this.callbacks.has(type)) this.callbacks.set(type, new Set()); this.callbacks.get(type).add(fn); super.addEventListener(type, fn, options); }
  removeEventListener(type, fn, options) { this.callbacks.get(type)?.delete(fn); super.removeEventListener(type, fn, options); }
  count() { return [...this.callbacks.values()].reduce((n, set) => n + set.size, 0); }
}
function harness({ webgl = true, rendererThrows = false, reducedMotion = false, navigation } = {}) {
  const win = new Target(), doc = new Target(), canvas = new Target(), fallbackCanvas = new Target(), media = new Target();
  let id = 0, instances = 0, observerCount = 0, disconnected = 0;
  const frames = new Map(), renderers = [], errors = [], fills = [];
  win.devicePixelRatio = 3; win.requestAnimationFrame = fn => { frames.set(++id, fn); return id; }; win.cancelAnimationFrame = token => frames.delete(token);
  win.ResizeObserver = class { constructor(fn) { this.fn = fn; observerCount++; } observe() {} disconnect() { disconnected++; } };
  media.matches = reducedMotion; win.matchMedia = () => media; doc.hidden = false;
  canvas.style = { display: '' }; fallbackCanvas.style = { display: 'none' };
  canvas.ownerDocument = doc; doc.defaultView = win;
  canvas.getBoundingClientRect = fallbackCanvas.getBoundingClientRect = () => ({ width: 960, height: 540 });
  canvas.getContext = kind => kind === 'webgl2' && webgl ? {} : null;
  const ctx = { clearRect() {}, createLinearGradient: () => ({ addColorStop() {} }), fillRect: (...args) => fills.push(args) };
  fallbackCanvas.getContext = kind => kind === '2d' ? ctx : null;
  class Renderer {
    constructor(config) { instances++; if (rendererThrows) throw new Error('GPU init failed'); this.config = config; this.shadowMap = {}; this.renders = 0; this.disposals = 0; renderers.push(this); }
    setPixelRatio(n) { this.ratio = n; }
    setClearColor(...args) { this.clearColor = args; }
    setSize(w, h, css) { this.size = [w, h]; this.updatesCSS = css; }
    render(scene, camera) { this.renders++; this.lastScene = scene; this.lastCamera = camera; }
    dispose() { this.disposals++; }
    forceContextLoss() { this.lost = true; }
  }
  const engine = createWorldEngine({ THREE: { ...THREE, WebGLRenderer: Renderer }, canvas, fallbackCanvas, navigation,
    document: doc, window: win, onError: e => errors.push(e) });
  const step = (time = 0) => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); };
  return { engine, win, doc, canvas, fallbackCanvas, media, frames, renderers, errors, fills, step,
    counts: () => ({ instances, observerCount, disconnected, listeners: win.count() + doc.count() + canvas.count() + media.count() }) };
}
test('one renderer, shared scene/cameras, idempotent initialization and deterministic resize', () => {
  const h = harness(); h.engine.initialize(); h.engine.initialize();
  assert.equal(h.counts().instances, 1); assert.equal(h.counts().listeners, 5); assert.equal(h.counts().observerCount, 1);
  assert.equal(h.renderers[0].ratio, 2); assert.equal(h.renderers[0].updatesCSS, false);
  assert.equal(h.engine.camera.perspective.aspect, 16 / 9);
  h.engine.resize(390, 270); assert.equal(h.engine.camera.perspective.aspect, 390 / 270);
  assert.equal(h.engine.camera.orthographic.right / h.engine.camera.orthographic.top, 390 / 270);
  assert.throws(() => h.engine.resize(0, 10), RangeError); h.engine.destroy();
});
test('scene setup caches once, activation/deactivation order and active-only updates', () => {
  const h = harness(), log = []; const module = id => ({ animated: true,
    setup: ctx => { log.push('setup' + id); ctx.root.add(new THREE.Group()); }, activate: () => log.push('activate' + id),
    deactivate: () => log.push('deactivate' + id), update: () => log.push('update' + id), dispose: () => log.push('dispose' + id) });
  h.engine.registerScene(1, module(1)); h.engine.registerScene(2, module(2)); h.engine.initialize();
  h.engine.activateScene(1); h.step(); h.engine.activateScene(2); h.step(16); h.engine.activateScene(1); h.step(32);
  assert.equal(log.filter(v => v === 'setup1').length, 1); assert.equal(log.filter(v => v === 'update2').length, 1);
  assert.ok(log.indexOf('deactivate1') < log.indexOf('activate2')); assert.equal(h.renderers[0].lastScene.children.filter(c => c.type === 'Group').length, 1);
  h.engine.disposeScene(1); assert.equal(h.engine.disposeScene(1), false); h.engine.destroy();
  assert.equal(log.filter(v => v === 'dispose1').length, 1);
});
test('static scenes render on demand and pause/hidden tabs stop RAF', () => {
  const h = harness(); h.engine.registerScene(1, {}); h.engine.initialize(); h.engine.activateScene(1); h.step();
  assert.equal(h.frames.size, 0); const renders = h.renderers[0].renders;
  h.engine.invalidate(); h.engine.pause(); assert.equal(h.frames.size, 0); h.step(500); assert.equal(h.renderers[0].renders, renders);
  h.engine.resume(); h.doc.hidden = true; h.doc.dispatchEvent(new Event('visibilitychange')); assert.equal(h.frames.size, 0);
  h.engine.resume(); assert.equal(h.frames.size, 0); h.doc.hidden = false; h.doc.dispatchEvent(new Event('visibilitychange')); assert.equal(h.frames.size, 1);
  h.step(1000); assert.equal(h.frames.size, 0); h.engine.destroy();
});
test('camera projection/position/target interpolation, reset and cancellation are deterministic', () => {
  const rig = createCameraRig(THREE), canceled = [], completed = [];
  const first = rig.moveTo({ position: [10, 0, 12], target: [2, 0, 0] }, { duration: 100, onCancel: reason => canceled.push(reason) });
  rig.update(50); assert.equal(rig.getPose().position[0], 5); assert.equal(rig.getPose().target[0], 1);
  rig.moveTo({ projection: 'orthographic', position: [0, 0, 20], orthoHeight: 20 }, { duration: 100, onComplete: () => completed.push('done') });
  assert.equal(first.isCurrent(), false); rig.update(100); assert.equal(rig.camera, rig.orthographic);
  assert.deepEqual(rig.getPose().position, [0, 0, 20]); assert.deepEqual(completed, ['done']); assert.deepEqual(canceled, ['superseded']);
  rig.reset(); assert.equal(rig.camera, rig.perspective); assert.deepEqual(rig.getPose().position, [0, 0, 12]);
  const signal = new AbortController(); rig.moveTo({ position: [10, 0, 0] }, { signal: signal.signal }); signal.abort();
  assert.equal(rig.isTransitioning(), false); assert.throws(() => rig.moveTo({ zoom: 0 }), RangeError);
});
test('scene changes cancel outdated camera/beat work and restore the baseline', () => {
  const h = harness(), contexts = [];
  h.engine.registerScene(1, { setBeat: (n, ctx) => { contexts.push(ctx); ctx.camera.moveTo({ position: [10, 0, 12] }, { duration: 1000, signal: ctx.signal }); } });
  h.engine.registerScene(2, {}); h.engine.initialize(); h.engine.activateScene(1); h.engine.setBeat(0); h.step(0); h.step(50);
  h.engine.setBeat(1); assert.ok(contexts[0].signal.aborted); assert.equal(contexts[0].isCurrent(), false);
  h.engine.activateScene(2); assert.ok(contexts[1].signal.aborted); assert.equal(h.engine.camera.isTransitioning(), false);
  assert.deepEqual(h.engine.camera.getPose().position, [0, 0, 12]); h.engine.destroy();
});
test('reduced motion snaps a pending camera to its target and stops continuous updates', () => {
  const h = harness(); let updates = 0;
  h.engine.registerScene(1, { animated: true, update: () => updates++ }); h.engine.initialize(); h.engine.activateScene(1);
  h.engine.camera.moveTo({ position: [20, 0, 12] }); h.engine.setReducedMotion(true); h.step();
  assert.equal(h.engine.camera.getPose().position[0], 20); assert.equal(h.frames.size, 0); assert.equal(updates, 0);
  h.engine.setReducedMotion(false); h.step(100); assert.equal(updates, 1); h.engine.destroy();
});
test('quality and lighting switching preserve the active scene and camera position', () => {
  const h = harness(); h.engine.registerScene(1, {}); h.engine.initialize(); h.engine.activateScene(1);
  h.engine.camera.moveTo({ position: [3, 4, 20] }, { duration: 0 }); h.engine.setQuality('low');
  assert.equal(h.renderers[0].ratio, 1); assert.equal(h.renderers[0].shadowMap.enabled, false); assert.equal(h.engine.getStatus().activeSceneId, 1);
  h.engine.setLighting({ ambient: { intensity: 0.5 }, directional: { castShadow: true } }); h.engine.setQuality('high');
  h.engine.setLighting('subdued'); h.engine.setLighting('cinematic');
  assert.throws(() => h.engine.setLighting('missing'), RangeError);
  assert.equal(h.renderers[0].shadowMap.enabled, true); assert.deepEqual(h.engine.camera.getPose().position, [3, 4, 20]);
  assert.equal(h.counts().instances, 1); assert.throws(() => h.engine.setQuality('ultra'), RangeError); h.engine.destroy();
});
test('owned/shared geometry, materials and textures dispose once at the final registered owner', () => {
  const h = harness(), counts = { geometry: 0, material: 0, texture: 0 };
  const geometry = new THREE.BoxGeometry(), texture = new THREE.Texture(), material = createWorldMaterial(THREE, 'gold', { map: texture, opacity: 0.5 });
  geometry.addEventListener('dispose', () => counts.geometry++); material.addEventListener('dispose', () => counts.material++); texture.addEventListener('dispose', () => counts.texture++);
  assert.equal(material.transparent, true); assert.equal(material.depthWrite, false);
  for (const id of [1, 2]) h.engine.registerScene(id, { setup: ctx => ctx.root.add(new THREE.Mesh(geometry, [material, material])) });
  h.engine.initialize(); h.engine.activateScene(1); h.engine.activateScene(2); h.engine.disposeScene(1);
  assert.deepEqual(counts, { geometry: 0, material: 0, texture: 0 }); h.engine.disposeScene(2); h.engine.destroy();
  assert.deepEqual(counts, { geometry: 1, material: 1, texture: 1 });
});
test('WebGL2-unavailable and renderer failures use 2D fallback without owning DOM navigation', () => {
  for (const options of [{ webgl: false }, { rendererThrows: true }]) {
    const nav = createSceneController(content), h = harness({ ...options, navigation: nav }); let drawn = 0;
    h.engine.registerScene(1, { drawFallback: () => drawn++ }); h.engine.initialize(); h.step();
    assert.equal(h.engine.getStatus().mode, 'fallback'); assert.equal(h.canvas.style.display, 'none'); assert.equal(h.fallbackCanvas.style.display, 'block');
    assert.ok(h.fills.length > 0); assert.equal(drawn, 1); nav.next(); assert.equal(nav.getState().beatIndex, 1);
    assert.equal(h.engine.getStatus().mode, 'fallback'); h.engine.destroy(); nav.destroy();
  }
});
test('context loss switches fallback, restoration reuses the original renderer', () => {
  const h = harness(); h.engine.initialize(); h.step();
  const event = new Event('webglcontextlost', { cancelable: true }); h.canvas.dispatchEvent(event);
  assert.ok(event.defaultPrevented); assert.equal(h.engine.getStatus().reason, 'context-lost'); h.step(16);
  h.canvas.dispatchEvent(new Event('webglcontextrestored')); h.step(32);
  assert.equal(h.engine.getStatus().mode, 'webgl'); assert.equal(h.counts().instances, 1); h.engine.destroy();
});
test('T05 is authoritative: initial registration, rapid changes, replay and unregistered scenes', () => {
  const navigation = createSceneController(content), h = harness({ navigation }), calls = [];
  h.engine.initialize(); h.engine.registerScene(1, { setBeat: (n, ctx, meta) => calls.push([n, ctx.navigationState.beatId, meta.replay]) });
  navigation.next(); navigation.replay(); assert.deepEqual(calls, [[0, 's01-b01', false], [1, 's01-b02', false], [1, 's01-b02', true]]);
  navigation.next(); assert.equal(h.engine.getStatus().activeSceneId, null); assert.equal(navigation.getState().sceneId, 2);
  h.engine.registerScene(2, { setBeat: n => calls.push([n]) }); assert.equal(h.engine.getStatus().activeSceneId, 2);
  const before = navigation.getState(); h.engine.setQuality('low'); h.engine.setReducedMotion(true); assert.equal(navigation.getState(), before);
  h.engine.destroy(); const count = calls.length; navigation.previous(); assert.equal(calls.length, count); navigation.destroy();
});
test('destroy cancels RAF, disconnects observers/listeners and disposes renderer exactly once', () => {
  const h = harness(); h.engine.initialize(); h.engine.registerScene(1, { animated: true }); h.engine.activateScene(1); h.step();
  const renderer = h.renderers[0]; h.engine.destroy(); h.engine.destroy();
  assert.equal(h.frames.size, 0); assert.equal(h.counts().listeners, 0); assert.equal(h.counts().disconnected, 1); assert.equal(renderer.disposals, 1);
  h.win.dispatchEvent(new Event('resize')); h.engine.resume(); assert.equal(h.frames.size, 0);
  assert.equal(h.canvas.style.display, ''); assert.equal(h.fallbackCanvas.style.display, 'none'); assert.throws(() => h.engine.initialize(), /destroyed/);
});
test('owned materials not attached to meshes still dispose their textures', () => {
  const h = harness(); const texture = new THREE.Texture(); let count = 0;
  texture.addEventListener('dispose', () => count++);
  h.engine.registerScene(1, { setup: ctx => { ctx.material('gold', { map: texture }); } });
  h.engine.initialize(); h.engine.activateScene(1); h.engine.destroy(); assert.equal(count, 1);
});
test('navigation during scene cancellation leaves the latest T05 destination active', () => {
  const navigation = createSceneController(content), h = harness({ navigation }); let redirect = true;
  h.engine.registerScene(1, { activate: ctx => ctx.signal.addEventListener('abort', () => { if (redirect) { redirect = false; navigation.goToScene(3); } }) });
  h.engine.registerScene(2, {}); h.engine.registerScene(3, {}); h.engine.initialize(); navigation.goToScene(2);
  assert.equal(navigation.getState().sceneId, 3); assert.equal(h.engine.getStatus().activeSceneId, 3); h.engine.destroy();
});
test('navigation during beat cancellation cannot deliver an obsolete beat', () => {
  const navigation = createSceneController(content), h = harness({ navigation }), beats = []; let redirect = true;
  h.engine.registerScene(1, { setBeat: (n, ctx) => { beats.push(n); ctx.signal.addEventListener('abort', () => { if (redirect) { redirect = false; navigation.goToScene(1, 0); } }); } });
  h.engine.initialize(); navigation.next(); assert.equal(navigation.getState().beatIndex, 0);
  assert.equal(beats.at(-1), 0); h.engine.destroy();
});
test('destroy during a frame prevents rendering or fallback resurrection', () => {
  const h = harness(); h.engine.registerScene(1, { animated: true, update: () => h.engine.destroy() });
  h.engine.initialize(); h.engine.activateScene(1); h.step();
  assert.equal(h.engine.getStatus().mode, 'destroyed'); assert.equal(h.canvas.style.display, ''); assert.equal(h.frames.size, 0);
});
test('a camera destination requested inside cancellation supersedes the interrupted request', () => {
  const rig = createCameraRig(THREE);
  rig.moveTo({ position: [10, 0, 12] }, { onCancel: () => rig.moveTo({ position: [30, 0, 12] }, { duration: 0 }) });
  rig.moveTo({ position: [20, 0, 12] }, { duration: 0 }); assert.equal(rig.getPose().position[0], 30);
});
