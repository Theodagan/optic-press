# Image Processing Foundation Tasks

1. Define shared image job, settings, preset, and output models. → needs: — [x]
2. Implement AVIF support detection utility. → needs: — [x]
3. Implement size formatting and savings utilities. → needs: — [x]
4. Implement shared image decode/draw/encode service. → needs: 1, 2 [x]
5. Add resize dimension helpers with upscale prevention support. → needs: 1 [x]
6. Implement ZIP generation service with `jszip`. → needs: 1 [x]
7. Add content detection helper for downsampled variance analysis. → needs: 4 [x]
8. Add worker or OffscreenCanvas path for expensive processing. → needs: 4 [x]
9. Add unit tests for utilities and core processor behavior. → needs: 2, 3, 4, 5, 6, 7 [x]
