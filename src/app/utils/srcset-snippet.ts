import type { ImageFormat } from '../models/processing-settings';
import type { SrcsetVariant } from '../models/srcset-settings';
import { MIME_BY_FORMAT } from './format-mapping';

export interface SnippetDescriptor {
  readonly variants: readonly SrcsetVariant[];
  readonly sizes: string;
}

// Most efficient first; the last selected format becomes the <img> fallback.
const FORMAT_EFFICIENCY_ORDER: readonly ImageFormat[] = ['avif', 'webp', 'jpeg', 'png'];

export function orderFormats(formats: readonly ImageFormat[]): readonly ImageFormat[] {
  return FORMAT_EFFICIENCY_ORDER.filter((format) => formats.includes(format));
}

export function buildSrcsetSnippet(descriptor: SnippetDescriptor): string {
  const { variants, sizes } = descriptor;
  if (variants.length === 0) {
    return '';
  }

  const formats = orderFormats([...new Set(variants.map((v) => v.format))]);
  const fallbackFormat = formats[formats.length - 1];
  const fallbackVariants = variantsFor(variants, fallbackFormat);
  const largest = fallbackVariants[fallbackVariants.length - 1];

  const img = [
    `<img`,
    `  src="${largest.fileName}"`,
    `  srcset="${srcsetAttribute(fallbackVariants)}"`,
    `  sizes="${sizes}"`,
    `  width="${largest.width}"`,
    `  height="${largest.height}"`,
    `  alt=""`,
    `/>`,
  ];

  if (formats.length === 1) {
    return img.join('\n');
  }

  const sources = formats.slice(0, -1).map((format) =>
    [
      `  <source`,
      `    type="${MIME_BY_FORMAT[format]}"`,
      `    srcset="${srcsetAttribute(variantsFor(variants, format))}"`,
      `    sizes="${sizes}"`,
      `  />`,
    ].join('\n'),
  );

  const indentedImg = img.map((line) => `  ${line}`).join('\n');

  return [`<picture>`, ...sources, indentedImg, `</picture>`].join('\n');
}

function variantsFor(
  variants: readonly SrcsetVariant[],
  format: ImageFormat,
): readonly SrcsetVariant[] {
  return variants
    .filter((variant) => variant.format === format)
    .slice()
    .sort((a, b) => a.width - b.width);
}

function srcsetAttribute(variants: readonly SrcsetVariant[]): string {
  return variants.map((variant) => `${variant.fileName} ${variant.width}w`).join(', ');
}

export function snippetFileNameFor(fileType: 'html' | 'txt'): string {
  return `snippet.${fileType}`;
}

export function referencedFileNames(snippet: string): readonly string[] {
  const names = new Set<string>();

  for (const match of snippet.matchAll(/src="([^"]+)"/g)) {
    names.add(match[1]);
  }
  for (const match of snippet.matchAll(/srcset="([^"]+)"/g)) {
    for (const entry of match[1].split(',')) {
      const fileName = entry.trim().split(/\s+/)[0];
      if (fileName) {
        names.add(fileName);
      }
    }
  }

  return [...names];
}
