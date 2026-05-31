import type { ImageFormat } from './processing-settings';

export interface ConvertSettings {
  readonly outputFormat: ImageFormat;
  readonly qualityByFormat: Record<ImageFormat, number>;
  readonly tagSrgb: boolean;
}

export const DEFAULT_CONVERT_SETTINGS: ConvertSettings = {
  outputFormat: 'webp',
  qualityByFormat: {
    png: 100,
    jpeg: 85,
    webp: 80,
    avif: 70,
  },
  tagSrgb: false,
};
