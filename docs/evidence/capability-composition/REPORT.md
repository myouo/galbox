# Capability metadata composition (W1-12, ADR0111)

2026-11-03. Program and ModuleHeader accepted at most32 capability names while
the public supported registry contains43. Existing stage/text/audio/UI plus
timed interaction can legitimately require33. The two wire metadata bounds now
equal43; linker membership checks still reject unknown names. Field numbers,
old valid programs, execution/function/task/resource and storage budgets stay
unchanged. No declarations are discarded to make the composition fit.

`pnpm generate`, `pnpm check` and `pnpm exec vitest run` pass450 tests/90 files.
The new test ties both bounds to the public registry cardinality, round-trips
all43 wire names and runs a valid >32 declaration composition through public
builders, compiled modules and Core. Catalog-dependent flags keep their normal
semantic prerequisites; an initial fixture without UI data was correctly
rejected and corrected. Unknown names and44-entry metadata still reject.

Sequential browser app/harness builds followed by advanced-modules and
interactive-modules pass7 cases, including actual media, UI, RNG, timed cold
restore, failure/cancellation and isolated replay. `pnpm test:consumer` passes
strict independent TypeScript/headless/browser play/save/restore with the packed
SDK. Real work integration is kept in the independent project; no scripts,
dialogue, assets or raw evidence are added to this repository.
