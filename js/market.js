(function () {
  var N = window.NOVA, R = window.NovaRead;
  var L = function (k, v) { return window.NovaLang ? window.NovaLang.t(k, v) : k; };
  var $ = function (id) { return document.getElementById(id); };
  var NFT_ABI = [
    "function ownerOf(uint256) view returns (address)",
    "function approve(address,uint256)",
    "function getApproved(uint256) view returns (address)"
  ];
  var MKT_ABI = [
    "function list(uint256,uint256)",
    "function buy(uint256) payable",
    "function delist(uint256)"
  ];
  var provider = null, signer = null, account = null, busy = false, revealed = false;

  function status(msg, hold) {
    var el = $("m-status");
    el.textContent = msg;
    el.classList.add("show");
    if (!hold) setTimeout(function () { el.classList.remove("show"); }, 4200);
  }
  function fmtBnb(wei) {
    var v = Number(wei) / 1e18;
    return v.toLocaleString("en-US", { maximumFractionDigits: 6 }) + " BNB";
  }

  function imgFor(id) {
    return revealed ? "art/" + id + ".svg" : "art/unrevealed.svg";
  }

  function loadListings() {
    R.call(N.nft, N.sel.revealed).then(function (h) { revealed = R.words(h)[0] === 1n; }).catch(function () {});
    R.call(N.market, N.sel.listedIds).then(function (hex) {
      var w = R.words(hex);
      var len = w.length > 1 ? Number(w[1]) : 0;
      var ids = w.slice(2, 2 + len).map(function (x) { return Number(x); });
      $("mk-listed").textContent = ids.length.toLocaleString("en-US");
      var grid = $("mkt-grid");
      grid.innerHTML = "";
      $("mkt-empty").style.display = ids.length ? "none" : "block";
      if (!ids.length) { $("mk-floor").textContent = "·"; return; }
      var floor = null;
      var pending = ids.length;
      ids.forEach(function (id) {
        R.call(N.market, N.sel.listingOf + R.padNum(id)).then(function (lh) {
          var lw = R.words(lh);
          var seller = "0x" + lh.slice(26, 66);
          var price = lw[1];
          if (floor === null || price < floor) floor = price;
          $("mk-floor").textContent = fmtBnb(floor);
          var card = document.createElement("div");
          card.className = "mkt-card";
          var mine = account && seller.toLowerCase() === account.toLowerCase();
          card.innerHTML =
            '<img src="' + imgFor(id) + '" alt="AgentNova #' + id + '" onerror="this.src=\'art/unrevealed.svg\'"/>' +
            '<div class="mc-body"><div class="mc-id">Nova #' + id + '</div>' +
            '<div class="mc-price">' + fmtBnb(price) + '</div>' +
            (mine
              ? '<button class="mkt-btn ghost" data-act="delist" data-id="' + id + '">' + L("st.delist") + '</button>'
              : '<button class="mkt-btn" data-act="buy" data-id="' + id + '" data-price="' + price.toString() + '">' + L("st.buyfor", { p: fmtBnb(price) }) + '</button>') +
            '</div>';
          grid.appendChild(card);
        }).catch(function () {}).finally(function () { pending--; });
      });
      grid.onclick = function (e) {
        var b = e.target.closest("button[data-act]");
        if (!b || busy) return;
        var id = Number(b.getAttribute("data-id"));
        if (b.getAttribute("data-act") === "buy") doBuy(id, BigInt(b.getAttribute("data-price")), b);
        else doDelist(id, b);
      };
    }).catch(function () { status(L("st.readfail"), true); });
  }

  async function ensureWallet() {
    if (!window.ethereum) { status(L("st.nowallet"), true); return false; }
    if (signer) return true;
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      var net = await provider.getNetwork();
      if (Number(net.chainId) !== 56) {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
        provider = new ethers.BrowserProvider(window.ethereum);
      }
      signer = await provider.getSigner();
      account = await signer.getAddress();
      $("wallet-line").textContent = account.slice(0, 6) + "…" + account.slice(-4);
      $("connect-btn").textContent = L("mk.connected");
      return true;
    } catch (e) {
      if (e && e.code === 4001) status(L("st.rejected"));
      else status(L("st.connfail"));
      return false;
    }
  }

  async function doBuy(id, price, btn) {
    if (!(await ensureWallet())) return;
    busy = true; btn.disabled = true; btn.textContent = L("st.confirm");
    try {
      var mkt = new ethers.Contract(N.market, MKT_ABI, signer);
      var tx = await mkt.buy(id, { value: price });
      btn.textContent = L("st.confirming");
      await tx.wait();
      status(L("st.buyok", { id: id }));
      loadListings();
    } catch (e) {
      if (e && e.code === 4001) status(L("st.buyrej"));
      else status(L("st.buyfail"));
    }
    busy = false; btn.disabled = false; btn.textContent = L("st.buyfor", { p: fmtBnb(price) });
  }

  async function doDelist(id, btn) {
    if (!(await ensureWallet())) return;
    busy = true; btn.disabled = true; btn.textContent = L("st.confirm");
    try {
      var mkt = new ethers.Contract(N.market, MKT_ABI, signer);
      var tx = await mkt.delist(id);
      await tx.wait();
      status(L("st.delistok", { id: id }));
      loadListings();
    } catch (e) {
      if (e && e.code === 4001) status(L("st.delistrej"));
      else status(L("st.delistfail"));
    }
    busy = false; btn.disabled = false; btn.textContent = L("st.delist");
  }

  $("connect-btn").addEventListener("click", async function () {
    if (await ensureWallet()) { status(L("st.connected")); loadListings(); }
  });

  $("sell-btn").addEventListener("click", async function () {
    if (busy) return;
    var id = Number($("sell-id").value);
    var priceTxt = ($("sell-price").value || "").trim();
    if (!id || id < 1) { status(L("st.badid")); return; }
    var price;
    try { price = ethers.parseEther(priceTxt); } catch (e) { status(L("st.badprice")); return; }
    if (price <= 0n) { status(L("st.pricepos")); return; }
    if (!(await ensureWallet())) return;
    busy = true;
    var btn = $("sell-btn"); btn.disabled = true;
    try {
      var nft = new ethers.Contract(N.nft, NFT_ABI, signer);
      var owner = await nft.ownerOf(id);
      if (owner.toLowerCase() !== account.toLowerCase()) { status(L("st.notowner", { id: id }), true); busy = false; btn.disabled = false; btn.textContent = L("sell.btn"); return; }
      var approved = await nft.getApproved(id);
      if (approved.toLowerCase() !== N.market.toLowerCase()) {
        btn.textContent = L("st.approveconfirm");
        var atx = await nft.approve(N.market, id);
        await atx.wait();
      }
      btn.textContent = L("st.listconfirm");
      var mkt = new ethers.Contract(N.market, MKT_ABI, signer);
      var ltx = await mkt.list(id, price);
      await ltx.wait();
      status(L("st.listok", { id: id }));
      loadListings();
    } catch (e) {
      if (e && e.code === 4001) status(L("st.listrej"));
      else status(L("st.listfail"));
    }
    busy = false; btn.disabled = false; btn.textContent = L("sell.btn");
  });

  if (window.ethereum) {
    window.ethereum.on && window.ethereum.on("accountsChanged", function () { location.reload(); });
    window.ethereum.on && window.ethereum.on("chainChanged", function () { location.reload(); });
  }

  document.addEventListener("nova:lang", function () {
    if (account) $("connect-btn").textContent = L("mk.connected");
    loadListings();
  });

  loadListings();
  setInterval(loadListings, 45000);
})();
