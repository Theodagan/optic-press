# Image Processing Foundation Tech Spec

## Architecture

- `image-processor.service.ts` coordinates decode, resize, draw, and encode operations.
- `zip.service.ts` wraps `jszip`.
- `avif-detect.ts` performs runtime support detection.
- `content-detect.ts` exposes shared pixel analysis helpers.
- `size-format.ts` formats bytes and savings percentages.
- Worker entry points may be added when processing blocks the UI.

## Core APIs

- `loadImage(file): Promise<ImageBitmap | HTMLImageElement>`.
- `drawToCanvas(source, dimensions): Promise<CanvasLike>`.
- `encode(canvas, options): Promise<Blob>`.
- `resizeDimensions(input, settings): Dimensions`.
- `buildZip(files): Promise<Blob>`.

## Constraints

- Use Angular Signals for state integration, not NgRx.
- Preserve static deployment with no backend assumptions.
- Prefer built-in browser codecs before adding dependencies.
- Keep all processing deterministic and local.

## Alternatives

- Main-thread canvas only: simplest but may cause jank.
- Worker-first processing: better responsiveness but more setup and browser edge cases.
- Recommended: shared processor with opportunistic OffscreenCanvas and worker support for expensive paths.

## Testing

- Unit tests for size formatting, dimension calculations, and feature detection fallbacks.
- Service tests with small fixture images where practical.
- Manual tests across Chromium, Firefox, and Safari for codec availability.
