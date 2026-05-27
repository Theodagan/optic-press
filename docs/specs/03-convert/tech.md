# Convert Tech Spec

## Architecture

- Tool workspace stores `ConvertSettings` in signals.
- Shared processor handles decode and encode.
- ZIP service packages outputs for bulk download.

## Settings Model

- `outputFormat`: WebP, JPEG, PNG, or AVIF.
- `qualityByFormat`: map of format to quality.
- `tagSrgb`: boolean.

## Implementation Notes

- Generate output filenames by replacing the original extension with the selected output extension.
- Use MIME types from the selected format.
- Preserve aspect ratio and dimensions unless later combined with Resize.
- Make color profile limitations visible if the browser cannot explicitly tag sRGB.

## Testing

- Unit tests for filename and MIME mapping.
- Unit tests for AVIF availability filtering.
- Integration test for multi-file ZIP output.
