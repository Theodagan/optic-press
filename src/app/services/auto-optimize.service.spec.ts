import { AutoOptimizeService } from './auto-optimize.service';
import { QUALITY_MIN, QUALITY_MAX } from '../models/auto-optimize';

describe('AutoOptimizeService', () => {
  let service: AutoOptimizeService;

  beforeEach(() => {
    service = new AutoOptimizeService();
  });

  describe('computeMaxDimensionOverride', () => {
    it('should not resize when both dimensions are within max', () => {
      const result = service.computeMaxDimensionOverride(1000, 800, {
        targetProfile: 'balanced',
        maxDimension: 2560,
        formatLock: null,
      });
      expect(result.resized).toBeFalse();
      expect(result.targetDimensions).toEqual({ width: 1000, height: 800 });
    });

    it('should not resize when maxDimension is 0', () => {
      const result = service.computeMaxDimensionOverride(4000, 3000, {
        targetProfile: 'balanced',
        maxDimension: 0,
        formatLock: null,
      });
      expect(result.resized).toBeFalse();
    });

    it('should scale down when width exceeds max', () => {
      const result = service.computeMaxDimensionOverride(4000, 2000, {
        targetProfile: 'balanced',
        maxDimension: 2560,
        formatLock: null,
      });
      expect(result.resized).toBeTrue();
      expect(result.targetDimensions.width).toBe(2560);
      expect(result.targetDimensions.height).toBe(1280);
    });

    it('should scale down when height exceeds max', () => {
      const result = service.computeMaxDimensionOverride(2000, 4000, {
        targetProfile: 'balanced',
        maxDimension: 2560,
        formatLock: null,
      });
      expect(result.resized).toBeTrue();
      expect(result.targetDimensions.height).toBe(2560);
      expect(result.targetDimensions.width).toBe(1280);
    });

    it('should preserve aspect ratio', () => {
      const result = service.computeMaxDimensionOverride(5000, 3000, {
        targetProfile: 'balanced',
        maxDimension: 2560,
        formatLock: null,
      });
      const ratio = result.targetDimensions.width / result.targetDimensions.height;
      expect(ratio).toBeCloseTo(5 / 3, 1);
    });
  });

  describe('binarySearchQuality', () => {
    it('should return min quality when all sizes exceed target', async () => {
      const encodeAtQuality = jasmine.createSpy('encodeAtQuality').and.callFake(async (q: number) => {
        return 200_000 - q * 100;
      });
      const result = await service.binarySearchQuality(encodeAtQuality, 10_000);
      expect(result.quality).toBe(QUALITY_MIN);
    });

    it('should return max quality when all sizes are below target', async () => {
      const encodeAtQuality = jasmine.createSpy('encodeAtQuality').and.callFake(async (q: number) => {
        return q * 10;
      });
      const result = await service.binarySearchQuality(encodeAtQuality, 1_000_000);
      expect(result.quality).toBe(QUALITY_MAX);
    });

    it('should find quality closest to target without exceeding it', async () => {
      const encodeAtQuality = jasmine.createSpy('encodeAtQuality').and.callFake(async (q: number) => {
        return 50_000 + (q - 60) * 1_000;
      });
      const result = await service.binarySearchQuality(encodeAtQuality, 80_000);
      expect(result.quality).toBeGreaterThanOrEqual(QUALITY_MIN);
      expect(result.quality).toBeLessThanOrEqual(QUALITY_MAX);
      expect(result.outputBytes).toBeLessThanOrEqual(80_000);
    });

    it('should use quality range 60 to 92', async () => {
      const encodeAtQuality = jasmine.createSpy('encodeAtQuality').and.callFake(async (q: number) => {
        return q * 100;
      });
      await service.binarySearchQuality(encodeAtQuality, 7_000);

      const calls = encodeAtQuality.calls.allArgs().map((a) => a[0]);
      for (const q of calls) {
        expect(q).toBeGreaterThanOrEqual(QUALITY_MIN);
        expect(q).toBeLessThanOrEqual(QUALITY_MAX);
      }
    });

    it('should handle zero target bytes', async () => {
      const encodeAtQuality = jasmine.createSpy('encodeAtQuality').and.callFake(async () => 50_000);
      const result = await service.binarySearchQuality(encodeAtQuality, 0);
      expect(result.quality).toBe(QUALITY_MIN);
    });

    it('should return outputBytes from the chosen quality', async () => {
      const encodeAtQuality = jasmine.createSpy('encodeAtQuality').and.callFake(async (q: number) => {
        return q * 10;
      });
      const result = await service.binarySearchQuality(encodeAtQuality, 1_000_000);
      expect(result.outputBytes).toBe(result.quality * 10);
    });
  });
});
