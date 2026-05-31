import type { ImageProcessingSettings } from '../models/processing-settings';
import type { ResizeSettings } from '../models/resize-settings';
import { DEFAULT_RESIZE_SETTINGS } from '../models/resize-settings';
import { calculateResizeDimensions, computeResizeTarget, fitDimensions } from './resize-dimensions';

describe('calculateResizeDimensions', () => {
  const baseSettings: ImageProcessingSettings = {
    format: 'webp',
    quality: 80,
    maintainAspectRatio: true,
    upscale: false,
  };

  it('should return input dimensions when no target specified', () => {
    const result = calculateResizeDimensions(800, 600, baseSettings);
    expect(result.output).toEqual({ width: 800, height: 600 });
    expect(result.upscaled).toBeFalse();
  });

  it('should scale down proportionally to target width', () => {
    const result = calculateResizeDimensions(1600, 1200, {
      ...baseSettings,
      width: 800,
    });
    expect(result.output.width).toBe(800);
    expect(result.output.height).toBe(600);
    expect(result.upscaled).toBeFalse();
  });

  it('should scale down proportionally to target height', () => {
    const result = calculateResizeDimensions(1600, 1200, {
      ...baseSettings,
      height: 600,
    });
    expect(result.output.width).toBe(800);
    expect(result.output.height).toBe(600);
    expect(result.upscaled).toBeFalse();
  });

  it('should prevent upscaling when disabled', () => {
    const result = calculateResizeDimensions(400, 300, {
      ...baseSettings,
      width: 800,
      height: 600,
      upscale: false,
    });
    expect(result.output.width).toBe(400);
    expect(result.output.height).toBe(300);
  });

  it('should allow upscaling when enabled', () => {
    const result = calculateResizeDimensions(400, 300, {
      ...baseSettings,
      width: 800,
      height: 600,
      upscale: true,
    });
    expect(result.output.width).toBe(800);
    expect(result.output.height).toBe(600);
  });

  it('should set exact dimensions when aspect ratio is not maintained', () => {
    const result = calculateResizeDimensions(1600, 1200, {
      ...baseSettings,
      width: 400,
      height: 200,
      maintainAspectRatio: false,
    });
    expect(result.output.width).toBe(400);
    expect(result.output.height).toBe(200);
  });
});

describe('fitDimensions', () => {
  it('should fit within max bounds preserving ratio', () => {
    const result = fitDimensions(1600, 1200, 800, 600);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it('should constrain by width when wider than max', () => {
    const result = fitDimensions(2000, 1000, 800, 800);
    expect(result.width).toBe(800);
    expect(result.height).toBe(400);
  });

  it('should constrain by height when taller than max', () => {
    const result = fitDimensions(1000, 2000, 800, 800);
    expect(result.width).toBe(400);
    expect(result.height).toBe(800);
  });
});

describe('computeResizeTarget', () => {
  it('should cap landscape longest edge to maxDimension', () => {
    const settings: ResizeSettings = { ...DEFAULT_RESIZE_SETTINGS, mode: 'maxDimension', maxDimension: 800 };
    const result = computeResizeTarget(1600, 1200, settings);
    expect(result.output.width).toBe(800);
    expect(result.output.height).toBe(600);
    expect(result.upscaled).toBeFalse();
  });

  it('should cap portrait longest edge to maxDimension', () => {
    const settings: ResizeSettings = { ...DEFAULT_RESIZE_SETTINGS, mode: 'maxDimension', maxDimension: 600 };
    const result = computeResizeTarget(1200, 1600, settings);
    expect(result.output.width).toBe(450);
    expect(result.output.height).toBe(600);
    expect(result.upscaled).toBeFalse();
  });

  it('should cap square to maxDimension', () => {
    const settings: ResizeSettings = { ...DEFAULT_RESIZE_SETTINGS, mode: 'maxDimension', maxDimension: 500 };
    const result = computeResizeTarget(1000, 1000, settings);
    expect(result.output.width).toBe(500);
    expect(result.output.height).toBe(500);
  });

  it('should produce exact target with aspect lock enabled', () => {
    const settings: ResizeSettings = {
      ...DEFAULT_RESIZE_SETTINGS,
      mode: 'exact',
      width: 800,
      height: 600,
      aspectLocked: true,
      preventUpscale: false,
    };
    const result = computeResizeTarget(1600, 1200, settings);
    expect(result.output.width).toBe(800);
    expect(result.output.height).toBe(600);
  });

  it('should produce exact target without aspect lock', () => {
    const settings: ResizeSettings = {
      ...DEFAULT_RESIZE_SETTINGS,
      mode: 'exact',
      width: 400,
      height: 200,
      aspectLocked: false,
      preventUpscale: false,
    };
    const result = computeResizeTarget(1600, 1200, settings);
    expect(result.output.width).toBe(400);
    expect(result.output.height).toBe(200);
  });

  it('should prevent upscale when enabled', () => {
    const settings: ResizeSettings = { ...DEFAULT_RESIZE_SETTINGS, mode: 'maxDimension', maxDimension: 800, preventUpscale: true };
    const result = computeResizeTarget(400, 300, settings);
    expect(result.output.width).toBe(400);
    expect(result.output.height).toBe(300);
  });

  it('should allow scaling beyond source when preventUpscale is disabled', () => {
    const settings: ResizeSettings = { ...DEFAULT_RESIZE_SETTINGS, mode: 'exact', width: 800, height: 600, preventUpscale: false };
    const result = computeResizeTarget(400, 300, settings);
    expect(result.output.width).toBe(800);
    expect(result.output.height).toBe(600);
    expect(result.upscaled).toBeTrue();
  });

  it('should mark upscaled correctly for maxDimension upscale prevention', () => {
    const settings: ResizeSettings = { ...DEFAULT_RESIZE_SETTINGS, mode: 'maxDimension', maxDimension: 2000, preventUpscale: true };
    const result = computeResizeTarget(800, 600, settings);
    expect(result.upscaled).toBeFalse();
    expect(result.output.width).toBe(800);
  });

  it('should preserve aspect ratio in maxDimension mode for 16:9', () => {
    const settings: ResizeSettings = { ...DEFAULT_RESIZE_SETTINGS, mode: 'maxDimension', maxDimension: 1920 };
    const result = computeResizeTarget(3840, 2160, settings);
    expect(result.output.width).toBe(1920);
    expect(result.output.height).toBe(1080);
  });
});
