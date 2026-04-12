# 留学生 16 人格生存图鉴

轻讽刺向的留学生人格测试。24 道灵魂拷问 → 16 种人格之一 → 生成小红书可分享的 9:16 海报。

## 🗂 项目结构

```
liuxuesheng-app/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── README.md
└── src/
    ├── main.jsx       ← React entry
    ├── App.jsx        ← 完整 quiz 组件 (~1600 行)
    └── index.css      ← Tailwind + base styles
```

---

## 🚀 本地跑通 (5 分钟)

前置: **Node.js 18+** (`node -v` 检查)

```bash
cd liuxuesheng-app
npm install         # 装 react / vite / tailwind / recharts / lucide-react
npm run dev         # 启动 dev server,默认在 http://localhost:5173
```

手机同网测试: `npm run dev` 默认带 `--host` 参数,终端会显示类似 `Network: http://192.168.x.x:5173` —— 用手机打开这个地址即可。

---

## 🌐 部署到 Vercel (10 分钟)

### 方法 A: CLI 部署 (最快)

```bash
npm run build            # 产出 dist/
npm i -g vercel
vercel                   # 跟着提示走,第一次会让你登录
```

第一次部署 Vercel 会问几个问题:
- Set up and deploy? **Y**
- Which scope? 选你自己的账号
- Link to existing project? **N**
- Project name? 回车用默认
- In which directory is your code? **./** (回车)
- Want to override settings? **N** (Vite 自动识别)

5 秒后拿到 `xxx-xxx.vercel.app` 的 URL,复制到手机打开测试。

### 方法 B: GitHub + Vercel 网页 (更适合长期维护)

1. `git init && git add . && git commit -m "init"` 
2. 在 github.com 新建仓库,`git remote add origin ... && git push -u origin main`
3. 登录 vercel.com → New Project → Import Git Repository → 选刚才的仓库
4. Framework Preset 选 **Vite** (默认应该就是)
5. Deploy → 30 秒搞定

之后每次 `git push` Vercel 都会自动重新部署。

---

## 🎨 上线前建议补一下

### 1. OG 分享图 (2 分钟)

目前 `index.html` 里的 `og:image` 指向 `/og-image.png` 但文件还不存在。在 `public/` 目录下放一张 1200×630 的预览图 (比如首页截图或一张 16 人格集合图),微信/小红书分享链接时会显示封面。

```bash
mkdir public
# 把一张 og-image.png 放进去
```

### 2. Favicon (1 分钟)

当前 `index.html` 里用的是一个内联 SVG favicon (奶油底 + 红色 "16")。如果你想换成自己的图标,在 `public/` 里放一个 `favicon.ico` 或 `icon.svg`,然后改 `index.html` 里的 `<link rel="icon">`。

### 3. 自定义域名 (5 分钟,可选)

Vercel Dashboard → Settings → Domains → Add → 输你的域名 → 按提示在 DNS 那边加一条 CNAME 记录 (如 `CNAME @ cname.vercel-dns.com`)。等 DNS 生效 (通常 5-30 分钟) 就行。

### 4. 埋点 (可选,3 分钟)

推荐 Plausible 或 Umami (都是隐私友好的轻量分析):

```html
<!-- 加在 index.html </head> 之前 -->
<script defer data-domain="你的域名.com" src="https://plausible.io/js/script.js"></script>
```

就能看到每日访问量、哪个人格被分享最多、用户停在哪一题最久。

---

## 🛠 常见问题

**Q: `npm install` 报错 node-gyp 相关**
A: 升级 Node 到 18+ 或 20。删掉 `node_modules` 和 `package-lock.json` 重跑。

**Q: 部署后字体是系统默认不是衬线**  
A: 组件会在 mount 时从 Google Fonts 加载 Instrument Serif / JetBrains Mono / Noto Sans SC。国内访问 Google Fonts 不稳,可以换成国内 CDN:
```js
// src/App.jsx 里搜索 'fonts.googleapis.com' 改成
// 'https://fonts.font.im/css2?...' 或 'https://fonts.loli.net/css2?...'
```

**Q: 下载海报按钮不工作**
A: `html2canvas` 从 `cdnjs.cloudflare.com` 动态加载。如果网络禁用了 cdnjs,可以:
```bash
npm install html2canvas
```
然后把 `src/App.jsx` 里的 `loadHtml2Canvas` 函数改成直接 `import html2canvas from 'html2canvas'`。

**Q: 手机上雷达图看不见**  
A: 已经修了,用的是 inline style 硬编码像素高度。如果还有问题,检查 recharts 版本是否 2.12+。

---

## 📊 数据说明

- **题库**: 36 道,每次随机抽 24 道做答
- **维度**: 4 个二元对立 (社交 E/I · 文化 C/W · 目标 H/F · 心态 A/S)
- **人格**: 16 种,都是中文称号 + 4 字母梗词组合
- **算法**: 归一化打分,避免 tag 分布不均导致偏向某几个热门型
- **分布**: Monte Carlo 10000 次模拟下,16 型覆盖率 100%,范围 3.6%-8.5%,std dev 1.49

---

## 🙏 Credit

结构灵感来自 MBTI,内容风格取自小红书留学生板块的集体自嘲文化。
