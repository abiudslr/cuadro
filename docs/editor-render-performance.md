# Editor Render Performance

## Objective

Keep editor interactions feeling stable under frequent pan, zoom, image replacement, and grid changes without changing the overall architecture or adding new dependencies.

## Render Isolation Rules

- `EditorCanvas` subscribes only to layout-level editor state.
- Per-cell image data, loading state, and selection state are read inside each `EditorCanvasCell`.
- A change in one cell should not force sibling cells to re-render unless the shared layout or shared visual config actually changed.

## Store Subscription Strategy

- Use fine-grained Zustand selectors per cell for:
  - placed image
  - preparing state
  - selected state
- Avoid subscribing the canvas shell to `placedImages`, `preparingCellIds`, or other per-cell maps when only one cell is expected to change.
- Guard store writes when the computed transform or preparing flag did not actually change.

## Gesture Update Strategy

- Pointer and wheel gesture deltas are queued and flushed at most once per animation frame.
- The final pending gesture state is flushed on pointer end/cancel so export and later interactions see the latest transform.
- This keeps pan and zoom responsive while reducing back-to-back global store writes during fast interaction bursts.

## Layout and Secondary UI

- Grid layout remains memoized from real layout inputs only.
- Hidden or inactive secondary UI should avoid staying subscribed to volatile editor state.
- Export controls are mounted only while the export sheet is open, so closed export UI no longer re-renders during live editing.

## Profiling Notes

When profiling future editor work, validate these paths first:

- pan on a populated `4x4` or `5x5` grid
- repeated wheel zoom on desktop
- pinch + pan on mobile
- layout changes after several placed images
- export after multiple transformations

If cross-cell renders reappear, check whether a parent component has resubscribed to broad store objects or started passing volatile derived props back down to every cell.
