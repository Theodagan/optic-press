import type { ImageFormat } from './processing-settings';

export type CropMode = 'free' | 'fixedRatio';

export type CropPreset = 'free' | '1:1' | '16:9' | '4:3' | '3:2' | '1.91:1' | 'custom';

export type DragHandle =
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'move';

export interface CropRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CropSettings {
  readonly mode: CropMode;
  readonly preset: CropPreset;
  readonly customRatioW: number;
  readonly customRatioH: number;
  readonly rect: CropRect;
  readonly outputFormat: ImageFormat;
  readonly quality: number;
}

export const DEFAULT_CROP_SETTINGS: CropSettings = {
  mode: 'free',
  preset: 'free',
  customRatioW: 16,
  customRatioH: 9,
  rect: { x: 0, y: 0, width: 0, height: 0 },
  outputFormat: 'webp',
  quality: 80,
};

export const CROP_PRESET_LABELS: Record<CropPreset, string> = {
  free: 'Free',
  '1:1': '1:1 (Square)',
  '16:9': '16:9 (Widescreen)',
  '4:3': '4:3 (Standard)',
  '3:2': '3:2 (Photo)',
  '1.91:1': '1.91:1 (Open Graph)',
  custom: 'Custom',
};

export const CROP_PRESET_RATIOS: Record<Exclude<CropPreset, 'free' | 'custom'>, readonly [number, number]> = {
  '1:1': [1, 1],
  '16:9': [16, 9],
  '4:3': [4, 3],
  '3:2': [3, 2],
  '1.91:1': [191, 100],
};

export interface CropValidationWarning {
  readonly field: string;
  readonly message: string;
}

export function validateCropSettings(settings: CropSettings): readonly CropValidationWarning[] {
  const warnings: CropValidationWarning[] = [];

  if (!Number.isFinite(settings.quality) || settings.quality < 1 || settings.quality > 100 || !Number.isInteger(settings.quality)) {
    warnings.push({ field: 'quality', message: 'Must be an integer between 1 and 100.' });
  }

  if (settings.preset === 'custom') {
    if (!Number.isFinite(settings.customRatioW) || settings.customRatioW <= 0 || !Number.isInteger(settings.customRatioW)) {
      warnings.push({ field: 'customRatioW', message: 'Must be a positive integer.' });
    }
    if (!Number.isFinite(settings.customRatioH) || settings.customRatioH <= 0 || !Number.isInteger(settings.customRatioH)) {
      warnings.push({ field: 'customRatioH', message: 'Must be a positive integer.' });
    }
  }

  return warnings;
}
