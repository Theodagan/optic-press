# Auto Optimize Tech Spec

## Architecture

- `auto-optimize.service.ts` owns content detection, format selection, quality search, resize decisions, and final output selection.
- Reuse `image-processor.service.ts` for decode, draw, resize, and encode.
- Reuse `content-detect.ts` for variance calculation.
- Reuse `avif-detect.ts` for AVIF availability.

## Algorithm

1. Decode image and collect source dimensions, alpha status, and original size.
2. Downsample to max 100x100 and compute RGB variance.
3. Classify as photo when variance is greater than 1500, otherwise graphic.
4. Select format using format lock if present, otherwise PRD rules.
5. Apply max dimension resize when needed.
6. Binary search quality from 60 to 92 against the selected target.
7. If final output is larger than or equal to original, return original as already optimal.

## Target Profiles

- Balanced: PRD default target.
- Smaller: lower target and accept lower quality floor only if approved by implementation tests.
- Higher quality: higher target and prefer quality closer to 92.

## Constraints

- Strip metadata through canvas redraw.
- Do not upload images.
- Keep advanced encoding settings hidden outside Output options.

## Testing

- Unit tests for format selection rules.
- Unit tests for variance threshold classification.
- Unit tests for binary search stop condition and original fallback.
- Integration test with representative photo, flat graphic, transparent graphic, and already-small input.
