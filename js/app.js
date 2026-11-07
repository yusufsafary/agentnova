(function () {
  var N = window.NOVA, R = window.NovaRead;
  var L = function (k, v) { return window.NovaLang ? window.NovaLang.t(k, v) : k; };
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return Number(n).toLocaleString("en-US"); };

  function pad2(n) { return String(n).padStart(2, "0"); }
  function cdText(target) {
    var s = Math.max(0, Math.floor(target - Date.now() / 1000));
    var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
        m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (d > 0 ? d + "D " : "") + pad2(h) + ":" + pad2(m) + ":" + pad2(ss);
  }
  function utcText(ts) {
    var d = new Date(ts * 1000);
    var mon = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return d.getUTCDate() + " " + mon[d.getUTCMonth()] + " · " +
      pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes()) + " UTC";
  }

  var phase = "pre"; // pre -> live -> revealed
  function tickClock() {
    var now = Date.now() / 1000;
    var cd = $("cd"), label = $("cd-label"), strip = $("strip-text");
    if (now < N.openTime) {
      phase = "pre";
      if (label) label.textContent = L("cd.opens");
      if (cd) cd.textContent = cdText(N.openTime);
      if (strip) strip.textContent = L("strip.opens") + " " + utcText(N.openTime) + " · " + L("strip.reveal") + " " + utcText(N.revealTime);
    } else if (now < N.revealTime) {
      phase = "live";
      if (label) label.textContent = L("cd.reveal");
      if (cd) cd.textContent = cdText(N.revealTime);
      if (strip) strip.textContent = L("strip.live") + " · " + L("strip.reveal") + " " + utcText(N.revealTime);
    } else {
      phase = "revealed";
      if (label) label.textContent = L("cd.revealed");
      if (cd) cd.textContent = "LIVE";
      if (strip) strip.textContent = L("strip.live") + " · " + L("strip.revealed") + " " + utcText(N.revealTime);
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  function refreshBoard() {
    R.call(N.nft, N.sel.totalMinted).then(function (hex) {
      var minted = Number(BigInt(hex));
      var el = $("b-minted"); if (el) el.textContent = fmt(minted);
      var left = $("b-left"); if (left) left.textContent = fmt(N.maxSupply - minted);
      var bar = $("supply-bar"); if (bar) bar.style.width = (minted / N.maxSupply * 100).toFixed(2) + "%";
      lastMinted = minted; renderP2();
    }).catch(function () {});
    R.call(N.market, N.sel.listedIds).then(function (hex) {
      var w = R.words(hex);
      var count = w.length > 1 ? Number(w[1]) : 0;
      var el = $("b-listed"); if (el) el.textContent = fmt(count);
    }).catch(function () {});
  }
  refreshBoard();
  setInterval(refreshBoard, 30000);
  var lastMinted = 0;
  function renderP2() {
    var el = $("mkt-p2"); if (!el) return;
    el.innerHTML = L("mkt.p2", { n: '<b id="m-minted">' + fmt(lastMinted) + "</b>" });
  }
  document.addEventListener("nova:lang", function () { tickClock(); renderP2(); });

  // Wallet checker: shows the wallet's own question and status. Read-only.
  var btn = $("check-btn");
  if (btn) btn.addEventListener("click", function () {
    var addr = ($("check-addr").value || "").trim();
    var out = $("check-out");
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) { out.textContent = L("check.invalid"); return; }
    out.textContent = L("check.reading");
    var q = R.call(N.nft, N.sel.questionFor + R.padAddr(addr));
    var st = R.call(N.nft, N.sel.stats + R.padAddr(addr));
    Promise.all([q, st]).then(function (res) {
      var qw = R.words(res[0]);
      var a = Number(qw[0]), b = Number(qw[1]), op = Number(qw[2]);
      var sym = op === 0 ? "+" : op === 1 ? "−" : "×";
      var sw = R.words(res[1]);
      var hasId = sw[4] === 1n, hasMinted = sw[5] === 1n;
      R.call(N.nft, N.sel.freeUsed + R.padAddr(addr)).then(function (fu) {
        var used = R.words(fu)[0] === 1n;
        var lines = [];
        lines.push(L("check.agentid") + " " + (hasId ? L("check.held") : L("check.notheld")));
        lines.push(L("check.free") + " " + (!hasId ? L("check.needid") : used ? L("check.used") : L("check.avail")));
        if (hasId && !used) lines.push(L("check.question") + " " + a + " " + sym + " " + b + " = ?  " + L("check.qnote"));
        lines.push(L("check.minted") + " " + (hasMinted ? L("check.yes") : L("check.notyet")) + L("check.tail"));
        out.textContent = lines.join("\n");
      }).catch(function () { out.textContent = L("check.fail"); });
    }).catch(function () { out.textContent = L("check.fail"); });
  });

  // Copy agent prompt
  var cp = $("copy-prompt");
  if (cp) cp.addEventListener("click", function () {
    var txt = $("agent-prompt").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () {
      cp.textContent = L("prompt.copied"); setTimeout(function () { cp.textContent = L("prompt.copy"); }, 1600);
    });
  });
})();
