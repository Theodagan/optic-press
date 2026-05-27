# Crop Tech Spec

## Architecture

- Tool workspace owns crop state and pointer interactions.
- Canvas preview renders source image and crop overlay.
- Shared processor extracts the crop rectangle and encodes output.
- Output options component provides format and quality controls.

## Crop State

- `mode`: free or fixedRatio.
- `ratio`: preset or custom numeric ratio.
- `rect`: x, y, width, height in source image coordinates.
- `dragState`: active handle or move operation.
- `outputOptions`: shared format and quality settings.

## Implementation Notes

- Maintain crop state in source image coordinates to avoid precision loss on responsive previews.
- Convert pointer coordinates from rendered canvas space to source image space.
- Clamp all crop operations to image bounds.
- Provide keyboard-accessible adjustments if feasible in the first implementation.

## Testing

- Unit tests for largest-valid-region calculations.
- Unit tests for coordinate conversion and clamping.
- Component tests for preset selection.
- Manual tests for mouse and touch dragging.
