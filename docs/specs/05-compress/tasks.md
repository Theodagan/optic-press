# Compress Tasks

## Feature Dependencies
- Requires docs/specs/02-image-processing-foundation/ before implementation.
- Requires docs/specs/01-app-shell-workspace/ before implementation.

1. [x] Define compress settings model and defaults. → needs: —
2. [x] Implement format capability filtering for AVIF and advanced controls. → needs: —
3. [x] Build Compress workspace with quality and format controls. → needs: 1, 2
4. [x] Wire compression processing through shared image processor. → needs: 3
5. [x] Add size savings display and downloads. → needs: 4
6. [x] Add settings validation and control visibility tests. → needs: 1, 2, 3
