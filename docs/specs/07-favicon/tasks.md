# Favicon Tasks

1. Define favicon output manifest and filename constants. → needs: —
2. Implement square normalization and icon resizing. → needs: image-processing-foundation:4
3. Implement manual ICO encoder. → needs: 2
4. Implement manifest and head snippet generation. → needs: 1
5. Implement favicon package service. → needs: image-processing-foundation:6, 1, 2, 3, 4
6. Build Favicon workspace and ZIP download flow. → needs: app-shell-workspace:7, 5
7. Add ICO and ZIP package tests. → needs: 3, 5
