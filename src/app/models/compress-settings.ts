import type { ImageFormat } from './processing-settings';

export type ChromaSubsampling = '4:4:4' | '4:2:0';

export type BitDepth = 8 | 16;

export interface CompressSettings {
  readonly format: ImageFormat;
  readonly quality: number;
  readonly chromaSubsampling: ChromaSubsampling;
  readonly bitDepth: BitDepth;
  readonly alphaThreshold: number;
}

export const FORMATS_WITH_CHROMA: readonly ImageFormat[] = ['jpeg', 'webp'];

export const FORMATS_WITH_BIT_DEPTH: readonly ImageFormat[] = ['png'];

export const FORMATS_WITH_ALPHA_THRESHOLD: readonly ImageFormat[] = ['png', 'webp'];

export const DEFAULT_COMPRESS_SETTINGS: CompressSettings = {
  format: 'webp',
  quality: 80,
  chromaSubsampling: '4:2:0',
  bitDepth: 8,
  alphaThreshold: 0,
};

export interface CompressValidationWarning {
  readonly field: string;
  readonly message: string;
}

export function validateCompressSettings(
  settings: CompressSettings,
): readonly CompressValidationWarning[] {
  const warnings: CompressValidationWarning[] = [];

  if (
    !Number.isFinite(settings.quality) ||
    settings.quality < 0 ||
    settings.quality > 100 ||
    !Number.isInteger(settings.quality)
  ) {
    warnings.push({ field: 'quality', message: 'Must be an integer between 0 and 100.' });
  }

  if (!['png', 'jpeg', 'webp', 'avif'].includes(settings.format)) {
    warnings.push({ field: 'format', message: 'Must be png, jpeg, webp, or avif.' });
  }

  if (FORMATS_WITH_BIT_DEPTH.includes(settings.format)) {
    if (settings.bitDepth !== 8 && settings.bitDepth !== 16) {
      warnings.push({ field: 'bitDepth', message: 'Must be 8 or 16.' });
    }
  }

  if (FORMATS_WITH_ALPHA_THRESHOLD.includes(settings.format)) {
    if (
      !Number.isFinite(settings.alphaThreshold) ||
      settings.alphaThreshold < 0 ||
      settings.alphaThreshold > 255
    ) {
      warnings.push({
        field: 'alphaThreshold',
        message: 'Must be a number between 0 and 255.',
      });
    }
  }

  return warnings;
}
