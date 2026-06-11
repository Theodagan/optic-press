# Responsive Source Set Product Spec

## Source

Intake dump (2026-06-11): "split into responsive source sets" tool — one image in, a complete dataset of correctly sized images out, plus an HTML `<picture>`/`<source>` snippet shown in the webapp, downloadable as ZIP (images only, or images + snippet file).

## Goal

Generate a complete responsive image set (multiple widths, optionally multiple formats) from a single source image, together with a copy-paste HTML snippet that references the generated files.

## Users

Developers and technical content creators preparing responsive images for fluid web layouts.

## Scope

- New tool workspace following the standard pattern: upload, controls, output preview, download actions.
- Editable target-width list with defaults 320, 640, 960, 1280, 1920, 2560 px, rendered as removable/addable chips.
- Never upscale: target widths greater than or equal to the source width are skipped; the source width is included as the largest variant.
- Output format selection: one format by default; user may enable additional formats (AVIF, WebP, JPEG or PNG fallback) subject to browser encode support.
- Adaptive snippet: single format produces `<img srcset sizes>`; multiple formats produce `<picture>` with one `<source type srcset>` per format plus an `<img>` fallback.
- Editable `sizes` attribute input, default `100vw`.
- Snippet displayed in the webapp with a copy-to-clipboard action.
- Deterministic filenames `<basename>-<width>w.<ext>` matching the snippet references exactly.
- Download options: ZIP with images only, or ZIP with images plus the snippet as `snippet.html` or `snippet.txt` (user toggle).

## Non-Goals

- Art direction (different crops per breakpoint).
- Batch input of multiple source images.
- Density (`1x`/`2x`) descriptors; widths use `w` descriptors only.
- CDN or path prefixing in the snippet beyond plain relative filenames.

## Requirements

- When a source image is uploaded, the system shall compute the effective width list by filtering targets above the source width and appending the source width as the largest variant.
- When the user edits the width chips, the system shall regenerate the effective width list and reflect it in the preview and snippet.
- When one output format is selected, the system shall emit an `<img>` element with `srcset`, `sizes`, `src` (largest fallback variant), `width`, `height`, and empty `alt`.
- When more than one output format is selected, the system shall emit a `<picture>` element with one `<source type srcset sizes>` per non-fallback format, ordered most-efficient first, and an `<img>` fallback.
- When generation completes, the system shall display the snippet in the workspace with a copy-to-clipboard action.
- When the user downloads, the system shall offer a ZIP with images only and a ZIP with images plus the snippet file in the chosen `.html` or `.txt` form.
- When a format is not encodable in the current browser, the system shall disable that format option and indicate why.

## Acceptance Criteria

- ZIP contains exactly one file per (effective width × selected format), named `<basename>-<width>w.<ext>`.
- Every filename referenced in the snippet exists in the ZIP, and vice versa (snippet variant of the download).
- A 1000px-wide source with default targets yields 320, 640, 960, and 1000 px variants only.
- Snippet is `<img srcset>` for one format and `<picture>` for two or more formats.
- The `sizes` value entered by the user appears verbatim in the snippet.
- Copy-to-clipboard places the exact rendered snippet on the clipboard.

## Risks

- AVIF encode support varies across browsers; requires capability detection and graceful disabling.
- Width × format matrices on large sources can cause long encode runs and main-thread jank; may need progress feedback or worker offload.
- Snippet/filename drift is easy to introduce; needs a dedicated consistency test.
