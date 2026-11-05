# Visible backlog capacity (W1-22 / ADR0121)

2026-11-05. Optional HistoryPolicy.maxDisplayEntries (1..2048, protobuf field4)
controls the visible suffix of authoritative current-run Core.history. Omission
preserves the old maxEntries suffix. The durable checkpoint journal remains
1..64/default32 with its original character, storage and snapshot limits. A
visible row outside that journal does not gain rollback eligibility. No alternate
route's journal text is imported into the current run.

pnpm build:sdk, pnpm check, pnpm exec vitest run pass generated/types/boundaries
and467 tests. Public factory/wire tests reject0/2049/fraction/string display limits
and still reject65 checkpoints. An actual2100-confirmation Core run cold restores
2049 retained records; projection shows2048, while the durable journal holds8
configured text-only entries and cannot manufacture rollback. Old default8-row
projection and expired-point refusal are verified independently.

Vite player build, pnpm build:harness and Playwright backlog-display.spec.ts plus
history.spec.ts were run. Six existing voice/rollback/legacy cases pass. The new
case initially expected the wrong refusal code; actual policy refusal is
HISTORY_CHECKPOINT_UNAVAILABLE: ROLLBACK_DISABLED. With that corrected, the new
case passes13.3s: real IndexedDB illustrated quick-save, refresh,2048 rows,
identical counter/wait/stage, zero invented checkpoints. Synthetic fixture scale
and release digest were corrected before this final run; no budget was widened.

GALBOX_EVIDENCE_DIR=artifacts/backlog-display pnpm test:consumer passes strict
TypeScript (skipLibCheck=false), independent installed Node/Core/wire2100-run
and the existing browser save/restore suite. An initial harness omission of the
new standalone TypeScript file from consumer tsconfig was fixed and the complete
consumer command rerun. Installed directory and actual tar hash are recorded in
ignored artifacts/backlog-display/consumer-result.json. No real game payload is
in the SDK, fixture or package.

Source line wrapping, partial text, guarded append-only annotations and history
already pruned by older programs remain consumer work. Authors must retain the
needed Core.history with state.collect and still satisfy original byte/module
budgets. This task proves the display enabler, not an original game's full
history implementation.
