# Convert Product Spec

## Source

Derived from `docs/appname-prd.md` section 5.3.

## Goal

Provide batch image format conversion with sensible quality controls and ZIP download.

## Users

Users who need to convert one or many image files into web-friendly formats.

## Scope

- Output formats: WebP, JPEG, PNG, and AVIF where supported.
- Quality controls per output format.
- sRGB tagging toggle.
- Bulk ZIP download.

## Requirements

- When users choose an output format, the system shall convert all selected input images to that format.
- When AVIF is unsupported, the system shall not offer AVIF as an active conversion target.
- When multiple files are converted, the system shall provide a bulk ZIP download.
- When sRGB tagging is enabled, the system shall apply the supported browser output behavior consistently or disclose limitations.

## Acceptance Criteria

- Single-file conversion produces a downloadable file with the correct extension and MIME type.
- Multi-file conversion produces per-file downloads and a ZIP option.
- Quality controls are scoped to the selected output format.
- sRGB toggle state is persisted within the current workspace session.

## Risks

- Browser canvas export may not provide full color profile tagging control.
- Animated image inputs may be flattened to a single frame unless separately supported.
