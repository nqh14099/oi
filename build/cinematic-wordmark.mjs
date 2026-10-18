// Scene 1 — Cinematic Living Cloth Particle Wordmark
// Generates high-density luminous stardust text that lives on the EXACT SAME waving cloth surface
// as the CPV flag, sharing the parametric clothSample deformation, time, and camera projection.

const clothSampleGLSL = `
void clothSample(vec2 uv, float t, out vec3 pos, out vec3 normal) {
  const float K = 6.28318530718;
  float u = uv.x, v = uv.y, e = pow(u, 1.1), de = 1.1 * pow(max(u, .00001), .1), gust = .90 + .10 * sin(t * .47);
  float p = K * (1.15 * u - .20 * t) + 1.05 * v + .12 * sin(K * v);
  float pu = K * 1.15, pv = 1.05 + .12 * K * cos(K * v);
  float q = K * (2.10 * u - .31 * t) + 1.1 * v;
  float r = K * (3.65 * u - 1.25 * v - .16 * t) + .45 * sin(K * (.55 * v - .12 * t));
  float ru = K * 3.65, rv = -K * 1.25 + .45 * K * .55 * cos(K * (.55 * v - .12 * t));
  float s = K * (6.4 * u - 3.1 * v - .17 * t), b = K * (.85 * u - .18 * t) + .25 * v;
  float micro = K * (11.2 * u + 4.8 * v - .21 * t) + .45 * sin(K * (2.2 * u - 1.5 * v));
  float mu = K * 11.2 + .45 * K * 2.2 * cos(K * (2.2 * u - 1.5 * v)), mv = K * 4.8 - .45 * K * 1.5 * cos(K * (2.2 * u - 1.5 * v));
  float sp = sin(p), cp = cos(p), sq = sin(q), cq = cos(q), sr = sin(r), cr = cos(r), ss = sin(s), cs = cos(s), sb = sin(b), cb = cos(b);
  float wave = .52 * sp + .15 * sq + .18 * sr + .075 * ss + .022 * sin(micro);
  pos = vec3(5.8 * u - .36 * u * u * (1. - cp), 2.45 - v * (5.8 * 2. / 3.) - .15 * u * u + e * .14 * sb, e * gust * wave);
  vec3 du = vec3(5.8 - .72 * u * (1. - cp) - .36 * u * u * sp * pu, -.30 * u + .14 * (de * sb + e * cb * K * .85), gust * (de * wave + e * (.52 * cp * pu + .15 * cq * K * 2.10 + .18 * cr * ru + .075 * cs * K * 6.4 + .022 * cos(micro) * mu)));
  vec3 dv = vec3(-.36 * u * u * sp * pv, -5.8 * 2. / 3. + e * .14 * cb * .25, e * gust * (.52 * cp * pv + .15 * cq * 1.1 + .18 * cr * rv - .075 * cs * K * 3.1 + .022 * cos(micro) * mv));
  normal = normalize(cross(dv, du));
}
`;

const vertexShader = `
attribute vec2 aTargetUV;
attribute vec2 aOriginUV;
attribute float aDelay;
attribute float aRegion;
attribute float aSize;
attribute float aSeed;

uniform float uTime;
uniform float uDPR;
uniform float uStageScale;
uniform float uGoldPulse;
uniform float uWordmarkAlpha;

varying vec3 vColor;
varying float vAlpha;
varying float vSeed;

${clothSampleGLSL}

// Sublevel Studio smootherstep: gradual acceleration then sharp snap into home position
float smootherstep(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  bool isAmbient = aRegion > 2.5;
  vec2 currentUV;
  float progress = 1.0;
  float landing = 0.0;

  if (isAmbient) {
    // Ambient stardust drifting gently across the cloth surface
    vec2 drift = vec2(
      sin(uTime * 0.28 + aSeed * 6.28318) * 0.05,
      cos(uTime * 0.22 + aSeed * 6.28318) * 0.04
    );
    currentUV = clamp(aOriginUV + drift, vec2(0.02), vec2(0.98));
  } else {
    // 0.0 - 1.0s: scattered stardust on cloth
    // 1.0 - 2.5s: particles converge toward target UV with Sublevel Studio smootherstep + swirl
    // 2.5 - 4.0s: wordmark complete, VIETNAM'S gold pulse
    // > 4.0s: living typography, waving gently with cloth folds
    float startT = 0.85 + aDelay * 0.65;
    float rawT = clamp((uTime - startT) / 1.35, 0.0, 1.0);
    progress = smootherstep(rawT);

    // Swirling trajectory during flight (Sublevel Studio technique)
    float flight = sin(progress * 3.14159265);
    vec2 delta = aTargetUV - aOriginUV;
    float len = max(length(delta), 1e-4);
    vec2 dir = delta / len;
    vec2 perp = vec2(-dir.y, dir.x);
    float swirl = (aSeed - 0.5) * 0.08 * flight;

    // Turbulence micro-jitter
    float tt = uTime * 2.2;
    vec2 turb = vec2(
      sin(tt * 3.0 + aSeed * 25.0),
      cos(tt * 2.6 + aSeed * 30.0)
    ) * (1.0 - progress) * 0.035;

    currentUV = mix(aOriginUV, aTargetUV, progress) + perp * swirl + turb;
    currentUV = clamp(currentUV, vec2(0.01), vec2(0.99));
    landing = smoothstep(0.85, 1.0, progress) * (1.0 - smoothstep(1.0, 1.3, uTime - startT));
  }

  // Sample the exact 3D cloth surface
  vec3 p, n;
  clothSample(currentUV, uTime, p, n);

  // Micro-wave response on text surface (subtle organic vibration)
  float microOffset = isAmbient ? 0.0 : sin(uTime * 3.6 + aTargetUV.x * 22.0 + aTargetUV.y * 16.0) * 0.0016;
  // Physically attached to cloth with tiny 0.0048 normal offset to eliminate z-fighting
  p += n * (0.0048 + microOffset);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // Point size scaled with camera distance and DPR
  float distScale = clamp(2.4 / -mv.z, 0.6, 2.0);
  float ptSize = aSize * uDPR * uStageScale * distScale;
  if (!isAmbient) {
    ptSize *= (1.0 + landing * 0.35);
  }
  gl_PointSize = clamp(ptSize, 1.0, 32.0);

  // Noble palette: ivory white, champagne gold, and warm imperial gold
  vec3 ivory = vec3(0.975, 0.952, 0.910);
  vec3 champagne = vec3(0.955, 0.885, 0.745);
  vec3 imperialGold = vec3(1.0, 0.795, 0.290);
  vec3 brightGold = vec3(1.0, 0.955, 0.690);

  vec3 col;
  if (isAmbient) {
    col = mix(ivory, champagne, aSeed);
  } else if (aRegion > 0.5 && aRegion < 1.5) {
    // VIETNAM'S
    col = mix(imperialGold, brightGold, uGoldPulse);
  } else {
    // REFORMING & POLITICAL SYSTEM
    col = mix(ivory, champagne, aSeed * 0.65);
  }

  // Micro-twinkle
  float shimmer = 0.90 + 0.10 * sin(uTime * 4.2 + aSeed * 6.28318);
  vColor = col * shimmer;

  float baseAlpha;
  if (isAmbient) {
    baseAlpha = (0.22 + 0.20 * sin(uTime * 0.9 + aSeed * 6.28318)) * uWordmarkAlpha;
  } else {
    baseAlpha = mix(0.28, 0.98, progress) * uWordmarkAlpha;
  }
  vAlpha = baseAlpha;
  vSeed = aSeed;
}
`;

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;
varying float vSeed;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float r = length(coord);
  if (r > 0.5) discard;

  float core = exp(-28.0 * r * r);
  float halo = exp(-7.5 * r * r) * 0.38;
  float intensity = core + halo;

  vec3 rgb = vColor * (1.0 + core * 0.65);
  gl_FragColor = vec4(rgb, vAlpha * intensity);
}
`;

function parseHeadingLines(heading) {
  if (!heading) return ['REFORMING', 'VIETNAM’S', 'POLITICAL SYSTEM'];
  const cleaned = heading.replace(/\s+/g, ' ').trim();
  const upper = cleaned.toUpperCase();
  if (upper.includes('REFORMING') && upper.includes('VIETNAM') && upper.includes('POLITICAL SYSTEM')) {
    return ['REFORMING', 'VIETNAM’S', 'POLITICAL SYSTEM'];
  }
  const rawLines = heading.split(/\n+/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length >= 3) return rawLines.slice(0, 3);
  if (rawLines.length === 2) return [rawLines[0], rawLines[1], ''];
  const words = cleaned.split(' ');
  if (words.length <= 1) return [cleaned, '', ''];
  if (words.length === 2) return [words[0], words[1], ''];
  if (words.length === 3) return [words[0], words[1], words[2]];
  const p1 = words.slice(0, Math.ceil(words.length / 3)).join(' ');
  const p2 = words.slice(Math.ceil(words.length / 3), Math.ceil(words.length * 2 / 3)).join(' ');
  const p3 = words.slice(Math.ceil(words.length * 2 / 3)).join(' ');
  return [p1, p2, p3];
}

function drawSpaced(g, text, x, y, spacing) {
  let curX = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    g.fillText(ch, curX, y);
    curX += g.measureText(ch).width + spacing;
  }
}

function rasterizeText(lines, w = 1200, h = 600) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  if (!g) return null;

  g.clearRect(0, 0, w, h);
  g.textBaseline = 'alphabetic';

  const left = 60;

  // Line 1: REFORMING (Ivory)
  g.font = '400 76px Georgia, "Times New Roman", serif';
  g.fillStyle = '#ff0000';
  drawSpaced(g, (lines[0] || 'REFORMING').toUpperCase(), left, 140, 5.0);

  // Line 2: VIETNAM'S (Imperial Gold)
  g.font = '700 120px Georgia, "Times New Roman", serif';
  g.fillStyle = '#00ff00';
  drawSpaced(g, (lines[1] || 'VIETNAM’S').toUpperCase(), left, 280, 3.5);

  // Line 3: POLITICAL SYSTEM (Ivory)
  g.font = '400 62px Georgia, "Times New Roman", serif';
  g.fillStyle = '#0000ff';
  drawSpaced(g, (lines[2] || 'POLITICAL SYSTEM').toUpperCase(), left, 385, 5.0);

  const imgData = g.getImageData(0, 0, w, h);
  const data = imgData.data;
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y += 3) {
    for (let x = 0; x < w; x += 3) {
      if (data[(y * w + x) * 4 + 3] > 40) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    imgData,
    w,
    h,
    bbox: { minX, maxX, minY, maxY }
  };
}

function samplePixels(rasterResult) {
  const { imgData, w, h, bbox } = rasterResult;
  const data = imgData.data;

  const targetUV = [];
  const originUV = [];
  const delay = [];
  const region = [];
  const size = [];
  const seedAttr = [];

  let lcg = 0x8a35;
  const rand = () => {
    lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0;
    return lcg / 4294967296;
  };

  // Flag UV bounding box for the typography:
  // Placed in the clear red silk field to the left of the sickle and hammer emblem.
  // u in [0.135, 0.280], v in [0.485, 0.655]
  const uMin = 0.135, uMax = 0.280;
  const vMin = 0.485, vMax = 0.655;

  const bw = bbox.maxX - bbox.minX;
  const bh = bbox.maxY - bbox.minY;

  const step = 2; // high density sampling
  for (let y = bbox.minY; y <= bbox.maxY; y += step) {
    for (let x = bbox.minX; x <= bbox.maxX; x += step) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
      if (a < 45) continue;

      let reg = 0;
      if (g > r && g > b) reg = 1;      // VIETNAM'S
      else if (b > r && b > g) reg = 2; // POLITICAL SYSTEM

      // Jitter for organic particle rasterization
      const jx = x + (rand() - 0.5) * 1.1;
      const jy = y + (rand() - 0.5) * 1.1;

      // Normalized coordinates within text bounding box
      const s = Math.max(0, Math.min(1, (jx - bbox.minX) / bw));
      const t = Math.max(0, Math.min(1, (jy - bbox.minY) / bh));

      // Target UV on flag surface
      const tu = uMin + s * (uMax - uMin);
      const tv = vMin + t * (vMax - vMin);

      // Origin UV scattered across the cloth surface
      const ou = 0.03 + rand() * 0.94;
      const ov = 0.03 + rand() * 0.94;

      // Stagger delay based on spatial position and seed
      const d = Math.max(0, Math.min(1, t * 0.35 + s * 0.35 + rand() * 0.30));

      const isAccent = rand() > 0.88;
      const sz = isAccent ? (3.6 + rand() * 1.4) : (2.2 + rand() * 0.9);
      const seedVal = rand();

      targetUV.push(tu, tv);
      originUV.push(ou, ov);
      delay.push(d);
      region.push(reg);
      size.push(sz);
      seedAttr.push(seedVal);
    }
  }

  // Add 600 ambient floating stardust motes scattered across the cloth
  for (let i = 0; i < 600; i++) {
    const tu = 0.02 + rand() * 0.96;
    const tv = 0.02 + rand() * 0.96;
    const ou = tu + (rand() - 0.5) * 0.15;
    const ov = tv + (rand() - 0.5) * 0.15;

    targetUV.push(tu, tv);
    originUV.push(ou, ov);
    delay.push(rand());
    region.push(3); // ambient
    size.push(1.5 + rand() * 1.4);
    seedAttr.push(rand());
  }

  return { targetUV, originUV, delay, region, size, seedAttr };
}

export function createParticleWordmark(THREE, { stageWidth = 1600, stageHeight = 900 } = {}) {
  const uniforms = {
    uTime: { value: 0 },
    uDPR: { value: 1 },
    uStageScale: { value: 1 },
    uGoldPulse: { value: 0 },
    uWordmarkAlpha: { value: 1 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  let geometry = null;
  let points = null;
  let currentHeading = '';
  let parentGroup = null;

  function build(heading) {
    currentHeading = heading;
    if (points && parentGroup) {
      parentGroup.remove(points);
      geometry?.dispose();
    }
    const lines = parseHeadingLines(heading);
    const rasterResult = rasterizeText(lines, 1200, 600);
    if (!rasterResult) return;
    const sampled = samplePixels(rasterResult);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(sampled.targetUV.length / 2 * 3), 3));
    geometry.setAttribute('aTargetUV', new THREE.Float32BufferAttribute(sampled.targetUV, 2));
    geometry.setAttribute('aOriginUV', new THREE.Float32BufferAttribute(sampled.originUV, 2));
    geometry.setAttribute('aDelay', new THREE.Float32BufferAttribute(sampled.delay, 1));
    geometry.setAttribute('aRegion', new THREE.Float32BufferAttribute(sampled.region, 1));
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sampled.size, 1));
    geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(sampled.seedAttr, 1));

    points = new THREE.Points(geometry, material);
    points.name = 'Living Cloth Particle Wordmark';
    points.frustumCulled = false;
    points.renderOrder = 3;

    if (parentGroup) {
      parentGroup.add(points);
    }
  }

  build('REFORMING VIETNAM’S POLITICAL SYSTEM');

  return {
    get points() { return points; },
    uniforms,
    attachTo(group) {
      parentGroup = group;
      if (points && parentGroup && points.parent !== parentGroup) {
        parentGroup.add(points);
      }
    },
    update(time, dt, beat, reducedMotion) {
      if (beat !== 0) {
        uniforms.uWordmarkAlpha.value = Math.max(0, uniforms.uWordmarkAlpha.value - dt * 2.5);
        return;
      }
      if (reducedMotion) {
        uniforms.uTime.value = 5.0;
        uniforms.uGoldPulse.value = 0.0;
        uniforms.uWordmarkAlpha.value = 1.0;
        return;
      }
      uniforms.uTime.value = time;
      uniforms.uWordmarkAlpha.value = 1.0;

      // Gold pulse on VIETNAM'S between 2.5s and 4.0s
      if (time >= 2.5 && time <= 4.0) {
        const p = (time - 2.5) / 1.5;
        uniforms.uGoldPulse.value = Math.sin(p * Math.PI);
      } else {
        uniforms.uGoldPulse.value = 0;
      }
    },
    resize(width, height, dpr) {
      uniforms.uDPR.value = dpr || 1;
      uniforms.uStageScale.value = (height || 900) / 900;
    },
    setHeading(heading) {
      if (heading && heading !== currentHeading) {
        build(heading);
      }
    },
    render() {
      // Points is now a physical child of flagGroup in the 3D scene!
      // Rendered automatically as part of scene into targets.linear.
    },
    dispose() {
      if (points && parentGroup) parentGroup.remove(points);
      geometry?.dispose();
      material.dispose();
      parentGroup = null;
    }
  };
}
