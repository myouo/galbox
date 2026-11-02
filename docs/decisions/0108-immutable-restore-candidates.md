# ADR0108: Reuse validation of immutable restore candidates in one activation

The same module-bound candidate is validated in load, activation and Core install.
Private validateImmutableRestore performs the full existing validation, freezes
its owned output, then records an in-memory proof for that exact object/source/
registry/mode. Ordinary public validation/capture outputs remain owned mutable
DTOs without such proof. Clones, forged frozen data and other sources/modes do
not inherit it. Core may copy a proven immutable candidate without revalidating
the same tree; profile parsing and normal resume-effects behavior remain intact.

After persistence, the actual returned activation snapshot is schema-parsed and
compared structurally with the proven normalized candidate, using Object.is for
scalars so negative zero keeps its identity. Only an exact match gets
a fresh immutable proof; different data uses complete validation as before.
Durable head/profile/owner checks, transaction authority and candidate resource
barriers are unchanged. No proof is serialized or exposed through public entries.
