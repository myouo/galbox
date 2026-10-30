# ADR0084: explicit source modules in saved-game migration

A registered saved-game migration may return an opaque ModuleProgram from its
sourceProgram provider. Its original snapshot binding identifies the exact old
manifest and source closure. A declared prepareSourceModules callback supplies
that closure through validated code loading; source registry/game/release and the
complete old snapshot are verified before the mapper runs. Plain objects cannot
impersonate ModuleProgram. The existing classic source factory remains valid.

The mapper receives isolated frozen source/target projections and optional opaque
sourceModules/targetModules handles. It must map the complete snapshot and bind
the result to the target manifest. Target code is prepared from the mapped source
closure before final Core validation. Missing callbacks, wrong bindings, altered
code/ABI, cancellation and late results fail without changing the live state or
old slots. Read aliases are still explicit monotonic updates to current progress.
Player retains freeze/dirty flush/preparation/activation CAS and old-slot ownership.

The Web prepareModuleProgram helper owns AbortSignal bridging, module leases and
cancellation. Core/backups do not acquire Web/DOM dependencies or network I/O.
This is W1-03B3A; module recipes/SaveBridge/history rollback are separate B3 work.
