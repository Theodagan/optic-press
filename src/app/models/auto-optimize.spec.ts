import {
  computeTargetBytes,
  DEFAULT_AUTO_OPTIMIZE_SETTINGS,
  QUALITY_MIN,
  QUALITY_MAX,
} from './auto-optimize';

describe('DEFAULT_AUTO_OPTIMIZE_SETTINGS', () => {
  it('should default to balanced profile', () => {
    expect(DEFAULT_AUTO_OPTIMIZE_SETTINGS.targetProfile).toBe('balanced');
  });

  it('should default maxDimension to 2560', () => {
    expect(DEFAULT_AUTO_OPTIMIZE_SETTINGS.maxDimension).toBe(2560);
  });

  it('should default to no format lock', () => {
    expect(DEFAULT_AUTO_OPTIMIZE_SETTINGS.formatLock).toBeNull();
  });
});

describe('computeTargetBytes', () => {
  it('should use 30% ratio for balanced profile', () => {
    expect(computeTargetBytes(100_000, 'balanced')).toBe(30_000);
  });

  it('should cap balanced at 150KB', () => {
    expect(computeTargetBytes(1_000_000, 'balanced')).toBe(150_000);
    expect(computeTargetBytes(5_000_000, 'balanced')).toBe(150_000);
  });

  it('should use 15% ratio for smaller profile', () => {
    expect(computeTargetBytes(100_000, 'smaller')).toBe(15_000);
  });

  it('should cap smaller at 80KB', () => {
    expect(computeTargetBytes(1_000_000, 'smaller')).toBe(80_000);
  });

  it('should use 50% ratio for higher-quality profile', () => {
    expect(computeTargetBytes(100_000, 'higher-quality')).toBe(50_000);
  });

  it('should cap higher-quality at 250KB', () => {
    expect(computeTargetBytes(1_000_000, 'higher-quality')).toBe(250_000);
  });

  it('should return scaled value below cap', () => {
    expect(computeTargetBytes(50_000, 'balanced')).toBe(15_000);
  });
});

describe('quality constants', () => {
  it('should have min quality of 60', () => {
    expect(QUALITY_MIN).toBe(60);
  });

  it('should have max quality of 92', () => {
    expect(QUALITY_MAX).toBe(92);
  });
});
