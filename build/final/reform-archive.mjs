// Scene 4 — THE REFORM ARCHIVE. Three historical volumes (Three.js, PBR), formed by
// CPVModelFormation, inside an orbital documentary gallery (Canvas 2D port of the ThreeUI
// GalleryHeading "Matte Rise" / rising-diagonal ring: tilted ring plane, perspective
// projection, affine-mapped rounded tiles, depth-sorted around the headline, sprung motion).
// Covers are original illustrations; gallery tiles are labelled IMAGE SLOTS that hold
// locally authored placeholder illustrations until verified photographs are supplied.
export const ARCHIVE_VOLUMES = [
  { id: 'I', kicker: 'VOLUME I · THE NECESSITY', title: 'WHY REFORM?', subtitle: 'When Complexity Becomes a Barrier',
    topics: ['Administrative complexity', 'Overlapping responsibilities', 'Institutional inefficiency', 'Public service accessibility'],
    scene: 3, link: 'See the procedural maze · Scene 03', cloth: '#4A0E18', ink: '#e8d9bd', gold: '#c3a47b' },
  { id: 'II', kicker: 'VOLUME II · THE TRANSFORMATION', title: 'REFORM IN ACTION', subtitle: 'Restructuring Vietnam’s Administration',
    topics: ['Administrative restructuring', 'Streamlined organisation', 'Clearer responsibilities', 'Intended effectiveness'],
    scene: 5, link: 'See 63 → 34 · Scene 05', cloth: '#b79a6c', ink: '#25070D', gold: '#6b4a1f' },
  { id: 'III', kicker: 'VOLUME III · OUR RESPONSIBILITY', title: 'BUILDING THE FUTURE', subtitle: 'Our Role in Political Development',
    topics: ['Civic awareness', 'Responsible participation', 'Academic integrity', 'Critical thinking'],
    scene: 9, link: 'See our responsibilities · Scene 09', cloth: '#25070D', ink: '#e8d9bd', gold: '#d8bf93' }
];
export const ARCHIVE_SLOTS = [
  ['RA-01', 'Public service counter', 0, 'administration'], ['RA-02', 'Citizen seeking help', 0, 'help'], ['RA-03', 'A changing city', 0, 'urban'],
  ['RA-04', 'Economic renewal', 0, 'economy'], ['RA-05', 'Coordinated agencies', 1, 'cooperation'], ['RA-06', 'Digital public services', 1, 'digital'],
  ['RA-07', 'Clear accountability', 1, 'accountability'], ['RA-08', 'Restructured administration', 1, 'administration'], ['RA-09', 'Citizens at the centre', 2, 'citizens'],
  ['RA-10', 'Working together', 2, 'cooperation'], ['RA-11', 'Community support', 2, 'help'], ['RA-12', 'Learning with evidence', 2, 'digital']
].map(([id, title, volume, asset]) => ({ id, title, volume, asset, source: null, status: 'IMAGE SLOT · source pending' }));
const BEAT_VOLUME = [0, 1, 1];

function createArchiveOrbit({ assets = {} } = {}) {
  // ring constants in a 1600×900 stage (GalleryHeading RING model, re-proportioned)
  const RING = { cx: 800, cy: 236, a: 540, ratio: .2, axis: -5, n: 12, tile: 118, radius: .16, dist: 9, phase: 90 };
  const DUR = 72; // one slow revolution; purposeful, never a commercial spinner
  const images = new Map();
  for (const [key, src] of Object.entries(assets)) { const img = new Image(); img.decoding = 'async'; img.src = src; images.set(key, img); }
  let canvas = null, ctx = null, W = 0, H = 0, K = 1, OX = 0, OY = 0, dpr = 1;
  let t = 0, spin = 0, spinVel = 0, focus = 0, focusTarget = 0, hover = 0, hoverTarget = 0, pointer = [0, 0], pointerS = [0, 0], reveal = 0, paused = false, grain = null;
  const tileState = ARCHIVE_SLOTS.map(() => ({ r: 1, rv: 0, a: 1 }));
  function basis() {
    const ax = (RING.axis + pointerS[0] * 3) * Math.PI / 180, cf = RING.ratio + pointerS[1] * .035, sf = Math.sqrt(1 - cf * cf);
    const U = [Math.cos(ax), Math.sin(ax), 0], V = [-Math.sin(ax) * cf, Math.cos(ax) * cf, sf];
    return { U, V, AX: [U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0]] };
  }
  function project(p, s = 1) { const k = RING.a * K * s * RING.dist / (RING.dist - p[2]); return [OX + RING.cx * K + k * p[0], OY + RING.cy * K + k * p[1], k]; }
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), d = g.createImageData(128, 128); let s = 0x51F3;
    for (let i = 0; i < d.data.length; i += 4) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const v = s >>> 24; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 18; }
    g.putImageData(d, 0, 0); return c;
  }
  function attach(node) {
    if (node === canvas) return;
    canvas = node; ctx = canvas?.getContext('2d') ?? null; W = 0;
  }
  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(rect.width * dpr)), h = Math.max(1, Math.round(rect.height * dpr));
    if (w === W && h === H) return;
    W = canvas.width = w; H = canvas.height = h; K = Math.min(W / 1600, H / 900); OX = (W - 1600 * K) / 2; OY = (H - 900 * K) / 2;
  }
  function roundRect(g, w, h, r) { g.beginPath(); g.moveTo(-w / 2 + r, -h / 2); g.arcTo(w / 2, -h / 2, w / 2, h / 2, r); g.arcTo(w / 2, h / 2, -w / 2, h / 2, r); g.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r); g.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r); g.closePath(); }
  function drawTile(g, i, psi, b) {
    const st = tileState[i], slot = ARCHIVE_SLOTS[i];
    const c = Math.cos(psi), s = Math.sin(psi), R = st.r;
    const C = [(c * b.U[0] + s * b.V[0]) * R, (c * b.U[1] + s * b.V[1]) * R, (c * b.U[2] + s * b.V[2]) * R];
    const Tg = [-s * b.U[0] + c * b.V[0], -s * b.U[1] + c * b.V[1], -s * b.U[2] + c * b.V[2]];
    const h = RING.tile / (2 * RING.a) * (slot.volume === focus ? 1 + .18 * focusTarget01() : 1);
    const p0 = project(C), pT = project([C[0] + Tg[0] * h, C[1] + Tg[1] * h, C[2] + Tg[2] * h]), pA = project([C[0] + b.AX[0] * h, C[1] + b.AX[1] * h, C[2] + b.AX[2] * h]);
    // tiles face the viewer like hung prints: keep the tangent, use screen-up for the second edge
    const ex = pT[0] - p0[0], ey = pT[1] - p0[1], len = Math.hypot(ex, ey) || 1, fy = len * 1.25;
    const fx = 0; const TS = 512;
    const depth = (C[2] / R + 1) / 2; // 0 back … 1 front
    const alpha = st.a * (.38 + .62 * depth) * reveal;
    if (alpha < .01) return;
    g.save();
    g.globalAlpha = alpha;
    g.setTransform(ex * 2 / TS, ey * 2 / TS, fx, fy * 2 / TS, p0[0], p0[1]);
    roundRect(g, TS, TS, TS * RING.radius); g.clip();
    g.fillStyle = '#1b0d10'; g.fillRect(-TS / 2, -TS / 2, TS, TS);
    const img = images.get(slot.asset);
    if (img?.complete && img.naturalWidth) {
      const crop = i >= 7 ? .18 : 0; // alternate crops for re-used placeholder art
      g.filter = 'sepia(.55) saturate(.8) contrast(1.05)';
      g.drawImage(img, img.naturalWidth * crop * .5, img.naturalHeight * crop * .5, img.naturalWidth * (1 - crop), img.naturalHeight * (1 - crop), -TS / 2, -TS / 2, TS, TS);
      g.filter = 'none';
    }
    const shade = g.createLinearGradient(0, -TS / 2, 0, TS / 2); shade.addColorStop(0, 'rgba(37,7,13,.05)'); shade.addColorStop(.62, 'rgba(37,7,13,.18)'); shade.addColorStop(1, 'rgba(9,9,11,.86)');
    g.fillStyle = shade; g.fillRect(-TS / 2, -TS / 2, TS, TS);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = slot.volume === 1 ? 'rgba(195,164,123,.32)' : 'rgba(74,14,24,.30)'; g.fillRect(-TS / 2, -TS / 2, TS, TS); g.globalCompositeOperation = 'source-over';
    if (grain) { g.fillStyle = g.createPattern(grain, 'repeat'); g.fillRect(-TS / 2, -TS / 2, TS, TS); }
    g.fillStyle = '#e8d9bd'; g.font = '600 30px "Segoe UI",Arial,sans-serif'; g.textAlign = 'left'; g.fillText(slot.id, -TS / 2 + 30, TS / 2 - 78);
    g.font = '400 25px Georgia,serif'; g.fillText(slot.title, -TS / 2 + 30, TS / 2 - 42);
    g.fillStyle = 'rgba(232,217,189,.62)'; g.font = '600 18px "Segoe UI",Arial,sans-serif'; g.fillText('IMAGE SLOT · SOURCE PENDING', -TS / 2 + 30, -TS / 2 + 42);
    g.restore();
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  const focusTarget01 = () => Math.max(0, Math.min(1, focusTarget));
  function drawHeadline(g) {
    const cap = 132 * K, y = OY + RING.cy * K + cap * .36, x = OX + 800 * K;
    g.save(); g.globalAlpha = reveal; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `400 ${cap / .7}px Georgia,"Times New Roman",serif`;
    if ('letterSpacing' in g) g.letterSpacing = `${cap * .16}px`;
    const rise = (1 - reveal) * 40 * K; // Matte Rise: the word lifts into place under soft light
    const grad = g.createLinearGradient(0, y - cap, 0, y); grad.addColorStop(0, '#f4ebdc'); grad.addColorStop(1, '#c3a47b');
    g.fillStyle = 'rgba(37,7,13,.9)'; g.fillText('REFORM', x + 5 * K, y + rise + 6 * K);
    g.fillStyle = grad; g.fillText('REFORM', x, y + rise);
    g.restore();
  }
  function render() {
    if (!ctx) return;
    resize(); grain ??= makeGrain();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.imageSmoothingQuality = 'high';
    const b = basis(), list = [];
    for (let i = 0; i < RING.n; i++) {
      const psi = RING.phase * Math.PI / 180 - i * 2 * Math.PI / RING.n + spin;
      list.push({ i, psi, z: Math.cos(psi) * b.U[2] + Math.sin(psi) * b.V[2] });
    }
    list.sort((p, q) => p.z - q.z);
    let text = false;
    for (const item of list) { if (!text && item.z > 0) { drawHeadline(ctx); text = true; } drawTile(ctx, item.i, item.psi, b); }
    if (!text) drawHeadline(ctx);
  }
  function frontSpinFor(volume) {
    // spin that brings the mean angle of the volume's slots to the front of the ring
    const b = basis(); let best = 0, bestZ = -9;
    for (let k = 0; k < 72; k++) {
      const s = k / 72 * Math.PI * 2; let z = 0;
      ARCHIVE_SLOTS.forEach((slot, i) => { if (slot.volume !== volume) return; const psi = RING.phase * Math.PI / 180 - i * 2 * Math.PI / RING.n + s; z += Math.cos(psi) * b.U[2] + Math.sin(psi) * b.V[2]; });
      if (z > bestZ) { bestZ = z; best = s; }
    }
    return best;
  }
  let spinGoal = null;
  return {
    attach, render,
    update(dt, { reduced = false } = {}) {
      if (!canvas?.isConnected) return;
      t += dt;
      reveal = reduced ? 1 : Math.min(1, reveal + dt / 1.6);
      pointerS[0] += (pointer[0] - pointerS[0]) * Math.min(1, dt * 3); pointerS[1] += (pointer[1] - pointerS[1]) * Math.min(1, dt * 3);
      hover += (hoverTarget - hover) * Math.min(1, dt * 4);
      if (!paused && !reduced) {
        if (spinGoal !== null) {
          // sprung approach to the volume's orbit position (Matte Rise uses a spring ring)
          let d = ((spinGoal - spin) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
          spinVel += (d * 7 - spinVel * 4.2) * dt; spin += spinVel * dt;
          if (Math.abs(d) < .002 && Math.abs(spinVel) < .002) spinGoal = null;
        } else spin += (Math.PI * 2 / DUR) * (1 - .85 * hover) * dt;
      } else if (reduced && spinGoal !== null) { spin = spinGoal; spinGoal = null; }
      tileState.forEach((st, i) => {
        const related = ARCHIVE_SLOTS[i].volume === focus;
        const r = related ? .94 : 1.12, a = related ? 1 : .42;
        st.rv += ((r - st.r) * 30 - st.rv * 9) * dt; st.r += st.rv * dt; st.a += (a - st.a) * Math.min(1, dt * 3);
        if (reduced) { st.r = r; st.a = a; st.rv = 0; }
      });
      render();
    },
    setFocus(volume, { immediate = false } = {}) { focus = volume; focusTarget = 1; spinGoal = frontSpinFor(volume); if (immediate) { spin = spinGoal; spinGoal = null; } },
    setPointer(x, y) { pointer = [Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))]; },
    setHover(v) { hoverTarget = v ? 1 : 0; },
    pause() { paused = true; }, resume() { paused = false; },
    restart() { reveal = 0; },
    getState: () => ({ attached: !!canvas?.isConnected, spin, focus, paused, reveal, tiles: ARCHIVE_SLOTS.length, imagesReady: [...images.values()].filter(i => i.complete && i.naturalWidth).length })
  };
}

export function createArchiveScene(sceneData, { assets = {}, createFormation = null } = {}) {
  let T, root, own, studio, beat = 0, volume = 0, selected = null, hoverBook = -1, canvasEl = null, cam = null, clock = 0, ctxRef = null;
  const books = [], textures = [], formations = [], orbit = createArchiveOrbit({ assets });
  const listeners = [];
  const tex = (c, color = true) => { const t = own(new T.CanvasTexture(c)); if (color) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; textures.push(t); return t; };
  function rnd(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
  // Cover artwork + a matching gold mask (metalness/emboss) so foil reads as metal in PBR.
  function coverMaps(v) {
    const V = ARCHIVE_VOLUMES[v], W = 1024, H = 1536;
    const color = document.createElement('canvas'), mask = document.createElement('canvas'); color.width = mask.width = W; color.height = mask.height = H;
    const g = color.getContext('2d'), m = mask.getContext('2d');
    g.fillStyle = V.cloth; g.fillRect(0, 0, W, H); m.fillStyle = '#000'; m.fillRect(0, 0, W, H);
    const r = rnd(4100 + v * 77);
    for (let i = 0; i < 90000; i++) { g.fillStyle = r() > .5 ? 'rgba(255,240,210,.035)' : 'rgba(10,4,4,.06)'; g.fillRect(r() * W, r() * H, v === 1 ? 2 : 1, v === 1 ? 1 : 2); }
    const both = fn => { fn(g, V.gold); fn(m, '#fff'); };
    // motifs (low-contrast, debossed, illustrative only)
    g.save(); g.globalAlpha = .16; g.strokeStyle = V.ink; g.lineWidth = 2;
    if (v === 0) { for (let k = 0; k < 7; k++) { const x = 150 + (k % 3) * 250 + (k * 37 % 40), y = 560 + Math.floor(k / 3) * 230; g.strokeRect(x, y, 210, 260); for (let l = 0; l < 9; l++) { g.beginPath(); g.moveTo(x + 20, y + 40 + l * 22); g.lineTo(x + 190 - (l % 3) * 30, y + 40 + l * 22); g.stroke(); } g.beginPath(); g.arc(x + 160, y + 220, 26, 0, 7); g.stroke(); } }
    else if (v === 1) { const nodes = []; for (let k = 0; k < 34; k++) nodes.push([190 + (k % 6) * 128, 600 + Math.floor(k / 6) * 92]); g.globalAlpha = .28; nodes.forEach(([x, y], k) => { g.beginPath(); g.arc(x, y, 9, 0, 7); g.stroke(); if (k % 6) { g.beginPath(); g.moveTo(x - 119, y); g.lineTo(x - 9, y); g.stroke(); } if (k >= 6) { g.beginPath(); g.moveTo(x, y - 83); g.lineTo(x, y - 9); g.stroke(); } }); }
    else { const pts = []; for (let k = 0; k < 26; k++) pts.push([140 + r() * 740, 560 + r() * 520]); g.globalAlpha = .3; for (let k = 0; k < pts.length; k++) for (let l = k + 1; l < pts.length; l++) { const d = Math.hypot(pts[k][0] - pts[l][0], pts[k][1] - pts[l][1]); if (d < 190) { g.beginPath(); g.moveTo(...pts[k]); g.lineTo(...pts[l]); g.stroke(); } } pts.forEach(p => { g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.stroke(); }); }
    g.restore();
    both((x, ink) => { x.strokeStyle = ink; x.lineWidth = 5; x.strokeRect(70, 66, 884, 1404); x.lineWidth = 2; x.strokeRect(92, 88, 840, 1360);
      for (const [cx, cy, sx, sy] of [[92, 88, 1, 1], [932, 88, -1, 1], [92, 1448, 1, -1], [932, 1448, -1, -1]]) { x.save(); x.translate(cx, cy); x.scale(sx, sy); x.beginPath(); x.moveTo(0, 70); x.quadraticCurveTo(10, 10, 70, 0); x.moveTo(16, 46); x.quadraticCurveTo(46, 46, 46, 16); x.stroke(); x.restore(); }
      x.fillStyle = ink; x.textAlign = 'center';
      x.font = '600 26px "Segoe UI",Arial,sans-serif'; if ('letterSpacing' in x) x.letterSpacing = '7px'; x.fillText('THE REFORM ARCHIVE', 512, 178); if ('letterSpacing' in x) x.letterSpacing = '0px';
      x.font = '400 30px Georgia,serif'; x.fillText(V.kicker, 512, 250);
      const words = V.title.split(' '), lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [V.title];
      x.font = `400 ${lines.length > 1 ? 112 : 124}px Georgia,"Times New Roman",serif`; lines.forEach((line, i) => x.fillText(line, 512, 395 + i * 120, 820));
      x.beginPath(); x.moveTo(330, 520); x.lineTo(694, 520); x.stroke(); x.save(); x.translate(512, 520); x.rotate(Math.PI / 4); x.fillRect(-8, -8, 16, 16); x.restore();
      x.font = 'italic 400 40px Georgia,serif'; x.fillText(V.subtitle, 512, 1160, 820);
      if (v === 1) { x.font = '400 150px Georgia,serif'; x.fillText('63 → 34', 512, 1330); }
      else { x.font = '400 120px Georgia,serif'; x.fillText(V.id, 512, 1330); }
      x.font = '600 19px "Segoe UI",Arial,sans-serif'; x.fillText('ILLUSTRATED COVER · NOT A HISTORICAL DOCUMENT', 512, 1412); });
    const bump = document.createElement('canvas'); bump.width = W; bump.height = H; const bg = bump.getContext('2d'); bg.fillStyle = '#808080'; bg.fillRect(0, 0, W, H); bg.globalAlpha = .9; bg.drawImage(mask, 0, 0);
    return { map: tex(color), metal: tex(mask, false), bump: tex(bump, false) };
  }
  function roundedSlab(w, h, d, r) {
    const s = new T.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2);
    const geo = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: .018, bevelSize: .018, bevelSegments: 3, curveSegments: 10 }); geo.translate(0, 0, -d / 2); return own(geo);
  }
  function pageEdges() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 1024; const g = c.getContext('2d'); g.fillStyle = '#e6dac0'; g.fillRect(0, 0, 64, 1024);
    const r = rnd(9); for (let y = 0; y < 1024; y += 2) { g.fillStyle = `rgba(${120 + r() * 40},${100 + r() * 30},${70 + r() * 20},${.18 + r() * .25})`; g.fillRect(0, y, 64, 1); }
    const t = tex(c); return t;
  }
  function buildBook(v, shared) {
    const V = ARCHIVE_VOLUMES[v], pivot = new T.Group(), body = new T.Group(); pivot.add(body); root.add(pivot);
    const maps = coverMaps(v);
    const cloth = own(new T.MeshPhysicalMaterial({ color: V.cloth, roughness: v === 1 ? .55 : .74, metalness: v === 1 ? .12 : .02, sheen: v === 1 ? .2 : .75, sheenRoughness: .55, sheenColor: new T.Color(v === 1 ? '#fff1d0' : '#ff9a8a'), bumpMap: shared.grain, bumpScale: .9 }));
    const face = own(new T.MeshPhysicalMaterial({ map: maps.map, metalnessMap: maps.metal, metalness: 1, roughness: .5, roughnessMap: maps.metal, bumpMap: maps.bump, bumpScale: 2.4, sheen: .35, sheenColor: new T.Color('#ffe2c0'), clearcoat: v === 1 ? .35 : .12, clearcoatRoughness: .45 }));
    face.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <metalnessmap_fragment>', 'float metalnessFactor = metalness; vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv ); metalnessFactor = mix(0.04, 0.95, texelMetalness.g);')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness; vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv ); roughnessFactor = mix(0.78, 0.26, texelRoughness.g);'); };
    const W = 3.2, H = 4.7, D = .11, block = .52;
    const back = new T.Mesh(roundedSlab(W, H, D, .06), cloth); back.position.set(0, 0, -block / 2 - D / 2); body.add(back);
    const front = new T.Mesh(roundedSlab(W, H, D, .06), cloth); front.position.set(0, 0, block / 2 + D / 2); body.add(front);
    const print = new T.Mesh(own(new T.PlaneGeometry(W - .06, H - .06)), face); print.position.set(.01, 0, block / 2 + D + .019); body.add(print);
    const edge = shared.edges, paper = own(new T.MeshStandardMaterial({ color: '#efe3c8', roughness: .93 }));
    const sideMat = own(new T.MeshStandardMaterial({ map: edge, roughness: .9 }));
    const pagesMesh = new T.Mesh(own(new T.BoxGeometry(W - .16, H - .14, block, 1, 1, 1)), [sideMat, paper, sideMat, sideMat, paper, paper]); pagesMesh.position.set(.04, 0, 0); body.add(pagesMesh);
    const spine = new T.Mesh(own(new T.CylinderGeometry(block / 2 + D, block / 2 + D, H + .02, 40, 1, true, Math.PI, Math.PI)), cloth); spine.rotation.y = Math.PI / 2; spine.position.set(-W / 2 + .02, 0, 0); spine.scale.set(1, 1, .55); body.add(spine);
    const gold = own(new T.MeshPhysicalMaterial({ color: '#c9a86e', metalness: 1, roughness: .28, clearcoat: .4 }));
    for (const y of [-1.95, -1.8, 1.8, 1.95]) { const band = new T.Mesh(own(new T.TorusGeometry(block / 2 + D + .005, .016, 8, 40, Math.PI)), gold); band.rotation.set(0, -Math.PI / 2, 0); band.position.set(-W / 2 + .02, y, 0); band.scale.set(.55, 1, 1); body.add(band); }
    const ribbon = new T.Mesh(own(new T.BoxGeometry(.08, .9, .006)), own(new T.MeshStandardMaterial({ color: v === 1 ? '#4a0e18' : '#c3a47b', roughness: .6 }))); ribbon.position.set(.6, -H / 2 - .38, .05); ribbon.rotation.z = .08; body.add(ribbon);
    body.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; n.userData.volume = v; } });
    const book = { pivot, body, v, cur: { p: new T.Vector3(), r: new T.Euler(), s: 1 }, target: { p: new T.Vector3(), r: new T.Euler(), s: 1 }, vel: new T.Vector3(), lift: 0 };
    books.push(book);
    if (createFormation) formations.push(createFormation(T, { object: body, origin: 'spine', axisWeights: [1, .72, 1.8], noiseStrength: .1, edgeWidth: .06, duration: 3.2, delay: .45 + v * .38, edgeColor: '#f2cf8c', wireColor: '#f3e2bf' }));
    return book;
  }
  function layout(instant = false) {
    const focusV = selected ?? volume;
    books.forEach((b, i) => {
      const slot = i - 1, front = i === focusV;
      b.target.p.set(slot * 3.45, front ? -1.3 : -1.6, front ? .95 : -.55);
      b.target.r.set(-.04, front ? -.1 + slot * -.06 : (slot < 0 ? .3 : slot > 0 ? -.34 : -.06), front ? -.01 : (slot < 0 ? .04 : -.04));
      b.target.s = front ? 1 : .8;
      if (instant) { b.pivot.position.copy(b.target.p); b.pivot.rotation.copy(b.target.r); b.pivot.scale.setScalar(b.target.s); }
    });
    orbit.setFocus(focusV, { immediate: instant });
    syncDom();
  }
  function cameraPose(ctx, focusV = selected ?? volume) {
    const portrait = ctx.size.width < ctx.size.height;
    const x = portrait ? 0 : (focusV - 1) * .9; // camera trucks toward the focused volume
    return { projection: 'perspective', position: portrait ? [x, .6, 25] : [x + .25, 1.1, 20.5], target: [x, .55, 0], fov: portrait ? 40 : 34 };
  }
  function syncDom() {
    const node = document.querySelector('.reform-archive'); if (!node) return;
    const V = ARCHIVE_VOLUMES[selected ?? volume];
    node.dataset.volume = String(selected ?? volume);
    const card = node.querySelector('.archive-volume-card'); if (!card || card.dataset.v === V.id) return;
    card.dataset.v = V.id;
    card.innerHTML = `<p class="archive-volume-kicker">${V.kicker}</p><h3>${V.title}</h3><p class="archive-volume-sub">${V.subtitle}</p><ul>${V.topics.map(t => `<li>${t}</li>`).join('')}</ul><button type="button" class="archive-volume-link" data-archive-go="${V.scene}">${V.link} →</button>`;
  }
  function pick(event) {
    if (!canvasEl || !cam) return -1;
    const rect = canvasEl.getBoundingClientRect(); const x = ((event.clientX - rect.left) / rect.width) * 2 - 1, y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const ray = new T.Raycaster(); ray.setFromCamera(new T.Vector2(x, y), cam);
    const hit = ray.intersectObjects(books.map(b => b.body), true).find(h => h.object.userData.volume !== undefined);
    return hit ? hit.object.userData.volume : -1;
  }
  function on(target, name, fn) { target.addEventListener(name, fn); listeners.push(() => target.removeEventListener(name, fn)); }
  return {
    get animated() { return true; },
    setup(ctx) {
      T = ctx.THREE; root = ctx.root; own = ctx.own; ctxRef = ctx;
      const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gg = gc.getContext('2d'), img = gg.createImageData(256, 256); const r = rnd(27);
      for (let i = 0; i < img.data.length; i += 4) { const v = 118 + r() * 20; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } gg.putImageData(img, 0, 0);
      const grain = tex(gc, false); grain.wrapS = grain.wrapT = T.RepeatWrapping; grain.repeat.set(6, 8);
      const shared = { grain, edges: pageEdges() };
      for (let v = 0; v < 3; v++) buildBook(v, shared);
      const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sg = sc.getContext('2d'), grad = sg.createRadialGradient(64, 64, 2, 64, 64, 64); grad.addColorStop(0, 'rgba(0,0,0,.7)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = grad; sg.fillRect(0, 0, 128, 128);
      const shadow = own(new T.MeshBasicMaterial({ map: tex(sc), transparent: true, depthWrite: false })); const plane = new T.Mesh(own(new T.PlaneGeometry(15, 4.6)), shadow); plane.rotation.x = -Math.PI / 2; plane.position.set(0, -3.75, .3); plane.userData.cpvFormationSkip = true; root.add(plane);
      const rim = new T.DirectionalLight('#c4cedd', 1.4); rim.position.set(5, 4, -3); root.add(rim);
      const warm = new T.SpotLight('#ffd9a8', 60, 30, .42, .6, 1.6); warm.position.set(-2, 8, 9); warm.target.position.set(0, -1.2, 0); root.add(warm, warm.target);
      // atmospheric archive dust
      const pos = [], r2 = rnd(81); for (let i = 0; i < 900; i++) pos.push((r2() - .5) * 26, (r2() - .5) * 13, -6 + r2() * 10);
      const dust = new T.Points(own(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(pos, 3))), own(new T.PointsMaterial({ color: '#e8d9bd', size: .025, transparent: true, opacity: .32, depthWrite: false })));
      dust.userData.cpvFormationSkip = true; root.add(dust); this._dust = dust;
    },
    activate(ctx) {
      ctxRef = ctx; clock = 0; selected = null;
      ctx.setBackground({ color: '#0b080a', fogNear: 30, fogFar: 62 });
      ctx.setLighting({ ambient: { color: '#f1dfc6', intensity: .42 }, directional: { color: '#ffecd2', intensity: 2.2, position: [-4, 7, 8], castShadow: true }, point: { color: '#c3a47b', intensity: 16, position: [4, 1, 5], distance: 22 } });
      layout(true);
      for (const f of formations) f.setProgress(ctx.reducedMotion ? 1 : 0);
      if (!ctx.reducedMotion) formations.forEach(f => f.play({ from: 0, to: 1 }));
      orbit.restart();
      const pose = cameraPose(ctx);
      if (ctx.reducedMotion) ctx.camera.reset(pose);
      else { ctx.camera.reset({ ...pose, position: [pose.position[0] - 2.2, pose.position[1] + 2.1, pose.position[2] + 6.5], target: [pose.target[0], pose.target[1] + .9, 0] }); ctx.camera.moveTo(pose, { duration: 3400, signal: ctx.signal }); }
      on(document, 'pointermove', e => { const r = canvasEl?.getBoundingClientRect(); if (r) orbit.setPointer((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1); const v = pick(e); hoverBook = v; orbit.setHover(v >= 0); document.body.classList.toggle('archive-book-hover', v >= 0); });
      on(document, 'click', e => {
        const go = e.target.closest?.('[data-archive-go]'); if (go) { e.preventDefault(); window.CPVApp?.navigation.goToScene(Number(go.dataset.archiveGo)); return; }
        if (e.target.closest?.('button,a,input,textarea,select,[role="dialog"],#controls')) return;
        const v = pick(e); if (v < 0) return; selected = v === (selected ?? volume) && selected !== null ? null : v; layout(); if (ctxRef && !ctxRef.camera.isTransitioning()) ctxRef.camera.moveTo(cameraPose(ctxRef), { duration: 1400 }); ctxRef?.invalidate();
      });
    },
    setBeat(i, ctx, meta = {}) {
      beat = i; volume = BEAT_VOLUME[i] ?? 0; selected = null; layout(false);
      if (meta.replay) { formations.forEach(f => f.play({ from: 0, to: 1, delay: 0 })); orbit.restart(); }
      const pose = cameraPose(ctx); if (!ctx.camera.isTransitioning()) ctx.camera.moveTo(pose, { duration: 1500, signal: ctx.signal });
      ctx.invalidate();
    },
    update(dt, ctx) {
      clock += dt;
      for (const f of formations) f.update(dt);
      for (const b of books) {
        const k = 1 - Math.exp(-dt * 4.2), hovered = hoverBook === b.v ? 1 : 0; b.lift += (hovered - b.lift) * (1 - Math.exp(-dt * 8));
        b.pivot.position.lerp(b.target.p, k); b.pivot.position.y += b.lift * .12 * (1 - k);
        b.pivot.rotation.x += (b.target.r.x - b.pivot.rotation.x) * k; b.pivot.rotation.y += (b.target.r.y + Math.sin(clock * .35 + b.v) * .015 - b.pivot.rotation.y) * k; b.pivot.rotation.z += (b.target.r.z - b.pivot.rotation.z) * k;
        const s = b.pivot.scale.x + (b.target.s + b.lift * .02 - b.pivot.scale.x) * k; b.pivot.scale.setScalar(s);
      }
      if (this._dust) this._dust.rotation.y += dt * .01;
      const node = document.querySelector('.archive-orbit'); if (node) orbit.attach(node);
      orbit.update(dt, { reduced: ctx.reducedMotion });
      ctx.invalidate();
    },
    render(ctx, renderer, scene, camera) {
      canvasEl = renderer.domElement; cam = camera;
      if (!studio) {
        const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); const sky = g.createLinearGradient(0, 0, 0, 256); sky.addColorStop(0, '#5a4a48'); sky.addColorStop(.5, '#251a1c'); sky.addColorStop(1, '#0b0809'); g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
        g.fillStyle = '#ffe4c0'; g.fillRect(60, 30, 120, 70); g.fillStyle = '#c3a47b'; g.fillRect(340, 50, 70, 120); g.fillStyle = '#e8d9bd'; g.fillRect(230, 10, 60, 30);
        const t = new T.CanvasTexture(c); t.mapping = T.EquirectangularReflectionMapping; t.colorSpace = T.SRGBColorSpace; const gen = new T.PMREMGenerator(renderer); studio = own(gen.fromEquirectangular(t)); t.dispose(); gen.dispose();
        for (const t2 of textures) t2.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
      }
      const old = scene.environment; try { scene.environment = studio.texture; renderer.render(scene, camera); } finally { scene.environment = old; }
    },
    deactivate() { while (listeners.length) listeners.pop()(); document.body.classList.remove('archive-book-hover'); hoverBook = -1; },
    drawFallback(g, ctx) { g.fillStyle = '#0b080a'; g.fillRect(0, 0, ctx.size.width, ctx.size.height); },
    getState: () => ({ beat, volume, selected, books: books.length, formation: formations.map(f => f.getState()), orbit: orbit.getState(), volumes: ARCHIVE_VOLUMES.map(v => v.title) }),
    formations, orbit,
    dispose() { formations.forEach(f => f.dispose()); studio = null; }
  };
}
