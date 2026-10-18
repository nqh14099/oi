import {createCitizenFigure} from './cinematic-citizen.mjs';

// Scene 3: Elegant 2.5D luminous procedural maze transformation.
// Thin crimson Bézier paths with camera-facing ribbons, soft luminous halos,
// sparse champagne depth particles, and an animated citizen application particle.
// When reform is triggered, secondary loops retract, the network geometry reorganizes
// into a clear green route, and the application travels smoothly to Result.

export function createMazeScene({onSettled=()=>{},numbers}={}) {
  const numberCleanup=[];
  let invalidateNumbers=()=>{};
  let T, root, own, person, limbs;
  let beat = 0, reform = 0, entry = 0, clock = 0;
  let transition = null, disposed = false;
  let appParticle = null, appGlow = null;

  const paths = [];
  const stations = [];
  const stationGroups = [];

  const smooth = x => {
    x = Math.max(0, Math.min(1, x));
    return x * x * (3 - 2 * x);
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const names = ['Reception', 'Review', 'Approval', 'Result'];

  // Balanced spatial layout in 16:9 view:
  // Citizen stands comfortably on the left at x = -3.8.
  // The 4 stations span from x = -1.4 to x = 4.4, leaving ample negative space.
  const beforePos = [
    [-1.4, 1.4, 0.4],   // 01 Reception
    [ 0.6, 2.9, -0.5],  // 02 Review (elevated bottleneck)
    [ 2.6, 0.7, 0.5],   // 03 Approval (dipped low)
    [ 4.4, 2.3, -0.4]   // 04 Result
  ];

  const afterPos = [
    [-1.4, 1.85, 0.0],  // 01 Reception
    [ 0.6, 1.85, 0.0],  // 02 Review
    [ 2.6, 1.85, 0.0],  // 03 Approval
    [ 4.4, 1.85, 0.0]   // 04 Result
  ];

  // 9 paths total: 3 primary (forming the main route) + 6 secondary (confusing loops & detours)
  const pathDefs = [
    // Primary: Reception -> Review -> Approval -> Result
    { from: 0, to: 1, via: [[-0.8, 2.6, 0.3], [-0.1, 1.3, 0.6], [0.2, 2.1, -0.2]], primary: true },
    { from: 1, to: 2, via: [[ 1.4, 3.2, 0.2], [ 2.1, 1.4, -0.5], [ 1.8, 1.0, 0.4]], primary: true },
    { from: 2, to: 3, via: [[ 3.2, 0.3, 0.3], [ 4.1, 0.9, 0.1], [ 3.7, 2.4, -0.3]], primary: true },

    // Secondary (detours, backtracks, redundant loops)
    { from: 1, to: 0, via: [[ 0.2, 3.8, -0.6], [-1.2, 3.2, -0.2], [-1.5, 0.8, 0.5]], primary: false },
    { from: 2, to: 1, via: [[ 2.8, 2.2, 0.6], [ 1.3, 3.6, 0.1], [ 0.2, 1.6, -0.4]], primary: false },
    { from: 3, to: 1, via: [[ 4.5, 3.2, -0.5], [ 2.5, 3.7, -0.3], [ 1.1, 0.6, 0.5]], primary: false },
    { from: 0, to: 2, via: [[-1.1, 0.4, 0.3], [ 0.7, 0.2, 0.4], [ 2.8, 2.5, -0.4]], primary: false },
    { from: 2, to: 0, via: [[ 1.2, 1.9, 0.7], [-0.4, 2.9, 0.1], [-1.7, 2.0, -0.2]], primary: false },
    { from: 1, to: 1, via: [[ 1.1, 3.6, 0.2], [ 1.7, 2.5, 0.5], [-0.2, 2.3, 0.4]], primary: false }
  ];

  // Station label canvas texture: elegant typography matching the CPV brand
  function createStationLabelTexture(name, index) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 160;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 512, 160);

    // Number label: champagne gold
    g.fillStyle = '#bfa275';
    g.font = '500 20px Georgia, serif';
    g.fillText('0' + (index + 1), 20, 36);

    // Station name: warm ivory
    g.fillStyle = '#eee6d8';
    g.font = '400 43px Georgia, serif';
    g.fillText(name, 20, 88);

    // Delicate separator line
    g.strokeStyle = 'rgba(191, 162, 117, 0.35)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(20, 110);
    g.lineTo(240, 110);
    g.stroke();

    const tex = own(new T.CanvasTexture(c));
    tex.colorSpace = T.SRGBColorSpace;
    if(numbers)numberCleanup.push(numbers.registerSink({sceneId:3,text:'0'+(index+1),draw(progress){
      g.clearRect(0,0,512,43);g.save();g.beginPath();g.rect(0,0,512,43);g.clip();
      g.fillStyle='#bfa275';g.font='500 20px Georgia, serif';g.globalAlpha=Math.min(1,progress*4);
      g.fillText('0'+(index+1),20,36+24*Math.pow(1-progress,3));g.restore();tex.needsUpdate=true;invalidateNumbers();
    }}));
    return tex;
  }

  // Soft glowing point sprite
  function createGlowSpriteTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const rad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    rad.addColorStop(0, 'rgba(255, 245, 220, 1)');
    rad.addColorStop(0.12, 'rgba(240, 205, 140, 0.85)');
    rad.addColorStop(0.35, 'rgba(200, 140, 70, 0.22)');
    rad.addColorStop(0.7, 'rgba(160, 60, 40, 0.05)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = rad;
    g.fillRect(0, 0, 128, 128);
    return own(new T.CanvasTexture(c));
  }

  // Camera-facing 2.5D Ribbon Path
  function buildRibbonPath(def, index) {
    const segments = 120;
    const { from, to, via, primary } = def;

    // Curved control points for confusing state
    const curveA = new T.CatmullRomCurve3([
      new T.Vector3(...beforePos[from]),
      ...via.map(p => new T.Vector3(...p)),
      new T.Vector3(...beforePos[to])
    ]);
    const ptsA = curveA.getPoints(segments);

    // Clean direct path for post-reform state
    const pStart = new T.Vector3(...afterPos[from]);
    const pEnd = new T.Vector3(...afterPos[to]);
    const pMid = new T.Vector3(
      (pStart.x + pEnd.x) * 0.5,
      1.88,
      0
    );
    const curveB = new T.CatmullRomCurve3([pStart, pMid, pEnd]);
    const ptsB = curveB.getPoints(segments);

    // Buffer geometry for ribbon quads: (segments + 1) * 2 vertices
    const vertexCount = (segments + 1) * 2;
    const positions = new Float32Array(vertexCount * 3);
    const posA = new Float32Array(vertexCount * 3);
    const posB = new Float32Array(vertexCount * 3);
    const tangents = new Float32Array(vertexCount * 3);
    const tangentsA = new Float32Array(vertexCount * 3);
    const tangentsB = new Float32Array(vertexCount * 3);
    const sides = new Float32Array(vertexCount);
    const progresses = new Float32Array(vertexCount);
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;

      // Tangent for state A
      const prevA = ptsA[Math.max(0, i - 1)];
      const nextA = ptsA[Math.min(segments, i + 1)];
      const tanA = nextA.clone().sub(prevA).normalize();

      // Tangent for state B
      const prevB = ptsB[Math.max(0, i - 1)];
      const nextB = ptsB[Math.min(segments, i + 1)];
      const tanB = nextB.clone().sub(prevB).normalize();

      // Two vertices per point on curve: side -1 and +1
      const idx0 = i * 2;
      const idx1 = i * 2 + 1;

      ptsA[i].toArray(posA, idx0 * 3);
      ptsA[i].toArray(posA, idx1 * 3);
      ptsB[i].toArray(posB, idx0 * 3);
      ptsB[i].toArray(posB, idx1 * 3);

      ptsA[i].toArray(positions, idx0 * 3);
      ptsA[i].toArray(positions, idx1 * 3);

      tanA.toArray(tangentsA, idx0 * 3);
      tanA.toArray(tangentsA, idx1 * 3);
      tanB.toArray(tangentsB, idx0 * 3);
      tanB.toArray(tangentsB, idx1 * 3);

      tanA.toArray(tangents, idx0 * 3);
      tanA.toArray(tangents, idx1 * 3);

      sides[idx0] = -1.0;
      sides[idx1] =  1.0;

      progresses[idx0] = u;
      progresses[idx1] = u;

      if (i < segments) {
        indices.push(idx0, idx1, idx0 + 2);
        indices.push(idx1, idx0 + 3, idx0 + 2);
      }
    }

    const geo = own(new T.BufferGeometry());
    geo.setAttribute('position', new T.BufferAttribute(positions, 3).setUsage(T.DynamicDrawUsage));
    geo.setAttribute('aTangent', new T.BufferAttribute(tangents, 3).setUsage(T.DynamicDrawUsage));
    geo.setAttribute('aSide', new T.BufferAttribute(sides, 1));
    geo.setAttribute('aProgress', new T.BufferAttribute(progresses, 1));
    geo.setIndex(indices);

    // Ribbon material with camera-facing expansion and soft-edge glow
    const redColor = new T.Color('#9e283d');
    const greenColor = new T.Color('#64c48a');
    const baseWidth = primary ? 0.042 : 0.024;

    const mat = own(new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: T.DoubleSide,
      uniforms: {
        uColor: { value: redColor.clone() },
        uWidth: { value: baseWidth },
        uOpacity: { value: primary ? 0.95 : 0.45 },
        uPulsePos: { value: -1.0 },
        uPulseIntensity: { value: 0.0 },
        uRetract: { value: 0.0 }
      },
      vertexShader: `
        attribute vec3 aTangent;
        attribute float aSide;
        attribute float aProgress;
        uniform float uWidth;
        varying float vSide;
        varying float vProgress;

        void main() {
          vSide = aSide;
          vProgress = aProgress;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vec3 vTan = normalize(mat3(modelViewMatrix) * aTangent);
          vec2 norm2D = normalize(vec2(-vTan.y, vTan.x));
          mvPos.xy += norm2D * aSide * uWidth * 0.5;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uPulsePos;
        uniform float uPulseIntensity;
        uniform float uRetract;
        varying float vSide;
        varying float vProgress;

        void main() {
          if (uRetract > 0.001 && vProgress > (1.0 - uRetract)) discard;

          float dist = abs(vSide);
          float core = smoothstep(1.0, 0.12, dist);
          float halo = exp(-dist * dist * 3.2) * 0.45;
          float alpha = (core * 0.8 + halo) * uOpacity;

          float pulse = 0.0;
          if (uPulseIntensity > 0.01) {
            float d = abs(vProgress - uPulsePos);
            pulse = exp(-d * d * 180.0) * uPulseIntensity;
          }

          vec3 col = uColor + vec3(0.45, 0.38, 0.22) * pulse + vec3(0.18) * (1.0 - dist);
          gl_FragColor = vec4(col, alpha);
        }
      `
    }));

    const mesh = new T.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.name = `Path_${names[from]}_to_${names[to]}`;
    root.add(mesh);

    paths.push({
      def,
      primary,
      index,
      from,
      to,
      geo,
      mat,
      mesh,
      ptsA,
      ptsB,
      posA,
      posB,
      positions,
      tangentsA,
      tangentsB,
      tangents,
      segments,
      vertexCount,
      baseWidth
    });
  }

  // Create citizen application particle (luminous golden-white sphere with halo)
  function createApplicationParticle() {
    const group = new T.Group();
    group.name = 'citizen-application-particle';

    const coreGeo = own(new T.SphereGeometry(0.065, 16, 16));
    const coreMat = own(new T.MeshBasicMaterial({ color: '#fff8ea' }));
    const coreMesh = new T.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    const glowTex = createGlowSpriteTexture();
    const haloMat = own(new T.SpriteMaterial({
      map: glowTex,
      color: '#ffd899',
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending
    }));
    const halo = new T.Sprite(haloMat);
    halo.scale.set(0.65, 0.65, 1);
    group.add(halo);

    root.add(group);
    return { group, halo, coreMesh };
  }

  // Interpolate route geometry, colors, retraction and particle position
  function apply(ctx, reformValue) {
    reform = reformValue;
    const t = smooth(reformValue);
    const red = new T.Color('#9e283d');
    const green = new T.Color('#64c48a');

    // 1. Update station node positions
    stationGroups.forEach((g, i) => {
      const b = beforePos[i];
      const a = afterPos[i];
      g.position.set(
        b[0] + (a[0] - b[0]) * t,
        b[1] + (a[1] - b[1]) * t,
        b[2] + (a[2] - b[2]) * t
      );
    });

    // 2. Update paths: geometry morphing, retraction of redundant routes, and green wave propagation
    for (const p of paths) {
      // Interpolate vertices and tangents
      for (let i = 0; i < p.vertexCount * 3; i++) {
        p.positions[i] = p.posA[i] + (p.posB[i] - p.posA[i]) * t;
        p.tangents[i] = p.tangentsA[i] + (p.tangentsB[i] - p.tangentsA[i]) * t;
      }
      p.geo.attributes.position.needsUpdate = true;
      p.geo.attributes.aTangent.needsUpdate = true;

      if (p.primary) {
        // Green light wave propagates across primary paths
        const waveShift = clamp((reformValue - p.index * 0.18) / 0.45, 0, 1);
        const waveT = smooth(waveShift);
        const col = new T.Color().copy(red).lerp(green, waveT);
        p.mat.uniforms.uColor.value.copy(col);

        // Increase luminance and width in reformed state
        p.mat.uniforms.uOpacity.value = 0.95 + waveT * 0.15;
        p.mat.uniforms.uWidth.value = p.baseWidth + waveT * 0.012;
        p.mat.uniforms.uRetract.value = 0.0;
        p.mesh.visible = true;
      } else {
        // Secondary paths: dim and retract into origin station
        const retract = smooth(clamp((reformValue - 0.05) / 0.55, 0, 1));
        const fade = 1.0 - smooth(clamp((reformValue - 0.02) / 0.5, 0, 1));
        p.mat.uniforms.uRetract.value = retract;
        p.mat.uniforms.uOpacity.value = 0.45 * fade;
        p.mesh.visible = fade > 0.01 && retract < 0.999;
      }
    }

    // 3. Citizen placement: stands on left at x = -3.8, stably framed
    // Turns slightly toward the cleared route when reform completes
    person.position.set(-3.85, 0.0, 0.7 - entry * 0.3);
    person.rotation.y = 0.38 + t * 0.12;

    // 4. Application particle movement along the narrative route
    if (appParticle) {
      if (reformValue < 0.05) {
        // Confusing state: application wanders through detours and pauses at bottlenecks
        // Loop timeline: 0 -> 1 -> detour back -> 2 -> detour -> 3
        const cycle = (clock * 0.22) % 4.0;
        let activePathIndex = 0;
        let pathProgress = 0.0;
        let paused = false;

        if (cycle < 0.9) {
          activePathIndex = 0; // Reception -> Review
          pathProgress = cycle / 0.9;
        } else if (cycle < 1.35) {
          // Bottleneck pause at Review!
          activePathIndex = 0;
          pathProgress = 1.0;
          paused = true;
        } else if (cycle < 2.3) {
          activePathIndex = 4; // Detour: Review -> Approval -> loop back
          pathProgress = (cycle - 1.35) / 0.95;
        } else if (cycle < 3.2) {
          activePathIndex = 1; // Approval path
          pathProgress = (cycle - 2.3) / 0.9;
        } else {
          activePathIndex = 2; // Detour toward Result
          pathProgress = (cycle - 3.2) / 0.8;
        }

        const activePath = paths[activePathIndex];
        const ptIndex = Math.min(
          activePath.segments,
          Math.floor(pathProgress * activePath.segments)
        );
        const pt = activePath.ptsA[ptIndex];
        appParticle.group.position.set(pt.x, pt.y, pt.z + 0.08);

        // Illuminating pulse on active path
        activePath.mat.uniforms.uPulsePos.value = pathProgress;
        activePath.mat.uniforms.uPulseIntensity.value = paused ? 1.6 : 1.1;

        // Reset pulse on inactive paths
        paths.forEach((p, idx) => {
          if (idx !== activePathIndex) {
            p.mat.uniforms.uPulseIntensity.value = 0.0;
          }
        });
      } else {
        // Reforming & Reformed state:
        // When reform is progressing (t < 0.7), particle pauses and prepares.
        // When t >= 0.65, particle glides smoothly across the green route directly to Result!
        paths.forEach(p => { p.mat.uniforms.uPulseIntensity.value = 0.0; });

        if (t < 0.65) {
          // Pauses at Reception node
          const p0 = afterPos[0];
          appParticle.group.position.set(p0[0], p0[1], p0[2] + 0.08);
          appParticle.halo.scale.set(0.65, 0.65, 1);
        } else {
          // Smooth glide from Reception (x=-1.4) to Result (x=4.4)
          const travelT = smooth((t - 0.65) / 0.35);
          const totalDist = afterPos[3][0] - afterPos[0][0];
          const currX = afterPos[0][0] + travelT * totalDist;
          appParticle.group.position.set(currX, 1.85, 0.08);

          // Pulse along primary paths under the particle
          const segProgress = (currX - afterPos[0][0]) / totalDist;
          if (segProgress < 0.33) {
            paths[0].mat.uniforms.uPulsePos.value = segProgress / 0.33;
            paths[0].mat.uniforms.uPulseIntensity.value = 1.8;
          } else if (segProgress < 0.66) {
            paths[1].mat.uniforms.uPulsePos.value = (segProgress - 0.33) / 0.33;
            paths[1].mat.uniforms.uPulseIntensity.value = 1.8;
          } else {
            paths[2].mat.uniforms.uPulsePos.value = (segProgress - 0.66) / 0.34;
            paths[2].mat.uniforms.uPulseIntensity.value = 1.8;
          }

          // Arrival burst at Result
          if (travelT > 0.95) {
            const burst = Math.sin((travelT - 0.95) * 20.0 * Math.PI) * 0.35;
            appParticle.halo.scale.set(0.75 + burst, 0.75 + burst, 1);
          }
        }
      }
    }

    ctx.invalidate();
  }

  function pose(ctx, wide = false) {
    const narrow = ctx.size.width / ctx.size.height < 1;
    return {
      position: narrow ? [0.5, 4.8, 17.2] : [0.3, 4.2, wide ? 15.2 : 14.4],
      target: [0.3, 1.3, 0],
      fov: narrow ? 47 : 40
    };
  }

  const module = {
    get animated() { return Boolean(transition) || beat < 2; },

    setup(ctx) {
      invalidateNumbers=()=>ctx.invalidate();
      T = ctx.THREE;
      root = ctx.root;
      own = ctx.own;

      // Restrained, cinematic lighting
      ctx.setBackground({ color: '#040711', fogNear: 28, fogFar: 65 });
      ctx.setLighting({
        ambient: { color: '#8890a5', intensity: 0.42 },
        directional: { color: '#f2dcba', intensity: 0.95, position: [-3, 7, 4], castShadow: false },
        point: { color: '#d4965e', intensity: 3.5, position: [0.5, 3.5, 2], distance: 20 }
      });

      // 1. Station nodes (Reception, Review, Approval, Result)
      const dotTex = createGlowSpriteTexture();
      names.forEach((name, i) => {
        const g = new T.Group();
        root.add(g);
        stationGroups.push(g);

        // Core point light sprite
        const dot = new T.Sprite(own(new T.SpriteMaterial({
          map: dotTex,
          color: '#edcf8e',
          transparent: true,
          depthWrite: false,
          blending: T.AdditiveBlending
        })));
        dot.scale.set(0.42, 0.42, 1);
        g.add(dot);

        // Polished golden anchor ring
        const ringGeo = own(new T.TorusGeometry(0.085, 0.014, 8, 32));
        const ringMat = own(new T.MeshStandardMaterial({
          color: '#c29d66',
          metalness: 0.75,
          roughness: 0.25,
          emissive: '#806030',
          emissiveIntensity: 0.18
        }));
        const ring = new T.Mesh(ringGeo, ringMat);
        ring.position.z = -0.015;
        g.add(ring);

        // Editorial typography label
        const labelTex = createStationLabelTexture(name, i);
        const labelMat = own(new T.SpriteMaterial({
          map: labelTex,
          transparent: true,
          depthWrite: false
        }));
        const label = new T.Sprite(labelMat);
        label.scale.set(3.65, 1.14, 1);
        label.position.set(1.40, 0.72, 0);
        g.add(label);
      });

      // 2. Shared Citizen figure
      person = createCitizenFigure({ THREE: T, own }).person;
      person.scale.setScalar(1.15);
      root.add(person);
      limbs = [
        person.getObjectByName('citizen-gait-0') || new T.Object3D(),
        person.getObjectByName('citizen-gait-1') || new T.Object3D()
      ];

      // 3. Ribbon Paths
      pathDefs.forEach((def, i) => buildRibbonPath(def, i));

      // 4. Citizen Application Particle
      appParticle = createApplicationParticle();

      // 5. Ambient depth particles: fine champagne/cool-white luminous points
      const particleCount = 140;
      const posArray = [];
      const lightArray = [];
      let seed = 9182;
      for (let i = 0; i < particleCount; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const x = seed / 4294967296;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const y = seed / 4294967296;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const z = seed / 4294967296;
        posArray.push((x - 0.45) * 26, (y - 0.35) * 14, -1.0 - z * 10);
        lightArray.push(0.12 + (i % 7) * 0.04);
      }
      const particleGeo = own(new T.BufferGeometry());
      particleGeo.setAttribute('position', new T.Float32BufferAttribute(posArray, 3));
      particleGeo.setAttribute('aLight', new T.Float32BufferAttribute(lightArray, 1));
      const particleMat = own(new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexShader: `
          attribute float aLight;
          varying float vL;
          void main(){
            vL = aLight;
            vec4 p = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * p;
            gl_PointSize = 1.6 * (-1.0 / p.z);
          }
        `,
        fragmentShader: `
          varying float vL;
          void main(){
            float r = length(gl_PointCoord - 0.5);
            float a = (1.0 - smoothstep(0.05, 0.48, r)) * vL;
            gl_FragColor = vec4(0.90, 0.91, 0.94, a);
          }
        `
      }));
      root.add(new T.Points(particleGeo, particleMat));

      // 6. Floor vignette plane (subtle ground reflection)
      const floorMat = own(new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexShader: 'varying vec2 vUV; void main(){ vUV = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'varying vec2 vUV; void main(){ float a = 1.0 - smoothstep(0.12, 0.54, length((vUV - 0.5) * vec2(1.0, 1.4))); gl_FragColor = vec4(0.05, 0.03, 0.05, a * 0.24); }'
      }));
      const floorMesh = new T.Mesh(own(new T.PlaneGeometry(24, 9)), floorMat);
      floorMesh.position.set(0.5, -0.05, -0.2);
      floorMesh.rotation.x = -Math.PI / 2;
      root.add(floorMesh);

      apply(ctx, 0);
    },

    activate(ctx) {
      ctx.camera.reset(pose(ctx));
    },

    setBeat(index, ctx, meta = {}) {
      beat = index;
      clock = 0;
      entry = index === 0 ? 0 : 1;

      if (index === 0) {
        apply(ctx, 0);
        transition = { kind: 'enter', duration: 2.2, from: 0 };
      } else if (index === 1) {
        apply(ctx, 0);
        transition = { kind: 'trace', duration: 3.0, from: 0 };
      } else if (index === 2) {
        if (meta.replay) apply(ctx, 0);
        transition = { kind: 'reform', duration: 4.4, from: reform };
      } else {
        transition = null;
        apply(ctx, 1);
      }

      ctx.camera.moveTo(pose(ctx, index >= 2), { duration: 1800, signal: ctx.signal });

      if (ctx.reducedMotion || ctx.mode !== 'webgl') {
        transition = null;
        entry = 1;
        apply(ctx, index >= 2 ? 1 : 0);
        onSettled(beat);
      }
    },

    update(dt, ctx) {
      clock += dt;

      if (transition && !disposed) {
        const t = smooth(clock / transition.duration);
        if (transition.kind === 'reform') {
          apply(ctx, transition.from + (1 - transition.from) * t);
        } else if (transition.kind === 'enter') {
          entry = t;
          apply(ctx, 0);
        } else {
          apply(ctx, reform);
        }

        // Gentle citizen walk cycle during entry/reform
        const walkRate = transition.kind === 'reform' ? 4 : 5;
        const step = Math.sin(clock * walkRate) * 0.08 * Math.sin(t * Math.PI);
        if (limbs[0] && limbs[1]) {
          limbs[0].rotation.x = step;
          limbs[1].rotation.x = -step;
        }

        if (t >= 1) {
          transition = null;
          if (limbs[0] && limbs[1]) {
            limbs[0].rotation.x = 0;
            limbs[1].rotation.x = 0;
          }
          onSettled(beat);
        }
      } else {
        apply(ctx, reform);
      }

      ctx.invalidate();
    },

    deactivate() {
      transition = null;
    },

    dispose() {
      numberCleanup.splice(0).forEach(remove=>remove());
      transition = null;
      disposed = true;
    },

    drawFallback(g, ctx) {
      const w = ctx.size.width;
      const h = ctx.size.height;
      g.save();
      g.scale(w / 1600, h / 900);
      g.fillStyle = '#040711';
      g.fillRect(0, 0, 1600, 900);

      g.lineWidth = beat < 2 ? 1.8 : 1.5;
      g.strokeStyle = beat < 2 ? '#9e283d' : '#64c48a';
      g.beginPath();
      if (beat < 2) {
        g.moveTo(420, 420);
        g.bezierCurveTo(720, 140, 940, 620, 620, 360);
        g.bezierCurveTo(800, 240, 1100, 120, 1280, 380);
      } else {
        g.moveTo(420, 400);
        g.lineTo(1280, 400);
      }
      g.stroke();

      g.font = '300 24px Georgia, serif';
      g.fillStyle = '#eee6d8';
      names.forEach((name, i) => {
        const x = 420 + i * 280;
        const y = beat < 2 ? [390, 310, 430, 350][i] : 360;
        g.fillText(name, x, y);
        g.beginPath();
        g.arc(x + 24, y + 20, 3, 0, 7);
        g.fillStyle = '#edcf8e';
        g.fill();
        g.fillStyle = '#eee6d8';
      });

      g.fillStyle = '#d5d0c4';
      g.beginPath();
      g.ellipse(260, 450, 12, 16, 0, 0, 7);
      g.fill();
      g.fillRect(250, 470, 20, 55);
      g.restore();
    },

    getState: () => ({
      beat,
      reform,
      entry,
      animating: Boolean(transition),
      citizenId: 'citizen',
      paths: paths.length,
      tubes: paths.length, // Compatibility contract for test assertions
      stations: names,
      disposed
    })
  };

  return module;
}
