import type { ImageProcessingSettings } from './processing-settings';

export interface ProcessingPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly settings: Partial<ImageProcessingSettings>;
}

export const BUILTIN_PRESETS: readonly ProcessingPreset[] = [
  {
    id: 'lossy-std',
    name: 'Lossy Standard',
    description: 'WebP at 80% quality with metadata stripped.',
    settings: { format: 'webp', quality: 80, stripMetadata: true },
  },
  {
    id: 'lossless',
    name: 'Lossless',
    description: 'PNG output with no quality loss.',
    settings: { format: 'png', stripMetadata: true },
  },
  {
    id: 'thumb',
    name: 'Thumbnail',
    description: 'Resize to 320px wide WebP thumbnail.',
    settings: { format: 'webp', quality: 75, width: 320, maintainAspectRatio: true, stripMetadata: true },
  },
  {
    id: 'avif-std',
    name: 'AVIF Standard',
    description: 'AVIF at 70% quality when supported.',
    settings: { format: 'avif', quality: 70, stripMetadata: true },
  },
];
