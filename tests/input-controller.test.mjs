import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSceneController } from '../build/scene-controller.mjs';
import { createInputController } from '../build/input-controller.mjs';

const data = JSON.parse(readFileSync(new URL('../build/content.json', import.meta.url), 'utf8'));
class Target extends EventTarget {
  listeners = new Map();
  addEventListener(type, fn, settings) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); super.addEventListener(type, fn, settings); }
  removeEventListener(type, fn, settings) { this.listeners.get(type)?.delete(fn); super.removeEventListener(type, fn, settings); }
  count() { return [...this.listeners.values()].reduce((n, s) => n + s.size, 0); }
}
class Element extends Target {
  constructor(tag = 'div', parent = null, attrs = {}) { super(); this.tag = tag; this.parentNode = parent; this.attrs = attrs; this.nodeType = 1; this.clientHeight = 900; this.scrollHeight = 900; this.clientWidth = 1600; this.scrollWidth = 1600; this.style = { overflowY: 'visible', overflowX: 'visible' }; }
  matches(selector) {
    return selector.split(',').some(s => {
      if (/^[a-z]+$/.test(s)) return this.tag === s;
      if (s === 'a[href]') return this.tag === 'a' && 'href' in this.attrs;
      if (s.startsWith('[contenteditable]')) return 'contenteditable' in this.attrs && this.attrs.contenteditable !== 'false';
      if (s.startsWith('[tabindex]')) return 'tabindex' in this.attrs && this.attrs.tabindex !== '-1';
      const m = s.match(/^\[([^=\]]+)(?:="([^"]+)")?\]$/);
      return Boolean(m && m[1] in this.attrs && (m[2] === undefined || this.attrs[m[1]] === m[2]));
    });
  }
}
function setup(options = {}) {
  const doc = new Target(), win = new Target(); let time = 0, portrait = false, overlay = false;
  const root = new Element('html'), area = new Element('main', root);
  doc.defaultView = win; doc.documentElement = root; doc.activeElement = root;
  doc.hidden = false; doc.visibilityState = 'visible'; doc.querySelector = () => doc.modal ?? null;
  win.getComputedStyle = el => el.style; win.innerHeight = 900;
  area.ownerDocument = doc;
  const navigation = createSceneController(data);
  const input = createInputController(navigation, area, { now: () => time, isPortrait: () => portrait, isBlocked: () => overlay, ...options });
  const emit = (type, props = {}, target = area) => {
    const event = new Event(type, { cancelable: true });
    Object.defineProperty(event, 'target', { value: target });
    const path = []; for (let n = target; n; n = n.parentNode) path.push(n);
    Object.assign(event, { composedPath: () => path, ...props });
    (type === 'keydown' ? doc : type === 'visibilitychange' ? doc : type === 'blur' ? win : area).dispatchEvent(event);
    return event;
  };
  const key = (key, target = area, props = {}) => emit('keydown', { key, ...props }, target);
  const wheel = (deltaY, props = {}, target = area) => emit('wheel', { deltaY, deltaX: 0, deltaMode: 0, ...props }, target);
  const point = (x, y, identifier = 1) => ({ clientX: x, clientY: y, identifier });
  const touch = (type, points, changes = points, target = area) => emit(type, { touches: points, changedTouches: changes }, target);
  return { doc, win, root, area, navigation, input, emit, key, wheel, touch, point,
    time: n => { time = n; }, portrait: value => { portrait = value; }, overlay: value => { overlay = value; } };
}
test('keyboard next/previous use real T05 beats and reverse scene boundaries', () => {
  const f = setup(); assert.ok(f.key(' ').defaultPrevented); assert.equal(f.navigation.getState().beatIndex, 1);
  f.key('ArrowRight'); assert.equal(f.navigation.getState().sceneId, 2);
  f.key('ArrowLeft'); assert.equal(f.navigation.getState().sceneId, 1); assert.equal(f.navigation.getState().beatIndex, 1);
  f.key('PageUp'); assert.equal(f.navigation.getState().beatIndex, 0);
  f.key('PageDown'); assert.equal(f.navigation.getState().beatIndex, 1); f.input.destroy();
});
test('replay preserves position; modified/composing/repeat events remain native', () => {
  const f = setup(); f.key('ArrowRight'); const old = f.navigation.getState();
  assert.ok(f.key('R').defaultPrevented); assert.equal(f.navigation.getState().beatId, old.beatId);
  const before = f.navigation.getState();
  for (const props of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { repeat: true }, { isComposing: true }]) assert.equal(f.key('ArrowRight', f.area, props).defaultPrevented, false);
  assert.equal(f.navigation.getState(), before); f.input.destroy();
});
test('typing and interactive controls retain Space, arrow and letter behavior', () => {
  const f = setup(), before = f.navigation.getState();
  const targets = ['input', 'textarea', 'select', 'button', 'summary'].map(t => new Element(t, f.area));
  targets.push(new Element('a', f.area, { href: '#' }), new Element('div', f.area, { contenteditable: '' }), new Element('div', f.area, { role: 'option' }), new Element('div', f.area, { role: 'slider' }), new Element('div', f.area, { tabindex: '0' }));
  for (const target of targets) for (const key of [' ', 'ArrowRight', 'PageDown', 'r', 'f']) assert.equal(f.key(key, new Element('span', target)).defaultPrevented, false);
  assert.equal(f.navigation.getState(), before);
  f.doc.activeElement = targets[0]; assert.equal(f.key('ArrowRight').defaultPrevented, false);
  f.doc.activeElement = f.root; assert.ok(f.key('ArrowRight', new Element('div', f.area, { contenteditable: 'false' })).defaultPrevented); f.input.destroy();
});
test('absent and declined feature callbacks do not intercept keys', () => {
  const f = setup({ callbacks: { overview: () => false } });
  for (const key of ['g', 'e', 'n', 'm', 'f', 'Escape', 'q']) assert.equal(f.key(key).defaultPrevented, false);
  f.input.destroy();
});
test('future callbacks receive shortcuts; registered closer owns overlay priority', () => {
  const calls = [], panels = ['editor', 'modal'];
  const callbacks = Object.fromEntries(['fullscreen', 'overview', 'editor', 'notes', 'mute'].map(k => [k, () => { calls.push(k); }]));
  callbacks.closePanel = () => panels.length ? (calls.push(panels.pop()), true) : false;
  const f = setup({ callbacks }); for (const key of ['F', 'G', 'E', 'N', 'M']) assert.ok(f.key(key).defaultPrevented);
  assert.deepEqual(calls, ['fullscreen', 'overview', 'editor', 'notes', 'mute']);
  f.overlay(true); assert.equal(f.key('ArrowRight').defaultPrevented, false);
  const button = new Element('button', f.area); assert.ok(f.key('Escape', button).defaultPrevented); assert.ok(f.key('Escape', button).defaultPrevented);
  assert.deepEqual(calls.slice(-2), ['modal', 'editor']); assert.equal(f.key('Escape').defaultPrevented, false); f.input.destroy();
});
test('open native dialogs block navigation, while unhandled Escape stays native', () => {
  const f = setup(); f.doc.modal = new Element('dialog'); const before = f.navigation.getState();
  assert.equal(f.key('ArrowRight').defaultPrevented, false); assert.equal(f.key('Escape').defaultPrevented, false);
  assert.equal(f.navigation.getState(), before); f.input.destroy();
});
test('native fullscreen toggles only when browser capabilities exist', async () => {
  const errors = [], f = setup({ onError: e => errors.push(e) }); let enters = 0, exits = 0;
  f.root.requestFullscreen = () => { enters++; f.doc.fullscreenElement = f.root; return Promise.resolve(); };
  f.doc.exitFullscreen = () => { exits++; f.doc.fullscreenElement = null; return Promise.resolve(); };
  assert.ok(f.key('f').defaultPrevented); assert.ok(f.key('f').defaultPrevented); assert.equal(enters, 1); assert.equal(exits, 1);
  f.root.requestFullscreen = () => Promise.reject(new Error('denied'));
  f.key('f'); await Promise.resolve(); await Promise.resolve(); assert.equal(errors.length, 1); f.input.destroy();
});
test('wheel normalizes line/page units, applies threshold and reverses direction', () => {
  const f = setup(); assert.equal(f.wheel(20).defaultPrevented, false); f.time(50); f.wheel(20); f.time(100); assert.ok(f.wheel(20).defaultPrevented);
  assert.equal(f.navigation.getState().beatIndex, 1); f.time(800); f.wheel(-4, { deltaMode: 1 }); assert.equal(f.navigation.getState().beatIndex, 0);
  f.time(1500); f.wheel(1, { deltaMode: 2 }); assert.equal(f.navigation.getState().beatIndex, 1); f.input.destroy();
});
test('650ms cooldown plus continuous-burst latch blocks long trackpad momentum', () => {
  const f = setup(); f.wheel(100); const state = f.navigation.getState();
  for (let t = 100; t <= 2000; t += 100) { f.time(t); f.wheel(100); }
  assert.equal(f.navigation.getState(), state);
  f.time(2300); f.wheel(100); assert.equal(f.navigation.getState().sceneId, 2);
  f.time(2600); f.wheel(100); assert.equal(f.navigation.getState().beatIndex, 0);
  f.time(2950); f.wheel(100); assert.equal(f.navigation.getState().beatIndex, 1); f.input.destroy();
});
test('wheel preserves scrollable children, portrait reading, horizontal scrolling and modifiers', () => {
  const f = setup(), before = f.navigation.getState();
  const scroll = new Element('div', f.area); scroll.style.overflowY = 'auto'; scroll.scrollHeight = 1500;
  const child = new Element('span', scroll); assert.equal(f.wheel(100, {}, child).defaultPrevented, false);
  f.portrait(true); assert.equal(f.wheel(100).defaultPrevented, false); f.portrait(false);
  assert.equal(f.wheel(30, { deltaX: 100 }).defaultPrevented, false); assert.equal(f.wheel(100, { ctrlKey: true }).defaultPrevented, false);
  assert.equal(f.wheel(100, {}, new Element('button', f.area)).defaultPrevented, false);
  assert.equal(f.navigation.getState(), before); f.input.destroy();
});
test('focused toolbar controls do not disable wheel/swipe over the stage', () => {
  const f = setup(); f.doc.activeElement = new Element('button', f.root);
  assert.ok(f.wheel(100).defaultPrevented); assert.equal(f.navigation.getState().beatIndex, 1);
  f.touch('touchstart', [f.point(200, 100)]); f.touch('touchend', [], [f.point(100, 100)]);
  assert.equal(f.navigation.getState().sceneId, 2);
  assert.equal(f.key('ArrowRight').defaultPrevented, false); f.input.destroy();
});
test('destroy suppresses pending fullscreen rejection callbacks', async () => {
  const errors = [], f = setup({ onError: error => errors.push(error) }); let reject;
  f.root.requestFullscreen = () => new Promise((_, failure) => { reject = failure; });
  f.key('f'); f.input.destroy(); reject(new Error('late browser rejection'));
  await Promise.resolve(); await Promise.resolve(); assert.equal(errors.length, 0);
});
test('horizontal swipe navigates left/right, including portrait, without canceling start/move', () => {
  const f = setup(); f.portrait(true);
  assert.equal(f.touch('touchstart', [f.point(200, 100)]).defaultPrevented, false);
  assert.equal(f.touch('touchmove', [f.point(100, 105)]).defaultPrevented, false);
  assert.ok(f.touch('touchend', [], [f.point(100, 105)]).defaultPrevented); assert.equal(f.navigation.getState().beatIndex, 1);
  f.touch('touchstart', [f.point(100, 100)]); f.touch('touchend', [], [f.point(200, 100)]); assert.equal(f.navigation.getState().beatIndex, 0); f.input.destroy();
});
test('vertical/diagonal scrolling, short taps, long drags and pinch never navigate', () => {
  const f = setup(), before = f.navigation.getState();
  for (const end of [f.point(105, 200), f.point(200, 200), f.point(120, 100)]) { f.touch('touchstart', [f.point(100, 100)]); assert.equal(f.touch('touchend', [], [end]).defaultPrevented, false); }
  f.touch('touchstart', [f.point(100, 100)]); f.touch('touchmove', [f.point(102, 150)]); f.touch('touchend', [], [f.point(250, 150)]);
  f.touch('touchstart', [f.point(100, 100)]); f.touch('touchmove', [f.point(100, 100), f.point(200, 100, 2)]); f.touch('touchend', [], [f.point(250, 100)]);
  f.touch('touchstart', [f.point(100, 100)]); f.time(1001); f.touch('touchend', [], [f.point(250, 100)]);
  assert.equal(f.navigation.getState(), before); f.input.destroy();
});
test('touch controls, editor dragging opt-outs, cancellation and unmatched fingers stay native', () => {
  const f = setup(), before = f.navigation.getState();
  for (const target of [new Element('input', f.area), new Element('div', f.area, { draggable: 'true' }), new Element('div', f.area, { 'data-input-ignore': '' })]) { f.touch('touchstart', [f.point(200, 100)], undefined, target); f.touch('touchend', [], [f.point(100, 100)], target); }
  f.touch('touchstart', [f.point(200, 100)]); f.touch('touchcancel', []); f.touch('touchend', [], [f.point(100, 100)]);
  f.touch('touchstart', [f.point(200, 100)]); f.touch('touchend', [], [f.point(100, 100, 2)]);
  assert.equal(f.navigation.getState(), before); f.input.destroy();
});
test('hidden, disabled, blocked or destroyed navigation cannot receive inputs', () => {
  const f = setup(), before = f.navigation.getState();
  const attempt = () => { f.key('ArrowRight'); f.wheel(100); f.touch('touchstart', [f.point(200, 100)]); f.touch('touchend', [], [f.point(100, 100)]); assert.equal(f.navigation.getState(), before); };
  f.input.disable(); attempt(); f.input.enable(); f.doc.hidden = true; attempt(); f.doc.hidden = false;
  f.overlay(true); attempt(); f.overlay(false); f.navigation.destroy(); const end = f.navigation.getState();
  f.key('ArrowRight'); assert.equal(f.navigation.getState(), end); f.input.destroy();
});
test('enable is idempotent, duplicate ownership is rejected, destroy removes every listener', () => {
  const f = setup(); const count = () => f.doc.count() + f.win.count() + f.area.count(); assert.equal(count(), 8);
  f.input.enable(); assert.equal(count(), 8);
  assert.throws(() => createInputController(f.navigation, f.area, { now: () => 0 }), /already enabled/); assert.equal(count(), 8);
  f.input.disable(); assert.equal(count(), 0); f.input.enable(); assert.equal(count(), 8);
  f.input.destroy(); f.input.destroy(); f.input.enable(); assert.equal(count(), 0); assert.equal(f.input.isEnabled(), false);
  const before = f.navigation.getState(); f.key('ArrowRight'); assert.equal(f.navigation.getState(), before);
});
test('blur/visibility and disable clear partial wheel/swipe gestures', () => {
  const f = setup(); f.wheel(30); f.touch('touchstart', [f.point(200, 100)]); f.emit('blur');
  f.time(50); assert.equal(f.wheel(30).defaultPrevented, false); f.touch('touchend', [], [f.point(100, 100)]); assert.equal(f.navigation.getState().beatIndex, 0);
  f.emit('visibilitychange'); f.wheel(30); f.input.disable(); f.input.enable(); f.time(100); f.wheel(30); assert.equal(f.navigation.getState().beatIndex, 0); f.input.destroy();
});
