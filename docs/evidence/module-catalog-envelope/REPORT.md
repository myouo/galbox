# V3 component commitments (W1-16, ADR0115)

2026-11-04. A real external composition exceeded generic4M metadata during
compositionDigest. Tree-v1 v3 catalogs now use a separate16M/512000-node envelope
and independently bounded component hashes. Identity also commits the complete
release. Earlier unmarked v3 and v1/v2 retain their original commitments and4M
wire bounds. Snapshot/Profile/body/active-code/execution/graphics limits stay
unchanged. V3 builder catalogs pack512 assets; default v2 packing stays256.

`pnpm generate`, `pnpm check`,455 tests/92 files,2 real browser cases and
`pnpm test:consumer` pass. A public-factory synthetic catalog has2300 tiny images
with long legal paths and exceeds4M without growing any save. Protobuf roundtrip,
component commitment, one-module live closure and explicit legacy rejection pass.
The earlier unmarked v3 digest/identity is independently reconstructed and
accepted. No accessor/cycle/nonfinite checks were relaxed. Schema uses a pattern
constraint rather than adding a CommonJS unicode-length helper to standalone ESM.

Only the catalog has the larger envelope; real consumer content/fidelity remains
outside SDK and is tested separately. Raw logs and generated assets stay ignored.
