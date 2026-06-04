import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { ResizeMode, ResizeSettings } from '../../models/resize-settings';
import { DEFAULT_RESIZE_SETTINGS } from '../../models/resize-settings';
import type { ImageFormat } from '../../models/processing-settings';
import { isAvifSupported } from '../../utils/avif-detect';

@Component({
  selector: 'app-resize-controls',
  imports: [],
  templateUrl: './resize-controls.html',
  styleUrl: './resize-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizeControls {
  readonly settings = input(DEFAULT_RESIZE_SETTINGS);
  readonly settingsChange = output<ResizeSettings>();

  protected readonly avifSupported = signal(false);

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

  protected readonly modeOptions: readonly { value: ResizeMode; label: string }[] = [
    { value: 'maxDimension', label: 'Max dimension' },
    { value: 'exact', label: 'Exact' },
  ];

  constructor() {
    isAvifSupported().then((supported) => this.avifSupported.set(supported));
  }

  protected onModeChange(mode: string): void {
    this.settingsChange.emit({ ...this.settings(), mode: mode as ResizeMode });
  }

  protected onMaxDimensionChange(value: string): void {
    this.settingsChange.emit({ ...this.settings(), maxDimension: Number(value) });
  }

  protected onWidthChange(value: string): void {
    this.settingsChange.emit({ ...this.settings(), width: Number(value) });
  }

  protected onHeightChange(value: string): void {
    this.settingsChange.emit({ ...this.settings(), height: Number(value) });
  }

  protected onAspectLockedChange(checked: boolean): void {
    this.settingsChange.emit({ ...this.settings(), aspectLocked: checked });
  }

  protected onPreventUpscaleChange(checked: boolean): void {
    this.settingsChange.emit({ ...this.settings(), preventUpscale: checked });
  }

  protected onFormatChange(format: string): void {
    this.settingsChange.emit({ ...this.settings(), outputFormat: format as ImageFormat });
  }

  protected onQualityChange(quality: string): void {
    this.settingsChange.emit({ ...this.settings(), quality: Number(quality) });
  }
}
