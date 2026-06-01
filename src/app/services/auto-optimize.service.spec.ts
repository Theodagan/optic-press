import { AutoOptimizeService } from './auto-optimize.service';
import { QUALITY_MIN, QUALITY_MAX } from '../models/auto-optimize';

describe('AutoOptimizeService', () => {
  let service: AutoOptimizeService;

  beforeEach(() => {
    service = new AutoOptimizeService();
  });

  describe('selectFormat', () => {
    it('should return format lock when set', () => {
      expect(service.selectFormat(true, false, 500_000, true, 'png')).toBe('png');
      expect(service.selectFormat(false, true, 500_000, true, 'jpeg')).toBe('jpeg');
    });

    it('should prefer AVIF for photo larger than 200KB with AVIF support', () => {
      expect(service.selectFormat(true, false, 300_000, true, null)).toBe('avif');
    });

    it('should prefer WebP for photo smaller than or equal to 200KB', () => {
      expect(service.selectFormat(true, false, 200_000, true, null)).toBe('webp');
      expect(service.selectFormat(true, false, 100_000, true, null)).toBe('webp');
    });

    it('should prefer WebP for photo without AVIF support', () => {
      expect(service.selectFormat(true, false, 500_000, false, null)).toBe('webp');
    });

    it('should prefer PNG for graphic with alpha', () => {
      expect(service.selectFormat(false, true, 500_000, true, null)).toBe('png');
    });

    it('should prefer WebP for graphic without alpha', () => {
      expect(service.selectFormat(false, false, 500_000, true, null)).toBe('webp');
    });

    it('should prefer WebP for photo with alpha and AVIF supported above 200KB', () => {
      expect(service.selectFormat(true, true, 300_000, true, null)).toBe('avif');
    });
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

  describe('isAlreadyOptimal', () => {
    it('should return true when output is larger than input', () => {
      expect(service.isAlreadyOptimal(1000, 2000)).toBeTrue();
    });

    it('should return true when output equals input', () => {
      expect(service.isAlreadyOptimal(1000, 1000)).toBeTrue();
    });

    it('should return false when output is smaller than input', () => {
      expect(service.isAlreadyOptimal(1000, 500)).toBeFalse();
    });
  });

  describe('finalizeOutput', () => {
    it('should return original bytes when already optimal', () => {
      const result = service.finalizeOutput(1000, 1500);
      expect(result.isAlreadyOptimal).toBeTrue();
      expect(result.outputBytes).toBe(1000);
    });

    it('should return optimized bytes when smaller', () => {
      const result = service.finalizeOutput(1000, 500);
      expect(result.isAlreadyOptimal).toBeFalse();
      expect(result.outputBytes).toBe(500);
    });

    it('should return original bytes when equal', () => {
      const result = service.finalizeOutput(1000, 1000);
      expect(result.isAlreadyOptimal).toBeTrue();
      expect(result.outputBytes).toBe(1000);
    });
  });
});
