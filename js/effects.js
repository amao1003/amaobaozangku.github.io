/* ==========================================================================
   背景简约动态线条 + 点击空白「雪花绽放」
   --------------------------------------------------------------------------
   · 纯 Canvas 实现，不依赖任何库，不影响 js/app.js 的渲染与交互
   · 两个特效层：背景线条（持续、极淡、缓慢）、雪花（只在点击空白时出现）
   · 自动跟随浅色 / 深色模式；高分屏按 DPR 渲染，不会模糊
   · 页面切到后台暂停绘制，尊重系统「减少动态效果」设置

   ★ 开关：在 index.html 里改 window.AXU_FX 即可，不用动本文件。
       window.AXU_FX = { lines: false }   // 关掉背景线条
       window.AXU_FX = { snow: false }    // 关掉点击雪花
       window.AXU_FX = { lineCount: 2 }   // 线条少一点
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- 1. 配置 ---------------- */
  var DEFAULTS = {
    lines: true,        // 背景动态线条
    snow: true,         // 点击空白雪花绽放
    lineCount: 4,       // 线条数量（建议 2~6）
    lineAlpha: 1,       // 线条浓度倍率（0~1，0 等于关闭）
    snowSize: 1,        // 雪花大小倍率
    maxBursts: 6        // 同屏最多几朵雪花，防止连点卡顿
  };
  var CFG = {};
  function merge(o) { if (o && typeof o === 'object') for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) CFG[k] = o[k]; }
  merge(DEFAULTS);
  merge(window.AXU_FX);   // 用户在 index.html 里写的开关，优先级最高

  var TAU = Math.PI * 2;
  var PI3 = Math.PI / 3;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  /* 两种主题下的配色，与原站 --link-hover 同一色系 */
  var LIGHT = {
    line: [100, 149, 237], lineA: 0.16,
    dot: [100, 149, 237], dotA: 0.5,
    snow: [100, 149, 237], glow: [100, 149, 237]
  };
  var DARK = {
    line: [127, 169, 245], lineA: 0.21,
    dot: [168, 200, 255], dotA: 0.58,
    snow: [162, 199, 255], glow: [127, 169, 245]
  };
  function pal() { return document.documentElement.classList.contains('dark-mode') ? DARK : LIGHT; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)) + ')'; }

  /* ---------------- 2. 画布初始化 ---------------- */
  var lineCv = document.getElementById('fxLines');
  var snowCv = document.getElementById('fxSnow');
  if (!lineCv || !snowCv) return;
  var lctx = lineCv.getContext('2d');
  var sctx = snowCv.getContext('2d');
  if (!lctx || !sctx) return;

  var W = 0, H = 0, DPR = 1;

  function fit(cv, ctx) {
    var r = cv.getBoundingClientRect();
    var w = Math.max(1, r.width), h = Math.max(1, r.height);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * DPR);
    cv.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = w; H = h;
  }
  function fitAll() {
    fit(lineCv, lctx);
    fit(snowCv, sctx);
    if (CFG.lines) drawLines(performance.now(), true);
  }

  /* ---------------- 3. 背景线条 ---------------- */
  var mouse = { nx: 0, ny: 0 };
  var lines = [];

  function buildLines() {
    var n = Math.max(1, Math.min(6, Number(CFG.lineCount) || 4));
    if (coarse) n = Math.min(n, 2);
    var ys = [0.17, 0.39, 0.63, 0.84, 0.28, 0.73];
    lines = [];
    for (var i = 0; i < n; i++) {
      lines.push({
        y: ys[i % ys.length],
        amp: 14 + i * 6,
        speed: 0.10 + i * 0.028,
        phase: i * 1.7,
        alpha: (i === 1 || i === 3) ? 0.62 : 1,
        dotSpeed: 0.018 + i * 0.009,
        dotPhase: (i * 0.27) % 1
      });
    }
  }

  function cubic(p0, p1, p2, p3, u) {
    var v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return {
      x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
      y: a * p0.y + b * p1.y + c * p2.y + d * p3.y
    };
  }

  function drawLines(now, force) {
    var p = pal();
    var aScale = Math.max(0, Math.min(1, Number(CFG.lineAlpha))) || 0;
    lctx.clearRect(0, 0, W, H);
    if (!aScale) return;

    var t = reduceMotion ? 0 : now / 1000;
    var mx = reduceMotion ? 0 : mouse.nx * 14;
    var my = reduceMotion ? 0 : mouse.ny * 9;

    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      var y0 = H * L.y + Math.sin(t * L.speed + L.phase) * L.amp + my;
      var sway = Math.sin(t * L.speed * 0.74 + L.phase * 1.6) * L.amp * 1.8;
      var p0 = { x: -70 + mx, y: y0 };
      var p1 = { x: W * 0.28 + mx, y: y0 + sway };
      var p2 = { x: W * 0.70 + mx, y: y0 - sway };
      var p3 = { x: W + 70 + mx, y: y0 + sway * 0.32 };

      var g = lctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, rgba(p.line, 0));
      g.addColorStop(0.20, rgba(p.line, p.lineA * L.alpha * aScale));
      g.addColorStop(0.62, rgba(p.line, p.lineA * L.alpha * aScale * 0.78));
      g.addColorStop(1, rgba(p.line, 0));
      lctx.strokeStyle = g;
      lctx.lineWidth = 1;
      lctx.beginPath();
      lctx.moveTo(p0.x, p0.y);
      lctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      lctx.stroke();

      // 沿线缓慢滑行的一个小光点，让「动态」更克制
      var u = reduceMotion ? (L.dotPhase + 0.25) % 1 : (t * L.dotSpeed + L.dotPhase) % 1;
      var q = cubic(p0, p1, p2, p3, u);
      lctx.fillStyle = rgba(p.dot, p.dotA * L.alpha * aScale);
      lctx.beginPath();
      lctx.arc(q.x, q.y, 1.7, 0, TAU);
      lctx.fill();
    }
  }

  /* ---------------- 4. 点击空白：雪花绽放 ---------------- */
  var bursts = [];

  /* 这些元素（及其内部）都不算「页面空白处」 */
  var SKIP = 'a,button,input,textarea,select,option,label,summary,[contenteditable],[role="button"],' +
             '#sidebar,#noteTip,.rs-panel,.modal-mask,.forkit,.darkmode-toggle,#backTop,.topSerach,.button';

  function isBlankClick(e) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return false;
    // 搜索面板 / 说明弹窗打开时，任何点击都不算空白
    if (document.querySelector('.rs-panel.is-open, .modal-mask.is-open')) return false;
    // 正在拖选文字，不打断
    try {
      var sel = window.getSelection && String(window.getSelection());
      if (sel && sel.trim()) return false;
    } catch (err) {}
    var t = e.target;
    if (!t || t.nodeType !== 1) return true;                       // 文本节点等
    if (t === document.body || t === document.documentElement) return true;
    if (t.closest && t.closest(SKIP)) return false;
    // 元素自身直接带可见文字 → 是内容，不是空白
    for (var i = 0; i < t.childNodes.length; i++) {
      var n = t.childNodes[i];
      if (n.nodeType === 3 && n.textContent && n.textContent.trim()) return false;
    }
    return true;
  }

  function spawnBurst(x, y) {
    var size = Math.max(0.5, Math.min(2, Number(CFG.snowSize) || 1));
    var particles = [];
    var count = reduceMotion ? 6 : 12;
    for (var i = 0; i < count; i++) {
      particles.push({
        a: (i / count) * TAU + (Math.random() - 0.5) * 0.34,
        v: 66 + Math.random() * 78,
        s: 2.4 + Math.random() * 2.8
      });
    }
    bursts.push({
      x: x, y: y,
      t0: performance.now(),
      dur: reduceMotion ? 620 : 1080,
      r: (50 + Math.random() * 14) * size,
      rot: Math.random() * PI3,
      particles: particles
    });
    var max = Math.max(1, Number(CFG.maxBursts) || 6);
    while (bursts.length > max) bursts.shift();
    ensureLoop();
  }

  function drawSnow(now) {
    sctx.clearRect(0, 0, W, H);
    var p = pal();

    for (var i = bursts.length - 1; i >= 0; i--) {
      var b = bursts[i];
      var q = (now - b.t0) / b.dur;
      if (q >= 1) { bursts.splice(i, 1); continue; }

      var grow = 1 - Math.pow(1 - q, 3);                 // 生长缓出
      var alpha = q < 0.55 ? 1 : 1 - (q - 0.55) / 0.45; // 后段淡出
      alpha = Math.max(0, alpha) * 0.92;
      var R = b.r * (0.3 + grow * 0.8);

      // 中心柔光
      var glowR = R * 1.25;
      var g = sctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, glowR);
      g.addColorStop(0, rgba(p.glow, 0.28 * alpha));
      g.addColorStop(1, rgba(p.glow, 0));
      sctx.fillStyle = g;
      sctx.beginPath();
      sctx.arc(b.x, b.y, glowR, 0, TAU);
      sctx.fill();

      // 一圈快速扩散后消失的细光环，强化「绽放」瞬间
      if (q < 0.5) {
        sctx.strokeStyle = rgba(p.snow, (1 - q / 0.5) * 0.38 * alpha);
        sctx.lineWidth = 1;
        sctx.beginPath();
        sctx.arc(b.x, b.y, R * (0.4 + q * 1.5), 0, TAU);
        sctx.stroke();
      }

      // 六臂雪花：主干 + 两级对称分枝
      sctx.save();
      sctx.translate(b.x, b.y);
      sctx.rotate(b.rot + q * 0.32);
      sctx.strokeStyle = rgba(p.snow, alpha);
      sctx.lineWidth = 1.35;
      sctx.lineCap = 'round';
      sctx.beginPath();
      for (var k = 0; k < 6; k++) {
        var ang = k * PI3;
        var ca = Math.cos(ang), sa = Math.sin(ang);
        var L = R * grow;
        sctx.moveTo(0, 0);
        sctx.lineTo(ca * L, sa * L);
        for (var j = 0; j < 2; j++) {
          var frac = j === 0 ? 0.5 : 0.78;
          var bx = ca * L * frac, by = sa * L * frac;
          var bl = R * (j === 0 ? 0.26 : 0.17) * Math.max(0, Math.min(1, (grow - frac) / 0.3));
          for (var s = -1; s <= 1; s += 2) {
            var ba = ang + s * (Math.PI / 4);
            sctx.moveTo(bx, by);
            sctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl);
          }
        }
      }
      sctx.stroke();
      // 中心小六角
      sctx.beginPath();
      for (var m = 0; m < 6; m++) {
        var a2 = m * PI3;
        var px = Math.cos(a2) * 3.2, py = Math.sin(a2) * 3.2;
        if (m === 0) sctx.moveTo(px, py); else sctx.lineTo(px, py);
      }
      sctx.closePath();
      sctx.fillStyle = rgba(p.snow, alpha * 0.85);
      sctx.fill();
      sctx.restore();

      // 四散的小冰晶
      sctx.strokeStyle = rgba(p.snow, alpha * 0.75);
      sctx.lineWidth = 1;
      sctx.beginPath();
      for (var n = 0; n < b.particles.length; n++) {
        var pt = b.particles[n];
        var d = pt.v * (b.dur / 1000) * q * (1 - 0.32 * q);
        var xx = b.x + Math.cos(pt.a) * d;
        var yy = b.y + Math.sin(pt.a) * d + 13 * q * q;
        var ss = pt.s * (1 - q * 0.45) * (b.r / 46);
        sctx.moveTo(xx - ss, yy); sctx.lineTo(xx + ss, yy);
        sctx.moveTo(xx, yy - ss); sctx.lineTo(xx, yy + ss);
      }
      sctx.stroke();
    }
  }

  /* ---------------- 5. 统一动画循环 ---------------- */
  var running = false;
  var lastLine = 0;
  function ensureLoop() { if (!running) { running = true; requestAnimationFrame(frame); } }

  function frame(now) {
    var needLines = !!CFG.lines && !reduceMotion;
    if (!needLines && !bursts.length) { running = false; return; }
    if (!document.hidden) {
      if (needLines && now - lastLine >= 32) { drawLines(now); lastLine = now; } // 线条 ~30fps 足够
      if (bursts.length) drawSnow(now);
    } else if (bursts.length) {
      // 切到后台时不绘制，但把雪花时间轴推进，回来不会卡住一堆旧动画
      for (var i = bursts.length - 1; i >= 0; i--) if (now - bursts[i].t0 > bursts[i].dur) bursts.splice(i, 1);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- 6. 事件绑定 ---------------- */
  document.addEventListener('click', function (e) {
    if (!CFG.snow) return;
    if (!isBlankClick(e)) return;
    var r = snowCv.getBoundingClientRect();
    spawnBurst(e.clientX - r.left, e.clientY - r.top);
  }, true);   // 捕获阶段：即使某个元素 stopPropagation，空白处依然有反馈

  window.addEventListener('mousemove', function (e) {
    mouse.nx = (e.clientX / Math.max(1, window.innerWidth)) - 0.5;
    mouse.ny = (e.clientY / Math.max(1, window.innerHeight)) - 0.5;
  }, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(fitAll, 120);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && CFG.lines) { lastLine = 0; ensureLoop(); }
  });

  /* ---------------- 7. 启动 ---------------- */
  buildLines();
  fitAll();
  if (CFG.lines && !reduceMotion) ensureLoop();
  // 减少动态效果时：只画一帧静态线条，雪花仍可点击但更短更温和
})();
