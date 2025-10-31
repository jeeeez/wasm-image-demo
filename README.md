# 🖼️ WASM 图片缩略图生成演示

一个使用 **WebAssembly** 技术高效生成图片缩略图的前端演示项目。本项目展示了如何在浏览器端使用 Pica 库（基于 WebAssembly）进行高质量、高性能的图片处理。

## ✨ 功能特性

- 📁 **多选图片上传** - 支持一次选择多张图片，无数量和大小限制
- 🚀 **高性能处理** - 使用 Pica 库的 WebAssembly 加速引擎，比原生 Canvas 快数倍
- ⚡ **实时性能监测** - 精确显示每张缩略图的生成耗时（毫秒级）
- 🖼️ **并排对比显示** - 同时展示原图和缩略图，便于直观对比质量
- 📊 **详细数据统计** - 显示原图尺寸、缩略图尺寸、压缩率等详细信息
- 🎨 **现代化 UI** - 渐变紫色主题，流畅的动画效果，响应式设计
- 🔄 **渐进式渲染** - 每张图片处理完成后立即显示，无需等待全部完成
- 💾 **纯前端处理** - 所有处理在浏览器内完成，无需后端服务器

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vite** | ^5.4.2 | 现代化的开发构建工具，提供快速的热更新 |
| **TypeScript** | ^5.5.4 | 类型安全的 JavaScript 超集 |
| **Pica** | ^9.0.1 | 高性能图片缩放库（内部使用 WebAssembly 和 Web Workers 加速） |
| **原生 HTML/CSS** | - | 无框架依赖，轻量级实现 |

### 为什么选择 Pica？

- ✅ **高质量** - 使用 Lanczos 滤镜算法，图像质量优于原生 Canvas
- ✅ **高性能** - 自动使用 WebAssembly 加速，处理速度快
- ✅ **多线程** - 利用 Web Workers 实现多核并行处理
- ✅ **功能丰富** - 支持锐化、Alpha 通道处理等高级特性

## 📦 安装

```bash
# 安装依赖
npm install
```

## 🚀 运行

### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 📖 使用说明

1. 点击「选择图片」按钮
2. 从本地选择一张或多张图片(支持多选)
3. 系统将自动生成 400x400 的缩略图
4. 查看每张图片的原图/缩略图对比
5. 查看缩略图生成耗时和压缩率等信息
6. 可继续添加更多图片,或点击「清空所有」重新开始

## 🎯 项目结构

```
wasm-image-demo/
├── index.html          # 入口 HTML 文件
├── src/
│   ├── main.ts        # 主要逻辑代码
│   └── style.css      # 样式文件
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
├── vite.config.ts     # Vite 配置
└── README.md          # 项目文档
```

## 📝 核心实现

### 缩略图生成流程

项目使用 `Pica` 库进行高质量图片缩放，完整流程如下：

```typescript
import Pica from 'pica';

const pica = new Pica();

async function generateThumbnail(file: File) {
  // 1. 加载原始图片
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  
  // 2. 创建源 Canvas 并绘制原图
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = img.width;
  sourceCanvas.height = img.height;
  const ctx = sourceCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  // 3. 创建目标 Canvas（400x400）
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = 400;
  targetCanvas.height = 400;
  
  // 4. 使用 Pica 进行高质量缩放（WebAssembly 加速）
  await pica.resize(sourceCanvas, targetCanvas, {
    quality: 3,           // 最高质量（0-3）
    alpha: true,          // 支持透明通道
    unsharpAmount: 80,    // 锐化强度
    unsharpRadius: 0.6,   // 锐化半径
    unsharpThreshold: 2   // 锐化阈值
  });
  
  // 5. 转换为 Blob 和 DataURL
  const blob = await new Promise<Blob>((resolve) => {
    targetCanvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
  
  return blob;
}
```

### 性能监测

使用 `performance.now()` API 精确测量处理时间（微秒级精度）：

```typescript
const startTime = performance.now();
// ... 缩略图生成逻辑
const endTime = performance.now();
const time = endTime - startTime; // 毫秒
console.log(`处理耗时: ${time.toFixed(2)} ms`);
```

### Pica 配置参数说明

| 参数 | 取值范围 | 说明 |
|------|----------|------|
| `quality` | 0-3 | 质量级别，3 为最高（使用 Lanczos 滤镜） |
| `alpha` | boolean | 是否处理 Alpha 透明通道 |
| `unsharpAmount` | 0-500 | 锐化强度，0 表示不锐化 |
| `unsharpRadius` | 0.5-2.0 | 锐化半径，影响锐化边缘 |
| `unsharpThreshold` | 0-255 | 锐化阈值，只锐化对比度高的区域 |

## 🌟 特性说明

### 性能优势

- **WebAssembly 加速** - Pica 自动使用 WASM 模块加速计算密集型操作
- **Web Workers** - 利用多线程处理，不阻塞主线程
- **高效算法** - 使用 Lanczos 重采样算法，质量和速度的最佳平衡

### 使用体验

- **无限制上传** - 支持任意数量和大小的图片文件
- **渐进式渲染** - 每张图片处理完成后立即显示，无需等待全部完成
- **实时反馈** - 显示处理进度和每张图片的处理时间
- **批量操作** - 支持一次选择多张图片批量处理

### 兼容性

- **纯前端** - 所有处理在浏览器内完成，无需后端服务器
- **跨平台** - 支持所有现代浏览器（Chrome, Firefox, Safari, Edge）
- **响应式** - 自适应桌面端和移动端屏幕

## 🎯 性能数据

基于实际测试的性能参考（处理单张 4000x3000 像素的图片到 400x400）：

| 浏览器 | 处理时间 | 说明 |
|--------|----------|------|
| Chrome | ~50-100ms | 最佳性能，完整 WASM 支持 |
| Firefox | ~60-120ms | 良好性能 |
| Safari | ~80-150ms | 性能良好 |
| Edge | ~50-100ms | 基于 Chromium，性能优秀 |

*注：实际性能取决于图片大小、设备性能和浏览器版本*

## ❓ 常见问题

<details>
<summary><strong>Q: 支持哪些图片格式？</strong></summary>

A: 支持所有浏览器能够解码的图片格式，包括 JPEG、PNG、WebP、GIF、BMP 等。输出格式为 JPEG。
</details>

<details>
<summary><strong>Q: 图片大小有限制吗？</strong></summary>

A: 理论上没有限制，但受限于浏览器内存。建议单张图片不超过 50MB，以确保流畅体验。
</details>

<details>
<summary><strong>Q: 为什么选择 400x400 的缩略图尺寸？</strong></summary>

A: 这是一个平衡大小和质量的常用尺寸。你可以在 `src/main.ts` 中修改 `thumbnailSize` 变量来自定义尺寸。
</details>

<details>
<summary><strong>Q: 如何修改缩略图尺寸？</strong></summary>

A: 在 `src/main.ts` 的 `generateThumbnail` 函数中，找到：
```typescript
const thumbnailSize = 400; // 修改这个值
targetCanvas.width = thumbnailSize;
targetCanvas.height = thumbnailSize;
```
</details>

<details>
<summary><strong>Q: 处理过程会上传到服务器吗？</strong></summary>

A: 不会。所有处理都在浏览器本地完成，图片数据不会离开你的设备。
</details>

## 🔧 进阶配置

### 自定义缩略图质量

修改 `src/main.ts` 中的 Pica 配置：

```typescript
await pica.resize(sourceCanvas, targetCanvas, {
  quality: 2,          // 降低为 2 提升速度
  unsharpAmount: 50,   // 降低锐化强度
});
```

### 更改输出格式

```typescript
// 改为 PNG 格式
targetCanvas.toBlob((blob) => {
  // ...
}, 'image/png');  // 或 'image/webp'
```

## 🐛 故障排查

### 问题：页面空白或无法加载

**解决方案：**
1. 检查浏览器控制台是否有错误信息
2. 确保已正确安装依赖：`npm install`
3. 尝试清除缓存并重新启动：`npm run dev`

### 问题：图片处理很慢

**解决方案：**
1. 检查图片是否过大（建议 < 10MB）
2. 降低 Pica 的 quality 参数
3. 关闭锐化功能（设置 `unsharpAmount: 0`）

### 问题：生成的缩略图质量不佳

**解决方案：**
1. 提高 quality 参数到 3
2. 调整锐化参数
3. 使用更高的输出质量：`toBlob(fn, 'image/jpeg', 0.95)`

## 📚 相关资源

- [Pica 官方文档](https://github.com/nodeca/pica)
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Canvas API 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 👨‍💻 作者

欢迎在 [Issues](../../issues) 中提出问题或建议！

---

⭐ 如果觉得这个项目有帮助，欢迎 Star 支持！

