# Hidden stage residency (W1-13, ADR0112)

2026-11-03. Restoring a scene previously pinned every logical image, including
explicitly hidden objects and descendants of hidden parents. Demand/balanced
loading now retains the full logical Snapshot but defers hidden textures,
sprite frame views and raster/rule workspaces. Containers and transforms stay
in the scene graph. Revealing an object crosses the existing checked resource
barrier. Alpha remains a presentation parameter, not a loading hint.

No Snapshot ABI, execution, resident/composition or storage budget changes.
Eager startup remains eager. Current plus incoming visible resources must fit;
failed preparation preserves current pixels, persistent head and progress.

`pnpm check` and `pnpm exec vitest run` pass 450 tests / 90 files. Sequential
player/harness builds and Playwright loading/raster/rule-transition pass all
23 existing cases. The first new fixture correctly failed for omitting the
required verified release; the fixture now creates a real checked manifest.
The follow-up suite passes all22 cases (45 related browser cases total).
`pnpm exec tsc -p tsconfig.json --noEmit` and `pnpm test:consumer` also pass;
the isolated installed SDK plays, saves and restores in a real browser.
The hidden-working-set/image-filter/rule-presentation/asset-sequence/
stage/stage-order-cache/graphics/text-stage-order suite covers both renderers,
hierarchy save/reopen/reveal, blue pixels, eviction below the original 120000
byte limit, frame ownership, effect bounds and failure preservation.

Raw logs and traces stay ignored. This is a host working-set change, not a
claim that arbitrary simultaneous visible scenes fit, or that native game
rendering/audio and all target devices have been certified.
