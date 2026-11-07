(function () {
  var N = window.NOVA, R = window.NovaRead;
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
              ? '<button class="mkt-btn ghost" data-act="delist" data-id="' + id + '">Delist</button>'
              : '<button class="mkt-btn" data-act="buy" data-id="' + id + '" data-price="' + price.toString() + '">Buy for ' + fmtBnb(price) + '</button>') +
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
    }).catch(function () { status("Could not read listings. Refresh in a moment.", true); });
  }

  async function ensureWallet() {
    if (!window.ethereum) { status("No wallet found in this browser. Open this page inside your wallet browser.", true); return false; }
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
      $("connect-btn").textContent = "Wallet connected";
      return true;
    } catch (e) {
      if (e && e.code === 4001) status("Wallet request rejected.");
      else status("Wallet connection failed.");
      return false;
    }
  }

  async function doBuy(id, price, btn) {
    if (!(await ensureWallet())) return;
    busy = true; btn.disabled = true; btn.textContent = "Confirm in wallet…";
    try {
      var mkt = new ethers.Contract(N.market, MKT_ABI, signer);
      var tx = await mkt.buy(id, { value: price });
      btn.textContent = "Confirming…";
      await tx.wait();
      status("Purchase confirmed. Nova #" + id + " is yours.");
      loadListings();
    } catch (e) {
      if (e && e.code === 4001) status("Purchase rejected in wallet.");
      else status("Purchase failed. Listing may have changed.");
    }
    busy = false; btn.disabled = false; btn.textContent = "Buy";
  }

  async function doDelist(id, btn) {
    if (!(await ensureWallet())) return;
    busy = true; btn.disabled = true; btn.textContent = "Confirm in wallet…";
    try {
      var mkt = new ethers.Contract(N.market, MKT_ABI, signer);
      var tx = await mkt.delist(id);
      await tx.wait();
      status("Delisted. Nova #" + id + " is back in your wallet.");
      loadListings();
    } catch (e) {
      if (e && e.code === 4001) status("Delist rejected in wallet.");
      else status("Delist failed.");
    }
    busy = false; btn.disabled = false; btn.textContent = "Delist";
  }

  $("connect-btn").addEventListener("click", async function () {
    if (await ensureWallet()) { status("Wallet connected."); loadListings(); }
  });

  $("sell-btn").addEventListener("click", async function () {
    if (busy) return;
    var id = Number($("sell-id").value);
    var priceTxt = ($("sell-price").value || "").trim();
    if (!id || id < 1) { status("Enter a valid work number."); return; }
    var price;
    try { price = ethers.parseEther(priceTxt); } catch (e) { status("Enter a valid BNB price."); return; }
    if (price <= 0n) { status("Price must be above zero."); return; }
    if (!(await ensureWallet())) return;
    busy = true;
    var btn = $("sell-btn"); btn.disabled = true;
    try {
      var nft = new ethers.Contract(N.nft, NFT_ABI, signer);
      var owner = await nft.ownerOf(id);
      if (owner.toLowerCase() !== account.toLowerCase()) { status("This wallet does not own Nova #" + id + ".", true); busy = false; btn.disabled = false; return; }
      var approved = await nft.getApproved(id);
      if (approved.toLowerCase() !== N.market.toLowerCase()) {
        btn.textContent = "Confirm approve in wallet…";
        var atx = await nft.approve(N.market, id);
        await atx.wait();
      }
      btn.textContent = "Confirm listing in wallet…";
      var mkt = new ethers.Contract(N.market, MKT_ABI, signer);
      var ltx = await mkt.list(id, price);
      await ltx.wait();
      status("Listed. Nova #" + id + " is on the market.");
      loadListings();
    } catch (e) {
      if (e && e.code === 4001) status("Listing rejected in wallet.");
      else status("Listing failed. Check ownership and try again.");
    }
    busy = false; btn.disabled = false; btn.textContent = "Approve and list";
  });

  if (window.ethereum) {
    window.ethereum.on && window.ethereum.on("accountsChanged", function () { location.reload(); });
    window.ethereum.on && window.ethereum.on("chainChanged", function () { location.reload(); });
  }

  loadListings();
  setInterval(loadListings, 45000);
})();
