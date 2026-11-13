// AgentNova · pemeriksa klaim Legacy: Remnant lama (id 1..70) milik satu wallet.
(function () {
  const C = window.NOVA, Z = window.WZ;
  const form = document.getElementById("legacyForm");
  if (!form) return;
  const out = document.getElementById("legacyOut");
  const fmt = (n) => Number(n).toLocaleString("en-US");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addr = document.getElementById("legacyInput").value.trim().toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(addr)) {
      out.innerHTML = `<p class="note">Enter a valid wallet address.</p>`;
      return;
    }
    out.innerHTML = `<p class="note">Reading the legacy registry…</p>`;
    const S = C.sel;
    const head = await Z.batch([
      { to: C.legacyClaim, data: S.claimOpen },
      { to: C.legacyClaim, data: S.totalClaimed },
    ]);
    const open = Z.toBool(head[0]);
    const ids = [];
    for (let i = 1; i <= C.maxLegacyId; i++) ids.push(i);
    const owners = await Z.batch(ids.map((i) => ({ to: C.oldNft, data: S.ownerOf + Z.enc(i) })));
    const owned = ids.filter((id, k) => Z.toAddr(owners[k]) === addr);
    if (!owned.length) {
      out.innerHTML = `<p class="note">No legacy Remnants (Nº 1–${C.maxLegacyId}) found for this wallet.</p>`;
      return;
    }
    const claims = await Z.batch(owned.map((i) => ({ to: C.legacyClaim, data: S.claimedById + Z.enc(i) })));
    let sum = 0;
    const rows = owned.map((id, k) => {
      const done = Z.toBool(claims[k]);
      const state = done ? "CLAIMED" : open ? "CLAIMABLE" : "CLAIMS NOT OPEN";
      if (!done && open) sum += 250000;
      return `<tr><td class="serif">Nº ${fmt(id)}</td><td>LEGACY · 2026</td><td>${done ? fmt(250000) : open ? fmt(250000) : "·"}</td><td><span class="st">${state}</span></td></tr>`;
    });
    out.innerHTML = `
      <div class="tablewrap"><table class="board">
        <thead><tr><th>Legacy Remnant</th><th>Collection</th><th>NOVA</th><th>State</th></tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table></div>
      <p class="note">Legacy total: <b>${fmt(sum)} NOVA</b> claimable. Claim through your agent: call <span class="mono">claim(tokenId)</span> on the Legacy Claim contract. No fee. One claim per legacy Remnant, ever.</p>`;
  });
})();
