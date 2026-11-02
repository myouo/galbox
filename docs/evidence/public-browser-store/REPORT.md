# Public browser Store acceptance (W1-11, ADR0110)

2026-11-02. `openIndexedDBStore(namespace, database?)` is now exported by player.
It validates bounded nonempty names before opening and returns the existing
production adapter. Caller-owned connections remain open after a borrowing
Player disposes; caller close rejects subsequent access. No Core/runtime/testing
device dependency, parallel storage implementation or capacity/backup change.

`pnpm check` passes; `pnpm exec vitest run` passes 449 units/89 files. Sequential
browser app/harness builds and `pnpm exec playwright test
tests/browser/storage-records.spec.ts` pass 5 tests, covering public ownership,
durable reopen, namespace isolation, invalid names, scoped reads/corruption,
atomic writes/abort, legacy upgrade rollback and missing/corrupt cold records.
`pnpm test:consumer` passes with a separately installed tarball, strict public
TypeScript, headless APIs and actual Chromium. Its existing storage acceptance
now also opens/closes/reopens the public Store while its original Player remains
usable, then checks the real compressed durable record layout.

The independent VN uses this public port in opt-in browser fixture setup after
full public module/Core validation. Snapshot/Profile fixtures preserve all read
units and flags; test imports create a separate profile branch. This does not
claim native save compatibility or increase the one-million-character portable
backup limit. Larger portable exports remain W1-03C.
