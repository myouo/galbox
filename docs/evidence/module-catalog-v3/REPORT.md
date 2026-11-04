# Versioned large module catalogs (W1-15, ADR0114)

2026-11-04. Explicit compositionVersion3 supports1024 declarations,256 code
modules and8 auxiliary512-asset catalogs. Defaultv2 retains256/64/4; v1/v2
wire conditionals still reject larger metadata. Version3 enters the composition
commitment; advanced ABI, packed declarations, receipts and scoped restore share
the existing implementation. Per-module128 functions/4MiB, per-function owned
footprint,64-module active snapshot/batch and all execution/resource/save bounds
stay unchanged. Builder/leaf packing also splits at128 functions, avoiding an
invalid oversized tiny-function module.

`pnpm generate`, `pnpm check`, `pnpm exec vitest run` pass453 tests/91 files.
New public-factory tests run301 functions in76 descriptors, load a late call,
save/cold restore a1–2 module closure, reject bad bytes without installing,
preserve old bounds and reject new limits/incorrect version commitments.
Initial negative fixtures expected a different error label; corrected to the
existing SCHEMA_MODULE contract. Schema conditionals include explicit types
required by strict Ajv; validation was not relaxed.

Sequential fixture/player/harness builds and large-modules/advanced-modules
browser tests pass2 cases. Real IndexedDB refresh and illustrated late save/load
retain a two-module closure; the v2 audio/rich-text/replay path still works.
`pnpm test:consumer` passes isolated packed strict TypeScript/headless/browser
play/save/restore/backup plus the v3 late-module test. Real consumer content stays
outside this repository. Full-platform and large-game content fidelity remain
separate from this catalog-capacity proof.
