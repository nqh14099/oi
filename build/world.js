import { createCameraRig } from './camera-rig.mjs';

export const WORLD_PALETTE = Object.freeze({ black: 0x08080d, burgundy: 0x38131e, gold: 0xdfbc79, navy: 0x101827, ivory: 0xf5eee3, mazeGreen: 0x81ce9f, digitalCyan: 0x77dce5 });
export const WORLD_QUALITY = Object.freeze({ high: Object.freeze({ pixelRatio: 2, shadows: true, shadowSize: 1024 }), low: Object.freeze({ pixelRatio: 1, shadows: false, shadowSize: 512 }) });
export const WORLD_LIGHTING = Object.freeze({
  cinematic: Object.freeze({ ambient: Object.freeze({ color: WORLD_PALETTE.ivory, intensity: 0.7 }),
    directional: Object.freeze({ color: WORLD_PALETTE.ivory, intensity: 2.2, position: Object.freeze([4, 8, 8]), castShadow: true }),
    point: Object.freeze({ color: WORLD_PALETTE.gold, intensity: 35, position: Object.freeze([8, 2, 4]), distance: 40, decay: 2, castShadow: false }) }),
  subdued: Object.freeze({ ambient: Object.freeze({ color: WORLD_PALETTE.ivory, intensity: 0.4 }),
    directional: Object.freeze({ color: WORLD_PALETTE.ivory, intensity: 0.9, position: Object.freeze([4, 8, 8]), castShadow: true }),
    point: Object.freeze({ color: WORLD_PALETTE.gold, intensity: 12, position: Object.freeze([8, 2, 4]), distance: 40, decay: 2, castShadow: false }) })
});
export function createWorldMaterial(THREE, preset = 'burgundy', parameters = {}) {
  if (!Object.hasOwn(WORLD_PALETTE, preset)) throw new RangeError(`Unknown material preset ${preset}`);
  const opacity = parameters.opacity ?? 1;
  return new THREE.MeshStandardMaterial({ color: WORLD_PALETTE[preset], roughness: preset === 'gold' ? 0.3 : 0.65,
    metalness: preset === 'gold' ? 0.65 : 0.1, opacity, transparent: opacity < 1, depthWrite: opacity >= 1, ...parameters });
}
// Collect GPU resources without deep-walking arbitrary cyclic user data.
export function collectWorldResources(root, resources = new Set()) {
  const textures = value => {
    if (value?.isTexture) resources.add(value);
    else if (Array.isArray(value)) value.forEach(textures);
  };
  const materialResources = material => {
    resources.add(material); Object.values(material).forEach(textures);
    Object.values(material.uniforms ?? {}).forEach(uniform => textures(uniform.value));
  };
  for (const resource of [...resources]) if (resource?.isMaterial) materialResources(resource);
  root?.traverse(object => {
    if (object.geometry) resources.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) {
      materialResources(material);
    }
    if (object.isInstancedMesh) resources.add(object);
    if (object.shadow?.map) resources.add(object.shadow.map);
  });
  return resources;
}

/**
 * Inject the vendored THREE namespace; three.cjs is NOT a browser global.
 * T08 should wrap the CJS source with local module/exports, retain its MIT notice,
 * then pass module.exports here and bundle these native modules into the HTML.
 * This file makes no imports of Three.js, fetches or external asset requests.
 * High/Low adjust DPR and shadows on the same context; MSAA stays fixed at creation.
 *
 * Scene hooks are synchronous: setup(ctx), activate(ctx), setBeat(index,ctx,meta),
 * update(dtSeconds,ctx), deactivate(ctx), dispose(ctx), drawFallback(ctx2d,ctx).
 * Hooks may launch asynchronous work only with ctx.signal/ctx.isCurrent guards.
 * setup is once per registered module; each activation starts a fresh lifetime.
 * setBeat starts a new cancellable beat lifetime, including replay. animated:true
 * opts into continuous WebGL updates; static/fallback scenes render on demand.
 * Engine owns root GPU resources and ctx.own(resource). dispose hooks clean custom
 * non-GPU work; do not dispose engine-owned resources again. Shared resources in
 * other registered roots/ownership sets are retained until their final owner exits.
 * Do not retain disposed resources for future unregistered scenes.
 */
export function createWorldEngine({ THREE, canvas, fallbackCanvas, navigation, quality = 'high', reducedMotion,
  document: doc = canvas?.ownerDocument, window: win = doc?.defaultView, onError = () => {} } = {}) {
  if (!THREE?.Scene || !THREE?.WebGLRenderer || !canvas?.getContext || !doc || !win) throw new TypeError('THREE, existing canvas and document/window are required');
  if (!Object.hasOwn(WORLD_QUALITY, quality)) throw new RangeError('quality must be high or low');
  if (navigation && (!navigation.getState || !navigation.subscribe)) throw new TypeError('T05 navigation API required');
  const records = new Map(), disposedResources = new WeakSet();
  const media = win.matchMedia?.('(prefers-reduced-motion:reduce)');
  let reduced = reducedMotion ?? media?.matches ?? false;
  let initialized = false, destroyed = false, paused = false, mode = 'uninitialized', reason = null;
  let renderer = null, world = null, camera = null, lights = null, fallback = null, active = null;
  let frameId = null, lastTime = null, elapsed = 0, dirty = true, observer = null, unsubscribe = null, generation = 0;
  let size = { width: 1600, height: 900 };
  const originalDisplay = { canvas: canvas.style.display, fallback: fallbackCanvas?.style.display };
  const report = error => { if (!destroyed) { try { onError(error); } catch {} } };
  const running = () => initialized && !destroyed && !paused && !doc.hidden;
  function cancelFrame() { if (frameId !== null) win.cancelAnimationFrame(frameId); frameId = null; lastTime = null; }
  function schedule() { if (running() && frameId === null) frameId = win.requestAnimationFrame(frame); }
  function invalidate() { dirty = true; schedule(); }
  function show(nextMode, why = null) {
    if (destroyed) return;
    mode = nextMode; reason = why;
    canvas.style.display = mode === 'webgl' ? originalDisplay.canvas : 'none';
    if (fallbackCanvas) fallbackCanvas.style.display = mode === 'webgl' ? 'none' : 'block';
    camera?.setReducedMotion(reduced || mode !== 'webgl'); invalidate();
  }
  function disposeResource(resource) {
    if (!resource || disposedResources.has(resource)) return;
    disposedResources.add(resource); try { resource.dispose?.(); } catch (error) { report(error); }
  }
  function context(record, signal = record.beatAbort?.signal ?? record.activationAbort?.signal) {
    return Object.freeze({ THREE, root: record.root, scene: world, camera, lights,
      get mode() { return mode; }, get quality() { return quality; }, get reducedMotion() { return reduced; },
      get elapsed() { return elapsed; }, get size() { return Object.freeze({ ...size }); },
      get navigationState() { return navigation?.getState(); }, signal,
      isCurrent: () => !destroyed && active === record && !signal?.aborted &&
        (signal === record.beatAbort?.signal || signal === record.activationAbort?.signal),
      invalidate, setLighting: config => api.setLighting(config), setBackground: config => api.setBackground(config),
      own: resource => { record.resources.add(resource); return resource; },
      material: (preset, parameters) => { const m = createWorldMaterial(THREE, preset, parameters); record.resources.add(m); return m; },
      group: (name = '', depth = 0) => { const group = new THREE.Group(); group.name = name; group.position.z = depth; return group; },
      parallax: (group, { x = 0, y = 0, strength = 0, base = [0, 0, 0] } = {}) => {
        group.position.set(base[0] + Math.max(-1, Math.min(1, x)) * strength, base[1] + Math.max(-1, Math.min(1, y)) * strength, base[2]); invalidate();
      }
    });
  }
  function hook(record, name, ...args) {
    if (typeof record?.module[name] !== 'function') return;
    try {
      const result = record.module[name](...args);
      if (result?.then) { Promise.resolve(result).catch(report); throw new TypeError(`${name}: lifecycle hooks must be synchronous; guard deferred work with signal`); }
    } catch (error) { report(error); }
  }
  function deactivate() {
    const token = ++generation, old = active; active = null;
    if (old) {
      const beat = old.beatAbort, activation = old.activationAbort;
      old.root.removeFromParent(); hook(old, 'deactivate', context(old, activation?.signal));
      beat?.abort('deactivated'); activation?.abort('deactivated');
    }
    if (token === generation) camera?.cancel('scene-change');
    return token;
  }
  function sync(state, event) {
    if (destroyed || state.destroyed || (event && !['navigate', 'replay'].includes(event.type))) return;
    if (!records.has(state.sceneId)) {
      const token = deactivate();
      if (token === generation && navigation?.getState().transition.version === state.transition.version) camera.reset();
      invalidate(); return;
    }
    if (active !== records.get(state.sceneId)) api.activateScene(state.sceneId);
    if (active !== records.get(state.sceneId) || navigation?.getState().transition.version !== state.transition.version) return;
    api.setBeat(state.beatIndex, { beatId: state.beatId, replay: event?.type === 'replay' });
  }
  function configureQuality() {
    if (!renderer) return;
    const preset = WORLD_QUALITY[quality];
    renderer.setPixelRatio(Math.min(Math.max(1, win.devicePixelRatio || 1), preset.pixelRatio));
    renderer.shadowMap.enabled = preset.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    for (const light of [lights.directional, lights.point]) {
      light.castShadow = preset.shadows && Boolean(light.userData.wantsShadow);
      light.shadow.mapSize.set(preset.shadowSize, preset.shadowSize);
      if (light.shadow.map) { disposeResource(light.shadow.map); light.shadow.map = null; }
    }
  }
  function drawFallback() {
    if (!fallback) return;
    fallback.clearRect(0, 0, size.width, size.height);
    const gradient = fallback.createLinearGradient(0, 0, size.width, size.height);
    gradient.addColorStop(0, '#38131e'); gradient.addColorStop(0.55, '#08080d'); gradient.addColorStop(1, '#101827');
    fallback.fillStyle = gradient; fallback.fillRect(0, 0, size.width, size.height);
    hook(active, 'drawFallback', fallback, active && context(active));
  }
  function frame(time) {
    frameId = null; if (!running()) return;
    const dt = lastTime === null ? 0 : Math.max(0, Math.min(0.05, (time - lastTime) / 1000)); lastTime = time;
    const moving = mode === 'webgl' && !reduced && Boolean(active?.module.animated || camera.isTransitioning());
    if (moving) elapsed += dt;
    dirty = false;
    try {
      camera.update(dt * 1000);
      if (!running()) return;
      if (mode === 'webgl') {
        if (active && !reduced) hook(active, 'update', dt, context(active));
        if (!running()) return;
        if (typeof active?.module.render === 'function') {
          hook(active, 'render', context(active), renderer, world, camera.camera);
        } else renderer.render(world, camera.camera);
      } else drawFallback();
    } catch (error) { report(error); show('fallback', 'render-error'); }
    if (dirty || (mode === 'webgl' && !reduced && (active?.module.animated || camera.isTransitioning()))) schedule();
    else lastTime = null;
  }
  const visibility = () => { if (doc.hidden) cancelFrame(); else invalidate(); };
  const onResize = () => { if (!destroyed) api.resize(); };
  const motion = event => api.setReducedMotion(event.matches);
  const contextLost = event => { event.preventDefault(); cancelFrame(); show('fallback', 'context-lost'); api.resize(); };
  const contextRestored = () => { if (!destroyed && renderer) { show('webgl'); configureQuality(); api.resize(); } };
  const events = [[win, 'resize', onResize], [doc, 'visibilitychange', visibility],
    [canvas, 'webglcontextlost', contextLost], [canvas, 'webglcontextrestored', contextRestored]];
  const api = Object.freeze({
    initialize() {
      if (destroyed) throw new Error('world engine destroyed');
      if (initialized) return api;
      initialized = true;
      world = new THREE.Scene(); camera = createCameraRig(THREE, invalidate);
      const lighting = WORLD_LIGHTING.cinematic;
      lights = { ambient: new THREE.AmbientLight(lighting.ambient.color, lighting.ambient.intensity),
        directional: new THREE.DirectionalLight(lighting.directional.color, lighting.directional.intensity),
        point: new THREE.PointLight(lighting.point.color, lighting.point.intensity, lighting.point.distance, lighting.point.decay) };
      lights.directional.position.set(...lighting.directional.position); lights.point.position.set(...lighting.point.position);
      lights.directional.userData.wantsShadow = lighting.directional.castShadow; lights.point.userData.wantsShadow = lighting.point.castShadow;
      world.add(...Object.values(lights));
      try { fallback = fallbackCanvas?.getContext('2d') ?? null; } catch (error) { report(error); }
      for (const [target, name, fn] of events) target.addEventListener(name, fn);
      if (reducedMotion === undefined) media?.addEventListener?.('change', motion);
      try {
        const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' });
        if (gl) {
          renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
          renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.setClearColor(WORLD_PALETTE.black, 0); configureQuality(); show('webgl');
        } else show('fallback', 'webgl2-unavailable');
      } catch (error) { report(error); show('fallback', 'renderer-initialization-failed'); }
      if (win.ResizeObserver) { observer = new win.ResizeObserver(onResize); observer.observe(canvas); }
      api.resize();
      if (navigation) { unsubscribe = navigation.subscribe(sync); sync(navigation.getState()); }
      return api;
    },
    registerScene(id, module = {}) {
      if (destroyed) throw new Error('world engine destroyed');
      if (records.has(id)) throw new Error(`Scene ${id} already registered`);
      if (!((typeof id === 'string' && id.trim()) || (Number.isSafeInteger(id) && id > 0))) throw new TypeError('stable scene ID required');
      for (const key of ['setup', 'activate', 'setBeat', 'update', 'render', 'deactivate', 'dispose', 'drawFallback']) if (module[key] !== undefined && typeof module[key] !== 'function') throw new TypeError(`scene ${id}.${key} must be a function`);
      records.set(id, { id, module, root: new THREE.Group(), resources: new Set(), setup: false, activationAbort: null, beatAbort: null });
      if (initialized && navigation?.getState().sceneId === id) sync(navigation.getState());
      return api;
    },
    activateScene(id) {
      if (destroyed) return false;
      if (!initialized) api.initialize();
      const next = records.get(id); if (!next) throw new RangeError(`Scene ${id} not registered`);
      if (active === next) return true;
      const token = deactivate();
      if (token !== generation || destroyed) return false;
      camera.reset();
      if (token !== generation || destroyed) return false;
      elapsed = 0; lastTime = null;
      active = next; next.activationAbort = new AbortController(); next.beatAbort = null;
      if (!next.setup) { next.setup = true; hook(next, 'setup', context(next)); }
      if (active !== next || destroyed || token !== generation) return false;
      world.add(next.root); hook(next, 'activate', context(next)); invalidate(); return true;
    },
    setBeat(index, meta = {}) {
      if (destroyed || !active) return false;
      if (!Number.isInteger(index) || index < 0) throw new RangeError('beat index must be nonnegative');
      const token = ++generation, record = active; record.beatAbort?.abort('beat-change');
      if (token !== generation || destroyed) return false;
      camera.cancel('beat-change');
      if (token !== generation || destroyed) return false;
      record.beatAbort = new AbortController();
      hook(record, 'setBeat', index, context(record), Object.freeze({ ...meta })); invalidate(); return true;
    },
    resize(width, height) {
      if (!initialized || destroyed) return false;
      if (width === undefined && height === undefined) {
        const rect = (mode === 'webgl' ? canvas : fallbackCanvas ?? canvas).getBoundingClientRect();
        width = rect.width || size.width; height = rect.height || size.height;
      }
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new RangeError('viewport dimensions must be positive');
      size = { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
      renderer?.setSize(size.width, size.height, false); camera.resize(size.width, size.height);
      if (fallbackCanvas) { fallbackCanvas.width = size.width; fallbackCanvas.height = size.height; }
      invalidate(); return true;
    },
    setQuality(value) {
      if (!Object.hasOwn(WORLD_QUALITY, value)) throw new RangeError('quality must be high or low');
      if (destroyed) return;
      quality = value; configureQuality(); if (initialized) api.resize();
    },
    setReducedMotion(value) { if (destroyed) return; reduced = Boolean(value); camera?.setReducedMotion(reduced || mode !== 'webgl'); invalidate(); },
    setLighting(config = 'cinematic') {
      if (!initialized || destroyed) return;
      if (typeof config === 'string') {
        if (!Object.hasOwn(WORLD_LIGHTING, config)) throw new RangeError('unknown lighting preset');
        config = WORLD_LIGHTING[config];
      }
      for (const key of ['ambient', 'directional', 'point']) if (config[key]) {
        const light = lights[key], values = config[key];
        if (values.color !== undefined) light.color.set(values.color);
        for (const name of ['intensity', 'distance', 'decay']) if (values[name] !== undefined) light[name] = values[name];
        if (values.position) light.position.set(...values.position);
        if (values.castShadow !== undefined) light.userData.wantsShadow = Boolean(values.castShadow);
      }
      configureQuality(); invalidate();
    },
    setBackground({ color = null, fogNear, fogFar } = {}) {
      if (!world || destroyed) return;
      world.background = color === null ? null : new THREE.Color(color);
      world.fog = fogNear !== undefined && fogFar !== undefined ? new THREE.Fog(color ?? WORLD_PALETTE.navy, fogNear, fogFar) : null; invalidate();
    },
    pause() { paused = true; cancelFrame(); },
    resume() { if (!destroyed) { paused = false; invalidate(); } },
    disposeScene(id) {
      const record = records.get(id); if (!record) return false;
      if (active === record) deactivate();
      hook(record, 'dispose', context(record));
      const resources = collectWorldResources(record.root, new Set(record.resources)), keep = new Set();
      for (const other of records.values()) if (other !== record) collectWorldResources(other.root, new Set(other.resources)).forEach(r => keep.add(r));
      for (const resource of resources) if (!keep.has(resource)) disposeResource(resource);
      record.root.clear(); record.resources.clear(); records.delete(id); invalidate(); return true;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      paused = true; cancelFrame(); unsubscribe?.(); unsubscribe = null; observer?.disconnect();
      for (const [target, name, fn] of events) target.removeEventListener(name, fn);
      media?.removeEventListener?.('change', motion);
      for (const id of [...records.keys()]) api.disposeScene(id);
      camera?.cancel('destroyed');
      if (world) collectWorldResources(world).forEach(disposeResource);
      renderer?.dispose(); renderer?.forceContextLoss?.();
      world?.clear(); canvas.style.display = originalDisplay.canvas;
      if (fallbackCanvas) fallbackCanvas.style.display = originalDisplay.fallback;
      destroyed = true; initialized = false; mode = 'destroyed'; renderer = null; active = null;
    },
    invalidate,
    get camera() { return camera; },
    getStatus: () => Object.freeze({ initialized, destroyed, mode, reason, quality, reducedMotion: reduced, paused,
      activeSceneId: active?.id ?? null, width: size.width, height: size.height })
  });
  return api;
}
