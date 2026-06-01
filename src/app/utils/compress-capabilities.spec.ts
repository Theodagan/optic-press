import {
  hasAlphaThreshold,
  hasBitDepth,
  hasChromaSubsampling,
} from './compress-capabilities';

describe('hasChromaSubsampling', () => {
  it('should return true for jpeg', () => {
    expect(hasChromaSubsampling('jpeg')).toBeTrue();
  });

  it('should return true for webp', () => {
    expect(hasChromaSubsampling('webp')).toBeTrue();
  });

  it('should return false for png', () => {
    expect(hasChromaSubsampling('png')).toBeFalse();
  });

  it('should return false for avif', () => {
    expect(hasChromaSubsampling('avif')).toBeFalse();
  });
});

describe('hasBitDepth', () => {
  it('should return true for png', () => {
    expect(hasBitDepth('png')).toBeTrue();
  });

  it('should return false for jpeg', () => {
    expect(hasBitDepth('jpeg')).toBeFalse();
  });

  it('should return false for webp', () => {
    expect(hasBitDepth('webp')).toBeFalse();
  });

  it('should return false for avif', () => {
    expect(hasBitDepth('avif')).toBeFalse();
  });
});

describe('hasAlphaThreshold', () => {
  it('should return true for png', () => {
    expect(hasAlphaThreshold('png')).toBeTrue();
  });

  it('should return true for webp', () => {
    expect(hasAlphaThreshold('webp')).toBeTrue();
  });

  it('should return false for jpeg', () => {
    expect(hasAlphaThreshold('jpeg')).toBeFalse();
  });

  it('should return false for avif', () => {
    expect(hasAlphaThreshold('avif')).toBeFalse();
  });
});
