export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif';

export interface ImageProcessingSettings {
  readonly format: ImageFormat;
  readonly quality: number;
  readonly width?: number;
  readonly height?: number;
  readonly maintainAspectRatio?: boolean;
  readonly stripMetadata?: boolean;
  readonly upscale?: boolean;
}

export const DEFAULT_SETTINGS: ImageProcessingSettings = {
  format: 'webp',
  quality: 80,
  maintainAspectRatio: true,
  stripMetadata: true,
  upscale: false,
};
