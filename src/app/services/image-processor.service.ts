import { Injectable } from '@angular/core';
import type { ImageProcessingSettings } from '../models/processing-settings';
import type { Dimensions } from '../models/dimensions';
import type { StripMetadataSettings } from '../models/strip-metadata-settings';
import type { ProcessingOutput } from '../models/processing-output';
import type { ImageFormat } from '../models/processing-settings';
import type { CropRect, CropSettings } from '../models/crop-settings';

export type ImageSource = ImageBitmap | HTMLImageElement;
export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;

@Injectable({ providedIn: 'root' })
export class ImageProcessorService {
  async loadImage(file: File): Promise<ImageSource> {
    try {
      return await createImageBitmap(file);
    } catch {
      return await this.loadImageFallback(file);
    }
  }

  async drawToCanvas(
    source: ImageSource,
    dimensions?: Dimensions,
  ): Promise<CanvasLike> {
    const width = dimensions?.width ?? (source instanceof HTMLImageElement ? source.naturalWidth : source.width);
    const height = dimensions?.height ?? (source instanceof HTMLImageElement ? source.naturalHeight : source.height);

    const canvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : document.createElement('canvas');

    if (canvas instanceof HTMLCanvasElement) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) {
      throw new Error('Failed to get 2d context from canvas');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, width, height);

    return canvas;
  }

  async encode(canvas: CanvasLike, settings: ImageProcessingSettings): Promise<Blob> {
    const { format, quality, stripMetadata } = settings;
    const mimeType = this.mimeTypeFor(format);

    if (canvas instanceof OffscreenCanvas) {
      const blob = await canvas.convertToBlob({ type: mimeType, quality: quality / 100 });
      return stripMetadata ? await this.stripMetadataViaRedraw(blob) : blob;
    }

    const dataUrl = canvas.toDataURL(mimeType, quality / 100);
    const response = await fetch(dataUrl);
    let blob = await response.blob();

    if (stripMetadata) {
      blob = await this.stripMetadataViaRedraw(blob);
    }

    return blob;
  }

  private async stripMetadataViaRedraw(blob: Blob): Promise<Blob> {
    const source = await createImageBitmap(blob);
    const canvas = await this.drawToCanvas(source);
    const result = canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: blob.type })
      : await this.canvasToBlob(canvas as HTMLCanvasElement, blob.type);

    source.close();
    return result;
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality?: number,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to encode canvas to ${mimeType}`));
          }
        },
        mimeType,
        quality,
      );
    });
  }

  get isWorkerSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  async processInWorker(file: File, settings: ImageProcessingSettings): Promise<Blob> {
    if (!this.isWorkerSupported) {
      return this.processMainThread(file, settings);
    }

    try {
      const worker = new Worker(
        new URL('../workers/image-processor.worker.ts', import.meta.url),
        { type: 'module' },
      );

      const arrayBuffer = await file.arrayBuffer();
      const mimeType = this.mimeTypeFor(settings.format);

      const blob = await new Promise<Blob>((resolve, reject) => {
        worker.onmessage = ({ data }: MessageEvent) => {
          worker.terminate();
          if (data.error) {
            reject(new Error(data.error));
            return;
          }
          resolve(new Blob([data.blob], { type: data.type }));
        };
        worker.onerror = (error) => {
          worker.terminate();
          reject(new Error(`Worker error: ${error.message}`));
        };

        worker.postMessage({
          imageData: arrayBuffer,
          width: settings.width,
          height: settings.height,
          format: mimeType,
          quality: settings.quality / 100,
        });
      });

      return settings.stripMetadata ? await this.stripMetadataViaRedraw(blob) : blob;
    } catch {
      return this.processMainThread(file, settings);
    }
  }

  async processMainThread(file: File, settings: ImageProcessingSettings): Promise<Blob> {
    const source = await this.loadImage(file);
    const inputWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const inputHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

    const dimensions = settings.width !== undefined || settings.height !== undefined
      ? { width: settings.width ?? inputWidth, height: settings.height ?? inputHeight }
      : { width: inputWidth, height: inputHeight };

    const canvas = await this.drawToCanvas(source, dimensions);
    const blob = await this.encode(canvas, settings);

    if (source instanceof ImageBitmap) {
      source.close();
    }

    return blob;
  }

  async processCrop(file: File, cropSettings: CropSettings): Promise<Blob> {
    const source = await this.loadImage(file);
    const inputWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const inputHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

    const rect = this.validateCropRect(cropSettings.rect, inputWidth, inputHeight);

    const canvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(rect.width, rect.height)
      : document.createElement('canvas');

    if (canvas instanceof HTMLCanvasElement) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) {
      throw new Error('Failed to get 2d context from canvas');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      source,
      rect.x, rect.y, rect.width, rect.height,
      0, 0, rect.width, rect.height,
    );

    if (source instanceof ImageBitmap) {
      source.close();
    }

    const encodeSettings: ImageProcessingSettings = {
      format: cropSettings.outputFormat,
      quality: cropSettings.quality,
      width: rect.width,
      height: rect.height,
    };

    return this.encode(canvas, encodeSettings);
  }

  private validateCropRect(rect: CropRect, imgWidth: number, imgHeight: number): CropRect {
    if (rect.width <= 0 || rect.height <= 0) {
      return { x: 0, y: 0, width: imgWidth, height: imgHeight };
    }

    let { x, y, width, height } = rect;
    x = Math.max(0, Math.min(x, imgWidth - 1));
    y = Math.max(0, Math.min(y, imgHeight - 1));
    width = Math.min(width, imgWidth - x);
    height = Math.min(height, imgHeight - y);

    return { x, y, width, height };
  }

  async processStripMetadata(
    file: File,
    settings: StripMetadataSettings,
  ): Promise<ProcessingOutput> {
    const source = await this.loadImage(file);
    const inputWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const inputHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

    const canvas = await this.drawToCanvas(source, {
      width: inputWidth,
      height: inputHeight,
    });

    if (source instanceof ImageBitmap) {
      source.close();
    }

    const inputMime = file.type || this.inferMimeFromName(file.name);
    const outputFormat = settings.outputFormat === 'same'
      ? this.formatFromMime(inputMime)
      : settings.outputFormat;
    const outputMime = this.mimeTypeFor(outputFormat);

    const blob = canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: outputMime, quality: settings.quality / 100 })
      : await this.canvasToBlob(canvas as HTMLCanvasElement, outputMime, settings.quality / 100);

    const ext = outputFormat === 'jpeg' ? '.jpg' : `.${outputFormat}`;
    const dotIndex = file.name.lastIndexOf('.');
    const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
    const filename = settings.outputFormat === 'same'
      ? `${baseName}-stripped${dotIndex > 0 ? file.name.slice(dotIndex) : ''}`
      : `${baseName}-stripped${ext}`;

    return {
      blob,
      filename,
      mimeType: outputMime,
      bytes: blob.size,
      width: inputWidth,
      height: inputHeight,
    };
  }

  private inferMimeFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const extMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      svg: 'image/svg+xml',
      gif: 'image/gif',
      bmp: 'image/bmp',
    };
    return extMap[ext] ?? 'image/png';
  }

  private formatFromMime(mime: string): ImageFormat {
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpeg';
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('avif')) return 'avif';
    return 'png';
  }

  private mimeTypeFor(format: ImageProcessingSettings['format']): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'avif':
        return 'image/avif';
    }
  }

  private async loadImageFallback(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image via fallback'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }
}
