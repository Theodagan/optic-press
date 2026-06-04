import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { ChromaSubsampling, CompressSettings } from '../../models/compress-settings';
import { DEFAULT_COMPRESS_SETTINGS } from '../../models/compress-settings';
import type { ImageFormat } from '../../models/processing-settings';
import {
  hasAlphaThreshold,
  hasBitDepth,
  hasChromaSubsampling,
} from '../../utils/compress-capabilities';
import { isAvifSupported } from '../../utils/avif-detect';

@Component({
  selector: 'app-compress-controls',
  imports: [],
  templateUrl: './compress-controls.html',
  styleUrl: './compress-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompressControls {
  readonly settings = input(DEFAULT_COMPRESS_SETTINGS);
  readonly settingsChange = output<CompressSettings>();

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

  protected readonly showChroma = computed(() =>
    hasChromaSubsampling(this.settings().format),
  );

  protected readonly showBitDepth = computed(() =>
    hasBitDepth(this.settings().format),
  );

  protected readonly showAlphaThreshold = computed(() =>
    hasAlphaThreshold(this.settings().format),
  );

  protected readonly chromaOptions: readonly { value: ChromaSubsampling; label: string }[] = [
    { value: '4:4:4', label: '4:4:4 (best)' },
    { value: '4:2:0', label: '4:2:0 (smaller)' },
  ];

  protected readonly bitDepthOptions: readonly { value: number; label: string }[] = [
    { value: 8, label: '8-bit' },
    { value: 16, label: '16-bit' },
  ];

  constructor() {
    isAvifSupported().then((supported) => this.avifSupported.set(supported));
  }

  protected onFormatChange(format: string): void {
    this.settingsChange.emit({
      ...this.settings(),
      format: format as ImageFormat,
    });
  }

  protected onQualityChange(quality: string): void {
    this.settingsChange.emit({ ...this.settings(), quality: Number(quality) });
  }

  protected onChromaChange(chroma: string): void {
    this.settingsChange.emit({
      ...this.settings(),
      chromaSubsampling: chroma as ChromaSubsampling,
    });
  }

  protected onBitDepthChange(bitDepth: string): void {
    this.settingsChange.emit({ ...this.settings(), bitDepth: Number(bitDepth) as 8 | 16 });
  }

  protected onAlphaThresholdChange(value: string): void {
    this.settingsChange.emit({ ...this.settings(), alphaThreshold: Number(value) });
  }
}
