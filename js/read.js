// Read-only chain reads with parallel RPC race (first success wins).
window.NovaRead = (function () {
  function rpc(url, method, params, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var ctrl = new AbortController();
      var t = setTimeout(function () { ctrl.abort(); reject(new Error("timeout")); }, timeoutMs || 4500);
      fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: method, params: params }),
        signal: ctrl.signal
      }).then(function (r) { return r.json(); }).then(function (j) {
        clearTimeout(t);
        if (j && j.result !== undefined) resolve(j.result); else reject(new Error("no result"));
      }).catch(function (e) { clearTimeout(t); reject(e); });
    });
  }
  function call(to, data) {
    var reqs = window.NOVA.rpcs.map(function (u) {
      return rpc(u, "eth_call", [{ to: to, data: data }, "latest"]);
    });
    return Promise.any(reqs);
  }
  function balance(addr) {
    var reqs = window.NOVA.rpcs.map(function (u) {
      return rpc(u, "eth_getBalance", [addr, "latest"]);
    });
    return Promise.any(reqs);
  }
  function padAddr(a) { return a.toLowerCase().replace("0x", "").padStart(64, "0"); }
  function padNum(n) { return BigInt(n).toString(16).padStart(64, "0"); }
  function words(hex) {
    var h = hex.replace("0x", ""), out = [];
    for (var i = 0; i + 64 <= h.length; i += 64) out.push(BigInt("0x" + h.slice(i, i + 64)));
    return out;
  }
  return { call: call, balance: balance, padAddr: padAddr, padNum: padNum, words: words };
})();
