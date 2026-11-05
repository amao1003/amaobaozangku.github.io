/* ============================================================
 * 渲染引擎 + 交互
 * 职责：把 js/data.js 里的 window.SITE 变成页面，并实现折叠、搜索、
 *       深浅色、备注浮层、说明弹窗、快速目录、回到顶部。
 * 你平时不需要改这个文件。
 * ============================================================ */
(function () {
  'use strict';

  // 编辑器「预览」按钮会把临时数据放进 sessionStorage，并以 #preview 打开本页。
  // 只有带 #preview 时才读取，正常访问始终以 js/data.js 为准，避免预览数据残留。
  var usingPreview = false;
  var SITE = (function () {
    if (location.hash === '#preview') {
      try {
        var raw = sessionStorage.getItem('nav-preview');
        if (raw) {
          var obj = JSON.parse(raw);
          if (obj && Array.isArray(obj.categories)) { usingPreview = true; return obj; }
        }
      } catch (e) {}
    }
    return window.SITE || { meta: {}, categories: [] };
  })();
  var META = SITE.meta || {};
  var RECENT_DAYS = Number(META.recentDays) || 10;

  var ICON_ALIAS = {
    web: 'web', doc: 'doc', link: 'link', folder: 'folder', comment: 'comment',
    app: 'app', windows: 'windows', apple: 'apple', android: 'android',
    linux: 'linux', youtube: 'youtube', gift: 'gift', cart: 'cart',
    weixin: 'weixin', tree: 'tree', warning: 'warning', ban: 'ban',
    quote: 'quote', star: 'star', code: 'code', cloud: 'cloud',
    search: 'search', image: 'image', music: 'music', book: 'book', ai: 'ai'
  };
  var PLATFORM_ICONS = {
    Win: 'windows', Mac: 'apple', Linux: 'linux', Android: 'android',
    iOS: 'apple', Web: 'webplat', Extend: 'code'
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  function icon(name) {
    var key = ICON_ALIAS[name] || 'web';
    return el('i', 'ic ic-' + key);
  }
  function isRecent(dateStr) {
    if (!dateStr) return false;
    var t = new Date(dateStr.replace(/-/g, '/')).getTime();
    if (isNaN(t)) return false;
    return (Date.now() - t) <= RECENT_DAYS * 86400000 && (Date.now() - t) >= -86400000;
  }

  /* ---------------- 备注 ⓘ ---------------- */
  function noteIcon(text) {
    var i = el('i', 'note-icon');
    i.setAttribute('notes', text || '');
    i.title = text || '';
    return i;
  }

  /* ---------------- 条目渲染 ---------------- */
  function renderItem(item, path) {
    var li = el('li');
    var type = item.type || 'link';

    if (type === 'split') {
      li.className = 'split';
      li.textContent = '————————————————';
      return li;
    }
    if (type === 'note') {
      li.className = 'note-row';
      li.appendChild(el('span', 'notes', item.text || ''));
      return li;
    }

    li.className = 'item';
    li.appendChild(icon(item.icon || (type === 'popup' ? 'doc' : 'web')));

    var a = el('a', 'item-link', item.title || '未命名');
    if (item.date) a.title = '添加时间：' + item.date;
    if (isRecent(item.date)) a.classList.add('recent');

    if (type === 'popup') {
      a.href = 'javascript:void(0)';
      a.setAttribute('target', '_self');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(item.html || '');
      });
    } else {
      a.href = item.url || '#';
      if (item.confirm) {
        a.addEventListener('click', function (e) {
          if (!window.confirm(item.confirm)) e.preventDefault();
        });
      }
    }
    li.appendChild(a);

    if (item.badge === 'pay') li.appendChild(el('span', 'pay-mark', '付'));
    if (item.badge === 'free') li.appendChild(el('span', 'pay-mark', '免'));

    if (item.platform) {
      var plat = el('span', 'plat');
      String(item.platform).split(/[,，\s]+/).forEach(function (p) {
        if (!p) return;
        var k = PLATFORM_ICONS[p];
        if (k) plat.appendChild(el('i', 'ic ic-' + k));
      });
      if (plat.childNodes.length) li.appendChild(plat);
    }

    if (item.note) li.appendChild(noteIcon(item.note));

    if (item.backup) {
      var bei = el('a', 'bei');
      bei.href = item.backup;
      bei.title = '备用链接：' + item.backup;
      li.appendChild(bei);
    }

    // 记录搜索索引所需信息
    li._search = {
      title: item.title || '',
      note: item.note || '',
      path: path,
      url: item.url || '',
      type: type,
      element: a
    };
    return li;
  }

  /* ---------------- 分类节点渲染（递归） ---------------- */
  function renderNode(node, path, index) {
    var li = el('li', 'cat-node');
    var title = node.title || '未命名分类';
    var here = path.concat([title]);

    li.appendChild(el('i', 'ic ic-folder'));
    var toggle = el('span', 'cat-toggle', title);
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    li.appendChild(toggle);
    if (node.note) li.appendChild(noteIcon(node.note));

    var inner = el('ul', 'menu');
    (node.children || []).forEach(function (child, i) {
      inner.appendChild(renderNode(child, here, i));
    });
    (node.items || []).forEach(function (item) {
      inner.appendChild(renderItem(item, here.join(' › ')));
    });
    li.appendChild(inner);

    function toggleOpen(force) {
      var willOpen = (force === undefined) ? !li.classList.contains('open') : force;
      li.classList.toggle('open', willOpen);
      inner.classList.toggle('open', willOpen);
    }
    toggle.addEventListener('click', function (e) { e.stopPropagation(); toggleOpen(); });
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); }
    });

    li._toggleOpen = toggleOpen;
    li._title = title;
    return li;
  }

  /* ---------------- 展开某元素所在的所有上级分类 ---------------- */
  function expandAncestors(node) {
    var p = node.parentElement;
    while (p && p.id !== 'mainmenu') {
      if (p.tagName === 'UL' && p.classList.contains('menu')) p.classList.add('open');
      if (p.tagName === 'LI' && p.classList.contains('cat-node')) p.classList.add('open');
      p = p.parentElement;
    }
  }

  /* ---------------- 页面头部 / 飘带 / 页脚 ---------------- */
  function renderMeta() {
    document.title = META.title || '我的资源导航';
    document.querySelector('meta[name="description"]').setAttribute('content', META.description || '');
    document.getElementById('siteHeading').textContent = META.heading || '我的资源导航';
    document.getElementById('siteSubtitle').textContent = META.subtitle || '';
    document.getElementById('footer').textContent = META.footer || '';

    var ribbon = document.getElementById('ribbon');
    if (META.showRibbon === false || !META.ribbon) {
      ribbon.style.display = 'none';
    } else {
      ribbon.href = META.ribbon.url || '#';
      ribbon.querySelector('.tag').textContent = META.ribbon.text || '';
    }

    var top = document.getElementById('top');
    (META.topButtons || []).forEach(function (btn) {
      var a = el('a', 'topSerach');
      a.appendChild(document.createTextNode(btn.text || '按钮'));
      if (btn.icon) a.appendChild(icon(btn.icon));
      if (btn.action === 'search') {
        a.href = 'javascript:void(0)';
        a.setAttribute('target', '_self');
        a.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
      } else {
        a.href = btn.url || '#';
      }
      top.appendChild(a);
    });
  }

  /* ---------------- 主目录 ---------------- */
  var searchIndex = [];
  var topNodes = [];
  function renderMenu() {
    var root = document.getElementById('mainmenu');
    (SITE.categories || []).forEach(function (cat, i) {
      var li = renderNode(cat, [], i);
      li.id = 'cat-' + i;
      root.appendChild(li);
      topNodes.push(li);
    });
    // 默认展开第一个一级栏目，避免打开是一片空白
    if (topNodes[0] && topNodes[0]._toggleOpen) topNodes[0]._toggleOpen(true);

    // 收集搜索索引
    root.querySelectorAll('li.item').forEach(function (li) {
      if (li._search) searchIndex.push(li._search);
    });
  }

  /* ---------------- 右侧快速目录 ---------------- */
  function renderSidebar() {
    var sb = document.getElementById('sidebar');
    if (META.showSidebar === false) { sb.style.display = 'none'; return; }
    var list = document.getElementById('sidebarList');
    topNodes.forEach(function (li, i) {
      var a = el('a', '', (i + 1) + '. ' + li._title.replace(/^\d+[　.\s]*/, ''));
      a.href = '#cat-' + i;
      a.setAttribute('target', '_self');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (li._toggleOpen) li._toggleOpen(true);
        li.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSidebar(i);
      });
      list.appendChild(a);
    });
  }
  function setActiveSidebar(idx) {
    document.querySelectorAll('#sidebarList a').forEach(function (a, i) {
      a.classList.toggle('active', i === idx);
    });
  }

  /* ---------------- 备注浮层 ---------------- */
  var tip = document.getElementById('noteTip');
  var activeNote = null;
  function showTip(target, text) {
    tip.textContent = text;
    tip.style.display = 'block';
    var r = target.getBoundingClientRect();
    var left = Math.min(r.left, window.innerWidth - 480);
    var top = r.bottom + 8;
    if (top + tip.offsetHeight > window.innerHeight - 10) top = Math.max(8, r.top - tip.offsetHeight - 8);
    tip.style.left = Math.max(8, left) + 'px';
    tip.style.top = top + 'px';
    if (activeNote) activeNote.classList.remove('active');
    target.classList.add('active');
    activeNote = target;
  }
  function hideTip() {
    tip.style.display = 'none';
    if (activeNote) activeNote.classList.remove('active');
    activeNote = null;
  }
  function bindNotes() {
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('.note-icon');
      if (t) showTip(t, t.getAttribute('notes') || t.title || '');
    });
    document.addEventListener('mouseout', function (e) {
      var t = e.target.closest && e.target.closest('.note-icon');
      if (t) hideTip();
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.note-icon');
      if (t) { e.preventDefault(); showTip(t, t.getAttribute('notes') || t.title || ''); }
      else if (!e.target.closest('#noteTip')) hideTip();
    });
  }

  /* ---------------- popup 说明弹窗 ---------------- */
  var mask = document.getElementById('modalMask');
  function openModal(html) {
    document.getElementById('modalBody').innerHTML = html;
    mask.classList.add('is-open');
  }
  function closeModal() { mask.classList.remove('is-open'); }
  document.getElementById('modalClose').addEventListener('click', closeModal);
  mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });

  /* ---------------- 站内搜索 ---------------- */
  var panel = document.getElementById('rsPanel');
  var input = document.getElementById('rsInput');
  var rsList = document.getElementById('rsList');
  var results = [];
  var activeIdx = 0;

  function openSearch() {
    panel.classList.add('is-open');
    input.value = '';
    input.focus();
    runSearch('');
  }
  function closeSearch() { panel.classList.remove('is-open'); }

  function highlight(text, q) {
    var frag = document.createDocumentFragment();
    if (!q) { frag.appendChild(document.createTextNode(text)); return frag; }
    var lower = text.toLowerCase(), needle = q.toLowerCase(), from = 0, pos;
    while ((pos = lower.indexOf(needle, from)) !== -1) {
      if (pos > from) frag.appendChild(document.createTextNode(text.slice(from, pos)));
      frag.appendChild(el('mark', '', text.slice(pos, pos + needle.length)));
      from = pos + needle.length;
    }
    frag.appendChild(document.createTextNode(text.slice(from)));
    return frag;
  }

  function runSearch(q) {
    q = (q || '').trim();
    results = [];
    if (q) {
      var lower = q.toLowerCase();
      searchIndex.forEach(function (it) {
        var hay = (it.title + ' ' + it.note + ' ' + it.path).toLowerCase();
        if (hay.indexOf(lower) !== -1) results.push(it);
      });
    } else {
      results = searchIndex.slice(0, 12);
    }
    results = results.slice(0, 60);
    activeIdx = 0;
    paintResults(q);
  }

  function paintResults(q) {
    rsList.innerHTML = '';
    if (!results.length) {
      rsList.appendChild(el('div', 'rs-empty', '未找到匹配资源，换个关键词试试'));
      return;
    }
    results.forEach(function (it, i) {
      var row = el('div', 'rs-item' + (i === activeIdx ? ' is-active' : ''));
      var t = el('div', 'rs-t');
      t.appendChild(highlight(it.title, q));
      row.appendChild(t);
      if (it.path) row.appendChild(el('span', 'rs-cat', it.path));
      if (it.note) row.appendChild(el('span', 'rs-note', it.note));
      row.appendChild(el('span', 'rs-go', it.type === 'popup' ? '查看 ↵' : '打开 ↵'));
      row.addEventListener('mouseenter', function () { setActive(i); });
      row.addEventListener('click', function () { activate(i); });
      rsList.appendChild(row);
    });
  }
  function setActive(i) {
    activeIdx = i;
    rsList.querySelectorAll('.rs-item').forEach(function (n, k) {
      n.classList.toggle('is-active', k === i);
    });
    var cur = rsList.children[i];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }
  function activate(i) {
    var it = results[i];
    if (!it) return;
    closeSearch();
    if (it.type === 'popup' || !it.url || it.url === '#') {
      expandAncestors(it.element);
      it.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      it.element.click();
    } else {
      expandAncestors(it.element);
      it.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.open(it.url, '_blank');
    }
  }

  input.addEventListener('input', function () { runSearch(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(results.length - 1, activeIdx + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, activeIdx - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); activate(activeIdx); }
    else if (e.key === 'Escape') { closeSearch(); }
  });
  panel.addEventListener('click', function (e) { if (e.target === panel) closeSearch(); });
  document.getElementById('bottomSearchBtn').addEventListener('click', openSearch);

  /* ---------------- 深浅色 ---------------- */
  var THEME_KEY = 'nav-theme';
  function applyTheme(mode, animate) {
    if (animate) {
      document.documentElement.classList.add('theme-transitioning');
      setTimeout(function () { document.documentElement.classList.remove('theme-transitioning'); }, 350);
    }
    document.documentElement.classList.toggle('dark-mode', mode === 'dark');
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  }
  function toggleTheme() {
    applyTheme(document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark', true);
  }
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved, false);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark', false);
  } catch (e) {}

  /* ---------------- 全部展开 / 收起 ---------------- */
  document.getElementById('expandAll').addEventListener('click', function () {
    document.querySelectorAll('#mainmenu li.cat-node').forEach(function (li) { if (li._toggleOpen) li._toggleOpen(true); });
  });
  document.getElementById('collapseAll').addEventListener('click', function () {
    document.querySelectorAll('#mainmenu li.cat-node').forEach(function (li) { if (li._toggleOpen) li._toggleOpen(false); });
  });

  /* ---------------- 全局键盘 ---------------- */
  document.addEventListener('keydown', function (e) {
    var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === 'Escape') { closeSearch(); closeModal(); hideTip(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
    if (!inField && e.key === '/') { e.preventDefault(); openSearch(); return; }
    if (!inField && (e.key === 'd' || e.key === 'D')) { toggleTheme(); }
  });

  /* ---------------- 回到顶部 + 侧栏高亮 ---------------- */
  var backTop = document.getElementById('backTop');
  backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  window.addEventListener('scroll', function () {
    backTop.style.display = window.scrollY > 400 ? 'block' : 'none';
    var best = 0, bestTop = -Infinity;
    topNodes.forEach(function (li, i) {
      var top = li.getBoundingClientRect().top;
      if (top <= 140 && top > bestTop) { bestTop = top; best = i; }
    });
    setActiveSidebar(best);
  }, { passive: true });

  /* ---------------- 图标字体离线兜底 ---------------- */
  function checkFont() {
    try {
      if (document.fonts && document.fonts.check) {
        var ok = document.fonts.check('17px FontAwesome');
        document.documentElement.classList.toggle('no-fa', !ok);
      }
    } catch (e) {}
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(checkFont);
  setTimeout(checkFont, 1500);

  /* ---------------- 启动 ---------------- */
  renderMeta();
  renderMenu();
  renderSidebar();
  bindNotes();

  if (usingPreview) {
    var bar = document.createElement('div');
    bar.textContent = '预览模式 · 显示编辑器里的临时数据，尚未写入 js/data.js';
    bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:0;z-index:9999;' +
      'background:#fff7e6;border:1px solid #f5d9a0;border-top:0;border-radius:0 0 8px 8px;' +
      'padding:5px 14px;font:12px/1.6 "microsoft yahei",sans-serif;color:#8a5a00;white-space:nowrap;';
    document.body.appendChild(bar);
  }
})();
