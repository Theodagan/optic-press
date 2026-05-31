import type { ImageFormat } from './processing-settings';

export type ResizeMode = 'maxDimension' | 'exact';

export interface ResizeSettings {
  readonly mode: ResizeMode;
  readonly maxDimension: number;
  readonly width: number;
  readonly height: number;
  readonly aspectLocked: boolean;
  readonly preventUpscale: boolean;
  readonly outputFormat: ImageFormat;
  readonly quality: number;
}

export const DEFAULT_RESIZE_SETTINGS: ResizeSettings = {
  mode: 'maxDimension',
  maxDimension: 1200,
  width: 800,
  height: 600,
  aspectLocked: true,
  preventUpscale: true,
  outputFormat: 'webp',
  quality: 80,
};

export interface ResizeValidationWarning {
  readonly field: string;
  readonly message: string;
}

export function validateResizeSettings(settings: ResizeSettings): readonly ResizeValidationWarning[] {
  const warnings: ResizeValidationWarning[] = [];

  if (!Number.isFinite(settings.maxDimension) || settings.maxDimension <= 0 || !Number.isInteger(settings.maxDimension)) {
    warnings.push({ field: 'maxDimension', message: 'Must be a positive integer.' });
  }

  if (settings.mode === 'exact') {
    if (!Number.isFinite(settings.width) || settings.width <= 0 || !Number.isInteger(settings.width)) {
      warnings.push({ field: 'width', message: 'Must be a positive integer.' });
    }
    if (!Number.isFinite(settings.height) || settings.height <= 0 || !Number.isInteger(settings.height)) {
      warnings.push({ field: 'height', message: 'Must be a positive integer.' });
    }
  }

  if (!Number.isFinite(settings.quality) || settings.quality < 1 || settings.quality > 100 || !Number.isInteger(settings.quality)) {
    warnings.push({ field: 'quality', message: 'Must be an integer between 1 and 100.' });
  }

  return warnings;
}
