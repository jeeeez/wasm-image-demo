import Pica from 'pica';

interface ImageData {
  id: string;
  file: File;
  originalUrl: string;
  thumbnailUrl: string;
  thumbnailTime: number;
  originalSize: number;
  thumbnailSize: number;
}

const images: ImageData[] = [];

// 初始化 Pica (高性能图片缩放库，使用 WebAssembly)
const pica = new Pica();

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 使用 Pica 生成缩略图 (基于 WebAssembly 的高性能图片处理)
async function generateThumbnail(file: File): Promise<{ dataUrl: string; time: number; size: number }> {
  const startTime = performance.now();
  
  // 创建图片元素并加载原图
  const img = new Image();
  const imgUrl = URL.createObjectURL(file);
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imgUrl;
  });
  
  // 创建源 canvas
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = img.width;
  sourceCanvas.height = img.height;
  const sourceCtx = sourceCanvas.getContext('2d');
  if (!sourceCtx) throw new Error('无法创建 Canvas 上下文');
  sourceCtx.drawImage(img, 0, 0);
  
  // 创建目标 canvas (400x400)
  const targetCanvas = document.createElement('canvas');
  const thumbnailSize = 400;
  targetCanvas.width = thumbnailSize;
  targetCanvas.height = thumbnailSize;
  
  // 使用 Pica 进行高质量缩放 (内部使用 WebAssembly 加速)
  await pica.resize(sourceCanvas, targetCanvas, {
    quality: 3,
    alpha: true,
    unsharpAmount: 80,
    unsharpRadius: 0.6,
    unsharpThreshold: 2
  });
  
  // 转换为 Blob 和 DataURL
  const blob = await new Promise<Blob>((resolve, reject) => {
    targetCanvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('转换失败'));
    }, 'image/jpeg', 0.9);
  });
  
  const dataUrl = await blobToDataUrl(blob);
  
  // 清理
  URL.revokeObjectURL(imgUrl);
  
  const endTime = performance.now();
  const time = endTime - startTime;
  
  return {
    dataUrl,
    time,
    size: blob.size
  };
}

// Blob 转 DataURL
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// File 转 DataURL
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 处理选择的图片
async function handleFiles(files: FileList) {
  if (files.length === 0) return;

  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'block';

  try {
    // 处理每张图片
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 创建原图 URL
      const originalUrl = await fileToDataUrl(file);
      
      // 生成缩略图
      const { dataUrl: thumbnailUrl, time: thumbnailTime, size: thumbnailSize } = await generateThumbnail(file);
      
      // 添加到图片列表
      const imageData: ImageData = {
        id: `img-${Date.now()}-${i}`,
        file,
        originalUrl,
        thumbnailUrl,
        thumbnailTime,
        originalSize: file.size,
        thumbnailSize
      };
      
      images.push(imageData);
      
      // 渲染图片卡片
      renderImageCard(imageData);
    }

    updateImageCount();
  } catch (error) {
    console.error('处理图片失败:', error);
    alert('处理图片失败,请确保选择的是有效的图片文件');
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// 渲染图片卡片
function renderImageCard(imageData: ImageData) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const card = document.createElement('div');
  card.className = 'image-card';
  card.id = imageData.id;
  
  card.innerHTML = `
    <div class="image-header">
      <div class="image-name" title="${imageData.file.name}">${imageData.file.name}</div>
      <div class="image-size">${formatFileSize(imageData.originalSize)}</div>
    </div>
    
    <div class="image-comparison">
      <div class="image-section">
        <img src="${imageData.originalUrl}" alt="原图">
        <div class="image-label">原图</div>
      </div>
      
      <div class="image-section">
        <img src="${imageData.thumbnailUrl}" alt="缩略图">
        <div class="image-label">缩略图</div>
        <div class="thumbnail-time">⚡ ${imageData.thumbnailTime.toFixed(2)} ms</div>
      </div>
    </div>
    
    <div class="image-info">
      <div class="info-item">
        <span class="info-label">原图尺寸</span>
        <span>${formatFileSize(imageData.originalSize)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">缩略图尺寸</span>
        <span>${formatFileSize(imageData.thumbnailSize)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">压缩率</span>
        <span>${((1 - imageData.thumbnailSize / imageData.originalSize) * 100).toFixed(1)}%</span>
      </div>
    </div>
  `;
  
  gallery.appendChild(card);
}

// 更新图片计数
function updateImageCount() {
  const countEl = document.getElementById('image-count');
  const clearBtn = document.getElementById('clear-button');
  
  if (countEl) {
    if (images.length === 0) {
      countEl.textContent = '未选择图片';
      if (clearBtn) clearBtn.style.display = 'none';
    } else {
      countEl.textContent = `已选择 ${images.length} 张图片`;
      if (clearBtn) clearBtn.style.display = 'inline-block';
    }
  }
}

// 清空所有图片
function clearAllImages() {
  images.length = 0;
  const gallery = document.getElementById('gallery');
  if (gallery) gallery.innerHTML = '';
  
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
  
  updateImageCount();
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const clearButton = document.getElementById('clear-button');
  
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFiles(target.files);
      }
    });
  }
  
  if (clearButton) {
    clearButton.addEventListener('click', clearAllImages);
  }
});

