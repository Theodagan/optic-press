import { DEFAULT_SRCSET_WIDTHS } from '../models/srcset-settings';
import {
  buildVariantDescriptors,
  computeEffectiveWidths,
  srcsetBaseName,
  variantFileName,
  variantHeight,
} from './srcset-widths';

describe('computeEffectiveWidths', () => {
  it('should skip targets at or above the source width and append the source width', () => {
    expect(computeEffectiveWidths(DEFAULT_SRCSET_WIDTHS, 1000)).toEqual([320, 640, 960, 1000]);
  });

  it('should include all targets below the source width', () => {
    expect(computeEffectiveWidths(DEFAULT_SRCSET_WIDTHS, 4000)).toEqual([
      320, 640, 960, 1280, 1920, 2560, 4000,
    ]);
  });

  it('should not duplicate a target equal to the source width', () => {
    expect(computeEffectiveWidths(DEFAULT_SRCSET_WIDTHS, 1280)).toEqual([320, 640, 960, 1280]);
  });

  it('should return only the source width when every target is larger', () => {
    expect(computeEffectiveWidths(DEFAULT_SRCSET_WIDTHS, 100)).toEqual([100]);
  });

  it('should sort unordered targets ascending', () => {
    expect(computeEffectiveWidths([960, 320, 640], 2000)).toEqual([320, 640, 960, 2000]);
  });

  it('should dedupe repeated targets', () => {
    expect(computeEffectiveWidths([320, 320, 640], 2000)).toEqual([320, 640, 2000]);
  });

  it('should ignore non-positive and non-integer targets', () => {
    expect(computeEffectiveWidths([-1, 0, 320.5, 640], 2000)).toEqual([640, 2000]);
  });

  it('should return an empty list for an invalid source width', () => {
    expect(computeEffectiveWidths(DEFAULT_SRCSET_WIDTHS, 0)).toEqual([]);
  });
});

describe('variantHeight', () => {
  it('should derive heights from the source aspect ratio', () => {
    expect(variantHeight(2000, 1000, 640)).toBe(320);
  });

  it('should round to the nearest integer', () => {
    expect(variantHeight(3000, 2000, 320)).toBe(213);
  });

  it('should never return less than 1', () => {
    expect(variantHeight(2000, 1, 320)).toBe(1);
  });
});

describe('srcsetBaseName', () => {
  it('should strip the extension and lowercase', () => {
    expect(srcsetBaseName('Hero.PNG')).toBe('hero');
  });

  it('should slugify spaces and special characters', () => {
    expect(srcsetBaseName('My Photo (final).jpg')).toBe('my-photo-final');
  });

  it('should fall back to "image" when nothing usable remains', () => {
    expect(srcsetBaseName('***.png')).toBe('image');
  });
});

describe('variantFileName', () => {
  it('should follow the <basename>-<width>w.<ext> pattern', () => {
    expect(variantFileName('hero', 640, 'webp')).toBe('hero-640w.webp');
  });

  it('should use the .jpg extension for jpeg', () => {
    expect(variantFileName('hero', 320, 'jpeg')).toBe('hero-320w.jpg');
  });
});

describe('buildVariantDescriptors', () => {
  it('should produce one variant per effective width and format', () => {
    const variants = buildVariantDescriptors('hero.png', 1000, 500, [320, 640, 2000], ['webp', 'jpeg']);

    expect(variants.length).toBe(6);
    expect(variants.map((v) => v.fileName)).toEqual([
      'hero-320w.webp',
      'hero-320w.jpg',
      'hero-640w.webp',
      'hero-640w.jpg',
      'hero-1000w.webp',
      'hero-1000w.jpg',
    ]);
  });

  it('should carry aspect-correct heights on every variant', () => {
    const variants = buildVariantDescriptors('hero.png', 1000, 500, [320], ['webp']);

    expect(variants[0].height).toBe(160);
    expect(variants[1].height).toBe(500);
  });
});
