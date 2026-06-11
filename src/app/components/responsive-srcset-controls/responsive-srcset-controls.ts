import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { SnippetFileType, SrcsetSettings } from '../../models/srcset-settings';
import { DEFAULT_SRCSET_SETTINGS } from '../../models/srcset-settings';
import type { ImageFormat } from '../../models/processing-settings';
import { isAvifSupported } from '../../utils/avif-detect';

@Component({
  selector: 'app-responsive-srcset-controls',
  imports: [],
  templateUrl: './responsive-srcset-controls.html',
  styleUrl: './responsive-srcset-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiveSrcsetControls {
  readonly settings = input(DEFAULT_SRCSET_SETTINGS);
  readonly settingsChange = output<SrcsetSettings>();

  protected readonly avifSupported = signal(false);
  protected readonly newWidth = signal('');

  protected readonly formatOrder: readonly ImageFormat[] = ['avif', 'webp', 'jpeg', 'png'];

  protected readonly formatLabels: Record<ImageFormat, string> = {
    avif: 'AVIF',
    webp: 'WebP',
    jpeg: 'JPEG',
    png: 'PNG',
  };

  protected readonly sortedWidths = computed(() =>
    [...this.settings().widths].sort((a, b) => a - b),
  );

  constructor() {
    isAvifSupported().then((supported) => this.avifSupported.set(supported));
  }

  protected isFormatSelected(format: ImageFormat): boolean {
    return this.settings().formats.includes(format);
  }

  protected onFormatToggle(format: ImageFormat, checked: boolean): void {
    const current = this.settings().formats;
    const formats = checked
      ? [...new Set([...current, format])]
      : current.filter((f) => f !== format);

    if (formats.length === 0) {
      return;
    }

    this.settingsChange.emit({ ...this.settings(), formats });
  }

  protected onRemoveWidth(width: number): void {
    const widths = this.settings().widths.filter((w) => w !== width);
    if (widths.length === 0) {
      return;
    }
    this.settingsChange.emit({ ...this.settings(), widths });
  }

  protected onNewWidthInput(value: string): void {
    this.newWidth.set(value);
  }

  protected onAddWidth(): void {
    const width = Number(this.newWidth());
    if (!Number.isInteger(width) || width <= 0) {
      return;
    }

    const widths = [...new Set([...this.settings().widths, width])].sort((a, b) => a - b);
    this.newWidth.set('');
    this.settingsChange.emit({ ...this.settings(), widths });
  }

  protected onQualityChange(quality: string): void {
    this.settingsChange.emit({ ...this.settings(), quality: Number(quality) });
  }

  protected onSizesChange(sizesAttribute: string): void {
    this.settingsChange.emit({ ...this.settings(), sizesAttribute });
  }

  protected onIncludeSnippetChange(includeSnippetInZip: boolean): void {
    this.settingsChange.emit({ ...this.settings(), includeSnippetInZip });
  }

  protected onSnippetFileTypeChange(value: string): void {
    this.settingsChange.emit({ ...this.settings(), snippetFileType: value as SnippetFileType });
  }
}
