export interface ToolDefinition {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

export const TOOLS: readonly ToolDefinition[] = [
  {
    slug: 'auto-optimize',
    name: 'Auto Optimize',
    description: 'Pick balanced compression and format settings automatically.',
    icon: 'Spark',
  },
  {
    slug: 'compress',
    name: 'Compress',
    description: 'Reduce file size while preserving visual quality.',
    icon: 'Press',
  },
  {
    slug: 'convert',
    name: 'Convert',
    description: 'Export images to web-friendly formats.',
    icon: 'Swap',
  },
  {
    slug: 'resize',
    name: 'Resize',
    description: 'Scale images for publishing, sharing, and app assets.',
    icon: 'Frame',
  },
  {
    slug: 'favicon',
    name: 'Favicon',
    description: 'Generate favicon-ready sizes from a source image.',
    icon: 'Grid',
  },
  {
    slug: 'strip-metadata',
    name: 'Strip Metadata',
    description: 'Remove embedded metadata before publishing.',
    icon: 'Clean',
  },
  {
    slug: 'crop',
    name: 'Crop',
    description: 'Trim images to the exact composition or ratio you need.',
    icon: 'Crop',
  },
];
