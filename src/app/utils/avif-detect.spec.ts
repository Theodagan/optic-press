import { isAvifSupported } from './avif-detect';

describe('isAvifSupported', () => {
  it('should resolve to a boolean', async () => {
    const result = await isAvifSupported();
    expect(typeof result).toBe('boolean');
  });

  it('should return cached result on subsequent calls', async () => {
    const first = await isAvifSupported();
    const second = await isAvifSupported();
    expect(second).toBe(first);
  });

  it('should return false when canvas context is unavailable', async () => {
    spyOn(document, 'createElement').and.returnValue({
      getContext: () => null,
      width: 0,
      height: 0,
    } as unknown as HTMLCanvasElement);

    const result = await isAvifSupported();
    expect(result).toBeFalse();
  });
});
