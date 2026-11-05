# ADR0124: Shared read-only grouping for appended history

Expose `groupHistoryEntries` from the React entry. It groups only rows explicitly
marked `historyAppend:true` with the preceding group. False/missing markers start
a group, and a leading append row remains visible when its parent is no longer
retained. Ordering, row identities, styles, current-text projection and persisted
history stay unchanged. The returned arrays are owned and frozen, and rows remain
the supplied read-only view objects. No name, newline or missing text is inferred.

Default history UI uses the same helper and emits automatic speaker headings only
for group heads that are not append rows. Explicit names inside history text are
preserved. Custom skins can apply their existing name/centering hints without
copying grouping logic or driving a Player.

This is presentation grouping, not a native 500/2000-line ring buffer, a larger
checkpoint budget, source speaker-reset state, or recovery of discarded text.
For a producer correcting an old history-only append marker, expose
`rebaseHistoryAppends` from port-kit. It validates each old history-only record,
requires identical source instructions except that marker and up to 256 explicit
trailing break runs, updates the owned history-only record/signature, then validates
the target record. Existing units, timing and row identity remain; the caller
still performs full content migration and target binding. Changed non-break text,
style, speaker, revision or missing sources must refuse; current body/windows,
history identity/order, journal and progress remain untouched.

Task W1-25 requires factory-built records, boundary/ownership checks, real default
UI and save/reopen verification, and installed-tarball consumption.
