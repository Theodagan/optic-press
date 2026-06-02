import type { ImageFormat } from './processing-settings';

export interface StripMetadataSettings {
  readonly stripExif: boolean;
  readonly stripIccProfile: boolean;
  readonly retagSrgb: boolean;
  readonly outputFormat: ImageFormat | 'same';
  readonly quality: number;
}

export const DEFAULT_STRIP_METADATA_SETTINGS: StripMetadataSettings = {
  stripExif: true,
  stripIccProfile: true,
  retagSrgb: true,
  outputFormat: 'same',
  quality: 92,
};

export interface StripMetadataValidationWarning {
  readonly field: string;
  readonly message: string;
}

export function validateStripMetadataSettings(
  settings: StripMetadataSettings,
): readonly StripMetadataValidationWarning[] {
  const warnings: StripMetadataValidationWarning[] = [];

  if (
    !Number.isFinite(settings.quality) ||
    settings.quality < 0 ||
    settings.quality > 100 ||
    !Number.isInteger(settings.quality)
  ) {
    warnings.push({ field: 'quality', message: 'Must be an integer between 0 and 100.' });
  }

  return warnings;
}
