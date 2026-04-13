# 留学生 16 人格生存图鉴

> 24 道灵魂拷问 · 16 种人格 · 一张你愿意转发的海报

一个面向留学生的人格测试 Web App。灵感来自 MBTI 的结构，但用中文称号 + 4 字母梗词命名人格（比如 `CHLL 宿舍大佛`、`FLEX 六边形战士`、`EMOO 深夜破防家`），走的是自嘲 + 暖心的路线——戳中你的同时，也给你一个温柔的 reframe。

**线上地址：** [lxsti.dev](https://lxsti.dev)

## 特色

- **36 道题随机抽 24**，每次体验都不完全一样
- **归一化打分算法**，避免结果偏向热门人格（16 型分布均匀，3.5%–9%）
- **移动端优先**，所有交互针对手机触摸优化
- **一键生成分享海报**，9:16 PNG，可以直接发小红书/朋友圈
- **Zine / Risograph 美学**，不走紫色渐变那种 AI slop 风

## 技术栈

- **Vite 5** + **React 18** —— 快速、现代、零配置
- **Tailwind CSS 3** —— 样式 utility-first
- **Recharts** —— 结果页的生存雷达图
- **lucide-react** —— 图标
- **html2canvas** —— 海报导出（按需从 CDN 加载）


## 项目结构

```
liuxuesheng-app/
├── index.html              # 含 OG meta + favicon
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── public/                 # 静态资源(OG 图等放这里)
└── src/
    ├── main.jsx           # React 入口
    ├── App.jsx            # 全部业务逻辑(单文件组件)
    └── index.css          # Tailwind + 全局 base
```

整个 App 都在 `src/App.jsx` 一个文件里——包括 16 型人格定义、36 道题库、打分算法、所有 UI 组件、海报生成。想改文案、加题目、调样式都在这里。

## 部署

本项目部署在 Vercel。连接 GitHub 后每次 push 自动构建。

```bash
npm run build    # 本地产出 dist/
npm run preview  # 本地预览 build 结果
```

## 许可

MIT
