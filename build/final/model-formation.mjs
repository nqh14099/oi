// CPVModelFormation — reusable, progress-driven 3D formation for meshes and groups.
// Technique study: ThreeUI DarkSoulsHoloCard (MIT) reveals its relief with a spatial scan
// field evaluated per fragment in world space plus fwidth() iso-contours. This module
// generalises that idea into an object-space growth field that follows each model's own
// geometry (custom origin, anisotropic metric, noise-modulated boundary), keeps the
// original materials/UV/normals/maps (shader patch on material clones via onBeforeCompile)
// and adds a structural edge overlay that leads the surface and retires before completion.
// Two modes share one interface:
//   'geometry-aware'  existing meshes / GLTF scenes: surfaces materialise along the field.
//   'procedural'      code-built geometry: index drawRange genuinely grows along topology
//                     (e.g. tubes built along a curve), optionally combined with the field.
// No requestAnimationFrame, no renderer: the host scene calls update(dt) from its hook.
export function createModelFormation(T, {
  object, mode = 'geometry-aware', origin = 'auto', axisWeights = [1, 1, 1], wireframe = true, edgeGlow = true,
  noiseStrength = .12, noiseScale = 3.2, edgeWidth = .07, edgeColor = '#f0cf8f', wireColor = '#e9d3a6', isoLines = true,
  duration = 2.8, delay = 0, restoreOnComplete = true, wireThreshold = 24, onProgress = () => {}
} = {}) {
  if (!object?.isObject3D) throw new TypeError('CPVModelFormation: object must be a THREE.Object3D');
  const uniforms = {
    uFormProgress: { value: 0 }, uFormOrigin: { value: new T.Vector3() }, uFormScale: { value: new T.Vector3(1, 1, 1) },
    uFormNoise: { value: noiseStrength }, uFormNoiseScale: { value: noiseScale }, uFormEdge: { value: edgeWidth },
    uFormGlow: { value: edgeGlow ? 1 : 0 }, uFormColor: { value: new T.Color(edgeColor) }, uFormIso: { value: isoLines ? 1 : 0 },
    uFormInverse: { value: new T.Matrix4() }, uFormWire: { value: new T.Color(wireColor) }
  };
  const entries = [], wires = [], ownResources = [];
  let progress = 0, playing = false, direction = 1, elapsed = 0, disposed = false, restored = false;

  // ---- field: object-space bounds measured from the actual geometry ----
  object.updateMatrixWorld(true);
  const inv = new T.Matrix4().copy(object.matrixWorld).invert();
  const box = new T.Box3(), tmpBox = new T.Box3();
  object.traverse(node => {
    if (!node.isMesh || !node.geometry) return;
    node.geometry.computeBoundingBox();
    tmpBox.copy(node.geometry.boundingBox).applyMatrix4(new T.Matrix4().multiplyMatrices(inv, node.matrixWorld));
    box.union(tmpBox);
  });
  const centre = box.getCenter(new T.Vector3()), extent = box.getSize(new T.Vector3());
  const o = Array.isArray(origin) ? new T.Vector3(...origin)
    : origin === 'base' ? new T.Vector3(centre.x, box.min.y, centre.z)
    : origin === 'spine' ? new T.Vector3(box.min.x, box.min.y, centre.z) : centre.clone();
  uniforms.uFormOrigin.value.copy(o);
  // farthest corner distance under the anisotropic metric → normalised field 0..1
  const w = new T.Vector3(...axisWeights);
  let far = 1e-4;
  for (let i = 0; i < 8; i++) {
    const c = new T.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
    far = Math.max(far, c.sub(o).multiply(w).length());
  }
  uniforms.uFormScale.value.copy(w).divideScalar(far);

  const FIELD = `
uniform float uFormProgress,uFormNoise,uFormNoiseScale,uFormEdge,uFormGlow,uFormIso;uniform vec3 uFormOrigin,uFormScale,uFormColor;varying vec3 vFormPos;
float cpvFH(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float cpvFN(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(cpvFH(i),cpvFH(i+vec3(1,0,0)),f.x),mix(cpvFH(i+vec3(0,1,0)),cpvFH(i+vec3(1,1,0)),f.x),f.y),mix(mix(cpvFH(i+vec3(0,0,1)),cpvFH(i+vec3(1,0,1)),f.x),mix(cpvFH(i+vec3(0,1,1)),cpvFH(i+1.),f.x),f.y),f.z);}
float cpvField(){vec3 q=vFormPos-uFormOrigin;float d=length(q*uFormScale);float n=cpvFN(vFormPos*uFormNoiseScale)*.65+cpvFN(vFormPos*uFormNoiseScale*2.7)*.35;return d+(n-.5)*2.*uFormNoise;}
float cpvFront(){return uFormProgress*(1.+2.*uFormNoise+uFormEdge*1.6)-uFormEdge*.6-uFormNoise;}
`;
  function patch(material) {
    const m = material.clone();
    m.userData.cpvFormationSource = material;
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = (shader, renderer) => {
      prev?.call(m, shader, renderer);
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = 'uniform mat4 uFormInverse;varying vec3 vFormPos;\n' + shader.vertexShader.replace('#include <project_vertex>',
        '#include <project_vertex>\nvFormPos=(uFormInverse*modelMatrix*vec4(transformed,1.)).xyz;');
      shader.fragmentShader = FIELD + shader.fragmentShader
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nfloat cpvD=cpvField(),cpvF=cpvFront();if(cpvD>cpvF)discard;float cpvE=1.-smoothstep(0.,uFormEdge,cpvF-cpvD);')
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
float cpvIso=uFormIso*(1.-smoothstep(0.,1.4*fwidth(cpvD*26.),abs(fract(cpvD*26.)-.5)-.0))*smoothstep(uFormEdge*3.,0.,cpvF-cpvD);
gl_FragColor.rgb+=uFormColor*(pow(cpvE,2.)*2.2+cpvIso*.35)*uFormGlow*(1.-smoothstep(.96,1.,uFormProgress));`);
    };
    m.customProgramCacheKey = () => 'cpv-formation:' + (material.customProgramCacheKey?.() ?? material.type);
    m.needsUpdate = true;
    ownResources.push(m);
    return m;
  }
  object.traverse(node => {
    if (!node.isMesh || node.userData.cpvFormationSkip) return;
    const original = node.material, patched = Array.isArray(original) ? original.map(patch) : patch(original);
    entries.push({ node, original, patched, index: node.geometry.index, range: { ...node.geometry.drawRange } });
    node.material = patched;
    if (wireframe && !node.isSkinnedMesh && !node.isInstancedMesh) {
      // Structural overlay derived from the real topology: feature edges of this geometry.
      const edges = new T.EdgesGeometry(node.geometry, wireThreshold);
      const lineMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, toneMapped: false, uniforms,
        vertexShader: 'uniform mat4 uFormInverse;varying vec3 vFormPos;void main(){vFormPos=(uFormInverse*modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: FIELD.replace('uniform float', 'uniform vec3 uFormWire;uniform float') + `void main(){float d=cpvField(),f=cpvFront();float lead=uFormEdge*4.5+.18;
 float ahead=smoothstep(f+lead,f+lead*.35,d);float solid=smoothstep(f-uFormEdge*.2,f-uFormEdge*2.2,d);float a=ahead*(1.-solid)*(1.-smoothstep(.82,.97,uFormProgress))*smoothstep(0.,.04,uFormProgress);
 if(a<.01)discard;gl_FragColor=vec4(mix(uFormWire,uFormColor,smoothstep(f+lead*.5,f,d))*(.9+.6*(1.-solid)),a*.85);}` });
      const lines = new T.LineSegments(edges, lineMat);
      lines.name = 'cpv-formation-wire'; lines.renderOrder = 2; lines.userData.cpvFormationSkip = true; lines.raycast = () => {};
      node.add(lines); wires.push(lines); ownResources.push(edges, lineMat);
    }
  });
  function applyProcedural(p) {
    if (mode !== 'procedural') return;
    for (const e of entries) {
      const g = e.node.geometry, count = e.index ? e.index.count : g.attributes.position.count;
      const step = e.node.isLine ? 2 : 3;
      g.setDrawRange(0, Math.max(0, Math.floor(count * Math.min(1, p * 1.05) / step) * step));
    }
  }
  function setMaterials(done) {
    if (!restoreOnComplete || done === restored) return;
    restored = done;
    for (const e of entries) e.node.material = done ? e.original : e.patched;
    for (const l of wires) l.visible = !done;
  }
  function apply() {
    object.updateMatrixWorld(true);
    uniforms.uFormInverse.value.copy(object.matrixWorld).invert();
    uniforms.uFormProgress.value = progress;
    applyProcedural(progress);
    setMaterials(progress >= 1);
    onProgress(progress);
  }
  const api = {
    get progress() { return progress; },
    get playing() { return playing; },
    setProgress(value) { if (disposed) return api; progress = Math.max(0, Math.min(1, Number(value) || 0)); apply(); return api; },
    seek(value) { playing = false; return api.setProgress(value); },
    play({ from, to = 1, duration: d = duration, delay: wait = delay } = {}) {
      if (disposed) return api;
      if (from !== undefined) api.setProgress(from);
      direction = to >= progress ? 1 : -1; api.target = to; api.speed = Math.abs(to - progress) / Math.max(.001, d) || 1 / d;
      elapsed = -wait; playing = true; return api;
    },
    replay(options = {}) { return api.play({ ...options, from: 0, to: 1 }); },
    reverse(options = {}) { return api.play({ ...options, to: 0 }); },
    pause() { playing = false; return api; },
    resume() { if (progress !== api.target) playing = true; return api; },
    finish() { playing = false; return api.setProgress(api.target ?? 1); },
    // Host scenes call this from their world-engine update hook (shared RAF).
    update(dt) {
      if (!playing || disposed) { uniforms.uFormInverse.value.copy(object.matrixWorld).invert(); return false; }
      elapsed += dt; if (elapsed < 0) return true;
      const next = progress + direction * api.speed * dt;
      if ((direction > 0 && next >= api.target) || (direction < 0 && next <= api.target)) { playing = false; api.setProgress(api.target); return false; }
      api.setProgress(next); return true;
    },
    getState: () => ({ progress, playing, mode, meshes: entries.length, wireOverlays: wires.length, restored, origin: o.toArray(), extent: extent.toArray() }),
    dispose() {
      if (disposed) return; disposed = true; playing = false;
      for (const e of entries) { e.node.material = e.original; e.node.geometry.setDrawRange(e.range.start, e.range.count); }
      for (const l of wires) l.removeFromParent();
      for (const r of ownResources) r.dispose?.();
    }
  };
  api.target = 1; api.speed = 1 / duration;
  apply();
  return api;
}
export const CPVModelFormation = { create: (THREE, options) => createModelFormation(THREE, options) };
