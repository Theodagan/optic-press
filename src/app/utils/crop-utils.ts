import type { CropPreset, CropRect } from '../models/crop-settings';
import { CROP_PRESET_RATIOS } from '../models/crop-settings';

export function getPresetRatio(preset: CropPreset): readonly [number, number] | null {
  if (preset === 'free' || preset === 'custom') {
    return null;
  }
  return CROP_PRESET_RATIOS[preset] ?? null;
}

export function computeLargestCropRect(
  imageWidth: number,
  imageHeight: number,
  ratioW: number,
  ratioH: number,
): CropRect {
  if (imageWidth <= 0 || imageHeight <= 0 || ratioW <= 0 || ratioH <= 0) {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }

  const imageRatio = imageWidth / imageHeight;
  const targetRatio = ratioW / ratioH;

  let width: number;
  let height: number;

  if (targetRatio > imageRatio) {
    width = imageWidth;
    height = Math.round(imageWidth / targetRatio);
  } else {
    height = imageHeight;
    width = Math.round(imageHeight * targetRatio);
  }

  width = Math.min(width, imageWidth);
  height = Math.min(height, imageHeight);

  const x = Math.round((imageWidth - width) / 2);
  const y = Math.round((imageHeight - height) / 2);

  return { x, y, width, height };
}

export function computeCropFromPreset(
  imageWidth: number,
  imageHeight: number,
  preset: CropPreset,
): CropRect {
  if (preset === 'free') {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }

  if (preset === 'custom') {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }

  const ratio = getPresetRatio(preset);
  if (!ratio) {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }

  return computeLargestCropRect(imageWidth, imageHeight, ratio[0], ratio[1]);
}

export function clampCropRect(rect: CropRect, imageWidth: number, imageHeight: number): CropRect {
  let { x, y, width, height } = rect;

  if (x < 0) {
    width += x;
    x = 0;
  }

  if (y < 0) {
    height += y;
    y = 0;
  }

  if (x + width > imageWidth) {
    width = imageWidth - x;
  }

  if (y + height > imageHeight) {
    height = imageHeight - y;
  }

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (width < 1) width = 1;
  if (height < 1) height = 1;

  return { x, y, width, height };
}
