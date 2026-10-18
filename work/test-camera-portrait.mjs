import * as THREE from 'three';

function clothSample(u, v, t) {
  const K = 6.28318530718;
  const e = Math.pow(u, 1.1);
  const de = 1.1 * Math.pow(Math.max(u, 0.00001), 0.1);
  const gust = 0.90 + 0.10 * Math.sin(t * 0.47);
  const p = K * (1.15 * u - 0.20 * t) + 1.05 * v + 0.12 * Math.sin(K * v);
  const pu = K * 1.15;
  const pv = 1.05 + 0.12 * K * Math.cos(K * v);
  const q = K * (2.10 * u - 0.31 * t) + 1.1 * v;
  const r = K * (3.65 * u - 1.25 * v - 0.16 * t) + 0.45 * Math.sin(K * (0.55 * v - 0.12 * t));
  const ru = K * 3.65;
  const rv = -K * 1.25 + 0.45 * K * 0.55 * Math.cos(K * (0.55 * v - 0.12 * t));
  const s = K * (6.4 * u - 3.1 * v - 0.17 * t);
  const b = K * (0.85 * u - 0.18 * t) + 0.25 * v;
  const micro = K * (11.2 * u + 4.8 * v - 0.21 * t) + 0.45 * Math.sin(K * (2.2 * u - 1.5 * v));
  const mu = K * 11.2 + 0.45 * K * 2.2 * Math.cos(K * (2.2 * u - 1.5 * v));
  const mv = K * 4.8 - 0.45 * K * 1.5 * Math.cos(K * (2.2 * u - 1.5 * v));

  const sp = Math.sin(p), cp = Math.cos(p);
  const sq = Math.sin(q), cq = Math.cos(q);
  const sr = Math.sin(r), cr = Math.cos(r);
  const ss = Math.sin(s), cs = Math.cos(s);
  const sb = Math.sin(b), cb = Math.cos(b);

  const wave = 0.52 * sp + 0.15 * sq + 0.18 * sr + 0.075 * ss + 0.022 * Math.sin(micro);
  const posX = 5.8 * u - 0.36 * u * u * (1 - cp);
  const posY = 2.45 - v * (5.8 * 2 / 3) - 0.15 * u * u + e * 0.14 * sb;
  const posZ = e * gust * wave;

  const du = new THREE.Vector3(
    5.8 - 0.72 * u * (1 - cp) - 0.36 * u * u * sp * pu,
    -0.30 * u + 0.14 * (de * sb + e * cb * K * 0.85),
    gust * (de * wave + e * (0.52 * cp * pu + 0.15 * cq * K * 2.10 + 0.18 * cr * ru + 0.075 * cs * K * 6.4 + 0.022 * Math.cos(micro) * mu))
  );

  const dv = new THREE.Vector3(
    -0.36 * u * u * sp * pv,
    -5.8 * 2 / 3 + e * 0.14 * cb * 0.25,
    e * gust * (0.52 * cp * pv + 0.15 * cq * 1.1 + 0.18 * cr * rv - 0.075 * cs * K * 3.1 + 0.022 * Math.cos(micro) * mv)
  );

  const normal = new THREE.Vector3().crossVectors(dv, du).normalize();
  return { pos: new THREE.Vector3(posX, posY, posZ), normal };
}

const flagGroup = new THREE.Group();
flagGroup.position.set(-0.85, 0.45, 0);
flagGroup.rotation.y = -0.22;
flagGroup.scale.set(1.22, 1.22, 1.22);
flagGroup.updateMatrixWorld(true);

const camera = new THREE.PerspectiveCamera(46, 9 / 16, 0.1, 100);

function checkCoverage(eye, aim, fov, time = 0) {
  camera.fov = fov;
  camera.aspect = 9 / 16;
  camera.position.set(...eye);
  camera.lookAt(new THREE.Vector3(...aim));
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  let ndcMinX = Infinity, ndcMaxX = -Infinity;
  let ndcMinY = Infinity, ndcMaxY = -Infinity;

  for (let u = 0; u <= 1.001; u += 0.02) {
    for (let v of [0, 1]) {
      const { pos } = clothSample(u, v, time);
      const worldPos = pos.clone().applyMatrix4(flagGroup.matrixWorld);
      const ndc = worldPos.clone().project(camera);
      ndcMinX = Math.min(ndcMinX, ndc.x);
      ndcMaxX = Math.max(ndcMaxX, ndc.x);
      ndcMinY = Math.min(ndcMinY, ndc.y);
      ndcMaxY = Math.max(ndcMaxY, ndc.y);
    }
  }
  for (let v = 0; v <= 1.001; v += 0.02) {
    for (let u of [0, 1]) {
      const { pos } = clothSample(u, v, time);
      const worldPos = pos.clone().applyMatrix4(flagGroup.matrixWorld);
      const ndc = worldPos.clone().project(camera);
      ndcMinX = Math.min(ndcMinX, ndc.x);
      ndcMaxX = Math.max(ndcMaxX, ndc.x);
      ndcMinY = Math.min(ndcMinY, ndc.y);
      ndcMaxY = Math.max(ndcMaxY, ndc.y);
    }
  }

  const covers = ndcMinX <= -1.0 && ndcMaxX >= 1.0 && ndcMinY <= -1.0 && ndcMaxY >= 1.0;
  return { covers, bounds: [ndcMinX, ndcMaxX, ndcMinY, ndcMaxY] };
}

const portraitKeyframes = [
  { t: 0.0, eye: [1.10, 0.55, 1.85], aim: [1.50, 0.65, -0.15], fov: 48 },
  { t: 1.5, eye: [1.35, 0.68, 2.30], aim: [1.45, 0.68, -0.15], fov: 46 },
  { t: 4.0, eye: [1.35, 0.72, 2.75], aim: [1.38, 0.70, -0.15], fov: 45 }
];

console.log('Testing portrait coverage:');
for (let s = 0; s <= 5.0; s += 1.0) {
  let i = 0;
  while (i < portraitKeyframes.length - 2 && portraitKeyframes[i + 1].t < s) i++;
  const k1 = portraitKeyframes[i];
  const k2 = portraitKeyframes[Math.min(portraitKeyframes.length - 1, i + 1)];
  const u = Math.max(0, Math.min(1, (s - k1.t) / (k2.t - k1.t || 1)));
  const smooth = u * u * (3 - 2 * u);
  const eye = k1.eye.map((v, idx) => v + (k2.eye[idx] - v) * smooth);
  const aim = k1.aim.map((v, idx) => v + (k2.aim[idx] - v) * smooth);
  const fov = k1.fov + (k2.fov - k1.fov) * smooth;
  const res = checkCoverage(eye, aim, fov, s);
  console.log(`Portrait s=${s}s: covers? ${res.covers} (X: [${res.bounds[0].toFixed(2)}, ${res.bounds[1].toFixed(2)}], Y: [${res.bounds[2].toFixed(2)}, ${res.bounds[3].toFixed(2)}])`);
}
