import type { ImageProcessingSettings } from '../models/processing-settings';
import { calculateResizeDimensions, fitDimensions } from './resize-dimensions';

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
