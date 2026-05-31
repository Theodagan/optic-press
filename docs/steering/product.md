# Product Steering

## Product Identity

- [Verified] Product name: OPTICPRESS.
- [Verified] Positioning: professional image tooling for the web, task-based rather than settings-based.
- [Verified] Primary promise: make images web-ready in the fewest steps possible without server uploads.
- [Verified] Target users: developers, designers, and technical content creators.

## Product Goals

- [Verified] Reduce image weight, convert formats, and prepare web assets entirely in the browser.
- [Verified] Provide smart defaults for users who do not want to configure codecs.
- [Verified] Keep professional codec controls available but secondary.
- [Verified] Deploy as a static site with zero backend.
- [Verified] Leave room for a future sibling video service under the same brand.

## Non-Goals

- [Verified] No server-side processing.
- [Verified] No uploads or cloud storage.
- [Verified] No accounts.
- [Verified] No history persistence beyond local preset storage.
- [Verified] No retouching, filters, color grading, or AI image editing.
- [Verified] No standalone social media preset tool; those presets belong in Crop.

## UX Principles

- [Verified] The homepage is a tool grid.
- [Verified] Each tool opens a dedicated workspace.
- [Verified] Workspaces contain upload, tool controls, output preview, and download actions.
- [Verified] Encoding options live in a collapsed Output options section by default.
- [Decision] Preserve the task-first UX even when implementing advanced codec options.
- [Decision] Prefer direct, visible outcomes over exposing settings too early.

## Feature Roadmap

- [Verified] v1 includes Auto Optimize, Compress, Convert, Resize, Favicon, and Strip Metadata.
- [Verified] v2 includes Crop with canvas UI, preset profiles, and batch rename.
- [Verified] v3 is a sibling OPTICPRESS Video service and shared design system.
- [Decision] Implementation order follows the numbered specs under `docs/specs/`.

## Success Criteria

- [Inferred] A non-expert user can optimize or convert images without understanding codec terminology.
- [Inferred] A technical user can still access format, quality, and relevant codec controls.
- [Inferred] Users can complete core workflows without network access after the app is loaded.
- [Inferred] Outputs are never silently uploaded or persisted remotely.
