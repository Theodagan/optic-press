import type { ImageFormat } from './processing-settings';

export type TargetProfile = 'balanced' | 'smaller' | 'higher-quality';

export interface AutoOptimizeSettings {
  readonly targetProfile: TargetProfile;
  readonly maxDimension: number;
  readonly formatLock: ImageFormat | null;
}

export const DEFAULT_AUTO_OPTIMIZE_SETTINGS: AutoOptimizeSettings = {
  targetProfile: 'balanced',
  maxDimension: 2560,
  formatLock: null,
};

export const QUALITY_MIN = 60;
export const QUALITY_MAX = 92;

function profileRatio(profile: TargetProfile): number {
  switch (profile) {
    case 'smaller':
      return 0.15;
    case 'higher-quality':
      return 0.50;
    case 'balanced':
    default:
      return 0.30;
  }
}

function profileMaxBytes(profile: TargetProfile): number {
  switch (profile) {
    case 'smaller':
      return 80_000;
    case 'higher-quality':
      return 250_000;
    case 'balanced':
    default:
      return 150_000;
  }
}

export function computeTargetBytes(originalSize: number, profile: TargetProfile): number {
  return Math.min(originalSize * profileRatio(profile), profileMaxBytes(profile));
}
