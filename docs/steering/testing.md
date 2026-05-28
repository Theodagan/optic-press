# Testing Steering

## Test Baseline

- [Decision] Use Angular 21-compatible testing tooling.
- [Decision] Prefer Vitest if the Angular 21 project generator and tooling support it cleanly.
- [Decision] Use Bun to run project scripts locally.
- [Decision] Keep browser-behavior tests explicit for canvas, file input, and download flows.

## Test Pyramid

- [Decision] Unit test pure utilities heavily.
- [Decision] Unit test image math, format selection, filename generation, MIME mapping, and settings validation.
- [Decision] Component test shared UI primitives such as Upload Zone, Image Card, Download Bar, and Output Options.
- [Decision] Integration test each tool workflow with small fixture images.
- [Decision] Use manual cross-browser checks for codec support and canvas output differences.

## Required Coverage Areas

- [Verified] Auto Optimize content detection uses 100x100 max downsample variance.
- [Verified] Auto Optimize binary search uses quality range 60-92.
- [Verified] Auto Optimize must not prefer an output larger than the original.
- [Verified] Convert supports bulk ZIP download.
- [Verified] Resize supports max dimension, exact dimensions, aspect lock, and upscale prevention.
- [Verified] Favicon ZIP contains ICO, PNG icons, manifest, and head snippet.
- [Verified] Strip Metadata always removes EXIF via canvas redraw.
- [Verified] Crop presets snap to the largest valid region.

## Browser Testing

- [Decision] Test Chromium, Firefox, and Safari before release milestones.
- [Decision] Verify AVIF support detection rather than assuming support.
- [Decision] Verify OffscreenCanvas and worker behavior per browser.
- [Decision] Verify memory behavior with large images before promoting batch workflows.

## Fixtures

- [Decision] Use small deterministic image fixtures committed to the repo when licensing permits.
- [Decision] Include representative photo, flat graphic, transparent PNG, oversized image, and metadata-bearing image where feasible.
- [Decision] Do not commit private or user-supplied images.

## Commands

- [Decision] Preferred install command: `bun install`.
- [Decision] Preferred test command: `bun run test`.
- [Decision] Preferred build command: `bun run build`.
- [Unknown] Final script names depend on project initialization.
