import type { ImageFormat } from '../models/processing-settings';
import type { SrcsetVariant } from '../models/srcset-settings';
import { EXTENSION_BY_FORMAT } from './format-mapping';

export function computeEffectiveWidths(
  targets: readonly number[],
  sourceWidth: number,
): readonly number[] {
  if (!Number.isInteger(sourceWidth) || sourceWidth <= 0) {
    return [];
  }

  const widths = targets
    .filter((width) => Number.isInteger(width) && width > 0 && width < sourceWidth)
    .concat(sourceWidth);

  return [...new Set(widths)].sort((a, b) => a - b);
}

export function variantHeight(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
): number {
  return Math.max(1, Math.round((sourceHeight * targetWidth) / sourceWidth));
}

export function srcsetBaseName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '') || 'image';
}

export function variantFileName(
  baseName: string,
  width: number,
  format: ImageFormat,
): string {
  return `${baseName}-${width}w${EXTENSION_BY_FORMAT[format]}`;
}

export function buildVariantDescriptors(
  fileName: string,
  sourceWidth: number,
  sourceHeight: number,
  targets: readonly number[],
  formats: readonly ImageFormat[],
): readonly SrcsetVariant[] {
  const baseName = srcsetBaseName(fileName);
  const widths = computeEffectiveWidths(targets, sourceWidth);

  return widths.flatMap((width) =>
    formats.map((format) => ({
      width,
      height: variantHeight(sourceWidth, sourceHeight, width),
      format,
      fileName: variantFileName(baseName, width, format),
    })),
  );
}
