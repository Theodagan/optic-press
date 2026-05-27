# Auto Optimize Product Spec

## Source

Derived from `docs/appname-prd.md` sections 5.1 and 6.

## Goal

Provide the flagship zero-configuration workflow that turns dropped images into web-ready outputs with smart defaults.

## Users

Developers, designers, and technical content creators who want smaller web assets without manually choosing codec settings.

## Scope

- Detect photo versus graphic or flat content.
- Select optimal output format automatically.
- Search quality between 60 and 92 to target small output without obvious degradation.
- Resize images with dimensions above 2560px unless overridden.
- Strip EXIF and color profile metadata.
- Show before/after size, savings percentage, and already-optimal status.

## Controls

- Target profile: Balanced default, Smaller, Higher quality.
- Max dimension override.
- Format lock.

## Requirements

- When an image is uploaded, the system shall classify it using RGB variance on a downsample no larger than 100x100.
- When the image is photo-like and AVIF is supported and original size is greater than 200KB, the system shall prefer AVIF.
- When the image is graphic-like with alpha, the system shall prefer PNG or WebP lossless.
- When no format lock is set, the system shall choose the output format automatically.
- When the optimized output is not smaller than the original, the system shall mark the image as already optimal and keep the original.
- When either dimension exceeds the max dimension, the system shall resize while preserving aspect ratio.

## Acceptance Criteria

- Balanced profile targets `min(originalSize * 0.30, 150_000)` bytes.
- Quality search uses a 60 to 92 range.
- Output never reports a larger optimized file as the preferred result.
- Per-file cards show before size, after size, savings percentage, and already-optimal badge when applicable.

## Risks

- Variance-based classification can misclassify screenshots, gradients, or illustrations.
- Browser encoders may not expose every codec control needed for exact size targets.
- Aggressive targets can degrade visual quality on some source images.
