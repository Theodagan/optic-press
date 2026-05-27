# Strip Metadata Tech Spec

## Architecture

- Tool workspace stores `StripMetadataSettings` in signals.
- Shared processor redraws image to canvas and encodes output.
- Optional metadata parsing utility may inspect JPEG/PNG headers for summary data.

## Settings Model

- `stripExif`: always true and non-editable.
- `stripIccProfile`: boolean.
- `retagSrgb`: boolean.
- `outputFormat`: same as input or selected conversion format.
- `quality`: optional for lossy outputs.

## Implementation Notes

- Canvas redraw is the primary metadata removal mechanism.
- If fields cannot be identified, report that metadata was stripped by redraw without naming unavailable fields.
- Do not imply forensic metadata guarantees beyond browser-visible processing.

## Testing

- Unit tests for settings validation.
- Integration test with fixture image containing EXIF where feasible.
- Manual test for same-format and converted output.
