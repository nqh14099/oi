/**
 * Renderer-independent navigation over content.json's scenes[].beats[].
 * Indices are zero-based; order fields in source data are one-based.
 * goToScene(id, beatIndex=0) prioritizes stable IDs (including numeric IDs).
 * Use goToScene({ index: n }, beatIndex) for an unambiguous scene index;
 * bare 0 also selects the first scene. Invalid requests throw without mutation.
 *
 * subscribe(fn) receives frozen (state, event), without an initial notification.
 * Events: navigate, replay, transition-complete, transition-error. Only navigate
 * may have sceneChanged=true. No-op navigation produces no event or cancellation.
 *
 * Optional onTransition(context) returns a Promise, or completes synchronously.
 * context.signal aborts on supersession/destroy; isCurrent() guards async writes;
 * complete() can finish early and returns false for stale/completed tokens.
 * Animation hooks must stop their own work on abort and guard side effects: this
 * module cannot forcibly terminate third-party promises or animations.
 * Reduced motion can use a synchronous hook. Replay never touches quiz/audio.
 * Content edits require recreating the controller; only navigation IDs are copied.
 */
export function createSceneController(presentation, { onTransition, onError = () => {} } = {}) {
  if (onTransition !== undefined && typeof onTransition !== 'function') throw new TypeError('onTransition must be a function');
  if (typeof onError !== 'function') throw new TypeError('onError must be a function');
  if (!Array.isArray(presentation?.scenes)) throw new TypeError('scenes: expected an array');
  if (presentation.scenes.length !== 15) throw new RangeError('scenes: exactly 15 scenes required');
  const sceneIds = new Map(), beatIds = new Set();
  const validId = id => (typeof id === 'string' && id.trim().length > 0) || (Number.isSafeInteger(id) && id > 0);
  const route = Array.from(presentation.scenes, (scene, i) => {
    const path = `scenes[${i}]`;
    if (!validId(scene?.id)) throw new TypeError(`${path}.id: invalid stable ID`);
    if (sceneIds.has(String(scene.id))) throw new TypeError(`${path}.id: duplicate scene ID`);
    if (scene.order !== i + 1) throw new RangeError(`${path}.order: must match array position ${i + 1}`);
    sceneIds.set(String(scene.id), i);
    if (!Array.isArray(scene.beats) || !scene.beats.length) throw new TypeError(`${path}.beats: expected nonempty beat definitions`);
    const beats = Array.from(scene.beats, (beat, j) => {
      const bp = `${path}.beats[${j}]`;
      if (typeof beat?.id !== 'string' || !beat.id.trim()) throw new TypeError(`${bp}.id: invalid stable beat ID`);
      if (beatIds.has(beat.id)) throw new TypeError(`${bp}.id: duplicate beat ID`);
      if (beat.order !== j + 1) throw new RangeError(`${bp}.order: must match array position ${j + 1}`);
      beatIds.add(beat.id); return beat.id;
    });
    return { id: scene.id, beats };
  });
  const listeners = new Set();
  let version = 0, active = null;
  const snapshot = (sceneIndex, beatIndex, status, destroyed = false) => Object.freeze({
    sceneId: route[sceneIndex].id, sceneIndex, beatId: route[sceneIndex].beats[beatIndex], beatIndex,
    transition: Object.freeze({ version, status }), destroyed
  });
  let state = snapshot(0, 0, 'idle');
  const report = (error, context) => { try { onError(error, context); } catch { /* Error hooks must not corrupt navigation. */ } };
  function notify(event) {
    const current = state;
    for (const callback of [...listeners]) {
      // A callback may navigate, finish a transition, unsubscribe, or destroy.
      if (state !== current || state.destroyed) break;
      if (!listeners.has(callback)) continue;
      try { callback(current, event); } catch (error) { report(error, event); }
    }
  }
  function navigate(sceneIndex, beatIndex, reason) {
    if (state.destroyed) return state;
    if (reason !== 'replay' && sceneIndex === state.sceneIndex && beatIndex === state.beatIndex) return state;
    const previous = state, old = active;
    version += 1;
    const abort = new AbortController();
    state = snapshot(sceneIndex, beatIndex, onTransition ? 'running' : 'idle');
    const to = state;
    const current = () => !state.destroyed && active === entry && state.transition.version === to.transition.version;
    const finish = (error, failed = false) => {
      if (!current() || state.transition.status !== 'running') return false;
      active = null;
      state = snapshot(state.sceneIndex, state.beatIndex, 'idle');
      notify(Object.freeze({ type: failed ? 'transition-error' : 'transition-complete',
        reason, version: to.transition.version, previous: to, sceneChanged: false, ...(failed ? { error } : {}) }));
      if (failed) report(error, context);
      return true;
    };
    const context = Object.freeze({ version: to.transition.version, from: previous, to, reason,
      signal: abort.signal, isCurrent: current, complete: () => finish() });
    const entry = { abort, context };
    active = onTransition ? entry : null;
    // Commit the latest destination BEFORE delivering cancellation to old work.
    old?.abort.abort('superseded');
    if (state !== to) return state;
    notify(Object.freeze({ type: reason === 'replay' ? 'replay' : 'navigate', reason,
      version: to.transition.version, previous, sceneChanged: reason !== 'replay' && previous.sceneId !== to.sceneId }));
    if (onTransition && current()) {
      try {
        const result = onTransition(context);
        // Attaching both handlers also consumes rejected obsolete promises.
        if (result && typeof result.then === 'function') Promise.resolve(result).then(() => finish(), error => finish(error, true));
        else finish();
      } catch (error) { finish(error, true); }
    }
    return state;
  }
  function goToScene(target, beatIndex = 0) {
    if (state.destroyed) return state;
    let index;
    if (target !== null && typeof target === 'object' && Object.keys(target).length === 1 && Object.hasOwn(target, 'index')) index = target.index;
    else if ((typeof target === 'string' || typeof target === 'number') && sceneIds.has(String(target))) index = sceneIds.get(String(target));
    else if (target === 0) index = 0;
    else throw new RangeError('scene: unknown ID; use { index: n } for zero-based indices');
    if (!Number.isInteger(index) || index < 0 || index >= route.length) throw new RangeError('scene index: outside 0–14');
    if (!Number.isInteger(beatIndex) || beatIndex < 0 || beatIndex >= route[index].beats.length) throw new RangeError(`scene ${route[index].id}: beat index outside 0–${route[index].beats.length - 1}`);
    return navigate(index, beatIndex, 'direct');
  }
  return Object.freeze({
    getState: () => state,
    next() {
      if (state.destroyed) return state;
      const { sceneIndex: s, beatIndex: b } = state;
      if (b + 1 < route[s].beats.length) return navigate(s, b + 1, 'next');
      if (s + 1 < route.length) return navigate(s + 1, 0, 'next');
      return state;
    },
    previous() {
      if (state.destroyed) return state;
      const { sceneIndex: s, beatIndex: b } = state;
      if (b > 0) return navigate(s, b - 1, 'previous');
      if (s > 0) return navigate(s - 1, route[s - 1].beats.length - 1, 'previous');
      return state;
    },
    goToScene,
    replay: () => navigate(state.sceneIndex, state.beatIndex, 'replay'),
    subscribe(callback) {
      if (typeof callback !== 'function') throw new TypeError('subscriber must be a function');
      if (!state.destroyed) listeners.add(callback);
      return () => listeners.delete(callback);
    },
    destroy() {
      if (state.destroyed) return;
      const old = active; active = null; version += 1;
      state = snapshot(state.sceneIndex, state.beatIndex, 'idle', true);
      listeners.clear(); old?.abort.abort('destroyed');
    }
  });
}
