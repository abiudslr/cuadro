# Image Preparation Pipeline

## Objective

Provide a client-side image preparation pipeline that keeps interactive editing responsive on mid-range phones while preserving reasonable visual quality. The pipeline prepares a per-cell working image that is cheaper to render than the original and can be upgraded later when layout or zoom demands more detail.

## Problem Solved

Using the original file for every cell is wasteful on mobile GPUs and memory budgets, especially when most cells render much smaller than the source image. A fixed resize policy is also inefficient because cell size, device pixel ratio, and user zoom vary over time. This pipeline keeps the initial working asset aligned with the current cell geometry and only upgrades when there is a meaningful quality gap.

## Target Calculation Policy

Each placed image keeps its original file metadata and a separate working image used for interactive rendering.

The target working size is calculated from:

`effectiveDpr = min(window.devicePixelRatio || 1, 2)`

`baseTarget = cellLongestSide * effectiveDpr * zoomBudget`

`targetLongestSide = clamp(baseTarget, minimumWorkingSize, globalMaxWorkingSize)`

`targetLongestSide = min(targetLongestSide, originalLongestSide)`

The current defaults are:

- `zoomBudget = 2`
- `minimumWorkingSize = 384`
- `globalMaxWorkingSize = 1600`
- `effectiveDpr cap = 2`
- `upgrade threshold multiplier = 1.3`

## Parameter Notes

### `effectiveDpr cap`

High-DPR devices can push target sizes too far for diminishing visual returns. The cap keeps preparation bounded and more predictable on smartphones.

### `zoomBudget`

The initial working image is prepared with extra headroom for normal editing zoom. This avoids immediate reprocessing after the user starts zooming in.

### `minimumWorkingSize`

Prevents tiny cells from producing overly small working assets that would look soft during normal interaction.
The current value is intentionally below the previous `512` floor to reduce over-preparation for dense grids and very small cells on mobile, while still leaving enough headroom for normal editing zoom before an upgrade is needed.

### `globalMaxWorkingSize`

Hard upper bound for interactive assets. It limits decode cost, memory pressure, canvas work, and upload latency on mobile devices.

### `upgrade threshold`

The pipeline does not upgrade on every small increase in demand. It upgrades only when:

`requiredTarget > currentWorkingLongestSide * 1.3`

This adds hysteresis so small layout changes or tiny zoom adjustments do not trigger repeated work.

## Initial Load Flow

1. Read the local file in the browser.
2. Decode dimensions and store original metadata.
3. Compute `targetLongestSide` from the current cell geometry, capped DPR, and default zoom budget.
4. If the target already matches the original longest side, reuse the original file as the working source.
5. Otherwise, resize with browser canvas APIs and create a new working object URL.
6. Stamp the request with the current per-cell generation token.
7. Apply the result only if that generation is still current when async work finishes.
8. Store original metadata, working metadata, and preparation metadata in the editor state.
9. Render the working image in the editor.

## Re-evaluation Flow on Layout Changes

Layout changes include:

- rows
- columns
- orientation
- aspect ratio
- viewport or container size

For each placed image:

1. Recalculate `requiredTarget` from the new cell size.
2. If the new requirement is lower than the current working image, do nothing.
3. If the new requirement is higher, evaluate it against the `1.3` upgrade threshold.
4. Only generate a larger working image when the threshold is exceeded.
5. Keep the current transform and swap only the working asset plus preparation metadata.
6. Ignore the result if the cell generation changed while the resize was running.

The check is scheduled with a short delay so small responsive changes do not produce unnecessary churn.

## Zoom Upgrade Flow

The initial working image already includes `zoomBudget = 2`, so routine zooming normally stays inside the prepared budget.

When the live transform scale clearly exceeds the current prepared budget:

1. Recalculate `requiredTarget` using `max(defaultZoomBudget, currentTransformScale)`.
2. Apply the same upgrade threshold check.
3. Upgrade asynchronously with a short debounce instead of reacting to every wheel or pinch event.
4. Replace the working image only if the new result is meaningfully larger than the current one.
5. Drop the result if a newer zoom/layout/image request already invalidated that work.

This keeps zoom responsive and avoids loops during small gestures.

## Stale Result Protection

Every cell keeps an in-memory generation counter that is bumped whenever a new preparation-relevant request supersedes older work.

This applies to:

- initial load
- upgrade checks scheduled from layout changes
- upgrade checks scheduled from zoom changes
- image replacement

Rules:

- starting a new request invalidates older pending work for that cell
- debounced upgrade timers are cleared before a new timer is scheduled
- async resize results are applied only if their generation still matches the current cell generation
- stale results are discarded and their generated object URLs are revoked

This is intentionally an invalidation model rather than a heavy cancellation queue. The browser may still finish old decode/resize work, but outdated results never overwrite the latest state.

## Object URL Lifecycle

The pipeline now treats every prepared object URL as an owned resource with explicit cleanup points.

Working image URLs are revoked when:

- a working image is replaced by a newer working image
- a placed image is removed
- a cell is replaced with a different image
- a prepared result finishes after it has already become stale
- an upgrade result resolves after the image was deleted or replaced

Temporary export object URLs are revoked when:

- the fallback loader needs an object URL for an original file
- the export draw for that source finishes
- the export load fails

Revocation is deferred to the next task tick so React and the browser have a safe handoff window before the old URL disappears.

## Why There Is No Immediate Downgrade

Downgrading as soon as a cell becomes smaller causes repeated expensive work during layout exploration and responsive resizes. The user may enlarge the cell again seconds later, so immediate downgrade would waste CPU time, create object URL churn, and increase visual instability. For this version the pipeline is upgrade-only during a session.

## Per-image Data Structure

Recommended structure:

```ts
type PlacedImage = {
  id: string
  cellId: string
  original: {
    originalWidth: number
    originalHeight: number
    originalLongestSide: number
    file: File
    mimeType?: string
    name?: string
  }
  working: {
    workingUrl: string
    workingWidth: number
    workingHeight: number
    workingLongestSide: number
  }
  preparation: {
    preparedForCellLongestSide: number
    preparedForZoomBudget: number
    effectiveDprUsed: number
    preparationVersion: number
  }
  transform: {
    offsetX: number
    offsetY: number
    scale: number
  }
}
```

## Browser Implementation Notes

- All preparation stays client-side.
- The current implementation uses native browser decoding plus canvas resize.
- Resize uses a small render-surface abstraction so the policy layer stays separate from DOM-specific canvas creation and can move more easily to `OffscreenCanvas` or a worker later.
- Object URLs are revoked when a working image is replaced or removed.

## Export Source Strategy

Export no longer blindly consumes the current interactive working image.

For each placed image during export:

1. Compute the real export layout and the rendered size implied by the current transform.
2. Derive the required source longest side from that rendered size.
3. If the current working image already meets that requirement, reuse it.
4. Otherwise, decode from the original file for export.

Why this strategy is used now:

- it improves fidelity when the interactive working copy is undersized for export
- it keeps the export path simple and deterministic
- it avoids adding a second persistent asset tier before it is actually needed
- it leaves room for a future export-prepared asset policy without changing transform semantics

Current behavior:

- interactive editing still optimizes for responsiveness
- export prefers the smallest source that satisfies the actual export draw size
- original files are used as a quality fallback, not as a blanket default for every cell

Future option:

- if high-resolution presets or heavier exports make original-file decoding too expensive on mobile, a separate export-prepared asset policy can be added on top of the same selection layer

## Notes for Flutter / Mobile

- Mirror the same conceptual split: original asset, working asset, preparation metadata.
- Use device pixel ratio with a cap instead of raw device DPR.
- Keep upgrade-only behavior during active editing sessions.
- Debounce zoom-driven upgrades and avoid doing image work inside gesture handlers.
- Keep the API surface close to the web version: target policy, resize service, and upgrade evaluator should stay separate.
- The working image can later move to isolates, background tasks, or platform-native codecs without changing the policy layer.

## Open Decisions and Future Improvements

- Move preparation work to a worker or isolate for very large files.
- Support multiple working sizes per image if the product later needs stronger zoom or better export quality.
- Add smarter cache reuse keyed by source file plus target size.
- Add an explicit export-prepared asset tier if original decode cost becomes too high for repeated high-resolution exports.
- Add a more explicit queue if concurrent upgrades become a bottleneck with many cells.
- Consider EXIF orientation handling if camera-originated photos become a common input path.
