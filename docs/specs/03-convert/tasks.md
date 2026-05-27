# Convert Tasks

1. Define convert settings model and defaults. → needs: image-processing-foundation:1
2. Implement output format and MIME mapping. → needs: —
3. Build Convert workspace controls. → needs: app-shell-workspace:7, 1, 2
4. Wire batch conversion through shared processor. → needs: image-processing-foundation:4, 3
5. Wire bulk ZIP download. → needs: image-processing-foundation:6, 4
6. Add tests for file naming, format filtering, and ZIP output. → needs: 2, 3, 5
