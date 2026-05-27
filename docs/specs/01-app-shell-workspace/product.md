# App Shell Workspace Product Spec

## Source

Derived from `docs/appname-prd.md` sections 1, 4, 7, and 10.

## Goal

Provide the task-based application shell for OPTICPRESS: a homepage tool grid and a consistent workspace pattern for each image tool.

## Users

Developers, designers, and technical content creators who need browser-only image preparation workflows with minimal setup.

## Scope

- Homepage tool grid with cards for Auto Optimize, Compress, Convert, Resize, Favicon, Strip Metadata, and Crop.
- One Angular route per tool.
- Workspace layout with upload zone, tool-specific controls, output preview, download actions, and a back action.
- Shared components for upload, per-file result cards, bulk download stats, and collapsible output options.
- Task-based UX where primary actions are visible and codec settings are secondary.

## Out Of Scope

- Backend upload, user accounts, cloud storage, or server history.
- Image editing features such as retouching, filters, color grading, or AI tools.
- Video processing.

## Requirements

- When a user opens the app, the system shall show a grid of tool cards with icon, name, and one-line description.
- When a user selects a tool card, the system shall navigate to that tool workspace.
- When a user is in a workspace, the system shall provide a back action returning to the tool grid.
- When a tool exposes encoding settings, the system shall place them in a collapsed Output options section by default.
- When files are processed, the system shall show per-file output status and download actions.
- When multiple outputs are available, the system shall provide bulk download and aggregate statistics where applicable.

## Acceptance Criteria

- All PRD-listed tools are reachable from the homepage.
- Tool routes are bookmarkable and use Angular Router.
- Shared workspace elements are visually consistent across tools.
- Output options are collapsed by default.
- The app remains fully client-side.

## Risks

- A generic workspace can become too rigid for canvas-heavy tools such as Crop.
- Too much emphasis on settings would violate the task-first positioning.
