# Crop Product Spec

## Source

Derived from `docs/appname-prd.md` sections 5.5 and 10.

## Goal

Provide a canvas-based crop workflow with freeform and preset aspect ratios.

## Users

Users who need quick web-ready crops, including common Open Graph and aspect ratio outputs.

## Scope

- Freeform crop.
- Presets: Free, 1:1, 16:9, 4:3, 3:2, 1.91:1 Open Graph, and custom ratio input.
- Canvas-based crop handle overlay.
- Drag to reposition crop region.
- Preset selection snaps to largest valid region.
- Output format and quality through shared Output options.

## Out Of Scope

- Dedicated social media export tool outside Crop.
- Filters, retouching, or AI editing.

## Requirements

- When a preset is selected, the system shall create the largest valid crop region matching that ratio.
- When freeform mode is selected, the system shall allow unconstrained crop handles.
- When the user drags the crop region, the system shall keep it within image bounds.
- When custom ratio is entered, the system shall validate and apply the ratio.
- When crop is applied, the system shall output only the selected region.

## Acceptance Criteria

- All PRD-listed presets are available.
- Crop overlay supports repositioning and resizing.
- Presets snap correctly for landscape, portrait, and square images.
- Cropped output dimensions match the selected crop rectangle.
- Output is downloadable.

## Risks

- Pointer interactions can be complex across mouse, touch, and keyboard accessibility.
- Crop is listed as v2 in roadmap, so it may depend on v1 foundation maturity.
