# Favicon Tech Spec

## Architecture

- `favicon.service.ts` orchestrates image resizing and package assembly.
- `ico-encoder.ts` writes ICO headers, directory entries, and PNG image payloads.
- `zip.service.ts` packages generated files.
- Shared processor handles image resize and PNG blob generation.

## Output Files

- `favicon.ico`.
- `favicon-16x16.png`.
- `favicon-32x32.png`.
- `favicon-48x48.png`.
- `apple-touch-icon.png`.
- `android-chrome-192x192.png`.
- `android-chrome-512x512.png`.
- `site.webmanifest`.
- `head-snippet.html`.

## Implementation Notes

- Normalize source image to a square canvas before producing icon sizes.
- Use PNG payloads inside ICO entries unless compatibility testing requires BMP payloads.
- Keep manifest defaults editable later if product needs branding fields.

## Testing

- Unit tests for ICO header and directory entry structure.
- Unit tests for exact output filenames.
- Integration test that generated ZIP includes all package files.
