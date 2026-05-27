# Auto Optimize Tasks

1. Implement variance-based content detection helper. → needs: image-processing-foundation:4
2. Implement auto format selection rules. → needs: image-processing-foundation:2, 1
3. Implement target profile model and defaults. → needs: image-processing-foundation:1
4. Implement quality binary search. → needs: image-processing-foundation:4, 3
5. Implement max dimension override handling. → needs: image-processing-foundation:5
6. Implement original fallback and already-optimal badge state. → needs: 4
7. Build Auto Optimize workspace controls and result rendering. → needs: app-shell-workspace:7, 2, 3, 4, 5, 6
8. Add tests for detection, format selection, binary search, and fallback. → needs: 1, 2, 4, 6
