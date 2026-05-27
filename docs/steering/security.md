# Security Steering

## Security Model

- [Verified] The app is zero-backend.
- [Verified] Images are processed locally in the browser.
- [Verified] No uploads are required for image processing.
- [Verified] No user accounts are planned.
- [Verified] No cloud storage is planned.

## Privacy Requirements

- [Decision] Do not send image bytes, filenames, metadata, or derived previews to a server.
- [Decision] Do not introduce analytics that capture uploaded file details.
- [Decision] Treat metadata stripping claims carefully and document browser limitations.
- [Decision] Avoid persistent storage of user images.
- [Decision] Local preset storage may store settings only, not image content.

## Browser Safety

- [Decision] Prefer object URLs for local previews and revoke them when no longer needed.
- [Decision] Validate file type before attempting decode.
- [Decision] Handle decode failures without crashing the workspace.
- [Decision] Limit batch processing concurrency to reduce memory pressure.
- [Decision] Avoid injecting generated HTML except as downloadable or copyable text.

## Dependency Policy

- [Verified] `jszip` is needed for ZIP generation.
- [Decision] Keep dependencies minimal.
- [Decision] Prefer browser-native image codecs before adding codec libraries.
- [Decision] Review any parser or codec dependency for maintenance, bundle size, and supply-chain risk.
- [Decision] Use Bun lockfile to keep dependency resolution reproducible.

## Content Security

- [Decision] The static app should work with a restrictive Content Security Policy where possible.
- [Decision] Avoid inline scripts in the application shell.
- [Decision] Worker and blob URL requirements must be documented if CSP headers are later configured.
- [Unknown] Final deployment host and CSP policy are not defined yet.

## Threats To Watch

- [Inferred] Malformed image files causing browser decode errors or memory pressure.
- [Inferred] User confusion about whether files are uploaded.
- [Inferred] Overstated metadata removal guarantees.
- [Inferred] Large batch processing freezing the UI.
