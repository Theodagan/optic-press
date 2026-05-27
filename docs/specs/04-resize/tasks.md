# Resize Tasks

1. Define resize settings model and validation. → needs: image-processing-foundation:1
2. Implement target dimension calculations. → needs: image-processing-foundation:5, 1
3. Build Resize workspace controls. → needs: app-shell-workspace:7, 1
4. Wire resize processing through shared processor. → needs: image-processing-foundation:4, 2, 3
5. Add output options integration. → needs: app-shell-workspace:6, 4
6. Add dimension calculation and processing tests. → needs: 2, 4
