# ADR0112: Materialize only effectively visible stage images

Snapshots retain hidden image identities and complete hierarchy/effect state,
but a demand/balanced Host need not decode hidden textures. Compute effective
visibility from the existing visible flag and ancestors (not alpha, so fades
remain prepared). Keep all display containers/transforms for composition roots;
hidden displays release their sprites. Acquire and validate images before the
existing resource barrier makes an object visible. Hidden raster/rule workspaces
and frame views are deferred until needed; logical Core validation is unchanged.

No Snapshot fields, resource integrity checks or resident/composition budgets
change. Eager catalog loading stays eager. Test a library larger than residency,
hidden-state save/reopen, sequential reveal/eviction, pixels and parent hiding.
Current plus incoming visible resources still must fit and fail atomically if
they do not; this does not discard the old frame to manufacture free memory.
