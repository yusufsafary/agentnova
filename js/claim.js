// AgentNova · pemeriksa klaim: pindai Remnant milik satu wallet (read-only).
(function () {
  const C = window.NOVA, Z = window.WZ;
  const form = document.getElementById("claimForm");
  if (!form) return;
  const out = document.getElementById("claimOut");
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const bnb = (wei) => {
    const v = Number(BigInt(wei)) / 1e18;
    return v.toFixed(6).replace(/0+$/, "").replace(/\.$/, ".0");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addr = document.getElementById("walletInput").value.trim().toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(addr)) {
      out.innerHTML = `<p class="note">Enter a valid wallet address.</p>`;
      return;
    }
    out.innerHTML = `<p class="note">Reading the chain…</p>`;
    const S = C.sel;
    const head = await Z.batch([
      { to: C.remnants, data: S.totalRemnants },
      { to: C.claim, data: S.claimOpen },
    ]);
    const total = Z.toInt(head[0]);
    const claimOpen = Z.toBool(head[1]);
    if (!total) { out.innerHTML = `<p class="note">No Remnants struck yet.</p>`; return; }

    const owned = [];
    for (let lo = 1; lo <= total; lo += 120) {
      const ids = [];
      for (let i = lo; i <= Math.min(lo + 119, total); i++) ids.push(i);
      const res = await Z.batch(ids.map((i) => Z.u256(S.ownerOf, i)));
      ids.forEach((i, k) => { if (Z.toAddr(res[k]) === addr) owned.push(i); });
    }
    if (!owned.length) {
      out.innerHTML = `<p class="note">No Remnants found for this wallet.</p>`;
      return;
    }
    const rows = [];
    let sum = 0n;
    for (let lo = 0; lo < owned.length; lo += 60) {
      const part = owned.slice(lo, lo + 60);
      const calls = [];
      for (const i of part) {
        calls.push(Z.u256(S.cycleOf, i), Z.u256(S.classOf, i),
          { to: C.claim, data: S.claimedById + Z.enc(i) },
          { to: C.claim, data: S.claimAmount + Z.enc(i) },
          { to: C.claim, data: S.feeFor + Z.enc(i) });
      }
      const r = await Z.batch(calls);
      part.forEach((i, k) => {
        const b = k * 5;
        const cycle = Z.toInt(r[b]), cls = Z.toInt(r[b + 1]);
        const done = Z.toBool(r[b + 2]);
        const amount = Z.toBig(r[b + 3]), fee = Z.toBig(r[b + 4]);
        let state, amtTxt = "·";
        if (cls === 4) state = "CYCLE NOT SEALED";
        else if (done) { state = "CLAIMED"; amtTxt = fmt(Number(amount / 10n ** 18n)); }
        else if (!claimOpen) state = "CLAIMS NOT OPEN";
        else { state = "CLAIMABLE"; amtTxt = fmt(Number(amount / 10n ** 18n)); sum += amount; }
        rows.push(`<tr><td class="serif">Nº ${fmt(i)}</td><td>Nº ${fmt(cycle)}</td><td>${C.classNames[cls]}</td><td>${amtTxt}</td><td>${cls === 4 || done ? "·" : bnb(fee) + " BNB"}</td><td><span class="st">${state}</span></td></tr>`);
      });
    }
    out.innerHTML = `
      <div class="tablewrap"><table class="board">
        <thead><tr><th>Remnant</th><th>Cycle</th><th>Status</th><th>NOVA</th><th>Fee</th><th>State</th></tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table></div>
      <p class="note">Claimable total: <b>${fmt(Number(sum / 10n ** 18n))} NOVA</b> across ${owned.length} Remnant(s).
      Claim through your agent: call <span class="mono">claim(tokenId)</span> on the Claim contract with the exact fee shown per Remnant. One claim per Remnant, ever. The NFT is not burned.</p>`;
  });
})();
