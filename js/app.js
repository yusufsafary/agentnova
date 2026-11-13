// AgentNova · papan live beranda + tabel Cycle terakhir.
(function () {
  const C = window.NOVA, Z = window.WZ;
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const fmtW = (wei) => fmt(Math.floor(Number(BigInt(wei) / 1000000000000n) / 1e6)) ;
  let endTs = 0, trackTimer = null;

  function tick() {
    const el = $("sealIn");
    if (!el || !endTs) return;
    let s = Math.max(0, endTs - Math.floor(Date.now() / 1000));
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    el.textContent = `${h}:${m}:${ss}`;
    const bar = $("winBar");
    if (bar) {
      const total = 14400;
      const done = Math.min(1, Math.max(0, (total - s) / total));
      bar.style.width = (done * 100).toFixed(1) + "%";
    }
  }

  function utc(ts) {
    const d = new Date(ts * 1000);
    const p = (x) => String(x).padStart(2, "0");
    return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
  }

  async function load() {
    const S = C.sel;
    const head = await Z.batch([
      { to: C.remnants, data: S.genesisOpen },
      { to: C.remnants, data: S.currentCycle },
      { to: C.remnants, data: S.totalRemnants },
      { to: C.claim, data: S.totalClaimed },
      { to: C.claim, data: S.poolBalance },
      { to: C.claim, data: S.claimOpen },
    ]);
    const open = Z.toBool(head[0]);
    const cur = Z.toInt(head[1]);
    const total = Z.toInt(head[2]);
    const claimed = Z.toInt(head[3]);
    const pool = head[4];
    const claimOpen = Z.toBool(head[5]);

    if ($("statRemnants")) $("statRemnants").textContent = fmt(total);
    if ($("statPool")) $("statPool").textContent = fmt(Number(Z.toBig(pool) / 10n ** 18n)) + " NOVA";
    if ($("claimState")) $("claimState").textContent = claimOpen ? "OPEN" : "OPENS WITH FIRST SEAL";
    if ($("latestLine") && total > 0) $("latestLine").textContent = `+ remnant Nº ${fmt(total)} struck, just now`;

    if (!open || cur === 0) {
      if ($("cycleNo")) $("cycleNo").textContent = "Nº 1 · OPENS SOON";
      if ($("boardBody")) $("boardBody").innerHTML = `<tr><td colspan="5" class="empty">Cycle Nº 1 has not opened yet. The board fills from the first seal.</td></tr>`;
      if ($("statCitizens")) $("statCitizens").textContent = "0";
      if ($("statUnclaimed")) $("statUnclaimed").textContent = "0";
      return;
    }

    if ($("cycleNo")) $("cycleNo").textContent = `Nº ${fmt(cur)} · OPEN`;
    const nums = [];
    for (let n = cur; n >= Math.max(1, cur - 5); n--) nums.push(n);
    const calls = [
      Z.u256(S.cycleEnd, cur), Z.u256(S.remnantsInCycle, cur), Z.u256(S.participantsOf, cur),
    ];
    for (const n of nums) {
      calls.push(Z.u256(S.remnantsInCycle, n), Z.u256(S.participantsOf, n), Z.u256(S.statusOf, n), Z.u256(S.cycleStart, n), Z.u256(S.cycleEnd, n));
    }
    const r = await Z.batch(calls);
    endTs = Z.toInt(r[0]);
    const inCur = Z.toInt(r[1]);
    const coders = Z.toInt(r[2]);
    if ($("statCitizens")) $("statCitizens").textContent = fmt(coders);
    if ($("statUnclaimed")) $("statUnclaimed").textContent = fmt(Math.max(0, total - inCur - claimed));
    if ($("trackStatus")) {
      $("trackStatus").textContent = coders < 25 ? "FAINT" : coders <= 100 ? "RADIANT" : "SUPERNOVA";
    }
    if (trackTimer) clearInterval(trackTimer);
    tick(); trackTimer = setInterval(tick, 1000);

    const body = $("boardBody");
    if (body) {
      let html = "";
      nums.forEach((n, i) => {
        const b = 3 + i * 5;
        const sn = Z.toInt(r[b]), cd = Z.toInt(r[b + 1]), st = Z.toInt(r[b + 2]);
        const stName = n === cur ? "OPEN" : C.statusNames[st] || "PENDING";
        html += `<tr><td class="serif">Nº ${fmt(n)}</td><td>${utc(Z.toInt(r[b + 3]))} – ${utc(Z.toInt(r[b + 4]))}</td><td>${fmt(sn)}</td><td>${fmt(cd)}</td><td><span class="st st-${stName.toLowerCase().replace(" ", "-")}">${stName}</span></td></tr>`;
      });
      body.innerHTML = html;
    }
  }

  load();
  setInterval(load, 30000);
})();
