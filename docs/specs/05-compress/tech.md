# Compress Tech Spec

## Architecture

- Tool workspace stores `CompressSettings` in signals.
- Reuse shared processor for encoding and size stats.
- Output options host format-specific advanced controls.

## Codec Capability Handling

- Represent requested settings separately from browser-supported capabilities.
- Disable or annotate controls that cannot be honored by the current browser encoder.
- Keep unsupported AVIF hidden or disabled based on feature detection.

## Settings Model

- `format`: WebP, JPEG, PNG, or AVIF.
- `quality`: 0 to 100.
- `chromaSubsampling`: 4:4:4 or 4:2:0 where applicable.
- `bitDepth`: 8-bit or 16-bit where applicable.
- `alphaThreshold`: numeric threshold where applicable.

## Testing

- Unit tests for format-specific control visibility.
- Unit tests for settings validation.
- Integration tests for processing one file and multiple files.
