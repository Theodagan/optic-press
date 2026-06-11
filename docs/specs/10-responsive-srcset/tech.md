# Responsive Source Set Tech Spec

## Architecture

- `responsive-set.service.ts` orchestrates the width × format generation matrix and assembles outputs.
- `srcset-snippet.ts` (pure utility) builds the `<img srcset>` or `<picture>` snippet from a serializable descriptor of generated variants; no DOM or Angular dependencies so it is unit-testable and worker-safe.
- `responsive-set-controls` component hosts width chips, format toggles, the `sizes` input, and the snippet-file toggle.
- Snippet preview rendered in the workspace with a copy-to-clipboard action (Clipboard API with `textarea` fallback).
- Tool registered in the existing tool registry/routes like the other tools (one route per tool, lazy workspace).

## Reuse

- `image-processor.service.ts`: `loadImage`, `drawToCanvas`, `encode` (and `processInWorker` if jank appears) for resize and per-format encoding.
- `zip.service.ts`: `buildZipFromFiles(ReadonlyMap<string, Blob>)` for both ZIP variants.
- Shared workspace components: `upload-zone`, `download-bar`, `output-options`.

## Generation Logic

- Effective widths = `sort(targets.filter(w => w < sourceWidth))` + `[sourceWidth]`, deduplicated.
- For each effective width × selected format: resize once per width (cache the canvas), encode per format from the cached canvas.
- Heights derived from source aspect ratio, rounded; emitted on the `<img>` `width`/`height` attributes using the largest variant's dimensions.
- Filenames: `<basename>-<width>w.<ext>`; `basename` is the upload name slugified, stripped of its extension.
- Format capability detection: probe `canvas.toBlob`/`convertToBlob` per MIME once at startup (same approach as Convert/Compress); unsupported formats render disabled with a tooltip.

## Snippet Rules

- One selected format → `<img src srcset sizes width height alt="">` where `src` points at the largest variant.
- Two or more formats → `<picture>` with `<source type srcset sizes>` per non-fallback format ordered AVIF → WebP, then `<img>` carrying the fallback format's srcset.
- Fallback format is JPEG for opaque sources, PNG when the source has alpha.
- The user's `sizes` value is inserted verbatim; default `100vw`.

## Downloads

- "Images only": ZIP of all generated variants.
- "Images + snippet": same plus `snippet.html` or `snippet.txt` per the toggle; identical text content either way.

## Follow-up

- Generation currently runs sequentially via the shared processor on the main thread (encode is async through `OffscreenCanvas.convertToBlob`). Per-job status is surfaced through the existing job list. If large width × format matrices cause observable jank, move the matrix into the existing worker path (`processInWorker`) as a follow-up.

## Testing

- Unit tests for effective-width computation (skip-above-source, source append, dedupe).
- Unit tests for `srcset-snippet.ts`: single-format `<img>` shape, multi-format `<picture>` shape, source ordering, verbatim `sizes`.
- Consistency test: every filename in the snippet exists in the generated file map and vice versa.
- Integration test: ZIP variants contain the expected entries for a fixed source and settings.
