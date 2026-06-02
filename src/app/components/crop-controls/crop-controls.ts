import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import type { CropPreset, CropRect } from '../../models/crop-settings';
import {
  CROP_PRESET_LABELS,
  DEFAULT_CROP_SETTINGS,
  validateCropSettings,
} from '../../models/crop-settings';
import type { CropSettings } from '../../models/crop-settings';
import type { DragHandle } from '../../models/crop-settings';
import type { ImageFormat } from '../../models/processing-settings';
import { isAvifSupported } from '../../utils/avif-detect';
import { clampCropRect, computeCropFromPreset } from '../../utils/crop-utils';

const CANVAS_PADDING = 16;
const HANDLE_SIZE = 8;
const HANDLE_HIT_TOLERANCE = 8;
const OVERLAY_ALPHA = 0.55;
const MIN_CROP_SIZE = 10;

@Component({
  selector: 'app-crop-controls',
  imports: [],
  templateUrl: './crop-controls.html',
  styleUrl: './crop-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CropControls {
  readonly settings = input(DEFAULT_CROP_SETTINGS);
  readonly settingsChange = output<CropSettings>();
  readonly previewImage = input<File | null>(null);

  protected readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('cropCanvas');
  protected readonly avifSupported = signal(false);

  private readonly loadedImage = signal<HTMLImageElement | null>(null);
  private readonly imageLoaded = signal(false);

  private dragHandle: DragHandle | null = null;
  private dragStartRect: CropRect | null = null;
  private dragStartPointer: { x: number; y: number } | null = null;

  private readonly presetOrder: readonly CropPreset[] = [
    'free', '1:1', '16:9', '4:3', '3:2', '1.91:1', 'custom',
  ];

  protected readonly presets = computed(() =>
    this.presetOrder.map((p) => ({ value: p, label: CROP_PRESET_LABELS[p] })),
  );

  private readonly formatOrder: readonly ImageFormat[] = ['webp', 'jpeg', 'png', 'avif'];

  protected readonly formatLabels: Record<ImageFormat, string> = {
    webp: 'WebP',
    jpeg: 'JPEG',
    png: 'PNG',
    avif: 'AVIF',
  };

  protected readonly formats = computed(() =>
    this.formatOrder.filter((f) => f !== 'avif' || this.avifSupported()),
  );

  protected readonly validationWarnings = computed(() =>
    validateCropSettings(this.settings()),
  );

  constructor() {
    isAvifSupported().then((supported) => this.avifSupported.set(supported));

    effect(() => {
      const image = this.previewImage();
      if (image) {
        this.loadPreviewImage(image);
      } else {
        this.loadedImage.set(null);
        this.imageLoaded.set(false);
      }
    });

    effect(() => {
      const canvas = this.canvasRef()?.nativeElement;
      const img = this.loadedImage();
      const loaded = this.imageLoaded();
      const s = this.settings();

      if (canvas && img && loaded) {
        this.drawCanvas(canvas, img, s);
      }
    });
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.handlePointerMove(event);
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.handlePointerUp(event);
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.handlePointerMove(event.touches[0]);
    }
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(_event: TouchEvent): void {
    this.handlePointerUp(null as unknown as MouseEvent);
  }

  protected onModeChange(value: string): void {
    this.settingsChange.emit({ ...this.settings(), mode: value as 'free' | 'fixedRatio' });
  }

  protected onPresetChange(value: string): void {
    const preset = value as CropPreset;
    const s = this.settings();
    const nextMode: 'free' | 'fixedRatio' = preset === 'free' ? 'free' : 'fixedRatio';

    const img = this.loadedImage();
    if (img && this.imageLoaded()) {
      const cropRect = computeCropFromPreset(img.naturalWidth, img.naturalHeight, preset);
      this.settingsChange.emit({ ...s, preset, mode: nextMode, rect: cropRect });
    } else {
      this.settingsChange.emit({ ...s, preset, mode: nextMode });
    }
  }

  protected onCustomRatioWChange(value: string): void {
    const w = Math.max(1, Number(value) || 1);
    this.settingsChange.emit({ ...this.settings(), customRatioW: w });
  }

  protected onCustomRatioHChange(value: string): void {
    const h = Math.max(1, Number(value) || 1);
    this.settingsChange.emit({ ...this.settings(), customRatioH: h });
  }

  protected onFormatChange(format: string): void {
    this.settingsChange.emit({ ...this.settings(), outputFormat: format as ImageFormat });
  }

  protected onQualityChange(quality: string): void {
    this.settingsChange.emit({ ...this.settings(), quality: Number(quality) });
  }

  protected onCanvasPointerDown(event: PointerEvent): void {
    const canvas = this.canvasRef()?.nativeElement;
    const img = this.loadedImage();
    if (!canvas || !img || !this.imageLoaded()) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (event.clientX - rect.left) * scaleX;
    const cy = (event.clientY - rect.top) * scaleY;

    this.dragHandle = this.hitTestHandle(cx, cy, canvas, img);

    if (this.dragHandle) {
      this.dragStartRect = this.getEffectiveRect(img);
      this.dragStartPointer = { x: cx, y: cy };
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  }

  private handlePointerMove(event: { clientX: number; clientY: number }): void {
    if (!this.dragHandle) return;

    const canvas = this.canvasRef()?.nativeElement;
    const img = this.loadedImage();
    if (!canvas || !img || !this.dragStartRect || !this.dragStartPointer) return;

    const crect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / crect.width;
    const scaleY = canvas.height / crect.height;
    const cx = (event.clientX - crect.left) * scaleX;
    const cy = (event.clientY - crect.top) * scaleY;

    const { scale, offsetX, offsetY } = this.getCanvasTransform(canvas, img);
    const dx = (cx - this.dragStartPointer.x) / scale;
    const dy = (cy - this.dragStartPointer.y) / scale;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const ratio = this.getCurrentRatio();

    let newRect = this.computeNewRect(this.dragStartRect, dx, dy, ratio, imgW, imgH);
    newRect = clampCropRect(newRect, imgW, imgH);

    this.settingsChange.emit({ ...this.settings(), rect: newRect });
  }

  private handlePointerUp(_event: MouseEvent | null): void {
    if (this.dragHandle) {
      this.dragHandle = null;
      this.dragStartRect = null;
      this.dragStartPointer = null;
    }
  }

  private computeNewRect(
    startRect: CropRect,
    dx: number,
    dy: number,
    ratio: number | null,
    imgW: number,
    imgH: number,
  ): CropRect {
    const h = this.dragHandle!;
    let { x, y, width, height } = startRect;

    const handleOppositeX = (oppositeX: number): void => {
      if (ratio) {
        const newW = oppositeX - x;
        const sign = newW < 0 ? -1 : 1;
        height = Math.max(MIN_CROP_SIZE, Math.abs(newW) / ratio);
        width = Math.round(height * ratio);
        x = newW < 0 ? x - width : x;
      } else {
        width = oppositeX - x;
        if (width < 0) {
          x = oppositeX;
          width = -width;
        }
        if (width < MIN_CROP_SIZE) {
          width = MIN_CROP_SIZE;
          x = oppositeX - (oppositeX > startRect.x + startRect.width ? MIN_CROP_SIZE : 0);
        }
      }
    };

    const handleOppositeY = (oppositeY: number): void => {
      if (ratio) {
        const newH = oppositeY - y;
        const sign = newH < 0 ? -1 : 1;
        width = Math.max(MIN_CROP_SIZE, Math.abs(newH) * ratio);
        height = Math.round(width / ratio);
        y = newH < 0 ? y - height : y;
      } else {
        height = oppositeY - y;
        if (height < 0) {
          y = oppositeY;
          height = -height;
        }
        if (height < MIN_CROP_SIZE) {
          height = MIN_CROP_SIZE;
          y = oppositeY - (oppositeY > startRect.y + startRect.height ? MIN_CROP_SIZE : 0);
        }
      }
    };

    switch (h) {
      case 'nw':
        x = startRect.x + dx;
        y = startRect.y + dy;
        width = startRect.x + startRect.width - x;
        height = startRect.y + startRect.height - y;
        if (ratio) {
          height = Math.max(MIN_CROP_SIZE, width / ratio);
          width = Math.round(height * ratio);
          y = startRect.y + startRect.height - height;
        }
        if (width < MIN_CROP_SIZE) width = MIN_CROP_SIZE;
        if (height < MIN_CROP_SIZE) height = MIN_CROP_SIZE;
        break;
      case 'ne':
        y = startRect.y + dy;
        width = startRect.width + dx;
        height = startRect.y + startRect.height - y;
        if (ratio) {
          height = Math.max(MIN_CROP_SIZE, width / ratio);
          width = Math.round(height * ratio);
          y = startRect.y + startRect.height - height;
        }
        if (width < MIN_CROP_SIZE) width = MIN_CROP_SIZE;
        if (height < MIN_CROP_SIZE) height = MIN_CROP_SIZE;
        break;
      case 'sw':
        x = startRect.x + dx;
        width = startRect.x + startRect.width - x;
        height = startRect.height + dy;
        if (ratio) {
          height = Math.max(MIN_CROP_SIZE, width / ratio);
          width = Math.round(height * ratio);
          x = startRect.x + startRect.width - width;
        }
        if (width < MIN_CROP_SIZE) width = MIN_CROP_SIZE;
        if (height < MIN_CROP_SIZE) height = MIN_CROP_SIZE;
        break;
      case 'se':
        width = startRect.width + dx;
        height = startRect.height + dy;
        if (ratio) {
          height = Math.max(MIN_CROP_SIZE, width / ratio);
          width = Math.round(height * ratio);
        }
        if (width < MIN_CROP_SIZE) width = MIN_CROP_SIZE;
        if (height < MIN_CROP_SIZE) height = MIN_CROP_SIZE;
        break;
      case 'n':
        handleOppositeY(startRect.y + startRect.height - dy);
        y = startRect.y + dy;
        break;
      case 's':
        handleOppositeY(startRect.y + startRect.height + dy);
        break;
      case 'e':
        handleOppositeX(startRect.x + startRect.width + dx);
        break;
      case 'w':
        handleOppositeX(startRect.x + startRect.width - dx);
        x = startRect.x + dx;
        break;
      case 'move':
        x = startRect.x + dx;
        y = startRect.y + dy;
        break;
      default:
        break;
    }

    return { x, y, width, height };
  }

  private hitTestHandle(
    cx: number,
    cy: number,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
  ): DragHandle | null {
    const rect = this.getEffectiveRect(img);
    const { scale, offsetX, offsetY } = this.getCanvasTransform(canvas, img);

    const rx = offsetX + rect.x * scale;
    const ry = offsetY + rect.y * scale;
    const rw = rect.width * scale;
    const rh = rect.height * scale;

    const handlePositions: { handle: DragHandle; x: number; y: number }[] = [
      { handle: 'nw', x: rx, y: ry },
      { handle: 'n', x: rx + rw / 2, y: ry },
      { handle: 'ne', x: rx + rw, y: ry },
      { handle: 'w', x: rx, y: ry + rh / 2 },
      { handle: 'e', x: rx + rw, y: ry + rh / 2 },
      { handle: 'sw', x: rx, y: ry + rh },
      { handle: 's', x: rx + rw / 2, y: ry + rh },
      { handle: 'se', x: rx + rw, y: ry + rh },
    ];

    for (const h of handlePositions) {
      if (
        Math.abs(cx - h.x) <= HANDLE_SIZE + HANDLE_HIT_TOLERANCE &&
        Math.abs(cy - h.y) <= HANDLE_SIZE + HANDLE_HIT_TOLERANCE
      ) {
        return h.handle;
      }
    }

    if (cx >= rx && cx <= rx + rw && cy >= ry && cy <= ry + rh) {
      return 'move';
    }

    return null;
  }

  private getEffectiveRect(img: HTMLImageElement): CropRect {
    const s = this.settings();
    if (s.rect.width > 0 && s.rect.height > 0) {
      return s.rect;
    }
    return computeCropFromPreset(img.naturalWidth, img.naturalHeight, s.preset);
  }

  private getCurrentRatio(): number | null {
    const s = this.settings();
    if (s.mode === 'free') return null;

    if (s.preset === 'custom') {
      if (s.customRatioW > 0 && s.customRatioH > 0) {
        return s.customRatioW / s.customRatioH;
      }
      return null;
    }

    const CROP_PRESET_RATIOS: Record<string, readonly [number, number]> = {
      '1:1': [1, 1],
      '16:9': [16, 9],
      '4:3': [4, 3],
      '3:2': [3, 2],
      '1.91:1': [191, 100],
    };

    const entry = CROP_PRESET_RATIOS[s.preset];
    if (entry) return entry[0] / entry[1];
    return null;
  }

  private getCanvasTransform(
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
  ): { scale: number; offsetX: number; offsetY: number } {
    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const drawAreaW = canvasW - CANVAS_PADDING * 2;
    const drawAreaH = canvasH - CANVAS_PADDING * 2;

    const scale = Math.min(drawAreaW / imgW, drawAreaH / imgH);
    const drawW = Math.round(imgW * scale);
    const drawH = Math.round(imgH * scale);
    const offsetX = Math.round((canvasW - drawW) / 2);
    const offsetY = Math.round((canvasH - drawH) / 2);

    return { scale, offsetX, offsetY };
  }

  private loadPreviewImage(file: File): void {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      this.loadedImage.set(img);
      this.imageLoaded.set(true);
    };
    img.onerror = () => {
      this.loadedImage.set(null);
      this.imageLoaded.set(false);
    };
    img.src = url;
  }

  private drawCanvas(
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    s: CropSettings,
  ): void {
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    const { scale, offsetX, offsetY } = this.getCanvasTransform(canvas, img);
    const drawW = Math.round(imgW * scale);
    const drawH = Math.round(imgH * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasW, canvasH);

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

    const cropRect = this.getEffectiveRect(img);

    const rx = offsetX + cropRect.x * scale;
    const ry = offsetY + cropRect.y * scale;
    const rw = cropRect.width * scale;
    const rh = cropRect.height * scale;

    ctx.save();
    ctx.globalAlpha = OVERLAY_ALPHA;
    ctx.fillStyle = '#000000';
    ctx.fillRect(offsetX, offsetY, drawW, drawH);
    ctx.clearRect(rx, ry, rw, rh);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(rx + 0.75, ry + 0.75, rw - 1.5, rh - 1.5);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    const handles: readonly [number, number][] = [
      [rx, ry],
      [rx + rw / 2, ry],
      [rx + rw, ry],
      [rx, ry + rh / 2],
      [rx + rw, ry + rh / 2],
      [rx, ry + rh],
      [rx + rw / 2, ry + rh],
      [rx + rw, ry + rh],
    ];
    for (const [hx, hy] of handles) {
      ctx.fillRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.strokeRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 8]);
    const thirdH = rh / 3;
    const thirdW = rw / 3;
    ctx.beginPath();
    ctx.moveTo(rx, ry + thirdH);
    ctx.lineTo(rx + rw, ry + thirdH);
    ctx.moveTo(rx, ry + thirdH * 2);
    ctx.lineTo(rx + rw, ry + thirdH * 2);
    ctx.moveTo(rx + thirdW, ry);
    ctx.lineTo(rx + thirdW, ry + rh);
    ctx.moveTo(rx + thirdW * 2, ry);
    ctx.lineTo(rx + thirdW * 2, ry + rh);
    ctx.stroke();
    ctx.restore();
  }
}
