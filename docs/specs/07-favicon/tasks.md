# Favicon Tasks

## Feature Dependencies
- Requires docs/specs/02-image-processing-foundation/ before implementation.
- Requires docs/specs/01-app-shell-workspace/ before implementation.

1. [ ] Define favicon output manifest and filename constants. → needs: —
2. [ ] Implement square normalization and icon resizing. → needs: —
3. [ ] Implement manual ICO encoder. → needs: 2
4. [ ] Implement manifest and head snippet generation. → needs: 1
5. [ ] Implement favicon package service. → needs: 1, 2, 3, 4
6. [ ] Build Favicon workspace and ZIP download flow. → needs: 5
7. [ ] Add ICO and ZIP package tests. → needs: 3, 5
