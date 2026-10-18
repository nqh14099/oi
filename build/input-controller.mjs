// One active input controller per document. No scene content/state is copied.
const owners = new WeakMap();
const interactive = 'input,textarea,select,button,a[href],summary,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="checkbox"],[role="radio"],[role="slider"],[role="textbox"],[role="combobox"],[role="listbox"],[role="option"],[role="menuitem"],[tabindex]:not([tabindex="-1"]),[draggable="true"],[data-input-ignore]';

/**
 * createInputController(t05Controller, interactionArea, options).
 * Starts enabled; enable/disable are idempotent, destroy is terminal.
 * callbacks: fullscreen, overview, editor, notes, mute, closePanel. Ordinary
 * callbacks may return false to decline handling. closePanel MUST synchronously
 * return true only after closing the highest-priority active panel. It is the
 * sole shortcut allowed through a blocked overlay (including focused controls).
 * isBlocked() must report future editor/notes/overview overlays; open DOM dialogs
 * are blocked automatically. [data-input-ignore] is an explicit input opt-out.
 * Native fullscreen is used when available unless a callback overrides it.
 * Wheel: 60 normalized pixels, 650ms cooldown, one navigation per continuous
 * burst (200ms quiet interval). Portrait wheel and scrollable children stay native.
 * Touch: >=60px, horizontal/vertical ratio >=1.5, <=1000ms, one finger only.
 * Vertical intent locks out navigation. Start/move are passive; only a handled
 * horizontal touchend is canceled. No CSS/touch-action or pointer-drag changes.
 * now/isPortrait/document/window can be supplied for focused tests.
 */
export function createInputController(navigation, area, options = {}) {
  if (!['getState', 'next', 'previous', 'replay'].every(key => typeof navigation?.[key] === 'function')) throw new TypeError('T05 navigation API required');
  if (!area?.addEventListener || !area?.removeEventListener) throw new TypeError('presentation interaction area required');
  const doc = options.document ?? area.ownerDocument;
  const win = options.window ?? doc?.defaultView;
  if (!doc?.addEventListener || !doc?.removeEventListener || !win?.addEventListener || !win?.removeEventListener) throw new TypeError('document/window event targets required');
  const callbacks = options.callbacks ?? {};
  const isBlocked = options.isBlocked ?? (() => false);
  const isPortrait = options.isPortrait ?? (() => win.matchMedia?.('(orientation:portrait)').matches ?? false);
  const now = options.now ?? (() => win.performance.now());
  const onError = options.onError ?? (() => {});
  for (const fn of [isBlocked, isPortrait, now, onError]) if (typeof fn !== 'function') throw new TypeError('input hooks must be functions');
  for (const key of ['fullscreen', 'overview', 'editor', 'notes', 'mute', 'closePanel']) if (callbacks[key] !== undefined && typeof callbacks[key] !== 'function') throw new TypeError(`callbacks.${key} must be a function`);
  let enabled = false, destroyed = false, gesture = null;
  let wheel = { lastAt: -Infinity, lastNavAt: -Infinity, total: 0, direction: 0, latched: false };
  const reset = () => { gesture = null; wheel = { lastAt: -Infinity, lastNavAt: -Infinity, total: 0, direction: 0, latched: false }; };
  const report = error => { if (destroyed) return; try { onError(error); } catch { /* Error reporting cannot break cleanup. */ } };
  const live = () => enabled && !destroyed && !doc.hidden && doc.visibilityState !== 'hidden' && !navigation.getState().destroyed;
  const blocked = () => isBlocked() || Boolean(doc.querySelector('dialog[open],[role="dialog"][aria-modal="true"]:not([hidden])'));
  function path(event) {
    if (typeof event.composedPath === 'function') return event.composedPath();
    const result = []; for (let node = event.target; node; node = node.parentNode ?? node.host) result.push(node);
    return result;
  }
  const protectedTarget = (event, includeFocus = false) => path(event).some(node => node !== area && node.matches?.(interactive)) ||
    (includeFocus && doc.activeElement !== area && Boolean(doc.activeElement?.matches?.(interactive)));
  const modified = event => event.ctrlKey || event.altKey || event.metaKey;
  const eligible = event => live() && !event.defaultPrevented && !modified(event) && !blocked() && !protectedTarget(event);
  function scrolling(event) {
    for (const node of path(event)) {
      if (node.nodeType === 1) {
        const style = win.getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) return true;
        if (/(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1) return true;
      }
      if (node === area) break;
    }
    return false;
  }
  function act(fn, event, strict = false) {
    if (typeof fn !== 'function') return false;
    try {
      const result = fn(event);
      if (result && typeof result.then === 'function') Promise.resolve(result).catch(report);
      if (strict ? result !== true : result === false) return false;
      if (event.cancelable) event.preventDefault();
      return true;
    } catch (error) { report(error); return false; }
  }
  function fullscreen() {
    const target = options.fullscreenTarget ?? doc.documentElement;
    if (doc.fullscreenElement) return typeof doc.exitFullscreen === 'function' ? () => doc.exitFullscreen() : undefined;
    if (doc.fullscreenEnabled === false || typeof target?.requestFullscreen !== 'function') return undefined;
    return () => target.requestFullscreen();
  }
  function keydown(event) {
    if (!live() || event.defaultPrevented || modified(event) || event.repeat || event.isComposing) return;
    const key = event.key;
    // The registered closer decides which panel is highest, and whether Escape
    // belongs to that panel. Without a true response, native Escape is preserved.
    if (key === 'Escape') { act(callbacks.closePanel, event, true); return; }
    if (blocked() || protectedTarget(event, true)) return;
    if (key === ' ' || key === 'Spacebar' || key === 'ArrowRight' || key === 'PageDown') act(() => navigation.next(), event);
    else if (key === 'ArrowLeft' || key === 'PageUp') act(() => navigation.previous(), event);
    else {
      const shortcut = { r: () => navigation.replay(), f: callbacks.fullscreen ?? fullscreen(), g: callbacks.overview, e: callbacks.editor, n: callbacks.notes, m: callbacks.mute }[key?.toLowerCase()];
      act(shortcut, event);
    }
  }
  function onWheel(event) {
    if (!eligible(event) || isPortrait() || scrolling(event)) { wheel.total = 0; return; }
    if (!Number.isFinite(event.deltaY) || !Number.isFinite(event.deltaX ?? 0)) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? (area.clientHeight || win.innerHeight) : 1;
    const dy = event.deltaY * unit, dx = (event.deltaX ?? 0) * unit;
    if (Math.abs(dy) <= Math.abs(dx) * 1.2 || dy === 0) return;
    const time = now(), direction = Math.sign(dy);
    if (time - wheel.lastAt >= 200) { wheel.total = 0; wheel.direction = 0; wheel.latched = false; }
    wheel.lastAt = time;
    if (wheel.latched || time - wheel.lastNavAt < 650) {
      wheel.latched = true; wheel.total = 0;
      if (event.cancelable) event.preventDefault(); // Consume momentum from an owned navigation gesture.
      return;
    }
    if (direction !== wheel.direction) wheel.total = 0;
    wheel.direction = direction; wheel.total += dy;
    if (Math.abs(wheel.total) < 60) return;
    wheel.total = 0; wheel.latched = true; wheel.lastNavAt = time;
    act(() => direction > 0 ? navigation.next() : navigation.previous(), event);
  }
  function touchstart(event) {
    gesture = null;
    if (!eligible(event) || scrolling(event) || event.touches.length !== 1) return;
    const touch = event.touches[0];
    gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, time: now() };
  }
  function touchmove(event) {
    if (!gesture) return;
    if (!eligible(event) || event.touches.length !== 1) { gesture = null; return; }
    const touch = event.touches[0];
    if (touch.identifier !== gesture.id) { gesture = null; return; }
    const x = Math.abs(touch.clientX - gesture.x), y = Math.abs(touch.clientY - gesture.y);
    if (y > 12 && y > x) gesture = null;
  }
  function touchend(event) {
    const start = gesture; gesture = null;
    if (!start || !eligible(event) || scrolling(event) || event.touches.length !== 0) return;
    const end = Array.from(event.changedTouches).find(touch => touch.identifier === start.id);
    if (!end || now() - start.time > 1000) return;
    const dx = end.clientX - start.x, dy = end.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    act(() => dx < 0 ? navigation.next() : navigation.previous(), event);
  }
  const touchcancel = () => { gesture = null; };
  const listeners = [
    [doc, 'keydown', keydown, false], [doc, 'visibilitychange', reset, false], [win, 'blur', reset, false],
    [area, 'wheel', onWheel, { passive: false }], [area, 'touchstart', touchstart, { passive: true }],
    [area, 'touchmove', touchmove, { passive: true }], [area, 'touchend', touchend, { passive: false }],
    [area, 'touchcancel', touchcancel, { passive: true }]
  ];
  const api = Object.freeze({
    enable() {
      if (enabled || destroyed) return;
      if (owners.has(doc)) throw new Error('An input controller is already enabled for this document');
      owners.set(doc, api); enabled = true;
      for (const [target, type, fn, settings] of listeners) target.addEventListener(type, fn, settings);
    },
    disable() {
      if (!enabled) return;
      enabled = false;
      for (const [target, type, fn, settings] of listeners) target.removeEventListener(type, fn, settings);
      if (owners.get(doc) === api) owners.delete(doc);
      reset();
    },
    destroy() { api.disable(); destroyed = true; },
    isEnabled: () => enabled && !destroyed
  });
  api.enable();
  return api;
}
