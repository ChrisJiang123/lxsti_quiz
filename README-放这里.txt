把你生成的 1200×630 分享图命名为 og-image.png 放在这个 public 文件夹里。
Vite build 时会自动复制到 dist/ 根目录,index.html 里的 /og-image.png 引用就会生效。

如果暂时没图,可以删掉 index.html 里的 og:image 和 twitter:image 两行,
避免空引用让分享卡片显示 broken image 图标。
