# Strip Metadata Product Spec

## Source

Derived from `docs/appname-prd.md` section 5.7.

## Goal

Provide an explicit workflow for removing image metadata and reporting what was removed.

## Users

Users who want privacy-safe or lightweight images without EXIF and optional color profile data.

## Scope

- Strip EXIF always through canvas redraw.
- Strip ICC color profile toggle.
- sRGB re-tag toggle.
- Metadata summary showing size saved and fields removed.
- Output in same or converted format.

## Requirements

- When an image is processed, the system shall remove EXIF metadata.
- When ICC stripping is enabled, the system shall remove color profile metadata where browser processing allows.
- When sRGB re-tag is enabled, the system shall apply or disclose the browser-supported sRGB behavior.
- When processing completes, the system shall show size saved and removed fields summary.
- When output format is changed, the system shall encode in the selected format.

## Acceptance Criteria

- EXIF removal happens for every processed image.
- UI displays before size, after size, and size saved.
- UI lists metadata fields removed when detectable.
- Same-format and converted-format outputs are downloadable.

## Risks

- Browser APIs may not expose full metadata field inspection without extra parsing.
- Canvas redraw removes metadata but may not preserve all color characteristics.
