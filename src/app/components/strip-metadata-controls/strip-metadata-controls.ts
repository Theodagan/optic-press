import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ImageFormat } from '../../models/processing-settings';
import type { StripMetadataSettings } from '../../models/strip-metadata-settings';
import { DEFAULT_STRIP_METADATA_SETTINGS } from '../../models/strip-metadata-settings';

@Component({
  selector: 'app-strip-metadata-controls',
  imports: [],
  templateUrl: './strip-metadata-controls.html',
  styleUrl: './strip-metadata-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StripMetadataControls {
  readonly settings = input(DEFAULT_STRIP_METADATA_SETTINGS);
  readonly settingsChange = output<StripMetadataSettings>();

  protected readonly formatLabels: Record<string, string> = {
    same: 'Same as input',
    webp: 'WebP',
    jpeg: 'JPEG',
    png: 'PNG',
    avif: 'AVIF',
  };

  protected readonly formatOrder: readonly string[] = ['same', 'webp', 'jpeg', 'png', 'avif'];

  protected onFormatChange(format: string): void {
    this.settingsChange.emit({
      ...this.settings(),
      outputFormat: format === 'same' ? 'same' : (format as ImageFormat),
    });
  }

  protected onQualityChange(quality: string): void {
    this.settingsChange.emit({
      ...this.settings(),
      quality: Number(quality),
    });
  }
}
