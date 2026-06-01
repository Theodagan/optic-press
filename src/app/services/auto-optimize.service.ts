import { Injectable } from '@angular/core';
import type { Dimensions } from '../models/dimensions';
import type { AutoOptimizeSettings } from '../models/auto-optimize';
import type { ImageFormat } from '../models/processing-settings';
import { QUALITY_MIN, QUALITY_MAX } from '../models/auto-optimize';

export interface ResizeResult {
  readonly sourceDimensions: Dimensions;
  readonly targetDimensions: Dimensions;
  readonly resized: boolean;
}

export interface QualitySearchResult {
  readonly quality: number;
  readonly outputBytes: number;
}

export interface AutoOptimizeOutput {
  readonly isAlreadyOptimal: boolean;
  readonly outputBytes: number;
}

const AVIF_SIZE_THRESHOLD = 200_000;

@Injectable({ providedIn: 'root' })
export class AutoOptimizeService {
  selectFormat(
    isPhoto: boolean,
    hasAlpha: boolean,
    originalSize: number,
    isAvifSupported: boolean,
    formatLock: ImageFormat | null,
  ): ImageFormat {
    if (formatLock !== null) {
      return formatLock;
    }

    if (isPhoto && isAvifSupported && originalSize > AVIF_SIZE_THRESHOLD) {
      return 'avif';
    }

    if (isPhoto) {
      return 'webp';
    }

    if (hasAlpha) {
      return 'png';
    }

    return 'webp';
  }

  computeMaxDimensionOverride(
    sourceWidth: number,
    sourceHeight: number,
    settings: AutoOptimizeSettings,
  ): ResizeResult {
    const source: Dimensions = { width: sourceWidth, height: sourceHeight };
    const maxDim = settings.maxDimension;

    if (maxDim <= 0 || (sourceWidth <= maxDim && sourceHeight <= maxDim)) {
      return { sourceDimensions: source, targetDimensions: source, resized: false };
    }

    const maxSourceDim = Math.max(sourceWidth, sourceHeight);
    const scale = maxDim / maxSourceDim;

    return {
      sourceDimensions: source,
      targetDimensions: {
        width: Math.round(sourceWidth * scale),
        height: Math.round(sourceHeight * scale),
      },
      resized: true,
    };
  }

  async binarySearchQuality(
    encodeAtQuality: (quality: number) => Promise<number>,
    targetBytes: number,
  ): Promise<QualitySearchResult> {
    const minSize = await encodeAtQuality(QUALITY_MIN);
    let bestQuality = QUALITY_MIN;
    let bestSize = minSize;

    let lo = QUALITY_MIN + 1;
    let hi = QUALITY_MAX;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const size = await encodeAtQuality(mid);

      if (size <= targetBytes && (mid > bestQuality || bestSize > targetBytes)) {
        bestQuality = mid;
        bestSize = size;
      }

      if (size > targetBytes) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }

    return { quality: bestQuality, outputBytes: bestSize };
  }

  isAlreadyOptimal(inputBytes: number, outputBytes: number): boolean {
    return outputBytes >= inputBytes;
  }

  finalizeOutput(inputBytes: number, outputBytes: number): AutoOptimizeOutput {
    if (outputBytes >= inputBytes) {
      return { isAlreadyOptimal: true, outputBytes: inputBytes };
    }
    return { isAlreadyOptimal: false, outputBytes };
  }
}
