import type { ImageSource } from '../services/image-processor.service';
import { ImageProcessorService } from '../services/image-processor.service';

export interface ContentAnalysis {
  readonly variance: number;
  readonly isLowContent: boolean;
  readonly luminanceMean: number;
}

const SAMPLE_SIZE = 32;
const LOW_CONTENT_VARIANCE_THRESHOLD = 15;

export async function analyzeContent(
  source: ImageSource,
  processor?: ImageProcessorService,
): Promise<ContentAnalysis> {
  const service = processor ?? new ImageProcessorService();
  const canvas = await service.drawToCanvas(source, { width: SAMPLE_SIZE, height: SAMPLE_SIZE });

  const ctx = (canvas instanceof OffscreenCanvas
    ? canvas.getContext('2d')
    : (canvas as HTMLCanvasElement).getContext('2d')) as CanvasRenderingContext2D | null;

  if (!ctx) {
    return { variance: 0, isLowContent: true, luminanceMean: 0 };
  }

  const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const pixels = imageData.data;

  const luminanceValues: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    luminanceValues.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  const mean = luminanceValues.reduce((sum, v) => sum + v, 0) / luminanceValues.length;
  const variance =
    luminanceValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / luminanceValues.length;

  return {
    variance: Math.round(variance * 100) / 100,
    isLowContent: variance < LOW_CONTENT_VARIANCE_THRESHOLD,
    luminanceMean: Math.round(mean * 100) / 100,
  };
}

export async function isLowContent(source: ImageSource, processor?: ImageProcessorService): Promise<boolean> {
  const analysis = await analyzeContent(source, processor);
  return analysis.isLowContent;
}
