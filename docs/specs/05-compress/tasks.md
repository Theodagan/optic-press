# Compress Tasks

## Feature Dependencies
- Requires docs/specs/02-image-processing-foundation/ before implementation.
- Requires docs/specs/01-app-shell-workspace/ before implementation.

1. [ ] Define compress settings model and defaults. → needs: —
2. [ ] Implement format capability filtering for AVIF and advanced controls. → needs: —
3. [ ] Build Compress workspace with quality and format controls. → needs: 1, 2
4. [ ] Wire compression processing through shared image processor. → needs: 3
5. [ ] Add size savings display and downloads. → needs: 4
6. [ ] Add settings validation and control visibility tests. → needs: 1, 2, 3
