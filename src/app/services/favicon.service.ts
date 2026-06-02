import { Injectable } from '@angular/core';
import { ImageProcessorService } from './image-processor.service';
import type { FaviconSettings } from '../models/favicon-settings';
import {
  FAVICON_ICO_FILENAME,
  FAVICON_PNG_BY_SIZE,
  APPLE_TOUCH_ICON_FILENAME,
  ANDROID_CHROME_BY_SIZE,
  WEBMANIFEST_FILENAME,
  HEAD_SNIPPET_FILENAME,
  FAVICON_PNG_SIZES,
  APPLE_TOUCH_ICON_SIZE,
  ANDROID_CHROME_SIZES,
  FAVICON_ICO_SIZES,
} from '../models/favicon-settings';
import { normalizeToSquare, resizeCanvas } from '../utils/favicon-normalize';
import { buildIcoBlob } from '../utils/ico-encoder';
import { generateManifestBlob, generateHeadSnippetBlob } from '../utils/favicon-manifest';

const ALL_PNG_SIZES: readonly number[] = [
  ...FAVICON_PNG_SIZES,
  APPLE_TOUCH_ICON_SIZE,
  ...ANDROID_CHROME_SIZES,
];

@Injectable({ providedIn: 'root' })
export class FaviconService {
  constructor(private readonly processor: ImageProcessorService) {}

  async generatePackage(
    file: File,
    settings: FaviconSettings,
  ): Promise<ReadonlyMap<string, Blob>> {
    const source = await this.processor.loadImage(file);

    try {
      const square = normalizeToSquare(source, settings.backgroundColor);

      const pngBySize = new Map<number, Blob>();
      for (const size of ALL_PNG_SIZES) {
        const resized = resizeCanvas(square, size);
        const blob = await this.processor.encode(resized, {
          format: 'png',
          quality: 100,
          stripMetadata: false,
        });
        pngBySize.set(size, blob);
      }

      const icoPngs = new Map<number, Blob>();
      for (const size of FAVICON_ICO_SIZES) {
        const blob = pngBySize.get(size);
        if (blob) {
          icoPngs.set(size, blob);
        }
      }
      const icoBlob = await buildIcoBlob(icoPngs);

      const result = new Map<string, Blob>();

      result.set(FAVICON_ICO_FILENAME, icoBlob);

      for (const size of FAVICON_PNG_SIZES) {
        const blob = pngBySize.get(size);
        if (blob) {
          result.set(FAVICON_PNG_BY_SIZE[size], blob);
        }
      }

      const at180 = pngBySize.get(APPLE_TOUCH_ICON_SIZE);
      if (at180) {
        result.set(APPLE_TOUCH_ICON_FILENAME, at180);
      }

      for (const size of ANDROID_CHROME_SIZES) {
        const blob = pngBySize.get(size);
        if (blob) {
          result.set(ANDROID_CHROME_BY_SIZE[size], blob);
        }
      }

      result.set(WEBMANIFEST_FILENAME, generateManifestBlob(settings));
      result.set(HEAD_SNIPPET_FILENAME, generateHeadSnippetBlob(settings));

      return result;
    } finally {
      if (source instanceof ImageBitmap) {
        source.close();
      }
    }
  }
}
