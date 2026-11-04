# ADR0120: Reclaim inactive Core code scopes on attachment

A real long-session consumer reaches a65th previously visited module while the
current state needs fewer than64. Core.usedModules accumulated every attachment,
so it treated historical visits as live snapshot dependencies.

Before attaching a new body, compute the live module closure with the same
snapshotModules algorithm used for explicit source-bound snapshots. This keeps
frames, all tasks, media links/playback origins, UI, geometry, filters, active
invocations and rich/template text/history/window entries plus static prefix
dependencies and the entry module. Add the requested module and validate the
unchanged64-module binding before mutating Core. Project that code, rebuild the
active function index and commit the binding together. A later call to a pruned
but still provider-cached body must reattach it through this same path.

No wire/schema version or save identity changes. Existing saved supersets remain
accepted, and all byte/node, active64/batch64, resource and execution budgets
stay. This reclaims the Core execution scope; it does not claim eviction of the
ModuleProgram's verified byte/body cache or a bound on the entire JS heap.

Verify >64 sequential visits, reentry, cold restore, retained live origins, and
atomic refusal when65 bodies are actually live; repeat real Player and packed
consumer traversal. Real game narrative fidelity remains a consumer check.
