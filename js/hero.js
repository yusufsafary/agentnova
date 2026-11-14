// AgentNova · Lapisan interaktif beranda: kanvas observatorium hidup, jarum verdict,
// hitung-naik statistik, kartu Remnant miring 3D, dan scroll reveal. Vanilla saja.
// Semua data datang dari app.js lewat window.NovaFX; halaman tetap utuh tanpa berkas ini.
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  /* ---------- hitung naik ---------- */
  function countUp(el, target) {
    if (!el || typeof target !== "number" || !isFinite(target)) return;
    const from = typeof el._nv === "number" ? el._nv : 0;
    el._nv = target;
    if (reduced || from === target) { el.textContent = fmt(target); return; }
    if (el._raf) cancelAnimationFrame(el._raf);
    const t0 = performance.now(), dur = 900;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (target - from) * e);
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  /* ---------- scroll reveal ---------- */
  const rvEls = Array.prototype.slice.call(document.querySelectorAll(".rv"));
  if (reduced || !("IntersectionObserver" in window)) {
    rvEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    rvEls.forEach((el) => io.observe(el));
  }

  /* ---------- verdict gauge + stepper proyeksi ---------- */
  const needle = document.getElementById("gaugeNeedle");
  const hint = document.getElementById("gaugeHint");
  const featStage = document.getElementById("featStage");
  const featVerdict = document.getElementById("featVerdict");
  const featClaim = document.getElementById("featClaim");
  const steps = Array.prototype.slice.call(document.querySelectorAll("#stageStepper .step"));
  const lines = Array.prototype.slice.call(document.querySelectorAll("#stageStepper .sline"));
  const CAP = 150; // skala jarum: 0..150 citizen (garis 25 dan 100 terlihat)
  const TRACKS = [
    { name: "FAINT", stage: "GENESIS", stageIdx: 0, claim: "2,500 NOVA" },
    { name: "RADIANT", stage: "AWAKENING", stageIdx: 1, claim: "12,500 NOVA" },
    { name: "SUPERNOVA", stage: "ASCENSION", stageIdx: 2, claim: "60,000 NOVA" },
  ];
  let citizens = null;

  function trackOf(n) { return n < 25 ? TRACKS[0] : n <= 100 ? TRACKS[1] : TRACKS[2]; }

  function setCitizens(n) {
    if (typeof n !== "number" || !isFinite(n)) return;
    citizens = n;
    const pct = Math.max(0, Math.min(100, (n / CAP) * 100));
    if (needle) needle.style.left = pct.toFixed(2) + "%";
    const tr = trackOf(n);
    if (hint) {
      if (n < 25) hint.textContent = fmt(n) + " CITIZENS IN · " + (25 - n) + " MORE TO RADIANT TRACK";
      else if (n <= 100) hint.textContent = fmt(n) + " CITIZENS IN · " + (101 - n) + " MORE TO SUPERNOVA TRACK";
      else hint.textContent = fmt(n) + " CITIZENS IN · SUPERNOVA TRACK, HOLDING";
    }
    if (featStage) featStage.textContent = tr.stage;
    if (featVerdict) featVerdict.textContent = tr.name;
    if (featClaim) featClaim.textContent = tr.claim;
    steps.forEach((s, i) => {
      s.classList.toggle("done", i < tr.stageIdx);
      s.classList.toggle("active", i === tr.stageIdx);
    });
    lines.forEach((l, i) => l.classList.toggle("filled", i < tr.stageIdx));
    drawPlate();
  }

  /* ---------- kartu Remnant: tilt + sheen + plat generatif ---------- */
  const card = document.getElementById("remnantCard");
  const plate = document.getElementById("plateCanvas");
  let featuredId = 0;

  if (card && finePointer && !reduced) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      card.style.transform = "perspective(1100px) rotateX(" + cy.toFixed(2) + "deg) rotateY(" + cx.toFixed(2) + "deg)";
      if (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) raf = requestAnimationFrame(loop);
      else raf = null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      tx = (px - 0.5) * 7; ty = (0.5 - py) * 7; kick();
    });
    card.addEventListener("pointerleave", () => { tx = 0; ty = 0; kick(); });
  }

  function rng(seed) {
    let a = (seed * 2654435761) >>> 0 || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawPlate() {
    if (!plate || !featuredId) return;
    const ctx = plate.getContext("2d");
    if (!ctx) return;
    const W = plate.width, H = plate.height;
    const rand = rng(featuredId);
    const g = ctx.createRadialGradient(W / 2, H * 0.46, 10, W / 2, H * 0.46, W * 0.55);
    g.addColorStop(0, "#fdfff4"); g.addColorStop(0.3, "#eaffb0");
    g.addColorStop(0.58, "#c6ff4d"); g.addColorStop(0.82, "#9be815"); g.addColorStop(1, "#79b400");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // bintang latar
    ctx.fillStyle = "rgba(22,33,12,0.55)";
    for (let i = 0; i < 90; i++) {
      const x = rand() * W, y = rand() * H, r = rand() * 1.7 + 0.4;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }
    // cincin observatorium
    const cxp = W / 2, cyp = H * 0.46;
    ctx.strokeStyle = "rgba(22,33,12,0.5)"; ctx.lineWidth = 2;
    [0.17, 0.27, 0.38].forEach((f, i) => {
      ctx.beginPath();
      if (i === 2) ctx.setLineDash([7, 7]); else ctx.setLineDash([]);
      ctx.arc(cxp, cyp, W * f * 0.62, 0, 6.2832); ctx.stroke();
    });
    ctx.setLineDash([]);
    // orbit miring + satelit
    ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(-0.32); ctx.scale(1, 0.4);
    ctx.beginPath(); ctx.arc(0, 0, W * 0.3, 0, 6.2832);
    ctx.strokeStyle = "rgba(22,33,12,0.45)"; ctx.stroke(); ctx.restore();
    const sa = rand() * 6.2832, sr = W * 0.3;
    const sx = cxp + Math.cos(sa) * sr, sy = cyp + Math.sin(sa) * sr * 0.4 - Math.sin(0.32) * 0;
    ctx.fillStyle = "#16210c";
    ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 6.2832); ctx.fill();
    // inti
    ctx.fillStyle = "#f6f9ec"; ctx.strokeStyle = "#16210c"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cxp, cyp, 44, 0, 6.2832); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#16210c"; ctx.font = "700 17px 'Space Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("NOVA", cxp, cyp + 1);
    // tahap proyeksi sebagai busur penanda
    if (citizens !== null) {
      const tr = trackOf(citizens);
      ctx.strokeStyle = "#16210c"; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cxp, cyp, W * 0.38 * 0.62, -Math.PI / 2, -Math.PI / 2 + (tr.stageIdx + 1) / 3 * Math.PI * 2);
      ctx.stroke();
    }
  }

  function setFeatured(total, cycle) {
    if (typeof total === "number" && total > 0) {
      featuredId = total;
      const fi = document.getElementById("featId");
      if (fi) fi.textContent = "Nº " + fmt(total);
      drawPlate();
    }
    const fc = document.getElementById("featCycle");
    if (fc && typeof cycle === "number" && cycle > 0) fc.textContent = "CYCLE Nº " + fmt(cycle) + " · OPEN";
  }

  /* ---------- kanvas bintang observatorium ---------- */
  const panel = document.getElementById("starPanel");
  const cv = document.getElementById("starCanvas");
  if (panel && cv) {
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1, running = true, visible = true, rafId = null;
    let px = 0, py = 0, tpx = 0, tpy = 0;
    const stars = [];
    for (let i = 0; i < 70; i++) stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.4, p: Math.random() * 6.2832, s: 0.4 + Math.random() * 0.9 });

    function resize() {
      const r = panel.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(50, r.width); H = Math.max(50, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(performance.now());
    }
    window.addEventListener("resize", resize);
    resize();
    panel.classList.add("canvas-on");

    if (finePointer && !reduced) {
      panel.addEventListener("pointermove", (e) => {
        const r = panel.getBoundingClientRect();
        tpx = ((e.clientX - r.left) / r.width - 0.5) * 10;
        tpy = ((e.clientY - r.top) / r.height - 0.5) * 10;
      });
      panel.addEventListener("pointerleave", () => { tpx = 0; tpy = 0; });
    }
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running && !reduced) loop();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.02 }).observe(panel);
    }

    function draw(now) {
      if (!W) return;
      const t = now / 1000;
      px += (tpx - px) * 0.045; py += (tpy - py) * 0.045;
      const cxp = W / 2 + px, cyp = H * 0.46 + py;
      const R = Math.min(W, H) * 0.46;
      ctx.clearRect(0, 0, W, H);
      // bintang kedip
      for (const s of stars) {
        const a = 0.18 + 0.3 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
        ctx.fillStyle = "rgba(22,33,12," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.2832); ctx.fill();
      }
      // cincin konsentris
      const radii = [0.34, 0.56, 0.79, 1.0];
      radii.forEach((f, i) => {
        const rr = R * f * (1 + 0.012 * Math.sin(t * 0.7 + i * 1.3));
        ctx.beginPath();
        ctx.strokeStyle = i === 3 ? "rgba(22,33,12,0.55)" : "rgba(22,33,12,0.42)";
        ctx.lineWidth = i === 3 ? 2 : 1.6;
        if (i === 2) ctx.setLineDash([6, 8]); else ctx.setLineDash([]);
        if (i === 2) ctx.lineDashOffset = -t * 6;
        ctx.arc(cxp, cyp, rr, 0, 6.2832); ctx.stroke();
      });
      ctx.setLineDash([]);
      // progres Cycle asli: jendela 4 jam sejajar batas UTC
      const frac = ((Date.now() / 1000) % 14400) / 14400;
      const ang = -Math.PI / 2 + frac * Math.PI * 2;
      // busur waktu berlalu di cincin luar
      ctx.beginPath();
      ctx.strokeStyle = "rgba(22,33,12,0.85)"; ctx.lineWidth = 3.4;
      ctx.arc(cxp, cyp, R, -Math.PI / 2, ang); ctx.stroke();
      // sapuan sweep memudar
      for (let k = 10; k >= 1; k--) {
        const a2 = ang - k * 0.028;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255," + (0.05 + (10 - k) * 0.012).toFixed(3) + ")";
        ctx.lineWidth = R * 0.62;
        ctx.arc(cxp, cyp, R * 0.68, a2 - 0.014, a2 + 0.014); ctx.stroke();
      }
      // jarum sweep
      ctx.beginPath();
      ctx.strokeStyle = "rgba(22,33,12,0.8)"; ctx.lineWidth = 2;
      ctx.moveTo(cxp, cyp); ctx.lineTo(cxp + Math.cos(ang) * R, cyp + Math.sin(ang) * R); ctx.stroke();
      const hx = cxp + Math.cos(ang) * R, hy = cyp + Math.sin(ang) * R;
      ctx.fillStyle = "#16210c";
      ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 6.2832); ctx.fill();
      // penanda bintang bercahaya dari jumlah citizen hidup
      if (citizens !== null) {
        const cf = Math.max(0, Math.min(1, citizens / CAP));
        const ma = -Math.PI / 2 + cf * Math.PI * 2;
        const mr = R * 0.79;
        const mx = cxp + Math.cos(ma) * mr, my = cyp + Math.sin(ma) * mr;
        const pulse = 1 + 0.25 * Math.sin(t * 2.4);
        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 26 * pulse);
        halo.addColorStop(0, "rgba(255,255,255,0.95)");
        halo.addColorStop(0.35, "rgba(246,249,236,0.55)");
        halo.addColorStop(1, "rgba(246,249,236,0)");
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(mx, my, 26 * pulse, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#16210c"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(mx, my, 7, 0, 6.2832); ctx.fill(); ctx.stroke();
      }
      // penanda ambang verdict di cincin citizen
      [25, 100].forEach((th) => {
        const a3 = -Math.PI / 2 + (th / CAP) * Math.PI * 2;
        const txp = cxp + Math.cos(a3) * R * 0.79, typ = cyp + Math.sin(a3) * R * 0.79;
        ctx.fillStyle = "rgba(22,33,12,0.9)";
        ctx.beginPath(); ctx.arc(txp, typ, 3, 0, 6.2832); ctx.fill();
      });
    }

    function loop() {
      if (rafId) return;
      const stepFn = (now) => {
        rafId = null;
        if (!running || document.hidden) return;
        if (visible) draw(now);
        rafId = requestAnimationFrame(stepFn);
      };
      rafId = requestAnimationFrame(stepFn);
    }
    if (!reduced) loop(); else draw(performance.now());
  }

  window.NovaFX = { countUp: countUp, setCitizens: setCitizens, setFeatured: setFeatured };
})();
