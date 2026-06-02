import type { CropRect } from '../models/crop-settings';
import { clampCropRect, computeCropFromPreset, computeLargestCropRect, getPresetRatio } from './crop-utils';

describe('getPresetRatio', () => {
  it('should return null for free preset', () => {
    expect(getPresetRatio('free')).toBeNull();
  });

  it('should return null for custom preset', () => {
    expect(getPresetRatio('custom')).toBeNull();
  });

  it('should return [1, 1] for 1:1 preset', () => {
    expect(getPresetRatio('1:1')).toEqual([1, 1]);
  });

  it('should return [16, 9] for 16:9 preset', () => {
    expect(getPresetRatio('16:9')).toEqual([16, 9]);
  });

  it('should return [4, 3] for 4:3 preset', () => {
    expect(getPresetRatio('4:3')).toEqual([4, 3]);
  });

  it('should return [3, 2] for 3:2 preset', () => {
    expect(getPresetRatio('3:2')).toEqual([3, 2]);
  });

  it('should return [191, 100] for 1.91:1 preset', () => {
    expect(getPresetRatio('1.91:1')).toEqual([191, 100]);
  });
});

describe('computeLargestCropRect', () => {
  it('should return full image for invalid inputs', () => {
    const result = computeLargestCropRect(0, 100, 16, 9);
    expect(result).toEqual({ x: 0, y: 0, width: 0, height: 100 });
  });

  it('should compute 1:1 crop centered on landscape image', () => {
    const result = computeLargestCropRect(1600, 1200, 1, 1);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(1200);
    expect(result.x).toBe(200);
    expect(result.y).toBe(0);
  });

  it('should compute 1:1 crop centered on portrait image', () => {
    const result = computeLargestCropRect(1200, 1600, 1, 1);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(1200);
    expect(result.x).toBe(0);
    expect(result.y).toBe(200);
  });

  it('should compute 1:1 crop on square image', () => {
    const result = computeLargestCropRect(1000, 1000, 1, 1);
    expect(result.width).toBe(1000);
    expect(result.height).toBe(1000);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('should compute 16:9 crop on landscape image', () => {
    const result = computeLargestCropRect(1920, 1200, 16, 9);
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
    expect(result.x).toBe(0);
    expect(result.y).toBe(60);
  });

  it('should compute 16:9 crop on portrait image', () => {
    const result = computeLargestCropRect(1200, 1920, 16, 9);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(675);
    expect(result.x).toBe(0);
    expect(result.y).toBe(623);
  });

  it('should compute 4:3 crop on wide image', () => {
    const result = computeLargestCropRect(1600, 900, 4, 3);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(900);
    expect(result.x).toBe(200);
    expect(result.y).toBe(0);
  });

  it('should compute 3:2 crop on wide image', () => {
    const result = computeLargestCropRect(1600, 900, 3, 2);
    expect(result.width).toBe(1350);
    expect(result.height).toBe(900);
    expect(result.x).toBe(125);
    expect(result.y).toBe(0);
  });

  it('should compute 1.91:1 (Open Graph) crop', () => {
    const result = computeLargestCropRect(1600, 1200, 191, 100);
    expect(result.width).toBe(1600);
    expect(result.height).toBe(838);
    expect(result.x).toBe(0);
    expect(result.y).toBe(181);
  });

  it('should handle zero ratio values gracefully', () => {
    const result = computeLargestCropRect(1600, 1200, 0, 9);
    expect(result.width).toBe(1600);
    expect(result.height).toBe(1200);
  });
});

describe('computeCropFromPreset', () => {
  it('should return full image for free preset', () => {
    const result = computeCropFromPreset(1600, 1200, 'free');
    expect(result).toEqual({ x: 0, y: 0, width: 1600, height: 1200 });
  });

  it('should return full image for custom preset', () => {
    const result = computeCropFromPreset(1600, 1200, 'custom');
    expect(result).toEqual({ x: 0, y: 0, width: 1600, height: 1200 });
  });

  it('should compute 1:1 crop from preset', () => {
    const result = computeCropFromPreset(1600, 1200, '1:1');
    expect(result.width).toBe(1200);
    expect(result.height).toBe(1200);
    expect(result.x).toBe(200);
    expect(result.y).toBe(0);
  });

  it('should compute 16:9 crop from preset', () => {
    const result = computeCropFromPreset(1920, 1200, '16:9');
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
    expect(result.x).toBe(0);
    expect(result.y).toBe(60);
  });

  it('should compute 4:3 crop from preset', () => {
    const result = computeCropFromPreset(1600, 900, '4:3');
    expect(result.width).toBe(1200);
    expect(result.height).toBe(900);
  });

  it('should compute 3:2 crop from preset', () => {
    const result = computeCropFromPreset(1600, 900, '3:2');
    expect(result.width).toBe(1350);
    expect(result.height).toBe(900);
  });

  it('should compute 1.91:1 (Open Graph) crop from preset', () => {
    const result = computeCropFromPreset(1600, 1200, '1.91:1');
    expect(result.width).toBe(1600);
    expect(result.height).toBe(838);
  });
});

describe('clampCropRect', () => {
  it('should return rect unchanged when within bounds', () => {
    const rect: CropRect = { x: 10, y: 10, width: 100, height: 100 };
    const result = clampCropRect(rect, 200, 200);
    expect(result).toEqual(rect);
  });

  it('should clamp negative x', () => {
    const rect: CropRect = { x: -10, y: 10, width: 100, height: 100 };
    const result = clampCropRect(rect, 200, 200);
    expect(result.x).toBe(0);
    expect(result.width).toBe(90);
  });

  it('should clamp negative y', () => {
    const rect: CropRect = { x: 10, y: -10, width: 100, height: 100 };
    const result = clampCropRect(rect, 200, 200);
    expect(result.y).toBe(0);
    expect(result.height).toBe(90);
  });

  it('should clamp rect exceeding right bound', () => {
    const rect: CropRect = { x: 150, y: 10, width: 100, height: 100 };
    const result = clampCropRect(rect, 200, 200);
    expect(result.width).toBe(50);
    expect(result.x).toBe(150);
  });

  it('should clamp rect exceeding bottom bound', () => {
    const rect: CropRect = { x: 10, y: 150, width: 100, height: 100 };
    const result = clampCropRect(rect, 200, 200);
    expect(result.height).toBe(50);
    expect(result.y).toBe(150);
  });

  it('should clamp both negative position and oversized dimensions', () => {
    const rect: CropRect = { x: -50, y: -50, width: 400, height: 400 };
    const result = clampCropRect(rect, 200, 200);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });

  it('should enforce minimum dimensions of 1', () => {
    const rect: CropRect = { x: -200, y: 10, width: 10, height: 100 };
    const result = clampCropRect(rect, 100, 100);
    expect(result.width).toBe(1);
  });

  it('should handle zero dimensions', () => {
    const rect: CropRect = { x: 0, y: 0, width: 0, height: 0 };
    const result = clampCropRect(rect, 200, 200);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
  });
});
