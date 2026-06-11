import type { ImageFormat } from './processing-settings';

export type SnippetFileType = 'html' | 'txt';

export interface SrcsetSettings {
  readonly widths: readonly number[];
  readonly formats: readonly ImageFormat[];
  readonly sizesAttribute: string;
  readonly quality: number;
  readonly includeSnippetInZip: boolean;
  readonly snippetFileType: SnippetFileType;
}

export const DEFAULT_SRCSET_WIDTHS: readonly number[] = [320, 640, 960, 1280, 1920, 2560];

export const DEFAULT_SRCSET_SETTINGS: SrcsetSettings = {
  widths: DEFAULT_SRCSET_WIDTHS,
  formats: ['webp'],
  sizesAttribute: '100vw',
  quality: 80,
  includeSnippetInZip: true,
  snippetFileType: 'html',
};

export interface SrcsetVariant {
  readonly width: number;
  readonly height: number;
  readonly format: ImageFormat;
  readonly fileName: string;
}

export interface ResponsiveSetResult {
  readonly files: ReadonlyMap<string, Blob>;
  readonly variants: readonly SrcsetVariant[];
  readonly snippet: string;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
}
