# Responsive Source Set Tasks

1. Register the tool (registry entry, route, home grid card, workspace shell). → needs: —
2. Implement effective-width computation and variant descriptor model (pure utils + unit tests). → needs: —
3. Implement `srcset-snippet.ts` snippet builder with `<img>`/`<picture>` rules and unit tests. → needs: 2
4. Implement `responsive-set.service.ts` generation matrix (resize-once-per-width, encode-per-format, capability detection). → needs: 2
5. Build `responsive-set-controls` component (width chips, format toggles, `sizes` input, snippet-file toggle) and wire workspace state with signals. → needs: 1, 4
6. Render snippet preview with copy-to-clipboard; wire both ZIP downloads through `zip.service.ts`. → needs: 3, 5
7. Add snippet/file-map consistency test and ZIP integration tests; verify long-run progress feedback or document worker follow-up. → needs: 6
