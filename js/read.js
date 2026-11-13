// Pembaca on-chain: balapan beberapa RPC, batch eth_call, tanpa wallet.
(function () {
  const C = window.NOVA;
  const enc = (n) => BigInt(n).toString(16).padStart(64, "0");
  const toInt = (h) => (h && h !== "0x" ? Number(BigInt(h)) : 0);
  const toBig = (h) => (h && h !== "0x" ? BigInt(h) : 0n);
  const toBool = (h) => toInt(h) !== 0;
  const toAddr = (h) => (h && h.length >= 42 ? "0x" + h.slice(-40) : null);

  async function rpcOnce(url, payload) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctl.signal,
      });
      const j = await r.json();
      return j;
    } finally {
      clearTimeout(t);
    }
  }

  // batch: [{to, data}] -> [hex|null] (balapan antar RPC, hasil lengkap pertama menang)
  async function batch(calls) {
    const payload = calls.map((c, i) => ({
      jsonrpc: "2.0", id: i, method: "eth_call",
      params: [{ to: c.to, data: c.data }, "latest"],
    }));
    const attempts = C.rpcs.map((u) =>
      rpcOnce(u, payload).then((j) => {
        if (!Array.isArray(j)) throw new Error("bad");
        const out = new Array(calls.length).fill(null);
        for (const o of j) if (o && o.result && o.result !== "0x") out[o.id] = o.result;
        if (out.some((v) => v === null)) throw new Error("partial");
        return out;
      })
    );
    try {
      return await Promise.any(attempts);
    } catch {
      // semua gagal/parsial: ambil upaya terakhir apa adanya
      try {
        const j = await rpcOnce(C.rpcs[0], payload);
        const out = new Array(calls.length).fill(null);
        if (Array.isArray(j)) for (const o of j) if (o && o.result) out[o.id] = o.result;
        return out;
      } catch { return new Array(calls.length).fill(null); }
    }
  }

  const call = (to, data) => batch([{ to, data }]).then((r) => r[0]);
  const S = (name) => C.sel[name];
  const u256 = (sel, n) => ({ to: C.remnants, data: sel + enc(n) });

  window.WZ = { enc, toInt, toBig, toBool, toAddr, batch, call, S, u256 };
})();
