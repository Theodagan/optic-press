# Architecture Steering

## Baseline Stack

- [Decision] Framework baseline: Angular 21.
- [Decision] Runtime and package manager for local tooling: Bun.
- [Verified] Language: TypeScript.
- [Verified] Rendering target: browser-only static site.
- [Verified] Image APIs: Canvas API, OffscreenCanvas where available, and Web Workers for expensive work.
- [Verified] ZIP dependency: `jszip`.
- [Decision] Use Angular Router with one route per tool.
- [Decision] Use Angular Signals for local state.
- [Decision] Do not use NgRx.
- [Decision] Use OnPush-compatible component design.

## Angular Version Policy

- [Decision] Start on Angular 21 for new implementation.
- [Decision] Keep Angular core and CLI on the same major version.
- [Decision] Evaluate Angular 22 after its release and first patch before adopting it.
- [Decision] Do not depend on experimental Angular APIs for v1 unless isolated behind a small adapter.
- [Inferred] Signal Forms, Resource APIs, and Angular Aria may become useful later, but should not be required for the v1 image tools.

## Runtime Policy

- [Decision] Use Bun for package installation and project scripts.
- [Decision] Prefer `bun install`, `bun run build`, and `bun run test` in documentation and local workflows.
- [Decision] Keep the production app runtime browser-only; Bun is not part of deployed application execution.
- [Decision] Do not introduce a Bun server for v1.

## Structure

Use feature-sliced UI plus a shared processing core.

```text
src/app/
  app.config.ts
  app.routes.ts
  features/
    home/
    tools/
      auto-optimize/
      compress/
      convert/
      resize/
      favicon/
      strip-metadata/
      crop/
  shared/
    components/
      upload-zone/
      image-card/
      download-bar/
      output-options/
    models/
    utils/
  core/
    image-processing/
    codecs/
    workers/
    zip/
    presets/
```

## Dependency Direction

- [Decision] Feature tool pages may depend on `shared/` and `core/`.
- [Decision] `shared/` must not depend on feature tools.
- [Decision] `core/` must not depend on feature UI.
- [Decision] Worker code should depend on serializable models and pure utilities only.
- [Decision] Keep processing logic out of Angular components except for UI orchestration.

## Processing Architecture

- [Verified] All processing runs in the browser.
- [Decision] Use a shared image processor for decode, draw, resize, encode, and metadata-stripping redraw flows.
- [Decision] Use tool-specific services only when the workflow has meaningful domain logic, such as Auto Optimize or Favicon.
- [Decision] Use workers for expensive or batch operations once main-thread work causes observable jank.
- [Decision] Treat OffscreenCanvas as an optimization path with browser capability fallback.

## Tool Responsibilities

- [Decision] Convert validates the encode/download pipeline first because it is simpler than Auto Optimize.
- [Decision] Resize validates dimension logic and canvas redraw quality.
- [Decision] Compress adds explicit codec controls after basic encoding paths work.
- [Decision] Auto Optimize adds content detection, automatic format selection, and quality search after the shared pipeline is stable.
- [Decision] Favicon adds package generation, ICO encoding, and ZIP output.
- [Decision] Strip Metadata documents browser metadata limitations clearly.
- [Decision] Crop is implemented after v1 because pointer interaction and source-coordinate mapping are more complex.

## Open Architecture Questions

- [Unknown] Exact Angular 21 project generator flags until the app is initialized.
- [Decision] Commit `bun.lock` as the canonical lockfile and do not keep npm compatibility lockfiles.
- [Unknown] Which browser versions are officially supported.
- [Unknown] Whether advanced codec controls can be faithfully implemented with browser-native encoders alone.
- [Unknown] Whether metadata field summaries require a lightweight parser dependency.
