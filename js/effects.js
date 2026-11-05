/* ==========================================================================
   背景彩色空心星星（不规律跳动） + 点击空白「雪花绽放」
   --------------------------------------------------------------------------
   · 纯 Canvas 实现，不依赖任何库，不影响 js/app.js 的渲染与交互
   · 背景层：十几个不同颜色的空心小星星，各自随机节奏轻轻跃动/闪一下，
     互不同步、此起彼伏；低透明度、无填充，风格克制
   · 交互层：只在点击页面空白处时出现六臂雪花
   · 自动跟随浅色 / 深色模式；高分屏按 DPR 渲染；后台暂停绘制；
     尊重系统「减少动态效果」设置

   ★ 开关：在 index.html 里改 window.AXU_FX 即可，不用动本文件。
       window.AXU_FX = { stars: false }   // 关掉背景星星
       window.AXU_FX = { snow: false }    // 关掉点击雪花
       window.AXU_FX = { starCount: 20 }  // 星星多一点
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- 1. 配置 ---------------- */
  var DEFAULTS = {
    stars: true,        // 背景空心星星
    snow: true,         // 点击空白雪花绽放
    starCount: 14,      // 星星数量（建议 8~24）
    starSize: 1,        // 星星大小倍率
    starAlpha: 1,       // 星星浓度倍率（0~1，0 等于关闭）
    snowSize: 1,        // 雪花大小倍率
    maxBursts: 6        // 同屏最多几朵雪花，防止连点卡顿
  };
  var CFG = {};
  function merge(o) { if (o && typeof o === 'object') for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) CFG[k] = o[k]; }
  merge(DEFAULTS);
  var UX = window.AXU_FX || {};
  merge(UX);   // 用户在 index.html 里写的开关，优先级最高
  // 兼容上一版「线条」的旧键名（万一 index.html 没同步更新）
  if (UX.stars === undefined && UX.lines !== undefined) CFG.stars = UX.lines;
  if (UX.starCount === undefined && UX.lineCount !== undefined) CFG.starCount = Math.max(4, Math.round(Number(UX.lineCount) * 3.5) || 14);
  if (UX.starAlpha === undefined && UX.lineAlpha !== undefined) CFG.starAlpha = UX.lineAlpha;

  var TAU = Math.PI * 2;
  var PI3 = Math.PI / 3;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  /* 两套主题配色：星星是低饱和的多色，雪花沿用原站悬停蓝 */
  var LIGHT = {
    stars: [
      [100, 149, 237],  // 蓝
      [ 88, 176, 174],  // 青
      [128, 178, 112],  // 绿
      [166, 140, 208],  // 紫
      [208, 168,  98],  // 金
      [204, 136, 156]   // 粉
    ],
    starBase: 0.19,
    snow: [100, 149, 237], glow: [100, 149, 237]
  };
  var DARK = {
    stars: [
      [127, 169, 245],
      [110, 205, 200],
      [150, 205, 130],
      [190, 165, 235],
      [232, 192, 120],
      [228, 160, 180]
    ],
    starBase: 0.24,
    snow: [162, 199, 255], glow: [127, 169, 245]
  };
  function pal() { return document.documentElement.classList.contains('dark-mode') ? DARK : LIGHT; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)) + ')'; }

  /* ---------------- 2. 画布初始化 ---------------- */
  var starCv = document.getElementById('fxStars') || document.getElementById('fxLines'); // 后者兼容旧页面
  var snowCv = document.getElementById('fxSnow');
  if (!starCv || !snowCv) return;
  var bctx = starCv.getContext('2d');
  var sctx = snowCv.getContext('2d');
  if (!bctx || !sctx) return;

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
    fit(starCv, bctx);
    fit(snowCv, sctx);
    if (CFG.stars) drawStars(performance.now());
  }

  /* ---------------- 3. 背景：不规律跳动的空心星星 ---------------- */
  var mouse = { nx: 0, ny: 0 };
  var stars = [];

  function buildStars() {
    var n = Math.max(1, Math.min(40, Number(CFG.starCount) || 14));
    if (coarse) n = Math.max(1, Math.ceil(n / 2));
    var size = Math.max(0.5, Math.min(2.5, Number(CFG.starSize) || 1));
    var colors = LIGHT.stars.length;
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        px: 0.04 + Math.random() * 0.92,      // 位置按视口比例存，resize 不会挤成一团
        py: 0.05 + Math.random() * 0.90,
        r: (4.4 + Math.random() * 5.0) * size,
        colorIdx: i % colors,                 // 轮流取色，保证「不同色彩」且分布均匀
        alpha: 0.72 + Math.random() * 0.5,
        phase: Math.random() * TAU,
        sp1: 0.22 + Math.random() * 0.5,      // 两个不同频率叠加 → 漂浮不规律
        sp2: 0.12 + Math.random() * 0.34,
        amp: 3 + Math.random() * 7,
        rot: Math.random() * TAU,
        rotSp: (Math.random() - 0.5) * 0.16,
        points: Math.random() < 0.88 ? 5 : 4,  // 以空心五角星为主，少量四芒星
        nextBeat: 0.3 + Math.random() * 3.6,   // 各自独立的下一次「跳动」时刻
        beatAt: -100,
        beatDur: 0.38 + Math.random() * 0.3
      });
    }
  }

  /* 只描边不填充 = 空心星星；5 角星 10 个顶点，4 芒星 8 个顶点 */
  function starPath(ctx, x, y, r, points, rot) {
    var n = points === 4 ? 8 : 10;
    var inner = points === 4 ? 0.18 : 0.44;
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var rad = (i % 2 === 0) ? r : r * inner;
      var a = rot - Math.PI / 2 + i * TAU / n;
      var xx = x + Math.cos(a) * rad, yy = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  function drawStars(now) {
    var p = pal();
    var aScale = Number(CFG.starAlpha);
    aScale = isNaN(aScale) ? 1 : Math.max(0, Math.min(1, aScale));
    bctx.clearRect(0, 0, W, H);
    if (!aScale) return;

    var t = reduceMotion ? 0 : now / 1000;
    var mx = reduceMotion ? 0 : mouse.nx * 12;
    var my = reduceMotion ? 0 : mouse.ny * 9;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // 到点就轻轻「跳」一下，然后随机安排下一次，所以彼此从不同步
      var pulse = 0;
      if (!reduceMotion) {
        if (t >= s.nextBeat) {
          s.beatAt = t;
          s.nextBeat = t + 1.5 + Math.random() * 4.2;
        }
        var bp = (t - s.beatAt) / s.beatDur;
        if (bp >= 0 && bp < 1) pulse = (1 - bp) * (bp < 0.16 ? bp / 0.16 : 1);
      }

      var x = W * s.px
            + Math.sin(t * s.sp1 + s.phase) * s.amp
            + Math.cos(t * s.sp2 * 0.7 + s.phase * 1.3) * s.amp * 0.5
            + mx;
      var y = H * s.py
            + Math.cos(t * s.sp2 + s.phase * 1.7) * s.amp * 0.8
            + Math.sin(t * s.sp1 * 0.6 + s.phase) * s.amp * 0.4
            + my - pulse * 5;
      var r = s.r * (1 + pulse * 0.32);
      var a = Math.min(0.42, p.starBase * s.alpha * (0.85 + pulse * 0.95) * aScale);

      bctx.strokeStyle = rgba(p.stars[s.colorIdx % p.stars.length], a);
      bctx.lineWidth = 1;
      starPath(bctx, x, y, r, s.points, s.rot + (reduceMotion ? 0 : t * s.rotSp));
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
  var lastStar = 0;
  function ensureLoop() { if (!running) { running = true; requestAnimationFrame(frame); } }

  function frame(now) {
    var needStars = !!CFG.stars && !reduceMotion;
    if (!needStars && !bursts.length) { running = false; return; }
    if (!document.hidden) {
      if (needStars && now - lastStar >= 32) { drawStars(now); lastStar = now; } // 背景 ~30fps 足够
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
    if (!document.hidden && CFG.stars) { lastStar = 0; ensureLoop(); }
  });

  /* ---------------- 7. 启动 ---------------- */
  buildStars();
  fitAll();
  if (CFG.stars && !reduceMotion) ensureLoop();
  // 减少动态效果时：星星只画一帧静态，雪花仍可点击但更短更温和
})();
