# [OPTICPRESS] — Product Requirements Document

**Version:** 3.0  
**Stack:** Angular 20 · TypeScript · Canvas API · OffscreenCanvas · Web Workers  
**Deployment:** Static site (zero backend)  
**Positioning:** Professional image tooling for web — task-based, not settings-based

---

## 1. Overview

[OPTICPRESS] is a fully client-side image tooling web app for developers, designers, and technical content creators. It targets the "optimize for the web" use case: reduce weight, convert formats, prepare assets — without sacrificing quality.

Inspired by ilovepdf's task-based UX: the user picks what they want to accomplish, not what settings to configure. Encoding controls are secondary, surfaced per tool only where relevant.

All processing runs in the browser. No uploads. No backend.

---

## 2. Goals

- Make images web-ready in the fewest steps possible
- Smart defaults — the tool makes good decisions without user configuration
- Professional codec controls available for users who want them, hidden for those who don't
- Zero backend — static site deployable on Coolify, Cloudflare Pages, or any Nginx host
- Extensible to a sibling video service under the same brand

---

## 3. Non-Goals

- Image editing (color grading, retouching, filters, AI features)
- Server-side processing or cloud storage
- User accounts or history persistence beyond local preset storage
- Video processing (reserved for sibling service)
- Social media preset outputs as a standalone tool (absorbed into Crop presets)

---

## 4. UX Model

**Homepage:** Tool grid. Each tool is a card with icon, name, one-line description.
Pick a tool → workspace opens. No persistent settings sidebar.

**Workspace:** Upload zone + tool-specific controls + output preview + download.
Back button returns to the grid.

**Encoding options:** Every tool has an "Output options" collapsible at the bottom.
Format, quality, and relevant codec controls live there. Collapsed by default.

---

## 5. Tools

### 5.1 Auto Optimize (flagship)

Zero-configuration web optimization. Drop images, get web-ready images back.

**Pipeline:**
1. Detect content type (photo vs graphic/flat) via pixel variance analysis on a 100x100 downsample
2. Select optimal format:
   - Photo → WebP (AVIF if browser supports it and file > 200KB)
   - Graphic / flat / transparency → WebP lossless or PNG
3. Binary search on quality (range 60–92) to hit target size without visible degradation:
   - Target: min(originalSize * 0.30, 150_000 bytes)
   - Never output a file larger than the original
4. Resize if either dimension exceeds 2560px
5. Strip EXIF + color profile

**User controls (minimal):**
- Target profile: Balanced (default) / Smaller / Higher quality
- Max dimension override
- Format lock (override auto-detection)

**Display:** Per-file before/after size, savings %, visual badge if already optimal.

---

### 5.2 Compress

Manual compression with full codec control.

- Format: WebP / JPEG / PNG / AVIF (feature-detected)
- Quality slider (0–100)
- Chroma subsampling: 4:4:4 / 4:2:0 (JPEG, WebP)
- Bit depth: 8-bit / 16-bit (PNG)
- Alpha threshold (PNG, WebP)
- Before/after size + savings %

---

### 5.3 Convert

Batch format conversion.

- Output: WebP / JPEG / PNG / AVIF
- Quality per format
- sRGB tagging toggle
- Bulk ZIP download

---

### 5.4 Resize

- Max dimension cap (longest edge, aspect ratio preserved)
- Exact width × height with aspect lock toggle
- Upscale prevention toggle
- Output format + quality via output options collapsible

---

### 5.5 Crop

Freeform crop with aspect ratio presets.

**Presets:** Free · 1:1 · 16:9 · 4:3 · 3:2 · 1.91:1 (OG) · Custom ratio input

Canvas-based crop handle overlay. Drag to reposition. Presets snap to largest valid region.

---

### 5.6 Favicon

Source image → complete favicon package as ZIP.

| Output | Spec |
|---|---|
| `favicon.ico` | Multi-size: 16, 32, 48px. Manual binary ICO encoder |
| `favicon-{16,32,48}x{16,32,48}.png` | |
| `apple-touch-icon.png` | 180×180 |
| `android-chrome-{192,512}x{192,512}.png` | |
| `site.webmanifest` | JSON manifest |
| `head-snippet.html` | Copy-paste `<head>` tags |

---

### 5.7 Strip Metadata

Explicit EXIF and color profile removal.

- Strip EXIF (always, via canvas redraw)
- Strip ICC color profile toggle
- sRGB re-tag toggle
- Shows metadata summary: size saved, fields removed
- Output in same or converted format

---

## 6. Auto Optimize — Technical Detail

### Content detection
```
Downsample to max 100×100 → compute RGB variance across pixels
variance > 1500  → photo  (lossy-friendly)
variance ≤ 1500  → graphic (lossless or high-quality)
hasAlpha && isGraphic → prefer WebP lossless or PNG
```

### Quality binary search
```
lo = 60, hi = 92
target = min(originalSize × 0.30, 150_000)
repeat while hi - lo > 2:
  mid = floor((lo + hi) / 2)
  blob = encode(mid)
  if blob.size ≤ target: lo = mid
  else: hi = mid
final = encode(hi)
if final.size ≥ originalSize: output = original (already optimal)
```

### Format selection
```
avifSupported && isPhoto && originalSize > 200_000 → AVIF
hasAlpha && isGraphic → PNG
else → WebP
```

---

## 7. Architecture

```
src/app/
├── pages/
│   ├── home/                        # Tool grid
│   └── tools/
│       ├── auto-optimize/
│       ├── compress/
│       ├── convert/
│       ├── resize/
│       ├── crop/
│       ├── favicon/
│       └── strip-metadata/
├── components/
│   ├── upload-zone/                 # Drag & drop, file picker, Ctrl+V paste
│   ├── image-card/                  # Per-file result card
│   ├── download-bar/                # Bulk ZIP + stats
│   └── output-options/              # Collapsible codec controls (shared)
├── services/
│   ├── auto-optimize.service.ts
│   ├── image-processor.service.ts
│   ├── favicon.service.ts
│   ├── ico-encoder.ts
│   ├── preset.service.ts
│   └── zip.service.ts
├── models/
│   ├── image-job.model.ts
│   ├── settings.model.ts
│   └── preset.model.ts
└── utils/
    ├── avif-detect.ts
    ├── content-detect.ts
    └── size-format.ts
```

**Routing:** Angular Router · one route per tool  
**State:** Angular Signals · no NgRx  
**Change detection:** OnPush  
**Build:** Angular CLI 20 + Vite/ESBuild

---

## 8. Dependencies

| Package | Purpose |
|---|---|
| `@angular/core` ^20 | Framework |
| `@angular/router` ^20 | Tool routing |
| `jszip` | ZIP generation |

---

## 9. Deployment

```bash
ng build --configuration production
# dist/[OPTICPRESS]/browser → static site
```

No special server headers. Deployable to Coolify, Cloudflare Pages, Nginx, Caddy.

---

## 10. Roadmap

| Version | Scope |
|---|---|
| v1 | Auto Optimize, Compress, Convert, Resize, Favicon, Strip Metadata |
| v2 | Crop tool with canvas UI, preset profiles, batch rename |
| v3 | [OPTICPRESS] Video — sibling service, shared design system |
