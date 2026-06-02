import type { CropSettings } from './crop-settings';
import { DEFAULT_CROP_SETTINGS, validateCropSettings } from './crop-settings';

describe('validateCropSettings', () => {
  it('should return no warnings for valid default settings', () => {
    const warnings = validateCropSettings(DEFAULT_CROP_SETTINGS);
    expect(warnings).toEqual([]);
  });

  it('should return warning for quality out of range', () => {
    const settings: CropSettings = { ...DEFAULT_CROP_SETTINGS, quality: 0 };
    const warnings = validateCropSettings(settings);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].field).toBe('quality');
  });

  it('should return warning for quality above 100', () => {
    const settings: CropSettings = { ...DEFAULT_CROP_SETTINGS, quality: 101 };
    const warnings = validateCropSettings(settings);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].field).toBe('quality');
  });

  it('should return warning for non-integer quality', () => {
    const settings: CropSettings = { ...DEFAULT_CROP_SETTINGS, quality: 80.5 };
    const warnings = validateCropSettings(settings);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].field).toBe('quality');
  });

  it('should return no warnings for valid custom ratio', () => {
    const settings: CropSettings = { ...DEFAULT_CROP_SETTINGS, preset: 'custom', customRatioW: 16, customRatioH: 9 };
    const warnings = validateCropSettings(settings);
    expect(warnings).toEqual([]);
  });

  it('should return warning for zero custom ratio width', () => {
    const settings: CropSettings = { ...DEFAULT_CROP_SETTINGS, preset: 'custom', customRatioW: 0, customRatioH: 9 };
    const warnings = validateCropSettings(settings);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].field).toBe('customRatioW');
  });

  it('should return warning for negative custom ratio height', () => {
    const settings: CropSettings = { ...DEFAULT_CROP_SETTINGS, preset: 'custom', customRatioW: 16, customRatioH: -9 };
    const warnings = validateCropSettings(settings);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].field).toBe('customRatioH');
  });

  it('should not validate custom ratio fields for non-custom presets', () => {
    const settings: CropSettings = { ...DEFAULT_CROP_SETTINGS, preset: '1:1', customRatioW: 0, customRatioH: 0 };
    const warnings = validateCropSettings(settings);
    expect(warnings).toEqual([]);
  });
});

describe('DEFAULT_CROP_SETTINGS', () => {
  it('should have free mode', () => {
    expect(DEFAULT_CROP_SETTINGS.mode).toBe('free');
  });

  it('should have free preset', () => {
    expect(DEFAULT_CROP_SETTINGS.preset).toBe('free');
  });

  it('should have webp output format', () => {
    expect(DEFAULT_CROP_SETTINGS.outputFormat).toBe('webp');
  });

  it('should have quality of 80', () => {
    expect(DEFAULT_CROP_SETTINGS.quality).toBe(80);
  });

  it('should have zero rect', () => {
    expect(DEFAULT_CROP_SETTINGS.rect).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});
