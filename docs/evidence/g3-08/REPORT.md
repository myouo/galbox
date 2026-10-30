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
