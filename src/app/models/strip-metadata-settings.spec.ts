import {
  DEFAULT_STRIP_METADATA_SETTINGS,
  validateStripMetadataSettings,
} from './strip-metadata-settings';

describe('DEFAULT_STRIP_METADATA_SETTINGS', () => {
  it('should default stripExif to true', () => {
    expect(DEFAULT_STRIP_METADATA_SETTINGS.stripExif).toBe(true);
  });

  it('should default stripIccProfile to true', () => {
    expect(DEFAULT_STRIP_METADATA_SETTINGS.stripIccProfile).toBe(true);
  });

  it('should default retagSrgb to true', () => {
    expect(DEFAULT_STRIP_METADATA_SETTINGS.retagSrgb).toBe(true);
  });

  it('should default outputFormat to same', () => {
    expect(DEFAULT_STRIP_METADATA_SETTINGS.outputFormat).toBe('same');
  });

  it('should default quality to 92', () => {
    expect(DEFAULT_STRIP_METADATA_SETTINGS.quality).toBe(92);
  });
});

describe('validateStripMetadataSettings', () => {
  it('should return no warnings for valid default settings', () => {
    const warnings = validateStripMetadataSettings(DEFAULT_STRIP_METADATA_SETTINGS);
    expect(warnings).toEqual([]);
  });

  it('should warn when quality is below 0', () => {
    const warnings = validateStripMetadataSettings({
      ...DEFAULT_STRIP_METADATA_SETTINGS,
      quality: -1,
    });
    expect(warnings).toContain(
      jasmine.objectContaining({ field: 'quality' }),
    );
  });

  it('should warn when quality is above 100', () => {
    const warnings = validateStripMetadataSettings({
      ...DEFAULT_STRIP_METADATA_SETTINGS,
      quality: 101,
    });
    expect(warnings).toContain(
      jasmine.objectContaining({ field: 'quality' }),
    );
  });

  it('should warn when quality is not an integer', () => {
    const warnings = validateStripMetadataSettings({
      ...DEFAULT_STRIP_METADATA_SETTINGS,
      quality: 80.5,
    });
    expect(warnings).toContain(
      jasmine.objectContaining({ field: 'quality' }),
    );
  });

  it('should warn when quality is NaN', () => {
    const warnings = validateStripMetadataSettings({
      ...DEFAULT_STRIP_METADATA_SETTINGS,
      quality: NaN,
    });
    expect(warnings).toContain(
      jasmine.objectContaining({ field: 'quality' }),
    );
  });

  it('should not warn for valid settings with same output format', () => {
    const warnings = validateStripMetadataSettings({
      ...DEFAULT_STRIP_METADATA_SETTINGS,
      outputFormat: 'same',
      quality: 80,
    });
    expect(warnings).toEqual([]);
  });

  it('should not warn for valid settings with converted output format', () => {
    const warnings = validateStripMetadataSettings({
      ...DEFAULT_STRIP_METADATA_SETTINGS,
      outputFormat: 'webp',
      quality: 75,
    });
    expect(warnings).toEqual([]);
  });
});
