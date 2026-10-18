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
  return { pos: new THREE.Vector3(posX, posY, posZ) };
}

const flagGroup = new THREE.Group();
flagGroup.position.set(-0.65, 0.45, 0);
flagGroup.rotation.y = -0.22;
flagGroup.scale.set(1.22, 1.22, 1.22);
flagGroup.updateMatrixWorld(true);

const camera = new THREE.PerspectiveCamera(39, 16 / 9, 0.1, 100);
camera.position.set(1.25, 0.70, 2.48);
camera.lookAt(new THREE.Vector3(1.48, 0.68, -0.18));
camera.updateMatrixWorld(true);
camera.updateProjectionMatrix();

function toScreen(u, v, t = 4.8) {
  const { pos } = clothSample(u, v, t);
  const worldPos = pos.clone().applyMatrix4(flagGroup.matrixWorld);
  const ndc = worldPos.clone().project(camera);
  return {
    x: Math.round((ndc.x + 1) * 0.5 * 1600),
    y: Math.round((1 - ndc.y) * 0.5 * 900)
  };
}

console.log('Testing uMin=0.135, uMax=0.28, vMin=0.485, vMax=0.655:');
console.log('Top Left (0.135, 0.485):', toScreen(0.135, 0.485));
console.log('Top Right (0.280, 0.485):', toScreen(0.280, 0.485));
console.log('Bottom Left (0.135, 0.655):', toScreen(0.135, 0.655));
console.log('Bottom Right (0.280, 0.655):', toScreen(0.280, 0.655));
console.log('Mid Left (0.135, 0.570):', toScreen(0.135, 0.570));
console.log('Mid Right (0.280, 0.570):', toScreen(0.280, 0.570));
