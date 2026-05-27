# Image Processing Foundation Product Spec

## Source

Derived from `docs/appname-prd.md` sections 1, 5, 6, 7, and 8.

## Goal

Provide shared browser-only image processing capabilities used by all tools.

## Users

Users benefit indirectly through faster, private, consistent client-side processing with predictable output quality.

## Scope

- Decode image files in the browser.
- Use Canvas API, OffscreenCanvas where available, and Web Workers for heavy work.
- Encode WebP, JPEG, PNG, and feature-detected AVIF where supported.
- Provide utilities for AVIF detection, content detection, size formatting, and ZIP generation.
- Strip metadata through canvas redraw where required.

## Out Of Scope

- Server-side processing.
- Cloud storage.
- Native/WASM codecs unless separately approved.
- Advanced image editing.

## Requirements

- When an image is processed, the system shall keep all bytes on the client.
- When AVIF is not supported by the browser, the system shall hide or disable AVIF output options.
- When multiple outputs are generated, the system shall support ZIP download via `jszip`.
- When processing large images, the system should use workers or OffscreenCanvas where practical to avoid blocking the UI.
- When metadata must be removed, the system shall redraw through canvas before output.

## Acceptance Criteria

- Shared services can process at least PNG, JPEG, and WebP inputs.
- Output services return Blob outputs with filenames and MIME types.
- ZIP generation works for multiple generated files.
- Unsupported AVIF paths do not appear as selectable successful paths.

## Risks

- Browser codec support differs across engines.
- Canvas redraw strips metadata but can alter color management behavior.
- Very large images can exceed memory limits on lower-end devices.
