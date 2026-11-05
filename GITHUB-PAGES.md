# GitHub Pages 部署详细教程（按本机环境实测）

> 适用前提：你**已经在 GitHub 网页上创建好了一个仓库**，现在不知道下一步怎么把本地文件弄上去、怎么开 Pages。

> **零基础 / 不看英文 / 不想敲命令？直接打开同目录的 `小白上线指南.html`**（双击即可，全中文图解）。
> 配套的两个小程序：`一键上线.bat`（第一次用）、`一键更新.bat`（以后改内容用），都是双击运行，按中文提示操作即可。
> 本文件保留完整的命令版教程，供想了解原理或需要排查问题时查阅。

---

## 0. 我已经帮你做好的部分

在 `axutongxue-clone/` 目录里，下面这些**不用你再敲**：

- `git init -b main` —— 本地仓库已建好，分支直接就是 `main`
- `git add .` —— 8 个文件已全部暂存（`.gitignore`、`README.md`、`GITHUB-PAGES.md`、`deploy.sh`、`index.html`、`editor.html`、`reply.html`、`css/style.css`、`js/app.js`、`js/data.js`）
- 写好了 `.gitignore`（忽略系统垃圾文件与本地备份，**不会忽略 `js/data.js`**）
- 写好了 `deploy.sh`（以后改完内容一键推送，见第 4 节）

也就是说，README 里那段命令中的 `git init`、`git add .`、`git branch -M main` 三步**已经完成**，你只需要做「配置 → 提交 → 关联远程仓库 → 推送 → 开 Pages」。

### 本机环境实测结论（重要）

| 检查项 | 结果 | 影响 |
|---|---|---|
| Git | 2.55.0，便携版（WorkBuddy 自带），**没装系统版 Git for Windows** | 想长期在自己终端用，建议装一个；临时用就在 WorkBuddy 终端里操作 |
| `user.name` / `user.email` | 未设置 | 提交前必须设一次 |
| 凭据助手 | 已配置 `manager`（Git Credential Manager） | 第一次 push 会弹窗用浏览器登录 GitHub，不用手动折腾 token |
| 直连 github.com | 不通 | 必须走代理 |
| Windows 系统代理 | `127.0.0.1:7892`，实测访问 github.com / api.github.com 均返回 200 | 浏览器能开 GitHub 就是靠它 |
| 端口由谁提供 | `F:\hhycenter\hhycenterCore.exe` 监听 7892；Clash Verge 配置为 7897 但当前未接管 | 两个软件端口不同，以 Windows 显示为准 |
| Git 是否自动读系统代理 | **不会** | 脚本已用 `reg query` 自动读取并显式配给 Git，否则 push 一定超时 |
| 查看端口 | 双击 `检查网络.bat`（只看不改） | 显示端口、监听状态、GitHub 连通性 |

> 一句话：**你卡住大概率不是命令敲错，而是 Git 没走代理 + 没登录。**

---

## 1. 先选一条路线

| | 路线 A · 网页上传 | 路线 B · 命令行 Git |
|---|---|---|
| 需要装软件吗 | 不用，有浏览器就行 | 需要 Git（本机已有便携版） |
| 要敲命令吗 | 零命令 | 约 8 行 |
| 要配代理/登录吗 | 不用 | 要 |
| 以后改内容 | 网页上编辑或重新上传文件 | `sh deploy.sh` 一键推送 |
| 适合 | **只想先把网站上线看看** | 想长期维护、批量更新 |

**建议：先走路线 A 把站点跑通，确认能访问了；以后想长期用再回头配路线 B。** 两条路不冲突，仓库是同一个。

---

## 2. 路线 A · 网页上传（零命令，推荐先做这个）

### 第 1 步：打开你的仓库
浏览器访问 `https://github.com/你的用户名/仓库名`，确认停在仓库首页（能看到 `Code` / `Issues` / `Pull requests` 那一排）。

### 第 2 步：上传文件
1. 点 **Add file** → **Upload files**。
2. 打开本机的 `axutongxue-clone` 文件夹，**把里面的内容全部拖进上传区**：
   - 根目录的文件：`index.html`、`editor.html`、`reply.html`、`README.md`、`.gitignore`、`GITHUB-PAGES.md`、`deploy.sh`
   - 两个文件夹：`css`、`js`
   - Chrome / Edge 支持直接拖文件夹，会保留 `css/style.css`、`js/data.js`、`js/app.js` 的目录结构。
   - 如果浏览器不支持拖文件夹：先只拖根目录的文件并提交，再点 `Add file → Upload files` 分两次上传 `css/style.css` 和 `js` 里的两个文件（GitHub 会在路径框里显示文件夹，需要手动输入 `css/` 和 `js/` 前缀；**更省事的做法是直接用路线 B**）。
3. 等进度条全部走完，页面下方 **Commit changes** 区域填：
   - 提交说明：`init: 资源导航站`
   - 选 **Commit directly to the `main` branch**
4. 点绿色的 **Commit changes**。

> `.gitignore` 是隐藏文件，Windows 资源管理器默认不显示。看不到它没关系，漏传不影响网站运行。

### 第 3 步：开启 GitHub Pages
1. 仓库页点最右侧 **Settings**（齿轮）。
2. 左侧菜单往下拉，点 **Pages**。
3. **Build and deployment** 区域：
   - **Source** 选 `Deploy from a branch`
   - **Branch** 选 `main`，右边目录选 `/ (root)`
4. 点 **Save**。
5. 页面顶部会出现一条蓝条：`Your site is live at https://xxx.github.io/仓库名/`。**等 1~2 分钟**再打开。

### 第 4 步：确认能访问
打开 `https://你的用户名.github.io/仓库名/`。
- 看到导航目录 + 顶部标题 → 成功。
- 404 → 回到第 3 步检查分支是否选了 `main`、是否点了 Save，再等 2 分钟。
- 有文字但没样式 → 按 `F12` 看 Console 报哪个文件 404，通常是 `css/` 或 `js/` 文件夹没传上去（回到第 2 步补传）。

### 路线 A 以后怎么改内容
- 小改：仓库里点开 `js/data.js` → 右上角铅笔 **Edit this file** → 改完直接 Commit changes。
- 用可视化编辑器改：在 `editor.html` 里改完导出 `data.js` → 仓库 `js/` 目录 → **Add file → Upload files** → 把新的 `data.js` 拖进去，同名会提示替换 → Commit。等 1 分钟刷新即可。

---

## 3. 路线 B · 命令行 Git（可长期维护）

### B0. 首选：双击「一键上线.bat」，零命令（推荐零基础）

在 `axutongxue-clone` 文件夹里双击 **`一键上线.bat`**，按中文提示粘贴一次仓库地址，脚本会自动完成 B1~B4 的全部动作：

- 自动定位本机便携版 Git 的绝对路径（系统 PATH 里没有 Git，脚本已写死实测路径）
- 用 `用户名@users.noreply.github.com` 自动设置提交身份（GitHub 官方隐私邮箱，不用查注册邮箱）
- 用 `reg query` 自动读取 Windows 系统代理端口（当前 7892；换软件或换端口会自动跟随），写入 `http.proxy` / `https.proxy`，并清空会干扰的沙箱代理变量
- 第 1 步自动显示「上次用过的仓库地址」，**直接按回车即可沿用**，不必重新粘贴，避免手输错名字
- 上传前用 `curl` 查 `https://api.github.com/repos/用户名/仓库名`，返回 200 才显示「[确认] GitHub 上找到了这个仓库」；返回 404 会醒目提醒名字可能不对（私有仓库可手动确认后继续）
- 地址解析只截掉**末尾**的 `.git`，不再误伤 `.github.io` 这类仓库名
- 自动 `remote add origin` → `git add -A` → `git commit` → `git push -u origin main`
- push 失败时自动尝试 `git pull --allow-unrelated-histories --no-rebase --no-edit -X ours` 后重推（应对建仓库时勾了 README；`--no-rebase` 是 Git 新版必需）
- 成功后自动打开 Pages 设置页，并打印最终网址

**过程中你只需要**：粘贴地址按回车 → 确认按回车 → 登录弹窗选 `Sign in with your browser` 并在网页点 `Authorize`。
详细图解见 `小白上线指南.html`。

以后改完内容，双击 **`一键更新.bat`** 即可（自动 add / commit / push），不用再填任何信息。
想确认端口或网络是否正常，双击 **`检查网络.bat`**（只看不改，用中文显示端口、代理软件状态和 GitHub 连通性）。

> 这三个 `.bat` 用 GBK 编码 + CRLF 换行（本机 cmd 代码页 936），含本机绝对路径，已加入 `.gitignore`，**不会上传到公开仓库**。

### B0-备选：想自己敲命令（可选）

- **省事**：直接在 WorkBuddy 的终端里执行下面的命令，Git 已经就绪。
- **长期**：装 [Git for Windows](https://git-scm.com/download/win)，一路「下一步」即可；之后在 `axutongxue-clone` 文件夹右键 → **Git Bash Here**。

> 如果你是在 WorkBuddy 内置终端里执行，先运行一次下面这行，去掉沙箱自带的代理变量（它会连不上 GitHub）：
> ```bash
> unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY
> ```

### B1. 配置身份（只需一次）
把引号里换成你自己的（**邮箱必须是注册 GitHub 用的那个**，否则提交不计入你的贡献图）：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你注册GitHub的邮箱"
```

想确认：`git config --global user.name`

### B2. 配置代理（本机关键一步）

Git 不会自动读 Windows 的系统代理，必须显式告诉它。当前系统代理是 `127.0.0.1:7892`（实测 github.com / api.github.com 均返回 200）。

**端口 7892 在哪看、在哪设：**

| 想干什么 | 去哪里 |
|---|---|
| 只看一眼当前端口 | 双击 `检查网络.bat`（同时显示端口、监听状态、GitHub 连通性）；或 PowerShell 执行 `(Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings').ProxyServer` |
| 在 Windows 里看 | 设置 → 网络和 Internet → 代理 → 手动设置代理 → **编辑** → 「端口」栏 |
| 在软件里改端口 | 打开代理软件 → 设置 → 找「端口设置 / HTTP 混合端口 / Mixed Port / 本地监听端口」→ 改数字后重新打开「系统代理」开关 |
| 查端口归哪个程序 | `Get-NetTCPConnection -LocalPort 7892 -State Listen` 拿 PID，再 `Get-Process -Id <PID>` |

本机实测：7892 由 `F:\hhycenter\hhycenterCore.exe` 监听并写入系统代理；另装有 Clash Verge，其配置 `mixed-port: 7897` / `verge_mixed_port: 7897`（`%APPDATA%\io.github.clash-verge-rev.clash-verge-rev\config.yaml`），当前未接管系统代理。**两个软件端口不同，以 Windows 里显示的为准。**

> 端口不需要手工维护：`一键上线.bat` / `一键更新.bat` 已改为用 `reg query` 读取 `ProxyServer` 并自动取冒号后的端口，读不到才回退 7892；模拟端口改成 7897 已实测能自动跟随。

手动配置命令（把 `端口` 换成上面查到的数字）：

```bash
git config --global http.proxy http://127.0.0.1:端口
git config --global https.proxy http://127.0.0.1:端口
```

- 端口变了不用改脚本，重新双击一次即可。
- 以后换了网络、不需要代理了，用这两行取消：
  ```bash
  git config --global --unset http.proxy
  git config --global --unset https.proxy
  ```
- 验证代理通不通：
  ```bash
  curl -I https://github.com/
  ```
  看到 `HTTP/1.1 200 OK` 就对了。

### B3. 复制仓库地址
GitHub 仓库页 → 绿色 **Code** 按钮 → 切到 **HTTPS** → 点右边复制图标，得到：
```
https://github.com/你的用户名/仓库名.git
```
> 空仓库首页其实已经贴心地列了一段 `…or push an existing repository from the command line`，里面就是 B4 要用的命令，直接复制也行。

### B4. 提交并推送
因为 `init` / `add` / `main` 分支我都帮你做好了，你只需要四行：

```bash
cd axutongxue-clone
git remote add origin https://github.com/你的用户名/仓库名.git
git commit -m "init: 资源导航站"
git push -u origin main
```

逐行在做什么：
- `git remote add origin …`：给本地仓库起个叫 `origin` 的别名，指向你的 GitHub 仓库。
- `git commit`：把已暂存的 8 个文件打包成一次提交。
- `git push -u origin main`：上传到 GitHub 的 `main` 分支，`-u` 记住关联，以后直接 `git push` 就行。

**第一次 push 会弹登录窗口**（Git Credential Manager）：
1. 选 **Sign in with your browser**（浏览器登录）。
2. 浏览器里点 **Authorize** 授权。
3. 回到终端，看到 `Enumerating objects…` / `Writing objects… 100%` 就是成功。

如果没弹窗或提示 `Authentication failed`：
- GitHub 早已**禁止用账号密码推送**，别试密码。
- 改用 Personal Access Token：GitHub 头像 → **Settings** → 左侧最下 **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)** → 勾选 `repo` → 生成并**立刻复制** token（只显示一次）。
- push 时用户名填 GitHub 用户名，**密码那一栏粘贴 token**。
- ⚠️ token 不要写进任何项目文件、不要提交到仓库、不要发给别人。

### B5. 开启 Pages
和路线 A 第 3 步完全一样：**Settings → Pages → Source: Deploy from a branch → Branch: `main` / `/ (root)` → Save**，等 1~2 分钟访问 `https://你的用户名.github.io/仓库名/`。

### B6. 以后每次改内容（一条命令）
```bash
sh deploy.sh
```
脚本会自动 `git add` → `git commit`（带时间戳）→ `git push origin main`。等 1 分钟刷新线上页面即可。

想手动也行：
```bash
git add .
git commit -m "update: 更新资源"
git push
```

---

## 4. 访问地址与子路径说明

| 仓库名 | 访问地址 |
|---|---|
| `用户名.github.io` | `https://用户名.github.io/` |
| 其他任意名字，如 `nav` | `https://用户名.github.io/nav/` |

本项目 `index.html` 里所有资源引用（`css/style.css`、`js/data.js`、`js/app.js`、`reply.html`）**都是相对路径**，子路径部署不用改任何文件。

---

## 5. 常见报错对照表

| 现象 | 原因 | 处理 |
|---|---|---|
| `remote: Repository not found` / `fatal: repository '...' not found` | 仓库名解析错了，或仓库未创建 / 私有 / 登录账号无权 | 核对浏览器地址栏里的 `用户名/仓库名`；`git remote set-url origin https://github.com/用户名/仓库名.git`；也可用 `curl https://api.github.com/users/用户名/repos` 列出公开仓库核对。**注意 `.github.io` 仓库名**：脚本早期用 `!VAR:.git=!` 全局去后缀，会把 `.github` 的前 4 个字符也删掉，变成 `hub.io`；已改为只截末尾 4 字符 |
| `Failed to connect to github.com port 443: Timed out` | Git 没走代理，或代理软件没开 | 先双击 `检查网络.bat` 确认；执行 B2；WorkBuddy 终端还要先 `unset` 沙箱代理变量 |
| `Authentication failed` / `Password authentication was removed` | 用了账号密码 | 用浏览器授权，或改用 PAT 当密码 |
| `fatal: remote origin already exists` | 之前加过远程 | `git remote set-url origin https://github.com/用户名/仓库名.git` |
| `error: failed to push some refs` / 提示先 pull | 建仓库时勾了 README / License，远端已有提交 | `git pull origin main --rebase` 后再 `git push`；或按提示操作 |
| `Author identity unknown` | 没设 user.name / email | 执行 B1 |
| 打开网址 404 | Pages 没开、分支选错、还在构建 | 检查 Settings → Pages 是否为 `main` / `root`；等 2 分钟；`Ctrl+F5` |
| 页面有文字但没样式 / 点不动 | `css/` 或 `js/` 没上传成功 | F12 看 Console 的 404 文件；路线 A 需补传文件夹 |
| 改完本地，线上还是旧的 | 浏览器缓存 / Pages 还在构建 | 等 1~2 分钟，`Ctrl+F5` 强刷 |
| 仓库是 Private | 部分设置下 Pages 行为不同 | 最省事：Settings → 最底部 Danger Zone → Change visibility → **Public** |

---

## 6. 绑定自己的域名（可选）

1. 仓库 **Settings → Pages → Custom domain** 填你的域名，点 Save。
2. 去域名解析后台加一条 **CNAME**：主机记录 `www`（或 `@`），记录值 `你的用户名.github.io`。
3. 等解析生效后回来勾 **Enforce HTTPS**。
4. 用 `用户名.github.io` 这类境外托管域名不需要备案；若改用国内对象存储/CDN 并绑定自定义域名，则需按国内要求完成 ICP 备案。

---

## 7. 上线前最后检查

- [ ] `js/data.js` 已换成你自己的内容（当前还是示例占位链接）
- [ ] `meta.title` / `heading` / `footer` 已改成你自己的站名
- [ ] 飘带指向的 `reply.html` 存在（或已把 `meta.ribbon.url` 改成别的地址）
- [ ] 仓库设为 Public
- [ ] Pages 的 Branch 是 `main`、目录是 `/ (root)`
- [ ] 首页、编辑器页、深浅色、搜索都点一遍
