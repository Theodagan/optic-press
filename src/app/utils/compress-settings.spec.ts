import {
  DEFAULT_COMPRESS_SETTINGS,
  FORMATS_WITH_ALPHA_THRESHOLD,
  FORMATS_WITH_BIT_DEPTH,
  FORMATS_WITH_CHROMA,
  validateCompressSettings,
} from '../models/compress-settings';

describe('validateCompressSettings', () => {
  it('should return no warnings for valid default settings', () => {
    const warnings = validateCompressSettings(DEFAULT_COMPRESS_SETTINGS);
    expect(warnings).toEqual([]);
  });

  it('should warn when quality is below 0', () => {
    const warnings = validateCompressSettings({ ...DEFAULT_COMPRESS_SETTINGS, quality: -1 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'quality' }));
  });

  it('should warn when quality is above 100', () => {
    const warnings = validateCompressSettings({ ...DEFAULT_COMPRESS_SETTINGS, quality: 101 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'quality' }));
  });

  it('should warn when quality is not an integer', () => {
    const warnings = validateCompressSettings({ ...DEFAULT_COMPRESS_SETTINGS, quality: 80.5 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'quality' }));
  });

  it('should accept quality 0', () => {
    const warnings = validateCompressSettings({ ...DEFAULT_COMPRESS_SETTINGS, quality: 0 });
    expect(warnings.filter((w) => w.field === 'quality')).toEqual([]);
  });

  it('should accept quality 100', () => {
    const warnings = validateCompressSettings({ ...DEFAULT_COMPRESS_SETTINGS, quality: 100 });
    expect(warnings.filter((w) => w.field === 'quality')).toEqual([]);
  });

  it('should warn when format is invalid', () => {
    const warnings = validateCompressSettings({
      ...DEFAULT_COMPRESS_SETTINGS,
      format: 'gif' as never,
    });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'format' }));
  });

  it('should warn when bitDepth is invalid for PNG format', () => {
    const warnings = validateCompressSettings({
      ...DEFAULT_COMPRESS_SETTINGS,
      format: 'png',
      bitDepth: 32 as never,
    });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'bitDepth' }));
  });

  it('should not warn about bitDepth for non-PNG formats', () => {
    const warnings = validateCompressSettings({
      ...DEFAULT_COMPRESS_SETTINGS,
      format: 'webp',
      bitDepth: 32 as never,
    });
    expect(warnings.filter((w) => w.field === 'bitDepth')).toEqual([]);
  });

  it('should warn when alphaThreshold is negative for PNG', () => {
    const warnings = validateCompressSettings({
      ...DEFAULT_COMPRESS_SETTINGS,
      format: 'png',
      alphaThreshold: -1,
    });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'alphaThreshold' }));
  });

  it('should warn when alphaThreshold is above 255 for WebP', () => {
    const warnings = validateCompressSettings({
      ...DEFAULT_COMPRESS_SETTINGS,
      format: 'webp',
      alphaThreshold: 256,
    });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'alphaThreshold' }));
  });

  it('should not warn about alphaThreshold for JPEG format', () => {
    const warnings = validateCompressSettings({
      ...DEFAULT_COMPRESS_SETTINGS,
      format: 'jpeg',
      alphaThreshold: 256,
    });
    expect(warnings.filter((w) => w.field === 'alphaThreshold')).toEqual([]);
  });

  it('should produce multiple warnings for multiple invalid fields', () => {
    const warnings = validateCompressSettings({
      ...DEFAULT_COMPRESS_SETTINGS,
      quality: -5,
      format: 'png',
      bitDepth: 32 as never,
    });
    expect(warnings.length).toBe(2);
  });
});

describe('FORMATS_WITH_CHROMA', () => {
  it('should include jpeg and webp', () => {
    expect(FORMATS_WITH_CHROMA).toContain('jpeg');
    expect(FORMATS_WITH_CHROMA).toContain('webp');
  });

  it('should not include png', () => {
    expect(FORMATS_WITH_CHROMA).not.toContain('png');
  });
});

describe('FORMATS_WITH_BIT_DEPTH', () => {
  it('should include png', () => {
    expect(FORMATS_WITH_BIT_DEPTH).toContain('png');
  });

  it('should not include jpeg or webp', () => {
    expect(FORMATS_WITH_BIT_DEPTH).not.toContain('jpeg');
    expect(FORMATS_WITH_BIT_DEPTH).not.toContain('webp');
  });
});

describe('FORMATS_WITH_ALPHA_THRESHOLD', () => {
  it('should include png and webp', () => {
    expect(FORMATS_WITH_ALPHA_THRESHOLD).toContain('png');
    expect(FORMATS_WITH_ALPHA_THRESHOLD).toContain('webp');
  });

  it('should not include jpeg', () => {
    expect(FORMATS_WITH_ALPHA_THRESHOLD).not.toContain('jpeg');
  });
});
