import { Injectable } from '@angular/core';
import { ImageProcessorService } from './image-processor.service';
import type { ResponsiveSetResult, SrcsetSettings } from '../models/srcset-settings';
import { buildSrcsetSnippet, orderFormats } from '../utils/srcset-snippet';
import { buildVariantDescriptors } from '../utils/srcset-widths';

@Injectable({ providedIn: 'root' })
export class ResponsiveSetService {
  constructor(private readonly processor: ImageProcessorService) {}

  async generateSet(file: File, settings: SrcsetSettings): Promise<ResponsiveSetResult> {
    if (settings.formats.length === 0) {
      throw new Error('Select at least one output format.');
    }

    const source = await this.processor.loadImage(file);

    try {
      const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
      const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

      const variants = buildVariantDescriptors(
        file.name,
        sourceWidth,
        sourceHeight,
        settings.widths,
        orderFormats(settings.formats),
      );
      if (variants.length === 0) {
        throw new Error('Source image has no usable width.');
      }

      const files = new Map<string, Blob>();
      const widths = [...new Set(variants.map((variant) => variant.width))];

      for (const width of widths) {
        const sameWidth = variants.filter((variant) => variant.width === width);
        const canvas = await this.processor.drawToCanvas(source, {
          width,
          height: sameWidth[0].height,
        });

        for (const variant of sameWidth) {
          const blob = await this.processor.encode(canvas, {
            format: variant.format,
            quality: settings.quality,
            stripMetadata: true,
          });
          files.set(variant.fileName, blob);
        }
      }

      const snippet = buildSrcsetSnippet({ variants, sizes: settings.sizesAttribute });

      return { files, variants, snippet, sourceWidth, sourceHeight };
    } finally {
      if (source instanceof ImageBitmap) {
        source.close();
      }
    }
  }
}
