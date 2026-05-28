import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { ConvertSettings } from '../../models/convert-settings';
import { DEFAULT_CONVERT_SETTINGS } from '../../models/convert-settings';
import type { ImageFormat } from '../../models/processing-settings';
import { isAvifSupported } from '../../utils/avif-detect';

@Component({
  selector: 'app-convert-controls',
  imports: [],
  templateUrl: './convert-controls.html',
  styleUrl: './convert-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertControls {
  readonly settings = input(DEFAULT_CONVERT_SETTINGS);
  readonly settingsChange = output<ConvertSettings>();

  protected readonly avifSupported = signal(false);

  private readonly formatOrder: readonly ImageFormat[] = ['webp', 'jpeg', 'png', 'avif'];

  protected readonly formatLabels: Record<ImageFormat, string> = {
    webp: 'WebP',
    jpeg: 'JPEG',
    png: 'PNG',
    avif: 'AVIF',
  };

  protected readonly currentQuality = computed(() =>
    this.settings().qualityByFormat[this.settings().outputFormat],
  );

  protected readonly formats = computed(() =>
    this.formatOrder.filter((f) => f !== 'avif' || this.avifSupported()),
  );

  constructor() {
    isAvifSupported().then((supported) => this.avifSupported.set(supported));
  }

  protected onFormatChange(format: string): void {
    const s = this.settings();
    this.settingsChange.emit({
      ...s,
      outputFormat: format as ImageFormat,
    });
  }

  protected onQualityChange(quality: string): void {
    const s = this.settings();
    this.settingsChange.emit({
      ...s,
      qualityByFormat: { ...s.qualityByFormat, [s.outputFormat]: Number(quality) },
    });
  }

  protected onSrgbChange(checked: boolean): void {
    const s = this.settings();
    this.settingsChange.emit({
      ...s,
      tagSrgb: checked,
    });
  }
}
