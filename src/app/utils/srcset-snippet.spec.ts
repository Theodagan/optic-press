import { buildVariantDescriptors } from './srcset-widths';
import {
  buildSrcsetSnippet,
  orderFormats,
  referencedFileNames,
  snippetFileNameFor,
} from './srcset-snippet';

describe('orderFormats', () => {
  it('should order selected formats most-efficient first', () => {
    expect(orderFormats(['png', 'avif', 'webp'])).toEqual(['avif', 'webp', 'png']);
  });

  it('should keep a single format as-is', () => {
    expect(orderFormats(['webp'])).toEqual(['webp']);
  });
});

describe('buildSrcsetSnippet', () => {
  const singleFormat = buildVariantDescriptors('hero.png', 1000, 500, [320, 640], ['webp']);
  const multiFormat = buildVariantDescriptors(
    'hero.png',
    1000,
    500,
    [320, 640],
    ['avif', 'webp', 'jpeg'],
  );

  it('should return an empty string for no variants', () => {
    expect(buildSrcsetSnippet({ variants: [], sizes: '100vw' })).toBe('');
  });

  it('should emit a plain <img> for a single format', () => {
    const snippet = buildSrcsetSnippet({ variants: singleFormat, sizes: '100vw' });

    expect(snippet.startsWith('<img')).toBeTrue();
    expect(snippet).not.toContain('<picture>');
    expect(snippet).toContain('src="hero-1000w.webp"');
    expect(snippet).toContain(
      'srcset="hero-320w.webp 320w, hero-640w.webp 640w, hero-1000w.webp 1000w"',
    );
    expect(snippet).toContain('width="1000"');
    expect(snippet).toContain('height="500"');
    expect(snippet).toContain('alt=""');
  });

  it('should emit a <picture> with one <source> per non-fallback format', () => {
    const snippet = buildSrcsetSnippet({ variants: multiFormat, sizes: '100vw' });

    expect(snippet.startsWith('<picture>')).toBeTrue();
    expect(snippet.match(/<source/g)?.length).toBe(2);
    expect(snippet).toContain('type="image/avif"');
    expect(snippet).toContain('type="image/webp"');
    expect(snippet).not.toContain('type="image/jpeg"');
    expect(snippet).toContain('src="hero-1000w.jpg"');
  });

  it('should order <source> elements most-efficient first', () => {
    const snippet = buildSrcsetSnippet({ variants: multiFormat, sizes: '100vw' });

    expect(snippet.indexOf('image/avif')).toBeLessThan(snippet.indexOf('image/webp'));
  });

  it('should insert the sizes value verbatim', () => {
    const sizes = '(max-width: 600px) 100vw, 50vw';
    const snippet = buildSrcsetSnippet({ variants: singleFormat, sizes });

    expect(snippet).toContain(`sizes="${sizes}"`);
  });

  it('should be insensitive to variant input order', () => {
    const shuffled = [...multiFormat].reverse();
    expect(buildSrcsetSnippet({ variants: shuffled, sizes: '100vw' })).toBe(
      buildSrcsetSnippet({ variants: multiFormat, sizes: '100vw' }),
    );
  });
});

describe('referencedFileNames', () => {
  it('should extract every file referenced by src and srcset attributes', () => {
    const variants = buildVariantDescriptors('hero.png', 1000, 500, [320], ['avif', 'jpeg']);
    const snippet = buildSrcsetSnippet({ variants, sizes: '100vw' });

    expect([...referencedFileNames(snippet)].sort()).toEqual([
      'hero-1000w.avif',
      'hero-1000w.jpg',
      'hero-320w.avif',
      'hero-320w.jpg',
    ]);
  });
});

describe('snippetFileNameFor', () => {
  it('should name the snippet file by type', () => {
    expect(snippetFileNameFor('html')).toBe('snippet.html');
    expect(snippetFileNameFor('txt')).toBe('snippet.txt');
  });
});
