# Complete-work function catalog (W1-20 / ADR0119)

2026-11-05. A real consumer needs1,254 functions to keep ordinary story save
identities while adding source-authored post-clear variants. Explicitv3 now
accepts2,048 function declarations. Schema, public producer and reader agree;
defaultv2/old bounds and existing commitments retain their behavior. Module,
wire envelope, per-function, active closure, install batch, execution, resource
and save budgets are unchanged. Existing SDKs reject the larger input.

Actual commands: `pnpm generate`, `pnpm build:sdk`, `pnpm exec vitest run`
(463 tests/95 files), `pnpm check`; all passed. Public-factory test constructs
exactly2,048 functions/128 modules, executes a late demand call and cold restores
a1–2 module live closure.2,049 producer count, wire overflow, old-version count,
bad body digest and65-module bindings/batches are refused.

`pnpm fixture`, `pnpm exec vite build --config tests/player-app/vite.config.ts`,
`pnpm build:harness`, `pnpm exec playwright test tests/browser/large-modules.spec.ts
tests/browser/advanced-modules.spec.ts` passed2 tests. Real1,301-function/
163-module catalog loads1–2 bodies, retains IndexedDB across refresh, saves an
illustrated late cut and restores the same frames. Existingv2 rich/audio/replay
also passed. `pnpm test:consumer` passed strict isolated packed consumption,
headless/browser playback, save/restore/backup and the larger catalog path.
Raw output remains ignored under artifacts/w1-20-*.log. Game-source fidelity and
consumer route integration are separate checks outside the SDK.
