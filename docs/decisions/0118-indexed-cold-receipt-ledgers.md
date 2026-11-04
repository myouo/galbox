# ADR0118: Indexed cold receipt ledgers

Measured production-reducer progress receipts alone exceed the unchanged4M hot
root during a35000-commit session, even with fixed-width identities. Keeping the
complete read set and idempotency requires moving receipt cardinality out of the
hot root rather than truncating receipts or increasing budgets.

Add storage layoutv4. Its existing bounded gzip inventory may also contain
`receipt` pages. SHA-256 of(table,id) selects one of256 bounded pages containing
progress/import/save/history/backup receipts. Profiles, active head, activation
tombstones and preferences remain hot; no receipt content is duplicated there.
Every read/write declares its needed receipt pages. Profile/slot/summary reads
must not fetch or decode unrelated ledgers. Pending-owner and exact-idempotency
logic stays in the existing production durable reducers.

Layouts1/2/3 remain readable. A write needing receipts atomically upgrades their
hot tables to pages, preserving slot/history inventory and all old receipt IDs.
An abort or CAS conflict preserves the old representation. Non-receipt writes
with empty ledgers may retainv3. Old layoutv2/v3 cannot declare receipt pages.

Retain4M raw hot/decoded working bounds and64MiB compressed cold inventory. Each
page is bounded independently. Test35000 production-generated receipts plus a
full-length35000-unit read set, old retries/mismatches, v3 upgrade faults, missing
or corrupt necessary pages, unrelated scoped reads and concurrent writers.
