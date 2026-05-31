import type { ImageFormat } from '../models/processing-settings';
import {
  FORMATS_WITH_ALPHA_THRESHOLD,
  FORMATS_WITH_BIT_DEPTH,
  FORMATS_WITH_CHROMA,
} from '../models/compress-settings';
import { isAvifSupported } from './avif-detect';

const ALL_FORMATS: readonly ImageFormat[] = ['webp', 'jpeg', 'png', 'avif'];

let cachedAvifFormatList: readonly ImageFormat[] | undefined;

export async function availableCompressFormats(): Promise<readonly ImageFormat[]> {
  if (cachedAvifFormatList) {
    return cachedAvifFormatList;
  }

  const avifOk = await isAvifSupported();
  cachedAvifFormatList = avifOk ? ALL_FORMATS : ALL_FORMATS.filter((f) => f !== 'avif');
  return cachedAvifFormatList;
}

export function hasChromaSubsampling(format: ImageFormat): boolean {
  return FORMATS_WITH_CHROMA.includes(format);
}

export function hasBitDepth(format: ImageFormat): boolean {
  return FORMATS_WITH_BIT_DEPTH.includes(format);
}

export function hasAlphaThreshold(format: ImageFormat): boolean {
  return FORMATS_WITH_ALPHA_THRESHOLD.includes(format);
}

export function isCompressFormat(value: string): value is ImageFormat {
  return ALL_FORMATS.includes(value as ImageFormat);
}
