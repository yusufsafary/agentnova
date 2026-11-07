import * as THREE from "../vendor/three.module.js";

// AgentNova hero: a supernova remnant turning slowly in the dark.
// Monochrome particle cloud, a bright neutron star at the core,
// and two pale pulsar beams sweeping like a lighthouse.
(function () {
  var canvas = document.getElementById("scene");
  if (!canvas) return;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { canvas.style.display = "none"; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  var MOBILE = Math.min(window.innerWidth, window.innerHeight) < 760;
  if (MOBILE) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  var PF = MOBILE ? 0.55 : 1; // particle factor on small screens

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0.6, 11);

  function rand(seedObj) { // deterministic-ish local rng
    seedObj.s = (seedObj.s * 16807) % 2147483647;
    return (seedObj.s - 1) / 2147483646;
  }
  function gauss(rng) { return (rand(rng) + rand(rng) + rand(rng) - 1.5) / 1.5; }

  function makeCloud(count, blobs, spread, size, opacity) {
    var rng = { s: 1234567 + count };
    var pos = new Float32Array(count * 3);
    var col = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var b = blobs[Math.floor(rand(rng) * blobs.length)];
      pos[i * 3] = b[0] + gauss(rng) * spread;
      pos[i * 3 + 1] = (b[1] + gauss(rng) * spread) * 0.72;
      pos[i * 3 + 2] = b[2] + gauss(rng) * spread;
      var v = 0.35 + rand(rng) * 0.65;
      col[i * 3] = v; col[i * 3 + 1] = v; col[i * 3 + 2] = v;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var m = new THREE.PointsMaterial({
      size: size, vertexColors: true, transparent: true, opacity: opacity,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    return new THREE.Points(g, m);
  }

  var blobs = [[0, 0, 0], [1.8, 0.5, -0.6], [-2.0, -0.4, 0.5], [0.9, -1.1, 0.9],
    [-1.1, 1.2, -0.8], [2.6, -1.2, -1.4], [-2.7, 0.9, 1.2], [0.2, 1.9, -1.6]];
  var cloud = new THREE.Group();
  cloud.add(makeCloud(Math.round(2400 * PF), blobs, 1.05, 0.055, 0.85));
  cloud.add(makeCloud(Math.round(3200 * PF), blobs, 2.1, 0.04, 0.4));
  scene.add(cloud);

  // distant stars
  (function () {
    var rng = { s: 987654 };
    var n = 700, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      pos[i * 3] = (rand(rng) - 0.5) * 60;
      pos[i * 3 + 1] = (rand(rng) - 0.5) * 34;
      pos[i * 3 + 2] = -8 - rand(rng) * 18;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({
      size: 0.07, color: 0x888888, transparent: true, opacity: 0.7, depthWrite: false
    })));
  })();

  // neutron star + glow
  var core = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  scene.add(core);
  (function () {
    var c = document.createElement("canvas"); c.width = c.height = 128;
    var x = c.getContext("2d");
    var gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,0.9)");
    gr.addColorStop(0.35, "rgba(255,255,255,0.28)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    sp.scale.set(2.6, 2.6, 1);
    scene.add(sp);
  })();

  // pulsar beams: two cones on a tilted axis
  var beamGroup = new THREE.Group();
  var beamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.09, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
  var coneGeo = new THREE.ConeGeometry(1.15, 7.5, 32, 1, true);
  var cone1 = new THREE.Mesh(coneGeo, beamMat);
  cone1.position.y = 3.75; cone1.rotation.x = Math.PI;
  var cone2 = new THREE.Mesh(coneGeo, beamMat);
  cone2.position.y = -3.75;
  beamGroup.add(cone1); beamGroup.add(cone2);
  beamGroup.rotation.z = 0.42;
  scene.add(beamGroup);

  // ring of debris, tilted
  (function () {
    var rng = { s: 555 };
    var n = 500, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var a = rand(rng) * Math.PI * 2, r = 3.4 + gauss(rng) * 0.5;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = gauss(rng) * 0.16;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var ring = new THREE.Points(g, new THREE.PointsMaterial({
      size: 0.05, color: 0xcccccc, transparent: true, opacity: 0.6, depthWrite: false
    }));
    ring.rotation.x = 0.5; ring.rotation.z = 0.2;
    ring.name = "ring";
    scene.add(ring);
    cloud.userData.ring = ring;
  })();

  var targetRX = 0, targetRY = 0, dragging = false, px = 0, py = 0;
  canvas.style.touchAction = "pan-y";
  canvas.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse") return;
    dragging = true; px = e.clientX; py = e.clientY;
  });
  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    targetRY += (e.clientX - px) * 0.004;
    targetRX += (e.clientY - py) * 0.002;
    targetRX = Math.max(-0.5, Math.min(0.5, targetRX));
    px = e.clientX; py = e.clientY;
  });
  window.addEventListener("pointerup", function () { dragging = false; });

  function resize() {
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // Pause rendering when the tab is hidden or the hero is off screen.
  var clock = new THREE.Clock();
  var T = 0, raf = null;
  function start() { if (raf === null) { clock.getDelta(); raf = requestAnimationFrame(tick); } }
  function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.02 }).observe(canvas);
  }
  function tick() {
    raf = requestAnimationFrame(tick);
    T += Math.min(clock.getDelta(), 0.05);
    var t = T;
    cloud.rotation.y = t * 0.021 + targetRY;
    cloud.rotation.x = Math.sin(t * 0.05) * 0.05 + targetRX;
    if (cloud.userData.ring) {
      cloud.userData.ring.rotation.y = -t * 0.015;
    }
    beamGroup.rotation.y = t * 0.55;
    beamGroup.rotation.x = Math.sin(t * 0.11) * 0.14;
    core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
    renderer.render(scene, camera);
  }
  start();
})();
