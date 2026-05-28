import type { Dimensions, ResizeDimensions } from '../models/dimensions';
import type { ImageProcessingSettings } from '../models/processing-settings';

export function calculateResizeDimensions(
  inputWidth: number,
  inputHeight: number,
  settings: ImageProcessingSettings,
): ResizeDimensions {
  const input: Dimensions = { width: inputWidth, height: inputHeight };
  const allowUpscale = settings.upscale ?? false;
  const maintainAspectRatio = settings.maintainAspectRatio ?? true;

  let targetWidth = settings.width;
  let targetHeight = settings.height;

  if (targetWidth === undefined && targetHeight === undefined) {
    return { input, output: input, upscaled: false };
  }

  if (targetWidth === undefined || targetHeight === undefined) {
    const aspectRatio = inputWidth / inputHeight;

    if (targetWidth !== undefined) {
      targetHeight = maintainAspectRatio ? Math.round(targetWidth / aspectRatio) : inputHeight;
    } else if (targetHeight !== undefined) {
      targetWidth = maintainAspectRatio ? Math.round(targetHeight * aspectRatio) : inputWidth;
    }
  }

  let outputWidth = targetWidth!;
  let outputHeight = targetHeight!;

  if (!allowUpscale) {
    if (outputWidth > inputWidth || outputHeight > inputHeight) {
      const scaleX = inputWidth / outputWidth;
      const scaleY = inputHeight / outputHeight;
      const scale = Math.min(scaleX, scaleY);

      outputWidth = Math.round(outputWidth * scale);
      outputHeight = Math.round(outputHeight * scale);
    }
  }

  const upscaled = outputWidth > inputWidth || outputHeight > inputHeight;

  return {
    input,
    output: { width: outputWidth, height: outputHeight },
    upscaled,
  };
}

export function fitDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number,
): Dimensions {
  const ratio = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  return {
    width: Math.round(sourceWidth * ratio),
    height: Math.round(sourceHeight * ratio),
  };
}
