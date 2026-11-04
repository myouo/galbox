# W1-19 / ADR0118

Production durable reducers measured5000 receipts at1365811 JSON characters,
10000 at2735814 and15000 at4125815: the original4M hot-root limit rejects the
last case even before a large read set.35000 receipts reached9685815 characters.

Layoutv4 keeps all five receipt tables in256 indexed gzip pages. Every operation
loads only its declared page(s); profile/slot/summary reads avoid ledgers. Empty
receipt-free namespaces may remainv3. Legacy upgrades, pages, slots, profile and
root revision commit atomically; failed migration and CAS retry keep old data.
Original4M hot/decoded working and64MiB compressed cold budgets remain.

Actual validation:

- `pnpm check`: generation, public/CLI build, both type domains and boundaries pass.
- `pnpm exec vitest run`:462 tests /95 files pass. Headless volume uses35000 actual
  reducer commits plus35000 read units, and preserves every old retry and table.
- Rebuilt browser harness, then related receipt/storage/backup/history suites:
  21 cases pass. Final receipt suite adds same-bucket concurrent progress/save
  CAS retry (at least6 actual root reads), missing-page refusal and all200 old
  upgrade retries:4 cases pass,22 distinct related browser cases overall.
- Full volume browser fixture is generated through production reducers/codecs,
  then actual public Store/Player mutations, illustrated save and cold reopen run.
  It preserves35001 read units; hot root2292992 characters,256 receipt pages,
  1933991 compressed cold bytes. No data or receipt is pruned.
- Final public/headless TypeScript checks pass. `pnpm test:consumer` isolated
  tarball playback/save/restore/backup passes.

The volume fixture is not a claim that35000 separate IndexedDB round trips were
replayed:600 actual sequential mutations and concurrent/fault cases test that
path, while the reachable35000-record state tests its final scale and old retries.
Consumer-specific whole-game graphics/performance and original-save formats
remain separate acceptance; installing the new actual tarball is the next step.
