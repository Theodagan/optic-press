import { EXTENSION_BY_FORMAT, MIME_BY_FORMAT, outputFileNameFor } from './format-mapping';

describe('MIME_BY_FORMAT', () => {
  it('should map png to image/png', () => {
    expect(MIME_BY_FORMAT.png).toBe('image/png');
  });

  it('should map jpeg to image/jpeg', () => {
    expect(MIME_BY_FORMAT.jpeg).toBe('image/jpeg');
  });

  it('should map webp to image/webp', () => {
    expect(MIME_BY_FORMAT.webp).toBe('image/webp');
  });

  it('should map avif to image/avif', () => {
    expect(MIME_BY_FORMAT.avif).toBe('image/avif');
  });
});

describe('EXTENSION_BY_FORMAT', () => {
  it('should map png to .png', () => {
    expect(EXTENSION_BY_FORMAT.png).toBe('.png');
  });

  it('should map jpeg to .jpg', () => {
    expect(EXTENSION_BY_FORMAT.jpeg).toBe('.jpg');
  });

  it('should map webp to .webp', () => {
    expect(EXTENSION_BY_FORMAT.webp).toBe('.webp');
  });

  it('should map avif to .avif', () => {
    expect(EXTENSION_BY_FORMAT.avif).toBe('.avif');
  });
});

describe('outputFileNameFor', () => {
  it('should replace extension with the target format extension', () => {
    expect(outputFileNameFor('photo.png', 'webp')).toBe('photo.webp');
    expect(outputFileNameFor('photo.jpg', 'png')).toBe('photo.png');
    expect(outputFileNameFor('photo.jpeg', 'avif')).toBe('photo.avif');
    expect(outputFileNameFor('photo.webp', 'jpeg')).toBe('photo.jpg');
  });

  it('should handle filenames with multiple dots', () => {
    expect(outputFileNameFor('archive.tar.gz', 'webp')).toBe('archive.tar.webp');
    expect(outputFileNameFor('my.photo.png', 'jpeg')).toBe('my.photo.jpg');
  });

  it('should preserve filename when there is no extension', () => {
    expect(outputFileNameFor('photo', 'webp')).toBe('photo.webp');
    expect(outputFileNameFor('noext', 'png')).toBe('noext.png');
  });

  it('should handle filenames starting with a dot', () => {
    expect(outputFileNameFor('.hidden', 'webp')).toBe('.hidden.webp');
  });

  it('should work with uppercase extensions', () => {
    expect(outputFileNameFor('photo.PNG', 'jpeg')).toBe('photo.jpg');
    expect(outputFileNameFor('IMAGE.JPEG', 'webp')).toBe('IMAGE.webp');
  });

  it('should handle all target formats', () => {
    expect(outputFileNameFor('photo.png', 'png')).toBe('photo.png');
    expect(outputFileNameFor('photo.png', 'jpeg')).toBe('photo.jpg');
    expect(outputFileNameFor('photo.png', 'webp')).toBe('photo.webp');
    expect(outputFileNameFor('photo.png', 'avif')).toBe('photo.avif');
  });
});
