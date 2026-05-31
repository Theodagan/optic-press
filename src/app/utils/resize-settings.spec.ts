import { DEFAULT_RESIZE_SETTINGS, validateResizeSettings } from '../models/resize-settings';

describe('validateResizeSettings', () => {
  it('should return no warnings for valid default settings', () => {
    const warnings = validateResizeSettings(DEFAULT_RESIZE_SETTINGS);
    expect(warnings).toEqual([]);
  });

  it('should warn when maxDimension is zero', () => {
    const warnings = validateResizeSettings({ ...DEFAULT_RESIZE_SETTINGS, maxDimension: 0 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'maxDimension' }));
  });

  it('should warn when maxDimension is negative', () => {
    const warnings = validateResizeSettings({ ...DEFAULT_RESIZE_SETTINGS, maxDimension: -100 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'maxDimension' }));
  });

  it('should warn when maxDimension is not an integer', () => {
    const warnings = validateResizeSettings({ ...DEFAULT_RESIZE_SETTINGS, maxDimension: 1200.5 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'maxDimension' }));
  });

  it('should warn when width is invalid in exact mode', () => {
    const warnings = validateResizeSettings({
      ...DEFAULT_RESIZE_SETTINGS,
      mode: 'exact',
      width: 0,
    });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'width' }));
  });

  it('should warn when height is invalid in exact mode', () => {
    const warnings = validateResizeSettings({
      ...DEFAULT_RESIZE_SETTINGS,
      mode: 'exact',
      height: -1,
    });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'height' }));
  });

  it('should not warn about width/height in maxDimension mode', () => {
    const warnings = validateResizeSettings({
      ...DEFAULT_RESIZE_SETTINGS,
      mode: 'maxDimension',
      width: 0,
      height: 0,
    });
    expect(warnings.filter((w) => w.field === 'width' || w.field === 'height')).toEqual([]);
  });

  it('should warn when quality is out of range', () => {
    const warnings = validateResizeSettings({ ...DEFAULT_RESIZE_SETTINGS, quality: 101 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'quality' }));
  });

  it('should warn when quality is zero', () => {
    const warnings = validateResizeSettings({ ...DEFAULT_RESIZE_SETTINGS, quality: 0 });
    expect(warnings).toContain(jasmine.objectContaining({ field: 'quality' }));
  });

  it('should produce multiple warnings for multiple invalid fields', () => {
    const warnings = validateResizeSettings({
      ...DEFAULT_RESIZE_SETTINGS,
      maxDimension: -1,
      quality: 200,
    });
    expect(warnings.length).toBe(2);
  });
});
