# G5-03 — authored UI artwork

2026-10-31. Optional overlay screens and three-state image buttons use the existing
Core UI generation, visibility, enabled and press semantics. The public factory,
`ui.artwork` capability, artwork/cue closure and resource facts are validated.
UI autosave points explicitly require an active UI wait. Both logical axes follow
the actual mount dimensions; responsive flow retains its existing policy.

Actual checks: `pnpm check`; `pnpm exec vitest run tests/unit` (81 files / 428 tests);
`pnpm exec playwright test tests/browser/ui-artwork.spec.ts tests/browser/ui.spec.ts`
(6 passed, Canvas/WebGL, real IndexedDB, native sheet states, capture and refresh,
hidden-button refusal, detached/old identity and incomplete device preservation);
`pnpm test:consumer` (strict isolated real tarball, skipLibCheck=false, browser
play/save/restore). Logs and screenshots remain ignored artifacts.

Fixtures are original synthetic SVG artwork. No KAG resources or game-specific
logic enters the package. Native game menu placement and full game routes belong
to the independent consumer's acceptance, not this device fixture evidence.
