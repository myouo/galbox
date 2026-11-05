# ADR0123: Opt-in current text in the read-only backlog

Expose the current text prompt as an ephemeral backlog row when the consumer opts
in with `HistoryPolicy.includeCurrentText`. Core derives eligibility from the
validated active instruction; `recordHistory:false` must stay suppressed. No
snapshot field, read mark, journal record, confirmation, checkpoint or voice
replay is created by viewing the pending row. Only revealed units are displayed. The finite projection applies while a standard text prompt is active; inter-prompt line-buffer retention is separate.

The pending row counts toward the existing display bound and has no rollback or
replay action. Defaults remain unchanged. It disappears when no text prompt is
active and becomes one ordinary history row after confirmation. Cold restore
derives it from the same source-bound current text. This is not a native line
buffer, a larger snapshot budget, or recovery of previously discarded history.

Acceptance: wire/default bounds, source suppression, partial reveal, confirmation
without duplicates, immutable projection, real illustrated IndexedDB save/reopen,
and installed public-tarball consumption. Task W1-24 stays in progress until the
required checks have actually passed.
