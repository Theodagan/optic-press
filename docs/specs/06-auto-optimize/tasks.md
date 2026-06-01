# Auto Optimize Tasks

## Feature Dependencies
- Requires docs/specs/02-image-processing-foundation/ before implementation.
- Requires docs/specs/01-app-shell-workspace/ before implementation.

1. [x] Implement variance-based content detection helper. → needs: —
2. [ ] Implement auto format selection rules. → needs: 1
3. [x] Implement target profile model and defaults. → needs: —
4. [x] Implement quality binary search. → needs: 3
5. [x] Implement max dimension override handling. → needs: —
6. [ ] Implement original fallback and already-optimal badge state. → needs: 4
7. [ ] Build Auto Optimize workspace controls and result rendering. → needs: 2, 3, 4, 5, 6
8. [ ] Add tests for detection, format selection, binary search, and fallback. → needs: 1, 2, 4, 6
