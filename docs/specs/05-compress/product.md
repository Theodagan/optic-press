# Compress Product Spec

## Source

Derived from `docs/appname-prd.md` section 5.2.

## Goal

Provide manual compression for users who want direct control over format and codec settings.

## Users

Technical users who understand quality and codec tradeoffs and need predictable output settings.

## Scope

- Format selection for WebP, JPEG, PNG, and feature-detected AVIF.
- Quality slider from 0 to 100.
- Chroma subsampling options for JPEG and WebP.
- PNG bit depth option.
- Alpha threshold option for PNG and WebP.
- Before/after size and savings display.

## Requirements

- When a user selects a supported output format, the system shall expose only controls relevant to that format.
- When AVIF is unsupported, the system shall not offer AVIF as an active output format.
- When quality changes, the system shall regenerate or queue output using the selected quality value.
- When output is generated, the system shall show before size, after size, and savings percentage.

## Acceptance Criteria

- Quality slider accepts values from 0 through 100.
- JPEG and WebP expose chroma subsampling choices.
- PNG exposes bit depth choices.
- PNG and WebP expose alpha threshold.
- The result can be downloaded per file and in bulk when multiple files are processed.

## Risks

- Browser encoders may not support explicit chroma subsampling or bit depth controls directly.
- Advanced options can overwhelm non-expert users if surfaced too prominently.
