# Responsive Source Set Tasks

1. [x] Register the tool (registry entry, route, home grid card, workspace shell). → needs: —
2. [x] Implement effective-width computation and variant descriptor model (pure utils + unit tests). → needs: —
3. [x] Implement `srcset-snippet.ts` snippet builder with `<img>`/`<picture>` rules and unit tests. → needs: 2
4. [x] Implement `responsive-set.service.ts` generation matrix (resize-once-per-width, encode-per-format, capability detection via shared `availableCompressFormats`). → needs: 2
5. [x] Build `responsive-srcset-controls` component (width chips, format toggles, `sizes` input, snippet-file toggle) and wire workspace state with signals. → needs: 1, 4
6. [x] Render snippet preview with copy-to-clipboard; wire both ZIP downloads through `zip.service.ts`. → needs: 3, 5
7. [x] Add snippet/file-map consistency test and ZIP integration tests; verify long-run progress feedback or document worker follow-up. → needs: 6
