// AgentNova · Registry: 70 pemegang Remnant lama, dibaca langsung dari chain.
(function () {
  const C = window.NOVA, Z = window.WZ;
  const body = document.getElementById("registryBody");
  if (!body) return;
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const short = (a) => a.slice(0, 6) + "…" + a.slice(-4);

  (async () => {
    const S = C.sel;
    const ids = [];
    for (let i = 1; i <= C.maxLegacyId; i++) ids.push(i);
    const owners = await Z.batch(ids.map((i) => ({ to: C.oldNft, data: S.ownerOf + Z.enc(i) })));
    const claims = await Z.batch(ids.map((i) => ({ to: C.legacyClaim, data: S.claimedById + Z.enc(i) })));
    const citizens = new Set();
    let claimed = 0;
    const rows = ids.map((id, k) => {
      const o = Z.toAddr(owners[k]);
      citizens.add(o);
      const done = Z.toBool(claims[k]);
      if (done) claimed++;
      return `<tr><td class="serif">Nº ${fmt(id)}</td><td class="mono">${short(o)}</td><td>FIRST SIGNAL</td><td>${fmt(250000)} NOVA</td><td><span class="st">${done ? "CLAIMED" : "UNCLAIMED"}</span></td></tr>`;
    });
    body.innerHTML = rows.join("");
    const cEl = document.getElementById("regCitizens");
    if (cEl) cEl.textContent = fmt(citizens.size);
    const clEl = document.getElementById("regClaimed");
    if (clEl) clEl.textContent = fmt(claimed) + " / " + C.maxLegacyId;
  })().catch(() => { body.innerHTML = `<tr><td colspan="5" class="empty">Registry is syncing. Refresh in a moment.</td></tr>`; });
})();
