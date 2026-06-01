import type { ImageSource, CanvasLike } from '../services/image-processor.service';

function createSquareCanvas(size: number): CanvasLike {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(size, size);
  }
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

export function getSourceDimensions(source: ImageSource): { width: number; height: number } {
  return {
    width: source instanceof HTMLImageElement ? source.naturalWidth : source.width,
    height: source instanceof HTMLImageElement ? source.naturalHeight : source.height,
  };
}

export function normalizeToSquare(source: ImageSource, background: string): CanvasLike {
  const srcW = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const srcH = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const size = Math.max(srcW, srcH);

  const canvas = createSquareCanvas(size);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  const scale = Math.min(size / srcW, size / srcH);
  const drawW = Math.round(srcW * scale);
  const drawH = Math.round(srcH * scale);
  const offsetX = Math.round((size - drawW) / 2);
  const offsetY = Math.round((size - drawH) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, offsetX, offsetY, drawW, drawH);

  return canvas;
}

export function resizeCanvas(source: CanvasLike, size: number): CanvasLike {
  const canvas = createSquareCanvas(size);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, size, size);
  return canvas;
}
