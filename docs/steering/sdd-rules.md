# SDD Rules Steering

## Spec Organization

- [Decision] Feature specs live under `docs/specs/`.
- [Decision] Spec folders are numbered in intended implementation order.
- [Decision] Each feature spec should include `product.md`, `tech.md`, and `tasks.md`.
- [Decision] Steering docs live under `docs/steering/`.

## Current Implementation Order

- [Decision] `01-app-shell-workspace`.
- [Decision] `02-image-processing-foundation`.
- [Decision] `03-convert`.
- [Decision] `04-resize`.
- [Decision] `05-compress`.
- [Decision] `06-auto-optimize`.
- [Decision] `07-favicon`.
- [Decision] `08-strip-metadata`.
- [Decision] `09-crop`.

## Intake Rules

- [Decision] New product work starts with SDD intake unless it is a small steering/doc correction.
- [Decision] Intake must identify goal, users, scope, success criteria, constraints, and risks.
- [Decision] Product specs should preserve task-based UX and zero-backend constraints.
- [Decision] Tech specs should identify Angular 21, Bun, browser APIs, and dependency impacts.

## Build Rules

- [Decision] Implement tasks in dependency order.
- [Decision] Do not implement later tool features by duplicating processing logic that belongs in the shared foundation.
- [Decision] Prefer minimal vertical slices that can be tested end-to-end.
- [Decision] Keep source changes aligned with the steering architecture unless steering is explicitly revised.

## Acceptance Rules

- [Decision] A task is complete only when relevant tests or manual verification are documented.
- [Decision] Browser capability limitations must be represented in UI or warnings.
- [Decision] No feature may require backend processing unless product steering is changed.
- [Decision] No feature may upload user images unless product and security steering are changed.

## Steering Update Rules

- [Decision] Update steering when a durable architecture, runtime, testing, security, or operations decision changes.
- [Decision] Mark facts with `[Verified]`, choices with `[Decision]`, reasoned assumptions with `[Inferred]`, and unresolved items with `[Unknown]`.
- [Decision] Do not silently contradict steering in feature specs or implementation.
