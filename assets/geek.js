/* ============================================================
   GEEK HUD  ·  自动挂载的极客风状态条（纯装饰，不触碰页面已有内容）
   跳过：全屏游戏页 / 后台页（避免遮挡交互区）
   ============================================================ */
(function () {
    "use strict";

    var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var SKIP = ["tank.html", "tcs.html", "admin.html"];
    if (SKIP.indexOf(file) !== -1) return;
    if (document.getElementById("gkHud")) return;

    var NAMES = {
        "index.html": "MAIN_TERMINAL",
        "blog.html": "BLOG_ARCHIVE",
        "gj.html": "TOOL_MATRIX",
        "post.html": "POST_VIEWER",
        "about.html": "PROFILE",
        "games.html": "ARCADE",
        "tvbox.html": "TVBOX_CFG",
        "office2019.html": "OFFICE_DEPLOY",
        "tampermonkey.html": "USERSCRIPT",
        "dh.html": "NAVIGATION",
        "default": "NODE"
    };
    var pageName = NAMES[file] || NAMES["default"];

    function el(tag, cls, txt) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (txt != null) n.textContent = txt;
        return n;
    }

    /* ---------- 顶部状态条 ---------- */
    var hud = el("div", "gk-hud");
    hud.id = "gkHud";

    var left = el("div", "gk-hud-side");
    var dot = el("span", "gk-dot");
    left.appendChild(dot);
    left.appendChild(el("span", "gk-brand", "WWZ.SYS"));
    left.appendChild(el("span", "gk-dim", "//"));
    left.appendChild(el("span", "gk-page", pageName));

    var mid = el("div", "gk-hud-mid");
    mid.appendChild(el("span", "gk-dim", "root@wuwenzhuo:"));
    mid.appendChild(el("span", "gk-path", "~/" + file.replace(".html", "")));
    mid.appendChild(el("span", "gk-caret"));

    var right = el("div", "gk-hud-side gk-right");
    right.appendChild(el("span", "gk-dim", "UPTIME"));
    right.appendChild(el("span", "gk-clock", "--:--:--"));
    right.appendChild(el("span", "gk-dim gk-fps", "FPS --"));

    hud.appendChild(left);
    hud.appendChild(mid);
    hud.appendChild(right);

    /* ---------- 底部状态条 ---------- */
    var bar = el("div", "gk-statusbar");
    bar.id = "gkStatusbar";
    var items = [
        ["SECURE", "ok"],
        ["TLS 1.3", "ok"],
        ["CF-PAGES", "ok"],
        ["BUILD v2", ""],
        ["LAT 24ms", ""]
    ];
    items.forEach(function (it, i) {
        var s = el("span", "gk-stat" + (it[1] === "ok" ? " gk-ok" : ""), it[0]);
        bar.appendChild(s);
        if (i < items.length - 1) bar.appendChild(el("i", "gk-sep"));
    });
    var tip = el("span", "gk-tip", "按下鼠标任意位置产生粒子扰动");
    bar.appendChild(tip);

    /* ---------- 侧边刻度装饰 ---------- */
    var ruler = el("div", "gk-ruler");

    document.body.appendChild(hud);
    document.body.appendChild(bar);
    document.body.appendChild(ruler);

    /* ---------- 实时时钟 / FPS ---------- */
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    var clock = hud.querySelector(".gk-clock");
    var fpsEl = hud.querySelector(".gk-fps");
    function tickClock() {
        var d = new Date();
        clock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    }
    tickClock();
    setInterval(tickClock, 1000);

    var frames = 0, last = performance.now();
    function fpsLoop(now) {
        frames++;
        if (now - last >= 1000) {
            fpsEl.textContent = "FPS " + Math.round((frames * 1000) / (now - last));
            frames = 0;
            last = now;
        }
        requestAnimationFrame(fpsLoop);
    }
    requestAnimationFrame(fpsLoop);
})();
