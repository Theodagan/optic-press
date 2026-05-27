# Resize Tech Spec

## Architecture

- Tool workspace stores `ResizeSettings` in signals.
- Shared dimension helpers compute target dimensions.
- Shared processor redraws to canvas at target size and encodes output.

## Settings Model

- `mode`: maxDimension or exact.
- `maxDimension`: positive integer.
- `width`: positive integer.
- `height`: positive integer.
- `aspectLocked`: boolean.
- `preventUpscale`: boolean.
- `outputOptions`: shared format and quality settings.

## Implementation Notes

- Validate dimensions before processing.
- Explain whether height or width is derived when aspect lock is enabled.
- Use the same output options component as other tools.

## Testing

- Unit tests for dimension calculations.
- Unit tests for upscale prevention.
- Integration test for one resized output and multiple resized outputs.
