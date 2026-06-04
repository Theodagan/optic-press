import { analyzeContent, isPhoto } from './content-detect';
import { ImageProcessorService } from '../services/image-processor.service';

interface MockImageData {
  data: Uint8ClampedArray;
}

function createMockContext(pixelData: number[]): { getImageData: jasmine.Spy } {
  if (pixelData.length === 0) {
    return { getImageData: jasmine.createSpy('getImageData') };
  }
  const data = new Uint8ClampedArray(pixelData);
  return { getImageData: jasmine.createSpy('getImageData').and.returnValue({ data } as MockImageData) };
}

function createMockCanvas(ctx: { getImageData: jasmine.Spy }): HTMLCanvasElement {
  return {
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
}

describe('analyzeContent', () => {
  let processor: ImageProcessorService;
  let drawToCanvasSpy: jasmine.Spy;

  beforeEach(() => {
    processor = new ImageProcessorService();
    drawToCanvasSpy = spyOn(processor, 'drawToCanvas');
  });

  it('should classify high-variance content as photo', async () => {
    const pixels: number[] = [];
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(0, 0, 0, 255);
      pixels.push(255, 255, 255, 255);
    }
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(0, 0, 0, 255);
      pixels.push(255, 255, 255, 255);
    }
    const ctx = createMockContext(pixels);
    drawToCanvasSpy.and.resolveTo(createMockCanvas(ctx));

    const result = await analyzeContent({} as ImageBitmap, processor);

    expect(result.isPhoto).toBeTrue();
    expect(result.isGraphic).toBeFalse();
  });

  it('should classify low-variance content as graphic', async () => {
    const pixels: number[] = [];
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(128, 128, 128, 255);
    }
    const ctx = createMockContext(pixels);
    drawToCanvasSpy.and.resolveTo(createMockCanvas(ctx));

    const result = await analyzeContent({} as ImageBitmap, processor);

    expect(result.isPhoto).toBeFalse();
    expect(result.isGraphic).toBeTrue();
  });

  it('should classify variance at threshold as graphic (not photo)', async () => {
    const pixels: number[] = [];
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(64, 64, 64, 255);
      pixels.push(192, 192, 192, 255);
    }
    const ctx = createMockContext(pixels);
    drawToCanvasSpy.and.resolveTo(createMockCanvas(ctx));

    const result = await analyzeContent({} as ImageBitmap, processor);

    expect(result.isPhoto).toBe(result.variance > 1500);
  });

  it('should return graphic when canvas context is unavailable', async () => {
    const brokenCanvas = {
      getContext: () => null,
    } as unknown as HTMLCanvasElement;
    drawToCanvasSpy.and.resolveTo(brokenCanvas);

    const result = await analyzeContent({} as ImageBitmap, processor);

    expect(result.variance).toBe(0);
    expect(result.isPhoto).toBeFalse();
    expect(result.isGraphic).toBeTrue();
  });

  it('should downsample to 100x100', async () => {
    const pixels: number[] = [];
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(128, 128, 128, 255);
    }
    const ctx = createMockContext(pixels);
    drawToCanvasSpy.and.resolveTo(createMockCanvas(ctx));

    await analyzeContent({} as ImageBitmap, processor);

    expect(drawToCanvasSpy).toHaveBeenCalledWith(jasmine.anything(), { width: 100, height: 100 });
  });
});

describe('isPhoto', () => {
  let processor: ImageProcessorService;

  beforeEach(() => {
    processor = new ImageProcessorService();
  });

  it('should return true for high-variance content', async () => {
    const drawToCanvasSpy = spyOn(processor, 'drawToCanvas');
    const pixels: number[] = [];
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(0, 0, 0, 255);
      pixels.push(255, 255, 255, 255);
    }
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(0, 0, 0, 255);
      pixels.push(255, 255, 255, 255);
    }
    const ctx = createMockContext(pixels);
    drawToCanvasSpy.and.resolveTo(createMockCanvas(ctx));

    const result = await isPhoto({} as ImageBitmap, processor);
    expect(result).toBeTrue();
  });

  it('should return false for low-variance content', async () => {
    const drawToCanvasSpy = spyOn(processor, 'drawToCanvas');
    const pixels: number[] = [];
    for (let i = 0; i < 100 * 100; i++) {
      pixels.push(128, 128, 128, 255);
    }
    const ctx = createMockContext(pixels);
    drawToCanvasSpy.and.resolveTo(createMockCanvas(ctx));

    const result = await isPhoto({} as ImageBitmap, processor);
    expect(result).toBeFalse();
  });
});
