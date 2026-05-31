import { formatBytes, savingsPercent, savingsDescription } from './size-format';

describe('formatBytes', () => {
  it('should return "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should return "0 B" for negative values', () => {
    expect(formatBytes(-100)).toBe('0 B');
  });

  it('should format bytes without suffix', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1.0 GB');
  });

  it('should respect decimal places', () => {
    expect(formatBytes(1536, 2)).toBe('1.50 KB');
  });
});

describe('savingsPercent', () => {
  it('should return 0 for equal sizes', () => {
    expect(savingsPercent(1000, 1000)).toBe(0);
  });

  it('should return 0 when output is larger', () => {
    expect(savingsPercent(1000, 2000)).toBe(0);
  });

  it('should calculate savings correctly', () => {
    expect(savingsPercent(1000, 500)).toBe(50);
  });

  it('should return 0 for invalid inputs', () => {
    expect(savingsPercent(0, 100)).toBe(0);
    expect(savingsPercent(100, -1)).toBe(0);
  });
});

describe('savingsDescription', () => {
  it('should return "No savings" when no reduction', () => {
    expect(savingsDescription(1000, 1000)).toBe('No savings');
  });

  it('should include percentage and bytes saved', () => {
    const result = savingsDescription(1000000, 500000);
    expect(result).toContain('50%');
    expect(result).toContain('saved');
  });
});
