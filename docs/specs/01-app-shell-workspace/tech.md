# App Shell Workspace Tech Spec

## Source

Derived from `docs/appname-prd.md` architecture and UX model.

## Architecture

- Angular 21 standalone components.
- Angular Router with one route per tool under `src/app/features/tools/`.
- Signals for local UI and job state.
- OnPush change detection.
- Static build output deployable from Angular CLI 21 production build run via Bun scripts.

## Components

- `pages/home/`: tool grid and navigation entry point.
- `components/upload-zone/`: drag and drop, file picker, and paste support.
- `components/image-card/`: file status, before/after preview, savings, and download link.
- `components/download-bar/`: bulk ZIP action and aggregate stats.
- `components/output-options/`: shared collapsible controls host.

## Data Model

- `ImageJob` tracks input file, decoded image metadata, processing state, output blob, output name, size stats, and warnings.
- Tool settings live in typed models under `src/app/models/`.
- Presets are local-only and optional.

## Implementation Notes

- Keep shell components tool-agnostic and let each tool own its processing settings.
- Do not introduce NgRx.
- Avoid persistent sidebars; workspace controls should be local to the task.
- Support keyboard and pointer interactions for uploads and navigation.

## Alternatives

- Single monolithic workspace component: simpler initially but likely creates conditional complexity.
- Tool-specific upload and result UIs: flexible but risks inconsistent UX.
- Recommended: shared shell primitives with tool-specific orchestration.

## Testing

- Route smoke tests for homepage and all tool pages.
- Component tests for upload zone, output options collapse state, and image card rendering.
- Manual browser test for drag/drop, paste, and back navigation.
