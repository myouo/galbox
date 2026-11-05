# History-only rich text (W1-23 / ADR0122)

2026-11-05. Public historyText emits text.rich completion=history. Separate
source-validated history records carry append presentation metadata, but never
replace visible text/windows, wait, change logical time/text preferences, mark
read/unlock, bind voice or create rollback checkpoints. Text/ruby/break runs and
static styles are supported; timing/input controls, animated styles, appendFrom
and contradictory recordHistory=false are rejected. Budgets stay unchanged.

pnpm build:sdk; pnpm exec vitest run; pnpm check pass470 tests/99 files and
all generated/type/boundary checks. Budgets1/8/100 produce identical styled
record order behind a hidden window and preserve visible body/window entries,
clock and read set. Wire retains both true and false marker presence. Source,
marker, visible-window/current-phase forgery and invalid authoring are refused.
A returned note function remains in the minimal two-module cold binding.

Vite player build; pnpm build:harness; Playwright history-only.spec.ts,
history.spec.ts and backlog-display.spec.ts were run. Seven existing cases pass.
The new test initially opened the public system screen while the legacy DefaultUI
used its own panel toggle, then tried a toolbar covered by that menu. It now uses
the actual visible History control. The corrected new case passes4.6s: red/ruby
formatting, joined and standalone records, no history text on the stage, a real
illustrated quick-save/refresh with identical history/body/frame/stage/counter,
and only the original body checkpoint. Existing voice/rollback and2048-display
coverage remains passed; no production condition was weakened for the harness.

GALBOX_EVIDENCE_DIR=artifacts/history-only pnpm test:consumer passes strict
installed TypeScript, public factory/Program+Snapshot wire/cold restore and the
existing installed browser suite. Actual package SHA256:
1216747da2fc4194c6fe01d855dcd97350a1c998218d9fe0ed51ced1b2162d15.
Raw results remain ignored artifacts/history-only and history-only-*.log.

HistoryPanel honors append presentation without attributing a checkpoint to the
note and uses maxDisplayEntries for its capacity caption. Original game output
guards, caption suppression, line buffers, partial current text and old-save
mapping remain consumer work, not claimed complete by this SDK feature.
