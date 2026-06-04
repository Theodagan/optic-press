import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { AutoOptimizeSettings, TargetProfile } from '../../models/auto-optimize';
import { DEFAULT_AUTO_OPTIMIZE_SETTINGS } from '../../models/auto-optimize';
import type { ImageFormat } from '../../models/processing-settings';

@Component({
  selector: 'app-auto-optimize-controls',
  imports: [],
  templateUrl: './auto-optimize-controls.html',
  styleUrl: './auto-optimize-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoOptimizeControls {
  readonly settings = input(DEFAULT_AUTO_OPTIMIZE_SETTINGS);
  readonly settingsChange = output<AutoOptimizeSettings>();

  protected readonly profileOptions: readonly { value: TargetProfile; label: string }[] = [
    { value: 'balanced', label: 'Balanced' },
    { value: 'smaller', label: 'Smaller' },
    { value: 'higher-quality', label: 'Higher quality' },
  ];

  protected readonly formatOptions: readonly { value: string; label: string }[] = [
    { value: '', label: 'Auto (recommended)' },
    { value: 'webp', label: 'WebP' },
    { value: 'avif', label: 'AVIF' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
  ];

  protected onProfileChange(profile: string): void {
    this.settingsChange.emit({
      ...this.settings(),
      targetProfile: profile as TargetProfile,
    });
  }

  protected onMaxDimensionChange(value: string): void {
    const num = Number(value);
    this.settingsChange.emit({
      ...this.settings(),
      maxDimension: Number.isFinite(num) && num > 0 ? num : DEFAULT_AUTO_OPTIMIZE_SETTINGS.maxDimension,
    });
  }

  protected onFormatLockChange(format: string): void {
    this.settingsChange.emit({
      ...this.settings(),
      formatLock: format ? (format as ImageFormat) : null,
    });
  }

  protected formatLockValue(): string {
    return this.settings().formatLock ?? '';
  }
}
