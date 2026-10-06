/* ==========================================================================
 * code-rain.js  ——  全站极客风背景：大量代码行从上到下循环滚动
 *
 * 用法：<script src="./code-rain.js"></script>（放在 </body> 前即可）
 * 关闭：地址栏加 ?nocoderain=1   或   localStorage.setItem('coderain','off')
 * 说明：自动接管并隐藏原有的 #canvas 粒子背景层，不改动页面其它内容与功能。
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- 开关 ---------- */
  if (location.search.indexOf('nocoderain=1') !== -1) return;
  try { if (localStorage.getItem('coderain') === 'off') return; } catch (e) {}

  /* ---------- 可调参数 ---------- */
  var CONFIG = {
    fontSize: 13,          // 字号
    lineHeight: 21,        // 行高（越小行越密）
    speed: 0.30,           // 滚动速度：像素/帧（以 60fps 为基准）
    gutter: 52,            // 行号栏宽度，0 表示不显示行号
    indentUnit: 2,         // 随机缩进单位（空格数）
    blankRatio: 0.10,      // 空行比例，增强真实感
    alphaMin: 0.18,        // 行最小不透明度
    alphaMax: 0.50,        // 行最大不透明度
    centerFade: 0.55,      // 中心内容区柔化程度（0=关闭）：让文字/logo 更突出
    hideOldCanvas: false,  // 是否隐藏原有 #canvas 粒子背景（false = 粒子与代码雨共存）
    fadeTop: 60,           // 顶部淡入距离
    fadeBottom: 90,        // 底部淡出距离
    activeCount: 2,        // 同时高亮的行数
    fontFamily: '"JetBrains Mono","Fira Code","SFMono-Regular",Consolas,Monaco,"Courier New",monospace'
  };

  var C = {
    def: '#8fa8c8',   // 普通标识符
    kw:  '#64ffda',   // 关键字（站点主色青绿）
    str: '#7ee787',   // 字符串
    com: '#4a6285',   // 注释
    num: '#ffb86c',   // 数字
    fn:  '#82aaff',   // 函数名
    pun: '#63799c',   // 标点
    ln:  '#3d5170'    // 行号
  };

  /* ---------- 代码素材（真实感代码片段） ---------- */
  var SNIPPETS = [
    'const canvas = document.getElementById("canvas");',
    'const ctx = canvas.getContext("2d");  // 2d 上下文',
    'if (!ctx) throw new Error("2d context unavailable");',
    'requestAnimationFrame(() => this.render(timestamp));',
    'let particles = Array.from({ length: 120 }, () => new Particle());',
    'return list.filter(x => x.score > 0.75).sort((a, b) => b.score - a.score);',
    'window.addEventListener("resize", debounce(handleResize, 120));',
    'const hash = crypto.createHash("sha256").update(buf).digest("hex");',
    'for (let i = 0; i < buffer.length; i += 4) { checksum += buffer[i]; }',
    'const [health, config] = await Promise.all([ping(), loadConfig()]);',
    'if (err.code === "ENOENT") return fallback(path.join(root, "index.html"));',
    'export default class CodeRain { constructor(options = {}) { this.init(options); } }',
    'await fetch("/api/posts?page=" + page, { headers: { "X-Token": token } });',
    'const state = Object.freeze({ loading: false, error: null, data: [] });',
    'try { await fs.writeFile(out, JSON.stringify(data, null, 2)); } catch (e) { log(e); }',
    '// TODO: 把这段抽成纯函数，方便单测覆盖',
    '/* 时间复杂度 O(n log n)，空间复杂度 O(n) */',
    'def train_model(dataset, epochs=100, lr=1e-3, device="cuda"):',
    'self.optimizer.zero_grad(set_to_none=True)',
    'for epoch in range(epochs):  # 训练主循环',
    'loss.backward(); optimizer.step(); scheduler.step()',
    'import numpy as np  # shape: (batch, seq_len, hidden_size)',
    'with open("config.yaml", "r", encoding="utf-8") as f:',
    'return {k: v for k, v in payload.items() if v is not None}',
    'df.groupby("category")["amount"].agg(["sum", "mean"]).round(2)',
    'model = torch.compile(model, mode="max-autotune")',
    'print(f"epoch {epoch:03d}  loss={loss:.4f}  acc={acc:.2%}")',
    '# 注意：这里必须先做空值判断，否则会抛 AttributeError',
    'std::vector<int> dp(n + 1, 0);',
    'for (int i = 1; i <= n; ++i) dp[i] = std::max(dp[i], dp[i - 1] + a[i]);',
    'printf("hello, %s! pid=%d\\n", user, getpid());',
    '#include <bits/stdc++.h>',
    'int main(int argc, char **argv) { ios::sync_with_stdio(false); return 0; }',
    'struct Node { int val; Node *next; Node(int v) : val(v), next(nullptr) {} };',
    'auto [min_it, max_it] = std::minmax_element(v.begin(), v.end());',
    'func (s *Server) Handle(w http.ResponseWriter, r *http.Request) {',
    'defer rows.Close()',
    'go func() { results <- compute(ctx, payload) }()',
    'if err := json.NewDecoder(r.Body).Decode(&req); err != nil { return err }',
    'let mut rng = rand::thread_rng();',
    'match stream.read(&mut buf).await { Ok(0) => break, Ok(n) => total += n, Err(e) => return Err(e.into()) }',
    'git commit -m "feat: add code rain background"',
    'git push origin main && git log --oneline -5',
    'sudo systemctl restart nginx && tail -f /var/log/nginx/access.log',
    'docker build -t blog:latest . && docker push registry.local/blog:latest',
    'npm run build && rsync -avz dist/ deploy@server:/var/www/blog/',
    'grep -rn "TODO" src/ | wc -l',
    'ssh -p 22 root@10.0.0.7 "df -h && uptime"',
    'SELECT id, title, created_at FROM posts WHERE draft = 0 ORDER BY created_at DESC LIMIT 10;',
    'UPDATE visits SET count = count + 1 WHERE slug = ?;',
    '.nav-button:hover { background: rgba(100, 255, 218, 0.1); }',
    '@media screen and (max-width: 768px) { .content { padding: 20px; } }',
    'grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));',
    '<section class="hero" data-theme="dark" aria-label="banner">',
    '"dependencies": { "react": "^18.2.0", "vite": "^5.0.0" },',
    'version: "3.9"  services:  web:  image: nginx:alpine  ports: ["80:80"]',
    'location / { try_files $uri $uri/ /index.html; }',
    'server { listen 443 ssl http2; server_name example.com; }',
    'echo "deploy finished at $(date +%F\\ %T)" >> /var/log/deploy.log',
    'curl -sSL https://api.github.com/repos/user/repo | jq ".stargazers_count"',
    'int mid = (left + right) >>> 1;  // 二分，防溢出',
    'while (lo < hi) { int m = lo + (hi - lo) / 2; if (check(m)) hi = m; else lo = m + 1; }',
    'assert response.status == 200, f"unexpected status {response.status}"',
    'const memo = new Map();  // LRU 缓存，命中率约 92%',
    'if (typeof window !== "undefined" && window.matchMedia) { /* browser only */ }'
  ];

  /* ---------- 词法着色 ---------- */
  var KEYWORDS = ('const let var function return if else for while do switch case break continue class new delete typeof ' +
    'instanceof await async try catch finally throw import export from default extends super this null undefined true false ' +
    'def self lambda None True False elif yield with as pass raise global nonlocal public private protected static final ' +
    'void int char float double bool struct enum namespace using template typename sizeof include define endif pragma ' +
    'func defer go chan range match mut impl pub let move box echo sudo apt docker systemctl curl grep awk sed ssh rsync ' +
    'SELECT FROM WHERE ORDER GROUP BY LIMIT INSERT UPDATE DELETE JOIN ON AS DESC ASC print import std max min').split(' ');
  var KW = Object.create(null);
  for (var i = 0; i < KEYWORDS.length; i++) KW[KEYWORDS[i]] = 1;

  var TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;

  var segCache = Object.create(null);

  function tokenize(line) {
    if (segCache[line]) return segCache[line];
    var segs = [];
    var m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(line)) !== null) {
      var text = m[0];
      var color;
      if (m[1]) color = C.com;
      else if (m[2]) color = C.str;
      else if (m[3]) color = C.num;
      else if (m[4]) {
        var next = line.charAt(TOKEN_RE.lastIndex);
        if (KW[text]) color = C.kw;
        else if (next === '(') color = C.fn;
        else if (/^[A-Z][A-Z0-9_]+$/.test(text)) color = C.kw;
        else color = C.def;
      } else if (m[5]) color = C.def;
      else color = C.pun;

      var last = segs[segs.length - 1];
      if (last && last.color === color) last.text += text;   // 同色合并，减少绘制次数
      else segs.push({ text: text, color: color });
    }
    segCache[line] = segs;
    return segs;
  }

  /* ---------- DOM 搭建 ---------- */
  var style = document.createElement('style');
  style.setAttribute('data-code-rain', '');
  style.textContent =
    '#code-rain{position:fixed!important;left:0;top:0;width:100%;height:100%;' +
    'z-index:-1;pointer-events:none;display:block;}';
  (document.head || document.documentElement).appendChild(style);

  var cv = document.createElement('canvas');
  cv.id = 'code-rain';
  document.body.appendChild(cv);   // 放最后：同为 -1 时位于其它背景层之上、所有内容之下
  var ctx = cv.getContext('2d');

  // 接管原有粒子背景（仅隐藏，元素保留，不影响页面其它脚本）
  var oldCanvas = document.getElementById('canvas');
  if (CONFIG.hideOldCanvas && oldCanvas && oldCanvas !== cv) oldCanvas.style.display = 'none';

  /* ---------- 尺寸 ---------- */
  var W = 0, H = 0, dpr = 1, FONT = '';

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.floor(W * dpr);
    cv.height = Math.floor(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    FONT = CONFIG.fontSize + 'px ' + CONFIG.fontFamily;
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    buildCenterFade();
    buildRows();
  }

  // 中心柔化渐变：把屏幕中央（文字 / logo 所在区域）的代码雨擦淡，避免抢主体视觉
  var centerGrad = null;

  function buildCenterFade() {
    if (!CONFIG.centerFade) { centerGrad = null; return; }
    var r = Math.max(W, H) * 0.6;
    var g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, r);
    g.addColorStop(0, 'rgba(0,0,0,' + CONFIG.centerFade + ')');
    g.addColorStop(0.5, 'rgba(0,0,0,' + (CONFIG.centerFade * 0.45).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    centerGrad = g;
  }

  function applyCenterFade() {
    if (!centerGrad) return;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = centerGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- 行 ---------- */
  var rows = [];
  var lineCounter = 1 + Math.floor(Math.random() * 400);

  function randSnippet() {
    return SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
  }

  function resetRow(row) {
    row.blank = Math.random() < CONFIG.blankRatio;
    row.text = row.blank ? '' : randSnippet();
    row.segs = row.blank ? [] : tokenize(row.text);
    row.indent = Math.floor(Math.random() * 4) * CONFIG.indentUnit;
    row.alpha = CONFIG.alphaMin + Math.random() * (CONFIG.alphaMax - CONFIG.alphaMin);
    row.lineNo = lineCounter++;
    row.active = false;
    row.caret = !row.blank && Math.random() < 0.08;
    return row;
  }

  function buildRows() {
    var need = Math.ceil(H / CONFIG.lineHeight) + 4;
    rows = [];
    var startY = -CONFIG.lineHeight * 3;
    for (var i = 0; i < need; i++) {
      var row = { y: startY + i * CONFIG.lineHeight };
      resetRow(row);
      rows.push(row);
    }
    pickActive();
  }

  function pickActive() {
    for (var i = 0; i < rows.length; i++) rows[i].active = false;
    for (var k = 0; k < CONFIG.activeCount; k++) {
      var r = rows[Math.floor(Math.random() * rows.length)];
      if (r && !r.blank) r.active = true;
    }
  }

  /* ---------- 绘制 ---------- */
  function fade(y) {
    var top = y / CONFIG.fadeTop;
    if (top < 0) top = 0;
    if (top > 1) top = 1;
    var bottom = (H - y) / CONFIG.fadeBottom;
    if (bottom < 0) bottom = 0;
    if (bottom > 1) bottom = 1;
    return Math.min(top, bottom);
  }

  function drawRow(row) {
    var a = row.alpha * fade(row.y);
    if (a <= 0.01) return;

    var x = 10 + row.indent * (CONFIG.fontSize * 0.55);

    ctx.globalAlpha = a;

    // 高亮行：左侧亮条 + 淡背景
    if (row.active) {
      ctx.globalAlpha = a * 0.28;
      ctx.fillStyle = C.kw;
      ctx.fillRect(0, row.y - 1, W, CONFIG.lineHeight - 2);
      ctx.globalAlpha = a * 0.9;
      ctx.fillRect(0, row.y - 1, 2, CONFIG.lineHeight - 2);
      ctx.globalAlpha = a;
      ctx.fillStyle = C.kw;
    }

    // 行号
    if (CONFIG.gutter) {
      ctx.fillStyle = C.ln;
      var ln = String(row.lineNo);
      ctx.fillText(ln, CONFIG.gutter - 12 - ctx.measureText(ln).width, row.y + 2);
      x += CONFIG.gutter;
    }

    // 代码
    var segs = row.segs;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      ctx.fillStyle = s.color;
      ctx.fillText(s.text, x, row.y + 2);
      x += ctx.measureText(s.text).width;
    }

    // 光标
    if (row.caret && (Date.now() % 1000) < 550) {
      ctx.fillStyle = C.kw;
      ctx.fillRect(x + 1, row.y + 2, 6, CONFIG.fontSize);
    }
  }

  var lastTs = 0;

  function frame(ts) {
    var dt = lastTs ? Math.min(ts - lastTs, 60) : 16.7;
    lastTs = ts;

    ctx.clearRect(0, 0, W, H);
    ctx.font = FONT;
    ctx.textBaseline = 'top';

    var step = CONFIG.speed * (dt / 16.7);
    for (var i = 0; i < rows.length; i++) rows[i].y += step;

    // 最底部的行滚出屏幕后回收到最顶部，形成无缝循环
    var lastRow = rows[rows.length - 1];
    if (lastRow && lastRow.y > H) {
      rows.pop();
      lastRow.y = rows[0].y - CONFIG.lineHeight;
      resetRow(lastRow);
      rows.unshift(lastRow);
    }

    for (var j = 0; j < rows.length; j++) drawRow(rows[j]);

    applyCenterFade();
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  resize();

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  if (reduceMotion) {
    for (var k = 0; k < rows.length; k++) drawRow(rows[k]);
    applyCenterFade();
    ctx.globalAlpha = 1;
  } else {
    requestAnimationFrame(frame);
  }

  // 每隔一段时间换一批高亮行
  setInterval(pickActive, 2400);
})();
