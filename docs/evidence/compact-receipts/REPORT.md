# W1-18 / ADR0117

Observed consumer failure: a valid30836-unit historical profile (~1.7M JSON
characters) plus the full escaped import receipt exceeded the4M hot record.
No read units were truncated. Import/progress receipts now retain fixed-width
SHA-256 identities of the exact previous JSON serialization. Legacy receipts
compact on parse and keep same-ID, content, authority and activation checks.
The raw stored root is checked before compaction; all original budgets remain.

Actual commands:

- `pnpm check`: generated data, CLI/build, both type domains and boundaries pass.
- `pnpm exec vitest run`:460 tests /94 files pass, including full-length33000-unit
  import/retry/mismatch, legacy import/progress/activation retry, unchanged actual
  hot-capacity atomic refusal, and existing storage failure cases.
- `pnpm build:harness` then `pnpm exec playwright test tests/browser/compact-receipts.spec.ts`:
  two real IndexedDB cases pass.33000 full-length units survive import, a newly
  confirmed read, illustrated save, dispose/reopen and load. A preexisting
  oversized root refuses before compaction without changing data/revision.
- `pnpm test:consumer`: isolated packed playback/save/restore/backup pass.

The browser harness must be rebuilt; an initial direct Playwright attempt read
an old harness and is not accepted. Whole-work consumer import/save is rechecked
only after it consumes the new actual tarball. This fixes payload duplication,
not unbounded receipt cardinality; a long-session ledger-volume follow-up remains.
