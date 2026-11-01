# ADR0102: Compressed cold records with optimistic atomic commits

The forty-slot consumer probe reaches STORAGE_SIZE before filling its library:
each valid story snapshot repeats rich source/history data. Keep the existing
4M namespace budget, per-record decoded 4M limit and portable backup/wire limits.
Do not raise a numeric limit or discard history, previous saves or receipts.

IndexedDB layout v3 stores each cold slot/history as an owned gzip byte buffer.
The header records decoded character count and stored byte count; namespace
accounting charges the unchanged hot JSON plus compressed primary-record bytes.
Secondary summaries remain indexes as in v2. JSON encoding explicitly retains
finite negative zero using its valid JSON numeric spelling; ordinary
JSON.stringify would erase that sign. Decode streams are bounded before
JSON parsing and pass the same slot/history guards. A scoped decoded read or
summary result also stays within the existing 4M working budget; bulk backup
may reject an oversized library before loading cold payloads, and portable
backup limits are unchanged. Unsupported compression,
corruption and capacity/quota errors reject explicitly.

Compression/decompression happens outside active IndexedDB transactions. Read a
consistent root/scoped-record cut, prepare a private candidate and compressed
writes, then compare the root (including its monotonic layout revision) again in a fresh readwrite
transaction. Equal-sized cold overwrites must still change this revision. A changed
root retries boundedly; unversioned v2 migration also compares every old cold
record under the final write transaction, so equal-sized old-binary writes
cannot slip past the root check; CAS/profile/authority/idempotence checks rerun on fresh
state. All cold writes, summaries, deletes and root publish atomically. Common
v3 hot-only operations retain their single transaction and avoid cold I/O.
Legacy monolithic/v2 rows migrate only on a successful write, with every old
record prepared before takeover; abort leaves the old layout intact.

This is a finite W1-03C increment. Hot-root sharding/receipt retention and larger
portable exports remain separate work; no completed receipt or story data is
pruned. Old narrative slots remain readable; older SDK binaries cannot write
the v3 adapter layout and must reject it.
