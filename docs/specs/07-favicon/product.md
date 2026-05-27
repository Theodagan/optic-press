# Favicon Product Spec

## Source

Derived from `docs/appname-prd.md` section 5.6.

## Goal

Generate a complete favicon package from a single source image.

## Users

Developers and site owners who need browser favicon assets and copy-paste HTML metadata.

## Scope

- Generate `favicon.ico` with 16, 32, and 48px images using a manual binary ICO encoder.
- Generate PNG favicon sizes 16, 32, and 48px.
- Generate `apple-touch-icon.png` at 180x180.
- Generate `android-chrome-192x192.png` and `android-chrome-512x512.png`.
- Generate `site.webmanifest`.
- Generate `head-snippet.html`.
- Package all outputs as ZIP.

## Requirements

- When a source image is uploaded, the system shall resize it to all required favicon dimensions.
- When the package is generated, the system shall include every PRD-listed output file.
- When generating `favicon.ico`, the system shall encode a multi-size ICO file manually.
- When generation completes, the system shall provide a ZIP download.

## Acceptance Criteria

- ZIP contains all required files with exact PRD names.
- ICO contains 16, 32, and 48px entries.
- Manifest is valid JSON.
- Head snippet includes tags referencing generated assets.

## Risks

- ICO binary encoding is error-prone and needs byte-level tests.
- Source images with non-square aspect ratios need clear crop or fit behavior.
