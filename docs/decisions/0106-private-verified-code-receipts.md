# ADR0106: Reuse one verified byte acquisition through code installation

The Web loader already clones, bounds, hashes and schema-decodes each acquired
module. Installation then repeats detachment/schema and protobuf encoding/hash.
After successful byte verification, retain a private receipt keyed by the exact
immutable normalized module object. Preserve raw function declarations before
normalization, so ABI checks still compare the original byte representation.

Installation accepts a receipt only for the same manifest identity, module ID,
encoded length and SHA. It still checks every raw ABI declaration, supported
opcode set, complete semantic links, static dependencies and publication points.
Ordinary public DTOs (even frozen ones) use the original full checking path.
Receipts cannot be serialized, reconstructed or imported through public exports.
Wrong IDs/digests, mutated clones and cross-manifest receipts reject atomically.

No wire ABI, snapshot provenance, budgets or story semantics change. Cancellation
keeps the existing lease ownership; a receipt alone installs no code and activates
no story. Code/data workers or a second narrative interpreter are not introduced.
