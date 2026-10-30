# ADR0083: resource-backed stage sequence frames

Allow every step of a bounded stage.sequence schedule to name its own declared
image. The new stageAssetSequence factory requires typed image references and
infers stage.sequence.assets. Existing stageSequence remains the atlas/pose API.
All steps declare the same asset/frame/pose channels; Core owns resource identity,
phase and projection. Explicit targets showing an image outside the schedule stay
suspended, preserving ordinary page replacement behavior. Dynamic schedules own
the asset channel in addition to their existing frame/pose channels.

Only the currently projected image is mandatory for Host preparation. Existing
active-time resource barriers, immutable identities, cache leases and resident
limits remain authoritative. Balanced loading may hint up to 16 upcoming frame
images, subject to its existing remaining-budget calculation; no Host timer or
second timeline advances a frame. Slow/missing/corrupt resources keep the previous
committed view and use the normal retry/cancel path. Restore prepares the exact
saved phase, without loading a monolithic atlas or restarting the sequence.

Sequence source schedules are immutable Core-owned data. Readonly projection
validates/seals that subtree once and reuses it; exact JSON footprint still counts
the entire data and capture/restore still parse complete detached snapshots.
Period/shape computation is cached only for deeply frozen schedules, never mutable
external arrays. Elapsed time, stage projection and the remaining snapshot stay
validated on each view. This avoids repeating source-shape work at display ticks.
