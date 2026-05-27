# Strip Metadata Tasks

1. Define strip metadata settings and summary model. → needs: image-processing-foundation:1
2. Implement canvas redraw metadata removal flow. → needs: image-processing-foundation:4
3. Implement optional metadata summary extraction. → needs: 1
4. Build Strip Metadata workspace controls. → needs: app-shell-workspace:7, 1
5. Wire output format options and downloads. → needs: app-shell-workspace:6, image-processing-foundation:4, 2, 4
6. Add tests for settings, redraw flow, and summary rendering. → needs: 1, 2, 3, 4
