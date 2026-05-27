# Compress Tasks

1. Define compress settings model and defaults. → needs: image-processing-foundation:1
2. Implement format capability filtering for AVIF and advanced controls. → needs: image-processing-foundation:2
3. Build Compress workspace with quality and format controls. → needs: app-shell-workspace:7, 1, 2
4. Wire compression processing through shared image processor. → needs: image-processing-foundation:4, 3
5. Add size savings display and downloads. → needs: app-shell-workspace:4, app-shell-workspace:5, 4
6. Add settings validation and control visibility tests. → needs: 1, 2, 3
