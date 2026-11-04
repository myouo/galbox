# ADR0117: Fixed-width import and progress receipt identities

A complete consumer's valid30k-unit profile is below the existing4M input bound,
but an import retains its complete JSON again in the idempotency receipt. The
escaped receipt plus the actual profile exceeds the unchanged4M hot-root limit.
Progress receipts also retain duplicate changes instead of their identity.

Store `sha256-json-v1:` plus the SHA-256 of the exact UTF-8 JSON serialization
already used for identity. Do not canonicalize or broaden old same-ID matching.
When parsing legacy receipt strings, hash their existing serialization directly;
matching retries, selected profile, authority, revision and atomicity are retained.
No profile/read/receipt is discarded, and hot/cold/working budgets do not increase.
This does not claim unlimited receipt counts or increase portable-backup bounds.

Verify full-length historical units through actual memory and IndexedDB import,
same-ID retry/mismatch, legacy receipts/activation retry, illustrated save and
reopen. Existing corrupt/oversize/atomicity and package-consumer checks remain.
