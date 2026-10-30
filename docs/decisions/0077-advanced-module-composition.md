# ADR0077: Bounded advanced module composition

Module manifests v1 retain their basic ADV restrictions. Version 2 composes
individually validated code modules and bounded resource catalogs; a complete
work no longer has to pass through one oversized classic Program first.
Classic Program, module body, manifest, snapshot and resident media budgets stay
unchanged. The composed internal projection is trusted only after each part has
passed its own schema, digest, ABI and semantic checks. It is never a new route
for unchecked external Program JSON.

V2 declares advanced metadata, immutable asset/fact chunks, sparse authored
prompt points, and static rich-prefix dependencies. Function declarations also
commit scene entry markers and audio source names. Dynamic calls still fetch
only their selected module. Restore bindings include frames, all task origins,
current/history/window rich or template origins and their static dependencies.
Canceled/invalid candidates never install code or activate a run.

The release Program digest for v2 commits the header, ordered code descriptors,
resource chunks, prompt points and explicit additive extras compatibility.
Scene/flow run identities bind to that immutable composition, not the set of
modules loaded so far. Extras progress may retain a declared previous signature
only when its catalog is an unchanged subset of the new catalog; live progress
is not replaced from an old slot. Classic saves require an explicit full state
migration and are preserved as prior slot revisions.

This first v2 support set covers standard expressions, rich text/windows/styles,
stage effects/motion/particles/composition, source audio/streaming, and extras.
Operations, video, timed interactions, script UI and flowchart modules remain
explicitly unsupported until their own closure cases are certified.
