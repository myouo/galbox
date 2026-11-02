# Verified code reuse and scoped restore (W1-09/W1-10/W1-03C2)

2026-11-02; ADR0104–0109. Source implementation ends at aeaa8bf;
independent tarball SHA256
`e72d64250792d2fd304bab99f0bdf4f689c4978ba9e7b0e248ca389d8737feea`.
The consuming project uses public entries only. No game payload or raw evidence
is included here; profiles/traces remain ignored in the independent instance.

Checked module bodies retain original digest/raw ABI verification before owned
normalization and freezing. Private projections reuse immutable bodies/header;
public DTOs remain isolated. SHA/length-verified HTTP receipts avoid repeating
byte/schema work, with linear link indexes and immutable rich text caches. HTTP
memoization is bounded to 64 entries/64MiB estimated DTO footprint and scoped to
full resolved URLs after provider binding checks. Custom providers still acquire
and release their leases; forged frozen clones and cross-manifest bodies do not
inherit receipts.

Explicit snapshot-scoped source bindings and bounded target-function planning
preserve original binding checks and all actual writers/static dependencies.
Same-release loads also drop unreachable historical visits without rewriting the
source slot. The independent investigation sample requires 5 modules/2721664
encoded bytes instead of 34/18684178. Eight-language validation covers 127 real
historical cuts, at most 6 target modules per cut, preserving frames, text and
task clocks. No source scripts/assets are embedded in the SDK or this report.

V3 readonly storage projects only returned fields while retaining root/disk/read
budgets and current live head authority. Every mutation keeps complete hot-root
validation and CAS. Internally validated immutable restore candidates may reuse
their semantic proof only for the exact module source/registry/mode. The actual
persisted result is parsed and compared structurally before inheriting a proof;
different data takes full validation. Native zero keeps existing normalization;
f64 bit strings retain exact sign. Proofs never enter durable/public data.

Epoch takeover retains the unchanged owned 2D background while invalidating the
potentially discarded WebGL foreground. Changed objects/camera/raster/filter/
composition still redraw. Video and dialogue invalidation remain complete.
Pixel acceptance loads the same red cut without a redundant background copy,
then restores red from a blue cut and verifies the redraw and new epoch.

Commands/results:

- `pnpm check`; `pnpm exec vitest run`: 449 tests/89 files pass. Tests cover
  immutable/public ownership, bad raw ABI/hash, forged receipts, wrong provider,
  cancelled/failed batch atomicity, planner cancellation/unknown functions,
  unchanged original slots, relevant corruption and full mutation refusal.
- Build the browser app and harness sequentially, then `pnpm exec playwright
  test` for program-modules, advanced-modules, interactive-modules,
  module-save-migration, saved-game-migration, code-batch, storage-records and
  save-system: 35 pass (1.5m). Real IndexedDB, media, cold closures, previous
  revisions, rollback, thumbnails and both renderers are exercised.
- `pnpm test:consumer`: isolated installed tarball, headless public APIs, strict
  TypeScript, frontend build, actual Chromium play/save/restore pass. After the
  small structural-comparison refinement, check and targeted restore-proofs unit
  pass again; final independent package load/activation also passes. A test
  initially confused f64 bit strings with native negative zero; it was corrected
  to assert existing normalization, without changing the protocol.

Final independent default auto/WebGL, real investigation cut, no throttle and no
CPU sampling: current cold 1652ms/warm480–495ms; old cold2802ms/warm607–614ms.
The promise completes actual Core/frame/media takeover and durable confirmation.
Previous published old cold was20341ms; earliest baseline109837ms. Cross-run
machine/GPU load varies, so these are observations, not P95/user/network promises.
Cold loads still exceed one second. Profiling and Canvas diagnostic runs are
kept separate; no renderer or fidelity downgrade was used to reach the result.
Hot-root sharding/receipt retention and larger portable exports remain W1-03C.
