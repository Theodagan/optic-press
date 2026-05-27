# Crop Tasks

1. Define crop settings and crop rectangle model. → needs: image-processing-foundation:1
2. Implement preset ratio and largest valid region calculations. → needs: 1
3. Implement canvas preview with crop overlay. → needs: app-shell-workspace:7, 1
4. Implement pointer drag, resize, and clamping behavior. → needs: 3
5. Implement custom ratio validation. → needs: 2
6. Wire crop extraction and output encoding. → needs: image-processing-foundation:4, app-shell-workspace:6, 4
7. Add tests for presets, coordinate conversion, clamping, and output dimensions. → needs: 2, 4, 6
