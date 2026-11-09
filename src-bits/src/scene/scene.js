/* Oyzla — the 3D scroll background (2026-11-09, Matai's brief).
 *
 * A fixed full-screen WebGL canvas BEHIND the page. As the visitor scrolls, the camera flies
 * down a tunnel of floating "draft" windows, through glowing rings made from the Oyzla mark
 * (an open ring with a dot), past ember light trails, and arrives at a last ring whose gap
 * closes by the contact form ("you approve, the loop closes"). The accent hue drifts
 * saffron → ember → amber → saffron along the way.
 *
 * Rules it keeps (tests/site.spec.mjs checks them):
 *  - Background only. The canvas is fixed, z-index 0, pointer-events:none, aria-hidden. This file
 *    only READS window.scrollY and the pointer; it never listens to wheel/touch, never calls
 *    preventDefault, never scrolls. Scrolling is native (or Lenis), so it can never be gated.
 *  - Reduced motion: one still frame, no loop (window.__oyzlaScene.static === true).
 *  - No WebGL / any error: html.scene-fallback shows a CSS glow instead; the page is unaffected.
 *  - Cost: one context, DPR capped (1.5 desktop, 1 phone), fewer objects on phones, no
 *    post-processing (glow is additive sprites), paused while the tab is hidden, and the
 *    resolution drops by itself if frames run long.
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, FogExp2, Group, Mesh, TorusGeometry,
  MeshBasicMaterial, PlaneGeometry, CanvasTexture, SRGBColorSpace, AdditiveBlending,
  BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, LineSegments,
  LineBasicMaterial, CircleGeometry, DoubleSide, MathUtils
} from 'three';

const ACCENTS = [
  [0.0, new Color('#E8862A')], // saffron (Oyzla)
  [0.38, new Color('#FF5A1F')], // ember
  [0.68, new Color('#F2B544')], // amber
  [1.0, new Color('#E8862A')]
];
const WHITE = new Color('#FFFFFF');
const Z_START = 10;
const Z_END = -108;
const TAU = Math.PI * 2;
const WIN_OPACITY = 0.3;

function accentAt(p, out) {
  for (let i = 1; i < ACCENTS.length; i++) {
    const [p1, c1] = ACCENTS[i];
    const [p0, c0] = ACCENTS[i - 1];
    if (p <= p1) return out.copy(c0).lerp(c1, (p - p0) / (p1 - p0));
  }
  return out.copy(ACCENTS[ACCENTS.length - 1][1]);
}

// Deterministic random, so the scene composes the same way on every visit.
function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.22, 'rgba(255,255,255,.45)');
  grd.addColorStop(0.55, 'rgba(255,255,255,.09)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// The floating windows: dark glass cards showing the kind of work Oyzla's AI staff draft.
const WINDOWS = [
  { title: 'Invoice #1042', line: 'Drafted · ready for approval', pill: 'Approve' },
  { title: 'Customer reply', line: 'Weekend call-out question', pill: 'Approve' },
  { title: 'Quote + time slot', line: 'Thursday 9 AM held', pill: 'Approve' },
  { title: 'Pipeline', line: '9 open deals · 5 stages', pill: 'Open' },
  { title: 'Text desk', line: '3 drafts waiting', pill: 'Review' },
  { title: 'Approved', line: 'Sent after you said so', pill: 'Done' }
];

function windowTexture(w, accent) {
  const W = 512, H = 320;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const rr = (x, y, ww, hh, r) => {
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y, ww, hh, r);
    else g.rect(x, y, ww, hh);
  };
  rr(4, 4, W - 8, H - 8, 28);
  g.fillStyle = 'rgba(20,18,16,0.92)';
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = 'rgba(242,237,228,0.16)';
  g.stroke();
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.arc(36 + i * 20, 36, 5.5, 0, TAU);
    g.fillStyle = 'rgba(242,237,228,0.18)';
    g.fill();
  }
  g.fillStyle = 'rgba(242,237,228,0.08)';
  g.fillRect(4, 62, W - 8, 2);
  g.font = '600 34px "Mona Sans", system-ui, sans-serif';
  g.fillStyle = 'rgba(242,237,228,0.95)';
  g.fillText(w.title, 36, 122);
  g.font = '400 24px "Mona Sans", system-ui, sans-serif';
  g.fillStyle = 'rgba(168,161,150,0.95)';
  g.fillText(w.line, 36, 162);
  g.fillStyle = 'rgba(242,237,228,0.07)';
  rr(36, 192, 300, 12, 6); g.fill();
  rr(36, 216, 220, 12, 6); g.fill();
  rr(36, 250, 150, 44, 22);
  g.fillStyle = accent;
  g.fill();
  g.font = '600 22px "Mona Sans", system-ui, sans-serif';
  g.fillStyle = '#120A02';
  g.fillText(w.pill, 62, 280);
  rr(198, 250, 110, 44, 22);
  g.strokeStyle = 'rgba(242,237,228,0.22)';
  g.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// The Oyzla mark in 3D: a 300° arc with a dot at its leading end, its glow, and a pool of
// light on the floor beneath it (the reference's red glow under the object).
function makeRing(glowTex, radius) {
  const tube = 0.05;
  const group = new Group();
  const spin = new Group(); // arc, filler and dot turn together
  group.add(spin);
  const mat = new MeshBasicMaterial({ color: '#E8862A', toneMapped: false });
  const arc = new Mesh(new TorusGeometry(radius, tube, 12, 160, (300 / 360) * TAU), mat);
  arc.rotation.z = MathUtils.degToRad(124); // the gap sits upper-right, as in the logo
  spin.add(arc);
  const filler = new Mesh(new TorusGeometry(radius, tube, 12, 40, (60 / 360) * TAU), mat);
  filler.visible = false;
  spin.add(filler);
  const dot = new Mesh(new CircleGeometry(tube * 3.2, 24), new MeshBasicMaterial({ color: '#FFFFFF', toneMapped: false }));
  dot.position.set(Math.cos(arc.rotation.z) * radius, Math.sin(arc.rotation.z) * radius, 0.02);
  spin.add(dot);
  const glowMat = new MeshBasicMaterial({ map: glowTex, color: '#E8862A', transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
  const halo = new Mesh(new PlaneGeometry(1, 1), glowMat);
  halo.scale.setScalar(radius * 4.6);
  halo.position.z = -0.6;
  group.add(halo);
  const dotGlow = new Mesh(new PlaneGeometry(1, 1), glowMat.clone());
  dotGlow.material.opacity = 0.9;
  dotGlow.scale.setScalar(1.6);
  dotGlow.position.copy(dot.position);
  spin.add(dotGlow);
  const pool = new Mesh(new PlaneGeometry(1, 1), glowMat.clone());
  pool.material.opacity = 0.42;
  pool.rotation.x = -Math.PI / 2;
  pool.scale.set(radius * 6, radius * 3.2, 1);
  pool.position.y = -radius - 1.1;
  group.add(pool);
  return { group, spin, mat, glowMats: [glowMat, dotGlow.material, pool.material], arc, filler, halo };
}

export function mountScene(canvas) {
  const mq = q => window.matchMedia && window.matchMedia(q).matches;
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const phone = mq('(max-width: 767px)') || mq('(pointer: coarse)');
  const counts = phone ? { windows: 26, trails: 70, dust: 500 } : { windows: 54, trails: 170, dust: 1400 };

  const renderer = new WebGLRenderer({ canvas, antialias: !phone, alpha: false, powerPreference: 'default' });
  let dprCap = phone ? 1 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setClearColor('#070707', 1);

  const scene = new Scene();
  scene.fog = new FogExp2('#070707', 0.034);
  const camera = new PerspectiveCamera(50, 1, 0.1, 140);
  const glowTex = glowTexture();
  const rand = rng(20261109);
  const baseFov = () => (window.innerWidth / Math.max(1, window.innerHeight) < 0.8 ? 62 : 50);

  // rings: the hero's (beside the dashboard), one mid-flight, one that closes at the contact form
  const wide = () => window.innerWidth / Math.max(1, window.innerHeight) > 1.15;
  const rings = [
    { z: -6, x: 3.3, y: 0.2, r: 3.2, py: -4.6 }, // phones: below the hero copy, behind the buttons
    { z: -60, x: -2.6, y: 0.1, r: 4 },
    { z: -118, x: 3.0, y: 0.2, r: 3.2 }
  ].map(b => {
    const ring = makeRing(glowTex, b.r);
    ring.base = b;
    scene.add(ring.group);
    return ring;
  });
  const placeRings = () => rings.forEach(r => {
    const w = wide();
    r.group.position.set(w ? r.base.x : 0, w ? r.base.y : (r.base.py ?? r.base.y), r.base.z);
  });
  placeRings();
  const lastRing = rings[rings.length - 1];
  lastRing.filler.visible = true;

  // floating draft windows along the tunnel, kept out of a clear central corridor
  // Each window gets its own material so it can fade on its own: the windows are depth, never
  // content, so they stay dim and dissolve before they come close enough to sit behind text.
  const windowMaps = WINDOWS.map(w => windowTexture(w, '#E8862A'));
  const winGeo = new PlaneGeometry(3.2, 2);
  const windows = [];
  for (let i = 0; i < counts.windows; i++) {
    const z = 4 - (i / counts.windows) * 132 - rand() * 2;
    let x, y;
    do {
      const a = rand() * TAU;
      const r = 4.4 + rand() * 5.5;
      x = Math.cos(a) * r * 1.45;
      y = Math.sin(a) * r * 0.75;
    } while (Math.abs(x) < 4.2 && Math.abs(y) < 2.6);
    const m = new Mesh(winGeo, new MeshBasicMaterial({ map: windowMaps[i % windowMaps.length], transparent: true, opacity: WIN_OPACITY, depthWrite: false, side: DoubleSide }));
    m.position.set(x, y, z);
    m.rotation.y = -Math.sign(x) * (0.25 + rand() * 0.35);
    m.rotation.x = -Math.sign(y) * rand() * 0.18;
    m.rotation.z = (rand() - 0.5) * 0.12;
    m.scale.setScalar(0.75 + rand() * 0.6);
    m.userData = { y0: y, phase: rand() * TAU, rz: m.rotation.z };
    scene.add(m);
    windows.push(m);
  }

  // light trails: short streaks that rush past the camera, faster when the visitor scrolls fast
  const trailPos = new Float32Array(counts.trails * 6);
  const trailCol = new Float32Array(counts.trails * 6);
  const trails = [];
  for (let i = 0; i < counts.trails; i++) {
    const a = rand() * TAU;
    const r = 1.8 + rand() * 8;
    trails.push({ x: Math.cos(a) * r * 1.4, y: Math.sin(a) * r * 0.8, z: Z_START - rand() * 80, len: 0.6 + rand() * 1.4, k: 0.4 + rand() * 0.9 });
    trailCol.set([1, 1, 1, 0, 0, 0], i * 6);
  }
  const trailGeo = new BufferGeometry();
  trailGeo.setAttribute('position', new Float32BufferAttribute(trailPos, 3));
  trailGeo.setAttribute('color', new Float32BufferAttribute(trailCol, 3));
  const trailMat = new LineBasicMaterial({ vertexColors: true, color: '#E8862A', transparent: true, opacity: 0.85, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
  const trailLines = new LineSegments(trailGeo, trailMat);
  trailLines.frustumCulled = false;
  scene.add(trailLines);

  // dust
  const dustPos = new Float32Array(counts.dust * 3);
  for (let i = 0; i < counts.dust; i++) dustPos.set([(rand() - 0.5) * 30, (rand() - 0.5) * 16, Z_START + 6 - rand() * 140], i * 3);
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', new Float32BufferAttribute(dustPos, 3));
  const dustMat = new PointsMaterial({ map: glowTex, color: '#F2B544', size: phone ? 0.16 : 0.12, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  scene.add(new Points(dustGeo, dustMat));

  // ---------- state ----------
  const state = { p: 0, pTarget: 0, camZ: Z_START, impulse: 0, warp: 0, warpTarget: 0, flash: 0, mx: 0, my: 0, mxT: 0, myT: 0 };
  let lastScrollY = window.scrollY;
  let scrollVel = 0;
  const accent = new Color();

  function readScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    state.pTarget = MathUtils.clamp(window.scrollY / max, 0, 1);
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
    camera.fov = baseFov() + state.warp * 22;
    camera.updateProjectionMatrix();
    placeRings();
  }

  function frame(dt, t) {
    // ease toward the scroll position (scrubbed: it follows the reader, never leads)
    state.p += (state.pTarget - state.p) * (1 - Math.exp(-dt * 3.2));
    const p = state.p;
    state.mx += (state.mxT - state.mx) * (1 - Math.exp(-dt * 2.5));
    state.my += (state.myT - state.my) * (1 - Math.exp(-dt * 2.5));
    state.warp += (state.warpTarget - state.warp) * (1 - Math.exp(-dt * (state.warpTarget > state.warp ? 6 : 2.5)));
    state.impulse *= Math.exp(-dt * 2.2);
    state.flash *= Math.exp(-dt * 3);

    const z = MathUtils.lerp(Z_START, Z_END, p);
    state.camZ = z;
    const sx = Math.sin(p * Math.PI * 3) * 1.6;
    const sy = Math.sin(p * TAU) * 0.6;
    camera.position.set(sx + state.mx * 0.6, sy + state.my * 0.35, z + state.warp * 2);
    camera.lookAt(sx * 0.4 + state.mx * 0.2, sy * 0.4 + state.my * 0.1, z - 20);
    camera.rotation.z += Math.sin(p * TAU) * 0.03;
    const fov = baseFov() + state.warp * 22;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    accentAt(p, accent);
    for (const r of rings) {
      r.mat.color.copy(accent);
      for (const m of r.glowMats) m.color.copy(accent);
      // a ring's halo pulls in as the camera nears it, so flying through never floods the screen
      const near = MathUtils.smoothstep(Math.abs(z - r.group.position.z), 3, 16);
      r.halo.material.opacity = (0.15 + 0.45 * near) * (1 + state.flash * 0.6) + Math.sin(t * 1.4) * 0.03;
      r.spin.rotation.z += dt * 0.04;
    }
    // the last ring's gap closes as the visitor reaches the form: the 60° filler slides from
    // under the arc (arc + 200°) into the gap (arc + 300°)
    const close = MathUtils.smoothstep(p, 0.82, 0.99);
    lastRing.filler.rotation.z = lastRing.arc.rotation.z + MathUtils.degToRad(300 - 100 * (1 - close));
    lastRing.filler.visible = close > 0.01;
    trailMat.color.copy(accent);
    dustMat.color.copy(accent).lerp(WHITE, 0.35);

    for (const w of windows) {
      const u = w.userData;
      const ahead = z - w.position.z; // distance in front of the camera
      w.material.opacity = WIN_OPACITY * MathUtils.smoothstep(ahead, 4, 14);
      w.visible = w.material.opacity > 0.004;
      w.position.y = u.y0 + Math.sin(t * 0.5 + u.phase) * 0.12;
      w.rotation.z = u.rz + Math.sin(t * 0.35 + u.phase) * 0.02;
    }

    // trails move toward the camera; scroll speed, clicks and warp make them rush
    const rush = 5 + Math.min(60, Math.abs(scrollVel) * 0.06) + state.impulse * 70 + state.warp * 120;
    for (let i = 0; i < trails.length; i++) {
      const s = trails[i];
      s.z += rush * s.k * dt;
      if (s.z > z + 4) s.z = z - 30 - Math.random() * 60;
      else if (s.z < z - 95) s.z = z - 20 - Math.random() * 40;
      const len = s.len + rush * s.k * 0.035;
      const o = i * 6;
      trailPos[o] = s.x; trailPos[o + 1] = s.y; trailPos[o + 2] = s.z;
      trailPos[o + 3] = s.x; trailPos[o + 4] = s.y; trailPos[o + 5] = s.z - len;
    }
    trailGeo.attributes.position.needsUpdate = true;
    trailMat.opacity = 0.55 + Math.min(0.45, state.impulse + state.warp);

    renderer.render(scene, camera);
  }

  // ---------- run ----------
  const api = {
    static: reduce,
    get cameraZ() { return Math.round(state.camZ * 100) / 100; },
    get progress() { return state.p; },
    burst() { state.impulse = Math.min(1.5, state.impulse + 1); state.flash = 1; },
    warp(on) { state.warpTarget = on ? 1 : 0; if (on) state.flash = 1; }
  };
  window.__oyzlaScene = api;

  resize();
  // Phones fire resize when the URL bar collapses mid-scroll; reallocating the buffer then would
  // hitch, so small height-only changes just let CSS stretch the canvas.
  let sizeW = window.innerWidth, sizeH = window.innerHeight;
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    if (w === sizeW && Math.abs(h - sizeH) < 150) return;
    sizeW = w; sizeH = h;
    resize();
    if (reduce) frame(0, 0);
  }, { passive: true });

  if (reduce) {
    // one still frame: the hero composition, no motion at all
    api.burst = api.warp = () => {};
    frame(0, 0);
    document.documentElement.classList.add('scene-ready');
    return api;
  }

  readScroll();
  state.p = state.pTarget; // a reload halfway down starts there, it doesn't fly in
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    state.mxT = (e.clientX / window.innerWidth - 0.5) * 2;
    state.myT = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let last = performance.now();
  let slow = 0;
  let running = !document.hidden;
  let rafId = 0;
  function loop(now) {
    rafId = 0;
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const y = window.scrollY;
    scrollVel = scrollVel * 0.85 + ((y - lastScrollY) / Math.max(dt, 0.001)) * 0.15;
    lastScrollY = y;
    readScroll(); // page height changes (FAQ opening) keep progress honest
    frame(dt, now / 1000);
    // frames running long (>28ms) for ~1.5 s: drop the resolution once
    slow = dt > 0.028 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 90 && dprCap > 1) {
      dprCap = 1;
      renderer.setPixelRatio(1);
      resize();
      slow = 0;
    }
    rafId = requestAnimationFrame(loop);
  }
  // Exactly one loop, ever: cancel on hide, start once on show.
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (!running) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      last = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  });
  frame(0, 0);
  if (running) rafId = requestAnimationFrame(loop);
  document.documentElement.classList.add('scene-ready');
  return api;
}

// Entry: mount on the page's canvas; any failure leaves the CSS glow fallback in place.
(function boot() {
  const canvas = document.querySelector('canvas.scene-bg');
  if (!canvas) return;
  try {
    mountScene(canvas);
  } catch (err) {
    document.documentElement.classList.add('scene-fallback');
    console.warn('[oyzla-scene] fell back to the still glow:', err && err.message);
  }
})();
