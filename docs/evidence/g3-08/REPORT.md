# G3-08 bounded frame/pose schedules

2026-10-31, Linux x64 / Node 22+ / locked pnpm. ADR0081 defines a bounded,
pure-data sequence task with source/clock/projection validation and v2 modular
closure. No object/task/texture/resident limits were raised.

Actual commands: `pnpm test` passed 380 tests (before adding two ownership/finite
join cases); `pnpm exec vitest run tests/unit/sequence.test.ts` passed all five
sequence cases. `pnpm check` passed. `pnpm build:harness` and
`pnpm exec playwright test tests/browser/sequence.spec.ts` passed both Canvas
and WebGL real atlas-pixel, illustrated-save and restored-phase cases.
`pnpm test:package` passed: 272 SDK files / 613501 compressed bytes, no game,
test, evidence, log or schema JSON payload in the package. Raw logs remain in
independent-instance ignored artifacts/door3. Independent packed consumer and
third-door source consumption are the final integration checks; task remains
in progress until those complete.

The synthetic tests establish SDK semantics, not native-game pixel equivalence.
Source-specific sampled randomness/rasterization must be reported by its converter.

Follow-up source integration exposed two bounded requirements: partial pose
channels and sampled additive step-end motion. Sequence schedules now require a
uniform channel set across frames, preventing tick-granularity-dependent state.
Existing motion target/segment bounds remain unchanged; converters split target
batches and fold redundant hold samples. `pnpm check` passed on these changes;
the shape/negative-source and step-end restore tests are included in the final
unit suite. The isolated packed consumer passed before this follow-up and is
rechecked on the final package by the independent instance.

Directional composition follow-up (ADR0082/G3-09): the three additional scroll
edges use the same authoritative composition task. A fixed local viewport mask
keeps camera-exposed borders identical in Canvas and WebGL; it uses the existing
mask path and adds no offscreen surface. `pnpm exec vitest run` passed 393 unit
cases; the final sequence/composition subset passed 26, including rejection of
premature forged sequence completion. Final `pnpm build:harness` and
`pnpm exec playwright test tests/browser/composition.spec.ts tests/browser/sequence.spec.ts`
passed all 14 real pixel/save/restore cases across both backends. Earlier mask
attempts failed and were repaired before this successful run. Final package and
source acceptance below supersede the preliminary package figures above.

ADR0083/G3-10 resource frames address real atlas handoff pressure without raising
loading limits. Each step may name a typed image; Core and cold module restore
bind its exact phase. Only the projected image is required, with optional future
hints using existing cache budget/retry/leases. `pnpm exec vitest run` passed 396
units. `pnpm build:harness` plus the asset-sequence/composition/sequence browser
subset passed all 16 Canvas/WebGL cases, including six image phases within a
16MiB two-image working set, failed-frame preservation of the live head, retry,
eviction and illustrated pixels. This supersedes using large resident atlases
for the independent instance's long trails; final source/64MiB evidence follows.

Sequence hot-path follow-up: immutable source schedules are sealed/reused by
readonly projection; full-size accounting and detached capture/restore checks
remain. Shape/period caching only accepts deeply frozen arrays. Actual synthetic
`node tests/tooling/profile-sequence.mjs` (20 tasks × 128 steps, 500 ticks) measured
2458.38ms before and 258.13ms after. Both final snapshots are 296784 JSON chars and
SHA-256 `62229d1402d39315cd1b7276414ba96e1476ceddc36e30628d1cc2ce03fc3c6c`.
These are headless synthetic timings, not a claimed native-game FPS result.
`pnpm exec vitest run` passed 397 cases, including metadata view identity and
mutable detached-capture isolation. Final browser/check results follow.
