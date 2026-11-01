# G4-03: Protected saves and replay history

2026-11-01. ADR0095 adds optional `SlotMetadata.protected` (absent is false),
`Store.protectSlot` and public `Player.protectSave`. Revisions protect lock/unlock,
save and delete transactions. Both save APIs reject locked records, including when
caller metadata says false. Loading and backup transport remain available; the
paired previous snapshot/metadata and activation/profile do not change on lock.
The manual policy supports 1–64 slots; the existing namespace size budget stays
in force. Explicit auto slots must match the active profile and configured ring.
Replay children inherit the configured history capacity and keep rollback off.

Actual validation: `pnpm check`; `pnpm test` (431 tests); `pnpm build && pnpm
build:harness`; `pnpm exec playwright test tests/browser/save-system.spec.ts
tests/browser/extras.spec.ts` (17 tests). Added history-specific test separately
passes after committing both replay pages. Tests exercise real IndexedDB reopen,
stale writers, protected overwrite/delete, backup, receipts, memory-store replay
isolation and both graphics backends. Initial sandbox Git/tsx IPC failures were
rerun with approved execution. Raw logs remain ignored in the consumer artifacts.

`pnpm test:consumer` passed actual isolated tarball installation, public exports,
playback/save/restore/portable backup and cleanup. Final source pin is recorded by
the independent project.
Original game/native-save compatibility and original pixel fidelity are not SDK
claims. No game scripts, images, translations or reference captures enter this SDK.
