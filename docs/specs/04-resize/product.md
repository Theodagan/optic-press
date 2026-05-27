# Resize Product Spec

## Source

Derived from `docs/appname-prd.md` section 5.4.

## Goal

Resize images for web output with simple dimension controls and optional encoding settings.

## Users

Users who need predictable image dimensions while preserving quality and aspect ratio where desired.

## Scope

- Max dimension cap based on longest edge.
- Exact width and height mode.
- Aspect lock toggle.
- Upscale prevention toggle.
- Output format and quality through Output options.

## Requirements

- When max dimension mode is used, the system shall preserve aspect ratio and cap the longest edge.
- When exact dimensions are used with aspect lock enabled, the system shall preserve aspect ratio based on the constrained dimension.
- When exact dimensions are used with aspect lock disabled, the system may stretch to the requested dimensions.
- When upscale prevention is enabled, the system shall not increase dimensions beyond the source image.
- When output options are changed, the system shall encode using the selected output format and quality.

## Acceptance Criteria

- Longest-edge resizing produces expected dimensions for landscape, portrait, and square inputs.
- Exact resize supports aspect-locked and unlocked output.
- Upscale prevention blocks enlargement.
- Output files are downloadable individually and in bulk.

## Risks

- Exact width and height with aspect lock can be ambiguous without clear UI feedback.
- Large resize operations can block the UI without worker support.
