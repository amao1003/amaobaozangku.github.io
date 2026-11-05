# 复刻「阿虚同学的储物间」· 详细制作步骤

> 目标：做一个**版式与交互一致、但内容完全由你自己编辑**的资源导航站。
> 全程**不需要安装 Node.js、不需要构建、不需要数据库**，纯 HTML + CSS + JS，双击就能打开。

---

## 0. 先搞清楚原站是什么（这决定了复刻方式）

拆解结论（2026-11-03 抓取自 axutongxue.com）：

| 项目 | 原站做法 |
|---|---|
| 技术栈 | 纯静态：`index.html` + `css/style.css` + 几个原生 JS + Font Awesome 4.7 图标字体 |
| 托管 | GitHub Pages / Cloudflare Pages 一类静态托管 |
| 内容量 | 单页约 2103 条链接，HTML 文件约 642 KB |
| 目录结构 | `<ul id="mainmenu">` 里无限嵌套 `<ul class="menu">`，一级 12 个栏目，往下 2~3 层 |
| 条目组成 | 图标 + 标题 + `title="添加时间"` + ⓘ 备注 + 灰色「备用链接」+ 平台小图标 + `————` 分隔线 |
| 交互 | 深浅色切换、右上角斜角飘带、命令面板式站内搜索、备注浮层、右侧边栏、回到顶部、近 10 天新增标绿 |
| 痛点 | **所有链接硬编码在 HTML 的 `<li>` 里**，改一个网址要在 642KB 文件里找半天 |

所以：**照抄那份 HTML 是最糟的复刻**。正确做法是把「外观」和「内容」拆开：

```
外观/交互  →  css/style.css + js/app.js   （基本不用动）
内容      →  js/data.js                 （你只改这个）
改内容UI  →  editor.html                （不想写代码就点这里）
```

本项目已经按这个思路搭好了，下面是从拿到文件到上线的完整步骤。

---

## 1. 文件清单

```
axutongxue-clone/
├── index.html       页面骨架：只有容器，目录由 JS 生成
├── editor.html      ★ 可视化内容编辑器（改内容不用碰代码）
├── reply.html       右上角飘带的落地页（占位，可随意替换）
├── css/
│   ├── style.css    全部样式：缩进树、图标、深浅色、搜索面板、响应式
│   └── effects.css  特效层定位与层级（背景线条 / 雪花）
├── js/
│   ├── data.js      ★★ 全站内容数据 —— 唯一必须编辑的文件
│   ├── app.js       渲染引擎 + 全部交互（一般不用改）
│   └── effects.js   背景动态线条 + 点击空白雪花绽放
└── README.md        本文件
```

**只需要记住一句话：改内容 → 用 `editor.html`，导出后覆盖 `js/data.js`。**

---

## 2. 第一步：本地预览

### 方式 A：最省事（直接双击）
双击 `index.html` 即可打开。图标字体走 CDN，联网时与原站一致；断网会自动降级成圆点，不影响使用。

### 方式 B：起一个本地服务器（推荐，编辑器「预览」按钮需要它）
在项目文件夹打开命令行：

```bash
# Windows（Python）
python -m http.server 8000
# 如果上面提示找不到 python，试试
py -m http.server 8000

# 或者用 VS Code 的 Live Server 插件，右键 index.html → Open with Live Server
```

然后浏览器访问：

```
http://localhost:8000/index.html        ← 网站
http://localhost:8000/editor.html       ← 内容编辑器
```

> ⚠️ 只有用 `http://localhost` 打开时，编辑器的「预览站点」按钮才能立刻看到未导出的改动；
> 直接 `file://` 双击打开时，请先「导出 data.js」再刷新首页。

---

## 3. 第二步：改成你自己的内容（三种方式，任选）

### 方式 1 · 可视化编辑器（推荐，零代码）

1. 打开 `editor.html`。
2. 左侧是目录树，点任意一行，右侧出现表单。
3. 常用操作：
   - 点「**站点设置**」改网站名、标语、页脚、飘带文字、标绿天数、是否显示侧栏。
   - 点某个**分类** → 改名称/备注，或「+ 添加子分类」「+ 添加条目」「↑ 上移」「↓ 下移」「⧉ 复制」「🗑 删除」。
   - 点某个**条目** → 改标题、网址、图标、备注、备用链接、添加时间、徽标、支持平台、点击前确认提示。
   - 条目「类型」可切换成 `普通链接 / 分隔线 / 说明文字 / 点击弹窗`。
   - 「**+ 一级分类**」在顶部新增第 13、14… 个栏目。
   - 「**JSON 高级模式**」可以整份数据一次性粘贴修改（批量替换网址很方便）。
4. 改完点右上「**⬇ 导出 data.js**」，浏览器会下载一个 `data.js`。
5. 把下载的文件**覆盖**项目里的 `js/data.js`。
6. 刷新 `index.html` —— 生效。

**批量删除（一次勾多个）**

左侧「目录结构」下方有一条多选工具条：

| 操作 | 效果 |
|---|---|
| 勾选每行前面的方框 | 选中该分类或条目；勾选**分类**会自动带上它下面的所有子分类和条目 |
| 按住 `Ctrl` 点击某一行 | 不打开表单，直接切换该行的勾选 |
| 「全选」/「清空选择」 | 一次勾选全站 / 全部取消 |
| 「🗑 删除选中」 | 弹窗列出将删除的名称与总项数，确认后一次删完 |
| 「↩ 撤销删除」 | 删除后出现，一键恢复删除前的完整内容 |

工具条会实时显示「已选 N 项 · 将删 M 项」。规则：取消勾选某个子项时，它所属的分类会自动取消勾选，保证「没勾的一定保留」；执行新增、复制、移动、导入等会改变结构的操作后，勾选会自动清空，避免路径错位误删。删除同样只影响浏览器草稿，**导出并覆盖 `data.js` 后才会真正生效**。

> 编辑器会把改动自动存进浏览器草稿（localStorage）。下次打开会提示「载入草稿」；
> **草稿不会改到真实站点，只有导出并覆盖文件才会生效**，改坏了随时可以「放弃草稿」重来。

### 方式 2 · 直接改 `js/data.js`（会一点文本编辑就够）

用记事本 / VS Code 打开 `js/data.js`，文件顶部有完整字段注释。最小例子：

```js
window.SITE = {
  meta: {
    title: "辉哥的资源库 - 常用网站一页搞定",
    heading: "辉哥的资源库",
    subtitle: "自己攒的，随手能找到",
    ribbon: { text: "点我领取资料", url: "reply.html" },
    footer: "© 2026 辉哥",
    recentDays: 10
  },
  categories: [
    {
      title: "01　我的常用工具",
      children: [
        {
          title: "01.设计",
          items: [
            { title: "🥇Figma", url: "https://www.figma.com/", icon: "web", note: "在线协作设计" },
            { title: "🥈即时设计", url: "https://js.design/", icon: "image", backup: "https://js.design/" },
            { type: "split" },
            { type: "note", text: "下面两个是免费图库" },
            { title: "Unsplash", url: "https://unsplash.com/", icon: "image", date: "2026-11-03" }
          ]
        }
      ]
    },
    {
      title: "02　学习资料",
      items: [
        { title: "MDN", url: "https://developer.mozilla.org/zh-CN/", icon: "code" }
      ]
    }
  ]
};
```

保存 → 刷新浏览器，立刻生效。

**条目全部可选字段：**

| 字段 | 说明 |
|---|---|
| `title` | 标题。`🥇🥈🥉🔥👍㊕▾📃` 这些标记直接写进标题里 |
| `url` | 链接地址，点击新窗口打开 |
| `icon` | `web / doc / link / folder / app / windows / apple / android / linux / youtube / gift / cart / weixin / tree / warning / ban / quote / star / code / cloud / search / image / music / book / ai` |
| `note` | 标题后出现 ⓘ，鼠标悬停显示全文 |
| `backup` | 备用链接，标题后显示灰色「备用链接」 |
| `date` | `YYYY-MM-DD`，悬停显示「添加时间」，近 N 天自动标绿 |
| `badge` | `pay`（付费标记）、`free`（免费标记） |
| `platform` | `Win,Mac,Linux,Android,iOS,Web,Extend`，逗号分隔，显示平台小图标 |
| `confirm` | 点击前弹确认框，例如「此站有广告，请留意」 |
| `type` | `link`（默认）/ `split` / `note`（配 `text`）/ `popup`（配 `html`） |

**分类节点**：`title`、`note`、`children`（子分类数组）、`items`（直属条目数组），`children` 可无限嵌套。

### 方式 3 · 批量替换（有几百条链接时）

在编辑器里点「**JSON 高级模式**」，把整份数据粘进去（或先「导出 JSON」拿到标准格式，用 Excel / 脚本生成后再粘回来），点「✅ 应用修改」，再导出 `data.js`。

---

## 4. 第三步：微调外观

打开 `css/style.css`，最上面的 `:root` 是浅色变量，`html.dark-mode` 是深色变量。改几个值就能换肤：

```css
:root {
  --link-hover: #6495ed;   /* 鼠标悬停的蓝色 */
  --folder: gold;          /* 文件夹图标颜色 */
  --tree-line: #000000;    /* 左侧嵌套竖线 */
  --recent: #07a35a;       /* 近 N 天新增的绿色 */
}
```

其他常见改动：

| 想改什么 | 改哪里 |
|---|---|
| 正文字号 / 行距 | `body{font-size:15px}`、`#mainmenu li{line-height:1.7}` |
| 缩进层级间距 | `.menu{padding-left:32px}`、`li ul{margin-left:18px}` |
| 页面宽度 | `body{padding:16px 20px 90px}` |
| 图标码点 / 颜色 | `.ic-web::before` 等映射区 |
| 高分屏自动放大 | 文件末尾两条 `@media (min-width:1800px)` 的 `zoom` |
| 手机端排版 | 文件末尾 `@media (max-width:640px)` |

> 图标字体用的是 Font Awesome 4.7。若你的网络访问不了 `code.bdstatic.com`，
> 把 `index.html` 里的 `<link>` 换成任意 CDN（如 cdnjs）即可；完全离线时会自动降级成圆点。

### 背景动态线条 与 点击雪花（可一键开关）

首页背景有 4 条极淡的蓝色曲线缓慢流动，鼠标移动时有轻微视差；**在页面空白处单击**，会出现一朵六臂雪花绽放并散出小冰晶（约 1 秒后淡出）。点链接、按钮、标题文字、搜索面板里都不会触发，也不会挡住任何原有交互。

开关和调参都在 `index.html` 最底部，改完保存刷新即可，不用碰 JS：

```html
<script>
  window.AXU_FX = { lines: true, snow: true, lineCount: 4, snowSize: 1 };
</script>
```

| 参数 | 说明 |
|---|---|
| `lines` | `false` 关掉背景线条 |
| `snow` | `false` 关掉点击雪花 |
| `lineCount` | 线条数量，2~6；触屏设备自动降到 2 |
| `snowSize` | 雪花大小倍率，如 `0.8` / `1.2` |
| `lineAlpha` | 线条浓度 0~1（可选，写在上面对象里） |

- 颜色自动跟随浅色 / 深色模式，用的是 `--link-hover` 同色系；想换色改 `js/effects.js` 顶部的 `LIGHT` / `DARK`。
- 线条约 30fps、雪花按点击触发；切到后台暂停绘制，同屏雪花最多 6 朵，不会拖慢页面。
- 系统开启「减少动态效果」时，线条只画一帧静态、雪花缩短为温和淡出。
- 两个 canvas 都是 `pointer-events:none`，`editor.html` 与 `reply.html` 未加载特效（保持工具页干净）。

---

## 5. 第四步：加功能（可选）

`js/app.js` 按功能分了段，每段有注释。常见二次开发入口：

- 折叠默认状态：`renderMenu()` 里 `topNodes[0]._toggleOpen(true)`（目前默认展开第一个栏目）。
- 搜索匹配逻辑：`runSearch()`（目前匹配 标题 + 备注 + 分类路径）。
- 快捷键：全局 `keydown` 段（目前 `Ctrl+K`、`/`、`D` 切换主题、`Esc` 关闭）。
- 新增条目类型：在 `renderItem()` 里加一个 `if (type === 'xxx')` 分支。
- 统计代码：在 `index.html` 的 `</body>` 前插入百度统计 / Cloudflare Analytics 脚本。

---

## 6. 第五步：上线（四选一）

站点是**纯静态**，任何能放 HTML 的地方都能托管。

### 方案 A · Cloudflare Pages（最简单，拖拽即可）
1. 注册 [dash.cloudflare.com](https://dash.cloudflare.com/) → **Workers 和 Pages** → **创建** → **Pages** → **上传资产**。
2. 把整个 `axutongxue-clone` 文件夹拖进去（或打包 zip），项目名随意。
3. 点部署，几十秒后得到一个 `https://xxx.pages.dev` 链接。
4. 以后改内容：重新拖一次文件夹即可；或连 GitHub 仓库自动部署。

### 方案 B · GitHub Pages（免费、可绑域名、原站同款）

> **零基础首选（不用敲命令、不用懂英文）**：双击 `小白上线指南.html` 看全中文图解 →
> 双击 `一键上线.bat` 完成首次上线 → 以后改完内容双击 `一键更新.bat`。
> 这两个 `.bat` 是本机专用工具，已加入 `.gitignore`，不会上传到公开仓库。

> 完整图文教程见 **[GITHUB-PAGES.md](./GITHUB-PAGES.md)**：包含「网页上传零命令路线」与「命令行 Git 路线」、
> 本机代理配置（Windows 系统代理需显式告诉 Git）、首次登录授权 / PAT、开启 Pages、绑定域名、
> 8 种常见报错对照表，以及以后改内容的一键脚本 `sh deploy.sh`。
>
> **想换网址 / 换域名**：打开本地的 `域名修改指南.html`（全中文图解，含 DNS 填写小助手），
> 或直接看 [GITHUB-PAGES.md 第 6 节](./GITHUB-PAGES.md)。三种做法：改仓库名免费变短、绑定自己买的域名、只改网页站名。
> 本项目资源全为相对路径，**换任何网址都不用改代码**。

最快路径（仓库已在 GitHub 网页创建好）：

```bash
cd axutongxue-clone
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"
git config --global http.proxy http://127.0.0.1:端口   # 国内环境必配；端口取自「设置-网络-代理」，一键上线.bat 会自动读取
git remote add origin https://github.com/你的用户名/仓库名.git
git commit -m "init: 资源导航站"
git push -u origin main
```
然后仓库 → **Settings** → **Pages** → Source 选 `Deploy from a branch`、Branch 选 `main` / `root` → Save，
等 1~2 分钟访问 `https://你的用户名.github.io/仓库名/`（若仓库名就是 `用户名.github.io`，则直接是 `https://用户名.github.io/`）。

> 完全不想敲命令：仓库页 → **Add file → Upload files** 把项目文件拖进去提交，同样能开 Pages，详见 GITHUB-PAGES.md 第 2 节。
> 以后更新内容：改完 `js/data.js` 后运行 `sh deploy.sh` 自动提交推送。
> 本项目资源引用已全部使用相对路径，子路径部署（`仓库名/`）无需改动。

### 方案 C · Vercel / Netlify
注册后「Import Project」选 GitHub 仓库，或直接拖拽文件夹，构建命令留空、输出目录填 `/` 即可。

### 方案 D · 国内访问更快：对象存储 / 轻量服务器
- 腾讯云 COS / 阿里云 OSS：开启「静态网站」功能，上传整个文件夹，绑定自定义域名并开启 CDN + HTTPS。
- 自己的服务器：把文件夹丢进 Nginx 的 `root` 目录即可，零依赖。
- **注意**：使用国内大陆节点的自定义域名需要完成 ICP 备案；用 `*.pages.dev` / `*.github.io` 这类境外托管域名则不需要备案，但国内访问速度不稳定。

### 上线前自检清单
- [ ] `js/data.js` 已换成自己的内容（示例链接只是占位）
- [ ] `meta.title` / `heading` / `footer` 已改成自己的
- [ ] 飘带 `ribbon.url` 指向的页面存在（或改成 `#` / 删掉）
- [ ] 手机上看一眼缩进是否溢出
- [ ] 点几个链接确认能打开
- [ ] 深浅色切换、搜索、折叠都试一遍

---

## 7. 第六步：日常维护流程（以后每次改内容）

```
打开 editor.html
  → 左侧点选、右侧修改（或 JSON 模式批量改）
  → 点「导出 data.js」
  → 覆盖项目里的 js/data.js
  → 本地刷新确认
  → 重新部署（GitHub 推送 / Cloudflare 重新拖文件夹 / 对象存储重新上传）
```

建议：每次导出前顺手点一次「导出 JSON」留个备份，改坏了能秒回滚。

---

## 8. 与原站的对照：哪些复刻了，哪些做了改良

| 原站特性 | 本项目 | 说明 |
|---|---|---|
| 无限层级缩进目录 + 左侧竖线 | ✅ 1:1 | DOM 结构同构，`<ul class="menu">` |
| 黑字 + `#6495ed` 悬停蓝 + 金色文件夹 | ✅ 1:1 | 抽成 CSS 变量，可一键换色 |
| 🥇🥈🥉🔥👍㊕▾📃 标记 | ✅ | 直接写在标题里 |
| ⓘ 备注浮层 | ✅ | 桌面悬停 / 手机点按 |
| 灰色「备用链接」 | ✅ | 竖线 + 小字 |
| `————————` 分隔线、灰字说明 | ✅ | `type: split` / `type: note` |
| 添加时间 tooltip、近 10 天标绿 | ✅ | `date` 字段 + `recentDays` |
| 点击弹窗型条目（解析接口那类） | ✅ | `type: popup` + `html` |
| 平台小图标（Win/Mac/Android…） | ✅ 改良 | 用图标字体代替原站的 20 多个 PNG |
| 深浅色切换 + 记忆 | ✅ | 左上角按钮 / `D` 键 / localStorage |
| 右上角斜角飘带 | ✅ | `meta.ribbon` |
| 站内搜索命令面板 | ✅ 改良 | `Ctrl+K`、`/`、↑↓ Enter，索引按 DOM 自动构建 |
| 右侧边栏 | ✅ 改良 | 换成「快速目录 + 全部展开/收起」 |
| 回到顶部、高分屏自动放大 | ✅ | |
| PWA manifest / 百度统计 / 不蒜子 | ➖ 未做 | 需要时自行在 `index.html` 加 |
| **内容编辑方式** | ✅ **核心改良** | 原站改 HTML；本项目改数据文件 + 可视化编辑器 |
| 原站 2103 条具体资源链接 | ❌ 未复制 | 版权/合规考虑，示例内容为占位，请填你自己的链接 |

---

## 9. 常见问题

**Q：改了 `data.js` 但页面没变？**
A：浏览器缓存。按 `Ctrl+F5` 强制刷新；或确认你改的是项目里的 `js/data.js`（编辑器下载的 `data.js` 需要手动覆盖）。

**Q：编辑器里改了，首页还是旧的？**
A：编辑器的改动只在浏览器草稿里。必须点「导出 data.js」并覆盖文件；或点「预览站点」看临时效果（需 `http://localhost` 打开）。

**Q：图标显示成方块 / 豆腐？**
A：Font Awesome CDN 没加载成功。联网刷新即可；断网时脚本会自动加 `.no-fa` 降级成圆点。也可把 `index.html` 里的 CDN 换成你可达的地址。

**Q：手机上看缩进太深、文字挤？**
A：`css/style.css` 末尾 `@media (max-width:640px)` 里调小 `.menu` 的 `padding-left`。层数特别多时建议少嵌一层。

**Q：想让分类默认全部展开？**
A：`js/app.js` 的 `renderMenu()` 里，把 `topNodes[0]._toggleOpen(true)` 改成遍历所有 `#mainmenu li.cat-node` 逐个 `_toggleOpen(true)`。

**Q：怎么让搜索引擎收录？**
A：在 `index.html` 的 `<head>` 补 `<meta name="keywords">`、canonical，并提交 sitemap（静态站可用在线工具生成）。也可以像原站一样加 JSON-LD 结构化数据。

**Q：能不能多人协作 / 在线后台编辑？**
A：当前是纯静态方案。如果要在线后台，下一步可以接云数据库 + 登录（或改成 Headless CMS 驱动），那就需要后端了，可以单独再做。

---

## 10. 合规提醒

- 本项目只复刻了**排版结构与交互方式**，没有复制原站的站名、Logo、图片素材和 2103 条资源链接；示例数据均为通用公开网站的占位内容。
- 请替换成你自己的内容后再公开发布；收录第三方站点链接时，自行确认链接的合法性与可用性。
- 若保留与原站高度近似的站名或视觉标识，可能涉及商标/著作权问题，建议改用自己的名称与配色。
