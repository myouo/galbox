# ADR0080: interactive v2 module closure

Extend the existing v2 composition to the classic engine's script UI, flowchart,
RNG, timed interaction, WebM video and registered operations. Add optional UI and
flow catalogs to ModuleHeader using new protobuf tags; v1 still rejects them.
No Program, body, snapshot, resource or capability-count limits change.

UI and flow run signatures commit the immutable module manifest, not the loaded
function subset. A live UI keeps the module containing its show origin, including
when that function has returned. Saved invocations retain their origins as well.
Flow roots are checked against declared entry markers; Player loads a selected,
eligible root before creating its candidate. Persistent flow progress remains a
graph identity and an old slot cannot replace the current durable progress.

Module factories/compiler bind an explicit frozen operation registry. Its schemas,
implementation/manifest and invocation migration identities must match the release
registry commitment before linking or running. Missing or different registrations
fail; code loading cannot inject an implementation. UI edits, deadlines, video
replay/forbid cuts, RNG continuation and operation attempts use the existing Core,
Coordinator, Host and storage paths.

Cross-manifest migrations, module restore recipes/SaveBridge, history rollback,
code eviction, unbounded compositions and native-device certification remain
separate tasks. Verify cold restore, returned UI origins, detached input, graph
root cancellation/retry, deadline/input identity, actual video, registry mismatch,
operation waits/effects and genuine packed consumers. This is not a new script VM.
