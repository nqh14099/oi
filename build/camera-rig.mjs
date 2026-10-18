// Shared projection infrastructure; no scene-specific paths or DOM listeners.
export function createCameraRig(THREE, invalidate = () => {}) {
  const defaults = { projection: 'perspective', position: [0, 0, 12], target: [0, 0, 0], fov: 45, zoom: 1, orthoHeight: 12 };
  const perspective = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
  const orthographic = new THREE.OrthographicCamera(-12 * 16 / 18, 12 * 16 / 18, 6, -6, 0.1, 1000);
  let pose = { ...defaults, position: [...defaults.position], target: [...defaults.target] };
  let aspect = 16 / 9, transition = null, version = 0, reduced = false;
  function normalize(value) {
    const next = { ...pose, ...value };
    if (!['perspective', 'orthographic'].includes(next.projection)) throw new RangeError('camera projection');
    for (const name of ['position', 'target']) {
      if (!Array.isArray(next[name]) || next[name].length !== 3 || !next[name].every(Number.isFinite)) throw new TypeError(`camera ${name}: expected three finite coordinates`);
      next[name] = [...next[name]];
    }
    if (!Number.isFinite(next.fov) || next.fov <= 0 || next.fov >= 180 || !Number.isFinite(next.zoom) || next.zoom <= 0 || !Number.isFinite(next.orthoHeight) || next.orthoHeight <= 0) throw new RangeError('camera projection dimensions');
    return next;
  }
  function apply() {
    perspective.aspect = aspect; perspective.fov = pose.fov;
    const half = pose.orthoHeight / 2;
    orthographic.left = -half * aspect; orthographic.right = half * aspect;
    orthographic.top = half; orthographic.bottom = -half;
    for (const camera of [perspective, orthographic]) {
      camera.position.set(...pose.position); camera.lookAt(...pose.target); camera.zoom = pose.zoom;
      camera.updateProjectionMatrix();
    }
  }
  const publicPose = () => Object.freeze({ ...pose, position: Object.freeze([...pose.position]), target: Object.freeze([...pose.target]) });
  function stop(reason) {
    const old = transition; transition = null;
    if (!old) return;
    old.signal?.removeEventListener('abort', old.abort);
    old.onCancel?.(reason);
  }
  function finish() {
    const old = transition; if (!old) return;
    transition = null; old.signal?.removeEventListener('abort', old.abort);
    pose = old.to; apply(); invalidate(); old.onComplete?.();
  }
  const api = {
    get camera() { return pose.projection === 'perspective' ? perspective : orthographic; },
    perspective, orthographic, getPose: publicPose,
    isTransitioning: () => Boolean(transition),
    cancel: (reason = 'canceled') => { version++; stop(reason); },
    reset(value = defaults) {
      const next = normalize({ ...defaults, ...value }), expected = version + 1;
      api.cancel('reset'); if (version !== expected) return;
      pose = next; apply(); invalidate();
    },
    resize(width, height) { aspect = width / height; apply(); },
    setReducedMotion(value) { reduced = Boolean(value); if (reduced) finish(); },
    moveTo(value, { duration = 600, signal, onComplete, onCancel } = {}) {
      const next = normalize(value);
      if (!Number.isFinite(duration) || duration < 0) throw new RangeError('camera duration must be nonnegative');
      if (signal?.aborted) return Object.freeze({ cancel() {}, isCurrent: () => false });
      const expected = version + 1;
      api.cancel('superseded');
      if (version !== expected) return Object.freeze({ cancel() {}, isCurrent: () => false });
      const token = ++version;
      const handle = Object.freeze({ isCurrent: () => transition?.version === token,
        cancel() { if (transition?.version === token) api.cancel(); } });
      if (reduced || duration === 0) { pose = next; apply(); invalidate(); onComplete?.(); return handle; }
      transition = { version: token, from: normalize(pose), to: next, elapsed: 0, duration, signal, onComplete, onCancel,
        abort: () => { if (transition?.version === token) api.cancel('aborted'); } };
      signal?.addEventListener('abort', transition.abort, { once: true });
      // Projection switches explicitly; position/target and dimensions interpolate.
      pose.projection = next.projection; apply(); invalidate(); return handle;
    },
    update(deltaMs) {
      if (!transition) return false;
      if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new RangeError('camera delta');
      const t = transition; t.elapsed += deltaMs;
      const fraction = Math.min(1, t.elapsed / t.duration), eased = fraction * fraction * (3 - 2 * fraction);
      const mix = (a, b) => a + (b - a) * eased;
      pose = { projection: t.to.projection, position: t.from.position.map((v, i) => mix(v, t.to.position[i])),
        target: t.from.target.map((v, i) => mix(v, t.to.target[i])), fov: mix(t.from.fov, t.to.fov),
        zoom: mix(t.from.zoom, t.to.zoom), orthoHeight: mix(t.from.orthoHeight, t.to.orthoHeight) };
      apply(); if (fraction === 1) finish(); return true;
    }
  };
  apply(); return Object.freeze(api);
}
