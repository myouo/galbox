# W1-03B3A / G2-07 / F-01H

2026-10-31. Explicit cross-manifest Web-slot migration validates the original
opaque ModuleProgram, exact saved binding and full source closure before mapping.
It then prepares and validates the mapped target closure before activation CAS.
Cancellation, incorrect code/ABI/bindings and late results preserve live state,
source slots and current durable progress. Public prepareModuleProgram owns Web
leases and cancellation; core/backups keep their platform-neutral boundaries.

Authored text.window.geometry stores a bounded rectangle and its last writer,
including returned/hidden writers in cold module closure. It uses text.windows
and preserves the legacy inline TextWindow.rect wire encoding. Opt-in v2
packedDeclarations preserves every ordered address, expanded ABI validation,
external manifest identity and unchanged code bytes. Old formats remain valid;
old readers dropping the packed field fail the composition commitment. Existing
wire/node/character/function/window/capability/resource budgets were not raised.
See ADR0084–0086 and PROGRAM_MODULES.md.

Actual commands and results:

- `pnpm check`: generated/types/headless/import/repository checks passed.
- `pnpm exec vitest run`: 407 tests passed. Includes source/target closure,
  cancellation, geometry origin/rect tampering, old wire golden and packed ABI.
- `pnpm build && pnpm build:harness`, then `pnpm exec playwright test
  tests/browser/module-save-migration.spec.ts tests/browser/saved-game-migration.spec.ts
  tests/browser/window-geometry.spec.ts tests/browser/program-modules.spec.ts
  tests/browser/advanced-modules.spec.ts`: 10 passed, including actual IndexedDB,
  source failure/head preservation and Canvas/WebGL geometry/illustrated pixels.
- `pnpm test:consumer`: strict isolated tarball Node/browser consumer passed,
  including public packed module migration, returned geometry writer and old slot
  preservation. Actual SHA-256 matches the independent application's package:
  `7ae4655617e141c5c28dc80f3c3cee670221f835e0de72bf28feedde0a90c1fa`.
- `pnpm check:browser-shards`: 248 cases discovered without omissions/duplicates;
  this is not a claim to have executed all 248.
- `pnpm test:package`: 272 files, 619812 compressed bytes; no games, tests, logs,
  evidence, source maps or JSON schemas.

Independent myouo/morgana consumes that tarball through public exports. Eight
three-door publications preserve all old non-main functions exactly, retain old
manifests/code and validate 64 old cuts through source/target Core restoration.
English/Chinese both complete both connected branches from the original first
ending, with six additional first-door cuts each. Thirteen real-browser scenarios
cover old pages/choice/both terminal routes, source failure/retry, illustrated cold
refresh, letter geometry and third replay returning to the unchanged main run.
18407 en/zh pages have no scrolling/glyph overflow; three Chinese pages shrink,
minimum 0.88623046875. Instance `pnpm check` and all 109 tests passed. Raw evidence
is ignored artifacts/module-upgrade and artifacts/connection, outside this SDK.

W1-03B3 remains partial: module recipes, SaveBridge and history rollback are still
explicit unsupported. Code eviction/capacity/persistent cache, search.ks and later
doors, native tft, cleared variants, original pixel parity and mobile long-run
certification remain separate work. Preview domains/R2 were not redeployed.
