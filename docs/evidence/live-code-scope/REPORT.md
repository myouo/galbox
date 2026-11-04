# Live Core code scopes (W1-21 / ADR0120)

2026-11-05. A real consumer reached65 historically visited modules and failed
while its saved eighth-chapter state needed only6 (60 previously accumulated;
fifth38→5, seventh53→6). Core now derives the live snapshot closure before
attachment, adds the requested body, validates64 before mutating, then commits
the projection/index/binding. Reentry to a previously pruned cached function
must reattach. All frame/task/history/window/UI/geometry/filter/invocation/media
references and static dependencies remain included. Provider body-cache eviction
and whole-heap budgeting remain separate; no schema or capacity was increased.

`pnpm build:sdk`, `pnpm exec vitest run`, `pnpm check` pass465 tests/96 files and
all generated/type/boundary checks. New public-factory fixtures cross72 bodies,
retain a running stage task and rich history, reenter an earlier cached body,
and cold restore an exact4-module snapshot. A63-task fixture legitimately needs
65 bodies on its next call; refusal preserves the old call PC, task/stage,
progress and64-body binding. An initial test incorrectly tried to restore a
running state; that assertion was removed because only semantic save points are
restorable, and the independent legal cold-restore test remains strict.

`pnpm fixture`, Vite player build, `pnpm build:harness`, then
`pnpm exec playwright test tests/browser/live-code-scope.spec.ts
tests/browser/large-modules.spec.ts tests/browser/advanced-modules.spec.ts`
pass3 tests. Real Player fetches73 bodies, preserves4 live bodies, saves a
thumbnail and refreshes into only4 bodies. Existing1301-function andv2 audio/
rich/replay cases pass. `pnpm test:consumer` passes isolated strict packed
consumption including the same73-body traversal and illustrated restore.
The first consumer type check caught an incorrect defaultPreferences import;
corrected to its actual settings export and rerun. Raw logs remain ignored in
artifacts/w1-21-*.log. Consumer game continuation still requires the new tarball
and actual eighth-to-ending replay; this report does not claim that game passed.
