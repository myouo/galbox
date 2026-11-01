# ADR0098: Bounded, atomic code preparation

Loading a missing module closure must not relink the growing full program once
per module. Acquire at most four code leases concurrently, copy and verify each
manifest/id/length/SHA before decoding, and release each lease exactly once. After
the entire requested dependency closure succeeds and cancellation is checked,
install the missing batch through the existing atomic `installAll` validator and
notify its owner once. A bad or cancelled batch installs none of its new bodies.
Already installed, verified bodies remain usable. No validation, registry,
composition, resource or snapshot budget is relaxed. This caches code, never a
mutable story state or unvalidated external input.
