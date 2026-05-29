# Crop Tasks

## Feature Dependencies
- Requires docs/specs/02-image-processing-foundation/ before implementation.
- Requires docs/specs/01-app-shell-workspace/ before implementation.

1. [ ] Define crop settings and crop rectangle model. → needs: —
2. [ ] Implement preset ratio and largest valid region calculations. → needs: 1
3. [ ] Implement canvas preview with crop overlay. → needs: 1
4. [ ] Implement pointer drag, resize, and clamping behavior. → needs: 3
5. [ ] Implement custom ratio validation. → needs: 2
6. [ ] Wire crop extraction and output encoding. → needs: 4
7. [ ] Add tests for presets, coordinate conversion, clamping, and output dimensions. → needs: 2, 4, 6
