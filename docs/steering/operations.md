# Operations Steering

## Deployment Model

- [Verified] Deployment target is a static site.
- [Verified] No special server headers are required by the PRD.
- [Verified] Expected hosts include Coolify, Cloudflare Pages, Nginx, and Caddy.
- [Decision] Build output should be deployable as static files.
- [Decision] Do not introduce runtime server requirements for v1.

## Tooling

- [Decision] Use Bun for local dependency management and script execution.
- [Decision] Use Angular CLI 21-compatible build tooling.
- [Decision] Keep the generated build based on Angular CLI's Vite/ESBuild pipeline.
- [Decision] Prefer commands through `bun run` instead of direct package-manager-specific alternatives.

## Build Commands

- [Decision] Install: `bun install`.
- [Decision] Development server: `bun run start` once scripts exist.
- [Decision] Production build: `bun run build`.
- [Decision] Test: `bun run test`.
- [Unknown] Exact script definitions will be created when the Angular app is initialized.

## Release Checks

- [Decision] Production build must pass before deployment.
- [Decision] Unit and integration tests must pass for changed areas.
- [Decision] Manual smoke test must cover homepage, upload, process, preview, download, and ZIP where relevant.
- [Decision] Cross-browser smoke tests are required before public releases.

## Runtime Observability

- [Decision] Avoid server-side telemetry in v1.
- [Decision] If client error reporting is introduced later, it must not include image bytes, filenames, or metadata.
- [Decision] Prefer local user-visible errors for failed image processing.

## Performance Operations

- [Decision] Monitor bundle growth as codec or parser dependencies are considered.
- [Decision] Keep expensive processing off the main thread when practical.
- [Decision] Limit concurrent image processing for batch jobs.
- [Decision] Test large images and batches before release.
