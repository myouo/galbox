# G3-08 / G3-09 / G3-10 bounded sequence and scroll acceptance

2026-10-31, Linux x64 / Node 24.15.0 / pnpm 11.28.5 / locked Playwright 1.64.1.
ADR0081 defines bounded atlas/pose schedules; ADR0082 adds four scroll edges;
ADR0083 adds typed resource frames and ordinary preparation/retry/lease ownership.
Core owns phase, exact source, explicit targets and saved projection. Snapshot,
object/task/texture/resident limits remain unchanged. v1 module capability limits
were not widened; advanced v2 accepts the declared new capabilities.

Actual final checks:

- `pnpm check`: generated/types/headless/import/repository checks passed.
- `pnpm exec vitest run`: 397 tests passed, including detached mutable captures,
  immutable metadata views, source/kind/phase/ownership negatives and cold modules.
- `pnpm build:harness` then asset-sequence/sequence/composition browser specs:
  16 Canvas/WebGL cases passed. Six resource phases fit a 16MiB two-image budget;
  a failed image preserves the old live head/pixels, retries and evicts correctly.
  Four scroll directions retain camera/independent motion and illustrated pixels.
- `pnpm test:consumer`: strict isolated tarball TypeScript/build/browser playback,
  save/restore/backup and existing common-feature suite passed.
- `node scripts/audit-package.mjs`: 272 files, 616215 compressed bytes; no game,
  tests, logs, evidence, maps or JSON schemas in the actual package.
- `node scripts/check-browser-shards.mjs`: all 245 discovered cases covered once
  across five CI groups. This is discovery, not a claim of running all 245 cases.

Independent source consumption is in myouo/morgana docs/evidence/THIRD_DOOR.md:
eight fresh third-door routes/23066 text parts/80 cold cuts, real bilingual
illustrated refresh, eight-language no-scroll geometry, and consecutive trail
handoffs under the existing 64MiB policy. Its game payload is not in this SDK.

`node tests/tooling/profile-sequence.mjs` measured the same synthetic 20 tasks ×
128 steps / 500 ticks: 2458.38ms before, 258.13ms after immutable schedule/period
reuse. Both detached final snapshots contain 296784 JSON chars and SHA-256
`62229d1402d39315cd1b7276414ba96e1476ceddc36e30628d1cc2ce03fc3c6c`.
This is a headless synthetic measurement, not native-game FPS or device evidence.

Large resident trail atlases failed real handoff pressure and were replaced by
resource frames; preliminary atlas figures are not the accepted delivery. Source
converters still report sampled randomness/long-effect/rasterization limits.
Raw evidence remains in independent-instance ignored artifacts/door3. Cross-
manifest migration/recipe/SaveBridge/history remain W1-03B3; native tft, complete
work/pixel/mobile certification remain separate and unclaimed.
