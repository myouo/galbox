# G3-11: restorable procedural raster effects

2026-10-31. Public stageRaster / stopStageRaster and typed RasterEffect support
seeded film grain/scratches/flicker and finite affine/square image accumulation.
The source is one ordinary image plus parameters; no generated frame resources.
Core owns the source signature, seed, logical origin/phase and lifetime. Object
references share one surface across clones. Referenced stopped/completed results
survive collection; ordinary image replacement detaches them. Restore rejects
altered configuration/source/clock/reference. See ADR0087 for finite bounds.

The same device-owned raster surface feeds the existing Pixi image graph on
Canvas/WebGL. Accumulation advances every declared sample, instead of selecting
pre-rendered captures. Cold/large replay works on private candidate surfaces,
yields in bounded batches and checks cancellation. Failed/cancelled preparation
preserves the current pixels. Overlap is checked before allocation; removal and
disposal release surfaces/textures. No Host visual timer/Math.random or game ID
branch is added. Existing input/function/capability/object/task/workspace/resource
limits remain unchanged. A phase key avoids redraws between raster samples.

Actual verification:

- `pnpm check` and `pnpm exec vitest run`: 413 passed. Includes wire/cold module
  restore after the writer returns, timestep independence, clone/stop/retention,
  replacement semantics, source/configuration/clock/reference rejection.
- `pnpm build && pnpm build:harness`, then `pnpm exec playwright test
  tests/browser/raster.spec.ts tests/browser/program-modules.spec.ts
  tests/browser/module-save-migration.spec.ts tests/browser/window-geometry.spec.ts`:
  13 passed. Both backends reproduce actual IndexedDB thumbnail pixels after
  cold restore with only one source image. Workspace failure and ignored work
  after cancellation preserve the active surface; disposal zeros its dimensions.
- `pnpm test:consumer`: isolated actual tarball/strict types/Node/browser passed,
  including procedural playback, illustrated restore and surface disposal.
- `pnpm check:browser-shards`: 253 cases discovered; not all 253 executed.
- `pnpm test:package`: 278 files, 635139 compressed bytes at c93a3f3. No games,
  tests, evidence, logs or source maps in the package.

The independent instance consumes an actual tarball and public exports. Its real
old film and long-trail cuts migrate into Core raster tasks with the same task IDs,
logical times, text and call stack; four actual Canvas/WebGL scenarios passed
including save/refresh and zero requests for removed generated frames. Chinese
both full three-door branches passed; 15 old three-door cuts passed source/target
Core validation and cold restore. Chinese live catalog drops 391 frame assets and
84005092 bytes (374580766 -> 290575674). These are catalog/distribution bytes, not
claims about a player's single-session transfer or browser RAM.

The original 2.32 GB local tree had 463012034 unique-content bytes and 1855356249
bytes duplicated across paths. Pre-rendered trail paths accounted for 664997168
bytes (83124646 unique); film paths 7043568 (880446 unique). Cross-locale
publication sharing belongs to the instance. Native RNG/pixel rounding/plugin
ordering and original long-run/mobile behavior remain uncertified.

User explicitly stopped the upload; upload processes were terminated. No new
Worker/frontend deployment or resumed R2 upload was performed after that request.
Raw evidence remains ignored outside SDK in artifacts/online-three/procedural.

Producer validation is linear in the complete composed code instead of repeatedly
projecting and linking every prefix after an already successful full link. Bodies
remain detached/schema-checked, manifest commitments are independently validated
and static prefix dependencies are topologically checked. Runtime per-body
digest/length/ABI/link validation is unchanged. Sequential check, all 413 units
and isolated tarball consumer passed again after this producer-only change.

Module descriptor lookup now detaches only the requested descriptor, rather than
cloning the entire multi-megabyte catalog on every code request. The explicit
ownership regression, all 414 units, sequential check and isolated packed
consumer passed; external descriptor edits cannot change the private manifest.
