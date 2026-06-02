# Crop Tasks

## Feature Dependencies
- Requires docs/specs/02-image-processing-foundation/ before implementation.
- Requires docs/specs/01-app-shell-workspace/ before implementation.

1. [x] Define crop settings and crop rectangle model. → needs: —
2. [x] Implement preset ratio and largest valid region calculations. → needs: 1
3. [x] Implement canvas preview with crop overlay. → needs: 1
4. [x] Implement pointer drag, resize, and clamping behavior. → needs: 3
5. [x] Implement custom ratio validation. → needs: 2
6. [x] Wire crop extraction and output encoding. → needs: 4
7. [x] Add tests for presets, coordinate conversion, clamping, and output dimensions. → needs: 2, 4, 6
