# Convert Tasks

## Feature Dependencies
- Requires docs/specs/02-image-processing-foundation/ before implementation.
- Requires docs/specs/01-app-shell-workspace/ before implementation.

1. [x] Define convert settings model and defaults. → needs: —
2. [x] Implement output format and MIME mapping. → needs: —
3. [x] Build Convert workspace controls. → needs: 1, 2
4. [x] Wire batch conversion through shared processor. → needs: 3
5. [x] Wire bulk ZIP download. → needs: 4
6. [x] Add tests for file naming, format filtering, and ZIP output. → needs: 2, 3, 5
