# ADR0103: Separate persistent cold inventory from the working set

The real forty-slot proof still fails with compression alone: at the 28th new
illustrated save, hot state is 1,747,383 JSON characters and cold inventory is
2,235,368 compressed bytes. The v2 aggregate 4M bound is being applied to an
inventory that is no longer loaded together. Synthetic repeated cuts alone did
not demonstrate sufficient capacity for actual thumbnail/history payloads.

For layout v3, declare a separate 64MiB compressed cold inventory cap per
namespace. The actual hot root including its directory remains <=4M JSON
characters. Per-cold-record decoded/stored limits, scoped decoded reads and
summary working sets remain <=4M; Snapshot/portable wire budgets are unchanged.
v2 keeps its old 4M aggregate accounting until an atomic migration succeeds.
Browser quota can still reject writes, with the same all-or-nothing transaction.

This supersedes only ADR0102's combined stored-capacity clause. It is an explicit
disk capacity expansion after scoped I/O, compression, cancellation-independent
preparation, generation CAS and legacy atomic migration are implemented, rather
than increasing a memory/wire limit. Hot-root sharding, bounded receipt retention
and larger portable exports remain W1-03C work. No receipts/history/previous cuts
are deleted or truncated. Test genuine 40 slots with previous revisions as well
as poorly compressible synthetic data, quota aborts and hot/cold boundary refusal.
