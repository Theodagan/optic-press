import type { ImageSource } from '../services/image-processor.service';
import { ImageProcessorService } from '../services/image-processor.service';

export interface ContentAnalysis {
  readonly variance: number;
  readonly isPhoto: boolean;
  readonly isGraphic: boolean;
}

const SAMPLE_SIZE = 100;
const PHOTO_VARIANCE_THRESHOLD = 1500;

export async function analyzeContent(
  source: ImageSource,
  processor?: ImageProcessorService,
): Promise<ContentAnalysis> {
  const service = processor ?? new ImageProcessorService();
  const canvas = await service.drawToCanvas(source, { width: SAMPLE_SIZE, height: SAMPLE_SIZE });

  const ctx = (canvas instanceof OffscreenCanvas
    ? canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null
    : (canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D | null);

  if (!ctx) {
    return { variance: 0, isPhoto: false, isGraphic: true };
  }

  const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const pixels = imageData.data;

  const rgbValues: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    rgbValues.push(pixels[i], pixels[i + 1], pixels[i + 2]);
  }

  const mean = rgbValues.reduce((sum, v) => sum + v, 0) / rgbValues.length;
  const variance =
    rgbValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / rgbValues.length;

  return {
    variance: Math.round(variance * 100) / 100,
    isPhoto: variance > PHOTO_VARIANCE_THRESHOLD,
    isGraphic: variance <= PHOTO_VARIANCE_THRESHOLD,
  };
}

export async function isPhoto(source: ImageSource, processor?: ImageProcessorService): Promise<boolean> {
  const analysis = await analyzeContent(source, processor);
  return analysis.isPhoto;
}
