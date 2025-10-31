# WASM 图片缩略图生成演示

一个使用 WebAssembly 技术高效生成图片缩略图的前端演示项目。

## ✨ 功能特性

- 📁 **多选图片上传** - 支持一次选择多张图片,无数量和大小限制
- 🚀 **高性能处理** - 使用 wasm-image 库进行 WebAssembly 加速
- ⚡ **实时性能监测** - 显示每张缩略图的生成耗时
- 🖼️ **对比显示** - 同时展示原图和缩略图,便于对比
- 📊 **详细信息** - 显示文件大小、压缩率等详细数据
- 🎨 **现代 UI** - 美观的渐变设计和流畅的交互动画

## 🛠️ 技术栈

- **Vite** - 快速的开发构建工具
- **TypeScript** - 类型安全的 JavaScript
- **Pica** - 高性能图片缩放库(内部使用 WebAssembly 加速)
- **原生 HTML/CSS** - 无框架依赖,轻量级实现

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

### 缩略图生成

使用 `Pica` 库进行高质量缩放(内部使用 WebAssembly 加速):

```typescript
import Pica from 'pica';

const pica = new Pica();

// 使用 Pica 进行高质量缩放
await pica.resize(sourceCanvas, targetCanvas, {
  quality: 3,
  alpha: true,
  unsharpAmount: 80,
  unsharpRadius: 0.6,
  unsharpThreshold: 2
});
```

### 性能监测

使用 `performance.now()` API 精确测量处理时间:

```typescript
const startTime = performance.now();
// ... 缩略图生成逻辑
const endTime = performance.now();
const time = endTime - startTime;
```

## 🌟 特性说明

- **无限制上传** - 支持任意数量和大小的图片文件
- **渐进式加载** - 每张图片处理完成后立即显示,无需等待全部完成
- **内存友好** - 使用 DataURL 方式在浏览器内存中处理,无需服务器
- **响应式设计** - 自适应不同屏幕尺寸,移动端友好

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

