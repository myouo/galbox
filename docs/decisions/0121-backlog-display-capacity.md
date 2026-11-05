# ADR0121: Separate visible backlog capacity from rollback checkpoints

A source-led consumer needs hundreds or thousands of visible history lines while
keeping rollback disabled. HistoryPolicy.maxEntries currently bounds both the
64-entry durable checkpoint journal and the visible projection of Core.history.
Increasing checkpoint capacity would multiply stored snapshots unnecessarily.

Add optional HistoryPolicy.maxDisplayEntries (1..2048, protobuf field4). It only
limits the visible suffix of authoritative Core.history. When omitted, preserve
the existing maxEntries projection exactly. Keep maxEntries=1..64, journal and
commit cardinality, maxCharacters, Snapshot, storage and active-module budgets
unchanged. A visible row outside the checkpoint journal may play its validated
voice, but cannot manufacture rollback eligibility. No cross-route journal rows
are added to the current run's display.

This enables a larger display; it does not itself define source line wrapping,
retention, notes or recovery of history already pruned by an older program.
Consumers must author appropriate state.collect retention and verify their real
line/byte/module budgets. Oversized snapshots still fail the existing bounds.

Verify public factory/schema/wire bounds and old defaults, >2000 actual Core
confirmations, independent 64/32 checkpoint retention, expired/disabled rollback,
same-run save/reload/refresh via IndexedDB and an installed tarball consumer.
