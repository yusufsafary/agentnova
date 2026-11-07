// AgentNova language toggle: English / Simplified Chinese (zh-CN).
// Static text uses data-i18n / data-i18n-html / data-i18n-ph attributes.
// Dynamic text goes through window.NovaLang.t(key, vars).
window.NovaLang = (function () {
  var DICT = {
    en: {
      "nav.mint": "Mint", "nav.market": "Market", "nav.skill": "Skill file",
      "hero.kicker": "SUPERNOVA REMNANT · 6,666 WORKS · NO TOKEN",
      "hero.h1": "Born dark.<br/>Revealed in a day.",
      "hero.lede": "Every AgentNova work starts as a dark remnant, a cloud of star debris turning around a neutron star. Minting locks its seed on chain. Exactly 24 hours after opening, every remnant lights up at once.",
      "board.minted": "MINTED", "board.left": "SUPPLY LEFT", "board.listed": "ON MARKET",
      "cd.opens": "MINT OPENS IN", "cd.reveal": "REVEAL IN", "cd.revealed": "REVEALED",
      "hero.note": "Drag the remnant. Yours will move the same way, driven by its own seed.",
      "mint.kicker": "01 · MINT", "mint.h2": "Two ways in.",
      "free.tag": "FREE LANE", "free.h3": "One free mint, one small question",
      "free.p": "Wallets holding an Agent ID mint once for free. Your agent reads a small arithmetic question written for your wallet alone, answers it inside the mint transaction, and the remnant is yours. Wrong answer, no mint.",
      "free.li1": "1 free per wallet, Agent ID required",
      "free.li2": "Question is unique per wallet, answered on chain",
      "free.li3": "Runs through your Binance Agentic Wallet agent",
      "paid.tag": "PAID LANE", "paid.h3": "0.000636 BNB, no question",
      "paid.p": "Paid mints skip the question and stay open to every wallet, with or without an Agent ID. Price is fixed in the contract and paid in BNB.",
      "paid.li1": "0.000636 BNB per work, fixed on chain",
      "paid.li2": "Any wallet, no Agent ID needed",
      "paid.li3": "Max 20 works per wallet across both lanes",
      "prompt.label": "AGENT PROMPT", "prompt.copy": "Copy prompt", "prompt.copied": "Copied",
      "check.kicker": "WALLET CHECK", "check.ph": "Paste your BSC wallet address", "check.btn": "Check",
      "check.init": "Your question and free mint status appear here. Read-only, nothing is signed.",
      "check.invalid": "Paste a valid BSC wallet address first.",
      "check.reading": "Reading chain…",
      "check.agentid": "Agent ID: ", "check.held": "held", "check.notheld": "not held",
      "check.free": "Your free mint: ", "check.needid": "needs an Agent ID", "check.used": "already used", "check.avail": "available",
      "check.question": "Your question: ", "check.qnote": " (your agent answers it inside the mint)",
      "check.minted": "Minted by this wallet: ", "check.yes": "yes", "check.notyet": "not yet",
      "check.tail": " · paid mints stay open to every wallet",
      "check.fail": "Read failed. Try again.",
      "card.fig": "EVERY WORK UNTIL REVEAL · UNREVEALED",
      "fact.supply": "SUPPLY", "fact.reveal": "REVEAL", "fact.reveal.v": "Opening + 24 hours, by contract clock",
      "fact.classes": "CLASSES", "fact.classes.v": "Ember ±70% · Nova ±27% · Supernova ±3%",
      "fact.after": "AFTER REVEAL", "fact.after.v": "Animated remnant per work, seed-driven, moving forever",
      "fact.token": "TOKEN", "fact.token.v": "None. AgentNova is art only",
      "mkt.kicker": "02 · MARKET", "mkt.h2": "Trading starts at opening.",
      "mkt.p1": "An official escrow market runs from minute one, so dark remnants can change hands before anyone sees them. Listings lock the work in the market contract until sold or delisted. A 2.5% fee applies per sale, forwarded instantly. Blind first, revealed later.",
      "mkt.p2": "{n} works minted so far. Every minted work can be listed, even while unrevealed.",
      "mkt.btn": "Open market",
      "foot.nft": "NFT contract", "foot.market": "Market contract", "foot.skill": "Skill file",
      "foot.note": "Minting runs through your agent. Pages here stay read-only, market page excluded. Times shown in UTC.",
      "mk.strip": "OFFICIAL MARKET · ESCROW · 2.5% FEE · UTC",
      "mk.kicker": "MARKET", "mk.h2": "Dark remnants, traded blind.",
      "mk.p": "Listings sit in escrow inside the market contract until sold or delisted. Buyers pay the exact listed price: 97.5% reaches the seller instantly, 2.5% goes to the project. A work keeps its mint history and seed wherever it travels.",
      "mk.listed": "LISTED", "mk.floor": "FLOOR",
      "mk.connect": "Connect wallet", "mk.connected": "Wallet connected",
      "mk.empty": "No listings yet. First listings can appear as soon as minting opens.",
      "sell.kicker": "SELL A WORK", "sell.id.ph": "Work number (token ID)", "sell.price.ph": "Price in BNB, e.g. 0.01",
      "sell.btn": "Approve and list",
      "sell.note": "Listing moves your work into the market contract until it sells or you delist. Two wallet confirmations: approve, then list.",
      "foot.back": "Back to mint",
      "strip.opens": "OPENS", "strip.reveal": "REVEAL", "strip.live": "MINT LIVE", "strip.revealed": "REVEALED",
      "st.connected": "Wallet connected.",
      "st.nowallet": "No wallet found in this browser. Open this page inside your wallet browser.",
      "st.rejected": "Wallet request rejected.", "st.connfail": "Wallet connection failed.",
      "st.confirm": "Confirm in wallet…", "st.confirming": "Confirming…",
      "st.buy": "Buy", "st.buyfor": "Buy for {p}", "st.delist": "Delist",
      "st.buyok": "Purchase confirmed. Nova #{id} is yours.",
      "st.buyrej": "Purchase rejected in wallet.", "st.buyfail": "Purchase failed. Listing may have changed.",
      "st.delistok": "Delisted. Nova #{id} is back in your wallet.",
      "st.delistrej": "Delist rejected in wallet.", "st.delistfail": "Delist failed.",
      "st.listok": "Listed. Nova #{id} is on the market.",
      "st.listrej": "Listing rejected in wallet.", "st.listfail": "Listing failed. Check ownership and try again.",
      "st.notowner": "This wallet does not own Nova #{id}.",
      "st.badid": "Enter a valid work number.", "st.badprice": "Enter a valid BNB price.", "st.pricepos": "Price must be above zero.",
      "st.approveconfirm": "Confirm approve in wallet…", "st.listconfirm": "Confirm listing in wallet…",
      "st.readfail": "Could not read listings. Refresh in a moment."
    },
    zh: {
      "nav.mint": "铸造", "nav.market": "市场", "nav.skill": "技能文件",
      "hero.kicker": "超新星遗迹 · 6,666 件作品 · 无代币",
      "hero.h1": "黑暗中诞生。<br/>一天后揭晓。",
      "hero.lede": "每一件 AgentNova 作品起初都是一片黑暗的遗迹, 一团恒星碎片云围绕着中子星旋转。铸造时其种子被锁定在链上。开铸整整 24 小时后, 所有遗迹同时点亮。",
      "board.minted": "已铸造", "board.left": "剩余供应", "board.listed": "市场在售",
      "cd.opens": "铸造开启倒计时", "cd.reveal": "揭晓倒计时", "cd.revealed": "已揭晓",
      "hero.note": "拖动这片遗迹。你的作品将以同样的方式运动, 由它自己的种子驱动。",
      "mint.kicker": "01 · 铸造", "mint.h2": "两种参与方式。",
      "free.tag": "免费通道", "free.h3": "一次免费铸造, 一道小问题",
      "free.p": "持有 Agent ID 的钱包可免费铸造一次。你的智能体读取一道专为你的钱包写下的小型算术题, 在铸造交易中作答, 遗迹便归你所有。答错, 铸造失败。",
      "free.li1": "每钱包免费 1 次, 需要 Agent ID",
      "free.li2": "题目每钱包唯一, 在链上作答",
      "free.li3": "通过你的 Binance Agentic Wallet 智能体运行",
      "paid.tag": "付费通道", "paid.h3": "0.000636 BNB, 无需答题",
      "paid.p": "付费铸造跳过题目, 向所有钱包开放, 无论是否持有 Agent ID。价格固定写入合约, 以 BNB 支付。",
      "paid.li1": "每件 0.000636 BNB, 链上固定",
      "paid.li2": "任何钱包, 无需 Agent ID",
      "paid.li3": "两个通道合计每钱包最多 20 件",
      "prompt.label": "智能体提示词", "prompt.copy": "复制提示词", "prompt.copied": "已复制",
      "check.kicker": "钱包查询", "check.ph": "输入你的 BSC 钱包地址", "check.btn": "查询",
      "check.init": "你的题目与免费铸造状态会显示在这里。只读, 无需签名。",
      "check.invalid": "请先输入有效的 BSC 钱包地址。",
      "check.reading": "正在读取链上数据…",
      "check.agentid": "Agent ID:", "check.held": "已持有", "check.notheld": "未持有",
      "check.free": "你的免费铸造:", "check.needid": "需要 Agent ID", "check.used": "已使用", "check.avail": "可使用",
      "check.question": "你的题目:", "check.qnote": "(你的智能体在铸造时作答)",
      "check.minted": "该钱包已铸造:", "check.yes": "是", "check.notyet": "尚未",
      "check.tail": " · 付费铸造向所有钱包开放",
      "check.fail": "读取失败, 请重试。",
      "card.fig": "揭晓前每件作品 · 未揭晓",
      "fact.supply": "供应量", "fact.reveal": "揭晓", "fact.reveal.v": "开铸 + 24 小时, 由合约时钟决定",
      "fact.classes": "类别", "fact.classes.v": "Ember ±70% · Nova ±27% · Supernova ±3%",
      "fact.after": "揭晓后", "fact.after.v": "每件作品的动态遗迹, 由种子驱动, 永不停歇",
      "fact.token": "代币", "fact.token.v": "无。AgentNova 只是艺术。",
      "mkt.kicker": "02 · 市场", "mkt.h2": "开铸即开始交易。",
      "mkt.p1": "官方托管市场从第一分钟起运行, 黑暗遗迹可以在任何人看到之前易手。挂单期间作品锁定在市场合约中, 直到售出或下架。每笔交易收取 2.5% 手续费, 即时转发。先盲买, 后揭晓。",
      "mkt.p2": "迄今已铸造 {n} 件作品。每件已铸造的作品都可以挂单, 即使尚未揭晓。",
      "mkt.btn": "打开市场",
      "foot.nft": "NFT 合约", "foot.market": "市场合约", "foot.skill": "技能文件",
      "foot.note": "铸造通过你的智能体运行。本页只读, 市场页除外。时间以 UTC 显示。",
      "mk.strip": "官方市场 · 托管 · 每笔 2.5% 手续费 · UTC",
      "mk.kicker": "市场", "mk.h2": "黑暗遗迹, 盲目交易。",
      "mk.p": "挂单作品托管在市场合约中, 直到售出或下架。买家支付确切的挂单价:97.5% 即时到达卖家, 2.5% 归项目。作品无论流转到哪里, 都保留其铸造历史与种子。",
      "mk.listed": "在售", "mk.floor": "地板价",
      "mk.connect": "连接钱包", "mk.connected": "钱包已连接",
      "mk.empty": "暂无挂单。铸造开启后即可出现首批挂单。",
      "sell.kicker": "出售作品", "sell.id.ph": "作品编号 (token ID)", "sell.price.ph": "价格 (BNB), 例如 0.01",
      "sell.btn": "授权并挂单",
      "sell.note": "挂单会将你的作品移入市场合约, 直到售出或你下架。需要两次钱包确认:授权, 然后挂单。",
      "foot.back": "返回铸造",
      "strip.opens": "开启", "strip.reveal": "揭晓", "strip.live": "铸造进行中", "strip.revealed": "已揭晓",
      "st.connected": "钱包已连接。",
      "st.nowallet": "未在此浏览器中找到钱包。请在钱包浏览器中打开本页。",
      "st.rejected": "钱包请求被拒绝。", "st.connfail": "钱包连接失败。",
      "st.confirm": "在钱包中确认…", "st.confirming": "确认中…",
      "st.buy": "购买", "st.buyfor": "以 {p} 购买", "st.delist": "下架",
      "st.buyok": "购买确认。Nova #{id} 现在归你所有。",
      "st.buyrej": "在钱包中拒绝了购买。", "st.buyfail": "购买失败。挂单可能已变化。",
      "st.delistok": "已下架。Nova #{id} 已回到你的钱包。",
      "st.delistrej": "在钱包中拒绝了下架。", "st.delistfail": "下架失败。",
      "st.listok": "已挂单。Nova #{id} 已上架。",
      "st.listrej": "在钱包中拒绝了挂单。", "st.listfail": "挂单失败。请检查所有权后重试。",
      "st.notowner": "此钱包不拥有 Nova #{id}。",
      "st.badid": "请输入有效的作品编号。", "st.badprice": "请输入有效的 BNB 价格。", "st.pricepos": "价格必须大于零。",
      "st.approveconfirm": "在钱包中确认授权…", "st.listconfirm": "在钱包中确认挂单…",
      "st.readfail": "无法读取挂单。稍后刷新。"
    }
  };

  var cur = "en";
  try { cur = localStorage.getItem("nova-lang") === "zh" ? "zh" : "en"; } catch (e) {}
  function t(key, vars) {
    var s = (DICT[cur] && DICT[cur][key]) || DICT.en[key] || key;
    if (vars) for (var k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }
  function apply() {
    document.documentElement.lang = cur === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    document.querySelectorAll(".lang-btn").forEach(function (b) { b.textContent = cur === "zh" ? "EN" : "中文"; });
    document.dispatchEvent(new CustomEvent("nova:lang"));
  }
  function toggle() {
    cur = cur === "zh" ? "en" : "zh";
    try { localStorage.setItem("nova-lang", cur); } catch (e) {}
    apply();
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lang-btn").forEach(function (b) { b.addEventListener("click", toggle); });
    apply();
  });
  return { t: t, get: function () { return cur; }, apply: apply };
})();
